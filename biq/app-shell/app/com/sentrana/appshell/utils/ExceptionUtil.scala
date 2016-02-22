package com.sentrana.appshell.utils

import play.api.http.HeaderNames
import play.api.libs.iteratee.Enumerator
import play.api.mvc.{ ResponseHeader, Result }

import com.sentrana.appshell.exceptions.ServiceException
import com.sentrana.appshell.logging.Logger

/**
 * Created by si on 1/7/2015.
 */
object ExceptionUtil {
  def generateServiceError(ex: Throwable)(implicit logger: Logger): Result = {
    val serviceException = ServiceException(ex)
    serviceException.log()
    Result(
      header = ResponseHeader(serviceException.statusCode, Map(HeaderNames.CONTENT_TYPE -> "application/json")),
      body   = Enumerator(serviceException.resultMessage.getBytes)
    ).withHeaders(
        "ErrorCode" -> serviceException.errorCode.map{ _.toString }.getOrElse(""),
        "ErrorMsg" -> prepareHeaderMessage(serviceException.resultMessage)
      )
  }

  private def prepareHeaderMessage(msg: String): String = {
    msg.replaceAll("""[\r\n]+""", " ")
  }
}
