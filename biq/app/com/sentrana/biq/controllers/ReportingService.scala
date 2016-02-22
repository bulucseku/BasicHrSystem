package com.sentrana.biq.controllers

import java.net.{ URLDecoder, URLEncoder }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.language.postfixOps
import scala.util.{ Success, Try }

import play.api.libs.Files.TemporaryFile
import play.api.libs.json.JsValue
import play.api.mvc._

import org.joda.time.DateTime
import org.json4s.native.Serialization._

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.cache.CacheManager
import com.sentrana.appshell.controllers.{ BaseController, ExportService }
import com.sentrana.appshell.data.{ ColInfo, DrillType, TimingInfo }
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.biq.core.conceptual.{ AttributeElement, AttributeForm, FilterUnit, Metric }
import com.sentrana.biq.core.physical.TreeFilter
import com.sentrana.biq.core.{ Report, Repository }
import com.sentrana.biq.datacontract._
import com.sentrana.biq.exceptions.{ CacheKeyNotFoundException, MissingRequestParameterException }
import com.sentrana.usermanagement.authentication.{ SecurityManager, UserSession }
import com.sentrana.usermanagement.controllers.{ Authentication, Authorization }
import com.sentrana.usermanagement.datacontract.EnumApplicationRoles.BIQ_ADMIN
import com.twitter.util.Stopwatch

/**
 * Created by william.hogben on 2/26/2015.
 */
object ReportingService extends ReportingService with PlayLoggerComponent

trait ReportingService extends BaseController with Authentication with Authorization with RepoAccess {
  this: LoggerComponent =>

  val loggerForSql = Logger("loggerForSql")
  val cacheKeyMap = scala.collection.mutable.Map[String, String]()

  /**
   * Execute a report using the supplied report specification.
   *
   * Requires a post param which is the json ReportSpecification object
   */
  def execute: Action[JsValue] = RepoAction(parse.json) { implicit request =>
    val reportSpec = read[ReportSpecification](request.body.toString)
    val userSession = request.userSession
    val repository = request.repository

    val result = getDatasetResult(
      reportSpec.template,
      reportSpec.filter,
      reportSpec.totals,
      reportSpec.sort,
      userSession,
      repository
    )

    Ok(write(result))
  }

  /**
   * Returns the possible drill options for the specified selected
   * elements, based on a given report cache entry.
   *
   * Expects cacheid and sElems url query params
   * cacheid: The id of the cached report to get drill options for
   * sElems: The elements to get the drill options for in the form:
   *          elmentId1|elementId2|elementId3
   */
  def getDrillOptions(cacheId: String, selectedElements: String) = AuthAction { implicit request =>
    logger.debug(s"Getting Drill Options for cacheId: $cacheId and attribute elements: $selectedElements")
    val userSession = request.userSession
    val cacheEntry = getCacheEntryForUser(userSession, cacheId)
    val repository = cacheEntry.report.repository.get
    val elements = selectedElements.split("\\|")
      .map(el => repository.metaData.getAttributeElement(el, errorOnMissing = false))
      .collect { case Some(element) => element }
    if (elements.isEmpty) {
      logger.debug("Provided element Ids were invalid.")
      BadRequest("Could not find any elements with the given elementIds: " + selectedElements)
    }
    else cacheEntry.report.drillInto(elements) match {
      case None         => Ok(write(DrillOptions(None, None, Seq())))
      case Some(report) => Ok(write(generateDrillOptions(elements, report)))
    }
  }

  def dropCacheForDerivedColumn(derivedColumnId: String) = {
    logger.debug("Dropping caches for reports which used the derived column with id: " + derivedColumnId)
    val filteredKeys = cacheKeyMap.filter {
      kv => kv._2.contains(s"f($derivedColumnId)")
    }
    filteredKeys.foreach {
      case (k, v) =>
        cacheKeyMap -= k
        CacheManager.removeCachedData(v)
    }
  }

  /**
   * Drops an in-memory cache of a previously executed report.
   *
   * Expects url query param cacheid
   * cacheid: The cacheId of the element cached in memory to remove
   */
  def dropCache(cacheId: String) = RoleAction(BIQ_ADMIN) { implicit request =>
    val cacheKey = cacheKeyMap.getOrElse(cacheId, "")
    CacheManager.getCachedData(cacheKey) match {
      case None =>
        logger.debug("Cache id not found in cache: " + cacheId)
        Ok(write(DropCacheResult(success = false)))
      case Some(cache) =>
        CacheManager.removeCachedData(cacheKey)
        cacheKeyMap.remove(cacheId)
        Ok(write(DropCacheResult(success = true)))
    }
  }

