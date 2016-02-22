package com.sentrana.usermanagement.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.usermanagement.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by williamhogben on 7/10/15.
 */
sealed trait GroupServiceException extends ServiceException

class GroupIDNotFoundException(groupID: String) extends GroupServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.GroupIdNotFound(groupID)
  val logMessage = s"Group not found with id: $groupID"
}

class GroupNameAlreadyInUseException(groupName: String) extends GroupServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.GROUP_NAME_IN_USE)
  val resultMessage = ApplicationMessages.DuplicateGroup(groupName)
  val logMessage = resultMessage
}

class CyclicalGroupReferencesException extends GroupServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.CyclicalGroupReferences
  val logMessage = resultMessage
}

class NoParentGroupException extends GroupServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.NoParentGroup
  val logMessage = resultMessage
}
