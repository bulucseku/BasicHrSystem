package coreLib.com.sentrana.mmcore.datacontract

import play.api.libs.json.Json

/**
 * Created by szhao on 2/12/14.
 */
case class RowValue(
  fmtValue:  String,
  rawValue:  String,
  subttlHdr: String
)

object RowValue {
  implicit val rowValueWrites = Json.writes[RowValue]
  implicit val rowValueReads = Json.reads[RowValue]
}

case class Row(
  cells:       Seq[RowValue],
  subtotalRow: Boolean
)

object Row {
  implicit val rowWrites = Json.writes[Row]
  implicit val rowReads = Json.reads[Row]
}

case class ColInfo(
  attrValueType: Int,
  colType:       Int,
  dataType:      Int,
  formatString:  String,
  just:          Int,
  title:         String,
  width:         Int
)

object ColInfo {
  implicit val colInfoWrites = Json.writes[ColInfo]
  implicit val colInfoReads = Json.reads[ColInfo]
}

case class QueryResult(
  queryText:    String,
  colInfos:     Seq[ColInfo],
  rows:         Seq[Row],
  resultCount:  Double,
  retrieveTime: Double,
  totalTime:    Double
)

object QueryResult {
  implicit val queryResultWrites = Json.writes[QueryResult]
  implicit val queryResultReads = Json.reads[QueryResult]
}
