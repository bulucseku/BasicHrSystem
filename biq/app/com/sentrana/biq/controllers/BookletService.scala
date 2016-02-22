package com.sentrana.biq.controllers

import org.joda.time.DateTime
import org.json4s.native.Serialization.{ read, write }

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.biq.datacontract.{ BookletInfo, BookletInfoSharingRecipient, ReportInfo, SharingInfo, SharingObjectChangeType, SharingObjectType }
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.biq.exceptions._
import com.sentrana.usermanagement.controllers.Authentication
import com.sentrana.usermanagement.datacontract.{ ResponseMessage, ResponseMessageCode }
import com.sentrana.usermanagement.domain.document.User

object BookletService extends BookletService with PlayLoggerComponent

trait BookletService extends BaseController with Authentication with RepoAccess {
  this: LoggerComponent =>

  lazy val mongoDataServices = BIQDataServices()

  def getBooklets = RepoAction { implicit request =>
    val user = request.userSession.user
    val dataSource = request.repository.id

    appLogger.debug(s"Get booklets for user ${user.userName} in repository $dataSource")

    val bookletList = mongoDataServices.getDocuments[BookletInfo](
      Map("createUserId" -> s"${user.id}", "dataSource" -> s"${dataSource}")
    )
    val sharedBookletIds: List[BookletInfoSharingRecipient] = mongoDataServices
      .getDocuments[BookletInfoSharingRecipient](
        Map("userId" -> user.id.toString, "dataSource" -> dataSource, "shareStatus" -> "AC")
      )
    val sharedBookletList: List[BookletInfo] = sharedBookletIds.map { el =>
      mongoDataServices.getDocuments[BookletInfo](Map("id" -> el.bookletId)).headOption
    }.collect { case Some(booklet) => booklet }

    Ok(write((bookletList ++ sharedBookletList).map(booklet => booklet.copy(shared = booklet.bookletSharings.map(!_.isEmpty)))))
    //Ok(write((bookletList ++ sharedBookletList).map(booklet => booklet.copy(shared = Some(!booklet.bookletSharings.isEmpty)))))
  }

  def ConvertBookletInfoToBookletPersistenceObject(bookletInfoPosted: BookletInfoPosted, userId: String, userName: String, repository: String, bookletInfoOption: Option[BookletInfo]): BookletInfo = {
    val now = DateTime.now().getMillis
    val newName = bookletInfoPosted.name
    val newDataSource = repository
    val newLastModUser = userName
    val newLastModDate = now

    var newId = ""
    var newCreateUserId = ""
    var newCreateUser = ""
    var newCreateDate = now
    var newBookletSharings: Option[Set[String]] = Some(Set[String]())
    val idOfBookletFinalReports = for (el <- bookletInfoPosted.reports) yield el.id
    var idOfExistingBookletReports = Seq[String]()
    bookletInfoOption match {
      case None =>
        newId = BIQServiceUtil.getObjectId.getOrElse("")
        newCreateUserId = userId
        newCreateUser = userName
        newCreateDate = now
      case Some(bookletInfo) =>
        newId = bookletInfo.id.getOrElse("")
        newCreateUserId = bookletInfo.createUserId
        newCreateUser = bookletInfo.createUser
        newCreateDate = bookletInfo.createDate
        newBookletSharings = Some(bookletInfo.bookletSharings.getOrElse(Set[String]()))
        idOfExistingBookletReports = bookletInfo.reports
    }

    val idOfReportsToUpdate = idOfBookletFinalReports.intersect(idOfExistingBookletReports)
    val idOfReportsToDelete = idOfExistingBookletReports.diff(idOfBookletFinalReports)

    for (el <- idOfReportsToDelete) {
      mongoDataServices.removeDocuments[ReportInfo](Map("id" -> el))
    }

    val newReports = bookletInfoPosted.reports.map { reportInfo =>
      mongoDataServices.getDocuments[ReportInfo](Map("id" -> reportInfo.id)).headOption match {
        case Some(report) =>
          if (idOfReportsToUpdate.contains(reportInfo.id)) {
            val updatedReport = report.copy(
              order       = Some(reportInfo.order),
              lastModUser = Some(newLastModUser),
              lastModDate = Some(newLastModDate)
            )
            mongoDataServices.updateDocument[ReportInfo](Map("id" -> reportInfo.id), updatedReport)
            Some(reportInfo.id)
          }
          else {
            val newReportId = BIQServiceUtil.getObjectId
            val newReport = report.copy(
              id           = newReportId,
              createUserId = Some(newCreateUserId),
              createUser   = Some(newCreateUser),
              createDate   = Some(newCreateDate),
              order        = Some(reportInfo.order),
              lastModUser  = Some(newLastModUser),
              lastModDate  = Some(newLastModDate),
              bookletId    = Some(newId)
            )

            if (report.createUserId.get != userId) {
              // If this is a shared report, we need to expand the derived columns.
              mongoDataServices.saveDocument[ReportInfo](BIQServiceUtil.expandColumnsForSharedReport(newReport))
            }
            else {
              mongoDataServices.saveDocument[ReportInfo](newReport)
            }

            Some(newReportId.get)
          }
        case None => None
      }
    }.flatten

    val bookletInfoReturn = new BookletInfo(
      id              = Some(newId),
      name            = newName,
      dataSource      = newDataSource,
      version         = Some(0),
      createDate      = newCreateDate,
      createUser      = newCreateUser,
      createUserId    = newCreateUserId,
      lastModDate     = newLastModDate,
      lastModUser     = newLastModUser,
      numberOfReports = newReports.length,
      reports         = newReports,
      shared          = Some(false),
      comments        = None,
      filterUnitIds   = None,
      bookletSharings = newBookletSharings
    )

    bookletInfoReturn
  }

