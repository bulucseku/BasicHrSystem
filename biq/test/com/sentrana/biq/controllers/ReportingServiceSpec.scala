package com.sentrana.biq.controllers

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.language.postfixOps

import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.Cookie
import play.api.test.FakeRequest
import play.api.test.Helpers._

import org.json4s.native.Serialization._
import org.scalatest.DoNotDiscover

import com.twitter.util.Stopwatch

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.data._
import com.sentrana.biq.BIQServiceSpec
import com.sentrana.biq.datacontract.{ ColumnInfo, DatasetResult, _ }
import com.sentrana.biq.metadata.MetadataRepository
import com.sentrana.usermanagement.datacontract.DataFilterInfo
import com.sentrana.usermanagement.domain.document.{ DataFilterInstance, UMDataServices }

/**
 * Created by william.hogben on 2/27/2015.
 */
@DoNotDiscover
class ReportingServiceSpec extends BIQServiceSpec {

  var sessionId = ""
  var cacheId = ""

  "login" in {
    val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
    val form = MetadataRepository().metadata("MMIB").metaData.getAttributeForm("ItemCategoryDesc")
    val repo = MetadataRepository().metadata("MMIB")
    Await.result(repo.dataWarehouse.queryForTreeElements(form.get), 120 seconds)
  }

