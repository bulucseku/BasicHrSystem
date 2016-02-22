package com.sentrana.biq

import play.api.Application

import com.sentrana.appshell.dataaccess.{ ConnectionProviderComponent, ScalikeJdbcConnectionProviderComponent }
import com.sentrana.appshell.domain.MongoDataServices
import com.sentrana.appshell.exceptions.InvalidConnectionInfoException
import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.appshell.utils.{ ConnectionUtils, DbConnectionInfo }
import com.sentrana.appshell.{ Global => BaseGlobal }
import com.sentrana.biq.metadata.{ RepositoryConnection, MetadataCache, MetadataRepository }
import com.sentrana.usermanagement.domain.document.UMDataServices

/**
 * Created by szhao on 10/30/2014.
 */
trait Global extends BaseGlobal {
  this: ConnectionProviderComponent with LoggerComponent =>

  override def onStart(app: Application): Unit = {
    logBuildInfo()
    initializeConnections(app)
  }

  def logBuildInfo(): Unit = {
    logger.info(BuildInfo.toString)
  }

  def initializeConnections(app: Application): Unit = {
    val config = app.configuration
    // initialize mongodb connection
    MongoDataServices.fromConfig(config)

    // initialize um mongodb connection
    UMDataServices(config)

    // initialize metadata cache
    MetadataCache(config)

    val metadataRepository = MetadataRepository(config)
    metadataRepository.loadAllMetadata()
    metadataRepository.readConnections foreach addConnectionPool
  }

  def addConnectionPool(conn: RepositoryConnection): Unit = {
    val connectionConfig = ConnectionUtils.parseDotNetConnectionInfo(conn.name, conn.source, conn.connectionType, conn.connectionUrl)
    connectionConfig map addConnectionPool recover {
      case e: InvalidConnectionInfoException => Logger.error(e.getMessage)
    }
  }

  def addConnectionPool(connectionInfo: DbConnectionInfo): Unit = {
    logger.info(s"Connecting to ${connectionInfo.name} at ${connectionInfo.url}")
    connectionProvider.addConnectionPool(connectionInfo)
  }

  def refreshConnectionPool(name: String): Unit = {
    logger.info(s"Refreshing connection pool named ${name}")
    MetadataRepository().readConnections.filter(_.name == name) foreach addConnectionPool
  }
}

object Global extends Global with ScalikeJdbcConnectionProviderComponent with PlayLoggerComponent
