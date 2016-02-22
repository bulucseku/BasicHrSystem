package com.sentrana.appshell.configuration

import java.io.{ File => JFile }
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.zip.{ ZipEntry, ZipOutputStream }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.io.Source
import scala.reflect.io.{ Directory, File, Path }
import scala.xml.parsing.ConstructingParser

import play.Play
import play.api.libs.Files
import play.api.libs.iteratee.Enumerator
import play.api.libs.json.Json

import com.sentrana.appshell.cache.CacheManager
import com.sentrana.appshell.domain.{ DataServices, DocumentObject }
import com.sentrana.appshell.metadata.{ prettyPrinter => xmlPrinter }
import com.sentrana.usermanagement.domain.document.User

class ConfigurationManager(configurationCacheKeyPrefix: String, currentUser: User, configurationDBManager: ConfigurationDBManager) {

  private val cacheManager = CacheManager
  private val cacheKey = configurationCacheKeyPrefix + currentUser.id

  def getConfigurationGroup(groupId: String): Option[ConfigurationGroup] = {
    val configGroupList = getConfigurationGroupsFromCache

    configGroupList.find(configGroup => configGroup.id == groupId) match {
      case None =>
        val result = configurationDBManager.getConfigurationGroup(groupId)
        cacheManager.setDataInCache(cacheKey, configGroupList ++ List(result))
        result
      case Some(group) => Some(group)
    }
  }

  def getAllConfigurationGroup(): Seq[ConfigurationGroup] = {
    val existingRepositories = configurationDBManager.getConfigurationGroupList
    val cacheRepositories = getConfigurationGroupsFromCache
    cacheRepositories ++ existingRepositories.filterNot(existingRepository => cacheRepositories.exists(_.id == existingRepository.id))
  }

  def getConfigurationGroupsWithoutConfig(): Seq[ConfigurationGroup] = {
    getAllConfigurationGroup.map(group => {
      new ConfigurationGroup(id = group.id, name = group.name, configurationType = group.configurationType, configurations = None)
    })
  }

  def saveSelectedConfiguration(groupId: String, configurationFile: ConfigurationFile): Boolean = {
    getConfigurationGroupsFromCache.find(configGroup => configGroup.id == groupId) match {
      case None => false
      case Some(group) => {
        group.configurations.get.find(configFile => configFile.id == configurationFile.id) match {
          case None =>
            group.configurations = Some(group.configurations.get ++ List(configurationFile))
          case Some(file) =>
            file.content = configurationFile.content

            val dateFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm a")
            val currentDateTime = dateFormat.format(Calendar.getInstance().getTime)

            file.createBy match {
              case None =>
                file.createBy = Some(currentUser.userName)
                file.createDate = Some(currentDateTime)
              case Some(data) =>
                file.updateBy = Some(currentUser.userName)
                file.updateDate = Some(currentDateTime)
            }

        }
        saveToCache(group)
        true
      }
    }
  }

  def saveAllConfiguration(groupId: String, configFiles: Seq[ConfigurationFile]): Boolean = {
    getConfigurationGroupsFromCache.find(configGroup => configGroup.id == groupId) match {
      case None => false
      case Some(group) => {
        group.configurations = Some(configFiles)

        group.configurations.get.map(
          configFile => {

            val dateFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm a")
            val currentDateTime = dateFormat.format(Calendar.getInstance().getTime)

            configFile.createBy match {
              case None =>
                configFile.createBy = Some(currentUser.userName)
                configFile.createDate = Some(currentDateTime)
              case Some(data) =>
                configFile.updateBy = Some(currentUser.userName)
                configFile.updateDate = Some(currentDateTime)
            }
          }
        )

        saveToCache(group)
        true
      }
    }
  }

  def saveConfigurationGroup(configurationGroup: ConfigurationGroup): Boolean = {
    saveToCache(configurationGroup)
    true
  }

  def copyConfigurationGroup(groupId: String, newId: String, newName: String): Option[ConfigurationGroup] = {
    val dataInCache = getConfigurationGroupsFromCache

    dataInCache.find(configGroup => configGroup.id == groupId) match {
      case None =>
        None
      case Some(group) => {
        val newGroup = new ConfigurationGroup(newId, newName, group.configurationType, group.configurations)
        cacheManager.setDataInCache(cacheKey, newGroup)
        Some(newGroup)
      }
    }
  }

