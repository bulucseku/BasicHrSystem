package com.sentrana.appshell.dataaccess

import java.sql.Connection
import scala.util.Try

import scalikejdbc.ConnectionPoolSettings

trait ScalikeJdbcConnectionProviderComponent extends ConnectionProviderComponent {

  def connectionProvider = new ScalikeJdbcConnectionProvider

  class ScalikeJdbcConnectionProvider extends ConnectionProvider {
    def addConnectionPool(name: String, driver: String, url: String, username: String, password: String): Unit = {
      val cpSettings = ConnectionPoolSettings(driverName = driver)
      scalikejdbc.ConnectionPool.add(name, url, username, password, cpSettings)
    }

    def getConnectionPool(name: String): Try[ConnectionPool] = {
      Try(scalikejdbc.ConnectionPool.get(name)) map { pool =>
        new ConnectionPool {
          def getConnection: Try[Connection] = Try(pool.borrow())
          def close(): Unit = pool.close()
        }
      }
    }

    def hasConnectionPool(name: String): Boolean =
      scalikejdbc.ConnectionPool.isInitialized(name)
  }
}
