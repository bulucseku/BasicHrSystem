package com.sentrana.biq.controllers

import scala.util.{ Failure, Success, Try }

import play.api.libs.json.JsValue
import play.api.mvc.Action

import org.json4s.native.Serialization._

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.data.FormulaType
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.biq.core.conceptual.DerivedMetric
import com.sentrana.biq.datacontract.{ DerivedColumn, DerivedColumnFormula, DerivedColumnInfo, ReportInfo }
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.biq.exceptions.{ DerivedColumnIDNotFoundException, DerivedColumnNameAlreadyInUseException }
import com.sentrana.usermanagement.authentication.Guid
import com.sentrana.usermanagement.controllers.Authentication

/**
 * Created by william.hogben on 2/19/2015.
 */
object DerivedColumnService extends DerivedColumnService with PlayLoggerComponent

trait DerivedColumnService extends BaseController with Authentication with RepoAccess {
  this: LoggerComponent =>

  lazy val mongoDataServices = BIQDataServices()

  def validateFormula: Action[JsValue] = RepoAction(parse.json) { implicit request =>
    logger.debug("Validating formula: " + request.body.toString)
    val derivedInfo = read[DerivedColumnFormula](request.body.toString)
    val repository = request.repository
    // load any unloaded filter attribute elements
    repository.loadAttributeElementsFromString(derivedInfo.formula)
    val metricPattern = new DerivedMetric.MetricPattern(repository.metaData)

    Try(metricPattern.parse(derivedInfo.formula)) match {
      case Success(metric) => Ok("true")
      case Failure(e)      => BadRequest("Could not validate formula error was: " + e.getMessage)
    }
  }

  def addDerivedColumn: Action[JsValue] = RepoAction(parse.json) { implicit request =>
    logger.debug("Adding Derived Column: " + request.body.toString)
    val derivedInfo = read[DerivedColumnInfo](request.body.toString)
    val userSession = request.userSession
    val repository = request.repository
    if (checkForDuplicate(derivedInfo, userSession.user.id))
      throw new DerivedColumnNameAlreadyInUseException(derivedInfo.name)
    else {
      val dc = BIQServiceUtil.convertDerivedColumnInfoToDerivedColumn(derivedInfo, userSession)
      val derivedColumn = dc.copy(id = getObjectId)
      mongoDataServices.saveDocument[DerivedColumn](derivedColumn)

      Ok(write(BIQServiceUtil.convertDerivedColumnToDerivedColumnInfo(derivedColumn)))
    }
  }

  def deleteDerivedColumn(derivedColumnId: String) = RepoAction { implicit request =>
    logger.debug("Deleting derived column: " + derivedColumnId)
    val repository = request.repository
    val dc = BIQDataServices.getDerivedColumn(derivedColumnId)
    removeDerivedColumnFromDerivedColumns(dc)
    removeDerivedColumnFromReports(dc)
    mongoDataServices.removeDocuments[DerivedColumn](Map("id" -> derivedColumnId))
    logger.debug("Successfully deleted derived column: " + derivedColumnId)

    Ok("true")
  }

  def updateDerivedColumn(derivedColumnId: String): Action[JsValue] = RepoAction(parse.json) { implicit request =>
    logger.debug("Updating Derived Column: " + request.body.toString)
    val derivedInfo = read[DerivedColumnInfo](request.body.toString)
    val userSession = request.userSession
    val repository = request.repository
    val where = Map("id" -> derivedColumnId)

    // validate the formula
    if (derivedInfo.formulaType == FormulaType.DM.toString) {
      val metricPattern = new DerivedMetric.MetricPattern(repository.metaData)
      metricPattern.parse(derivedInfo.formula)
    }

    // check for uniqueness
    if (checkForDuplicate(derivedInfo, userSession.user.id, Some(derivedColumnId))) {
      throw new DerivedColumnNameAlreadyInUseException(derivedInfo.name)
    }

    //drop the cache for those reports which uses this derived column
    com.sentrana.biq.controllers.ReportingService.dropCacheForDerivedColumn(derivedInfo.id.get)

    mongoDataServices.getDocuments[DerivedColumn](where).headOption match {
      case None => BadRequest("A derived column does not exist with id: " + derivedColumnId)
      case Some(existing) =>
        val dc = existing.copy(
          derivedColumnName    = derivedInfo.name,
          derivedColumnVersion = existing.derivedColumnVersion + 1,
          lastModUserId        = userSession.user.id,
          expression           = derivedInfo.formula,
          precision            = derivedInfo.precision.toInt,
          dataType             = derivedInfo.outputType,
          formulaType          = derivedInfo.formulaType
        )
        mongoDataServices.updateDocument[DerivedColumn](where, dc)

        Ok(write(BIQServiceUtil.convertDerivedColumnToDerivedColumnInfo(dc)))
    }
  }

  def checkForDuplicate(dci: DerivedColumnInfo, userId: String, columnId: Option[String] = None): Boolean = {
    val duplicates = mongoDataServices.getDocuments[DerivedColumn](
      Map(
        "derivedColumnName" -> dci.name,
        "createUserId" -> userId,
        "dataSource" -> dci.dataSource
      )
    )
    var hasDuplicate = false

    if (duplicates.size > 0) {
      hasDuplicate = columnId match {
        case None     => true
        case Some(id) => !duplicates.exists(d => d.id == Some(id))
      }
    }

    if (hasDuplicate) {
      logger.debug("Provided Derived column is a duplicate of derived column: " + duplicates.head.derivedColumnName)
    }

    hasDuplicate
  }

  private def removeDerivedColumnFromReports(dc: DerivedColumn) = {
    logger.debug("Removing derived column from reports with id: " + dc.id.get)
    val id = dc.id.getOrElse("")
    val fx = s"f($id)"
    val regex = s".*f\\($id\\).*".r
    val reports = mongoDataServices.getDocuments[ReportInfo](Map("definition.template" -> regex))
    val expression = BIQServiceUtil.getDerivedColumnExpressionPattern(dc)
    reports.foreach { report =>
      val templates = report.definition.template.split("\\|").map { t =>
        if (t == fx) expression
        else if (dc.formulaType == FormulaType.CM.toString)
          t.replace(fx, s"($expression)")
        else
          t.replace(fx, expression)
      }.mkString("|")
      val updated = report.copy(definition = report.definition.copy(template = templates))
      mongoDataServices.updateDocument[ReportInfo](Map("id" -> report.id.get), updated)
    }
  }

  private def removeDerivedColumnFromDerivedColumns(dc: DerivedColumn) = {
    logger.debug("Removing derived column from derived columns with id: " + dc.id.get)
    val id = dc.id.getOrElse("")
    val fx = s"f($id)"
    val regex = s".*f\\($id\\).*".r
    val cols = mongoDataServices.getDocuments[DerivedColumn](Map("expression" -> regex))
    cols.foreach { col =>
      val formula = col.expression.replace(fx, s"(${dc.expression})")
      val where = Map("id" -> col.id)
      mongoDataServices.updateDocument[DerivedColumn](where, col.copy(expression = formula))
    }
  }

  private def getObjectId = Some(math.abs(Guid[String].random.hashCode).toString)
}
