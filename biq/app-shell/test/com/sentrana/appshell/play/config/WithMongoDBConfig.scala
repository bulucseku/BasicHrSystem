package com.sentrana.appshell.play.config

trait WithMongoDBConfig extends WithAppConfig {

  def mongoHost: String
  def mongoPort: Int
  def mongoDatabases: List[String]
  def mongoUsername: String
  def mongoPassword: String

  abstract override def config: Map[String, Any] = super.config ++ mongoDatabases.map { db =>
    Map(
      s"mongodb-mdr.$db.host" -> mongoHost,
      s"mongodb-mdr.$db.port" -> mongoPort,
      s"mongodb-mdr.$db.database" -> db,
      s"mongodb-mdr.$db.user" -> mongoUsername,
      s"mongodb-mdr.$db.pass" -> mongoPassword
    )
  }.reduce { _ ++ _ }

}