  def deleteConfigurationGroup(groupId: String): Boolean = {
    val newConfigurationGroupList = getConfigurationGroupsFromCache.filter(configGroup => configGroup.id != groupId)
    configurationDBManager.removeConfigurationGroup(groupId)
    cacheManager.setDataInCache(cacheKey, newConfigurationGroupList)
    true
  }

  def downloadConfigurationGroup(groupId: String): Enumerator[Array[Byte]] = {
    val enumerator = Enumerator.outputStream { os =>
      val zip = new ZipOutputStream(os)

      getConfigurationGroupsFromCache.find(configGroup => configGroup.id == groupId) match {
        case None =>
          zip.putNextEntry(new ZipEntry(""))
          zip.write("".getBytes())
          zip.closeEntry()
        case Some(group) => {
          if (!group.configurations.isEmpty) {
            group.configurations.get.foreach {
              config =>
                zip.putNextEntry(new ZipEntry(config.name + ".xml"))
                zip.write(config.content.get.getBytes())
                zip.closeEntry()
            }
          }
        }
      }
      zip.close()
    }
    enumerator
  }

  def getContentFromFiles(files: scala.Seq[play.api.mvc.MultipartFormData.FilePart[Files.TemporaryFile]]): Seq[List[String]] = {
    val list = files.map(vf => List(vf.filename, Source.fromFile(vf.ref.file).mkString))
    list
  }

  def publishConfigurationGroup(groupId: String): Boolean = {
    getConfigurationGroupsFromCache.find(configGroup => configGroup.id == groupId) match {
      case None =>
        false
      case Some(group) => {
        configurationDBManager.saveConfigurationGroup(group)
        true
      }
    }
  }

  private def saveToCache(configurationGroup: ConfigurationGroup) = {
    val dataInCache = getConfigurationGroupsFromCache

    dataInCache.find(configGroup => configGroup.id == configurationGroup.id) match {
      case None =>
        cacheManager.setDataInCache(cacheKey, dataInCache ++ List(configurationGroup))
      case Some(group) => {
        // remove old data and update new data
        val newDataForCache = dataInCache.map {
          case ConfigurationGroup(configurationGroup.id, _, _, _) => new ConfigurationGroup(configurationGroup.id, configurationGroup.name, configurationGroup.configurationType, configurationGroup.configurations)
          case otherGroup                                         => otherGroup
        }
        cacheManager.setDataInCache(cacheKey, newDataForCache)
      }
    }
  }

  def getConfigFilesOfAGroup(groupId: String): Option[Seq[ConfigurationFile]] = {
    getConfigurationGroupsFromCache.find(configGroup => configGroup.id == groupId) match {
      case None        => None
      case Some(group) => group.configurations
    }
  }

  private def getConfigurationGroupsFromCache: Seq[ConfigurationGroup] = {
    cacheManager.getCachedData(cacheKey) match {
      case Some(data) =>
        data.asInstanceOf[Seq[ConfigurationGroup]]
      case None =>
        val allGroups = configurationDBManager.getConfigurationGroupList
        cacheManager.setDataInCache(cacheKey, allGroups)
        allGroups
    }
  }
}

object ConfigurationManager {
  private var _instance: ConfigurationManager = null

  def apply(configurationCacheKeyPrefix: String, currentUser: User, configManager: ConfigurationDBManager): ConfigurationManager = {
    _instance = _instance match {
      case null => new ConfigurationManager(configurationCacheKeyPrefix, currentUser, configManager)
      case _    => _instance
    }
    _instance
  }

  def apply(): ConfigurationManager = {
    _instance
  }
}

trait ConfigurationDBManager {
  def getConfigurationGroup(configurationGroupId: String): Option[ConfigurationGroup]
  def getConfigurationGroupList: List[ConfigurationGroup]
  def saveConfigurationGroup(configurationGroup: ConfigurationGroup): Unit
  def removeConfigurationGroup(configurationGroupId: String): Unit

  protected def formatConfigurationContent(configType: String, content: String): String = configType match {
    case "xml"  => formatXmlConfig(content)
    case "json" => formatJsonConfig(content)
    case _      => content
  }

  private def formatXmlConfig(content: String): String = {
    content.trim match {
      case "" =>
        content
      case _ =>
        try {
          val xmlContent = ConstructingParser.fromSource(Source.fromString(content), preserveWS = true).document.docElem
          xmlPrinter.format(xmlContent)
        }
        catch {
          case ex: Exception => s"${ex.getMessage} - Please remove this line before saving the XML!\n" + content
        }
    }
  }

