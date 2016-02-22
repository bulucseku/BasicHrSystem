package com.sentrana.appshell.logging

/**
 * Created by joshuahagins on 6/26/15.
 */
trait NullLoggerComponent extends LoggerComponent {
  trait NullLogger extends Logger with LoggerFactory {
    def log(severity: LogLevel.Value, message: String, cause: Option[Throwable]) = ()
    def apply(name: String) = this
    def apply[A](clazz: Class[A]) = this
  }

  object Logger extends NullLogger
}
