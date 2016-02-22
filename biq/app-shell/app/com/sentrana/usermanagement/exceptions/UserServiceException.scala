package com.sentrana.usermanagement.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.usermanagement.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by williamhogben on 7/10/15.
 */
sealed trait UserServiceException extends ServiceException

class UserNotFoundWithPropertyException(property: String, value: String) extends UserServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.UserNotFoundWithProperty(property, value)
  val logMessage = resultMessage
}

class DuplicateUserNameException(userName: String) extends UserServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.USER_NAME_IN_USE)
  val resultMessage = ApplicationMessages.DuplicateUser(userName)
  val logMessage = resultMessage
}

class DuplicateUserEmailException(email: String) extends UserServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.USER_EMAIL_IN_USE)
  val resultMessage = ApplicationMessages.DuplicateUserEmail(email)
  val logMessage = resultMessage
}
