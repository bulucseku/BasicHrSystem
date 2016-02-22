package com.sentrana.biq.datacontract

/**
 *
 * @constructor
 * @param columnId
 * @param isFiltered
 * @param selectedKeys
 * @param sortOrder
 * @param sortPosition
 * @param columnPosition
 * @param isHidden
 */
case class ReportResultOptionInfo(
  columnId:       String,
  isFiltered:     Boolean,
  selectedKeys:   String,
  sortOrder:      String,
  sortPosition:   Int,
  columnPosition: Int,
  isHidden:       Boolean
)
