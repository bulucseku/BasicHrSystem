package com.sentrana.biq.core

import _root_.com.sentrana.usermanagement.domain.document.UMDataServices
import _root_.com.typesafe.plugin._
import com.sentrana.biq.datacontract._
import play.Logger
import play.api.Play
import play.api.Play.current

class EmailNotificationManager(
    enInfos:        Seq[EmailNotificationInfo],
    repository:     String,
    reportInfo:     Option[ReportInfo],
    bookletInfo:    Option[BookletInfo]        = None,
    applicationUrl: String
) {

  var emailPartsMap: Map[ParticipationStateTransition, EmailParts] = Map[ParticipationStateTransition, EmailParts]()
  val (objectType, objectName) = reportInfo match {
    case None => ("", "")
    case Some(report) =>
      for (el <- enInfos) {
        val subject: String = if (el.subject != null && el.subject != "") el.subject else s"Report Routing: ${report.name}"
        emailPartsMap = emailPartsMap ++ Map(new ParticipationStateTransition(el.fromStatus, el.toStatus) -> new EmailParts(subject, el.body))
      }
      ("report", report.name)
  }

  def hasEntry(transition: ParticipationStateTransition): Boolean = {
    emailPartsMap.contains(transition)
  }

  def sendEmail(sendingUser: String, transition: ParticipationStateTransition, userIDs: List[String]): Unit = {
    val emailParts: EmailParts = emailPartsMap(transition)
    val subject = emailParts.Subject
    val messageBody = emailParts.Body
    val senderName = Play.current.configuration.getString("EmailSenderName").getOrElse("")
    val senderAddress = Play.current.configuration.getString("SupportEmail").getOrElse("")

    val sharingUser = UMDataServices.getUser("id", sendingUser)

    val mailRecipients = userIDs.map(userId => {
      val recipient = UMDataServices.getUser("id", userId)
      new MailRecipient(recipient.firstName, recipient.firstName + " " + recipient.lastName, recipient.email)
    })

    mailRecipients.foreach(recipient => {
      val message = getMailBodyFromTemplate(objectType, transition, sharingUser.firstName, sharingUser.firstName + " " + sharingUser.lastName, recipient.firstName, objectName, repository, messageBody)
      sendHtmlFormattedEmail(subject, message, senderName, recipient.fullName, senderAddress, recipient.email)
    })
  }

  def getMailBodyFromTemplate(objectType: String, transition: ParticipationStateTransition, senderFirstName: String, sender: String, receiver: String, reportName: String, repositoryName: String, messageBody: String): String = {
    if (transition.fromState == null && transition.toState == "AC") {
      views.html.emailTemplates.Sharing_Null_AC(objectType, senderFirstName, sender, receiver, reportName, repositoryName, messageBody, applicationUrl).toString()
    }
    else if (transition.fromState == "RV" && transition.toState == "AC") {
      views.html.emailTemplates.Sharing_RV_AC(objectType, senderFirstName, sender, receiver, reportName, repositoryName, messageBody, applicationUrl).toString()
    }
    else if (transition.fromState == "AC" && transition.toState == "RV") {
      views.html.emailTemplates.Sharing_AC_RV(objectType, senderFirstName, sender, receiver, reportName, repositoryName, messageBody, applicationUrl.split("/#")(0)).toString()
    }
    else {
      throw new IllegalArgumentException("Invalid sharing status")
    }
  }

  def sendHtmlFormattedEmail(subject: String, messageBody: String, senderName: String, receiverName: String,
                             fromAddress: String, toAddress: String): Boolean = {
    try {
      val mail = use[MailerPlugin].email
      mail.setSubject(subject)
      mail.setRecipient(s"$receiverName <$toAddress>")
      mail.setFrom(s"$senderName <$fromAddress>")
      // add attachment

      //sends html
      mail.sendHtml(messageBody)

      Logger.debug("Mail sent successfully for user: " + toAddress)
      true
    }
    catch {
      case e: Throwable => {
        Logger.error("Failed to send mail for user: " + toAddress + ". The error is: " + e.getMessage)
        false
      }
    }
  }
}

case class EmailParts(
  var Subject: String = "",
  var Body:    String = ""
)

case class MailRecipient(
  firstName: String,
  fullName:  String,
  email:     String
)
