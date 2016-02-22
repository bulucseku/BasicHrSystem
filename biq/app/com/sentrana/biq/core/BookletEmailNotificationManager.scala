package com.sentrana.biq.core

import com.sentrana.biq.datacontract._

class BookletEmailNotificationManager(enInfos: Seq[EmailNotificationInfo], repository: String, bookletInfo: BookletInfo, applicationUrl: String) extends EmailNotificationManager(enInfos, repository, None, Some(bookletInfo), applicationUrl) {
  for (el <- enInfos) {
    val subject: String = if (el.subject != null && el.subject != "") el.subject else s"Booklet Routing: ${bookletInfo.name}"
    emailPartsMap = emailPartsMap ++ Map(new ParticipationStateTransition(el.fromStatus, el.toStatus) -> new EmailParts(subject, el.body))
  }
  override val (objectType, objectName) = ("booklet", bookletInfo.name)
}