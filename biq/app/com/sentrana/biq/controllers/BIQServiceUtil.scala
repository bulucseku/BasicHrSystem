package com.sentrana.biq.controllers

import scala.collection.mutable.{ Map => MutableMap }

import com.sentrana.appshell.data.{ DataType, FormulaType }
import com.sentrana.appshell.logging.{ LoggerComponent, Logging, PlayLoggerComponent }
import com.sentrana.biq.core.conceptual._
import com.sentrana.biq.core.physical._
import com.sentrana.biq.core.{ AccessibleFactory, Repository }
import com.sentrana.biq.datacontract._
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.biq.exceptions.{ SavedFilterGroupIDNotFoundException, RepositoryIDNotFoundException, UnauthorizedRepositoryAccessException }
import com.sentrana.biq.metadata.MetadataRepository
import com.sentrana.usermanagement.authentication.{ Guid, UserSession }
import com.sentrana.usermanagement.domain.Accessible
import com.sentrana.usermanagement.domain.document.{ DataFilterElementValues, UMDataServices, User }

import scala.util.matching.Regex

/**
 * Created by william.hogben on 2/3/2015.
 */
object BIQServiceUtil extends BIQServiceUtil with PlayLoggerComponent

trait BIQServiceUtil extends Logging {
  this: LoggerComponent =>

  //lazy val dataFilterMappings = MetadataRepository().loadAllDataFilterMappings()
  lazy val mongoDataServices = BIQDataServices()

  var reportBookletSharingInfo: MutableMap[String, List[SharingInfo]] = MutableMap()
  def cacheSharingInfo(userId: String, sharingInfo: SharingInfo): Unit = {
    var sharingInfoList: List[SharingInfo] = List[SharingInfo]()

    if (reportBookletSharingInfo.contains(userId)) {
      sharingInfoList = reportBookletSharingInfo(userId).filterNot(
        el => el.objectId == sharingInfo.objectId && el.objectType == sharingInfo.objectType
      )
    }

    sharingInfoList :+= sharingInfo
    reportBookletSharingInfo(userId) = sharingInfoList
  }

  /**
   * Get the metadata repository for the current user.
   *
   * @param repo        The repository to convert to a metadata object repository
   * @param userSession The current user session Info
   * @return
   */
  def getCurrentUserMetadataObjectRepository(
    repo:        Repository,
    userSession: UserSession
  ): MetadataObjectRepository = {
    MetadataObjectRepository(
      name                         = repo.name,
      oid                          = repo.id,
      showDataDictionaryDefinition = repo.showDataDictionaryDefinition,
      supportedFeatures            = MetadataObjectRepositorySupportedFeatures(totals = true),
      dimensions                   = repo.metaData.dimensions.filter(_.allAttributes.nonEmpty).map {
        dim => convertDimensionToMetadataDimension(dim, getAttributeForms(userSession))
      }.toSeq,
      metricGroups                 = repo.metaData.metricGroups.map { convertMetricGroupToMetadataMetricGroups }.toSeq,
      derivedColumns               = getCurrentUserDerivedColumnInfo(repo, userSession),
      savedFilterGroups            = getCurrentUserSavedFilterGroupInfo(repo, userSession),
      datafilters                  = getCurrentUserDataFilterInfo(userSession, repo),
      totalReport                  = 0,
      totalBooklet                 = 0,
      aggregateFunctions           = Metadata.AggregateFunctions.values.map(af => AggregationOperation(af.id, af.name)).toSeq,
      metricDimensionMapping       = MetadataRepository().loadRepositoryMetricsDimensionMappings(repo.id)
    )
  }

  private def getCurrentUserSavedFilterGroupInfo(
    repository:  Repository,
    userSession: UserSession
  ): Seq[SavedFilterGroupInfo] = {
    val filterGroups = getSavedFilterGroupsFromRepository(repository.id)
    filterGroups.filter(_.createUserId == userSession.user.id)
      .map(convertSavedFilterGroupToSavedFilterGroupInfo).toSeq
  }

