package com.sentrana.usermanagement.authentication

import play.api.http.Status

import com.sentrana.appshell.exceptions.ServiceException
import com.sentrana.usermanagement.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by joshuahagins on 6/26/15.
 */
trait AuthorizationException extends ServiceException {
  val statusCode = Status.UNAUTHORIZED
}

class UnauthorizedApplicationAccessException(userName: String) extends AuthorizationException {
  override val errorCode = Some(ServiceErrorCode.UNAUTHORIZED_APPLICATION_ACCESS)
  val resultMessage = ApplicationMessages.UnauthorizedApplicationAccess
  val logMessage = s"Unauthorized application access for user: $userName"
}

class UnauthorizedServiceAccessException(userName: String) extends AuthorizationException {
  override val errorCode = Some(ServiceErrorCode.UNAUTHORIZED_SERVICE_ACCESS)
  val resultMessage = ApplicationMessages.UnauthorizedServiceAccess
  val logMessage = s"Unauthorized service access for user: $userName"
}
