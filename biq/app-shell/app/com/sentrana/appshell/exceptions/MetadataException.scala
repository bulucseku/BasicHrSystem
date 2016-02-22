package com.sentrana.appshell.exceptions

/**
 * Created by szhao on 1/9/2015.
 */
case class MetadataException(message: String = null, cause: Throwable = null) extends RuntimeException(message, cause)
