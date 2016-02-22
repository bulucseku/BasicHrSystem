package com.sentrana.usermanagement.authentication

import com.sentrana.appshell.exceptions.InvalidInputException
import com.sentrana.usermanagement.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

sealed trait PasswordPolicyException extends InvalidInputException

class WrongPasswordException(username: String) extends PasswordPolicyException {
  override val errorCode = Some(ServiceErrorCode.WRONG_PASSWORD)
  val resultMessage = ApplicationMessages.WrongPassword
  val logMessage = s"Wrong password for user $username"
}

class PreviouslyUsedPasswordException(username: String) extends PasswordPolicyException {
  override val errorCode = Some(ServiceErrorCode.PREVIOUSLY_USED_PASSWORD)
  val resultMessage = ApplicationMessages.ChooseAnotherPassword
  val logMessage = s"Password previously used for user $username"
}

class EmptyPasswordException(username: String) extends PasswordPolicyException {
  override val errorCode = Some(ServiceErrorCode.PASSWORD_CANNOT_BE_EMPTY)
  val resultMessage = ApplicationMessages.EmptyPassword
  val logMessage = s"Empty password for user $username"
}

class InvalidPasswordFormatException(username: String) extends PasswordPolicyException {
  override val errorCode = Some(ServiceErrorCode.PASSWORD_FORMAT_IS_INVALID)
  val resultMessage = ApplicationMessages.InvalidPasswordFormat
  val logMessage = s"Empty password for user $username"
}

class PasswordResetTokenNotFoundException(requestToken: String) extends PasswordPolicyException {
  override val errorCode = Some(ServiceErrorCode.PASSWORD_RESET_LINK_EXPIRED)
  val resultMessage = ApplicationMessages.PasswordResetLinkExpired
  val logMessage = s"Password reset token not found: $requestToken"
}

class PasswordResetLinkExpiredException(requestToken: String) extends PasswordPolicyException {
  override val errorCode = Some(ServiceErrorCode.PASSWORD_RESET_LINK_EXPIRED)
  val resultMessage = ApplicationMessages.PasswordResetLinkExpired
  val logMessage = s"Password reset link expired for token: $requestToken"
}

class PasswordResetInvalidSecurityCodeException(username: String) extends PasswordPolicyException {
  override val errorCode = Some(ServiceErrorCode.PASSWORD_RESET_INVALID_SECURITY_CODE)
  val resultMessage = ApplicationMessages.PasswordResetInvalidSecurityCode
  val logMessage = s"Password reset security code invalid for user $username"
}

class PasswordResetEmailNotSent(username: String) extends PasswordPolicyException {
  override val errorCode = Some(ServiceErrorCode.PASSWORD_RESET_INVALID_SECURITY_CODE)
  val resultMessage = ApplicationMessages.FailedToSendPasswordResetEmail
  val logMessage = s"Password reset done but mail sent failed for User name: $username"
}
