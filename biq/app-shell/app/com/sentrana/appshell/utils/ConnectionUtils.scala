package com.sentrana.appshell.utils

import scala.util.{ Failure, Try }

import play.api.Configuration

import com.typesafe.config.ConfigFactory

import com.sentrana.appshell.exceptions.InvalidConnectionInfoException

/**
 * Created by szhao on 10/31/2014.
 */
object ConnectionUtils {

  final val MYSQL_DEFAULT_PORT = 3306
  final val MYSQL_JDBC_DRIVER = "com.mysql.jdbc.Driver"
  final val MYSQL_DOTNET_DRIVER = "MySql.Data.MySqlClient"
  final val MYSQL_JDBC_TYPE = "mysql"

  final val POSTGRESQL_DEFAULT_PORT = 5439
  final val POSTGRESQL_JDBC_DRIVER = "org.postgresql.Driver"
  final val POSTGRESQL_DOTNET_DRIVER = "Npgsql"
  final val POSTGRESQL_JDBC_TYPE = "postgresql"

  /**
   * We need to convert this kind of .Net db configuration
   * <DashboardConnection name="IBConnectionForHeinz" source="Database">
   *   <ConnectionType>MySql.Data.MySqlClient</ConnectionType>
   *   <ConnectionUrl>Server=10.46.33.122;Port=5029;Database=heinz_prototype;Uid=fsmosaic;Pwd=004509nn;Pooling=true;</ConnectionUrl>
   * </DashboardConnection>
   * into something like below
   * db.um.driver=com.mysql.jdbc.Driver
   * db.um.url="mysql://fsmosaic:004509nn@10.46.33.122:5029/heinz_prototype"
   * @return
   */
  def parseDotNetConnectionInfo(
    connectionName:   String,
    connectionSource: String,
    connectionType:   String,
    connectionUrl:    String
  ): Try[DbConnectionInfo] = {
    val connectionParams = connectionStringToDict(connectionUrl)
    connectionType match {
      case MYSQL_DOTNET_DRIVER      => parseDotNetMySqlConnectionInfo(connectionName, connectionParams)
      case POSTGRESQL_DOTNET_DRIVER => parseDotNetPostgreSqlConnectionInfo(connectionName, connectionParams)
      case _ => Failure(
        InvalidConnectionInfoException(s"Unrecognized driver for connection $connectionName: $connectionType")
      )
    }
  }

  private[this] def connectionStringToDict(connectionUrl: String): Map[String, String] =
    connectionUrl.split(";")
      .map{ _.split("=") }
      .collect{ case Array(k, v) => k.toLowerCase -> v }
      .toMap

  private[this] def parseDotNetMySqlConnectionInfo(
    connectionName:   String,
    connectionParams: Map[String, String]
  ): Try[DbConnectionInfo] =
    parseDotNetConnectionInfoImpl(
      connectionName   = connectionName,
      connectionParams = connectionParams,
      driverName       = MYSQL_JDBC_DRIVER,
      jdbcType         = MYSQL_JDBC_TYPE,
      usernameKey      = "uid",
      passwordKey      = "pwd",
      defaultPort      = MYSQL_DEFAULT_PORT
    )

  private[this] def parseDotNetPostgreSqlConnectionInfo(
    connectionName:   String,
    connectionParams: Map[String, String]
  ): Try[DbConnectionInfo] =
    parseDotNetConnectionInfoImpl(
      connectionName   = connectionName,
      connectionParams = connectionParams,
      driverName       = POSTGRESQL_JDBC_DRIVER,
      jdbcType         = POSTGRESQL_JDBC_TYPE,
      usernameKey      = "user id",
      passwordKey      = "password",
      defaultPort      = POSTGRESQL_DEFAULT_PORT
    )

  private[this] def parseDotNetConnectionInfoImpl(
    connectionName:   String,
    connectionParams: Map[String, String],
    driverName:       String,
    jdbcType:         String,
    usernameKey:      String,
    passwordKey:      String,
    defaultPort:      Int
  ): Try[DbConnectionInfo] = Try {
    DbConnectionInfo(
      name     = connectionName,
      driver   = driverName,
      dbType   = jdbcType,
      username = connectionParams(usernameKey),
      password = connectionParams(passwordKey),
      server   = connectionParams("server"),
      port     = connectionParams.getOrElse("port", defaultPort.toString),
      database = connectionParams("database")
    )
  } recoverWith {
    case e: NoSuchElementException => Failure(
      InvalidConnectionInfoException(s"Error parsing connection $connectionName: ${e.getMessage}", e)
    )
  }

  def parsePlayConfigConnectionInfo(
    connectionName:   String,
    connectionConfig: Configuration
  ): Try[DbConnectionInfo] = Try {
    def getConfigValue(key: String) = connectionConfig.getString(s"$connectionName.$key") getOrElse {
      throw new InvalidConnectionInfoException(s"No $key provided for connection $connectionName")
    }

    val driver = getConfigValue("driver")
    val url = getConfigValue("url")
    val username = getConfigValue("user")
    val password = getConfigValue("password")

    validateJdbcDriver(connectionName, driver)

    DbConnectionInfo(connectionName, driver, url, username, password)
  }

  private def validateJdbcDriver(connectionName: String, driver: String): Unit = driver match {
    case MYSQL_JDBC_DRIVER | POSTGRESQL_JDBC_DRIVER => ()
    case _ => throw new InvalidConnectionInfoException(s"Unrecognized driver for connection $connectionName: $driver")
  }
}

case class DbConnectionInfo(
    name:     String,
    driver:   String,
    url:      String,
    username: String,
    password: String
) {
  lazy val configString = List(
    keyValueString("driver", driver),
    keyValueString("url", url),
    keyValueString("user", username),
    keyValueString("password", password)
  ) mkString "\n"

  private def keyValueString(key: String, value: String) = s"""db.$name.$key="$value"""

  def toConfig: Configuration = Configuration(ConfigFactory.parseString(configString))
}

object DbConnectionInfo {
  def apply(
    name:     String,
    dbType:   String,
    driver:   String,
    server:   String,
    port:     String,
    database: String,
    username: String,
    password: String
  ): DbConnectionInfo = {
    val url = s"jdbc:$dbType://$server:$port/$database"
    new DbConnectionInfo(name, driver, url, username, password)
  }
}
