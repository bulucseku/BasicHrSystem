package com.sentrana.usermanagement.mongo

import java.io.File
import java.net.ServerSocket

import scala.util.Try

import com.sentrana.appshell.mongo.WithEmbeddedMongoDB
import com.sentrana.appshell.play.config.{ WithBaseConfig, WithMongoDBConfig }
import org.scalatest.Suite
import org.scalatestplus.play.OneAppPerSuite

/**
 * Created by williamhogben on 5/13/15.
 */
trait WithUMEmbeddedMongoDB
    extends WithMongoDBConfig
    with WithEmbeddedMongoDB {
  this: Suite with OneAppPerSuite =>

  val additionalMongoDatabases = List[String]()
  val additionalCollectionsToCreate = Map[String, Seq[String]]()
  val additionalCollectionsToImport = Map[String, Map[String, String]]()

  private val umDatabaseName = "um"
  override val mongoHost = "localhost"
  override lazy val mongoPort = findAvailablePort
  override val mongoUsername = "scalatest"
  override val mongoPassword = "p@$$w0rd"
  override def mongoDatabases = umDatabaseName :: additionalMongoDatabases

  override def collectionsToCreate: Map[String, Seq[String]] = additionalCollectionsToCreate +
    (umDatabaseName -> Seq(
      "application",
      "configurationGroup",
      "dataFilter",
      "group",
      "organization",
      "passwordResetRequest",
      "userAppSession",
      "userComment",
      "userGroup",
      "userLoginRecord",
      "userPasswordHistory"
    ))

  override def collectionsToImport = additionalCollectionsToImport +
    (umDatabaseName -> Map(
      "application" -> s"${app.path.getAbsolutePath}/app-shell/test/com/sentrana/usermanagement/mongo/json/application.json",
      "dataFilter" -> s"${app.path.getAbsolutePath}/app-shell/test/com/sentrana/usermanagement/mongo/json/dataFilter.json",
      "organization" -> s"${app.path.getAbsolutePath}/app-shell/test/com/sentrana/usermanagement/mongo/json/organization.json"
    ))

  /**
   * Adapted from https://gist.github.com/vorburger/3429822
   */
  private def findAvailablePort: Int = {
    val socket = Try(new ServerSocket(0))
    socket foreach { _.setReuseAddress(true) }
    val port = socket map { _.getLocalPort }
    socket foreach { _.close() }
    port getOrElse {
      throw new IllegalStateException("Could not find a free TCP/IP port to connect to embedded MongoDB instance")
    }
  }
}
