package com.sentrana.biq.controllers

import play.api.mvc.Result
import org.joda.time.DateTime
import org.json4s.native.Serialization.{ read, write }
import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.biq.datacontract.{ CommentInfo, CommentStreamInfo, ReportInfo, ReportInfoSharingRecipient }
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.biq.exceptions._
import com.sentrana.usermanagement.controllers.Authentication
import com.sentrana.usermanagement.datacontract.{ ResponseMessage, ResponseMessageCode }
import com.sentrana.usermanagement.domain.document.User
import scala.util.matching.Regex

/**
 * Created by szhao on 2/2/2015.
 */
object ReportService extends ReportService with PlayLoggerComponent

trait ReportService extends BaseController with Authentication with RepoAccess {
  this: LoggerComponent =>

  lazy val mongoDataServices = BIQDataServices()

  def getReports = RepoAction { implicit request =>
    val user = request.userSession.user
    val dataSource = request.repository
    appLogger.debug(s"Get reports for user ${user.userName} with user id ${user.id} in repository ${dataSource.id}")
    val reportList = mongoDataServices.getDocuments[ReportInfo](
      Map("createUserId" -> user.id, "dataSource" -> dataSource.id, "bookletId" -> None)
    )
    val sharedReportIds: List[ReportInfoSharingRecipient] = mongoDataServices.getDocuments[ReportInfoSharingRecipient](
      Map("userId" -> user.id, "dataSource" -> dataSource.id, "shareStatus" -> "AC")
    )
    val sharedReportList: List[ReportInfo] = sharedReportIds.map {
      el =>
        mongoDataServices.getDocuments[ReportInfo](Map("id" -> el.reportId)).headOption match {
          case None         => None
          case Some(report) => Some(BIQServiceUtil.expandColumnsForSharedReport(report))
        }
    }.flatten

    Ok(write((reportList ++ sharedReportList).map{
      report =>
        val reportWithSharedStatus = report.copy(shared = report.reportSharings.map(!_.isEmpty))
        fixReportComments(reportWithSharedStatus, user.id)
    }))
  }

  def getReport(reportId: String) = AuthAction { implicit request =>
    val user = request.userSession.user
    withReport(reportId, user) { report =>
      if (report.createUserId != Some(user.id)) {
        val sharedUsers = report.reportSharings.flatMap { id =>
          mongoDataServices.getDocuments[ReportInfoSharingRecipient](Map("id" -> id)).headOption.map(_.userId)
        }
        if (!sharedUsers.contains(user.id))
          throw new UnauthorizedReportAccessException(user.userName, reportId)
        Ok(write(BIQServiceUtil.expandDerivedColumns(report)))
      }
      else {
        Ok(write(report))
      }
    }
  }

  def addReport = RepoAction(parse.json) { implicit request =>
    // before this, session has been validated, so we can be sure that we can get sessionId from cookie.
    val user = request.userSession.user
    val dataSource = request.repository
    appLogger.debug(s"Save report for user ${user.userName} in repository ${dataSource.id}")
    val reportInfo = read[ReportInfo](request.body.toString)

    if (reportInfo.name.isEmpty) {
      throw new ReportNameRequiredException
    }

    if (reportExistWithSameNameForUser(reportInfo.name, user.id, dataSource.id, reportInfo.bookletId)) {
      throw new ReportNameAlreadyInUseException(reportInfo.name)
    }

    // Update reportInfo using other supplement information
    val updateReportInfo = reportInfo.copy(
      id           = BIQServiceUtil.getObjectId,
      dataSource   = Some(dataSource.id),
      createDate   = Some(DateTime.now().getMillis),
      createUser   = Some(s"${user.firstName} ${user.lastName}"),
      createUserId = Some(s"${user.id}"),
      lastModUser  = Some(s"${user.firstName} ${user.lastName}"),
      lastModDate  = Some(DateTime.now().getMillis)
    )
    mongoDataServices.saveDocument[ReportInfo](updateReportInfo)
    Ok(write(updateReportInfo))
  }

  def reportExistWithSameNameForUser(reportName: String, userId: String, dataSource: String, bookletId: Option[String]): Boolean = {
    val reports = mongoDataServices.getDocuments[ReportInfo](Map(
      "name" -> reportName, "createUserId" -> userId, "dataSource" -> dataSource
    ))
    reports.filter{ _.bookletId == bookletId }.nonEmpty
  }

  def editReport(reportId: String) = RepoAction(parse.json) { implicit request =>
    val userSession = request.userSession
    val dataSource = request.repository

    appLogger.debug(s"Edit report for user ${userSession.user.userName} in repository ${dataSource.id}")
    val reportPosted = read[ReportInfo](request.body.toString)
    if (reportPosted.createUserId != Some(userSession.user.id))
      throw new UnauthorizedReportEditException(userSession.user.userName, dataSource.id)

    mongoDataServices.updateDocument[ReportInfo](Map("id" -> reportPosted.id), reportPosted)
    Ok(write(reportPosted))
  }

