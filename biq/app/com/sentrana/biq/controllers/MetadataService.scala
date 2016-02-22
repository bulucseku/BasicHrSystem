package com.sentrana.biq.controllers

import com.sentrana.biq.Global
import com.sentrana.biq.core.physical.Sql.MySQL.MySqlDataWarehouse
import com.sentrana.biq.core.physical.Sql.PostgreSQL.PostgreSQLDataWarehouse

import scala.util.{ Failure, Success, Try }

import play.api.i18n.Messages
import play.api.libs.iteratee.Enumerator
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.{ Action, AnyContent }

import org.json4s.native.Serialization.{ read, write }

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.configuration._
import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.appshell.metadata._
import com.sentrana.biq.core.{ Report, Repository }
import com.sentrana.biq.datacontract._
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.biq.exceptions.InvalidConfigurationFileFormatException
import com.sentrana.biq.metadata.{ MetadataCache, MetadataRepository }
import com.sentrana.usermanagement.authentication.{ UserSession, SecurityManager }
import com.sentrana.usermanagement.controllers.{ Authentication, Authorization }
import com.sentrana.usermanagement.datacontract.EnumApplicationRoles.BIQ_ADMIN
import com.sentrana.usermanagement.datacontract.{ ResponseMessage, ResponseMessageCode }

/**
 * Created by william.hogben on 2/2/2015.
 */
object MetadataService extends MetadataService with PlayLoggerComponent

trait MetadataService extends BaseController with Authentication with Authorization with RepoAccess {
  this: LoggerComponent =>

  val REPO_CONFIG_CACHE = "BIQRepositoryConfiguration"
  val configurationType: String = play.api.Play.current.configuration.getString("biq.configurationManager.type").get
  val configurationFileSizeLimit = play.api.Play.current.configuration.getInt("biq.configurationManager.fileSizeLimit").getOrElse(1) * 1024 * 1024

  lazy val configurationDBManager: ConfigurationDBManager = {
    configurationType match {
      case "file" => new ConfigurationDBManagerForFile
      case _      => new ConfigurationDBManagerForMongo(BIQDataServices())
    }
  }

  def getXmlRepositoryObjects(repoId: String): Action[AnyContent] = RepoAction(repoId) { implicit request =>
    val userSession = request.userSession
    val repo = request.repository
    Ok(write(BIQServiceUtil.getCurrentUserMetadataObjectRepository(repo, userSession)))
  }

  def getAttributeForm(formId: String): Action[AnyContent] = RepoAction { implicit request =>
    val userSession = request.userSession
    logger.debug("Loading attribute form with id: " + formId)
    val repo = request.repository
    formId.split("_") match {
      // Handle composite attributes
      case Array(id, "XFRM") =>
        val compAttribute = repo.metaData.getCompositeAttribute(id).get
        // load key attribute form elements
        val keyForm = compAttribute.parent.forms.find(_.id == compAttribute.keyForm.getOrElse(""))
        keyForm.foreach(repo.loadAttributeElements)
        compAttribute.generateGroups()
        Ok(write(BIQServiceUtil.convertCompositeAttributeToMetadataAttribute(compAttribute).forms.head))
      case _ =>
        val form = repo.metaData.getAttributeForm(formId).get
        repo.loadAttributeElements(form)
        Ok(write(BIQServiceUtil.convertAttributeFormToMetadataAttributeForm(form, true, userSession)))
    }
  }

  def readConfigFiles(repoId: String): Action[AnyContent] = RoleAction(BIQ_ADMIN) { implicit request =>
    val userSession = request.userSession
    BIQServiceUtil.checkRepositoryAccess(userSession.user, repoId)
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    val repoConfig = configManager.getConfigFilesOfAGroup(repoId)
    Ok(write(repoConfig))
  }

