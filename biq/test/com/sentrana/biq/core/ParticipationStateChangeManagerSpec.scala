package com.sentrana.biq.core

import com.sentrana.biq.UnitSpec
import com.sentrana.biq.datacontract.RecipientInfo

/**
 * Created by Shamir on 3/11/2015.
 */
class ParticipationStateChangeManagerSpec extends UnitSpec {
  val recipientInfoPrevState: RecipientInfo = RecipientInfo("27", "AC")
  val recipientInfoNextState: RecipientInfo = RecipientInfo("27", "RV")

  val participationStateChangeManager: ParticipationStateChangeManager = new ParticipationStateChangeManager

  "ParticipationStateChangeManagerSpec.recordOriginal" should {
    "record original state with ParticipationStateChangeManager" in {
      participationStateChangeManager.recordOriginal(recipientInfoPrevState)
      participationStateChangeManager.participationStateTransitionMap("27").fromState mustBe "AC"

    }
  }

  "ParticipationStateChangeManagerSpec.recordNew" should {
    "record new state with ParticipationStateChangeManager" in {
      participationStateChangeManager.recordNew(recipientInfoNextState)
      participationStateChangeManager.participationStateTransitionMap("27").toState mustBe "RV"
    }
  }

  "ParticipationStateChangeManagerSpec.getChange" should {
    "get change ParticipationStateChangeManager" in {
      val participationStateChange: ParticipationStateTransition = participationStateChangeManager.getChange(recipientInfoPrevState)

      participationStateChange.fromState mustBe "AC"
      participationStateChange.toState mustBe "RV"
    }
  }

  "ParticipationStateChangeManagerSpec.userIDsWithStatusChange" should {
    "get userIds for changed status with ParticipationStateChangeManager" in {
      val userIds: List[String] = participationStateChangeManager.userIDsWithStatusChange("AC", "RV")
      userIds mustBe List("27")
    }
  }
}