  def getSavedFilterGroupsFromRepository(repositoryId: String): Traversable[SavedFilterGroup] = {
    logger.debug("Loading saved filter groups for repository: " + repositoryId)
    SavedFilterGroupCache.retrieveFromCache(repositoryId) match {
      case None =>
        logger.debug("Querying database for saved filter groups.")
        val filterGroups = mongoDataServices.getDocuments[SavedFilterGroup](
          Map("dataSource" -> repositoryId)
        )
        val fgCache = SavedFilterGroupCacheEntry(repositoryId, filterGroups)
        SavedFilterGroupCache.saveInCache(fgCache)
        fgCache.savedFilterGroups
      case Some(savedFilterGroupCache) =>
        logger.debug("Using cached saved filter groups.")
        savedFilterGroupCache.savedFilterGroups
    }
  }

  def getSavedFilterGroup(repositoryId: String, filterGroupId: String): Option[SavedFilterGroup] = {
    getSavedFilterGroupsFromRepository(repositoryId).filter(_.id == Some(filterGroupId)).headOption
  }

  /**
   * Helper function to filter by user category names, and only display
   * attributeElements if there are less than the limit and no constraits
   * or filters are active
   *
   * @param userSession The current User Session
   * @param attribute   The Attribute to return atribute forms for
   * @return
   */
  private def getAttributeForms(
    userSession: UserSession
  )(attribute: Attribute): Seq[MetadataAttributeForm] = {
    val forms = attribute.visibleForms
    val displayedElementLimit = 1000
    val elementCount = attribute.visibleForms.map(_.allElements.size).max
    forms.map { form =>
      convertAttributeFormToMetadataAttributeForm(form, elementCount <= displayedElementLimit, userSession)
    }.toSeq
  }

  def convertAttributeFormToMetadataAttributeForm(
    form:            AttributeForm,
    displayElements: Boolean,
    userSession:     UserSession
  ): MetadataAttributeForm = {
    val categoryNames = if (userSession.accessibles.isEmpty)
      List()
    else
      userSession.accessibles.collect { case pc: ProductCategory => pc.name }
    val rawElements = form.allElements.filter(el => el.name != "NULL" && el.name != "")
    val elements = if (form.parent.id == "Category")
      rawElements.filter(categoryNames contains _.name)
    else rawElements
    // Return no form elements if there are too many or the form has constraints
    val formElements = if (!displayElements || form.constraints.nonEmpty || !form.parent.hasFilter || form.parentForm.nonEmpty)
      None
    else
      Some(elements.map(e => {
        MetadataObject(
          oid      = if (form.parent.filterControl == "Tree") s"(${form.id}+)${e.id}" else e.id,
          name     = e.name,
          desc     = None,
          dataType = None
        )
      }).toSeq)
    MetadataAttributeForm(
      name     = form.shortName,
      oid      = form.id,
      desc     = form.description.getOrElse(""),
      elements = formElements,
      dataType = Some(form.dataType.toString)
    )
  }

  def getCurrentUserDataFilterInfo(
    userSession: UserSession,
    repository:  Repository
  ): Seq[DataFilterInfo] = {
    val filterMappings = MetadataRepository().loadRepositoryDataFilterMappings(repository.id)
    val filterInfos = filterMappings.map {
      case (dataFilterId: String, attrFormId: String) =>
        val DataFilterElementValues(inValues, outValues) = UMDataServices.getUserFilterElements(userSession.user.id, dataFilterId)
        val attributeForm = repository.metaData.getAttributeForm(attrFormId)
        if (attributeForm.nonEmpty && inValues.nonEmpty)
          Some(DataFilterInfo(dataFilterId, attrFormId, repository.id, "IN", inValues.toSeq))
        else if (attributeForm.nonEmpty && outValues.nonEmpty)
          Some(DataFilterInfo(dataFilterId, attrFormId, repository.id, "NOT IN", outValues.toSeq))
        else None
    }
    filterInfos.filter(_.nonEmpty).map(_.get).toSeq
  }

  /**
   * Returns only the derived columns that were created by the current user
   *
   * @param repository  Repository  The repository to get derived columns from
   * @param userSession UserSession The Session info to retrieve the current userId
   * @return
   */
  private def getCurrentUserDerivedColumnInfo(
    repository:  Repository,
    userSession: UserSession
  ): Seq[DerivedColumnInfo] = {
    val derivedColumns = BIQDataServices.getUserDerivedColumns(repository.id, userSession.user.id)
    derivedColumns.map(convertDerivedColumnToDerivedColumnInfo).toSeq
  }

