package com.sentrana.biq

import org.scalatestplus.play.{ PlaySpec, ConfiguredApp }

import com.sentrana.appshell.utils.ConfigurationUtil

/**
 * Created by joshua.hagins on 9/10/15.
 */
abstract class BIQServiceSpec extends PlaySpec with ConfiguredApp with SpecHelpers {
  lazy val applicationContext = ConfigurationUtil.getAppSettingValue("application.context")
}
