package com.sentrana.biq.controllers

import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.Cookie
import play.api.test.FakeRequest
import play.api.test.Helpers._

import org.joda.time.DateTime
import org.json4s.native.Serialization._
import org.scalatest.DoNotDiscover

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.biq.BIQServiceSpec
import com.sentrana.biq.datacontract._

/**
 * Created by szhao on 3/11/2015.
 */
@DoNotDiscover
class BookletSharingServiceSpec extends BIQServiceSpec {
  var sessionId = ""
  "login" in {
    sessionId = loginUser("sentrana", "monday1")
  }

  var reportId: String = ""

  "add a report to testRepo" in {
    val reportInfo = ReportInfo(
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

    val response = route(
      FakeRequest(
        POST, s"$applicationContext/SqlGen.svc/Report"
      ).withHeaders("RepositoryID" -> "testRepo")
        .withCookies(Cookie("sessionId", sessionId)),
      Json.parse(write(reportInfo))
    ).get
    status(response) mustBe OK
    val report = read[ReportInfo](contentAsString(response))
    reportId = report.id.getOrElse("")
  }

  var bookletId: String = ""

  "add a booklet to testRepo" in {
    val reportInfoPosted: ReportInfoPosted = ReportInfoPosted(
      name  = "Test Report",
      id    = reportId,
      order = 0
    )

    val bookletInfoPosted: BookletInfoPosted = BookletInfoPosted(
      name    = "Test Booklet",
      reports = Seq(reportInfoPosted)
    )

    val response = route(
      FakeRequest(
        POST, s"$applicationContext/SqlGen.svc/Booklet"
      ).withHeaders("RepositoryID" -> "testRepo")
        .withCookies(Cookie("sessionId", sessionId)),
      Json.parse(write(bookletInfoPosted))
    ).get
    status(response) mustBe OK
    val booklet = read[BookletInfoReturn](contentAsString(response))
    bookletId = booklet.id.getOrElse("")
  }

  "Add recipient to a booklet for testRepo repository" should {
    "Add a recipient to the booklet" in {
      val sharingModificationRequest: SharingModificationRequest = new SharingModificationRequest(
        recips     = Seq(new RecipientInfo(
          userID     = "27",
          partStatus = "AC"
        )),
        emailInfos = Some(Seq[EmailNotificationInfo]())
      )
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/BookletRecipients/${bookletId}"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(sharingModificationRequest))
      ).get
      status(response) mustBe OK
    }

  }

  "Logout as Sentrana after Adding a Recipient" should {
    "logout" in {
      logoutUser
    }
  }

  "Login as Sheng to Check if He Has Recieved a Booklet" should {
    "login" in {
      loginUser("szhao", "sentrana")
    }
  }

  "Get Sharing Update for Sheng to Check if He Has Recieved a Booklet" should {
    "get sharing update" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/GetSharingUpdate/27"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
      val sharingInfos = read[List[SharingInfo]](contentAsString(response))
      for (el <- sharingInfos) {
        el.objectId mustBe bookletId
        el.objectType mustBe "BOOKLET"
        el.changeType mustBe "AC"
        el.repository mustBe "testRepo"
      }
    }
  }

  "Clear SharingInfo Cache for Sheng after He Has Recieved a Booklet" should {
    "clear sharinginfo cache" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/ClearSharingInfoCache/27"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
    }
  }

  "Logout as Sheng after Checking He Has Recieved a Booklet" should {
    "logout" in {
      logoutUser
    }
  }

  "Login as Sentrana to Revoke Access from Sheng" should {
    "login" in {
      sessionId = loginUser("sentrana", "monday1")
    }
  }

  "Modify recipient to the booklet for testRepo repository" should {
    "Revoke a recipient to the booklet" in {
      val sharingModificationRequest: SharingModificationRequest = new SharingModificationRequest(
        recips     = Seq(new RecipientInfo(
          userID     = "27",
          partStatus = "RV"
        )),
        emailInfos = Some(Seq[EmailNotificationInfo]())
      )
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/BookletRecipients/${bookletId}"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(sharingModificationRequest))
      ).get
      status(response) mustBe OK
    }

  }

  "Logout as Sentrana after Revoking Access from Sheng" should {
    "logout" in {
      logoutUser
    }
  }

  "Login as Sheng to Check if Access has been Revoked" should {
    "login" in {
      loginUser("szhao", "sentrana")
    }
  }

  "Get Sharing Update for Sheng to Check if Access has been Revoked" should {
    "get sharing update" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/GetSharingUpdate/27"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
      val sharingInfos = read[List[SharingInfo]](contentAsString(response))
      for (el <- sharingInfos) {
        el.objectId mustBe bookletId
        el.objectType mustBe "BOOKLET"
        el.changeType mustBe "RV"
        el.repository mustBe "testRepo"
      }
    }
  }

  "Clear SharingInfo Cache for Sheng after His Access has been Revoked" should {
    "clear sharinginfo cache" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/ClearSharingInfoCache/27"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
    }
  }

  "Logout as Sheng after Checking that Access has been Revoked" should {
    "logout" in {
      logoutUser
    }
  }

  "Login as Sentrana to Unshare" should {
    "login" in {
      sessionId = loginUser("sentrana", "monday1")
    }
  }

  "Unshare the report from all the recipients for repository testRepo" should {
    "unshare" in {
      val response = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/BookletRecipients/${bookletId}"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
    }
  }

  "Logout as Sentrana after Unsharing" should {
    "logout" in {
      logoutUser
    }
  }

  "Login as Sheng to Check Booklet has been Unshared" should {
    "login" in {
      loginUser("szhao", "sentrana")
    }
  }

  "Get Sharing Update for Sheng to Check Booklet has been Unshared" should {
    "get sharing update" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/GetSharingUpdate/27"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
      val sharingInfos = read[List[SharingInfo]](contentAsString(response))
      for (el <- sharingInfos) {
        el.objectId mustBe bookletId
        el.objectType mustBe "BOOKLET"
        el.changeType mustBe "RV"
        el.repository mustBe "testRepo"
      }
    }
  }

  "Clear SharingInfo Cache for Sheng after the Booklet has been Unshared" should {
    "clear sharinginfo cache" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/ClearSharingInfoCache/27"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
    }
  }

  "Logout as Sheng after Checking that the Booklet has been Unshared" should {
    "logout" in {
      logoutUser
    }
  }

  "Login as Sentrana to Delete the Booklet" should {
    "login" in {
      sessionId = loginUser("sentrana", "monday1")
    }
  }

  "Delete booklet from repository testRepo" should {
    "Delete the right booklet" in {
      val responseDelete = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/Booklet/$bookletId"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(responseDelete) mustBe OK
    }
  }

  "logout" in {
    logoutUser
  }

  def loginUser(userName: String, password: String): String = {
    val userInfo: JsValue = Json.parse(s"""{"userName": "$userName", "password": "$password"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  def logoutUser: Unit = {
    val response = route(
      FakeRequest(
        GET, s"$applicationContext/SecurityService.svc/logout"
      ).withHeaders("RepositoryID" -> "testRepo")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    status(response) mustBe OK
  }
}