  /**
   * Drop all in-memory caches (for all users). This is not exposed
   * through the front-end
   */
  def dropCaches = RoleAction(BIQ_ADMIN) { implicit request =>
    logger.debug("Dropping all reporting caches")
    val count = cacheKeyMap.keys.size
    cacheKeyMap.values.foreach(v => CacheManager.removeCachedData(v))
    cacheKeyMap.clear()
    Ok(write(DropCachesResult(status = "Success", numDropped = count)))
  }

  /**
   * Perform invalidation of cache by supplied repository id(s).
   *
   * Expects the url query params username, repositoryIds, password
   * repositoryIds: The list of repository's to clear the cache for separated by |
   * username: The username to use to check for repository permissions
   * password: The login password for the provided username
   */
  def dropCachesByRepository(repoIds: String, username: String, password: String) = RoleAction(BIQ_ADMIN) { implicit request =>
    val userSession = SecurityManager.createSession(username, password)
    val repositories = repoIds.split("\\|").map {
      id => Try(BIQServiceUtil.getRepository(userSession.user, id))
    }.collect { case Success(repo) => repo.id }
    logger.debug("Dropping caches for repositories: " + repositories.mkString(", "))
    val filteredKeys = cacheKeyMap.filter {
      kv => repositories.contains(kv._2.split("\\|")(0))
    }
    filteredKeys.foreach {
      case (k, v) =>
        cacheKeyMap -= k
        CacheManager.removeCachedData(v)
    }
    Ok(write(DropCachesResult(status = "Success", numDropped = filteredKeys.size)))
  }

  /**
   * This method is called by the tree control when certain node is unfolded and the child nodes are expected
   * to be returned and displayed under the unfolded node.
   *
   * Expects a Post param in the form of a filterElement
   */
  def getChildElements: Action[JsValue] = RepoAction(parse.json) { implicit request =>
    val filterElements = read[FilterElement](request.body.toString)
    logger.debug("Getting childElements for filterElement: " + filterElements.oid)
    val repository = request.repository
    val treeFilter = repository.createTreeFilter(filterElements.oid)
    val attributeForm = repository.metaData.attributeForms.find(_.id == treeFilter.attributeElement.parent.id)
    if (attributeForm.isEmpty || Option(attributeForm.get.parent.parent).isEmpty) {
      logger.debug("The filter element has no children: " + filterElements.oid)
      Ok("")
    }
    else {
      val childAttrForm = attributeForm.get.parent.parent.forms.find { form =>
        form.shortName == attributeForm.get.shortName
      }
      val filterElements = treeFilter.attributeElement.childElements.collect {
        case el if el.name != "NULL" && el.name != "" =>
          val hasChildren = Option(childAttrForm.get.parent.parent).nonEmpty &&
            childAttrForm.get.parent.parent.forms.find { form =>
              form.shortName == attributeForm.get.shortName
            }.nonEmpty
          FilterElement(
            oid         = treeFilter.treePath + el.id,
            name        = Option(el.name),
            hasChildren = Option(hasChildren)
          )
      }
      logger.debug("Found child elements: " + filterElements.map(_.oid).mkString(", "))
      Ok(write(filterElements))
    }
  }

  /**
   * Returns the element paths from form with the given form id to all child elements
   * that match the query string
   *
   * Expects the URL query params form_id and str
   * str: The string to match child elements by
   * form_id: The id of the parent form to search for paths from
   */
  def getMatchingElementPaths(searchString: String, formId: String) = RepoAction { implicit request =>
    val repository = request.repository
    repository.metaData.attributeForms.find(_.id == formId) match {
      case Some(attributeForm) =>
        val searchResults = attributeForm.allElements.par.map(el => searchChildElements(el, searchString))
        Ok(write(searchResults.reduce((a, b) => a ++ b).values.map(getHID)))
      case None => BadRequest(
        "Attribute form could not be found with the given formId: " + formId
      )
    }
  }

  /**
   * Export a previously executed report to a CSV (comma separated value) text file.
   *
   * Expects the following url params:
   * templateUnits: The template units of the report separated by |
   * filterUnits: The filter units of the report separated by |
   * sort: The sorter properties of the report
   * totalsOn: true to include total rows
   * fileName: the filename to store the csv as
   */
  def exportToCsv = RepoAction.async(parse.urlFormEncoded) { implicit request =>
    val map = request.body
    val userSession = request.userSession
    val repository = request.repository
    val expectedQueryParams = Seq("templateUnits", "filterUnits", "sort", "totalsOn", "fileName")
    expectedQueryParams.foreach { param =>
      map.getOrElse(
        param,
        throw new MissingRequestParameterException(param)
      )
    }
    val fileName = map("fileName").head
    val totalsOn = map("totalsOn").head.toBoolean
    val cacheId = BIQServiceUtil.getCacheKey(
      URLDecoder.decode(map("templateUnits").head, "UTF-8"),
      URLDecoder.decode(map("filterUnits").headOption.getOrElse(""), "UTF-8"),
      totalsOn,
      map("sort").head,
      userSession,
      repository
    )
    val datasetResult = CacheManager.getCachedData(cacheId).collect {
      case cached: CacheEntry => convertDataSetResult(cached.dataset)
    }
    Future(ExportService.exportToCsv(cacheId, totalsOn, fileName, datasetResult))
  }

