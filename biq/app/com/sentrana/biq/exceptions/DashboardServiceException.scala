package com.sentrana.biq.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.biq.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

sealed abstract class DashboardServiceException extends ServiceException

class DashboardNameAlreadyInUseException(dashboardName: String) extends DashboardServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.BOOKLET_NAME_IN_USE)
  val resultMessage = ApplicationMessages.DashboardNameAlreadyInUse
  val logMessage = s"Dashboard name already in use: $dashboardName"
}
