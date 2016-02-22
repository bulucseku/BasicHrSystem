package com.sentrana.biq.datacontract

/**
 * Information on how to send an email to a new set of recipients.
 *
 * @constructor
 * @param fromStatus   The state that the recipient had to be in for an email to be sent to him.
 * @param toStatus   The state that the recipient has to be now for an email to be sent to him.
 * @param subject   The subject of the email.
 * @param body   The body of the email.
 */
case class EmailNotificationInfo(
  fromStatus: String,
  toStatus:   String,
  subject:    String,
  body:       String
)
