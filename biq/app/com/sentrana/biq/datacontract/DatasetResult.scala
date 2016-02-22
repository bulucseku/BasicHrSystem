package com.sentrana.biq.datacontract

import com.sentrana.appshell.data.{ ResultRow, TimingInfo }

/**
 * The result of a report execution. Essentially, this is a set of rows of data along with extra information that describes more about the data.
 *
 * @constructor
 * @param colInfos   Describes each column of data in more detail. There is one <CODE>ColumnInfo<CODE> for each column of data in the result set.
 * @param exptMsg   If there is an exception that occurred during the execution of this report, it appears here.
 * @param maltypedElems   A list of the elements with types that don't match that of the first in their column.
 * @param timing   This is diagnostic information about how long each phase of the report execution took. <strong>We should remove this from the JSON response on the server side if the user is not a developer.<strong>
 * @param cached   Whether the report was previously cached.
 * @param rows   A list of rows that form the result set.
 * @param totals   An optional grand totals row.
 * @param execTime   The time that the report was last executed.
 * @param cacheid   The ID of the cache entry that corresponds to this report.
 * @param sql   The generated SQL for this report. Only shown if the user is a "developer". <strong>We should remove this from the JSON response on the server side if the user is not a developer.<strong>
 * @param drillable   Whether the data of the report is drillable or not.
 */
case class DatasetResult(
  colInfos:      Seq[ColumnInfo],
  exptMsg:       String,
  maltypedElems: Seq[BadCellData],
  timing:        TimingInfo,
  cached:        Boolean,
  rows:          List[ResultRow],
  totals:        ResultRow,
  execTime:      String,
  cacheid:       String,
  sql:           String,
  drillable:     Boolean
)
