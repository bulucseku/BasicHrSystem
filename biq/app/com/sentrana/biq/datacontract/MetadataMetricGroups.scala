package com.sentrana.biq.datacontract

/**
 * Information about metric group.
 *
 * @constructor
 * @param id
 * @param name
 * @param description
 * @param metrics
 */
case class MetadataMetricGroups(
  id:          String,
  name:        String,
  description: String,
  metrics:     Seq[MetadataMetric]
)
