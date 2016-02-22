package com.sentrana.biq.controllers

import org.joda.time.DateTime
import org.json4s.native.Serialization._

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.datacontract.UserInfo
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.biq.core._
import com.sentrana.biq.datacontract._
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.biq.exceptions.UnauthorizedBookletAccessException
import com.sentrana.usermanagement.controllers.Authentication
import com.sentrana.usermanagement.domain.document.{ UMDataServices, User }

object BookletSharingService extends BookletSharingService with PlayLoggerComponent

trait BookletSharingService extends BaseController with Authentication with RepoAccess {
  this: LoggerComponent =>

  lazy val mongoDataServices = BIQDataServices()

  def getAvailableBookletRecipients(bookletId: String) = RepoAction { implicit request =>
    val repositoryId: String = request.repository.id
    val orgNames = RepositoryPermissions.getOrganizations(repositoryId)
    val orgIds = UMDataServices.getOrganizations.filter(o => orgNames.exists(x => x.equals(o.name))).map(y => y.id).toList

    val currentUser = request.userSession.user
    val repository = request.repository

    mongoDataServices.getDocuments[BookletInfo](Map("id" -> bookletId)).headOption match {
      case Some(bookletInfo) =>
        val orgHasAccess = if (repository.getCategoryAttribute != None) {
          val bookletFilterUnitIds: String = bookletInfo.filterUnitIds.getOrElse("")
          val selectedCategoryNames = bookletFilterUnitIds.toString.split('|')
            .map(filter => filter.split(":", 2))
            .filter(arr => arr.length == 2)
            .collect {
              case Array(attributeName, elementValue) if attributeName == "CategoryName" => elementValue
            }

          val allOrganizations = UMDataServices.getOrganizations

          allOrganizations.map { org =>
            val accessibles = RepositoryAccess.getOrgAccessibles(repository, org.id)
            if (selectedCategoryNames.diff(accessibles.collect{ case pc: ProductCategory => pc.name }).isEmpty)
              Some(org.id)
            else None
          }.flatten
        }
        else {
          orgIds
        }

        val users = orgHasAccess.intersect(orgIds).flatMap(o => UMDataServices.getOrganizationById(o).activeUsers).filter(u => u.id != currentUser.id)
          .map(user => UserInfo(
            firstName   = user.firstName,
            lastName    = user.lastName,
            companyName = user.organization.name,
            userID      = user.id,
            userName    = "",
            email       = Some("")
          ))

        Ok(write(users))
      case None => NotFound("Booklet not found with id: " + bookletId)
    }
  }

  def getBookletRecipients(bookletId: String) = AuthAction { implicit request =>
    val currentUser = request.userSession.user
    val bookletInfo = getBookletForUserIfAccessible(bookletId, currentUser.id)
    val sharings = bookletInfo.bookletSharings.getOrElse(Set[String]())
    val recipientInfos: Set[RecipientInfo] = sharings.map {
      el =>
        mongoDataServices.getDocuments[BookletInfoSharingRecipient](Map("id" -> el)).headOption.map { recipientInfo =>
          RecipientInfo(userID = recipientInfo.userId, partStatus = recipientInfo.shareStatus)
        }
    }.flatten
    Ok(write(recipientInfos))
  }

  def removeAllBookletRecipients(bookletId: String) = RepoAction { implicit request =>
    val repositoryId = request.repository.id
    val currentUser = request.userSession.user
    val bookletInfo = getBookletForUserIfAccessible(bookletId, currentUser.id)
    val bookletRecipientsToRemove = bookletInfo.bookletSharings.getOrElse(Set[String]())
    val updatedBooklet = bookletInfo.copy(bookletSharings = None)
    mongoDataServices.updateDocument[BookletInfo](Map("id" -> bookletId), updatedBooklet)
    bookletRecipientsToRemove.foreach{
      recipientId =>
        mongoDataServices.getDocuments[BookletInfoSharingRecipient](Map("id" -> recipientId)).headOption.foreach { info =>
          BIQServiceUtil.cacheSharingInfo(
            info.userId,
            new SharingInfo(
              objectId       = bookletId,
              repository     = repositoryId,
              objectType     = SharingObjectType.BOOKLET.toString,
              changeType     = SharingObjectChangeType.RV.toString,
              senderFullName = currentUser.firstName + " " + currentUser.lastName
            )
          )
        }
        mongoDataServices.removeDocuments[BookletInfoSharingRecipient](Map("id" -> recipientId))
    }

    val commentInfo = new CommentInfo(
      userName = Some(s"${currentUser.firstName} ${currentUser.lastName}"),
      userId   = Some(s"${currentUser.id}"),
      date     = Some(DateTime.now.getMillis),
      msg      = "Unshared the booklet with all recipients.",
      cid      = Some(""),
      editable = Some(false)
    )

    addBookletComment(bookletInfo, commentInfo, currentUser)
    Ok(write(""))
  }

