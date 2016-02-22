package com.sentrana.biq.core.physical.Sql.PostgreSQL

import com.sentrana.biq.core.Report
import com.sentrana.biq.core.physical.{ StatementPart, SqlQuery }

/**
 * Created by szhao on 1/12/2015.
 */
case class PostgreSQLQuery(
  override val dbName:         String,
  override val report:         Report,
  override val query:          StatementPart,
  override val formatStrList:  Seq[String]   = Seq(),
  override val commandTimeout: Int           = 30
) extends SqlQuery(dbName, report, query, formatStrList, commandTimeout)

object PostgreSQLQuery {
  val TotalColumnIdentifier = "_isTotal"
}