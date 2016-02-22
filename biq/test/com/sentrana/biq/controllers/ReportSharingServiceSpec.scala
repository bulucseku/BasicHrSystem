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
import com.sentrana.biq.exceptions.UnauthorizedReportAccessException

/**
 * Created by Shamir on 3/11/2015.
 */
@DoNotDiscover
class ReportSharingServiceSpec extends BIQServiceSpec {
  var sessionId = ""
  "login as sentrana to add a report" in {
    sessionId = loginUser("sentrana", "monday1")
  }

  var reportId: String = ""
  var newReportId: String = ""

  "Add report for repository testRepo" should {
    "Add a record in persistence store" in {
      System.out.println(s"$applicationContext/SqlGen.svc/Report/$reportId")
      val newReportRequest = ReportInfo(
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
        Json.parse(write(newReportRequest))
      ).get
      status(response) mustBe OK
      val report = read[ReportInfo](contentAsString(response))
      reportId = report.id.getOrElse("")
    }
  }

  "Get AvailableRecipients for a Report" should {
    "get available reciepients" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/Users?recipientsFor=${reportId}&repositoryid=farmland"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
    }
  }

  "Add recipient to a report for testRepo repository" should {
    "Add a recipient to the report" in {
      val sharingModificationRequest: SharingModificationRequest = new SharingModificationRequest(
        recips     = Seq(new RecipientInfo(
          userID     = "27",
          partStatus = "AC"
        )),
        emailInfos = Some(Seq[EmailNotificationInfo]())
      )
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/ReportRecipients/${reportId}"
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

  "Login as Sheng to Check if He Has Recieved a Report" should {
    "login" in {
      sessionId = loginUser("szhao", "sentrana")
    }
  }

  "Get Sharing Update for Sheng to Check if He Has Recieved a Report" should {
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
        el.objectId mustBe reportId
        el.objectType mustBe "REPORT"
        el.changeType mustBe "AC"
        el.repository mustBe "testRepo"
      }
    }
  }

  "Clear SharingInfo Cache for Sheng after He Has Recieved a Report" should {
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

  "Logout as Sheng after Checking He Has Recieved a Report" should {
    "logout" in {
      logoutUser
    }
  }

  "Login as Sentrana to Revoke Access from Sheng" should {
    "login" in {
      sessionId = loginUser("sentrana", "monday1")
    }
  }

  "Modify recipient to the report for testRepo repository" should {
    "Revoke a recipient to the report" in {
      val sharingModificationRequest: SharingModificationRequest = new SharingModificationRequest(
        recips     = Seq(new RecipientInfo(
          userID     = "27",
          partStatus = "RV"
        )),
        emailInfos = Some(Seq[EmailNotificationInfo]())
      )
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/ReportRecipients/$reportId"
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
      sessionId = loginUser("szhao", "sentrana")
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
        el.objectId mustBe reportId
        el.objectType mustBe "REPORT"
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
          DELETE, s"$applicationContext/SqlGen.svc/ReportRecipients/${reportId}"
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

  "Login as Sheng to Check Report has been Unshared" should {
    "login" in {
      sessionId = loginUser("szhao", "sentrana")
    }
  }

  "Get Sharing Update for Sheng to Check Report has been Unshared" should {
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
        el.objectId mustBe reportId
        el.objectType mustBe "REPORT"
        el.changeType mustBe "RV"
        el.repository mustBe "testRepo"
      }
    }
  }

  "Clear SharingInfo Cache for Sheng after the Report has been Unshared" should {
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

  "Logout as Sheng after Checking that the Report has been Unshared" should {
    "logout" in {
      logoutUser
    }
  }

  "Login as Sentrana to Delete the Report" should {
    "login" in {
      sessionId = loginUser("sentrana", "monday1")
    }
  }

  "Delete report from repository testRepo" should {
    "Delete the right record" in {
      val responseDelete = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/Report/$reportId"
        ).withHeaders("RepositoryID" -> "testRepo")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(responseDelete) mustBe OK
    }
  }

  "Logout as Sentrana after Deleting the Report has been Unshared" should {
    "logout" in {
      logoutUser
    }
  }

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

  val newReportInfo: ReportInfo = ReportInfo(
    name           = "New Test Report",
    id             = None,
    dataSource     = Some("testRepo"),
    version        = None,
    createDate     = Some(DateTime.now().getMillis),
    createUser     = Some("Sheng Bastian"),
    createUserId   = Some("27"),
    lastModUser    = Some("Sheng Bastian"),
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

  "login as sentrana to add a report to check getReportForUserIfAccessible" in {
    sessionId = loginUser("sentrana", "monday1")
  }

  "add a report as sentrana" in {
    val response = route(
      FakeRequest(
        POST, s"$applicationContext/SqlGen.svc/Report"
      ).withHeaders("RepositoryID" -> "testRepo")
        .withCookies(Cookie("sessionId", sessionId)),
      Json.parse(write(reportInfo))
    ).get
    status(response) mustBe OK
    val currentReportInfo = read[ReportInfo](contentAsString(response))
    reportId = currentReportInfo.id.getOrElse("")
  }

  "logout as sentrana after adding a report" in {
    logoutUser
  }

  "login" in {
    sessionId = loginUser("szhao", "sentrana")
  }

  "ReportSharingService.getReportForUserIfAccessible" should {
    "should get an exception because user has no access" in {
      intercept[UnauthorizedReportAccessException] {
        ReportSharingService.getReportForUserIfAccessible(reportId, "27")
      }
    }
  }

  "add a report as szhao" in {
    val response = route(
      FakeRequest(
        POST, s"$applicationContext/SqlGen.svc/Report"
      ).withHeaders("RepositoryID" -> "testRepo")
        .withCookies(Cookie("sessionId", sessionId)),
      Json.parse(write(newReportInfo))
    ).get
    status(response) mustBe OK
    val currentReportInfo = read[ReportInfo](contentAsString(response))
    newReportId = currentReportInfo.id.getOrElse("")
  }

  "ReportSharingService.getReportForUserIfAccessible" should {
    "should get the report" in {
      val reportInfo = ReportSharingService.getReportForUserIfAccessible(newReportId, "27")

      reportInfo.id mustBe Some(newReportId)
      reportInfo.name mustBe "New Test Report"
    }
  }

  "Delete the right report after testing" in {
    val responseDelete = route(
      FakeRequest(
        DELETE, s"$applicationContext/SqlGen.svc/Report/$newReportId"
      ).withHeaders("RepositoryID" -> "testRepo")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    status(responseDelete) mustBe OK
  }

  "logout as szhao" in {
    logoutUser
  }

  "login as sentrana to delete a report" in {
    sessionId = loginUser("sentrana", "monday1")
  }

  "Delete the report as sentrana" in {
    val responseDelete = route(
      FakeRequest(
        DELETE, s"$applicationContext/SqlGen.svc/Report/$reportId"
      ).withHeaders("RepositoryID" -> "testRepo")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    status(responseDelete) mustBe OK
  }

  "logout as sentrana after deleting the report" in {
    logoutUser
  }

  def getReport = {
    val response = route(
      FakeRequest(
        GET, s"$applicationContext/SqlGen.svc/Report/$reportId"
      ).withHeaders("RepositoryID" -> "testRepo")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    read[ReportInfo](contentAsString(response))
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