  def publishConfigChange: Action[JsValue] = RoleAction(BIQ_ADMIN)(parse.json(maxLength = configurationFileSizeLimit)) { implicit request =>
    val userSession = request.userSession
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    val repository = read[ConfigurationGroup](request.body.toString)
    BIQServiceUtil.checkRepositoryAccess(userSession.user, repository.id)
    // validate configurations
    val configFiles = configManager.getConfigFilesOfAGroup(repository.id)
    configFiles.foreach(_.foreach(file => validateConfigurationFile(file, repository.id)))

    configManager.publishConfigurationGroup(repository.id)
    // Clear metadata cache for repository
    if (MetadataCache.useCache)
      MetadataCache().removeFromCache(repository.id)

    // Refresh application configuration
    MetadataRepository().loadAllMetadata()
    // Refresh connection pool
    Global.refreshConnectionPool(repository.id)
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, Messages("success.allConfigFileUpdated"))))
  }

  def saveConfigFile: Action[JsValue] = RoleAction(BIQ_ADMIN)(parse.json(maxLength = configurationFileSizeLimit)) { implicit request =>
    val userSession = request.userSession
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    val repository = read[ConfigurationGroup](request.body.toString)
    // Validate repository access
    if (!BIQServiceUtil.hasRepositoryAccess(userSession.user, repository.id)) {
      BIQServiceUtil.grantRepositoryAccessToOrganization(userSession.user, repository.id)
    }
    configManager.saveSelectedConfiguration(repository.id, repository.configurations.get.head)

    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, Messages("success.configFileSaved"))))
  }

  def saveAllConfigFiles: Action[JsValue] = RoleAction(BIQ_ADMIN)(parse.json(maxLength = configurationFileSizeLimit)) { implicit request =>
    val userSession = request.userSession
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    val repository = read[ConfigurationGroup](request.body.toString)
    // Validate repository access
    if (!BIQServiceUtil.hasRepositoryAccess(userSession.user, repository.id)) {
      BIQServiceUtil.grantRepositoryAccessToOrganization(userSession.user, repository.id)
    }
    configManager.saveAllConfiguration(repository.id, repository.configurations.get)
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, Messages("success.allConfigFileSaved"))))
  }

  private def validateConfigurationFile(configFile: ConfigurationFile, repoId: String): Unit = {
    val attempt: Try[Any] = configFile.id.toLowerCase match {
      case "repository" =>
        parseConfig[Repository](configFile.content.getOrElse("")).flatMap {
          repository =>
            /**
             * Put some validation as below
             * 1. Spaces in the ID field of a Metric Group
             * 2. Duplicate metrics that appear in multiple Metric Groups
             */
            Try {
              val groupsWithInvalidId = repository.metaData.metricGroups.filter(mg => mg.id.contains(" "))

              if (groupsWithInvalidId.nonEmpty) {
                throw new Throwable(s"Spaces in the ID field of a Metric Group is not allowed.")
              }

              repository.metaData.metrics.foreach({
                metric =>
                  val metricsInGroup = repository.metaData.metricGroups.flatMap(mg => mg.metrics.filter(m => m.id == metric.id))

                  if (metricsInGroup.size > 1) {
                    throw new Throwable(s"Metric Id must not be use in more than one Metric Group")
                  }
              })
            }
        }
      // datafilter and metric dimension mapping allow empty values
      case "datafilter" =>
        configFile.content.collect {
          case content if content.nonEmpty =>
            val xmlNode = loadXMLString(content)
            xmlNode.map { node => parseSeq(node)(MetadataRepository().parseDataFilterMap) }
        }.getOrElse(Success())
      case "metricdimensionmappings" =>
        configFile.content.collect {
          case content if content.nonEmpty =>
            val xmlNode = loadXMLString(content)
            xmlNode.map { node => parseSeq(node \\ "metricGroup")(MetricDimensionMappingInfo.fromXml(repoId)) }
        }.getOrElse(Success())
    }

    attempt.failed foreach { ex: Throwable =>
      throw new InvalidConfigurationFileFormatException(configFile.id, ex)
    }
  }

  // TODO: Find a way to combine RepoAction and RoleAction here
  def clearMetadataCache(repoId: String) = RepoAction(repoId) { implicit request =>
    SecurityManager.requireRole(request.userSession.user, BIQ_ADMIN)
    if (MetadataCache.useCache) {
      MetadataCache().removeFromCache(repoId)
      Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, Messages("success.removedFromCache"))))
    }
    else Ok("No metadata cache is in use.")
  }

  def saveRepository: Action[JsValue] = RoleAction(BIQ_ADMIN)(parse.json(maxLength = configurationFileSizeLimit)) { implicit request =>
    val userSession = request.userSession
    val repository = read[ConfigurationGroup](request.body.toString)
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    configManager.saveConfigurationGroup(repository)

    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, Messages("success.repositorySaved"))))
  }

  def deleteRepository: Action[JsValue] = RoleAction(BIQ_ADMIN)(parse.json(maxLength = configurationFileSizeLimit)) { implicit request =>
    val userSession = request.userSession
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    val repository = read[ConfigurationGroup](request.body.toString)
    // Validate repository access
    BIQServiceUtil.checkRepositoryAccess(userSession.user, repository.id)
    configManager.deleteConfigurationGroup(repository.id)
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, Messages("success.repositoryDeleted"))))
  }

  def uploadConfigFiles = RoleAction(BIQ_ADMIN)(parse.multipartFormData) { request =>
    val userSession = request.userSession
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    val list = configManager.getContentFromFiles(request.body.files)
    Ok(Json.toJson(list))
  }

  def downloadConfigFiles(repositoryId: String) = RoleAction(BIQ_ADMIN) { implicit request =>
    val userSession = request.userSession
    // Validate repository access
    BIQServiceUtil.checkRepositoryAccess(userSession.user, repositoryId)
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    val enumerator = configManager.downloadConfigurationGroup(repositoryId)

    Ok.chunked(enumerator >>> Enumerator.eof).withHeaders(
      "Content-Type" -> "application/zip",
      "Content-Disposition" -> "attachment; filename=".concat(repositoryId + ".zip")
    )
  }

  /**
   * This function gives client names with configurations
   * @return A list of client name list with configurations.
   */
  def getRepoList = AuthAction { implicit request =>
    val userSession = request.userSession
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    val repositories = configManager.getAllConfigurationGroup()
    val permitted = BIQServiceUtil.getPermittedRepositoryIds(userSession.user.id)

    Ok(write(repositories.filter(repo => permitted.contains(repo.id))))
  }

  /**
   * This function gives a single repository
   * @return A single repository
   */
  def getRepo(repositoryId: String) = AuthAction { implicit request =>
    val repository = getRepository(repositoryId, request.userSession)
    Ok(write(repository))
  }

  /**
   * This function gives client names
   * @return A list of client name list.
   */
  def getRepoNameList = AuthAction { implicit request =>
    val userSession = request.userSession
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    val repositories = configManager.getConfigurationGroupsWithoutConfig()
    val permitted = BIQServiceUtil.getPermittedRepositoryIds(userSession.user.id)

    Ok(write(repositories.filter(repo => permitted.contains(repo.id))))
  }

  def getRepositoryMetadata(repoId: String): Action[AnyContent] = RepoAction(repoId) { implicit request =>
    //find the count of each table
    request.repository.dataWarehouse.analyze()

    val tables = request.repository.dataWarehouse match {
      case repo: PostgreSQLDataWarehouse =>
        request.repository.dataWarehouse.asInstanceOf[PostgreSQLDataWarehouse].tables
      case repo: MySqlDataWarehouse =>
        request.repository.dataWarehouse.asInstanceOf[MySqlDataWarehouse].tables
    }

    val tableMetadata = tables.map(table =>
      RepositoryTableMetadata(table.id, table.size, "")).toList

    val repoMetadata = getRepository(repoId, request.userSession) match {
      case None =>
        throw new Throwable(s"Repository not found.")
      case Some(repo) =>
        repo.configurations.map(_.filter(configFile => configFile.id.toLowerCase() == "repository").map(
          configFile =>
            RepositoryMetadata(repo.name, configFile.createDate, configFile.updateDate, None, tableMetadata)
        ))
    }

    Ok(write(repoMetadata))
  }

  private def getRepository(repositoryId: String, userSession: UserSession): Option[ConfigurationGroup] = {
    val configManager = ConfigurationManager(REPO_CONFIG_CACHE, userSession.user, configurationDBManager)
    configManager.getConfigurationGroup(repositoryId)
  }
}

case class CacheEntry(report: Report, dataset: DatasetResult)

case class RepositoryMetadata(
  name:           String,
  createDate:     Option[String],
  lastUpdateDate: Option[String],
  nextUpdateDate: Option[String],
  tables:         Seq[RepositoryTableMetadata]
)

case class RepositoryTableMetadata(name: String, recordCount: Int, etlErrorStatus: String)
