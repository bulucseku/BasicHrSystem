package com.sentrana.appshell.play.config

trait WithAppConfig {
  def config: Map[String, Any]
}
