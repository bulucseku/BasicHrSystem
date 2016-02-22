package com.sentrana.appshell

import scala.concurrent.Future

import play.api.Play
import play.api.Play.current
import play.api.mvc.Results.Redirect
import play.api.mvc.{ Filter, RequestHeader, Result }

import com.sentrana.appshell.logging.{ LoggerComponent, Logging, PlayLoggerComponent }

trait HTTPSRedirectFilter extends Filter with Logging {
  this: LoggerComponent =>

  override lazy val logger = Logger("loggerForRequest")

  def apply(nextFilter: RequestHeader => Future[Result])(requestHeader: RequestHeader): Future[Result] =
    if (shouldRedirect(requestHeader)) secureRedirect(requestHeader)
    else nextFilter(requestHeader)

  private def shouldRedirect(requestHeader: RequestHeader): Boolean =
    Play.isProd && !requestHeader.secure

  private def secureRedirect(requestHeader: RequestHeader): Future[Result] = {
    val secureURL = getSecureURL(requestHeader)
    logger.info(s"Redirecting to secure: $secureURL")
    Future.successful(Redirect(secureURL))
  }

  private def getSecureURL(requestHeader: RequestHeader): String =
    "https://" + requestHeader.host + requestHeader.uri
}

object HTTPSRedirectFilter extends HTTPSRedirectFilter with PlayLoggerComponent
