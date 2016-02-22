package com.sentrana.appshell.exceptions

import play.api.http.Status

import com.sentrana.appshell.logging.LogLevel
import com.sentrana.usermanagement.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

trait ServiceException extends LoggedException {
  val statusCode: Int
  val resultMessage: String
  val errorCode: Option[ServiceErrorCode.Value] = None
}

object ServiceException {
  def apply(ex: Throwable): ServiceException = ex match {
    case ex: ServiceException => ex
    case _                    => new InternalServiceError(ex.getMessage, Some(ex))
  }
}

trait UnauthorizedAccessException extends ServiceException {
  val statusCode = Status.UNAUTHORIZED
}

trait InvalidInputException extends ServiceException {
  val statusCode = Status.BAD_REQUEST
}

class ExternalServiceError(val logMessage: String, cause: Option[Throwable]) extends ServiceException {
  override val logLevel = LogLevel.ERROR
  val statusCode = Status.SERVICE_UNAVAILABLE
  override val errorCode = Some(ServiceErrorCode.SERVICE_ERROR_OCCURRED)
  // TODO: Use a more descriptive message for external errors
  val resultMessage = ApplicationMessages.UnknownException

  cause foreach initCause
}

class InternalServiceError(val logMessage: String, cause: Option[Throwable]) extends ServiceException {
  override val logLevel = LogLevel.ERROR
  val statusCode = Status.INTERNAL_SERVER_ERROR
  override val errorCode = Some(ServiceErrorCode.UNKNOWN_ERROR)
  val resultMessage = ApplicationMessages.UnknownException

  cause foreach initCause
}
