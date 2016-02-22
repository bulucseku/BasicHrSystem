package com.sentrana.biq.datacontract

/**
 * Information about a single attribute form.
 *
 * @constructor
 * @param name   The name of the metadata object. This is shown to the user.
 * @param oid   The machine identifier for the metadata object.
 * @param desc   A textual description of the metadata object. In the case of a metric, it may describe the meaning of the metric.
 * @param dataType   Type of the data. Like Percentage, Currency, Number etc.
 * @param elements   A list of elements that exist in the data warehouse for this form.
 */
case class MetadataAttributeForm(
  name:     String,
  oid:      String,
  desc:     String,
  dataType: Option[String],
  elements: Option[Seq[MetadataObject]]
)
