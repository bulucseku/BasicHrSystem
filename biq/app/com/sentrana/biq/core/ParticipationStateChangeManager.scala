package com.sentrana.biq.core

import com.sentrana.biq.datacontract.RecipientInfo

class ParticipationStateChangeManager {

  var participationStateTransitionMap: Map[String, ParticipationStateTransition] = Map.empty[String, ParticipationStateTransition]

  def getChange(ri: RecipientInfo): ParticipationStateTransition = {

    if (!participationStateTransitionMap.contains(ri.userID)) {
      participationStateTransitionMap = participationStateTransitionMap ++ Map(ri.userID -> new ParticipationStateTransition)
    }

    participationStateTransitionMap(ri.userID)
  }

  def recordOriginal(ri: RecipientInfo): Unit = {
    getChange(ri).fromState = ri.partStatus
  }

  def recordNew(ri: RecipientInfo): Unit = {
    getChange(ri).toState = ri.partStatus
  }

  def userIDsWithStatusChange(from: String, to: String): List[String] = {
    var userIds = List[String]()
    for ((key, value) <- participationStateTransitionMap) {
      if (value.fromState == from && value.toState == to) {
        userIds = userIds :+ key
      }
    }
    userIds
  }
}

case class ParticipationStateTransition(
  var fromState: String = null,
  var toState:   String = null
)