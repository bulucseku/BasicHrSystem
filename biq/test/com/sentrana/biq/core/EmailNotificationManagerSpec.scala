package com.sentrana.biq.core

import org.joda.time.DateTime
import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp

import com.sentrana.biq.UnitSpec
import com.sentrana.biq.datacontract.{ EmailNotificationInfo, ReportInfo }

/**
 * Created by Shamir on 3/11/2015.
 */
@DoNotDiscover
class EmailNotificationManagerSpec extends UnitSpec with ConfiguredApp {
  val reportInfo: ReportInfo = ReportInfo(
    name           = "Test Report",
    id             = None,
    dataSource     = Some("testRepo"),
    version        = None,
    createDate     = Some(DateTime.now().getMillis),
    createUser     = Some("Sentrana User"),
    createUserId   = Some("1"),
    lastModUser    = Some("Sentrana User"),
    lastModDate    = Some(DateTime.now().getMillis),
    definition     = null,
    chartOptions   = null,
    showGrid       = true,
    showChart      = true,
    chartType      = None,
    comments       = None,
    shared         = None,
    order          = None,
    bookletId      = None,
    resultOptions  = None,
    reportSharings = None
  )

  val sendingUserId: String = "1"
  val fromAddress: String = "fromAddress@test.com"
  val toAddress: String = "toAddress@test.com"
  val senderName: String = "test sender"
  val recieverName: String = "test reciever"

  val emailNotificationInfo: EmailNotificationInfo = EmailNotificationInfo("AC", "RV", "Application Test", "THIS IS JUST A TEST")

  val participationStateTransition: ParticipationStateTransition = ParticipationStateTransition("AC", "RV")

  "EmailNotificationManagerSpec.hasEntry" should {
    "check if EmailNotificationManager has entry" in {
      val emailNotificationManager: EmailNotificationManager = new EmailNotificationManager(Seq(emailNotificationInfo), "testRepo", Some(reportInfo), None, "")
      val value: Boolean = emailNotificationManager.hasEntry(participationStateTransition)
      value mustBe true
    }
  }

  "EmailNotificationManagerSpec.sendEmail" should {
    "send email with EmailNotificationManager" in {
      val emailNotificationManager: EmailNotificationManager = new EmailNotificationManager(Seq(emailNotificationInfo), "testRepo", Some(reportInfo), None, "")
      emailNotificationManager.sendEmail(sendingUserId, participationStateTransition, List[String]())
    }
  }

  "EmailNotificationManagerSpec.sendHtmlFormattedEmail" should {
    "send htmlFormatted email with EmailNotificationManager" in {
      val emailNotificationManager: EmailNotificationManager = new EmailNotificationManager(Seq(emailNotificationInfo), "testRepo", Some(reportInfo), None, "")
      val value: Boolean = emailNotificationManager.sendHtmlFormattedEmail("Application Test", "THIS IS JUST A TEST", senderName, recieverName, fromAddress, toAddress)
      value mustBe true
    }
  }
}
