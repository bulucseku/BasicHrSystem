package com.sentrana.appshell.play.config

trait WithBaseConfig extends WithAppConfig {
  override def config: Map[String, Any] = Map()
}
