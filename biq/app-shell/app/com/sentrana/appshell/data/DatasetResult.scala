package com.sentrana.appshell.data

import com.sentrana.appshell.data.AttrValueType.AttrValueType
import com.sentrana.appshell.data.ColType.ColType
import com.sentrana.appshell.data.DataBehavior.DataBehavior
import com.sentrana.appshell.data.DataType.DataType
import com.sentrana.appshell.data.Justify.Justify

/**
 * Created by szhao on 10/8/2014.
 */
case class DatasetResult(
  colInfos:      Seq[ColInfo]      = null, //TODO fix default value here
  TimingInfo:    TimingInfo        = null,
  rows:          Seq[ResultRow]    = null,
  totals:        Option[ResultRow] = None,
  ExecutionTime: String            = null,
  SQL:           String            = null,
  dataArray:     DataArray         = null,
  var cacheid:   String            = null,
  var cached:    Boolean           = false
)

/**
 * Cell object in tabular result
 *
 * @constructor
 * @param fmtValue   Formatted value of the row cell.
 * @param rawValue   Raw value of the row cell.
 * @param subttlHdr   The header of this cell value if it is in a subtotal row.
 */
case class ResultCell(
  fmtValue:  String,
  rawValue:  Any,
  subttlHdr: Boolean
)

/**
 * Row object that contains cell objects in the row.
 *
 * @constructor
 * @param cells   A sequence of RowValue objects.
 * @param subtotalRow   The organization's status.
 */
case class ResultRow(
  cells:       Seq[ResultCell],
  subtotalRow: Boolean
)

/**
 * Column formatting metadata
 *
 * @constructor
 * @param name    The name of the column.
 * @param attrValueType   The type of the attribute value (Time Series, Discrete Series, Continuous series).
 * @param colType   What the column represents (Attribute or Metric).
 * @param dataType   How the values should be formatted (Date Time, String, Currency, Number, Percentage).
 * @param formatString   The format string that transforms the raw value into formatted value.
 * @param just   How the column is justified.
 * @param title   The name of the column.
 * @param analyzedSeriesTitle Title for the predicted column (the predicted column will be added dynamically by getting data from a model)
 * @param width   The maximum width (in characters) of the column.
 * @param display The column display or not
 * @param dataBehavior Column data behavior
 */
case class ColInfo(
  name:                Option[String]        = None,
  attrValueType:       Option[AttrValueType] = None,
  colType:             Option[ColType]       = None,
  dataType:            Option[DataType]      = None,
  formatString:        Option[String]        = None,
  just:                Option[Justify]       = None,
  title:               String,
  analyzedSeriesTitle: String                = "",
  width:               Int                   = 0,
  display:             Option[Boolean]       = None,
  dataBehavior:        Option[DataBehavior]  = None
)

/**
 * Information about the time it took to execute the report.
 * @param SqlGenerationTime Time spent (in milliseconds) generating the SQL.
 * @param QueryTime Time spent (in milliseconds) querying the DB.
 */
case class TimingInfo(SqlGenerationTime: Long, QueryTime: Long)

/**
 * Information about a single column in a result set.
 * @param name The name of the column.
 * @param title The title of the column.
 * @param width The maximum width (in characters) of the column.
 * @param just Left justified values (typically used for attributes), Right justified (typically used for metrics)
 * @param colType Attribute, Metric
 * @param attrValueType Time Series, Discrete Series (a set of discrete values), Continuous series (a set of continuous values)
 * @param dataType Date Time, String, Currency, Number, Percentage
 * @param display //TODO
 * @param formatString String describing the formatting for the column
 * @param dataBehavior PredictedLow, PredictedHigh, Predicted, Actual, PrescribedLow, PrescribedHigh
 */
case class ColumnInfo(
  title:         String,
  width:         Int,
  name:          Option[String]        = None,
  just:          Option[Justify]       = None,
  colType:       Option[ColType]       = None,
  attrValueType: Option[AttrValueType] = None,
  dataType:      Option[DataType]      = None,
  display:       Option[Boolean]       = None,
  formatString:  Option[String]        = None,
  dataBehavior:  Option[DataBehavior]  = None
)

/**
 * Query Result for other application to consume.
 *
 * @constructor
 * @param queryText   SQL generated.
 * @param colInfos   Column formatting related metadata.
 * @param rows   A sequence of Row objects.
 * @param resultCount   Result row count.
 * @param retrieveTime   DB query time.
 * @param totalTime   Total time including data object construction time.
 */
case class QueryResult(
  queryText:    String,
  colInfos:     Seq[ColInfo],
  rows:         Seq[ResultRow],
  resultCount:  Double,
  retrieveTime: Double,
  totalTime:    Double
)

case class DataArray(attributeArray: Object, MetricArray: Object)
