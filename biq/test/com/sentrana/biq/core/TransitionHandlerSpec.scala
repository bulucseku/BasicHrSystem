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
import com.sentrana.biq.datacontract.{ EmailNotificationInfo, ReportInfo }
import com.sentrana.usermanagement.domain.document.{ UMDataServices, User }
/**
 * Created by Shamir on 3/11/2015.
 */
@DoNotDiscover
class TransitionHandlerSpec extends BIQServiceSpec {
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

  val user2 = User(
    id                  = UMDataServices.getObjectId,
    userName            = "testUser2",
    password            = "password",
    email               = "testUser2@sentrana.com",
    firstName           = "Test",
    lastName            = "User2",
    status              = Some("A"),
    isDeleted           = Some(false),
    dataFilterInstances = Seq(),
    appRoles            = Seq(),
    userGroupIds        = Seq(),
    organizationId      = "1"
  )

  val user3 = User(
    id                  = UMDataServices.getObjectId,
    userName            = "testUser3",
    password            = "password",
    email               = "testUser2@sentrana.com",
    firstName           = "Test",
    lastName            = "User3",
    status              = Some("A"),
    isDeleted           = Some(false),
    dataFilterInstances = Seq(),
    appRoles            = Seq(),
    userGroupIds        = Seq(),
    organizationId      = "1"
  )

  var reportId: String = ""

  var sessionId: String = ""

  "setup" in {
    val org = UMDataServices.getOrganizationById("1")
    val newOrg = org.copy(users = org.users :+ user1 :+ user2 :+ user3)
    UMDataServices.updateOrganization(newOrg)
  }

