package com.sentrana.appshell

import scala.concurrent.Future
import scala.util.control.NonFatal

import play.api.GlobalSettings
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json
import play.api.mvc.Results.{ BadRequest, NotFound }
import play.api.mvc.{ RequestHeader, WithFilters }
import play.filters.gzip.GzipFilter

import org.json4s.NoTypeHints
import org.json4s.ext.EnumNameSerializer

import com.sentrana.appshell.data._
import com.sentrana.appshell.logging.{ LoggerComponent, Logging, PlayLoggerComponent }
import com.sentrana.appshell.utils.ExceptionUtil

/**
 * Extends global settings to override default behavior for errors. Results in JSON messages rather than rendered HTML page on
 * unhandled exceptions and bad requests.
 */
abstract class Global extends WithFilters(LoggingFilter, new GzipFilter()) with GlobalSettings with Logging {
  this: LoggerComponent =>

  override implicit lazy val logger = appLogger

  object JsonFormat {
    implicit var formats = org.json4s.native.Serialization.formats(NoTypeHints) +
      new EnumNameSerializer(DataType) + new EnumNameSerializer(ColType) +
      new EnumNameSerializer(Justify) + new EnumNameSerializer(AttrValueType) +
      new EnumNameSerializer(DrillType) + new EnumNameSerializer(FormulaType)
  }

  override def onError(request: RequestHeader, t: Throwable) = t match {
    case NonFatal(e) => Future.successful(ExceptionUtil.generateServiceError(e))
    case _           => throw t
  }

  override def onBadRequest(request: RequestHeader, error: String) = {
    Future.successful {
      logger.warn(s"Error processing input: $error")
      BadRequest(Json.parse(s"""{ "message": "Error processing input: $error" }"""))
    }
  }

  override def onHandlerNotFound(request: RequestHeader) = {
    Future.successful {
      logger.warn(s"Request handler not found: ${request.method} ${request.uri}")
      NotFound(Json.parse("""{ "message": "Requested service handler was not found" }"""))
    }
  }
}

object Global extends Global with PlayLoggerComponent

