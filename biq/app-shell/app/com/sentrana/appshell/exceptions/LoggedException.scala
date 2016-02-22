package com.sentrana.appshell.exceptions

import java.io.{ PrintWriter, StringWriter }

import com.sentrana.appshell.logging.{ LogLevel, Logger }

trait LoggedException extends Exception {
  def logLevel: LogLevel.Value = LogLevel.INFO
  def logMessage: String

  override def getMessage = logMessage

  def log()(implicit logger: Logger): Unit = logLevel match {
    case LogLevel.ERROR => logStackTrace()(logger)
    case _              => logger.log(logLevel, logMessage, Some(this))
  }

  def logStackTrace()(implicit logger: Logger): Unit = {
    val sw = new StringWriter
    printStackTrace(new PrintWriter(sw))
    logger.log(logLevel, sw.toString, Some(this))
  }
}
