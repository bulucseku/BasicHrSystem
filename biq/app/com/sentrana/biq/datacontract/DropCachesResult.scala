package com.sentrana.biq.datacontract

/**
 * The result of dropping several cache entries.
 *
 * @constructor
 * @param status   A textual status of the operation: "Success", "Failure: ..."
 * @param numDropped   The number of cache entries dropped.
 */
case class DropCachesResult(
  status:     String,
  numDropped: Int
)
