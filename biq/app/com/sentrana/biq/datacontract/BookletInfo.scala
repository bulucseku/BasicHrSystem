package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject

/**
 * Information about a saved booklet.
 *
 * @constructor
 * @param id   The ID for the booklet.
 * @param name    The name of the booklet (that we show to users).
 * @param dataSource   The ID of the data warehouse that this booklet belongs to.
 * @param version   The version number of this booklet.
 * @param createDate   The creation date for this booklet. Result is returned as a number of milliseconds that could be used to create a JavaScript object directly. Time is returned as UTC and should be converted to local time by the client.
 * @param createUser   The full name of the user that created the booklet. For a shared booklet, this may be different than the logged on user.
 * @param createUserId   The full name of the user that created the booklet. For a shared booklet, this may be different than the logged on user.
 * @param lastModDate   The last modification date for this booklet. Result is returned as a number of milliseconds that be used to create a JavaScript object directly. Time is returned as UTC and should be converted to local time by the client.
 * @param lastModUser   The full name of the user that last modified the booklet.
 * @param numberOfReports   Total number of reports in the booklet.
 * @param reports   Report Id list of the booklet.
 * @param shared   Whether this report is shared or not.
 */
case class BookletInfo(
  id:              Option[String],
  name:            String,
  dataSource:      String,
  version:         Option[Int],
  createDate:      Long,
  createUser:      String,
  createUserId:    String,
  lastModDate:     Long,
  lastModUser:     String,
  numberOfReports: Int,
  reports:         Seq[String],
  comments:        Option[CommentStreamInfo],
  shared:          Option[Boolean],
  filterUnitIds:   Option[String],
  bookletSharings: Option[Set[String]]
) extends DocumentObject

object BookletInfo extends DocumentObject {
  override def source = "booklet"
}