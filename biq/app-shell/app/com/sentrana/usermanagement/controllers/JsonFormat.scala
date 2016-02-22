package com.sentrana.usermanagement.controllers

import org.json4s._

/**
 * Created by szhao on 9/22/14.
 */

object JsonFormat {
  implicit var formats = DefaultFormats.withBigDecimal
}
