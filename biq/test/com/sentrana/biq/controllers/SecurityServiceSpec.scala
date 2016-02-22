package com.sentrana.biq.controllers

import java.sql.Timestamp

import play.api.libs.json.{ JsValue, Json }
import play.api.test.FakeRequest
import play.api.test.Helpers._

import org.json4s.native.Serialization._
import org.scalatest.DoNotDiscover

import com.sentrana.biq.BIQServiceSpec
import com.sentrana.biq.datacontract.{ BIQSessionInfo, DerivedColumn, UserRepository }
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.usermanagement.authentication.UserSession
import com.sentrana.usermanagement.controllers.JsonFormat.formats
import com.sentrana.usermanagement.datacontract.DataFilterInfo
import com.sentrana.usermanagement.domain.document._

/**
 * Created by william.hogben on 2/4/2015.
 */
@DoNotDiscover
class SecurityServiceSpec extends BIQServiceSpec {

  var sessionId = ""

  val orgId = UMDataServices.getObjectId

  val dataFilter = DataFilterInstance(
    id           = UMDataServices.getObjectId,
    dataFilterId = "20",
    operator     = "=",
    value        = "MMIB",
    optionType   = None
  )

  val user = User(
    id                  = UMDataServices.getObjectId,
    userName            = "TestUser",
    password            = "sentrana",
    email               = "test@sentrana.com",
    firstName           = "Filter",
    lastName            = "Test",
    status              = Some("A"),
    createDate          = new Timestamp(System.currentTimeMillis),
    loginFailureCount   = 0,
    loginSuccessCount   = 0,
    organizationId      = orgId,
    isDeleted           = Some(false),
    dataFilterInstances = Seq(dataFilter),
    appRoles            = Seq(),
    userGroupIds        = Seq()
  )

  val organization: Organization = Organization(
    id                  = orgId,
    name                = "Dev",
    desc                = Some("A test for dashboard/page filtering"),
    status              = "A",
    isDeleted           = false,
    userGroups          = Seq(),
    applications        = Seq(),
    dataFilterInstances = Seq(),
    groupTypes          = Seq(),
    users               = Seq(user)
  )

  lazy val mongoDataServices = BIQDataServices()

  "setup" in {
    UMDataServices().saveDocument(organization)
  }

  "The login service" should {
    "respond with all permitted repositories" in {
      setup
      val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
      val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
      sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
      val userSession = read[BIQSessionInfo](contentAsString(loginResult))
      userSession.repositories.size mustBe 2
      userSession.repositories mustBe List(UserRepository("farmland", "Farmland"), UserRepository("MMIB", "MarketMover"))
      userSession.categoryList mustBe Nil
      userSession.jsonRepositoryNames mustBe Nil
      userSession.debugMode mustBe true
    }
  }

  "The createBIQSessionInfo" should {
    "Return only the correct repository id's" in {
      val session = new UserSession(user, organization, List(), () => List())
      val BIQSessionInfo = SecurityService.createBiqSessionInfo(session)
      BIQSessionInfo.repositories mustBe List(UserRepository("MMIB", "MarketMover"))
    }
  }

  def setup = {
    // Lets give Sentrana, Inc. Access to the MMIB Repo
    val filter = UMDataServices().getDocuments[DataFilterInfo](Map("filterName" -> "REPOSITORY_KEY")).headOption.getOrElse {
      val df = DataFilterInfo("12", "REPOSITORY_KEY", "Repository Keys", "STRING", None, "", None, "", None, false, None)
      UMDataServices().saveDocument(df)
      df
    }
    val sentrana = UMDataServices.getOrganizationById("1")
    val filterInstance = DataFilterInstance("12345", filter.filterId, "IN", "(MMIB,farmland)", None)
    val newSentrana = sentrana.copy(dataFilterInstances = sentrana.dataFilterInstances.filterNot(_.id == "12345") :+ filterInstance)
    UMDataServices.updateOrganization(newSentrana)

    mongoDataServices.removeDocuments[DerivedColumn](Map("id" -> ".*".r))
  }
}
