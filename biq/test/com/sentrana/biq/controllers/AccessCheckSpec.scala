package com.sentrana.biq.controllers

import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.Cookie
import play.api.test.FakeRequest
import play.api.test.Helpers._

import org.scalatest.DoNotDiscover

import com.sentrana.biq.BIQServiceSpec

/**
 * Created by Sheng on 5/21/15.
 */
@DoNotDiscover
class AccessCheckSpec extends BIQServiceSpec {
  var adminUserSessionId = ""
  var normalUserSessionId = ""

  "Admin user logs in" in {
    val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    adminUserSessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  "Normal user logs in" in {
    val userInfo: JsValue = Json.parse("""{"userName": "biq", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    normalUserSessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  "Normal user" should {
    "not be able to drop caches" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/DropCaches"
        ).withHeaders("sessionId" -> normalUserSessionId).withCookies(Cookie("sessionId", normalUserSessionId))
      ).get
      status(response)(120000) mustBe UNAUTHORIZED
    }
  }

  "Only admin user" should {
    "be able to drop all caches" in {
      val response = route(
        FakeRequest(
          GET, s"$applicationContext/SqlGen.svc/DropCaches"
        ).withHeaders("sessionId" -> adminUserSessionId).withCookies(Cookie("sessionId", adminUserSessionId))
      ).get
      status(response)(120000) mustBe OK
    }
  }
}
