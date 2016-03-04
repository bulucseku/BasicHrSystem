package com.sentrana.biq.core

import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.Cookie
import play.api.test.FakeRequest
import play.api.test.Helpers._

import org.joda.time.DateTime
import org.json4s.native.Serialization._
import org.scalatest.DoNotDiscover

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.biq.BIQServiceSpec
import com.sentrana.biq.controllers.{ BookletInfoPosted, BookletInfoReturn, ReportInfoPosted }
import com.sentrana.biq.datacontract.{ BookletInfo, EmailNotificationInfo, RecipientInfo, ReportInfo }
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.usermanagement.domain.document.{ UMDataServices, User }

/**
 * Created by Shamir on 3/11/2015.
 */
@DoNotDiscover
class BookletRecipientManagerSpec extends BIQServiceSpec {
  val reportInfo: ReportInfo = ReportInfo(
    name           = "Test Report",
    id             = None,
    dataSource     = Some("farmland"),
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

  val user1 = User(
    id                  = UMDataServices.getObjectId,
    userName            = "testUser1",
    password            = "password",
    email               = "testUser1@sentrana.com",
    firstName           = "Test",
    lastName            = "User1",
    status              = Some("A"),
    isDeleted           = Some(false),
    dataFilterInstances = Seq(),
    appRoles            = Seq(),
    userGroupIds        = Seq(),
    organizationId      = "1"
  )

  var reportId: String = ""

  val recipientInfoPrevState: RecipientInfo = RecipientInfo(user1.id, null)
  val recipientInfoNextState: RecipientInfo = RecipientInfo(user1.id, "AC")

  val participationStateChangeManager: ParticipationStateChangeManager = new ParticipationStateChangeManager
  participationStateChangeManager.recordOriginal(recipientInfoPrevState)
  participationStateChangeManager.recordNew(recipientInfoNextState)

  val emailNotificationInfo: EmailNotificationInfo = EmailNotificationInfo(null, "AC", "Application Test", "THIS IS JUST A TEST")

  var bookletId: String = ""
  lazy val mongoDataServices = BIQDataServices()
  var sessionId = ""
  "login" in {
    val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  "setup" in {
    val org = UMDataServices.getOrganizationById("1")
    val newOrg = org.copy(users = org.users :+ user1)
    UMDataServices.updateOrganization(newOrg)
  }

  "Add report for repository farmland" should {
    "Add a record in persistence store" in {
      val response = route(
        FakeRequest(
          POST, s"$applicationContext/SqlGen.svc/Report"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(reportInfo))
      ).get
      status(response) mustBe OK
      val currentReportInfo = read[ReportInfo](contentAsString(response))
      reportId = currentReportInfo.id.getOrElse("")
    }
  }

  "add a booklet to farmland" in {
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
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId)),
      Json.parse(write(bookletInfoPosted))
    ).get
    status(response) mustBe OK
    val booklet = read[BookletInfoReturn](contentAsString(response))
    bookletId = booklet.id.getOrElse("")
  }

  "BookletRecipientManagerSpec.handleAllTransitions" should {
    "should handle all transition for a BookletRecipientManager" in {
      val bookletInfo: BookletInfo = getBooklet
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(emailNotificationInfo), "farmland", bookletInfo, "")
      BookletRecipientManager.handleAllTransitions("1", bookletId, participationStateChangeManager, bookletEmailNotificationManager, "farmland")
    }
  }

  "Delete booklet from repository farmland" should {
    "Delete the right booklet" in {
      val responseDelete = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/Booklet/$bookletId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(responseDelete) mustBe OK
    }
  }

  "Delete report from repository farmland" should {
    "Delete the right record" in {
      val responseDelete = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/Report/$reportId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(responseDelete) mustBe OK
    }
  }

  "logout" in {
    val response = route(
      FakeRequest(
        GET, s"$applicationContext/SecurityService.svc/logout"
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    status(response) mustBe OK
  }

  def getBooklet = {
    val bookletInfo: BookletInfo = mongoDataServices.getDocuments[BookletInfo](Map("id" -> bookletId)).head
    bookletInfo
  }
}