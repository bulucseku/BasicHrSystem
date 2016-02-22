package com.sentrana.usermanagement.datacontract

import com.sentrana.appshell.utils.Enum

/**
 * Created by szhao on 7/1/2014.
 */
case class ResponseMessage(code: String, message: String = "")

object ResponseMessageCode extends Enum {
  type ResponseMessageCode = Value
  val SUCCESS, FAILURE = Value
}