  def deleteReport(reportId: String) = RepoAction { implicit request =>
    val user = request.userSession.user

    mongoDataServices.getDocuments[ReportInfo](Map("id" -> reportId)).headOption match {
      case Some(report) =>
        if (report.createUserId == Some(user.id)) {
          mongoDataServices.removeDocuments[ReportInfo](Map("id" -> reportId))
          mongoDataServices.removeDocuments[ReportInfoSharingRecipient](Map("reportId" -> reportId))
        }
        else {
          val map = Map("reportId" -> reportId, "userId" -> user.id)
          mongoDataServices.getDocuments[ReportInfoSharingRecipient](map).headOption match {
            case Some(reportSharing) =>
              mongoDataServices.updateDocument(map, reportSharing.copy(shareStatus = "RJ"))
            case None => throw new UnauthorizedReportDeleteException(user.userName, reportId)
          }
        }
        Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, "Report deleted successfully!")))
      case None =>
        NotFound("Report not found with id: " + reportId)
    }
  }

  /**
   * This method provides a wrapper for all the comment related service as each of them need access to specific report.
   * @param reportId Report ID
   * @param a Action inside the service
   * @return HTTP Result
   */
  def withReport(reportId: String, user: User)(a: ReportInfo => Result): Result = {
    mongoDataServices.getDocuments[ReportInfo](Map("id" -> reportId)).headOption match {
      case Some(report) => {
        // Verify users access to report
        BIQServiceUtil.checkRepositoryAccess(user, report.dataSource.getOrElse(""))
        a(report)
      }
      case None => Ok(write(new ResponseMessage(ResponseMessageCode.FAILURE.toString, s"Cannot find report with id $reportId!")))
    }
  }

  def addReportComment(reportId: String) = AuthAction(parse.json) { implicit request =>
    val user = request.userSession.user
    val newComment = read[CommentInfo](request.body.toString)
    val updateNewComment = newComment.copy(
      userName = Some(s"${user.firstName} ${user.lastName}"),
      userId   = Some(s"${user.id}"),
      date     = Some(DateTime.now.getMillis),
      cid      = Some(reportId + "_" + BIQServiceUtil.getObjectId.getOrElse(""))
    )
    withReport(reportId, user)(report => {
      val newCommentStream = report.comments match {
        case None    => Some(CommentStreamInfo(None, List(updateNewComment)))
        case Some(x) => Some(CommentStreamInfo(None, x.comments :+ updateNewComment))
      }
      val updatedReport = report.copy(comments = newCommentStream)
      mongoDataServices.updateDocument[ReportInfo](Map("id" -> reportId), updatedReport)
      // The comment the user just created should be editable to this user.
      Ok(write(updateNewComment.copy(editable = Some(true))))
    })
  }

  def getReportComment(reportId: String) = AuthAction { implicit request =>
    val user = request.userSession.user
    withReport(reportId, user)(report => Ok(write(fixReportComments(report, s"${user.id}").comments)))
  }

  def fixReportComments(report: ReportInfo, userId: String) = {
    val updatedComments = report.comments.flatMap(cs => Some(updateCommentEditableState(cs.comments, userId)))
    report.copy(comments = report.comments.flatMap(c => Some(c.copy(comments = updatedComments.getOrElse(Nil)))))
  }

  def updateCommentEditableState(comments: List[CommentInfo], userId: String) = {
    comments.map(c => c.copy(editable = Some(userId == c.userId.getOrElse(""))))
  }

  def editReportComment(reportId: String, commentId: String) = AuthAction(parse.json) { implicit request =>
    val user = request.userSession.user
    val newComment = read[CommentInfo](request.body.toString)
    if (Some(user.id) != newComment.userId) {
      throw new UnauthorizedReportCommentEditException(user.userName, commentId)
    }
    withReport(reportId, user)(report => {
      val newCommentStream = report.comments match {
        case None    => Some(CommentStreamInfo(None, List(newComment)))
        case Some(x) => Some(CommentStreamInfo(None, x.comments.filter(c => c.cid != Some(commentId)) :+ newComment))
      }
      val updatedReport = report.copy(comments = newCommentStream)
      mongoDataServices.updateDocument[ReportInfo](Map("id" -> reportId), updatedReport)
      Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, "Comment updated successfully!")))
    })
  }

  def deleteReportComment(reportId: String, commentId: String) = AuthAction { implicit request =>
    val user = request.userSession.user
    withReport(reportId, user)(report => {
      val newCommentStream = report.comments match {
        case None => Some(CommentStreamInfo(None, Nil))
        case Some(x) =>
          x.comments.find(c => c.cid == Some(commentId) && c.userId != Some(user.id)).foreach { c =>
            throw new UnauthorizedReportCommentDeleteException(user.userName, commentId)
          }
          Some(CommentStreamInfo(None, x.comments.filter(c => c.cid != Some(commentId))))
      }
      val updatedReport = report.copy(comments = newCommentStream)
      mongoDataServices.updateDocument[ReportInfo](Map("id" -> reportId), updatedReport)
      Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, "Comment deleted successfully!")))
    })
  }
}
