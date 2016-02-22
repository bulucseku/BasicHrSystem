package com.sentrana.biq.core.physical

import anorm._
import com.sentrana.appshell.data.Dataset
import com.sentrana.appshell.dataaccess.ConnectionProvider
import com.sentrana.biq.Global
import com.sentrana.biq.core.{ Query, Report }
import play.api.Logger

/**
 * Created by szhao on 1/12/2015.
 */
class SqlQuery(
    val dbName:         String,
    val report:         Report,
    val query:          StatementPart,
    val formatStrList:  Seq[String]   = Seq(),
    val commandTimeout: Int           = 30
) extends Query {

  implicit val connectionProvider = Global.connectionProvider

  val queryText = connectionProvider.withConnection(dbName) {
    implicit c =>
      query.parameters.foldLeft(query.sql) { (sql, param) =>
        val placeholder = s"{${param.name}}"
        val value = SQL(placeholder).on(param).getFilledStatement(c).toString
        sql.replace(placeholder, value)
      }
  }.getOrElse("")

  val queryParameters: Traversable[NamedParameter] = query.parameters

  def execute: Dataset = {
    if (report == null) throw new Exception(
      "Formatted query cannot be executed without a report context."
    )
    Logger("sql").debug("Executing Sql Query: \n" + queryText)
    val dataset = Dataset(dbName, query.sql, formatStrList, queryParameters)
    Logger("sql").debug("Finished executing query.")
    dataset
  }

  def executeRaw: Dataset = {
    Dataset(dbName, queryText)
  }
}
