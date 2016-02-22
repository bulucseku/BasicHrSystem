package com.sentrana.biq.core

object ReportRecipientManager {
  var transitionHandlerMap = Map[ParticipationStateTransition, TransitionHandler]()

  val handlers: List[TransitionHandler] = List(new CreateRecipientsTransitionHandler(), new UpdateRecipientsTransitionHandler(), new DeleteRecipientsTransitionHandler())

  for (el <- handlers; tr <- el.transitions) {
    transitionHandlerMap = transitionHandlerMap ++ Map(tr -> el)
  }

  def handleAllTransitions(sender: String, reportID: String, pscManager: ParticipationStateChangeManager, enManager: EmailNotificationManager, repositoryID: String): Unit = {
    for ((key, value) <- transitionHandlerMap) {
      value.handleTransition(sender, key, reportID, pscManager.userIDsWithStatusChange(key.fromState, key.toState), enManager, repositoryID)
    }
  }
}