  private def convertDataSetResult(dataSet: DatasetResult): com.sentrana.appshell.data.DatasetResult = {
    com.sentrana.appshell.data.DatasetResult(
      colInfos   = dataSet.colInfos.map(c => ColInfo(title = c.title)),
      TimingInfo = dataSet.timing,
      rows       = dataSet.rows,
      totals     = Option(dataSet.totals),
      cacheid    = dataSet.cacheid,
      cached     = dataSet.cached
    )
  }

  def exportChart: Action[MultipartFormData[TemporaryFile]] = {
    ExportService.exportChart
  }

  def exportPivotTable: Action[Map[String, Seq[String]]] = {
    ExportService.exportPivotTable
  }

  private def generateDrillOptions(selectedElements: Traversable[AttributeElement], report: Report): DrillOptions = {
    val targetAttributes = report.getDrillPathTargetAttributes(selectedElements)
    val drillInfos = selectedElements.map { el =>
      DrillElementInfo(
        eName      = el.name,
        formName   = el.parent.name,
        actualName = el.parent.parent.name,
        formID     = el.parent.id,
        eID        = el.parent.id + ":" + el.name
      )
    }
    val drillAttrInfos = targetAttributes.map { attr =>
      DrillAttributeInfo(
        formName  = attr.name,
        formCount = attr.defaultForms.size
      )
    }
    val reportSpec = ReportSpecification(
      template = report.templates.map(_.reportUnit.id).mkString("|"),
      filter   = if (report.filters.nonEmpty) Some(report.filters.map(_.id).mkString("|")) else None,
      sort     = report.templates.map(_.sortUnit.toString).mkString("|"),
      totals   = report.totalsOn
    )
    val drillOption = DrillOption(
      tp           = DrillType.DRILL_DOWN,
      eInfos       = drillInfos.toSeq,
      tgtAttrForms = drillAttrInfos.toSeq,
      report       = reportSpec
    )
    DrillOptions(
      exptMsg   = None,
      errorCode = None,
      opts      = Seq(drillOption)
    )
  }

  private def searchChildElements(attributeElement: AttributeElement, search: String): Map[String, AttributeElement] = {
    val childElements = attributeElement.childElements
    val searchList = if (childElements.nonEmpty) {
      val elements = if (attributeElement.childElementsString.indexOf(search) > -1) {
        (attributeElement.id -> attributeElement) :: attributeElement.parentElements.map {
          el => el.id -> el
        }.toList
      }
      else Nil
      if (childElements.nonEmpty && childElements.head.childElements.nonEmpty)
        elements ++ childElements.par.flatMap(el => searchChildElements(el, search).toList)
      else
        elements
    }
    else Nil
    searchList.groupBy(_._1).map { case (id, groups) => (id, groups.head._2) }
  }

  private def getHID(attributeElement: AttributeElement): String = {
    val treeFilter = TreeFilter(
      databaseId       = attributeElement.id,
      treeColumnForm   = attributeElement.ancestorForm.getOrElse(
        throw new Exception("Attribute element must have an ancestorForm: " + attributeElement.id)
      ),
      parentElements   = attributeElement.parentElements,
      attributeElement = attributeElement,
      attributeForm    = attributeElement.parent
    )
    BIQServiceUtil.generateHID(treeFilter.treePath)
  }

  private def getCacheEntryForUser(userSession: UserSession, cacheKey: String): CacheEntry = {
    logger.debug(
      "Validating cache access:\n" +
        "\tsession: " + userSession.sessionToken + "\n" +
        "\tusername: " + userSession.user.firstName + "\n" +
        "\tcacheKey: " + cacheKey
    )
    logger.debug("Checking cache for cacheEntry with key: " + cacheKey)
    val cacheEntryKey = cacheKeyMap.getOrElse(cacheKey, "")
    CacheManager.getCachedData(cacheEntryKey) match {
      case Some(entry: CacheEntry) =>
        val repository = BIQServiceUtil.getRepository(userSession.user, entry.report.repository.get.id)
        repository.getCategoryAttribute match {
          case None => entry
          case Some(attribute) =>
            val categoryNames = entry.report.filters.flatMap(_.fundamentalElements).collect {
              case el if el.parent.parent == attribute => el.name
            }
            BIQServiceUtil.validateCategoryAccess(userSession, categoryNames)
            entry
        }
      case _ =>
        throw new CacheKeyNotFoundException(cacheKey)
    }
  }

