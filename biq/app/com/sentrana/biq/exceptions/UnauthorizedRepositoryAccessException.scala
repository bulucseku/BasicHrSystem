package com.sentrana.biq.exceptions

import com.sentrana.biq.controllers.ApplicationMessages
import com.sentrana.usermanagement.authentication.AuthorizationException
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by joshuahagins on 7/6/15.
 */
class UnauthorizedRepositoryAccessException(userName: String, repoId: String) extends AuthorizationException {
  override val errorCode = Some(ServiceErrorCode.REPOSITORY_RETRIEVE_FAILED)
  val resultMessage = ApplicationMessages.UnauthorizedRepositoryAccess
  val logMessage = s"User $userName is not authorized to access repository: $repoId"
}
