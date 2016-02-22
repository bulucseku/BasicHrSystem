package com.sentrana.biq.exceptions

import play.api.http.Status

import com.sentrana.appshell.exceptions.ServiceException
import com.sentrana.biq.controllers.ApplicationMessages
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by joshuahagins on 7/6/15.
 */
class NoRepositoryIDInRequestException extends ServiceException {
  val statusCode = Status.BAD_REQUEST
  override val errorCode = Some(ServiceErrorCode.REPOSITORY_RETRIEVE_FAILED)
  val resultMessage = ApplicationMessages.NoRepositoryIDInRequest
  val logMessage = "RepositoryId not found in request header"
}
