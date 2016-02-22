package com.sentrana.appshell.logging

/**
 * This class is created to provide logger for object.
 * Created by szhao on 9/25/2014.
 */
trait Logging { this: LoggerComponent =>
  lazy implicit val logger = {
    val className = getClass.getName match {
      case x if x.endsWith("$") => x.substring(0, x.length() - 1)
      case x                    => x
    }
    Logger(className)
  }
  lazy val appLogger = Logger("application")
}
