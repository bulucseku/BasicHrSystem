package com.sentrana.appshell.logging

import play.api.{ Logger => PlayLoggerImpl, LoggerLike => PlayLoggerLike }

trait PlayLoggerComponent extends LoggerComponent {
  class PlayLogger(logger: PlayLoggerLike) extends Logger {
    def log(severity: LogLevel.Value, message: String, cause: Option[Throwable] = None): Unit = cause match {
      case Some(ex) => severity match {
        case LogLevel.TRACE => logger.trace(message, ex)
        case LogLevel.DEBUG => logger.debug(message, ex)
        case LogLevel.INFO  => logger.info(message, ex)
        case LogLevel.WARN  => logger.warn(message, ex)
        case LogLevel.ERROR => logger.error(message, ex)
      }
      case None => severity match {
        case LogLevel.TRACE => logger.trace(message)
        case LogLevel.DEBUG => logger.debug(message)
        case LogLevel.INFO  => logger.info(message)
        case LogLevel.WARN  => logger.warn(message)
        case LogLevel.ERROR => logger.error(message)
      }
    }
  }

  trait PlayLoggerFactory extends LoggerFactory {
    def apply(name: String): Logger = new PlayLogger(PlayLoggerImpl(name))
    def apply[B](clazz: Class[B]): Logger = new PlayLogger(PlayLoggerImpl(clazz))
  }

  object Logger extends PlayLogger(PlayLoggerImpl) with PlayLoggerFactory
}
