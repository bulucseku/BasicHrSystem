package com.sentrana.appshell.utils

import scala.collection.JavaConversions._

import play.api.Play
import play.api.Play.current

import com.sentrana.appshell.exceptions.ConfigurationException

/**
 * Created by szhao on 11/25/2014.
 */
object ConfigurationUtil {
  def getAppSettingValue(appKey: String): String = {
    Play.configuration.getString(appKey).getOrElse(throw new ConfigurationException("Missing configuration value for Key: " + appKey))
  }

  def getAppSettingList(appKey: String): Seq[String] = {
    Play.configuration.getStringList(appKey).getOrElse {
      throw new ConfigurationException("Missing configuration value for Key: " + appKey)
    }
  }
}
