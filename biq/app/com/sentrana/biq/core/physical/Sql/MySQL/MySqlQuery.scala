package com.sentrana.biq.core.physical.Sql.MySQL

import com.sentrana.biq.core.Report
import com.sentrana.biq.core.physical.{ StatementPart, SqlQuery }

/**
 * Created by william.hogben on 2/6/2015.
 */
case class MySqlQuery(
  override val dbName:         String,
  override val report:         Report,
  override val query:          StatementPart,
  override val formatStrList:  Seq[String]   = Seq(),
  override val commandTimeout: Int           = 30
) extends SqlQuery(dbName, report, query, formatStrList, commandTimeout)
