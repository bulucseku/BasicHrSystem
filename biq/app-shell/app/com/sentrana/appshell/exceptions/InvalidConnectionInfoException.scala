package com.sentrana.appshell.exceptions

/**
 * Created by Joshua Hagins on 3/24/2015
 */
case class InvalidConnectionInfoException(message: String = null, cause: Throwable = null)
  extends RuntimeException(message, cause)
