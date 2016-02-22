package com.sentrana.usermanagement.datacontract

import com.sentrana.appshell.utils.ConfigurationUtil
import play.api.mvc.Cookie
import play.api.Play
import play.api.Play.current

/**
 * Created by williamhogben on 8/18/15.
 */
class BaseDomainCookie(
    name:     String,
    value:    String,
    httpOnly: Boolean = false
) extends Cookie(name = name, value = value, httpOnly = httpOnly) {

  lazy val timeoutSetting = Play.configuration.getInt("SessionTimeoutMinutes").getOrElse(60)

  override val domain: Option[String] = {
    // expects urls in the form http://blah.blah.com/
    val appUrl = ConfigurationUtil.getAppSettingValue("ApplicationUrl")
    // matches urls of the form "http://blah.blah.com/"
    val baseDomainRegex = """https?://(?:[^.]+\.)*([^.]+\.(?:[a-zA-Z]{3}|[a-zA-Z]{2}))/?""".r
    appUrl match {
      case baseDomainRegex(base) => Some(base)
      case _                     => None
    }
  }

  override val maxAge: Option[Int] = Some(timeoutSetting * 60)
}

object BaseDomainCookie {

  def apply(
    name:     String,
    value:    String,
    httpOnly: Boolean = false
  ): BaseDomainCookie = new BaseDomainCookie(name, value, httpOnly)

}
