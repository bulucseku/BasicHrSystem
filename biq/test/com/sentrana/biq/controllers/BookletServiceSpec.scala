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
import com.sentrana.biq.datacontract.{ BookletInfo, ReportInfo }
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.biq.exceptions.BookletNameAlreadyInUseException

/**
 * Created by Shamir on 3/11/2015.
 */
@DoNotDiscover
class BookletServiceSpec extends BIQServiceSpec {
  lazy val mongoDataServices = BIQDataServices()
  var sessionId = ""
  var regularUserSessionId = ""

  "login" in {
    val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  "login with regular user" in {
    val userInfo: JsValue = Json.parse("""{"userName": "biq", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    regularUserSessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  var reportId: String = ""
  var newReportId: String = ""

  "add reports" in {
    reportId = createReportObject("Test Report")
    newReportId = createReportObject("New Test Report")
  }

  var bookletId: String = ""
  var copyBookletId: String = ""

  "BookletService.addBooklet" should {
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
      booklet.name mustBe "Test Booklet"
      booklet.numberOfReports mustBe 1
    }
  }

  "BookletService.copyBooklet" should {

    "copy a booklet from farmland" in {
      val reportInfoPosted: ReportInfoPosted = ReportInfoPosted(
        name  = "Test Report",
        id    = reportId,
        order = 0
      )
      val copyBookletInfoPosted: BookletInfoPosted = BookletInfoPosted(
        name    = "Copy Test Booklet",
        reports = Seq(reportInfoPosted)
      )
      val response = route(
        FakeRequest(
          POST, s"$applicationContext/SqlGen.svc/Booklet/${bookletId}"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(copyBookletInfoPosted))
      ).get

      status(response) mustBe OK
      val booklet = read[BookletInfoReturn](contentAsString(response))
      copyBookletId = booklet.id.getOrElse("")
      booklet.name mustBe "Copy Test Booklet"
      booklet.numberOfReports mustBe 1
    }

    "Fail to copy a booklet if the user does not have accecss to the booklet" in {
      val reportInfoPosted: ReportInfoPosted = ReportInfoPosted(
        name  = "Test Report",
        id    = reportId,
        order = 0
      )
      val copyBookletInfoPosted: BookletInfoPosted = BookletInfoPosted(
        name    = "Copy Test Booklet",
        reports = Seq(reportInfoPosted)
      )
      val response = route(
        FakeRequest(
          POST, s"$applicationContext/SqlGen.svc/Booklet/${bookletId}"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", regularUserSessionId)),
        Json.parse(write(copyBookletInfoPosted))
      ).get

      status(response) mustBe UNAUTHORIZED
    }
  }

  "BookletService.editBooklet" should {

    lazy val reportInfoPosted: ReportInfoPosted = ReportInfoPosted(
      name  = "Test Report",
      id    = reportId,
      order = 0
    )

    lazy val newReportInfoPosted: ReportInfoPosted = ReportInfoPosted(
      name  = "New Test Report",
      id    = newReportId,
      order = 1
    )

    lazy val editBookletInfoPosted: BookletInfoPosted = BookletInfoPosted(
      name    = "Test Booklet",
      reports = Seq(reportInfoPosted, newReportInfoPosted)
    )

    "edit a booklet from farmland" in {
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/Booklet/${bookletId}"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(editBookletInfoPosted))
      ).get

      status(response) mustBe OK
      val booklet = read[BookletInfoReturn](contentAsString(response))
      booklet.name mustBe "Test Booklet"
      booklet.numberOfReports mustBe 2
    }

    "fail to edit a booklet if the user does not have access to the booklet" in {
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/Booklet/${bookletId}"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", regularUserSessionId)),
        Json.parse(write(editBookletInfoPosted))
      ).get

      status(response) mustBe UNAUTHORIZED
    }
  }

  "BookletService.getBooklets" should {
    "get two booklet in farmland" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/Booklets"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
      val booklets = read[List[BookletInfo]](contentAsString(response))
      booklets.size mustBe 2
      val firstBooklet = booklets.find(_.name == "Copy Test Booklet").get
      firstBooklet.name mustBe "Copy Test Booklet"
      firstBooklet.numberOfReports mustBe 1
      val secondBooklet = booklets.find(_.name == "Test Booklet").get
      secondBooklet.name mustBe "Test Booklet"
      secondBooklet.numberOfReports mustBe 2
    }
  }

  "BookletService.getReports" should {
    "get reports from booklet" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/Reports/${bookletId}"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
      val reports = read[List[ReportInfo]](contentAsString(response))
      val firstReport = reports(0)
      firstReport.name mustBe "Test Report"
      val secondReport = reports(1)
      secondReport.name mustBe "New Test Report"
    }
  }

  "BookletService.ConvertBookletInfoToBookletPersistenceObject" should {
    "get new boolet given an existing booklet" in {
      val reportInfoPosted: ReportInfoPosted = ReportInfoPosted(
        name  = "Test Report",
        id    = reportId,
        order = 0
      )

      val newReportInfoPosted: ReportInfoPosted = ReportInfoPosted(
        name  = "New Test Report",
        id    = newReportId,
        order = 1
      )

      val bookletInfoPosted: BookletInfoPosted = BookletInfoPosted(
        name    = "Test Booklet",
        reports = Seq(reportInfoPosted, newReportInfoPosted)
      )
      val bookletInfo: BookletInfo = getBooklet
      val newBookletInfo: BookletInfo = BookletService.ConvertBookletInfoToBookletPersistenceObject(bookletInfoPosted, "1", "sentrana", "farmland", Some(bookletInfo))

      newBookletInfo.name mustBe "Test Booklet"
      newBookletInfo.id mustBe Some(bookletId)
      newBookletInfo.numberOfReports mustBe 2
    }
  }

  "BookletService.bookletNameInUse" should {
    "check if booklet name is in use or not" in {
      intercept[BookletNameAlreadyInUseException] {
        BookletService.bookletNameInUse("Test Booklet", "1", "farmland")
      }
    }
  }

  "BookletService.deleteBooklet" should {
    "fail to delete a booklet if the user does not have access to id" in {
      val response = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/Booklet/${bookletId}"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", regularUserSessionId))
      ).get
      status(response) mustBe UNAUTHORIZED
    }

    "delete a booklet from farmland" in {
      val response = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/Booklet/${bookletId}"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
    }
  }

  "delete copy of a booklet from farmland" in {
    val response = route(
      FakeRequest(
        DELETE, s"$applicationContext/SqlGen.svc/Booklet/${copyBookletId}"
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    status(response) mustBe OK
  }

  "delete the report" in {
    val responseDelete = route(
      FakeRequest(
        DELETE, s"$applicationContext/SqlGen.svc/Report/${reportId}"
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    status(responseDelete) mustBe OK
  }

  "delete the new report" in {
    val responseDelete = route(
      FakeRequest(
        DELETE, s"$applicationContext/SqlGen.svc/Report/${newReportId}"
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    status(responseDelete) mustBe OK
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

  def createReportObject(reportName: String): String = {

    val reportInfo: ReportInfo = ReportInfo(
      name           = reportName,
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

    val response = route(
      FakeRequest(
        POST, s"$applicationContext/SqlGen.svc/Report"
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId)),
      Json.parse(write(reportInfo))
    ).get

    val currentReportInfo: ReportInfo = read[ReportInfo](contentAsString(response))
    currentReportInfo.id.getOrElse("")
  }

  def getBooklet = {
    val bookletInfo: BookletInfo = mongoDataServices.getDocuments[BookletInfo](Map("id" -> bookletId)).head
    bookletInfo
  }
}