  def convertDerivedColumnToDerivedColumnInfo(dc: DerivedColumn): DerivedColumnInfo = {
    DerivedColumnInfo(
      id          = dc.id,
      oid         = Some(s"f(${dc.id.get})"),
      name        = dc.derivedColumnName,
      dataSource  = dc.dataSource,
      formula     = dc.expression,
      outputType  = dc.dataType,
      precision   = dc.precision.toString,
      formulaType = dc.formulaType
    )
  }

  def convertDimensionToMetadataDimension(
    dimension:         Dimension,
    getAttributeForms: (Attribute) => Seq[MetadataAttributeForm]
  ): MetadataDimension = {
    val attributes = dimension.allAttributes
      .filter(_.visibleForms.nonEmpty)
      .map(convertAttributeToMetadataAttribute(_, getAttributeForms))
      .toSeq
    val surrogateGroupings = dimension.allAttributes
      .flatMap(_.surrogateGroupings)
      .map(convertCompositeAttributeToMetadataAttribute)
    MetadataDimension(
      name       = dimension.name,
      attributes = attributes ++ surrogateGroupings
    )
  }

  def convertAttributeToMetadataAttribute(
    attribute:         Attribute,
    getAttributeForms: (Attribute) => Seq[MetadataAttributeForm]
  ): MetadataAttribute = {
    MetadataAttribute(
      name          = attribute.name,
      oid           = attribute.id + "_ATTR",
      desc          = attribute.description.getOrElse(""),
      filterName    = attribute.filterName.getOrElse(attribute.name),
      required      = attribute.isRequired,
      segmentable   = true,
      defaultFormId = attribute.visibleForms.find(_.isDefaultForm).get.id,
      forms         = getAttributeForms(attribute),
      filterControl = attribute.filterControl,
      dataType      = None
    )
  }

  def convertCompositeAttributeToMetadataAttribute(compAttr: CompositeAttribute): MetadataAttribute = {
    MetadataAttribute(
      name          = compAttr.name,
      oid           = compAttr.id + "_ATTR",
      desc          = compAttr.description.getOrElse(""),
      filterName    = compAttr.filterName.getOrElse(""),
      required      = false,
      segmentable   = false,
      defaultFormId = compAttr.id + "_XFRM",
      forms         = Seq(
        MetadataAttributeForm(
          name     = compAttr.name,
          oid      = compAttr.id + "_XFRM",
          desc     = compAttr.description.getOrElse(""),
          elements = Some(compAttr.compositeAttributeElements.map{ e =>
            MetadataObject(
              oid      = e.id,
              name     = e.name,
              desc     = None,
              dataType = None
            )
          }.toSeq),
          dataType = None
        )
      ),
      filterControl = compAttr.parent.filterControl,
      dataType      = None
    )
  }

  def convertDerivedColumnInfoToDerivedColumn(colInfo: DerivedColumnInfo, userSession: UserSession): DerivedColumn = {
    DerivedColumn(
      id                   = colInfo.id,
      dataSource           = colInfo.dataSource,
      derivedColumnName    = colInfo.name,
      derivedColumnVersion = 1,
      createUserId         = userSession.user.id,
      lastModUserId        = userSession.user.id,
      expression           = colInfo.formula,
      precision            = colInfo.precision.toInt,
      dataType             = colInfo.outputType,
      formulaType          = colInfo.formulaType
    )
  }

  def convertSavedFilterGroupInfoToSavedFilterGroup(filterGroupInfo: SavedFilterGroupInfo, userSession: UserSession): SavedFilterGroup = {
    SavedFilterGroup(
      id            = filterGroupInfo.id,
      dataSource    = filterGroupInfo.dataSource,
      name          = filterGroupInfo.name,
      createUserId  = userSession.user.id,
      lastModUserId = userSession.user.id,
      filters       = filterGroupInfo.filterIds.map(id => SavedFilter(id))
    )
  }

  def convertSavedFilterGroupToSavedFilterGroupInfo(filterGroup: SavedFilterGroup): SavedFilterGroupInfo = {
    SavedFilterGroupInfo(
      id         = filterGroup.id,
      name       = filterGroup.name,
      dataSource = filterGroup.dataSource,
      filterIds  = filterGroup.filters.map(f => f.filterId).toSeq
    )
  }

