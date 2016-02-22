package com.sentrana.appshell.play.config

trait WithConfigSubFolderLocation extends WithAppConfig {
  def configSubFolderLocation: String

  abstract override def config: Map[String, Any] =
    super.config + ("ConfigSubFolderLocation" -> configSubFolderLocation)
}
