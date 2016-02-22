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
import com.sentrana.biq.datacontract.{ CommentInfo, CommentStreamInfo, ReportInfo }
import com.sentrana.usermanagement.datacontract.ResponseMessage

/**
 * Created by szhao on 3/11/2015.
 */
@DoNotDiscover
class ReportServiceSpec extends BIQServiceSpec {
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
  var commentId: String = ""

  "Add report for repository farmland" should {
    "Add a record in persistence store" in {
      val newReportRequest = ReportInfo(
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

      val response = route(
        FakeRequest(
          POST, s"$applicationContext/SqlGen.svc/Report"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(newReportRequest))
      ).get
      status(response) mustBe OK
      val report = read[ReportInfo](contentAsString(response))
      reportId = report.id.getOrElse("")
    }
  }

  "Read report for repository farmland" should {
    "Return the right record" in {
      val reportJustAdded = getReport
      reportJustAdded.id mustBe Some(reportId)
      reportJustAdded.dataSource mustBe Some("farmland")
    }
  }

  "Update report for repository farmland" should {

    lazy val updatedReportRequest = ReportInfo(
      name           = "Test Report Updated",
      id             = Some(reportId),
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

    "Update data store record" in {
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/Report/$reportId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(updatedReportRequest))
      ).get
      status(response) mustBe OK

      val reportJustUpdated = getReport
      reportJustUpdated.name mustBe "Test Report Updated"
    }

    "Fail to update a report when the user didn't create it" in {
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/Report/$reportId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", regularUserSessionId)),
        Json.parse(write(updatedReportRequest))
      ).get
      status(response) mustBe UNAUTHORIZED
    }
  }

  // Comment related test cases

  "Add report comment for repository farmland" should {
    "Add a record in persistence store" in {
      val newCommentInfo = CommentInfo(
        userName = None,
        userId   = None,
        date     = None,
        msg      = "Test Comment",
        cid      = None,
        editable = None
      )

      val response = route(
        FakeRequest(
          POST, s"$applicationContext/SqlGen.svc/ReportComment/$reportId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(newCommentInfo))
      ).get
      status(response) mustBe OK
      val comment = read[CommentInfo](contentAsString(response))
      commentId = comment.cid.getOrElse("")
    }
  }

  "Read report comment for repository farmland" should {
    "Return the right record" in {
      val commentJustAdded = getComment
      commentJustAdded.cid mustBe Some(commentId)
      commentJustAdded.userName mustBe Some("Sentrana User")
    }
  }

  "Update comment for repository farmland" should {
    lazy val updatedCommentInfo = CommentInfo(
      userName = Some("Sheng Zhao"),
      userId   = Some("1"),
      date     = None,
      msg      = "Test Comment Update",
      cid      = Some(commentId),
      editable = None
    )

    "Update data store record" in {
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/ReportComment/$reportId/$commentId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(updatedCommentInfo))
      ).get
      status(response) mustBe OK

      val commentJustUpdated = getComment
      commentJustUpdated.msg mustBe "Test Comment Update"
    }

    "Fail to update a report comment when the user is not the creator" in {
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/ReportComment/$reportId/$commentId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", regularUserSessionId)),
        Json.parse(write(updatedCommentInfo))
      ).get
      status(response) mustBe UNAUTHORIZED
    }
  }

  "Delete comment from report in repository farmland" should {
    "Fail to delete a comment when the user didnt create it" in {
      val responseDelete = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/ReportComment/$reportId/$commentId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", regularUserSessionId))
      ).get
      status(responseDelete) mustBe UNAUTHORIZED
    }

    "Delete the right comment" in {
      val responseDelete = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/ReportComment/$reportId/$commentId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(responseDelete) mustBe OK
    }
  }

  "Get comment with invalid id" should {
    "Return error response message" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/ReportComment/$reportId/$commentId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
      val errorMessage = read[ResponseMessage](contentAsString(response))
      errorMessage.code mustBe "FAILURE"
    }
  }

  // Comment related test cases ends

  "Delete report from repository farmland" should {
    "Fail to delete a report if the user did not create it" in {
      val responseDelete = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/Report/$reportId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", regularUserSessionId))
      ).get
      status(responseDelete) mustBe UNAUTHORIZED
    }

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

  "Get report with invalid id" should {
    "Return error response message" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/Report/$reportId"
        ).withHeaders("RepositoryID" -> "farmland")
          .withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
      val errorMessage = read[ResponseMessage](contentAsString(response))
      errorMessage.code mustBe "FAILURE"
    }
  }

  def getReport = {
    val response = route(
      FakeRequest(
        GET, s"$applicationContext/SqlGen.svc/Report/$reportId"
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    read[ReportInfo](contentAsString(response))
  }

  def getComment = {
    val response = route(
      FakeRequest(
        GET, s"$applicationContext/SqlGen.svc/ReportComment/$reportId"
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    System.out.println(read[CommentStreamInfo](contentAsString(response)).comments.toString())
    read[CommentStreamInfo](contentAsString(response)).comments(0)
  }
}
