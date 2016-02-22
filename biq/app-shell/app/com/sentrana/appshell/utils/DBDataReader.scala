package com.sentrana.appshell.utils

import java.sql._

import scala.util.{ Failure, Success, Try }

import com.sentrana.appshell.dataaccess.ConnectionProviderComponent
import com.sentrana.appshell.logging.LoggerComponent
import com.sentrana.usermanagement.datacontract.KeyValuePair

trait DataReaderComponent {
  def dataReader: DataReader
  trait DataReader {
    def getLookupData(connectionName: String, query: String): List[KeyValuePair]
  }
}

trait DBDataReaderComponent extends DataReaderComponent {
  self: ConnectionProviderComponent with LoggerComponent =>

  val dataReader = new DBDataReader

  /**
   * This is used to handle database related operation. In this class we will have the functionality
   * to retrieve lookup data based on raw query and connection info
   * Created by szhao on 4/14/2014.
   */
  class DBDataReader extends DataReader {
    /**
     * This is used for getting lookup data. List of key-value pair will be returned from this
     * @param connectionName The name of the connection defined in the application configuration
     * @param query The query string which needs to execute to retrieve data
     * @return
     */
    def getLookupData(connectionName: String, query: String): List[KeyValuePair] = {
      Logger.debug("Getting connection for lookup data. The connection name is: " + connectionName)
      val tryLookupData = connectionProvider.withConnection(connectionName) { conn =>
        val resultSet = executeQuery(conn, query)
        extractKeyValuePairs(resultSet)
      }
      val lookupData = tryLookupData match {
        case Success(keyValuePairs) => keyValuePairs
        case Failure(ex)            => throw ex
      }
      Logger.debug("No. of items in list is: " + lookupData.size)
      lookupData
    }

    private def executeQuery(conn: Connection, query: String): ResultSet = {
      val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)
      statement.executeQuery(query)
    }

    private def extractKeyValuePairs(resultSet: ResultSet): List[KeyValuePair] = {
      val valueColumn = getColumnIndex(resultSet, "value") getOrElse 1
      val displayTextColumn = getColumnIndex(resultSet, "display_text") getOrElse 2

      val pairs = for {
        row <- resultSetIterator(resultSet)
        value = row.getString(valueColumn)
        displayText = row.getString(displayTextColumn)
        if value.nonEmpty && displayText.nonEmpty
      } yield KeyValuePair(value, displayText)

      pairs.toList
    }

    private def getColumnIndex(resultSet: ResultSet, columnLabel: String): Option[Int] =
      Try(resultSet.findColumn(columnLabel)).toOption

    private def resultSetIterator(resultSet: ResultSet): Iterator[ResultSet] = {
      new Iterator[ResultSet] {
        def hasNext = resultSet.next()
        def next() = resultSet
      }
    }
  }
}