  def addBooklet = RepoAction(parse.json) { implicit request =>
    val user = request.userSession.user
    val repositoryId = request.repository.id
    val dataSource = repositoryId

    appLogger.debug(s"Add booklet for user ${user.userName} in repository ${repositoryId}")

    val bookletInfoPosted = read[BookletInfoPosted](request.body.toString)
    bookletNameInUse(bookletInfoPosted.name, user.id.toString, dataSource)
    val bookletInfo = ConvertBookletInfoToBookletPersistenceObject(bookletInfoPosted, s"${user.id}", s"${user.firstName} ${user.lastName}", dataSource, None)

    mongoDataServices.saveDocument[BookletInfo](bookletInfo)

    val reportInfoList = bookletInfo.reports.map { id =>
      mongoDataServices.getDocuments[ReportInfo](Map("id" -> id)).headOption
    }.flatten
    val bookletReturn = new BookletInfoReturn(
      id              = bookletInfo.id,
      name            = bookletInfo.name,
      dataSource      = bookletInfo.dataSource,
      version         = bookletInfo.version,
      createDate      = bookletInfo.createDate,
      createUser      = bookletInfo.createUser,
      createUserId    = bookletInfo.createUserId,
      lastModUser     = bookletInfo.lastModUser,
      lastModDate     = bookletInfo.lastModDate,
      numberOfReports = reportInfoList.length,
      reports         = reportInfoList,
      shared          = bookletInfo.shared
    )

    Ok(write(bookletReturn))
  }

  def getReports(bookletId: String) = RepoAction { implicit request =>
    val user = request.userSession.user
    val repositoryId = request.repository.id

    appLogger.debug(s"Get reports in a booklet for user ${user.userName} in repository $repositoryId")

    val reports = mongoDataServices.getDocuments[BookletInfo](Map("id" -> bookletId)).headOption.map {
      booklet =>
        checkBookletAccess(booklet, user, includingSharingAccess = true)
        val reports = booklet.reports.map { id =>
          mongoDataServices.getDocuments[ReportInfo](Map("id" -> id)).headOption
        }.flatten
        if (booklet.createUserId != user.id) reports.map(BIQServiceUtil.expandColumnsForSharedReport) else reports
    }.getOrElse(Seq())

    Ok(write(reports))
  }

