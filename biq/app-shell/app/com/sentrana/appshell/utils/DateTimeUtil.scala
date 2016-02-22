package com.sentrana.appshell.utils

import org.joda.time.{ Days, Hours, DateTime }
import java.sql.Timestamp

/**
 * Created by szhao on 12/22/2014.
 */
object DateTimeUtil {
  def getTimeDifference(d1: DateTime, d2: DateTime, interval: String): Int = {
    interval match {
      case "hour" => Hours.hoursBetween(d1, d2).getHours
      case "day"  => Days.daysBetween(d1, d2).getDays
      case _      => throw new Exception("unsupported interval")
    }
  }

  def getTimeDifference(sqltm1: Timestamp, sqltm2: Timestamp, interval: String): Int = {
    val d1: DateTime = new DateTime(sqltm1.getTime)
    val d2: DateTime = new DateTime(sqltm2.getTime)
    getTimeDifference(d1, d2, interval)
  }

  def getTimeDifference(sqltm: Timestamp, interval: String): Int = {
    val d1: DateTime = DateTime.now()
    val d2: DateTime = new DateTime(sqltm.getTime)
    getTimeDifference(d1, d2, interval)
  }
}
