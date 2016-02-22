package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject

case class BookletInfoSharingRecipient(
  id:          String,
  shareStatus: String,
  dataSource:  Option[String],
  userId:      String,
  bookletId:   String
) extends DocumentObject

object BookletInfoSharingRecipient extends DocumentObject {
  override def source = "bookletRecipients"
}