  def convertMetricGroupToMetadataMetricGroups(metricGroup: MetricGroup): MetadataMetricGroups = {
    MetadataMetricGroups(
      id          = metricGroup.id,
      name        = metricGroup.name,
      description = metricGroup.description.getOrElse(""),
      metrics     = metricGroup.metrics.map(convertMetricToMetadataMetric).toSeq.sortBy(_.name)
    )
  }

  def convertMetricToMetadataMetric(metric: Metric): MetadataMetric = {
    val op = metric match {
      case m: SimpleMetric =>
        (if (m.operation == null) AggregationOperation.Sum else m.operation).toString
      case _ => ""
    }
    MetadataMetric(
      name      = metric.name,
      oid       = metric.id,
      desc      = metric.description.getOrElse(""),
      dataType  = metric.dataType.toString,
      operation = op
    )
  }

  def generateHID(value: String): String = {
    "#hid_" + """[^a-zA-Z0-9]""".r.replaceAllIn(value, "")
  }

  def getCacheKey(
    templateUnits: String,
    filterUnits:   String,
    totalsOn:      Boolean,
    sort:          String,
    userSession:   UserSession,
    repository:    Repository
  ): String = {
    val templateSignature = templateUnits.split(" ").mkString(":")
    val filterSignature = filterUnits.split(" ").mkString(":")
    val filters = getImplicitFilters(userSession, repository)
    val totals = if (totalsOn) "T" else "F"
    val dataFilterSig = filters.map(item => item.attributeForm.id + item.operator + item.value).mkString("")
    s"${repository.id}|$templateSignature|$filterSignature|$totals|$sort|$dataFilterSig"
  }

  def getImplicitFilters(userSession: UserSession, repository: Repository): Traversable[DataFilter] = {
    val repoId = repository.id
    val sessionKey = s"DataFilters_$repoId"
    userSession.sessionData.get(sessionKey) match {
      case Some(value: Traversable[DataFilter]) => value
      case _ =>
        val dfaf = MetadataRepository().loadRepositoryDataFilterMappings(repoId)
        dfaf.map {
          case (dataFilterId, attributeFormId) =>
            val dataFilterOption = UMDataServices.getUserFilterInstanceElement(
              userSession.user, dataFilterId, parenthesize = false
            )
            dataFilterOption.flatMap { dataFilter =>
              repository.metaData.getAttributeForm(attributeFormId).map { attrForm =>
                // lets load attribute elements
                if (attrForm.allElements.isEmpty) {
                  repository.dataWarehouse.queryForElements(attrForm)
                }
                DataFilter(
                  dataFilter.dataFilterId,
                  dataFilter.operator,
                  dataFilter.value,
                  attrForm.allElements.head,
                  attrForm
                )
              }
            }
        }.collect { case Some(value) => value }
    }
  }

  def getRepository(user: User, repoID: String): Repository = {
    logger.debug(s"Getting repository with id: $repoID")
    checkRepositoryAccess(user, repoID)
    val repo = MetadataRepository().metadata.getOrElse(repoID, {
      throw new RepositoryIDNotFoundException(repoID)
    })
    logger.debug(s"Repository found for user: ${user.id}")
    repo.metaData.derivedMetrics = getDerivedMetricsForRepository(repo)
    repo
  }

  def checkRepositoryAccess(user: User, repoId: String) = {
    if (!hasRepositoryAccess(user, repoId)) {
      logger.debug("User is not permitted to access repository: " + repoId)
      throw new UnauthorizedRepositoryAccessException(user.userName, repoId)
    }
  }

  def hasRepositoryAccess(user: User, repoId: String): Boolean = {
    val permittedIds = getPermittedRepositoryIds(user.id)
    permittedIds.contains(repoId)
  }

  def getDerivedColumnExpressionPattern(dc: DerivedColumn) = {
    if (dc.formulaType == FormulaType.DM.toString) {
      s"${dc.derivedColumnName}:(${dc.expression}),dataType:${dc.dataType},precision:${dc.precision},formulaType:DM"
    }
    else {
      s"${dc.derivedColumnName}:${dc.expression},dataType:${dc.dataType},precision:${dc.precision},formulaType:CM"
    }
  }

