package com.sentrana.appshell

import scala.concurrent.Future

import play.api.libs.concurrent.Execution.Implicits._
import play.api.mvc.{ Filter, RequestHeader, Result }

import com.sentrana.appshell.logging.{ LoggerComponent, Logging, PlayLoggerComponent }

/**
 * Created by joshuahagins on 6/26/15.
 */
trait LoggingFilter extends Filter with Logging {
  this: LoggerComponent =>

  override lazy val logger = Logger("loggerForRequest")

  def apply(nextFilter: (RequestHeader) => Future[Result])(requestHeader: RequestHeader): Future[Result] = {
    val startTime = System.currentTimeMillis
    val requestMethod = requestHeader.method
    val requestURI = requestHeader.uri
    logger.info(s"$requestMethod $requestURI")
    nextFilter(requestHeader).map { result =>
      val endTime = System.currentTimeMillis
      val requestTime = endTime - startTime
      val status = result.header.status
      logger.info(s"$requestMethod $requestURI took ${requestTime}ms and returned $status")
      result.withHeaders("Request-Time" -> requestTime.toString)
    }
  }
}

object LoggingFilter extends LoggingFilter with PlayLoggerComponent
