package com.sentrana.biq.controllers

import org.joda.time.DateTime
import org.json4s.native.Serialization._

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.datacontract.UserInfo
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.biq.core.{ EmailNotificationManager, ParticipationStateChangeManager, ReportRecipientManager, RepositoryAccess, RepositoryPermissions }
import com.sentrana.biq.datacontract._
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.biq.exceptions.{ ReportIDNotFoundException, UnauthorizedReportAccessException }
import com.sentrana.usermanagement.controllers.Authentication
import com.sentrana.usermanagement.datacontract.{ ResponseMessage, ResponseMessageCode }
import com.sentrana.usermanagement.domain.document.{ UMDataServices, User }

object ReportSharingService extends ReportSharingService with PlayLoggerComponent

trait ReportSharingService extends BaseController with Authentication with RepoAccess {
  this: LoggerComponent =>

  lazy val mongoDataServices = BIQDataServices()

  def getAvailableRecipients(recipientsFor: String, repositoryid: String) = RepoAction { implicit request =>
    val orgNames = RepositoryPermissions.getOrganizations(repositoryid)
    val orgIds = UMDataServices.getOrganizations.filter(o => orgNames.exists(x => x.equals(o.name))).map(y => y.id)

    val currentUser = request.userSession.user
    val repository = request.repository

    val orgHasAccess = if (repository.getCategoryAttribute.nonEmpty) {
      val reportFilterUnitIds = mongoDataServices.getDocuments[ReportInfo](Map("id" -> recipientsFor)).headOption.getOrElse(
        throw new ReportIDNotFoundException(recipientsFor)
      ).definition.filter.getOrElse("")
      val selectedCategoryNames = reportFilterUnitIds.toString.split('|')
        .map(filter => filter.split(":", 2))
        .collect {
          case Array(attributeName, elementValue) if attributeName == "CategoryName" =>
            elementValue
        }
      val allOrganizations = UMDataServices.getOrganizations

      allOrganizations.filter{ org =>
        val accessibles = RepositoryAccess.getOrgAccessibles(repository, org.id)
        selectedCategoryNames.diff(accessibles.collect { case p: ProductCategory => p.name }).isEmpty
      }.map(_.id)
    }
    else orgIds

    val userInfos = orgHasAccess.intersect(orgIds).flatMap(o => UMDataServices.getOrganizationById(o).activeUsers).filter(u => u.id != currentUser.id)
      .map(uo => UserInfo(uo.firstName, uo.lastName, uo.userName, Some(uo.email), uo.organization.name, uo.id))
    Ok(write(userInfos.toList))
  }

  def getReportRecipients(reportId: String) = AuthAction { implicit request =>
    val currentUser = request.userSession.user
    val reportInfo = getReportForUserIfAccessible(reportId, currentUser.id)
    val sharings = reportInfo.reportSharings.getOrElse(Set[String]())
    val recipientInfos: Set[RecipientInfo] = sharings.flatMap(
      el => {
        mongoDataServices.getDocuments[ReportInfoSharingRecipient](Map("id" -> el)).headOption match {
          case Some(recipientInfo) => Some(RecipientInfo(userID = recipientInfo.userId, partStatus = recipientInfo.shareStatus))
          case None                => None
        }
      }
    )

    Ok(write(recipientInfos))
  }

  def getSharingUpdate(userId: String) = RepoAction { implicit request =>

    val sharingInfoList: List[SharingInfo] = List[SharingInfo]()

    if (BIQServiceUtil.reportBookletSharingInfo.contains(userId)) {
      val repositoryId = request.repository.id
      Ok(write(BIQServiceUtil.reportBookletSharingInfo(userId).filter(x => x.repository == repositoryId).toList))
    }
    else {
      Ok(write(sharingInfoList))
    }
  }

