package com.sentrana.biq.core.physical

/**
 * Created by williamhogben on 7/16/15.
 */
import com.sentrana.biq.core.physical.StatementPart.Implicits._

abstract class SqlStatementBuilder {

  def selectStatements: Traversable[StatementPart]
  def fromStatements: Traversable[StatementPart]
  def whereStatements: Traversable[StatementPart]
  def groupByStatements: Traversable[StatementPart]
  def orderByStatements: Traversable[StatementPart]
  def totalsOn: Boolean = false

  val lineTerminator: String = "\n"
  val indentString = "    "

  protected def select = {
    ifNonEmpty(indent(selectStatements), s"SELECT$lineTerminator" +/ _)
  }

  protected def where: StatementPart = {
    ifNonEmpty(indent(whereStatements, " AND "), s"WHERE$lineTerminator" +/ _)
  }

  protected def from: StatementPart = {
    ifNonEmpty(indent(fromStatements, ""), s"FROM$lineTerminator" +/ _)
  }

  protected def groupBy: StatementPart = {
    ifNonEmpty(
      indent(groupByStatements),
      gbc => if (totalsOn) groupByWithRollup else s"GROUP BY$lineTerminator" +/ gbc
    )
  }

  protected def groupByWithRollup: StatementPart = {
    s"GROUP BY ROLLUP(" +/ groupByStatements.map(_.parenthesize).reduce(_ +/ ", " +/ _) +/ ")"
  }

  protected def orderBy: StatementPart = {
    ifNonEmpty(indent(orderByStatements), s"ORDER BY$lineTerminator" +/ _)
  }

  protected def ifNonEmpty(statement: StatementPart, func: StatementPart => StatementPart): StatementPart = {
    if (statement.isEmpty) statement else func(statement)
  }

  protected def indent(source: Traversable[StatementPart], delimiter: String = ", "): StatementPart = {
    source.map(indentString +/ _).foldLeft(StatementPart()){
      (a, b) => if (a.isEmpty) b else a +/ s"$delimiter$lineTerminator" +/ b
    }
  }

  def buildPreparedStatement: StatementPart = {
    val clauses = Seq(select, from, where, groupBy, orderBy)
    clauses.reduce(_ +/ lineTerminator +/ _)
  }
}

case class PostgreSqlStatementBuilder(
  selectStatements:      Traversable[StatementPart],
  fromStatements:        Traversable[StatementPart],
  whereStatements:       Traversable[StatementPart],
  groupByStatements:     Traversable[StatementPart],
  orderByStatements:     Traversable[StatementPart],
  override val totalsOn: Boolean                    = false
) extends SqlStatementBuilder
