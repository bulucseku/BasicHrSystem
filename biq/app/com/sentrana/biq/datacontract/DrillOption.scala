package com.sentrana.biq.datacontract

import com.sentrana.appshell.data.DrillType

/**
 * Information about a single drill option.
 *
 * @constructor
 * @param tp   The type of drill option. <table> <tr><td>0<td><td>Drill Up (Roll Up)<td><tr> <tr><td>1<td><td>Drill Down<td><tr> <table>
 * @param eInfos   The list of elements that were selected.
 * @param tgtAttrForms   The list of attributes that we can drill down to.
 * @param report   The report that would be performed if this operation was selected.
 */
case class DrillOption(
  tp:           DrillType.DrillType,
  eInfos:       Seq[DrillElementInfo],
  tgtAttrForms: Seq[DrillAttributeInfo],
  report:       ReportSpecification
)
