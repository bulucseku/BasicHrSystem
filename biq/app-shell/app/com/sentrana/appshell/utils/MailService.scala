package com.sentrana.appshell.utils

import javax.mail.internet.InternetAddress

import com.sentrana.usermanagement.datacontract.UserInfoMin
import com.typesafe.plugin._
import play.Logger
import play.api.Play
import play.api.Play.current
import courier._
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.{ ExecutionContext, Future }

/**
 * Created by szhao on 4/15/2014.
 */
object MailService {
  def sendPasswordResetEmail(userMin: UserInfoMin, newPassword: String, applicationUrl: String): Boolean = {
    val subject = "UserMangement | Reset Password"
    val userName = userMin.userName
    val senderName = Play.current.configuration.getString("EmailSenderName").get
    val senderAddress = Play.current.configuration.getString("SupportEmail").get
    val receiverName = userMin.firstName.getOrElse("").trim()

    var messageBody = "<table width='100% !important' cellspacing='0' cellpadding='0' border='0' style=''>" +
      "<tr>" +
      "<td valign='bottom' align='left' style='padding-top:5px' >Hi " +
      "cid:receiverName, " +
      "</td><br/>" +
      "</tr>" +
      "<tr>" +
      "<td valign='bottom' align='left' style='padding-top:10px' >" +
      "Your password has been reset by the administrator." + "<br/><br/>" +
      "<b>Temp Password:</b> " + "cid:password" + "<br/><br/>" +
      "</tr>" +
      "<tr>" +
      "<td valign='bottom' align='left' style='padding-top:10px' >" +
      "Login using this password here: " + "cid:url" + "<br/><br/>" +
      "</tr>" +
      "<tr>" +
      "<td valign='bottom' align='left' style='padding-top:10px' > Thank You,<br/><br/>" +
      "cid:senderName" +
      "</td>" +
      "</tr>" +
      "</table>"

    messageBody = messageBody.replace("cid:receiverName", receiverName)
    messageBody = messageBody.replace("cid:password", newPassword)
    messageBody = messageBody.replace("cid:senderName", senderName)
    messageBody = messageBody.replace("cid:url", applicationUrl)

    sendHtmlFormattedEmail(subject, messageBody, senderName, receiverName, senderAddress, userMin.email)
  }

  def sendPasswordResetEmail(receiverName: String, email: String, newPassword: String, applicationUrl: String): Boolean = {
    val subject = "UserManagement | Reset Password"
    val senderName = Play.current.configuration.getString("EmailSenderName").get
    val senderAddress = Play.current.configuration.getString("SupportEmail").get

    var messageBody = "<html xmlns=\"http://www.w3.org/1999/xhtml\">" +
      "<body style=\"font-family: \"Tahoma\", \"Verdana\", \"Arial\", sans-serif; font-size: 0.9em; padding:2px; color: #666666;\">" +
      "<table style=\"width:100%; border-spacing:0px;\">" +
      "<tr>" +
      "<td><div style=\"color: #999999; font-style: italic; text-align:left;\">This is an automated email, please don't reply.</div> </td>" +
      "<td align=\"right\"><img src=\"http://sentrana.com/sites/default/files/sentrana_logo.png\"></td>" +
      "</tr>" +
      "</table>" +
      "<div style=\"float:left; color: #666666; \">" +
      "<p style=\"text-align:justify;\">Hi cid:receiverName,</p>" +
      "<p style=\"text-align:justify; padding-right:50px;\">Your password has been reset by the administrator.</p>" +
      "<b>Temp Password:</b>cid:password<br/>" +
      "<div style=\"font-size: 0.82em;width:100%;\">Login using this password <a href=\"cid:url\">here</a></div>" +
      "<p style=\"text-align:justify;\">Thank you, <br>" +
      "Sentrana Team </p>" +
      "<p style=\"text-align:justify;font-size: 0.79em;color: #666666;\">This email message is for the sole use of the intended recipient and may contain confidential and privileged information. Any unauthorized review, use disclosure or distribution is prohibited. If you are not the intended recipient, please contact Sentrana's System Administrator at sysadmin@sentrana.com and destroy all copies of the original message.</p>" +
      "</div>" +
      "</body>" +
      "</html>"

    messageBody = messageBody.replace("cid:receiverName", receiverName)
    messageBody = messageBody.replace("cid:password", newPassword)
    messageBody = messageBody.replace("cid:senderName", senderName)
    messageBody = messageBody.replace("cid:url", applicationUrl)

    sendHtmlFormattedEmail(subject, messageBody, senderName, receiverName, senderAddress, email)
  }

  def sendHtmlFormattedEmail(subject: String, messageBody: String, senderName: String, receiverName: String,
                             fromAddress: String, toAddress: String): Boolean = {
    try {
      // Get SMTP settings
      val host = Play.current.configuration.getString("smtp.host").getOrElse(throw new Exception())
      val port = Play.current.configuration.getInt("smtp.port").getOrElse(throw new Exception())
      val user = Play.current.configuration.getString("smtp.user").getOrElse(throw new Exception())
      val password = Play.current.configuration.getString("smtp.password").getOrElse(throw new Exception())
      // Create mailer instance
      val mailer = Mailer(host, port).auth(true).as(user, password).startTtls(true)()

      var mailStatus = true

      mailer(Envelope.from(new InternetAddress(s"$senderName <$fromAddress>"))
        .to(new InternetAddress(s"$receiverName <$toAddress>"))
        .subject(subject)
        .content(Multipart().html(messageBody))).onFailure {
        case _ =>
          Logger.error("Failed to send mail for user: " + toAddress)
          mailStatus = false
      }

      mailStatus

    }
    catch {
      case e: Throwable => {
        Logger.error("Failed to send mail for user: " + toAddress + ". The error is: " + e.getMessage)
        false
      }
    }
  }
}