  def getPermittedRepositoryIds(userId: String) = {
    UMDataServices.getUserFilterElements(userId, "REPOSITORY_KEY").allowed
  }

  def grantRepositoryAccessToUser(user: User, repoId: String) = {
    UMDataServices.updateUserFilterElements(user.id, repoId, "REPOSITORY_KEY")
  }

  def grantRepositoryAccessToOrganization(user: User, repoId: String) = {
    UMDataServices.updateOrganizationFilterElements(user.organization.id, repoId, "REPOSITORY_KEY")
  }

  def getDerivedMetricsForRepository(repository: Repository): Traversable[DerivedMetric] = {
    logger.debug("Getting Derived metrics for repository: " + repository.id)
    val derivedColumns = BIQDataServices.getRepositoryDerivedColumns(repository.id)
    logger.debug("Found " + derivedColumns.size + " derived columns for repository.")
    derivedColumns.seq.map { dc =>
      // load the attribute forms from derived metrics
      repository.loadAttributeElementsFromString(dc.expression)
      convertDerivedColumnToDerivedMetric(dc)
    }
  }

  def convertDerivedColumnToDerivedMetric(dc: DerivedColumn): DerivedMetric = {
    DerivedMetric(
      s"f(${dc.id.get})",
      dc.derivedColumnName,
      Some(dc.expression),
      DataType.withName(dc.dataType),
      dc.precision,
      FormulaType.withName(dc.formulaType),
      None
    )
  }

  def expandColumnsForSharedReport(reportInfo: ReportInfo): ReportInfo = {
    expandDerivedColumns(expandSavedFilterGroup(reportInfo))
  }

  def expandDerivedColumns(reportInfo: ReportInfo): ReportInfo = {
    val definition = reportInfo.definition
    val formulaRegex = new Regex("""^f\(([0-9]*)\)$""", "id")
    val templateUnits = definition.template.split("\\|").map { tu =>
      formulaRegex.findFirstMatchIn(tu).map { id =>
        BIQServiceUtil.getDerivedColumnExpressionPattern(
          BIQDataServices.getDerivedColumn(id.group("id"))
        )
      }.getOrElse(tu)
    }.mkString("|")

    reportInfo.copy(definition = definition.copy(template = templateUnits))
  }

  def expandSavedFilterGroup(reportInfo: ReportInfo): ReportInfo = {
    val filters = reportInfo.definition.filter.getOrElse("").split("\\|").map { f =>
      if (f.contains("type@GroupedFilter")) {
        val filterParts = f.split(",")
        val keyValuePairs = scala.collection.mutable.Map[String, String]()
        filterParts.map { p =>
          val keyValue = p.split("@")
          keyValuePairs(keyValue(0).trim()) = keyValue(1)
        }
        val value = keyValuePairs.getOrElse("value", "")
        if (keyValuePairs.getOrElse("isSaved", "") == "false") {
          f
        }
        else {
          getSavedFilterGroup(reportInfo.dataSource.getOrElse(""), value) match {
            case None => throw new SavedFilterGroupIDNotFoundException(value)
            case Some(filterGroup) =>
              s"type@GroupedFilter, name@${filterGroup.name}, isSaved@false, value@${filterGroup.filters.map(f => f.filterId).mkString("&")}"
          }
        }
      }
      else {
        f
      }
    }.mkString("|")

    reportInfo.copy(definition = reportInfo.definition.copy(filter = Some(filters)))
  }

  def validateCategoryAccess(userSession: UserSession, categoryNames: Traversable[String]) = {
    logger.debug("Validating category access")
    if (categoryNames.size == 0)
      throw new Exception("Category not specified")

    val permittedCategoryNames = userSession.accessibles.collect {
      case ac: ProductCategory => ac.name
    }

    if (categoryNames.toList.diff(permittedCategoryNames).nonEmpty)
      throw new Exception("Cannot access specified categories")
  }

  def getObjectId = Some(Guid[String].random.id)
}

case class ProductCategory(
    id:   String,
    name: String
) extends Accessible {
  var selected: Boolean = false
}

object ProductCategory extends AccessibleFactory {

  def create(name: String): Accessible = {
    ProductCategory("", name)
  }

  def create(id: String, name: String): Accessible = {
    ProductCategory(id, name)
  }
}