  private def formatJsonConfig(content: String): String = {
    try {
      val jsonContent = Json.parse(content)
      Json.prettyPrint(jsonContent)
    }
    catch {
      case ex: Exception => s"${ex.getMessage} - Please remove this line before saving the JSON!\n" + content
    }
  }
}

case class ConfigurationDBManagerForMongo(dataServices: DataServices) extends ConfigurationDBManager {

  def getConfigurationGroup(configurationGroupId: String): Option[ConfigurationGroup] = {
    val configGroup = dataServices.getDocuments[ConfigurationGroup](Map("id" -> configurationGroupId)).headOption
    configGroup map formatConfigurationGroup
  }

  private def formatConfigurationGroup(configGroup: ConfigurationGroup): ConfigurationGroup = {
    val formattedConfigs = configGroup.configurations map { configs =>
      configs map { formatConfigurationFile(configGroup.configurationType, _) }
    }
    configGroup.copy(configurations = formattedConfigs)
  }

  private def formatConfigurationFile(configType: String, configFile: ConfigurationFile): ConfigurationFile = {
    val formattedContent = configFile.content map { formatConfigurationContent(configType, _) }
    configFile.copy(content = formattedContent)
  }

  def getConfigurationGroupList: List[ConfigurationGroup] = {
    dataServices.getDocuments[ConfigurationGroup](Map()).map(x => getConfigurationGroup(x.id).get)
  }

  def saveConfigurationGroup(configurationGroup: ConfigurationGroup): Unit = {
    //if data exists then update the document otherwise create new document
    getConfigurationGroup(configurationGroup.id) match {
      case None =>
        dataServices.saveDocument(configurationGroup)
      case Some(_) =>
        dataServices.updateDocument[ConfigurationGroup](Map("id" -> configurationGroup.id), configurationGroup)
    }
  }

  def removeConfigurationGroup(configurationGroupId: String): Unit = {
    dataServices.removeDocuments[ConfigurationGroup](Map("id" -> configurationGroupId))
  }
}

class ConfigurationDBManagerForFile extends ConfigurationDBManager {

  val fileSeparator = File.separator

  def getConfigurationGroup(configurationGroupId: String): Option[ConfigurationGroup] = {
    val configClientPath = getConfigFolder + fileSeparator + configurationGroupId + fileSeparator
    val fileNames = Directory(configClientPath).list filter { _.name.endsWith(".xml") }
    val configFiles = fileNames map { path =>
      val fileContent = Source.fromFile(path.toAbsolute.toString()).mkString
      ConfigurationFile(
        id         = path.name,
        name       = path.name,
        createBy   = Some(""),
        createDate = Some(""),
        updateBy   = Some(""),
        updateDate = Some(""),
        content    = Some(formatConfigurationContent("xml", fileContent))
      )
    }

    Some(ConfigurationGroup(
      id                = configurationGroupId,
      name              = configurationGroupId,
      configurationType = "xml",
      configurations    = Some(configFiles.toSeq)
    ))
  }

  def getConfigurationGroupList: List[ConfigurationGroup] = {
    val configRootFolder = new JFile(getConfigFolder)
    val configurationGroups = configRootFolder.list().filter(isConfigDirectory).
      map(cln => getConfigurationGroup(cln).get).toList
    configurationGroups
  }

  private def isConfigDirectory(dirName: String): Boolean = {
    new JFile(getConfigFolder + fileSeparator + dirName).isDirectory
  }

  private def getConfigFolder = {
    Play.application.path.getAbsolutePath + fileSeparator + "conf"
  }

  def saveConfigurationGroup(configurationGroup: ConfigurationGroup): Unit = {
    configurationGroup.configurations.get.foreach(file => {
      val fileName = getConfigFolder + fileSeparator + configurationGroup.id + fileSeparator + file.name
      File(fileName).writeAll(file.content.get)
    })
  }

  def removeConfigurationGroup(configurationGroupId: String): Unit = {
    val rootFolderPath = getConfigFolder + fileSeparator + configurationGroupId
    Directory(Path.string2path(rootFolderPath)).deleteRecursively()
    ()
  }
}

case class ConfigurationGroup(
  id:                 String,
  name:               String,
  configurationType:  String,
  var configurations: Option[Seq[ConfigurationFile]]
) extends DocumentObject

object ConfigurationGroup extends DocumentObject {
  override def source = "configurationGroup"
}

case class ConfigurationFile(
  id:             String,
  name:           String,
  var createBy:   Option[String],
  var createDate: Option[String],
  var updateBy:   Option[String],
  var updateDate: Option[String],
  var content:    Option[String]
)
