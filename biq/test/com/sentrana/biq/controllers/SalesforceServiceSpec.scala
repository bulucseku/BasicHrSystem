package com.sentrana.biq.controllers

import java.net.URLEncoder

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.{ Await, Future }

import play.api.Play
import play.api.libs.ws.WS
import play.api.mvc._
import play.api.test.Helpers._
import play.api.test._

import org.scalatest.DoNotDiscover

import com.ning.http.client.Response

import com.sentrana.appshell.logging.NullLoggerComponent
import com.sentrana.biq.BIQServiceSpec
import com.sentrana.usermanagement.controllers.SalesforceService
import com.sentrana.usermanagement.datacontract.DataFilterInfo
import com.sentrana.usermanagement.domain.document.{ DataFilterInstance, UMDataServices }

/**
 * Created by szhao on 11/21/2014.
 */
@DoNotDiscover
class SalesforceServiceSpec extends BIQServiceSpec {
  class TestController() extends SalesforceService with NullLoggerComponent

  val dataFilter = DataFilterInfo(
    "BIQ_SALESFORCE_CLIENT_ID", "BIQ_SALESFORCE_CLIENT_ID", "",
    "STRING", Some("Salesforce client id for Dashboard"), "", None, "", None, false, None
  )

  val dataFilterInstance = DataFilterInstance(
    "instanceId", "BIQ_SALESFORCE_CLIENT_ID", "=",
    "3MVG9A2kN3Bn17humpnpZCzvsgOMqC.yR5NZ7.1bdf0Gcg7vmiO9JEFJI5Onco3pEtFKhkAcA1h.esTwAztcs", None
  )

  val dataFilterSecret = DataFilterInfo(
    "BIQ_SALESFORCE_CLIENT_SECRET", "BIQ_SALESFORCE_CLIENT_SECRET", "",
    "STRING", Some("Salesforce client id for Dashboard"), "", None, "", None, false, None
  )

  val dataFilterInstanceSecret = DataFilterInstance(
    "instanceId", "BIQ_SALESFORCE_CLIENT_SECRET", "=",
    "891437831929795929", None
  )

  "setup" in {
    val org = UMDataServices.getOrganization("1").get
    val newOrg = org.copy(dataFilterInstances = org.dataFilterInstances :+ dataFilterInstance :+ dataFilterInstanceSecret)
    UMDataServices.updateOrganization(newOrg)
    UMDataServices().saveDocument(dataFilter)
    UMDataServices().saveDocument(dataFilterSecret)
  }

  "render app" should {
    "return auth code" in {
      val controller = new TestController()
      val result: Future[Result] = route(FakeRequest(GET, s"$applicationContext/SalesforceService.svc/RenderApp/1")).get
      val redirectURI = Play.application.configuration.getString("sf.integration.redirectURI").get
      val appUrl = Play.application.configuration.getString("sf.integration.appUrl").get
      val redirect = URLEncoder.encode(s"$appUrl$applicationContext$redirectURI" + 1, "UTF-8")
      val loginURL: String = redirectLocation(result).get
      loginURL mustBe "https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=" +
        "3MVG9A2kN3Bn17humpnpZCzvsgOMqC.yR5NZ7.1bdf0Gcg7vmiO9JEFJI5Onco3pEtFKhkAcA1h.esTwAztcs&redirect_uri=" +
        s"$redirect&state=auth_start"
      val salesforceResponse = WS.url(loginURL).withFollowRedirects(follow = true).get()
      val salesforceAuthUri = salesforceResponse.map(
        response => response.underlying[Response].getUri
      )
      val salesforceAuthUrl = Await.result(salesforceAuthUri, 10.seconds)
      salesforceAuthUrl.toString must include ("login.salesforce.com")
    }
  }

  /**
   * Comment out this test case for the time being.
   * TODO Simulate browser client automatic redirect.
   */
  //  "salesforce redirect" should {
  //    "get salesforce account" in {
  //      val authCode = "aPrxMZkm7lCkgfR_2YjhUvwFWizENAQbT1W_zvXgs.7Sj5aKLcNJPRNGNg4Nw0FqO0kb6qwK6w%3D%3D"
  //      val controller = new TestController()
  //      val result: Future[SimpleResult] = controller.salesforceCallback(authCode).apply(FakeRequest())
  //      val bodyText: String = contentAsString(result)
  //      bodyText mustBe "ok"
  //    }
  //  }
}
