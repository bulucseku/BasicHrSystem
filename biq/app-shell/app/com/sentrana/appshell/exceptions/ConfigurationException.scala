package com.sentrana.appshell.exceptions

import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by szhao on 11/25/2014.
 */
case class ConfigurationException(message: String = null, cause: Throwable = null) extends RuntimeException(message, cause)
