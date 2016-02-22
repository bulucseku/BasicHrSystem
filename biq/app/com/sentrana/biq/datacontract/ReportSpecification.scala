package com.sentrana.biq.datacontract

/**
 * The specification of a report.
 *
 * @constructor
 * @param template   A string that contains a bar ('|') separated list of attribute form IDs and metric IDs. These identify the  columns to show, from left to right. Other types of "columns" (such as filtered metrics) pass in a different syntax.
 * @param filter   A string that contains a bar ('|') separated list of attribute elements that form the filter. Each filter element  is identified by the attribute form ID followed by a colon (':'), then the element value.
 * @param totals   Whether to show subtotals (at each level identified by an attribute form) and grand totals.
 * @param sort   The sort order for the report. Each column is represented by a pair: a number (1, 2, 3, ... )  and an order (A, D). The number identifies the position that this column takes in a multi-column  sort. The order character indicates ascending or descending. Each pair is separated by a bar ('|').
 */
case class ReportSpecification(
  template: String,
  filter:   Option[String],
  totals:   Boolean,
  sort:     String
)
