package com.sentrana.biq.datacontract

/**
 * Information about a single data warehouse dimension.
 *
 * @constructor
 * @param name   The name of the dimension, for example "TIME" or "PRODUCT".
 * @param attributes   The list of attributes that are part of this dimension.
 */
case class MetadataDimension(
  name:       String,
  attributes: Seq[MetadataAttribute]
)
