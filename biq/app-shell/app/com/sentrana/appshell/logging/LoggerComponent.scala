package com.sentrana.appshell.logging

import com.sentrana.appshell.utils.Enum

object LogLevel extends Enum {
  val TRACE, DEBUG, INFO, WARN, ERROR = Value
}

trait Logger {
  def log(severity: LogLevel.Value, message: String, cause: Option[Throwable] = None): Unit

  def error(message: String, cause: Option[Throwable] = None): Unit = {
    log(LogLevel.ERROR, message, cause)
  }

  def warn(message: String, cause: Option[Throwable] = None): Unit = {
    log(LogLevel.WARN, message, cause)
  }

  def info(message: String, cause: Option[Throwable] = None): Unit = {
    log(LogLevel.INFO, message, cause)
  }

  def debug(message: String, cause: Option[Throwable] = None): Unit = {
    log(LogLevel.DEBUG, message, cause)
  }

  def trace(message: String, cause: Option[Throwable] = None): Unit = {
    log(LogLevel.TRACE, message, cause)
  }
}

trait LoggerFactory {
  def apply(name: String): Logger
  def apply[A](clazz: Class[A]): Logger
}

trait LoggerComponent {
  def Logger: Logger with LoggerFactory
}
