package com.sentrana.biq.core.physical.Sql.MySQL

import com.sentrana.biq.core.conceptual.{ AggregationOperation, Metric }
import com.sentrana.biq.core.physical.{ StatementPart, SqlQueryGenerator }
import com.sentrana.biq.core.{ Query, Report }

/**
 * Created by william.hogben on 2/6/2015.
 */
class MySqlQueryGenerator(
    override val warehouse: MySqlDataWarehouse,
    override val report:    Report
) extends SqlQueryGenerator(warehouse, report) {

  override val sqlReportUnitVisitor = new MySqlReportUnitVisitor(this)

  override val metricVisitor = new MySqlMetricVisitor(this)

  class MySqlMetricVisitor(queryGenerator: SqlQueryGenerator) extends SqlMetricVisitor(queryGenerator) {

    override val aggregationFormats: Map[Enumeration#Value, String => String] = Map(
      AggregationOperation.Sum -> { "SUM(" + castString(_) + ")" },
      AggregationOperation.Average -> { "AVG(" + castString(_) + ")" },
      AggregationOperation.CountDistinct -> { "COUNT(DISTINCT(" + castString(_) + "))" },
      AggregationOperation.Count -> { "COUNT(" + castString(_) + ")" },
      AggregationOperation.Max -> { "MAX(" + castString(_) + ")" },
      AggregationOperation.Min -> { "MIN(" + castString(_) + ")" },
      AggregationOperation.StdDev -> { "STDDEV(" + castString(_) + ")" }
    )
  }

  override def buildQuery: Query = {
    val query = MySqlStatementBuilder(
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
    MySqlQuery(warehouse.connectionName, report, queryTextLimit, colFormatStringList, commandTimeout)
  }

  override def createNewQuery = buildQuery

  override def quoteIdentifier(identifier: String): String = '`' + identifier + '`'

  class MySqlReportUnitVisitor(
      queryGenerator:                   MySqlQueryGenerator,
      val isSelectStatementOverOrderBy: Boolean             = false
  ) extends SqlReportUnitVisitor(queryGenerator) {

    override def visit(metric: Metric): StatementPart = {
      if (queryGenerator.report.totalsOn && isSelectStatementOverOrderBy)
        StatementPart(queryGenerator.quoteIdentifier(metric.name))
      else
        super.visit(metric)
    }
  }

  override def buildOrderByParts: Traversable[StatementPart] = {
    sortUnits.map{ tu =>
      val sortName = databaseObjects.get(tu.reportUnit.canonicalSortConcept) match {
        case None           => quoteIdentifier(tu.reportUnit.canonicalSortConcept.name)
        case Some(physical) => physical.queryAlias
      }
      StatementPart(sortName + " " + tu.sortUnit.sortOrder)
    }
  }

  protected def addRowLimitToQuery(query: StatementPart, rowLimit: Option[Int]) = {
    rowLimit match {
      case Some(limit) => query +/ s" LIMIT $limit"
      case None        => query
    }
  }
}
