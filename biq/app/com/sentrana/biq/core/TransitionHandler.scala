package com.sentrana.biq.core

import com.sentrana.biq.datacontract._
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.usermanagement.authentication.Guid
import com.sentrana.usermanagement.domain.document.UMDataServices
import org.joda.time.DateTime

abstract class TransitionHandler {

  val transitions = List[ParticipationStateTransition]()
  lazy val mongoDataServices = BIQDataServices()

  def handleTransition(sender: String, transition: ParticipationStateTransition, reportID: String, userIDs: List[String], enManager: EmailNotificationManager, repositoryID: String): Unit = {
    if (userIDs.length == 0 || userIDs == null) {
      return
    }

    for (el <- userIDs) {
      persistChanges(sender, transition, reportID, el, repositoryID)
    }

    updateStream(sender, transition, reportID, userIDs)

    if (enManager.hasEntry(transition)) {
      enManager.sendEmail(sender, transition, userIDs)
    }
  }

  def updateStream(sender: String, transition: ParticipationStateTransition, reportID: String, userIDs: List[String]): Unit

  def persistChanges(sender: String, transition: ParticipationStateTransition, reportID: String, userID: String, repositoryID: String): Unit

  def addCommentToStream(sender: String, reportID: String, commentText: String): Unit = {

    val user = UMDataServices.getActiveUser("id", sender).getOrElse(throw new IllegalArgumentException(
      "User not found with field: " + "id" + " having a value of: " + sender
    ))

    val commentInfo = new CommentInfo(
      userName = Some(user.userName),
      userId   = Some(user.id),
      date     = Some(DateTime.now().getMillis),
      msg      = commentText,
      cid      = Some(Guid[String].random.id),
      editable = Some(false)
    )

    val report = mongoDataServices.getDocuments[ReportInfo](Map("id" -> reportID)).headOption.getOrElse(
      throw new IllegalArgumentException("Report not found with id: " + reportID)
    )

    val newCommentStream = report.comments match {
      case None    => Some(CommentStreamInfo(None, List(commentInfo)))
      case Some(x) => Some(CommentStreamInfo(None, x.comments :+ commentInfo))
    }

    val updatedReport = report.copy(comments = newCommentStream)

    mongoDataServices.updateDocument[ReportInfo](Map("id" -> reportID), updatedReport)
  }

  def getFullNames(userIDs: List[String]): String = {

    val fullNames: List[String] =
      UMDataServices.activeUsers.filter(user => userIDs.contains(user.id)).map(user => user.firstName + " " + user.lastName).toList

    fullNames.mkString(", ")
  }
}

class CreateRecipientsTransitionHandler extends TransitionHandler {

  override val transitions: List[ParticipationStateTransition] = List(new ParticipationStateTransition(null, "AC"))

  override def updateStream(sender: String, transition: ParticipationStateTransition, reportID: String, userIDs: List[String]): Unit = {
    addCommentToStream(sender, reportID, s"Shared report with ${getFullNames(userIDs)}")
  }

  override def persistChanges(sender: String, transition: ParticipationStateTransition, reportID: String, userID: String, repositoryID: String): Unit = {
    val reportRecipientId = Guid[String].random.id
    val reportRecipient: ReportInfoSharingRecipient = new ReportInfoSharingRecipient(
      id          = reportRecipientId,
      shareStatus = transition.toState,
      dataSource  = Some(repositoryID),
      userId      = userID.toString,
      reportId    = reportID
    )

    mongoDataServices.saveDocument[ReportInfoSharingRecipient](reportRecipient)
    val report: ReportInfo = mongoDataServices.getDocuments[ReportInfo](Map("id" -> reportID)).headOption.getOrElse(
      throw new IllegalArgumentException("A report could not be found with the given id: " + reportID)
    )

    val reportSharings: Set[String] = report.reportSharings.getOrElse(Set[String]())
    val newReport = report.copy(
      reportSharings = Some(reportSharings + reportRecipientId)
    )
    mongoDataServices.updateDocument[ReportInfo](Map("id" -> reportID), newReport)
  }
}

class UpdateRecipientsTransitionHandler extends TransitionHandler {

  override val transitions: List[ParticipationStateTransition] = List(new ParticipationStateTransition("AC", "RV"), new ParticipationStateTransition("RV", "AC"))

  override def updateStream(sender: String, transition: ParticipationStateTransition, reportID: String, userIDs: List[String]): Unit = {
    val toState: String =
      if (transition.toState == "RV") {
        "Revoked"
      }
      else {
        "Re-granted"
      }
    addCommentToStream(sender, reportID, s"${toState} access to users: ${getFullNames(userIDs)}")
  }

  override def persistChanges(sender: String, transition: ParticipationStateTransition, reportID: String, userID: String, repositoryID: String): Unit = {
    val reportRecipientInfo: ReportInfoSharingRecipient = mongoDataServices.getDocuments[ReportInfoSharingRecipient](
      Map("userId" -> userID.toString, "reportId" -> reportID)
    ).headOption.getOrElse(throw new IllegalArgumentException(s"Report not found with id: $reportID and user: $userID"))
    val newReportRecipientInfo: ReportInfoSharingRecipient = reportRecipientInfo.copy(
      shareStatus = transition.toState
    )
    mongoDataServices.updateDocument[ReportInfoSharingRecipient](Map("userId" -> userID.toString, "reportId" -> reportID), newReportRecipientInfo)
  }
}

class DeleteRecipientsTransitionHandler extends TransitionHandler {
  override val transitions: List[ParticipationStateTransition] = List(new ParticipationStateTransition("RJ", "EX"), new ParticipationStateTransition("RV", "EX"))
  override def updateStream(sender: String, transition: ParticipationStateTransition, reportID: String, userIDs: List[String]): Unit = {

  }
  override def persistChanges(sender: String, transition: ParticipationStateTransition, reportID: String, userID: String, repositoryID: String): Unit = {
    val report: ReportInfo = mongoDataServices.getDocuments[ReportInfo](
      Map("id" -> reportID)
    ).headOption.getOrElse(
        throw new IllegalArgumentException("Report not found with id: " + reportID)
      )

    var reportSharings: Set[String] = report.reportSharings.getOrElse(Set[String]())

    val reportSharingsId = mongoDataServices.getDocuments[ReportInfoSharingRecipient](
      Map("userId" -> userID.toString, "reportId" -> reportID)
    ).headOption.getOrElse(throw new IllegalArgumentException("Report nor found with id: " + reportID)).id

    reportSharings = reportSharings.filterNot(r => r == reportSharingsId)

    mongoDataServices.removeDocuments[ReportInfoSharingRecipient](Map("userId" -> userID.toString, "reportId" -> reportID))
    val newReport = report.copy(
      reportSharings = Some(reportSharings)
    )
    mongoDataServices.updateDocument[ReportInfo](Map("id" -> reportID), newReport)
  }
}