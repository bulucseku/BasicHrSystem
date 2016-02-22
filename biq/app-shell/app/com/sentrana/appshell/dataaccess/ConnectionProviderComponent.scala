package com.sentrana.appshell.dataaccess

import java.sql.Connection

import scala.util.Try
import scala.util.control.Exception.ignoring

import com.sentrana.appshell.utils.DbConnectionInfo

trait ConnectionProviderComponent {
  def connectionProvider: ConnectionProvider
}

trait ConnectionProvider {
  def addConnectionPool(name: String, driver: String, url: String, username: String, password: String): Unit

  def addConnectionPool(connectionInfo: DbConnectionInfo): Unit =
    addConnectionPool(
      name     = connectionInfo.name,
      driver   = connectionInfo.driver,
      url      = connectionInfo.url,
      username = connectionInfo.username,
      password = connectionInfo.password
    )

  def getConnectionPool(name: String): Try[ConnectionPool]
  def hasConnectionPool(name: String): Boolean

  def withConnection[A](name: String)(block: Connection => A): Try[A] = {
    getConnection(name) map { conn =>
      try block(conn)
      finally ignoring(classOf[Throwable]) {
        conn.close()
      }
    }
  }

  def getConnection(name: String): Try[Connection] =
    getConnectionPool(name) flatMap { _.getConnection }
}

trait ConnectionPool {
  def getConnection: Try[Connection]
  def close(): Unit
}
