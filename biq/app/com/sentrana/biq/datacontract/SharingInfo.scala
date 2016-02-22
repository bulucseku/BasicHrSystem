package com.sentrana.biq.datacontract

/**
 *
 * @constructor
 * @param objectId
 * @param objectType
 * @param changeType
 * @param repository
 */
case class SharingInfo(
  objectId:       String,
  objectType:     String,
  changeType:     String,
  repository:     String,
  senderFullName: String
)
