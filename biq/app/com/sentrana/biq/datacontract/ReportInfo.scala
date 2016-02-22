package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject

/**
 * Information about a saved report.
 *
 * @constructor
 * @param name    The name of the report (that we show to users).
 * @param id   The ID for the report.
 * @param dataSource   The ID of the data warehouse that this report belongs to.
 * @param version   The version number of this document.
 * @param createDate   The creation date for this report. Result is returned as a number of milliseconds that be used to create a JavaScript object directly. Time is returned as UTC and should be converted to local time by the client.
 * @param createUser   The full name of the user that created the report. For a shared report, this may be different than the logged on user.
 * @param createUserId   The full name of the user that created the report. For a shared report, this may be different than the logged on user.
 * @param lastModDate   The last modification date for this report. Result is returned as a number of milliseconds that be used to create a JavaScript object directly. Time is returned as UTC and should be converted to local time by the client.
 * @param lastModUser   The full name of the user that last modified the report.
 * @param definition   The definition of the report. This be directly executed by the <code>Execute<code> method.
 * @param chartOptions   The charting options associated this report.
 * @param showGrid   Whether the report grid should be shown when the report is executed.
 * @param showChart   Whether the report chart should be shown when the report is executed.
 * @param chartType   The type of the chart (if one is to be shown). Values include: "line", "pie", "column", ...
 * @param comments   A set of comments associated with this report.
 * @param shared   Whether this report is shared or not.
 * @param order   Order of the report, this would be used to define the order of the booklet report.
 * @param bookletId   id of the booklet to which this report belongs
 * @param resultOptions
 */
case class ReportInfo(
  name:           String,
  id:             Option[String],
  dataSource:     Option[String],
  version:        Option[Int],
  createDate:     Option[Long],
  createUser:     Option[String],
  createUserId:   Option[String],
  lastModDate:    Option[Long],
  lastModUser:    Option[String],
  definition:     ReportSpecification,
  chartOptions:   ChartOptions,
  showGrid:       Boolean,
  showChart:      Boolean,
  chartType:      Option[String],
  comments:       Option[CommentStreamInfo],
  shared:         Option[Boolean],
  order:          Option[Int],
  bookletId:      Option[String],
  resultOptions:  Option[List[ReportResultOptionInfo]],
  reportSharings: Option[Set[String]]
) extends DocumentObject

object ReportInfo extends DocumentObject {
  override def source = "report"
}