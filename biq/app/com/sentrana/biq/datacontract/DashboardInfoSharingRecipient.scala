package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject

case class DashboardInfoSharingRecipient(
  id:          String,
  shareStatus: String,
  dataSource:  Option[String],
  userId:      String,
  dashboardId: String
) extends DocumentObject

object DashboardInfoSharingRecipient extends DocumentObject {
  override def source = "dashboardRecipients"
}