  def modifyBookletRecipients(bookletId: String) = RepoAction(parse.json) { implicit request =>
    val sharingModRequest = read[SharingModificationRequest](request.body.toString)
    val currentUser = request.userSession.user
    val bookletInfo = getBookletForUserIfAccessible(bookletId, currentUser.id)
    val repositoryId = request.repository.id
    val pscManager: ParticipationStateChangeManager = new ParticipationStateChangeManager
    val repositoryName = request.repository.name

    val originalRecipients: Traversable[RecipientInfo] = bookletInfo.bookletSharings.getOrElse(Set[String]()).map {
      el =>
        mongoDataServices.getDocuments[BookletInfoSharingRecipient](Map("id" -> el)).headOption.map {
          recipient => RecipientInfo(userID = recipient.userId, partStatus = recipient.shareStatus)
        }
    }.flatten
    originalRecipients.foreach(pscManager.recordOriginal)
    sharingModRequest.recips.foreach(pscManager.recordNew)

    val sharedObjectType = "booklet"
    val enManager = new BookletEmailNotificationManager(
      enInfos        = sharingModRequest.emailInfos.getOrElse(Seq()),
      repository     = repositoryName,
      bookletInfo    = bookletInfo,
      applicationUrl = SecurityService.getAppUrl + s"/#!viewsharedobject?id=$bookletId&type=$sharedObjectType&repository=$repositoryId"
    )

    BookletRecipientManager.handleAllTransitions(currentUser.id.toString, bookletId, pscManager, enManager, repositoryId)
    for (el <- sharingModRequest.recips) {
      val sharingInfo = new SharingInfo(
        objectId       = bookletId,
        objectType     = SharingObjectType.BOOKLET.toString,
        changeType     = el.partStatus,
        repository     = repositoryId,
        senderFullName = currentUser.firstName + " " + currentUser.lastName
      )
      BIQServiceUtil.cacheSharingInfo(el.userID, sharingInfo)
    }

    val newBookletInfo = getBookletForUserIfAccessible(bookletId, currentUser.id)
    val recipientInfos = newBookletInfo.bookletSharings.getOrElse(Set[String]()).map { el =>
      mongoDataServices.getDocuments[BookletInfoSharingRecipient](Map("id" -> el)).headOption.map { recipientInfo =>
        RecipientInfo(userID = recipientInfo.userId, partStatus = recipientInfo.shareStatus)
      }
    }.flatten

    Ok(write(recipientInfos))
  }

  def getBookletForUserIfAccessible(bookletId: String, userId: String): BookletInfo = {
    val query = Map("createUserId" -> userId, "id" -> bookletId)
    mongoDataServices.getDocuments[BookletInfo](query).headOption match {
      case None              => throw new UnauthorizedBookletAccessException(userId, bookletId)
      case Some(bookletInfo) => bookletInfo
    }
  }

  def addBookletComment(booklet: BookletInfo, comment: CommentInfo, user: User) = {
    val newCommentStream = booklet.comments match {
      case None    => Some(CommentStreamInfo(None, List(comment)))
      case Some(x) => Some(CommentStreamInfo(None, x.comments :+ comment))
    }
    val updatedBooklet = booklet.copy(comments = newCommentStream)
    mongoDataServices.updateDocument[BookletInfo](Map("id" -> booklet.id), updatedBooklet)
    Ok(write(updatedBooklet))
  }
}
