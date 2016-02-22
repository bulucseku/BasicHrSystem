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
import com.sentrana.biq.datacontract.{ BookletInfo, EmailNotificationInfo, ReportInfo }
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.usermanagement.domain.document.{ UMDataServices, User }
/**
 * Created by shamir on 3/11/2015.
 */
@DoNotDiscover
class BookletTransitionHandlerSpec extends BIQServiceSpec {
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

  lazy val mongoDataServices = BIQDataServices()

  var sessionId: String = ""
  "login" in {
    val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  "setup" in {
    val org = UMDataServices.getOrganizationById("1")
    val newOrg = org.copy(users = org.users :+ user1 :+ user2 :+ user3)
    UMDataServices.updateOrganization(newOrg)
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

  var bookletId: String = ""

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

  "CreateBookletRecipientsTransitionHandler.handleTransition" should {
    "handle transition when a booklet is being created" in {
      val bookletInfo: BookletInfo = getBooklet
      val createBookletRecipientsTransitionHandler: CreateBookletRecipientsTransitionHandler = new CreateBookletRecipientsTransitionHandler
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(), "farmland", bookletInfo, "")
      createBookletRecipientsTransitionHandler.handleTransition("1", firstParticipationStateTransition, bookletId, List(user1.id, user2.id), bookletEmailNotificationManager, "farmland")
    }
  }

  "CreateBookletRecipientsTransitionHandler.persistChanges" should {
    "add a transition in a booklet" in {
      val bookletInfo: BookletInfo = getBooklet
      val createBookletRecipientsTransitionHandler: CreateBookletRecipientsTransitionHandler = new CreateBookletRecipientsTransitionHandler
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(), "farmland", bookletInfo, "")
      createBookletRecipientsTransitionHandler.persistChanges("1", firstParticipationStateTransition, bookletId, user3.id, "farmland")
    }
  }

  "CreateBookletRecipientsTransitionHandler.updateStream" should {
    "update the commentstream in the booklet" in {
      val createBookletRecipientsTransitionHandler: CreateBookletRecipientsTransitionHandler = new CreateBookletRecipientsTransitionHandler
      createBookletRecipientsTransitionHandler.updateStream("1", firstParticipationStateTransition, bookletId, List(user1.id, user2.id))
    }
  }

  "CreateBookletRecipientsTransitionHandler.getFullNames" should {
    "get full names for a list of users" in {
      val createBookletRecipientsTransitionHandler: CreateBookletRecipientsTransitionHandler = new CreateBookletRecipientsTransitionHandler
      val fullNames: String = createBookletRecipientsTransitionHandler.getFullNames(List(user1.id, user2.id, user3.id))
      fullNames mustBe "Test User1, Test User2, Test User3"
    }
  }

  "UpdateRecipientsTransitionHandler.handleTransition" should {
    "handle transition when a booklet is being updated" in {
      val bookletInfo: BookletInfo = getBooklet
      val updateBookletRecipientsTransitionHandler: UpdateBookletRecipientsTransitionHandler = new UpdateBookletRecipientsTransitionHandler
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(), "farmland", bookletInfo, "")
      updateBookletRecipientsTransitionHandler.handleTransition("1", secondParticipationStateTransition, bookletId, List(user1.id, user2.id), bookletEmailNotificationManager, "farmland")
    }
  }

  "UpdateBookletRecipientsTransitionHandler.persistChanges" should {
    "update a transition in a booklet" in {
      val bookletInfo: BookletInfo = getBooklet
      val updateBookletRecipientsTransitionHandler: UpdateBookletRecipientsTransitionHandler = new UpdateBookletRecipientsTransitionHandler
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(), "farmland", bookletInfo, "")
      updateBookletRecipientsTransitionHandler.persistChanges("1", secondParticipationStateTransition, bookletId, user3.id, "farmland")
    }
  }

  "UpdateBookletRecipientsTransitionHandler.updateStream" should {
    "update the commentstream in the booklet" in {
      val updateBookletRecipientsTransitionHandler: UpdateBookletRecipientsTransitionHandler = new UpdateBookletRecipientsTransitionHandler
      updateBookletRecipientsTransitionHandler.updateStream("1", secondParticipationStateTransition, bookletId, List(user1.id, user2.id))
    }
  }

  "UpdateBookletRecipientsTransitionHandler.getFullNames" should {
    "get full names for a list of users" in {
      val updateBookletRecipientsTransitionHandler: UpdateBookletRecipientsTransitionHandler = new UpdateBookletRecipientsTransitionHandler
      val fullNames: String = updateBookletRecipientsTransitionHandler.getFullNames(List(user1.id, user2.id, user3.id))
      fullNames mustBe "Test User1, Test User2, Test User3"
    }
  }

  "DeleteBookletRecipientsTransitionHandler.handleTransition" should {
    "handle transition when a booklet is being deleted" in {
      val bookletInfo: BookletInfo = getBooklet
      val deleteBookletRecipientsTransitionHandler: DeleteBookletRecipientsTransitionHandler = new DeleteBookletRecipientsTransitionHandler
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(), "farmland", bookletInfo, "")
      deleteBookletRecipientsTransitionHandler.handleTransition("1", fourthParticipationStateTransition, bookletId, List(user1.id, user2.id), bookletEmailNotificationManager, "farmland")
    }
  }

  "DeleteBookletRecipientsTransitionHandler.persistChanges" should {
    "delete a transition in a booklet" in {
      val bookletInfo: BookletInfo = getBooklet
      val deleteBookletRecipientsTransitionHandler: DeleteBookletRecipientsTransitionHandler = new DeleteBookletRecipientsTransitionHandler
      val bookletEmailNotificationManager: BookletEmailNotificationManager = new BookletEmailNotificationManager(Seq(), "farmland", bookletInfo, "")
      deleteBookletRecipientsTransitionHandler.persistChanges("1", fourthParticipationStateTransition, bookletId, user3.id, "farmland")
    }
  }

  "DeleteBookletRecipientsTransitionHandler.updateStream" should {
    "update the commentstream in the booklet" in {
      val deleteBookletRecipientsTransitionHandler: DeleteBookletRecipientsTransitionHandler = new DeleteBookletRecipientsTransitionHandler
      deleteBookletRecipientsTransitionHandler.updateStream("1", fourthParticipationStateTransition, bookletId, List(user1.id, user2.id))
    }
  }

  "DeleteBookletRecipientsTransitionHandler.getFullNames" should {
    "get full names for a list of users" in {
      val deleteBookletRecipientsTransitionHandler: DeleteBookletRecipientsTransitionHandler = new DeleteBookletRecipientsTransitionHandler
      val fullNames: String = deleteBookletRecipientsTransitionHandler.getFullNames(List(user1.id, user2.id, user3.id))
      fullNames mustBe "Test User1, Test User2, Test User3"
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
