package com.sentrana.biq.datacontract

/**
 * Generic service repsonse message entity that will be used by client to identify the status of the service call.
 *
 * @constructor
 * @param msgCode   The code used by client to identify different error types.
 * @param msgContent   The descriptive message sent back from server. Most likely this message is empty as usually the client side will generate the messsage based on message code.
 */
case class ServiceResponse(
  msgCode:    String,
  msgContent: String
)
