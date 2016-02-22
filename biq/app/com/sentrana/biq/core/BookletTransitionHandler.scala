package com.sentrana.biq.core

import com.sentrana.biq.datacontract._
import com.sentrana.usermanagement.authentication.Guid

class CreateBookletRecipientsTransitionHandler extends TransitionHandler {

  override val transitions: List[ParticipationStateTransition] = List(new ParticipationStateTransition(null, "AC"))

  override def updateStream(sender: String, transition: ParticipationStateTransition, bookletID: String, userIDs: List[String]): Unit = {

  }
  override def persistChanges(sender: String, transition: ParticipationStateTransition, bookletID: String, userID: String, repositoryID: String): Unit = {
    val bookletRecipientId = Guid[String].random.id
    val bookletRecipient: BookletInfoSharingRecipient = new BookletInfoSharingRecipient(
      id          = bookletRecipientId,
      shareStatus = transition.toState,
      dataSource  = Some(repositoryID),
      userId      = userID.toString,
      bookletId   = bookletID
    )

    mongoDataServices.saveDocument[BookletInfoSharingRecipient](bookletRecipient)
    val booklet: BookletInfo = mongoDataServices.getDocuments[BookletInfo](Map("id" -> bookletID)).headOption.getOrElse(
      throw new IllegalArgumentException("Booklet could not be found with id: " + bookletID)
    )

    var bookletSharings: Set[String] = booklet.bookletSharings.getOrElse(Set[String]())
    bookletSharings = bookletSharings + bookletRecipientId
    val newBooklet = booklet.copy(
      bookletSharings = Some(bookletSharings)
    )
    mongoDataServices.updateDocument[BookletInfo](Map("id" -> bookletID), newBooklet)
  }
}

class UpdateBookletRecipientsTransitionHandler extends TransitionHandler {

  override val transitions: List[ParticipationStateTransition] = List(new ParticipationStateTransition("AC", "RV"), new ParticipationStateTransition("RV", "AC"))

  override def updateStream(sender: String, transition: ParticipationStateTransition, bookletID: String, userIDs: List[String]): Unit = {

  }

  override def persistChanges(sender: String, transition: ParticipationStateTransition, bookletID: String, userID: String, repositoryID: String): Unit = {

    val bookletRecipientInfo: BookletInfoSharingRecipient = mongoDataServices.getDocuments[BookletInfoSharingRecipient](
      Map("userId" -> userID.toString, "bookletId" -> bookletID)
    ).headOption.getOrElse(
        throw new IllegalArgumentException("Booklet could not be found for user: " + userID.toString + " with id: " + bookletID)
      )
    val newBookletRecipientInfo: BookletInfoSharingRecipient = bookletRecipientInfo.copy(
      shareStatus = transition.toState
    )
    mongoDataServices.updateDocument[BookletInfoSharingRecipient](Map("userId" -> userID.toString, "bookletId" -> bookletID), newBookletRecipientInfo)
  }
}

class DeleteBookletRecipientsTransitionHandler extends TransitionHandler {
  override val transitions: List[ParticipationStateTransition] = List(new ParticipationStateTransition("RJ", "EX"), new ParticipationStateTransition("RV", "EX"))
  override def updateStream(sender: String, transition: ParticipationStateTransition, bookletID: String, userIDs: List[String]): Unit = {

  }
  override def persistChanges(sender: String, transition: ParticipationStateTransition, bookletID: String, userID: String, repositoryID: String): Unit = {
    val booklet: BookletInfo = mongoDataServices.getDocuments[BookletInfo](Map("id" -> bookletID)).headOption.getOrElse(
      throw new IllegalArgumentException("Booklet could not be found with id: " + bookletID)
    )

    val bookletSharingsId = mongoDataServices.getDocuments[BookletInfoSharingRecipient](
      Map("userId" -> userID.toString, "bookletId" -> bookletID)
    ).headOption.getOrElse(
        throw new IllegalArgumentException("BookletSharingInfo could not be found for user: " + userID.toString + " with id: " + bookletID)
      ).id

    val bookletSharings = booklet.bookletSharings.getOrElse(Set[String]()).filterNot(r => r == bookletSharingsId)

    mongoDataServices.removeDocuments[BookletInfoSharingRecipient](
      Map("userId" -> userID.toString, "bookletId" -> bookletID)
    )
    val newBooklet = booklet.copy(
      bookletSharings = Some(bookletSharings)
    )
    mongoDataServices.updateDocument[BookletInfo](Map("id" -> bookletID), newBooklet)
  }
}