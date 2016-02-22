package com.sentrana.biq.core.physical

import anorm.{ ParameterValue, NamedParameter }
import com.sentrana.usermanagement.authentication.Guid
import scala.language.implicitConversions

/**
 * Created by williamhogben on 7/16/15.
 */
case class StatementPart(
    sql:        String                      = "",
    parameters: Traversable[NamedParameter] = Seq()
) {
  def or(statement: StatementPart): StatementPart = {
    StatementPart(
      s"$sql OR ${statement.sql}",
      parameters ++ statement.parameters
    )
  }

  def and(statement: StatementPart): StatementPart = {
    StatementPart(
      s"$sql AND ${statement.sql}",
      parameters ++ statement.parameters
    )
  }

  def comma(statement: StatementPart): StatementPart = {
    StatementPart(
      s"$sql, ${statement.sql}",
      parameters ++ statement.parameters
    )
  }

  def isEmpty = sql.isEmpty

  def editSql(func: String => String): StatementPart = copy(sql = func(sql))

  def +/(string: String): StatementPart = copy(sql = s"$sql$string")

  def +/(statement: StatementPart): StatementPart = {
    StatementPart(s"$sql${statement.sql}", parameters ++ statement.parameters)
  }

  def parenthesize: StatementPart = copy(sql = s"($sql)")
}

object StatementPart {

  def apply(parameter: NamedParameter): StatementPart = {
    StatementPart(s"{${parameter.name}}", Seq(parameter))
  }

  def fromValue(value: String): StatementPart = {
    // id must start with a letter and contain no dashes
    val id: String = "a" + Guid[String].random.id.replace("-", "")
    StatementPart(s"{$id}", Seq(NamedParameter(id, value)))
  }

  object Implicits {
    implicit def stringToStatementPart(s: String): StatementPart = StatementPart(s)
  }
}