  "Drop all the caches before tests" in {
    val response = route(
      FakeRequest(
        GET, s"$applicationContext/SqlGen.svc/DropCaches?repositoryid=farmland"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))
    ).get
    status(response)(120000) mustBe OK
  }

  "The Execute function" should {
    var execTime = 0L
    "Execute a given report" in {
      val watch = Stopwatch.start()
      val reportInfo: JsValue = Json.parse("""{"template":"af_cal_qtr_name|sales_data_of_cases","filter":"","totals":false,"sort":"1A|2D"}""")
      val response = route(FakeRequest(POST, s"$applicationContext/SqlGen.svc/Execute?repositoryid=farmland")
        .withHeaders("sessionId" -> sessionId)
        .withCookies(Cookie("sessionId", sessionId)), reportInfo).get
      status(response)(120000) mustBe OK
      execTime = watch().inMilliseconds
      inside(read[DatasetResult](contentAsString(response))) {
        case DatasetResult(colInfos, exptMsg, malTypedElems, timing, cached, rows, totals, execTime, cacheId, sql, drillable) =>
          inside(colInfos) {
            case List(colInfo1, colInfo2) =>
              inside(colInfo1) {
                case ColumnInfo(title, width, just, colType, attrValType, dataType, format, oid, sortPos, sortOrder) =>
                  title mustBe "Cal Qtr Name"
                  width mustBe 14
                  just mustBe Justify.LEFT
                  colType mustBe ColType.ATTRIBUTE
                  attrValType mustBe AttrValueType.DISCRETESERIES
                  dataType mustBe DataType.STRING
                  format mustBe ""
                  oid mustBe "af_cal_qtr_name"
                  sortPos mustBe 1
                  sortOrder mustBe "A"
              }
          }
          exptMsg mustBe ""
          malTypedElems mustBe Nil
          timing.SqlGenerationTime must be > 0L
          timing.QueryTime must be > 0L
          cached mustBe true
          inside(rows.sortBy(_.cells.head.fmtValue).head) {
            case ResultRow(Seq(cell1, cell2), subtotalRow) =>
              subtotalRow mustBe false
              inside(cell1) {
                case ResultCell(fmt, raw, sub) =>
                  fmt mustBe "2013 Quarter 1"
                  raw mustBe "2013 Quarter 1"
                  sub mustBe false
              }
              inside(cell2) {
                case ResultCell(fmt, raw, sub) =>
                  fmt mustBe "109,111,783"
                  raw mustBe 1.0911178326E8
                  sub mustBe false
              }
          }
          totals mustBe null
          cacheId.length must be > 0
          sql mustBe "SELECT TOP 100000<br/>primaryTable_1.cal_qtr_name AS \"Cal Qtr Name\", <br/>SUM(CAST(primaryTable_1.sales_data_of_cases AS DECIMAL(26,5))) AS \"Cases Sold\"<br/>FROM<br/>v2_sales_and_claims_flat_v3 AS primaryTable_1<br/>GROUP BY<br/>primaryTable_1.cal_qtr_name<br/>ORDER BY<br/>primaryTable_1.cal_qtr_name ASC, <br/>\"Cases Sold\" DESC"
          drillable mustBe true
      }
    }

    "Use user filters when applicable" in {
      // create user with data filter
      val org = UMDataServices.getOrganizationById("1")
      val users = org.users.filterNot(_.id == "1")
      val user = org.users.find(_.id == "1").get
      val df = UMDataServices().getDocument[DataFilterInfo](Map("fieldId" -> "CITY")).get
      val dfi = DataFilterInstance("TEST_DF", df.filterId, "IN", "Washington, New York", None)
      val newUser = user.copy(dataFilterInstances = user.dataFilterInstances :+ dfi)
      UMDataServices.updateOrganization(org.copy(users = users :+ newUser))

      //reload user to session
      val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
      val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
      sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value

      val reportInfo: JsValue = Json.parse("""{"template":"FiscalQuarterId|CaseCount","filter":"","totals":false,"sort":"1A|2D"}""")
      val response = route(FakeRequest(POST, s"$applicationContext/SqlGen.svc/Execute?repositoryid=MMIB")
        .withHeaders("sessionId" -> sessionId)
        .withCookies(Cookie("sessionId", sessionId)), reportInfo).get
      status(response)(120000) mustBe OK
      val result = read[DatasetResult](contentAsString(response))
      result.sql mustBe "SELECT TOP 1000000<br/>" +
        "MainFact.fiscal_qtr_id AS \"Fiscal Quarter\", <br/>" +
        "SUM(CAST(MainFact.total_cases AS DECIMAL(26,5))) AS \"Cases\"<br/>" +
        "FROM<br/>mm_datamart_dev.trans_aggregate AS MainFact<br/>" +
        "WHERE<br/>(MainFact.fiscal_qtr_id IN('Washington', 'New York'))<br/>" +
        "GROUP BY<br/>MainFact.fiscal_qtr_id<br/>" +
        "ORDER BY<br/>MainFact.fiscal_qtr_id ASC, <br/>\"Cases\" DESC"
    }

    "Cache results from requests and return repeated requests in less than 1 second" in {
      val reportInfo: JsValue = Json.parse("""{"template":"af_cal_qtr_name|sales_data_of_cases","filter":"","totals":false,"sort":"2A|1D"}""")
      val watch = Stopwatch.start()
      val response = route(FakeRequest(POST, s"$applicationContext/SqlGen.svc/Execute?repositoryid=farmland")
        .withHeaders("sessionId" -> sessionId)
        .withCookies(Cookie("sessionId", sessionId)), reportInfo).get
      status(response) mustBe OK
      val time = watch().inMilliseconds
      time must be < execTime
      time must be < 1500L
    }
  }

  "ReportingService.getChildElements" should {
    "return the child elements of the attribute form" in {
      val filterElement: JsValue = Json.parse(write(
        FilterElement(
          oid         = "(ItemCategoryDesc+)ItemCategoryDesc:HLTHCAR/HOSPLTY",
          name        = None,
          hasChildren = None
        )
      ))
      val response = route(
        FakeRequest(
          POST, s"$applicationContext/SqlGen.svc/GetChildElements?repositoryid=MMIB"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId)),
        filterElement
      ).get
      status(response)(120000) mustBe OK
      val children = read[List[FilterElement]](contentAsString(response))
      children.size mustBe 7
      children.head mustBe FilterElement(
        oid         = "(ItemCategoryDesc+ItemCategoryDesc:HLTHCAR/HOSPLTY)MajorClassDesc:ALLOWANCE",
        name        = Some("ALLOWANCE"),
        hasChildren = Some(true)
      )
    }
  }

  "ReportingServices.getMatchingElementPaths" should {
    "Return all element paths that contain the search string" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/GetMatchingElementPaths?repositoryid=MMIB&str=CANDY CHOCOLATE&form_id=ItemCategoryDesc"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response)(120000) mustBe OK
      val list = read[List[String]](contentAsString(response))
      list.count(_.contains("Minor")) mustBe 5
    }
  }

  "ReportingService.getDrillOptions" should {
    "Return the correct drill options" in {
      val reportInfo: JsValue = Json.parse("""{"template":"MajorClassDesc|CaseCount","filter":"","totals":false,"sort":"2A|1D"}""")
      val report = route(FakeRequest(POST, s"$applicationContext/SqlGen.svc/Execute?repositoryid=MMIB")
        .withHeaders("sessionId" -> sessionId)
        .withCookies(Cookie("sessionId", sessionId)), reportInfo).get
      status(report)(120000) mustBe OK
      val result = read[DatasetResult](contentAsString(report))
      result.cached mustBe true

      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/GetDrillOptions?repositoryid=MMIB&cacheid=" + result.cacheid + "&sElems=MajorClassDesc:BAKING NEEDS"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response)(120000) mustBe OK
      val drillOptions = read[DrillOptions](contentAsString(response))
      inside(drillOptions) {
        case DrillOptions(exptMsg, errorCode, opts) =>
          exptMsg mustBe None
          errorCode mustBe None
          inside(opts) {
            case Seq(drillOpts1) =>
              inside(drillOpts1) {
                case DrillOption(tp, eInfos, tgtAttrForms, report) =>
                  tp mustBe DrillType.DRILL_DOWN
                  eInfos mustBe Seq(
                    DrillElementInfo(
                      formName   = "Major Class (Name)",
                      formID     = "MajorClassDesc",
                      eName      = "BAKING NEEDS",
                      actualName = "Major Class",
                      eID        = "MajorClassDesc:BAKING NEEDS"
                    )
                  )
                  tgtAttrForms mustBe Seq(
                    DrillAttributeInfo(
                      formName  = "Intermediate Class",
                      formCount = 1
                    )
                  )
              }
          }
      }
    }
  }

  "ReportingServices.exportToCsv" should {
    "Respond with a csv file" in {
      val reportInfo: JsValue = Json.parse("""{"template":"af_cal_qtr_name|sales_data_of_cases","filter":"","totals":false,"sort":"2A|1D"}""")
      val report = route(FakeRequest(POST, s"$applicationContext/SqlGen.svc/Execute?repositoryid=farmland")
        .withHeaders("sessionId" -> sessionId)
        .withCookies(Cookie("sessionId", sessionId)), reportInfo).get
      status(report)(120000) mustBe OK
      val result = read[DatasetResult](contentAsString(report))
      result.cached mustBe true
      cacheId = result.cacheid

      val csv = route(FakeRequest(POST, s"$applicationContext/SqlGen.svc/ExportToCsv?repositoryid=farmland")
        .withHeaders("sessionId" -> sessionId)
        .withCookies(Cookie("sessionId", sessionId))
        .withFormUrlEncodedBody(
          "templateUnits" -> "af_cal_qtr_name|sales_data_of_cases",
          "filterUnits" -> "",
          "sort" -> "2A|1D",
          "totalsOn" -> "false",
          "fileName" -> "test.csv"
        )).get
      status(csv) mustBe OK
      contentType(csv) mustBe Some("txt/csv")
      header(CONTENT_DISPOSITION, csv) mustBe Some("attachment; filename=test.csv")
      header(CONTENT_LENGTH, csv) mustBe Some("220")
    }
  }

  "ReportingService.dropCache" should {
    "Drop the cache" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/DropCache?repositoryid=farmland&cacheid=" + cacheId
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response)(120000) mustBe OK
      val cacheDrop = read[DropCacheResult](contentAsString(response))
      cacheDrop mustBe DropCacheResult(success = true)
    }
  }

  "ReportingService.dropCaches" should {
    "Drop all the caches" in {
      val reportInfo: JsValue = Json.parse("""{"template":"af_cal_qtr_name|sales_data_of_cases","filter":"","totals":false,"sort":"2A|1D"}""")
      val report = route(FakeRequest(POST, s"$applicationContext/SqlGen.svc/Execute?repositoryid=farmland")
        .withHeaders("sessionId" -> sessionId)
        .withCookies(Cookie("sessionId", sessionId)), reportInfo).get
      status(report)(120000) mustBe OK
      val result = read[DatasetResult](contentAsString(report))
      result.cached mustBe true

      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/DropCaches?repositoryid=farmland"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response)(120000) mustBe OK
      val cacheDrop = read[DropCachesResult](contentAsString(response))
      cacheDrop mustBe DropCachesResult(status = "Success", numDropped = 4)
    }
  }

  "ReportingService.dropCachesByRepository" should {
    "Drop all the caches for a repository" in {
      // lets add a cache for both repos
      val reportInfo: JsValue = Json.parse("""{"template":"af_cal_qtr_name|sales_data_of_cases","filter":"","totals":false,"sort":"2A|1D"}""")
      val report = route(FakeRequest(POST, s"$applicationContext/SqlGen.svc/Execute?repositoryid=farmland")
        .withHeaders("sessionId" -> sessionId)
        .withCookies(Cookie("sessionId", sessionId)), reportInfo).get
      status(report)(120000) mustBe OK
      val reportInfo2: JsValue = Json.parse("""{"template":"MajorClassDesc|CaseCount","filter":"","totals":false,"sort":"2A|1D"}""")
      val report2 = route(FakeRequest(POST, s"$applicationContext/SqlGen.svc/Execute?repositoryid=MMIB")
        .withHeaders("sessionId" -> sessionId)
        .withCookies(Cookie("sessionId", sessionId)), reportInfo2).get

      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/DropCachesByRepository?repositoryIds=farmland&username=sentrana&password=monday1"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response)(120000) mustBe OK
      val cacheDrop = read[DropCachesResult](contentAsString(response))

      // only one of the caches must be dropped
      cacheDrop mustBe DropCachesResult(status = "Success", numDropped = 1)
    }
  }

}
