package com.sentrana.biq.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.biq.controllers.ApplicationMessages

/**
 * Created by joshuahagins on 7/8/15.
 */
sealed abstract class ReportingServiceException extends ServiceException

class MissingRequestParameterException(paramName: String) extends ReportingServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.MissingRequestParameter(paramName)
  val logMessage = s"Request missing parameter '$paramName'"
}

class CacheKeyNotFoundException(cacheKey: String) extends ReportingServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.CacheKeyNotFound(cacheKey)
  val logMessage = s"Cache key not found: $cacheKey"
}