  private def getDatasetResult(
    templateUnits: String,
    filterUnits:   Option[String],
    totalsOn:      Boolean,
    sort:          String,
    userSession:   UserSession,
    repository:    Repository
  ): DatasetResult = {
    logger.debug(
      "Getting dataset result for dataset with:\n" +
        "\tsession:\t" + userSession.sessionToken + "\n" +
        "\tusername:\t" + userSession.user.userName +
        "\n\trepositoryId:\t" + repository.id +
        "\n\ttemplate:\t" + templateUnits +
        "\n\tfilter:\t" + filterUnits +
        "\n\ttotals:\t" + totalsOn +
        "\n\tsort:\t" + sort
    )

    val cacheEntryKey = BIQServiceUtil.getCacheKey(
      templateUnits, filterUnits.getOrElse(""),
      totalsOn, sort, userSession, repository
    )
    val cacheKey = java.util.UUID.randomUUID().toString
    val filterParts = if (filterUnits.isEmpty) Nil else filterUnits.get.split('|').toList
    CacheManager.getCachedData(cacheEntryKey) match {
      case Some(value: CacheEntry) =>
        logger.debug("Using cached result")
        value.dataset
      case _ =>
        logger.debug("Querying for result")
        if (repository.getCategoryAttribute.nonEmpty) {
          val selectedCategoryNames =
            filterParts.map(_.split(':')).filter(_.size == 2).collect {
              case Array(attrName, attrVal) if attrName == "CategoryName" => attrVal
            }
          BIQServiceUtil.validateCategoryAccess(userSession, selectedCategoryNames)
        }
        val implicitFilters = BIQServiceUtil.getImplicitFilters(userSession, repository)
        val report = generateReport(repository, templateUnits, filterUnits, totalsOn, sort, implicitFilters)
        val result = generateResult(report, repository, templateUnits, Some(cacheKey))

        cacheKeyMap += cacheKey -> cacheEntryKey
        logger.debug("Adding result to cache with key: " + cacheKey)
        CacheManager.setDataInCache(cacheEntryKey, CacheEntry(report, result))
        result
    }
  }

  private def generateReport(
    repository:      Repository,
    templateUnits:   String,
    filterUnits:     Option[String],
    totalsOn:        Boolean,
    sort:            String,
    implicitFilters: Traversable[FilterUnit] = Nil
  ): Report = {

    // Split the template units into parts...
    val tuParts = templateUnits.split('|').toList.filter(_ != "")
    // Split the filter units into parts...
    val fuParts = filterUnits match {
      case Some(fu) => fu.split('|').toList.filter(_ != "")
      case None     => Nil
    }
    // Split the sort units into parts...
    val sortParts = if (sort != null)
      sort.split('|').toList.filter(_ != "")
    else
      List()
    //The created report contains templates along with the canonical sort column.
    repository.createReport(
      tuParts,
      sortParts,
      fuParts,
      totalsOn,
      implicitFilters
    )
  }

  private def generateResult(
    report:        Report,
    repository:    Repository,
    templateUnits: String,
    cacheKey:      Option[String]
  ): DatasetResult = {
    val stopwatch = Stopwatch.start()
    val tuParts = templateUnits.split('|').toList
    val query = report.buildQuery
    val sqlGenTime = stopwatch().inMilliseconds

    val queryTimer = Stopwatch.start()
    val dataset = query.execute
    val datasetTime = queryTimer().inMilliseconds

    val templates = report.templates.filter { tu =>
      tu.reportUnit match {
        case m: Metric         => true
        case af: AttributeForm => tuParts.contains(af.id)
      }
    }
    val colInfos = (templates, dataset.columnNames, dataset.columnWidths).zipped.map {
      case (template, name, width) => ColumnInfo(template, name, width)
    }
    loggerForSql.debug(s"SQL Query witch cacheKey ${cacheKey.getOrElse("")}: ${query.queryText}")
    DatasetResult(
      colInfos      = colInfos.toSeq,
      exptMsg       = "",
      maltypedElems = Nil,
      timing        = TimingInfo(sqlGenTime, datasetTime),
      cached        = cacheKey.nonEmpty,
      rows          = dataset.rows,
      totals        = null,
      execTime      = DateTime.now().toString,
      cacheid       = cacheKey.getOrElse(""),
      sql           = query.queryText.replaceAll("""\r?\n(\s*)""", "<br/>"),
      drillable     = report.IsDrillable
    )
  }

}