  def editBooklet(bookletId: String) = RepoAction(parse.json) { implicit request =>
    val user = request.userSession.user
    val repositoryId = request.repository.id
    val dataSource = repositoryId

    appLogger.debug(s"Edit booklet for user ${user.userName} in repository ${repositoryId}")

    mongoDataServices.getDocuments[BookletInfo](Map("id" -> bookletId)).headOption match {
      case Some(booklet) =>
        checkBookletAccess(booklet, user, false)
        for (el <- booklet.bookletSharings.getOrElse(Set[String]())) {
          mongoDataServices.getDocuments[BookletInfoSharingRecipient](Map("id" -> el)).headOption.foreach {
            info =>
              BIQServiceUtil.cacheSharingInfo(info.userId, new SharingInfo(
                objectId       = bookletId,
                repository     = dataSource,
                objectType     = SharingObjectType.BOOKLET.toString,
                changeType     = SharingObjectChangeType.UPDATED.toString,
                senderFullName = user.firstName + " " + user.lastName
              ))
          }
        }

        val bookletInfoPosted = read[BookletInfoPosted](request.body.toString)
        val bookletInfo = ConvertBookletInfoToBookletPersistenceObject(
          bookletInfoPosted, s"${user.id}", s"${user.firstName} ${user.lastName}", dataSource, Some(booklet)
        )
        mongoDataServices.updateDocument[BookletInfo](Map("id" -> bookletId), bookletInfo)

        val reportInfoList = bookletInfo.reports.map{
          el => mongoDataServices.getDocuments[ReportInfo](Map("id" -> el)).headOption
        }.flatten
        val bookletReturn = new BookletInfoReturn(
          id              = bookletInfo.id,
          name            = bookletInfo.name,
          dataSource      = bookletInfo.dataSource,
          version         = bookletInfo.version,
          createDate      = bookletInfo.createDate,
          createUser      = bookletInfo.createUser,
          createUserId    = bookletInfo.createUserId,
          lastModUser     = bookletInfo.lastModUser,
          lastModDate     = bookletInfo.lastModDate,
          numberOfReports = reportInfoList.length,
          reports         = reportInfoList,
          shared          = bookletInfo.shared
        )
        Ok(write(bookletReturn))
      case None => throw new BookletIDNotFoundException(bookletId)
    }
  }

  def copyBooklet(bookletId: String) = RepoAction(parse.json) { implicit request =>
    val user = request.userSession.user
    val repositoryId = request.repository.id
    val dataSource = repositoryId

    appLogger.debug(s"Copy booklet for user ${user.userName} in repository $repositoryId")

    val bookletInfoPosted = read[BookletInfoPosted](request.body.toString)

    bookletNameInUse(bookletInfoPosted.name, user.id.toString, dataSource)
    mongoDataServices.getDocuments[BookletInfo](Map("id" -> bookletId)).headOption match {
      case Some(bookletInfo) =>
        if (bookletInfo.createUserId != user.id) {
          val sharing = mongoDataServices.getDocuments[BookletInfoSharingRecipient](
            Map("bookletId" -> bookletId, "userId" -> user.id)
          ).headOption.getOrElse(
              throw new UnauthorizedBookletCopyException(user.userName, bookletId)
            )
        }
        val newReports = bookletInfo.reports.map { el =>
          mongoDataServices.getDocuments[ReportInfo](Map("id" -> el)).headOption.map { reportInfo =>
            new ReportInfoPosted(
              id    = reportInfo.id.getOrElse(""),
              name  = reportInfo.name,
              order = reportInfo.order.getOrElse(0)
            )
          }
        }.flatten

        val newBookletInfoPosted = new BookletInfoPosted(
          name    = bookletInfoPosted.name,
          reports = newReports
        )

        val newBookletInfo = ConvertBookletInfoToBookletPersistenceObject(
          newBookletInfoPosted, s"${user.id}", s"${user.firstName} ${user.lastName}", dataSource.toString, None
        )
        mongoDataServices.saveDocument[BookletInfo](newBookletInfo)

        val reportInfoList = for (el <- bookletInfo.reports) yield mongoDataServices.getDocuments[ReportInfo](Map("id" -> el)).head
        val bookletReturn = new BookletInfoReturn(
          id              = newBookletInfo.id,
          name            = newBookletInfo.name,
          dataSource      = newBookletInfo.dataSource,
          version         = newBookletInfo.version,
          createDate      = newBookletInfo.createDate,
          createUser      = newBookletInfo.createUser,
          createUserId    = newBookletInfo.createUserId,
          lastModUser     = newBookletInfo.lastModUser,
          lastModDate     = newBookletInfo.lastModDate,
          numberOfReports = reportInfoList.length,
          reports         = reportInfoList,
          shared          = newBookletInfo.shared
        )
        Ok(write(bookletReturn))
      case None => throw new BookletIDNotFoundException(bookletId)
    }
  }

