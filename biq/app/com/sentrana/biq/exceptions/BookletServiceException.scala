package com.sentrana.biq.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.biq.controllers.ApplicationMessages
import com.sentrana.usermanagement.authentication.AuthorizationException
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by joshuahagins on 7/8/15.
 */
sealed abstract class BookletServiceException extends ServiceException

class UnauthorizedBookletAccessException(userName: String, bookletId: String) extends BookletServiceException with AuthorizationException {
  val resultMessage = ApplicationMessages.UnauthorizedBookletAccess
  val logMessage = s"User $userName does not have permission to access booklet: $bookletId"
}

class UnauthorizedBookletCopyException(userName: String, bookletId: String) extends BookletServiceException with AuthorizationException {
  val resultMessage = ApplicationMessages.UnauthorizedBookletCopy
  val logMessage = s"User $userName does not have permission to copy booklet: $bookletId"
}

class UnauthorizedBookletDeleteException(userName: String, bookletId: String) extends BookletServiceException with AuthorizationException {
  val resultMessage = ApplicationMessages.UnauthorizedBookletDelete
  val logMessage = s"User $userName does not have permission to delete booklet: $bookletId"
}

class BookletIDNotFoundException(bookletID: String) extends BookletServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.BookletIDNotFound(bookletID)
  val logMessage = s"Booklet not found with id: $bookletID"
}

class BookletNameAlreadyInUseException(bookletName: String) extends BookletServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.BOOKLET_NAME_IN_USE)
  val resultMessage = ApplicationMessages.BookletNameAlreadyInUse
  val logMessage = s"Booklet name already in use: $bookletName"
}
