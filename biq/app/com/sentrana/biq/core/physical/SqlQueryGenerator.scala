package com.sentrana.biq.core.physical

import anorm.{ ParameterValue, NamedParameter }
import com.sentrana.biq.core.conceptual._
import com.sentrana.biq.core.{ BaseQueryGenerator, Report }
import scala.language.postfixOps
import com.sentrana.biq.core.physical.StatementPart.Implicits._

/**
 * Created by szhao on 1/12/2015.
 */
abstract class SqlQueryGenerator(
    val warehouse: SqlDataWarehouse,
    report:        Report
) extends BaseQueryGenerator(report) {

  lazy val bestRoot: (Table, Traversable[DatabaseObject]) = {
    val tables = warehouse.allTables.toList.sortBy(_.size)
    val conObjects = fundamentalConceptualObjects.filter(x => !x.isInstanceOf[ConstantMetric])
    val root = tables.map { table =>
      (table, getDatabaseEquivalent(table, conObjects))
    }.find(_._2.nonEmpty).map(tuple => (tuple._1, tuple._2.get))
    root.getOrElse(
      throw new Exception(
        "Cannot find source with all of the specified conceptual elements"
      )
    )
  }

  lazy val root: Table = bestRoot._1

  lazy val databaseObjects: Map[ConceptualObject, DatabaseObject] = {
    bestRoot._2.map(dbo => (dbo.conceptualEquivalent.get, dbo)).toMap
  }

  lazy val relevantColumns = {
    val columns = databaseObjects.values.collect { case c: Column => c }
    val segments = databaseObjects.values.collect { case s: SegmentValue => s.parent }
    columns ++ segments.toList.distinct
  }

  val metricVisitor = new SqlMetricVisitor(this)

  val sqlReportUnitVisitor = new SqlReportUnitVisitor(this)

  case class SqlMetricVisitor(
      queryGenerator: SqlQueryGenerator,
      filters:        Traversable[FilterUnit] = Nil
  ) extends MetricVisitor[StatementPart] {
    def castString(cast: String): String = s"CAST(COALESCE($cast,0) AS DECIMAL(26,5))"

    val aggregationFormats: Map[Enumeration#Value, String => String] = Map(
      AggregationOperation.Sum -> { "SUM(" + castString(_) + ")" },
      AggregationOperation.Average -> { "AVG(" + castString(_) + ")" },
      AggregationOperation.CountDistinct -> { "COUNT(DISTINCT(" + castString(_) + "))" },
      AggregationOperation.Count -> { "COUNT(" + castString(_) + ")" },
      AggregationOperation.Max -> { "MAX(" + castString(_) + ")" },
      AggregationOperation.Min -> { "MIN(" + castString(_) + ")" },
      AggregationOperation.StdDev -> { "STDEV(" + castString(_) + ")" }
    )

    val binaryOperatorFormats: Map[BinaryOperation, (String, String) => String] = Map(
      BinaryOperation.Addition -> { (a, b) => s"$a + $b" },
      BinaryOperation.Subtraction -> { (a, b) => s"$a - $b" },
      BinaryOperation.Multiplication -> { (a, b) => s"$a * $b" },
      BinaryOperation.Division -> { (a, b) => s"$a / NULLIF($b,0)" }
    )

    def visit(metric: Metric): StatementPart = {
      metric match {
        case m: SimpleMetric          => visit(m)
        case m: ConstantMetric        => visit(m)
        case m: BinaryOperationMetric => visit(m)
        case m: PercentTotalMetric    => visit(m)
        case m: FilteredMetric        => visit(m)
        case m: DerivedMetric         => visit(m)
        case m: AggregateMetric       => visit(m)
      }
    }

    private def visit(simpleMetric: SimpleMetric): StatementPart = {
      val expression: StatementPart = if (filters.nonEmpty) {
        val filterExpression = filters.toList.groupBy(_.filterGroup)
          .values.map(queryGenerator.buildLogicalDisjunction)
          .map(_.parenthesize).reduce((a, b) => a and b)
        "CASE WHEN (" +/ filterExpression +/ s") THEN (${queryGenerator.databaseObjects(simpleMetric.fact).queryAlias}) ELSE 0 END"
      }
      else
        StatementPart(queryGenerator.databaseObjects(simpleMetric.fact).queryAlias)
      expression.editSql(aggregationFormats(simpleMetric.operation))
    }

    private def visit(metric: ConstantMetric): StatementPart = {
      StatementPart(metric.id)
    }

    private def visit(metric: BinaryOperationMetric): StatementPart = {
      val left = metric.left.accept(this)
      val right = metric.right.accept(this)
      val sql = binaryOperatorFormats(metric.operation)(
        left.parenthesize.sql, right.parenthesize.sql
      )
      StatementPart(sql, left +/ right parameters)
    }

    private def visit(metric: PercentTotalMetric): StatementPart = {
      val multiplier = if (queryGenerator.report.totalsOn)
        (1 + queryGenerator.groupingElements.size).toString + " * "
      else
        ""
      val accepted = metric.baseMetric.accept(this)
      s"$multiplier(" +/ accepted +/ ") / SUM(" +/ accepted +/ ") OVER()"
    }

    private def visit(metric: FilteredMetric): StatementPart = {
      metric.baseMetric.accept(this.copy(filters = filters ++ metric.filters))
    }

    private def visit(metric: DerivedMetric): StatementPart = {
      visit(
        metric.binaryOperationMetric.getOrElse(
          throw new IllegalArgumentException(
            "Binary Operation metric is not attached to derived metric: " + metric.name
          )
        )
      )
    }

    private def visit(metric: AggregateMetric): StatementPart = {
      metric.baseMetric match {
        case m: SimpleMetric => visit(m)
        case o: Metric => throw new IllegalArgumentException(
          s"Base metric [${o.id}}] is not a simple metric of AggregateMetric: [${metric.id}}]"
        )
      }
    }
  }

  class SqlReportUnitVisitor(val queryGenerator: SqlQueryGenerator) extends ReportUnitVisitor[StatementPart] {
    def visit(metric: Metric) = queryGenerator.metricVisitor.enter(metric)
    def visit(attributeForm: AttributeForm): StatementPart = StatementPart(queryGenerator.databaseObjects(attributeForm).queryAlias)
  }

  def quoteIdentifier(identifier: String): String

  def getDatabaseEquivalent(
    table:    Table,
    concepts: Traversable[ConceptualObject]
  ): Option[Traversable[DatabaseObject]] = {
    val equivalents = concepts.map(concept => table.findEquivalent(concept))
    if (equivalents.exists(_.isEmpty))
      None
    else
      Some(equivalents.map(_.get))
  }

  def buildLogicalDisjunction(filterElements: Traversable[FilterUnit]): StatementPart = {
    val dbos = filterElements.filter(
      f => f.fundamentalElements.nonEmpty
        && !f.isInstanceOf[RangeFilter]
        && !f.isInstanceOf[TreeFilter]
        && !f.isInstanceOf[DateFilter]
        && !f.isInstanceOf[DataFilter]
    ).flatMap(_.fundamentalElements).map(databaseObjects(_))

    val valueClauses = dbos.collect { case rf: SegmentValue => rf }
      .groupBy(_.parent).map(t => segmentValueLogicalDisjunction(t._1, t._2))

    val intervalClauses = dbos.collect { case rf: BandedSegmentInterval => rf }
      .groupBy(_.parent).map(t => bandedSegmentIntervalLogicalDisjunction(t._1, t._2))

    val rangeFilterClauses = filterElements.collect { case rf: RangeFilter => rf }
      .groupBy(
        rf => databaseObjects(rf.fundamentalElements.head)
          .asInstanceOf[SegmentValue].parent
      ).map(t => rangeFilterLogicalDisjunction(t._1, t._2))

    val groupFilteredClauses = filterElements.collect {
      case tf: TreeFilter =>
        tf.parentSegmentValues = tf.parentNodes.map(node => root.findEquivalent(node).getOrElse(
          throw new Exception("Cannot find equivalent of tree filter parent node: " + node.id)
        ).asInstanceOf[SegmentValue])
        tf
    }.groupBy(x => x).map(t => treeFilterLogicalDisjunction(t._1, t._2))

    val dateFilterClauses = filterElements.collect { case f: DateFilter => f }
      .groupBy(rf => databaseObjects(rf.fundamentalElements.head).asInstanceOf[SegmentValue].parent)
      .map(t => dateFilterLogicalDisjunction(t._1, t._2))

    val dataFilterClauses: Traversable[StatementPart] = filterElements.collect { case f: DataFilter => f }
      .groupBy(rf => databaseObjects(rf.fundamentalElements.head).asInstanceOf[SegmentValue].parent)
      .map(t => dataFilterLogicalDisjunction(t._1, t._2))
    val dataFilter = if (dataFilterClauses.isEmpty) Nil else List(dataFilterClauses.reduce(_ and _))

    (valueClauses ++ intervalClauses ++ rangeFilterClauses ++ groupFilteredClauses ++
      dateFilterClauses ++ dateFilterClauses ++ dataFilter).reduce(_ or _)
  }

  def dataFilterLogicalDisjunction(segment: Segment, filterValues: Traversable[DataFilter]): StatementPart = {
    filterValues
      .map { f =>
        val value = if (f.operator == "IN") {
          f.value.split(",").map(v => StatementPart.fromValue(v.trim)).reduce(_ comma _).parenthesize
        }
        else {
          " " +/ StatementPart.fromValue(f.value)
        }
        s"$segment ${f.operator}" +/ value
      }
      .reduceLeft(_ and _)
  }

  def dateFilterLogicalDisjunction(segment: Segment, filters: Traversable[DateFilter]): StatementPart = {
    val params = filters.map { f => StatementPart.fromValue(f.formattedDate) }
    inOrEquals(s"$segment", params)
  }

  def segmentValueLogicalDisjunction(segment: Segment, values: Traversable[SegmentValue]): StatementPart = {
    val nullExists = values.exists(_.value == null)
    val nonNullValues = values.filter(_.value != null).map { f => StatementPart.fromValue(f.value) }
    val valueClause: StatementPart = nonNullValues.size match {
      case 0 => StatementPart()
      case 1 => s"${segment.queryAlias} = " +/ nonNullValues.head
      case _ => s"${segment.queryAlias} IN " +/ (nonNullValues reduce { _ comma _ }).parenthesize
    }
    (nullExists, nonNullValues.size) match {
      case (true, 0) => StatementPart(s"$segment IS NULL")
      case (true, _) => s"$segment IS NULL OR " +/ valueClause
      case _         => valueClause
    }
  }

  def bandedSegmentIntervalLogicalDisjunction(segment: BandedSegment, intervals: Traversable[BandedSegmentInterval]): StatementPart = {
    intervals.map {
      bsi =>
        val lowerBound = StatementPart.fromValue(bsi.formattedLowerBound)
        val upperBound = StatementPart.fromValue(bsi.formattedUpperBound)
        segment + (if (bsi.isLowerInclusive) " >= " else " > ") +/ lowerBound and
          (segment + (if (bsi.isUpperInclusive) " <= " else " < ")) +/ upperBound
    }.reduce(_ or _)
  }

  def rangeFilterLogicalDisjunction(segment: Segment, ranges: Traversable[RangeFilter]): StatementPart = {
    ranges.map { rf =>
      val lowerBound = StatementPart.fromValue(rf.formattedLowerBound)
      val upperBound = StatementPart.fromValue(rf.formattedUpperBound)
      segment + (if (rf.isLowerInclusive) " >= " else " > ") +/ lowerBound and
        (segment + (if (rf.isUpperInclusive) " <= " else " < ")) +/ upperBound
    }.reduce(_ or _)
  }

  def treeFilterLogicalDisjunction(baseFilter: TreeFilter, treeFilters: Traversable[TreeFilter]): StatementPart = {
    val groupingClause = baseFilter.parentSegmentValues
      .map(sv => s"${sv.parent.queryAlias} = " +/ StatementPart.fromValue(sv.value))
    val values = treeFilters.map(
      x => root.findEquivalent(x.attributeElement).getOrElse(
        throw new Exception("Cannot find equivalent of attribute element: " + x.attributeElement.id)
      ).asInstanceOf[SegmentValue]
    )
    val params = values.map { v => StatementPart.fromValue(v.value) }
    val formatClause = inOrEquals(values.head.parent.queryAlias, params)
    if (groupingClause.size > 0 && groupingClause.head != formatClause)
      groupingClause.reduce(_ and _) and formatClause
    else
      formatClause.parenthesize
  }

  protected def inOrEquals(columnName: String, values: Traversable[StatementPart]): StatementPart = {
    val valuesString = values.reduce(_ comma _)
    if (values.size == 1) s"$columnName = " +/ valuesString else s"$columnName IN" +/ valuesString.parenthesize
  }

  def buildSelectParts: Traversable[StatementPart] = {
    reportUnits.map { unit =>
      sqlReportUnitVisitor.enter(unit) +/ s" AS ${quoteIdentifier(unit.name)}"
    }
  }

  def buildWhereParts: Traversable[StatementPart] = {
    val rootStatementPart = root.rootFilterStatement
    val elementFilters = filterGroups.map(buildLogicalDisjunction)
    (rootStatementPart.toList ++ elementFilters).map(_.parenthesize)
  }

  def buildFromParts: Traversable[StatementPart] = {
    val rootInclusionClause = s"${root.databaseId} AS ${root.queryAlias}"
    buildFromClauseHelper(root, rootInclusionClause)
  }

  private def buildFromClauseHelper(table: Table, inclusionClause: String): Traversable[StatementPart] = {
    val childClauses = table.joins.flatMap(j => buildFromClauseHelper(j.child, j.joinStatment))
    if (childClauses.nonEmpty || table.columns.toSeq.intersect(relevantColumns.toSeq).nonEmpty)
      List(StatementPart(inclusionClause)) ++ childClauses
    else
      childClauses
  }

  protected def buildGroupByParts: Traversable[StatementPart] = {
    groupingElements
      .map(_.map(group => databaseObjects(group)).toList.distinct)
      .map(forms => StatementPart(forms.map(_.queryAlias).mkString(", ")))
  }

  protected def buildOrderByParts: Traversable[StatementPart] = {
    sortUnits.map{ tu =>
      val sortName = databaseObjects.get(tu.reportUnit.canonicalSortConcept) match {
        case None => quoteIdentifier(tu.reportUnit.canonicalSortConcept.name)
        case Some(physical) =>
          if (report.totalsOn)
            s"GROUPING(${physical.queryAlias}), ${physical.queryAlias}"
          else
            physical.queryAlias
      }
      StatementPart(sortName + " " + tu.sortUnit.sortOrder)
    }
  }
}