  def deleteBooklet(bookletId: String) = RepoAction { implicit request =>
    val user = request.userSession.user
    val repositoryId = request.repository.id

    appLogger.debug(s"Delete booklet for user ${user.userName} in repository ${repositoryId}")

    mongoDataServices.getDocuments[BookletInfo](Map("id" -> bookletId)).headOption match {
      case Some(bookletInfo) =>
        if (bookletInfo.createUserId == user.id.toString) {
          for (el <- bookletInfo.bookletSharings.getOrElse (Set[String]())) {
            mongoDataServices.getDocuments[BookletInfoSharingRecipient] (Map ("id" -> el)).headOption.foreach { info =>
              BIQServiceUtil.cacheSharingInfo(info.userId, new SharingInfo(
                objectId       = bookletId,
                repository     = repositoryId,
                objectType     = SharingObjectType.BOOKLET.toString,
                changeType     = SharingObjectChangeType.DELETED.toString,
                senderFullName = user.firstName + " " + user.lastName
              ))
            }
          }
          mongoDataServices.removeDocuments[BookletInfo] (Map ("id" -> bookletId))
          mongoDataServices.removeDocuments[BookletInfoSharingRecipient] (Map ("bookletId" -> bookletId))
          mongoDataServices.removeDocuments[ReportInfo] (Map ("bookletId" -> bookletId))
        }
        else {
          val map = Map ("bookletId" -> bookletId, "userId" -> user.id.toString)
          mongoDataServices.getDocuments[BookletInfoSharingRecipient](map).headOption match {
            case Some(bookletInfoSharingRecipient) =>
              val newBookletInfoSharingRecipient: BookletInfoSharingRecipient = bookletInfoSharingRecipient.copy(shareStatus = "RJ")
              mongoDataServices.updateDocument[BookletInfoSharingRecipient](map, newBookletInfoSharingRecipient)
            case None =>
              throw new UnauthorizedBookletDeleteException(user.userName, bookletId)
          }
        }
        Ok (write (new ResponseMessage(ResponseMessageCode.SUCCESS.toString, "Booklet deleted successfully!")))
      case None => NotFound("Booklet not found with id: " + bookletId)
    }

  }

  def bookletNameInUse(name: String, id: String, repository: String) = {
    val bookletInfoLists = mongoDataServices.getDocuments[BookletInfo](Map("name" -> name, "createUserId" -> id, "dataSource" -> repository))

    if (bookletInfoLists.nonEmpty) {
      throw new BookletNameAlreadyInUseException(name)
    }
  }

  def checkBookletAccess(booklet: BookletInfo, user: User, includingSharingAccess: Boolean): Unit = {

    if (booklet.createUserId != user.id) {
      if (includingSharingAccess) {
        if (!hasSharingAccess(booklet, user.id)) {
          throw new UnauthorizedBookletAccessException(user.userName, booklet.id.getOrElse(booklet.name))
        }
      }
      else {
        throw new UnauthorizedBookletAccessException(user.userName, booklet.id.getOrElse(booklet.name))
      }
    }
  }

  def hasSharingAccess(booklet: BookletInfo, userId: String): Boolean = {
    val sharingInfo: List[BookletInfoSharingRecipient] = mongoDataServices
      .getDocuments[BookletInfoSharingRecipient](
        Map("bookletId" -> booklet.id.get, "userId" -> userId, "dataSource" -> booklet.dataSource, "shareStatus" -> "AC")
      )
    !sharingInfo.isEmpty
  }

}

case class ReportInfoPosted(
  name:  String,
  id:    String,
  order: Int
)

case class BookletInfoPosted(
  name:    String,
  reports: Seq[ReportInfoPosted]
)

case class BookletInfoReturn(
  id:              Option[String],
  name:            String,
  dataSource:      String,
  version:         Option[Int],
  createDate:      Long,
  createUser:      String,
  createUserId:    String,
  lastModDate:     Long,
  lastModUser:     String,
  numberOfReports: Int,
  reports:         Seq[ReportInfo],
  shared:          Option[Boolean]
)
