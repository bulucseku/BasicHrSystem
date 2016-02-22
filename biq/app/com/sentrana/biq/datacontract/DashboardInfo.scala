package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject
import com.sentrana.appshell.domain.DocumentObject

/**
 * Information about a saved booklet.
 *
 * @constructor
 * @param id   The ID for the dashboard.
 * @param name    The name of the dashboard (that we show to users).
 * @param dataSource   The ID of the data warehouse that this dashboard belongs to.
 * @param version   The version number of this dashboard.
 * @param createDate   The creation date for this dashboard. Result is returned as a number of milliseconds that could be used to create a JavaScript object directly. Time is returned as UTC and should be converted to local time by the client.
 * @param createUser   The full name of the user that created the dashboard. For a shared dashboard, this may be different than the logged on user.
 * @param createUserId   The full name of the user that created the dashboard. For a shared dashboard, this may be different than the logged on user.
 * @param lastModDate   The last modification date for this dashboard. Result is returned as a number of milliseconds that be used to create a JavaScript object directly. Time is returned as UTC and should be converted to local time by the client.
 * @param lastModUser   The full name of the user that last modified the dashboard.
 * @param numberOfPages   Total number of pages in the dashboard.
 * @param pages   Report Id list of the dashboard.
 * @param shared   Whether this report is shared or not.
 */
case class DashboardInfo(
  id:                Option[String],
  name:              String,
  dataSource:        String,
  version:           Option[Int],
  createDate:        Long,
  createUser:        String,
  createUserId:      String,
  lastModDate:       Long,
  lastModUser:       String,
  numberOfPages:     Int,
  pages:             Seq[PageInfo],
  comments:          Option[CommentStreamInfo],
  shared:            Option[Boolean],
  dashboardSharings: Option[Set[String]]
) extends DocumentObject

object DashboardInfo extends DocumentObject {
  override def source = "dashboard"
}