  "login" in {
    val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  val firstParticipationStateTransition: ParticipationStateTransition = ParticipationStateTransition(null, "AC")
  val secondParticipationStateTransition: ParticipationStateTransition = ParticipationStateTransition("AC", "RV")
  val thirdParticipationStateTransition: ParticipationStateTransition = ParticipationStateTransition("RV", "AC")
  val fourthParticipationStateTransition: ParticipationStateTransition = ParticipationStateTransition("RV", "EX")
  val fifthParticipationStateTransition: ParticipationStateTransition = ParticipationStateTransition("RJ", "EX")

  val firstEmailNotificationInfo: EmailNotificationInfo = EmailNotificationInfo(null, "AC", "Application Test", "THIS IS JUST A TEST")
  val secondEmailNotificationInfo: EmailNotificationInfo = EmailNotificationInfo("AC", "RV", "Application Test", "THIS IS JUST A TEST")
  val thirdEmailNotificationInfo: EmailNotificationInfo = EmailNotificationInfo("RV", "AC", "Application Test", "THIS IS JUST A TEST")
  val fourthEmailNotificationInfo: EmailNotificationInfo = EmailNotificationInfo("RV", "EX", "Application Test", "THIS IS JUST A TEST")
  val fifthEmailNotificationInfo: EmailNotificationInfo = EmailNotificationInfo("RJ", "EX", "Application Test", "THIS IS JUST A TEST")

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

  "CreateRecipientsTransitionHandler.handleTransition" should {
    "handle transition when a report is being created" in {
      val createRecipientsTransitionHandler: CreateRecipientsTransitionHandler = new CreateRecipientsTransitionHandler
      val emailNotificationManager: EmailNotificationManager = new EmailNotificationManager(Seq(), "farmland", Some(reportInfo), None, "")
      createRecipientsTransitionHandler.handleTransition("1", firstParticipationStateTransition, reportId, List(user1.id, user2.id), emailNotificationManager, "farmland")
    }
  }

  "CreateRecipientsTransitionHandler.persistChanges" should {
    "add a transition in a report" in {
      val createRecipientsTransitionHandler: CreateRecipientsTransitionHandler = new CreateRecipientsTransitionHandler
      val emailNotificationManager: EmailNotificationManager = new EmailNotificationManager(Seq(), "farmland", Some(reportInfo), None, "")
      createRecipientsTransitionHandler.persistChanges("1", firstParticipationStateTransition, reportId, user3.id, "farmland")
    }
  }

  "CreateRecipientsTransitionHandler.updateStream" should {
    "update the commentstream in the report" in {
      val createRecipientsTransitionHandler: CreateRecipientsTransitionHandler = new CreateRecipientsTransitionHandler
      createRecipientsTransitionHandler.updateStream("1", firstParticipationStateTransition, reportId, List(user1.id, user2.id))
    }
  }

  "CreateRecipientsTransitionHandler.addCommentToStream" should {
    "add a comment stream to the report" in {
      val createRecipientsTransitionHandler: CreateRecipientsTransitionHandler = new CreateRecipientsTransitionHandler
      createRecipientsTransitionHandler.addCommentToStream("1", reportId, "THIS IS JUST A TEST")
    }
  }

  "CreateRecipientsTransitionHandler.getFullNames" should {
    "get full names for a list of users" in {
      val createRecipientsTransitionHandler: CreateRecipientsTransitionHandler = new CreateRecipientsTransitionHandler
      val fullNames: String = createRecipientsTransitionHandler.getFullNames(List(user1.id, user2.id, user3.id))
      fullNames mustBe "Test User1, Test User2, Test User3"
    }
  }

  "UpdateRecipientsTransitionHandler.handleTransition" should {
    "handle transition when a report is being updated" in {
      val updateRecipientsTransitionHandler: UpdateRecipientsTransitionHandler = new UpdateRecipientsTransitionHandler
      val emailNotificationManager: EmailNotificationManager = new EmailNotificationManager(Seq(), "farmland", Some(reportInfo), None, "")
      updateRecipientsTransitionHandler.handleTransition("1", secondParticipationStateTransition, reportId, List(user1.id, user2.id), emailNotificationManager, "farmland")
    }
  }

  "UpdateRecipientsTransitionHandler.persistChanges" should {
    "update a transition in a report" in {
      val updateRecipientsTransitionHandler: UpdateRecipientsTransitionHandler = new UpdateRecipientsTransitionHandler
      val emailNotificationManager: EmailNotificationManager = new EmailNotificationManager(Seq(), "farmland", Some(reportInfo), None, "")
      updateRecipientsTransitionHandler.persistChanges("1", secondParticipationStateTransition, reportId, user3.id, "farmland")
    }
  }

  "UpdateRecipientsTransitionHandler.updateStream" should {
    "update the commentstream in the report" in {
      val updateRecipientsTransitionHandler: UpdateRecipientsTransitionHandler = new UpdateRecipientsTransitionHandler
      updateRecipientsTransitionHandler.updateStream("1", secondParticipationStateTransition, reportId, List("25", "27"))
    }
  }

  "UpdateRecipientsTransitionHandler.addCommentToStream" should {
    "add a comment stream to the report" in {
      val updateRecipientsTransitionHandler: UpdateRecipientsTransitionHandler = new UpdateRecipientsTransitionHandler
      updateRecipientsTransitionHandler.addCommentToStream("1", reportId, "THIS IS JUST A TEST")
    }
  }

  "UpdateRecipientsTransitionHandler.getFullNames" should {
    "get full names for a list of users" in {
      val updateRecipientsTransitionHandler: UpdateRecipientsTransitionHandler = new UpdateRecipientsTransitionHandler
      val fullNames: String = updateRecipientsTransitionHandler.getFullNames(List(user1.id, user2.id, user3.id))
      fullNames mustBe "Test User1, Test User2, Test User3"
    }
  }

  "DeleteRecipientsTransitionHandler.handleTransition" should {
    "handle transition when a report is being deleted" in {
      val deleteRecipientsTransitionHandler: DeleteRecipientsTransitionHandler = new DeleteRecipientsTransitionHandler
      val emailNotificationManager: EmailNotificationManager = new EmailNotificationManager(Seq(), "farmland", Some(reportInfo), None, "")
      deleteRecipientsTransitionHandler.handleTransition("1", fourthParticipationStateTransition, reportId, List(user1.id, user2.id), emailNotificationManager, "farmland")
    }
  }

  "DeleteRecipientsTransitionHandler.persistChanges" should {
    "delete a transition in a report" in {
      val deleteRecipientsTransitionHandler: DeleteRecipientsTransitionHandler = new DeleteRecipientsTransitionHandler
      val emailNotificationManager: EmailNotificationManager = new EmailNotificationManager(Seq(), "farmland", Some(reportInfo), None, "")
      deleteRecipientsTransitionHandler.persistChanges("1", fourthParticipationStateTransition, reportId, user3.id, "farmland")
    }
  }

  "DeleteRecipientsTransitionHandler.updateStream" should {
    "update the commentstream in the report" in {
      val deleteRecipientsTransitionHandler: DeleteRecipientsTransitionHandler = new DeleteRecipientsTransitionHandler
      deleteRecipientsTransitionHandler.updateStream("1", fourthParticipationStateTransition, reportId, List(user1.id, user2.id))
    }
  }

  "DeleteRecipientsTransitionHandler.addCommentToStream" should {
    "add a comment stream to the report" in {
      val deleteRecipientsTransitionHandler: DeleteRecipientsTransitionHandler = new DeleteRecipientsTransitionHandler
      deleteRecipientsTransitionHandler.addCommentToStream("1", reportId, "THIS IS JUST A TEST")
    }
  }

  "DeleteRecipientsTransitionHandler.getFullNames" should {
    "get full names for a list of users" in {
      val deleteRecipientsTransitionHandler: DeleteRecipientsTransitionHandler = new DeleteRecipientsTransitionHandler
      val fullNames: String = deleteRecipientsTransitionHandler.getFullNames(List(user1.id, user2.id, user3.id))
      fullNames mustBe "Test User1, Test User2, Test User3"
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
}
