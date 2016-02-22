package com.sentrana.biq.core

import org.joda.time.DateTime
import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp

import com.sentrana.biq.UnitSpec
import com.sentrana.biq.datacontract.{ BookletInfo, EmailNotificationInfo }

/**
 * Created by Shamir on 3/11/2015.
 */
@DoNotDiscover
class BookletEmailNotificationManagerSpec extends UnitSpec with ConfiguredApp {
  val bookletInfo: BookletInfo = BookletInfo(
    id              = None,
    name            = "Test Booklet",
    dataSource      = "testRepo",
    version         = Some(0),
    createDate      = DateTime.now().getMillis,
    createUser      = "Sentrana User",
    createUserId    = "1",
    lastModUser     = "Sentrana User",
    lastModDate     = DateTime.now().getMillis,
    numberOfReports = 0,
    reports         = null,
    comments        = None,
    shared          = None,
    filterUnitIds   = None,
    bookletSharings = None
  )

  val emailNotificationInfo: EmailNotificationInfo = EmailNotificationInfo("AC", "RV", "Application Test", "THIS IS JUST A TEST")

  val participationStateTransition: ParticipationStateTransition = ParticipationStateTransition("AC", "RV")

  val sendingUserId: String = "1"
  val fromAddress: String = "fromAddress@test.com"
  val toAddress: String = "toAddress@test.com"
  val senderName: String = "test sender"
  val recieverName: String = "test receiver"

  "BookletEmailNotificationManagerSpec.hasEntry" should {
    "check if BookletEmailNotificationManager has entry" in {
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(emailNotificationInfo), "testRepo", bookletInfo, "")
      val value: Boolean = bookletEmailNotificationManager.hasEntry(participationStateTransition)
      value mustBe true
    }
  }

  "BookletEmailNotificationManagerSpec.sendEmail" should {
    "send email with BookletEmailNotificationManager" in {
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(emailNotificationInfo), "testRepo", bookletInfo, "")
      bookletEmailNotificationManager.sendEmail(sendingUserId, participationStateTransition, List[String]())
    }
  }

  "BookletEmailNotificationManagerSpec.sendHtmlFormattedEmail" should {
    "send htmlFormatted email with BookletEmailNotificationManager" in {
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(emailNotificationInfo), "testRepo", bookletInfo, "")
      val value: Boolean = bookletEmailNotificationManager.sendHtmlFormattedEmail("Application Test", "THIS IS JUST A TEST", senderName, recieverName, fromAddress, toAddress)
      value mustBe true
    }
  }
}
