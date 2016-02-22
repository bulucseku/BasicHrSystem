package com.sentrana.biq.datacontract

/**
 * Information about a single data warehouse attribute (which exists in a single dimension).
 *
 * @constructor
 * @param name   The name of the metadata object. This is shown to the user.
 * @param oid   The machine identifier for the metadata object.
 * @param desc   A textual description of the metadata object. In the case of a metric, it may describe the meaning of the metric.
 * @param filterName The name of the attribute when shown as a filter. If not defined then name will be shown.
 * @param dataType   Type of the data. Like Percentage, Currency, Number etc.
 * @param required   Whether this attribute must be specified in every report execution or not. Most attributes are  <strong>not<strong> required. Those that are associated with "data security" are typically required.
 * @param segmentable   Whether this attribute can be used in a report defintion to "segment" a data warehouse. Most attributes are segmentable.
 * @param defaultFormId   The default form ID, if more than one form exists for this attribute.
 * @param forms   A list of forms that this attribute possesses. Each form presents a different way to view the elements of the attribute.
 * @param filterControl   Specifies how elements of this attribute are presented for filtering. Choices include Button, Tree, ListBox and Calendar.
 */
case class MetadataAttribute(
  name:          String,
  oid:           String,
  desc:          String,
  filterName:    String,
  dataType:      Option[String],
  required:      Boolean,
  segmentable:   Boolean,
  defaultFormId: String,
  forms:         Seq[MetadataAttributeForm],
  filterControl: String
)
