package com.sentrana.biq.core

object BookletRecipientManager {
  var transitionHandlerMap = Map[ParticipationStateTransition, TransitionHandler]()

  val handlers: List[TransitionHandler] = List(new CreateBookletRecipientsTransitionHandler(), new UpdateBookletRecipientsTransitionHandler(), new DeleteBookletRecipientsTransitionHandler());

  for (el <- handlers; tr <- el.transitions) {
    transitionHandlerMap = transitionHandlerMap ++ Map(tr -> el)
  }

  def handleAllTransitions(sender: String, bookletID: String, pscManager: ParticipationStateChangeManager, enManager: EmailNotificationManager, repositoryID: String): Unit = {
    for ((key, value) <- transitionHandlerMap) {
      value.handleTransition(sender, key, bookletID, pscManager.userIDsWithStatusChange(key.fromState, key.toState), enManager, repositoryID)
    }
  }
}