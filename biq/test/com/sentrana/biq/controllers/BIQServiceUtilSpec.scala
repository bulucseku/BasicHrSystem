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
import com.sentrana.biq.datacontract.{ ReportInfo, SharingInfo, SharingObjectChangeType, SharingObjectType }

/**
 * Created by william.hogben on 3/11/2015.
 */
@DoNotDiscover
class BIQServiceUtilSpec extends BIQServiceSpec {
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
  var reportId: String = ""

  var sessionId: String = ""

  "login" in {
    val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

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

  "BIQServiceUtil.cacheSharingInfo" should {
    "cache a sharinginfo for a given user" in {
      BIQServiceUtil.cacheSharingInfo("1", SharingInfo(
        objectId       = reportId,
        objectType     = SharingObjectType.REPORT.toString,
        changeType     = SharingObjectChangeType.AC.toString,
        repository     = "farmland",
        senderFullName = "Sheng Zhao"
      ))
    }
  }

  "get sharing update" in {
    val response = route(
      FakeRequest(
        GET, s"$applicationContext/SqlGen.svc/GetSharingUpdate/1"
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    status(response) mustBe OK
    val sharingInfos = read[List[SharingInfo]](contentAsString(response))
    for (el <- sharingInfos) {
      el.objectId mustBe reportId
      el.objectType mustBe "REPORT"
      el.changeType mustBe "AC"
      el.repository mustBe "farmland"
    }
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

  "logout" in {
    val response = route(
      FakeRequest(
        GET, s"$applicationContext/SecurityService.svc/logout"
      ).withHeaders("RepositoryID" -> "farmland")
        .withCookies(Cookie("sessionId", sessionId))
    ).get
    status(response) mustBe OK
  }
}
