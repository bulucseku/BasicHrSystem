package com.sentrana.usermanagement.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.usermanagement.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by williamhogben on 7/10/15.
 */
sealed trait OrganizationServiceException extends ServiceException

class OrganizationIDNotFoundException(orgID: String) extends OrganizationServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.GroupIdNotFound(orgID)
  val logMessage = resultMessage
}

class OrganizationNameAlreadyInUseException(orgName: String) extends OrganizationServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.ORGANIZATION_NAME_IN_USE)
  val resultMessage = ApplicationMessages.DuplicateOrganization(orgName)
  val logMessage = resultMessage
}