  def clearSharingInfoCache(userId: String) = RepoAction { implicit request =>

    val repositoryId = request.repository.id
    if (BIQServiceUtil.reportBookletSharingInfo.contains(userId)) {
      BIQServiceUtil.reportBookletSharingInfo(userId) = BIQServiceUtil.reportBookletSharingInfo(userId).filter(x => x.repository != repositoryId)
    }
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, "Sharing Info cleared!")))
  }

  def removeAllReportRecipients(reportId: String) = RepoAction { implicit request =>

    val repositoryId = request.repository.id
    val currentUser = request.userSession.user
    val reportInfo = getReportForUserIfAccessible(reportId, currentUser.id)
    val reportRecipientsToRemove = reportInfo.reportSharings.getOrElse(Set[String]())

    val updatedReport = reportInfo.copy(reportSharings = None)
    mongoDataServices.updateDocument[ReportInfo](Map("id" -> reportId), updatedReport)
    reportRecipientsToRemove.foreach{
      recipientId =>
        mongoDataServices.getDocuments[ReportInfoSharingRecipient](Map("id" -> recipientId)).headOption.foreach { info =>
          BIQServiceUtil.cacheSharingInfo(info.userId, new SharingInfo(
            objectId       = reportId,
            repository     = repositoryId,
            objectType     = SharingObjectType.REPORT.toString,
            changeType     = SharingObjectChangeType.RV.toString,
            senderFullName = currentUser.firstName + " " + currentUser.lastName
          ))
        }
        mongoDataServices.removeDocuments[ReportInfoSharingRecipient](Map("id" -> recipientId))
    }

    val commentInfo = new CommentInfo(
      userName = Some(s"${currentUser.firstName} ${currentUser.lastName}"),
      userId   = Some(s"${currentUser.id}"),
      date     = Some(DateTime.now.getMillis),
      msg      = "Unshared the report with all recipients.",
      cid      = Some(""),
      editable = Some(false)
    )

    addReportComment(updatedReport, commentInfo, currentUser)
    Ok(write(""))
  }

  def addReportComment(report: ReportInfo, comment: CommentInfo, user: User) = {
    val newCommentStream = report.comments match {
      case None    => Some(CommentStreamInfo(None, List(comment)))
      case Some(x) => Some(CommentStreamInfo(None, x.comments :+ comment))
    }
    val updatedReport = report.copy(comments = newCommentStream)
    mongoDataServices.updateDocument[ReportInfo](Map("id" -> report.id), updatedReport)
    Ok(write(updatedReport))
  }

  def modifyReportRecipients(reportId: String) = RepoAction(parse.json) { implicit request =>

    val sharingModRequest = read[SharingModificationRequest](request.body.toString)
    val currentUser = request.userSession.user
    val reportInfo = getReportForUserIfAccessible(reportId, currentUser.id)
    val repositoryId = request.repository.id
    val repositoryName = request.repository.name
    val pscManager: ParticipationStateChangeManager = new ParticipationStateChangeManager

    val originalRecipients: List[RecipientInfo] = reportInfo.reportSharings.getOrElse(Set[String]()).toList.map(
      el => {
        mongoDataServices.getDocuments[ReportInfoSharingRecipient](Map("id" -> el)).headOption.map {
          recipient => RecipientInfo(userID = recipient.userId, partStatus = recipient.shareStatus)
        }
      }
    ).flatten

    for (el <- originalRecipients) pscManager.recordOriginal(el)

    for (el <- sharingModRequest.recips) pscManager.recordNew(el)

    val sharedObjectType = "report"
    val enManager: EmailNotificationManager = new EmailNotificationManager(
      enInfos        = sharingModRequest.emailInfos.getOrElse(Seq[EmailNotificationInfo]()),
      repository     = repositoryName,
      reportInfo     = Some(reportInfo),
      bookletInfo    = None,
      applicationUrl = SecurityService.getAppUrl + s"/#!viewsharedobject?id=$reportId&type=$sharedObjectType&repository=$repositoryId"
    )

    ReportRecipientManager.handleAllTransitions(currentUser.id.toString, reportId, pscManager, enManager, repositoryId)

    for (el <- sharingModRequest.recips) {
      val sharingInfo = new SharingInfo(
        objectId       = reportId,
        objectType     = SharingObjectType.REPORT.toString,
        changeType     = el.partStatus,
        repository     = repositoryId,
        senderFullName = currentUser.firstName + " " + currentUser.lastName
      )
      BIQServiceUtil.cacheSharingInfo(el.userID, sharingInfo)
    }

    val recipientInfos: List[RecipientInfo] = getReportForUserIfAccessible(reportId, currentUser.id).reportSharings.getOrElse(Set[String]()).toList.map(
      el => {
        mongoDataServices.getDocuments[ReportInfoSharingRecipient](Map("id" -> el)).headOption.map {
          recipientInfo => RecipientInfo(userID = recipientInfo.userId, partStatus = recipientInfo.shareStatus)
        }
      }
    ).flatten

    Ok(write(recipientInfos))
  }

  def getReportForUserIfAccessible(reportId: String, userId: String): ReportInfo = {
    mongoDataServices.getDocuments[ReportInfo](Map("createUserId" -> s"$userId", "id" -> reportId)).headOption match {
      case Some(reportInfo) => reportInfo
      case None =>
        throw new UnauthorizedReportAccessException(userId, reportId)
    }
  }
}
