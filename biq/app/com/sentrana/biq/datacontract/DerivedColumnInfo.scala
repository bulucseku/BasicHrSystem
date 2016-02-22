package com.sentrana.biq.datacontract

/**
 * Information about a saved derived column.
 *
 * @constructor
 * @param id   ID of the derived column.
 * @param oid   object id of the derived column to use in client side.
 * @param name   Name of the derived column.
 * @param formula   Expression of the derived column.
 * @param precision   Precision of the derived column.
 * @param outputType   DataType of the derived column.
 * @param dataSource   The ID of the data warehouse that this derived column belongs to.
 * @param formulaType   Formula Type of the column.
 */
case class DerivedColumnInfo(
  id:          Option[String],
  oid:         Option[String],
  name:        String,
  formula:     String,
  precision:   String,
  outputType:  String,
  dataSource:  String,
  formulaType: String
)

case class DerivedColumnFormula(formula: String)
