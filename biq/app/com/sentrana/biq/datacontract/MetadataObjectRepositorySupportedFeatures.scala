package com.sentrana.biq.datacontract

/**
 * The special features of a data warehouse. Not all warehouses possess the same set of features.
 *
 * @constructor
 * @param totals   Whether this data warehouse can return subtotals and grand totals.
 */
case class MetadataObjectRepositorySupportedFeatures(
  totals: Boolean
)
