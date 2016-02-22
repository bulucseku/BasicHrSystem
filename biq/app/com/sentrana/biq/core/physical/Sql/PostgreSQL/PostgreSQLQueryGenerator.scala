package com.sentrana.biq.core.physical.Sql.PostgreSQL

import com.sentrana.biq.core.conceptual.AttributeForm
import com.sentrana.biq.core.physical._
import com.sentrana.biq.core.{ Query, Report }
import com.sentrana.biq.core.physical.StatementPart.Implicits._

/**
 * Created by szhao on 1/12/2015.
 */
class PostgreSQLQueryGenerator(
    warehouse: SqlDataWarehouse,
    report:    Report
) extends SqlQueryGenerator(warehouse, report) {

  protected class PostgreSQLReportUnitVisitor(
      postgreSQLQueryGenerator: PostgreSQLQueryGenerator
  ) extends SqlReportUnitVisitor(postgreSQLQueryGenerator) {

    override def visit(attributeForm: AttributeForm): StatementPart = {
      val alias: StatementPart = super.visit(attributeForm)
      if (queryGenerator.report.totalsOn)
        "GROUPING" +/ alias.parenthesize +/ s" AS ${queryGenerator.quoteIdentifier(PostgreSQLQuery.TotalColumnIdentifier)}, " +/ alias
      else
        alias
    }
  }

  // finish
  override def buildQuery: Query = {
    val query = PostgreSqlStatementBuilder(
      buildSelectParts,
      buildFromParts,
      buildWhereParts,
      buildGroupByParts,
      buildOrderByParts,
      report.totalsOn
    ).buildPreparedStatement
    val colFormatStringList = reportUnits.map(_.formatString.getOrElse("")).toSeq
    val queryTextLimit = addRowLimitToQuery(query, warehouse.getIntConfigurationValue("rowLimit"))
    val commandTimeout = warehouse.getIntConfigurationValue("commandTimeout").getOrElse(30)
    new PostgreSQLQuery(warehouse.connectionName, report, queryTextLimit, colFormatStringList, commandTimeout)
  }

  override def createNewQuery = buildQuery

  override def quoteIdentifier(identifier: String): String = '"' + identifier + '"'

  def addRowLimitToQuery(query: StatementPart, rowLimit: Option[Int]): StatementPart = {
    rowLimit match {
      case None => query
      case Some(limit) =>
        val replace = s"SELECT TOP $limit"
        val reg = "SELECT".r
        query.editSql(reg.replaceAllIn(_, replace))
    }
  }

  override val sqlReportUnitVisitor = new PostgreSQLReportUnitVisitor(this)

}
