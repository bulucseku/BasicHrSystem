package com.sentrana.biq.datacontract

import com.sentrana.appshell.data.AttrValueType.AttrValueType
import com.sentrana.appshell.data.ColType.ColType
import com.sentrana.appshell.data.DataType.DataType
import com.sentrana.appshell.data.Justify.Justify
import com.sentrana.appshell.data.{ ColType, Justify }
import com.sentrana.biq.core.conceptual.{ AttributeForm, ReportUnit }
import com.sentrana.biq.core.{ SortOrder, TemplateUnit }

/**
 * Information about a single column in a result set.
 *
 * @constructor
 * @param title   The name of the column.
 * @param width   The maximum width (in characters) of the column.
 * @param just   How the column is justified.  <table> <tr><td>0<td><td>Left justified values (typically used for attributes)<td><tr> <tr><td>1<td><td>Right justified (typically used for metrics)<td><tr> <table>
 * @param colType   What the column represents. <table> <tr><td>0<td><td>Attribute<td><tr> <tr><td>1<td><td>Metric<td><tr> <table>
 * @param attrValueType   The type of the attribute value.  <table> <tr><td>0<td><td>Time Series<td><tr> <tr><td>1<td><td>Discrete Series (a set of discrete values)<td><tr> <tr><td>2<td><td>Continuous series (a set of continuous values)<td><tr> <table>
 * @param dataType   How the values should be formatted.  <table> <tr><td>0<td><td>Date Time<td><tr> <tr><td>1<td><td>String<td><tr> <tr><td>2<td><td>Currency<td><tr> <tr><td>3<td><td>Number<td><tr> <tr><td>4<td><td>Percentage<td><tr> <table>
 * @param formatString   The format string that transforms the raw value into formatted value.
 * @param oid
 * @param sortPos
 * @param sortOrder
 */
case class ColumnInfo(
  title:         String,
  width:         Int,
  just:          Justify,
  colType:       ColType,
  attrValueType: AttrValueType,
  dataType:      DataType,
  formatString:  String,
  oid:           String,
  sortPos:       Int,
  sortOrder:     String
)

object ColumnInfo {
  def apply(template: TemplateUnit, title: String, width: Int): ColumnInfo = {
    val dataType = template.reportUnit match {
      case ru: AttributeForm => ru.canonicalSortConcept.asInstanceOf[AttributeForm].dataType
      case ru: ReportUnit    => ru.dataType
    }
    ColumnInfo(
      title         = template.reportUnit.name,
      width         = width,
      just          = if (template.reportUnit.isSegment) Justify.LEFT else Justify.RIGHT,
      colType       = if (template.reportUnit.isSegment) ColType.ATTRIBUTE else ColType.METRIC,
      attrValueType = template.reportUnit.attrValueType,
      dataType      = dataType,
      formatString  = template.reportUnit.formatString.getOrElse(""),
      oid           = template.reportUnit.id,
      sortPos       = template.sortUnit.sortPosition,
      sortOrder     = if (template.sortUnit.sortOrder == SortOrder.ASC) "A" else "D"
    )
  }
}
