package com.sentrana.biq.datacontract

/**
 * Indentifying information for a maltyped cell
 *
 * @constructor
 * @param rowInd   Row Index of the element.
 * @param colName   Column name of the element.
 * @param elem   Cell data.
 */
case class BadCellData(
  rowInd:  Int,
  colName: String,
  elem:    String
)
