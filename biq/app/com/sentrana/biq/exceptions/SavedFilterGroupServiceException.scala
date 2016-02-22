package com.sentrana.biq.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.biq.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by ba on 8/6/2015.
 */

sealed abstract class SavedFilterGroupServiceException extends ServiceException

class SavedFilterGroupNameAlreadyInUseException(filterGroupName: String) extends SavedFilterGroupServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.SAVED_FILTER_GROUP_NAME_IN_USE)
  val resultMessage = ApplicationMessages.SavedFilterGroupNameAlreadyInUse
  val logMessage = s"Filter group name already in use: $filterGroupName"
}

class SavedFilterGroupIDNotFoundException(filterGroupId: String) extends SavedFilterGroupServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.NO_SAVED_FILTER_GROUP_FOUND)
  val resultMessage = ApplicationMessages.SavedFilterGroupIdNotFound
  val logMessage = s"Filter group not found with id: $filterGroupId"
}
