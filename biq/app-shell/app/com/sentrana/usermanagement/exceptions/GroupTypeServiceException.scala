package com.sentrana.usermanagement.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.usermanagement.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by williamhogben on 7/10/15.
 */
sealed trait GroupTypeServiceException extends ServiceException

class GroupTypeNameAlreadyInUseException(groupName: String) extends GroupTypeServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.GROUP_TYPE_NAME_IN_USE)
  val resultMessage = ApplicationMessages.DuplicateGroupType(groupName)
  val logMessage = resultMessage
}

class GroupTypeMissingOrganizationException extends GroupTypeServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.GroupTypeMissingOrganization
  val logMessage = resultMessage
}

class GroupTypeIDNotFoundException(groupTypeID: String) extends GroupTypeServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.GroupTypeIdNotFound(groupTypeID)
  val logMessage = resultMessage
}
