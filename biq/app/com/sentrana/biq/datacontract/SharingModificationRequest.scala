package com.sentrana.biq.datacontract

/**
 * An object that defines a new set of recipients for a report along with information on an email that is sent to the new recipients.
 *
 * @constructor
 * @param recips   The new list of recipients for a given report.
 * @param emailInfos   Information that is used to form an email to the new recipients of the report.
 */
case class SharingModificationRequest(
  recips:     Seq[RecipientInfo],
  emailInfos: Option[Seq[EmailNotificationInfo]]
)
