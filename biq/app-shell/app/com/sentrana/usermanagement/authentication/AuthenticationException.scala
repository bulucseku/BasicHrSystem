package com.sentrana.usermanagement.authentication

import play.api.http.Status

import com.sentrana.appshell.exceptions.ServiceException
import com.sentrana.usermanagement.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

sealed trait AuthenticationException extends ServiceException {
  val statusCode = Status.UNAUTHORIZED
}

class InvalidCredentialsException(username: String) extends AuthenticationException {
  override val errorCode = Some(ServiceErrorCode.INVALID_CREDENTIALS)
  val resultMessage = ApplicationMessages.InvalidCredentials
  val logMessage = s"Invalid credentials: username $username"
}

class InvalidSessionException(sessionToken: String) extends AuthenticationException {
  override val errorCode = Some(ServiceErrorCode.INVALID_SESSION)
  val resultMessage = ApplicationMessages.SessionExpired
  val logMessage = s"Invalid session token: $sessionToken"
}

class NoSessionTokenException extends InvalidSessionException("") {
  override val logMessage = s"No session token provided"
}

class UserIdNotFoundException(userId: String) extends AuthenticationException {
  override val errorCode = Some(ServiceErrorCode.USER_NOT_FOUND)
  val resultMessage = ApplicationMessages.UserIdDoesNotExist
  val logMessage = s"No active user found with id: $userId"
}

class UserNameNotFoundException(username: String) extends AuthenticationException {
  override val errorCode = Some(ServiceErrorCode.USER_NOT_FOUND)
  val resultMessage = ApplicationMessages.UserNameDoesNotExist
  val logMessage = s"No active user found with username: $username"
}

class UserEmailNotFoundException(userEmail: String) extends AuthenticationException {
  override val errorCode = Some(ServiceErrorCode.USER_NOT_FOUND)
  val resultMessage = ApplicationMessages.UserEmailNotFound
  val logMessage = s"No active user found with email: $userEmail"
}

sealed trait SalesforceAuthenticationException extends AuthenticationException {
  override val errorCode = Some(ServiceErrorCode.SALESFORCE_CREDENTIALS_NOT_FOUND)
  val resultMessage = ApplicationMessages.SalesforceCredentialsNotFound
}

class SalesforceClientIdNotFoundException(orgId: String) extends SalesforceAuthenticationException {
  val logMessage = s"No ClientId found for organization: $orgId"
}

class SalesforceClientSecretNotFoundException(orgId: String) extends SalesforceAuthenticationException {
  val logMessage = s"No Client Secret found for organization: $orgId"
}

class SalesforceUserNameNotFoundException(userName: String) extends SalesforceAuthenticationException {
  val logMessage = s"(Salesforce) No active user found with user name: $userName"
  override val resultMessage =
    if (userName.isEmpty)
      "The Sentrana user name has not been set in the current Salesforce user configurations."
    else
      s"The Sentrana user name provided ($userName) in the current Salesforce user configuration is not valid."
}
