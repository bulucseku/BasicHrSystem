package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject

/**
 * Information about a saved booklet.
 *
 * @constructor
 * @param id   The ID for the sharing instance.
 * @param shareStatus    The sharing status of the report for the user.
 * @param userId    The user id with whom the report has been shared.
 */

case class ReportInfoSharingRecipient(
  id:          String,
  shareStatus: String,
  dataSource:  Option[String],
  userId:      String,
  reportId:    String
) extends DocumentObject

object ReportInfoSharingRecipient extends DocumentObject {
  override def source = "reportRecipients"
}
