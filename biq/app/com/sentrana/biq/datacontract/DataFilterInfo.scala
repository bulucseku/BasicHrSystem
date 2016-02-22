package com.sentrana.biq.datacontract

/**
 * Information of datafilter
 *
 * @constructor
 * @param id   ID of the attribute.
 * @param dataFilterId   ID of the datafilter.
 * @param dataSource   ID of the data warehouse to which this datafilter belongs to.
 * @param operator   datafilter operator
 * @param values   datafilter values
 */
case class DataFilterInfo(
  id:           String,
  dataFilterId: String,
  dataSource:   String,
  operator:     String,
  values:       Seq[String]
)
