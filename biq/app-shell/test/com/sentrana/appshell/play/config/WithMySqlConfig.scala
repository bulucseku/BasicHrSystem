package com.sentrana.appshell.play.config

trait WithMySqlConfig extends WithAppConfig {
  def mySqlDriver: String = "com.mysql.jdbc.Driver"
  def mySqlPrefix: String
  def mySqlURL: String

  abstract override def config: Map[String, Any] = super.config ++ Map(
    s"db.$mySqlPrefix.driver" -> mySqlDriver,
    s"db.$mySqlPrefix.url" -> mySqlURL
  )
}
