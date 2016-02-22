package com.sentrana.biq.controllers

import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.Cookie
import play.api.test.FakeRequest
import play.api.test.Helpers._

import org.json4s.native.Serialization._
import org.scalatest.DoNotDiscover

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.biq.BIQServiceSpec
import com.sentrana.biq.datacontract._
import com.sentrana.biq.domain.document.BIQDataServices

/**
 * Created by william.hogben on 2/24/2015.
 */
@DoNotDiscover
class DerivedColumnServiceSpec extends BIQServiceSpec {

  lazy val mongoDataServices = BIQDataServices()

  var sessionId = ""
  "login" in {
    val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  "DerivedColumnService.ValidateFormula" should {
    "Validate the formula" in {
      val formula: JsValue = Json.parse("""{"formula":"[sales_data_of_cases]*100"}""")
      val response = route(FakeRequest(
        POST, s"$applicationContext/SqlGen.svc/ValidateFormula?repositoryid=farmland"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId)), formula).get
      status(response) mustBe OK
      contentAsString(response) mustBe "true"
    }

    "Fail to validate an invalid formula" in {
      val formula: JsValue = Json.parse("""{"formula":"[bad_formula]"}""")
      val response = route(FakeRequest(
        POST, s"$applicationContext/SqlGen.svc/ValidateFormula?repositoryid=farmland"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId)), formula).get
      status(response) mustBe BAD_REQUEST
    }
  }

  "DerivedColumnService.addDerivedColumn" should {
    "Add a valid derived column to the database" in {
      val derivedColumnRequest = DerivedColumnInfo(
        None, None, "New Name",
        "[sales_data_of_cases]*100",
        "2", "NUMBER", "farmland", "DM"
      )
      val response = route(
        FakeRequest(
          POST, s"$applicationContext/SqlGen.svc/DerivedColumn?repositoryid=farmland"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(derivedColumnRequest))
      ).get
      status(response) mustBe OK
      inside(read[DerivedColumnInfo](contentAsString(response))) {
        case DerivedColumnInfo(id, oid, name, formula, precision, output, dataSource, formulaType) =>
          id must be ('defined)
          oid mustBe Some(s"f(${id.get})")
          name mustBe derivedColumnRequest.name
          formula mustBe derivedColumnRequest.formula
          precision mustBe derivedColumnRequest.precision
          output mustBe derivedColumnRequest.outputType
          dataSource mustBe derivedColumnRequest.dataSource
          formulaType mustBe derivedColumnRequest.formulaType
      }
    }

    "Fail to parse a duplicate derived column" in {
      val derivedColumnRequest = DerivedColumnInfo(
        None, None, "New Name",
        "[sales_data_of_cases]*10000",
        "2", "NUMBER", "farmland", "DM"
      )
      val response = route(
        FakeRequest(
          POST, s"$applicationContext/SqlGen.svc/DerivedColumn?repositoryid=farmland"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(derivedColumnRequest))
      ).get
      status(response) mustBe BAD_REQUEST
    }
  }

  "DerivedColumnService.updateDerivedColumn" should {
    "Correctly update a valid derived column" in {
      val dc = mongoDataServices.getDocuments[DerivedColumn](Map("derivedColumnName" -> "New Name")).head
      val derivedColumnRequest = BIQServiceUtil.convertDerivedColumnToDerivedColumnInfo(dc).copy(
        name = "New Name 2"
      )

      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/DerivedColumn/" + dc.id.get + "?repositoryid=farmland"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(derivedColumnRequest))
      ).get
      status(response) mustBe OK
      read[DerivedColumnInfo](contentAsString(response)) mustBe derivedColumnRequest
    }

    "Incorrectly parse a column updated to a duplicate" in {
      val dc = mongoDataServices.getDocuments[DerivedColumn](Map("derivedColumnName" -> "New Name 2")).head
      mongoDataServices.saveDocument(dc.copy(id = Some("copyId"), derivedColumnName = "Copy Name"))
      val derivedColumnRequest = BIQServiceUtil.convertDerivedColumnToDerivedColumnInfo(dc.copy(derivedColumnName = "Copy Name"))
      val response = route(
        FakeRequest(
          PUT, s"$applicationContext/SqlGen.svc/DerivedColumn/" + dc.id.get + "?repositoryid=farmland"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId)),
        Json.parse(write(derivedColumnRequest))
      ).get
      status(response) mustBe BAD_REQUEST
    }
  }

  "Add a derived column that contains a derived column" in {
    val dc = mongoDataServices.getDocuments[DerivedColumn](Map("derivedColumnName" -> "New Name 2")).head
    val derivedColumnRequest = DerivedColumnInfo(
      None, None, "Recursive",
      "f(" + dc.id.get + ")+100",
      "2", "NUMBER", "farmland", "DM"
    )
    val response = route(
      FakeRequest(
        POST, s"$applicationContext/SqlGen.svc/DerivedColumn?repositoryid=farmland"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId)),
      Json.parse(write(derivedColumnRequest))
    ).get
    status(response) mustBe OK
  }

  "Add a report that contains a derived column" in {
    val dc = mongoDataServices.getDocuments[DerivedColumn](Map("derivedColumnName" -> "New Name 2")).head
    val report = ReportInfo(
      "Derived Report", None, Some("farmland"), Some(1), None, None, None, None, None,
      ReportSpecification(
        s"af_cal_qtr_name|f(${dc.id.get})", None, false, "A"
      ), null, false, false, None, None, None, None, None, None, None
    )
    val response = route(
      FakeRequest(
        POST, s"$applicationContext/SqlGen.svc/Report?repositoryid=farmland"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId)),
      Json.parse(write(report))
    ).get
    status(response) mustBe OK
  }

  "DerivedColumnService.deleteDerivedColumn" should {
    "Successfully delete a derived column" in {
      val dc = mongoDataServices.getDocuments[DerivedColumn](Map("derivedColumnName" -> "New Name 2")).head
      val response = route(
        FakeRequest(
          DELETE, s"$applicationContext/SqlGen.svc/DerivedColumn/" + dc.id.get + "?repositoryid=farmland"
        ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))
      ).get
      status(response) mustBe OK
      mongoDataServices.getDocuments[DerivedColumn](Map("derivedColumnName" -> "New Name 2"))
        .headOption mustBe None
    }

    "Remove the derived column from reports" in {
      val report = mongoDataServices.getDocuments[ReportInfo](Map("name" -> "Derived Report")).head
      mongoDataServices.removeDocuments[ReportInfo](Map("name" -> "Derived Report"))
      report.definition.template mustBe "af_cal_qtr_name|New Name 2:([sales_data_of_cases]*100),dataType:NUMBER,precision:2,formulaType:DM"
    }

    "Remove the derived column from other derived columns" in {
      val dc = mongoDataServices.getDocuments[DerivedColumn](Map("derivedColumnName" -> "Recursive")).head
      mongoDataServices.removeDocuments[DerivedColumn](Map("derivedColumnName" -> "Recursive"))
      dc.expression mustBe "([sales_data_of_cases]*100)+100"
    }
  }
}
