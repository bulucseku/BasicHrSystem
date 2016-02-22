package com.sentrana.biq.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.biq.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by joshuahagins on 7/8/15.
 */
sealed abstract class DerivedColumnServiceException extends ServiceException

class DerivedColumnNameAlreadyInUseException(dcName: String) extends DerivedColumnServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.DERIVED_COLUMN_NAME_IN_USE)
  val resultMessage = ApplicationMessages.DerivedColumnNameAlreadyInUse
  val logMessage = s"Derived column name already in use: $dcName"
}

class DerivedColumnIDNotFoundException(dcID: String) extends DerivedColumnServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.NO_DATA_RETURNED)
  val resultMessage = ApplicationMessages.DerivedColumnIDNotFound
  val logMessage = s"Derived column not found with id: $dcID"
}
