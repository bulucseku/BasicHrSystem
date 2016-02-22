package com.sentrana.biq.datacontract

/**
 * The result of a dropping a single cache entry. <strong>We should probably remove this class and use the HTTP status code to convey success or failure.<strong>
 *
 * @constructor
 * @param success   True if the cache was dropped.
 */
case class DropCacheResult(
  success: Boolean
)
