package com.sentrana.biq.datacontract

/**
 * Information about a single metadata object. A MetadataObject contains information about a single concept in a data warehouse.
 *
 * @constructor
 * @param name   The name of the metadata object. This is shown to the user.
 * @param oid   The machine identifier for the metadata object.
 * @param desc   A textual description of the metadata object. In the case of a metric, it may describe the meaning of the metric.
 * @param dataType   Type of the data. Like Percentage, Currency, Number etc.
 */
case class MetadataObject(
  name:     String,
  oid:      String,
  desc:     Option[String],
  dataType: Option[String]
)
