package com.sentrana.biq.exceptions

import com.sentrana.appshell.exceptions.InvalidInputException
import com.sentrana.biq.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by joshuahagins on 7/6/15.
 */
class RepositoryIDNotFoundException(repoID: String) extends InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.REPOSITORY_RETRIEVE_FAILED)
  val resultMessage = ApplicationMessages.RepositoryIDNotFound(repoID)
  val logMessage = s"Repository not found with id: $repoID"
}
