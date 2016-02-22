package com.sentrana.biq.controllers

import com.sentrana.biq.datacontract._
import com.sentrana.biq.exceptions.{ DashboardNameAlreadyInUseException }
import org.joda.time.DateTime
import org.json4s.native.Serialization.{ read, write }
import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.usermanagement.controllers.Authentication

object DashboardService extends DashboardService with PlayLoggerComponent

trait DashboardService extends BaseController with Authentication with RepoAccess {
  this: LoggerComponent =>

  lazy val mongoDataServices = BIQDataServices()
  val HttpRequestSizeLimit = play.api.Play.current.configuration.getInt("HttpRequestSizeLimit").getOrElse(1) * 1024 * 1024

  def getDashboards = RepoAction { implicit request =>
    val user = request.userSession.user
    val dataSource = request.repository.id

    appLogger.debug(s"Get dashboards for user ${user.userName} in repository $dataSource")

    val dashboardList = mongoDataServices.getDocuments[DashboardInfo](
      Map("createUserId" -> s"${user.id}", "dataSource" -> s"${dataSource}")
    )
    val sharedDashboardIds: List[DashboardInfoSharingRecipient] = mongoDataServices
      .getDocuments[DashboardInfoSharingRecipient](
        Map("userId" -> user.id.toString, "dataSource" -> dataSource, "shareStatus" -> "AC")
      )
    val sharedDashboardList: List[DashboardInfo] = sharedDashboardIds.map { el =>
      mongoDataServices.getDocuments[DashboardInfo](Map("id" -> el.dashboardId)).headOption
    }.collect { case Some(dashboard) => dashboard }

    Ok(write((dashboardList ++ sharedDashboardList).map(dashboard => dashboard.copy(shared = dashboard.dashboardSharings.map(!_.isEmpty)))))
  }

  def addDashboard = RepoAction(parse.json(maxLength = HttpRequestSizeLimit)) { implicit request =>
    val user = request.userSession.user
    val repositoryId = request.repository.id
    val dataSource = repositoryId

    appLogger.debug(s"Add dashboard for user ${user.userName} in repository ${repositoryId}")

    val dashboardInfoPosted = read[DashboardInfoPosted](request.body.toString)
    dashboardNameInUse(dashboardInfoPosted.name, user.id.toString, dataSource)
    val dashboardInfo = ConvertDashboardInfoToDashboardPersistenceObject(dashboardInfoPosted, s"${user.id}", s"${user.firstName} ${user.lastName}", dataSource, None)

    mongoDataServices.saveDocument[DashboardInfo](dashboardInfo)

    val dashboardReturn = new DashboardInfoReturn(
      id            = dashboardInfo.id,
      name          = dashboardInfo.name,
      dataSource    = dashboardInfo.dataSource,
      version       = dashboardInfo.version,
      createDate    = dashboardInfo.createDate,
      createUser    = dashboardInfo.createUser,
      createUserId  = dashboardInfo.createUserId,
      lastModUser   = dashboardInfo.lastModUser,
      lastModDate   = dashboardInfo.lastModDate,
      numberOfPages = dashboardInfo.pages.length,
      pages         = dashboardInfo.pages,
      shared        = dashboardInfo.shared
    )

    Ok(write(dashboardReturn))
  }

  def dashboardNameInUse(name: String, id: String, repository: String) = {
    val dashboardInfoLists = mongoDataServices.getDocuments[DashboardInfo](Map("name" -> name, "createUserId" -> id, "dataSource" -> repository))

    if (dashboardInfoLists.nonEmpty) {
      throw new DashboardNameAlreadyInUseException(name)
    }
  }

  def ConvertDashboardInfoToDashboardPersistenceObject(dashboardInfoPosted: DashboardInfoPosted, userId: String, userName: String, repository: String, dashboardInfoOption: Option[DashboardInfo]): DashboardInfo = {
    val now = DateTime.now().getMillis
    val newName = dashboardInfoPosted.name
    val newDataSource = repository
    val newLastModUser = userName
    val newLastModDate = now

    var newId = ""
    var newCreateUserId = ""
    var newCreateUser = ""
    var newCreateDate = now
    var newDashboardSharings: Option[Set[String]] = Some(Set[String]())
    dashboardInfoOption match {
      case None =>
        newId = BIQServiceUtil.getObjectId.getOrElse("")
        newCreateUserId = userId
        newCreateUser = userName
        newCreateDate = now
      case Some(dashboardInfo) =>
        newId = dashboardInfo.id.getOrElse("")
        newCreateUserId = dashboardInfo.createUserId
        newCreateUser = dashboardInfo.createUser
        newCreateDate = dashboardInfo.createDate
        newDashboardSharings = Some(dashboardInfo.dashboardSharings.getOrElse(Set[String]()))
    }

    val dashboardInfoReturn = new DashboardInfo(
      id                = Some(newId),
      name              = newName,
      dataSource        = newDataSource,
      version           = Some(0),
      createDate        = newCreateDate,
      createUser        = newCreateUser,
      createUserId      = newCreateUserId,
      lastModDate       = newLastModDate,
      lastModUser       = newLastModUser,
      numberOfPages     = dashboardInfoPosted.pages.length,
      pages             = dashboardInfoPosted.pages.map(page => new PageInfo(page.id, page.name, page.layoutConfig, page.order, page.height)),
      shared            = Some(false),
      comments          = None,
      dashboardSharings = newDashboardSharings
    )

    dashboardInfoReturn
  }

} //class

case class PageInfoPosted(
  id:           String,
  name:         String,
  layoutConfig: String,
  order:        Int,
  height:       Int
)

case class DashboardInfoPosted(
  name:  String,
  pages: Seq[PageInfoPosted]
)

case class DashboardInfoReturn(
  id:            Option[String],
  name:          String,
  dataSource:    String,
  version:       Option[Int],
  createDate:    Long,
  createUser:    String,
  createUserId:  String,
  lastModDate:   Long,
  lastModUser:   String,
  numberOfPages: Int,
  pages:         Seq[PageInfo],
  shared:        Option[Boolean]
)