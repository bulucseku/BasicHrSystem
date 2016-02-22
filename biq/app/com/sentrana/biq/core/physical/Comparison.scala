package com.sentrana.biq.core.physical

import com.sentrana.appshell.utils.XmlUtils._

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

/**
 * Created by william.hogben on 1/23/2015.
 */
case class Comparison(
    operator:   String,
    leftValue:  ComparisonValue,
    rightValue: ComparisonValue
) {

  def queryAlias(leftTableReference: String, rightTableReference: String): String = {
    val op = getOperator
    val left = leftValue.format(leftTableReference)
    val right = rightValue.format(rightTableReference)

    s"$left $op $right"
  }

  def toStatement(leftTableReference: String, rightTableReference: String): StatementPart = {
    val op = getOperator
    val left = leftValue.formatStatement(leftTableReference)
    val right = rightValue.formatStatement(rightTableReference)

    left +/ s" $op " +/ right
  }

  def getOperator: String = {
    operator match {
      case "Equals"              => "="
      case "NotEqual"            => "<>"
      case "GreaterThan"         => ">"
      case "GreaterThanOrEquals" => ">="
      case "LessThan"            => "<"
      case "LessThanOrEquals"    => "<="
      case "Contains"            => "in"
      case "NotContain"          => "not in"
      case _                     => throw new IllegalArgumentException("Unrecognized Operator type.")
    }
  }
}

object Comparison {
  implicit def fromXml(compNode: Node): Try[Comparison] = {
    for {
      operator <- compNode.attributeRequired("operator")
    } yield Comparison(
      operator,
      parseComparisonValue((compNode \ "_")(0)),
      parseComparisonValue((compNode \ "_")(1))
    )
  }

  def parseComparisonValue(compValueNode: Node): ComparisonValue = {
    compValueNode.label match {
      case "column"  => ComparisonColumn((compValueNode \ "@databaseId").text)
      case "literal" => ComparisonLiteral((compValueNode \ "@value").text)
      case _         => throw new IllegalArgumentException(s"Node does not contain a valid value type: ${compValueNode.label}")
    }
  }
}

abstract class ComparisonValue(val value: String) {
  def format(tableReference: String): String
  def formatStatement(tableReference: String): StatementPart
}

case class ComparisonColumn(override val value: String) extends ComparisonValue(value) {
  override def format(tableReference: String): String = s"$tableReference.$value"

  override def formatStatement(tableReference: String) = StatementPart(format(tableReference))
}

case class ComparisonLiteral(override val value: String) extends ComparisonValue(value) {
  override def format(tableReference: String): String = s"$value"

  override def formatStatement(tableReference: String) = {
    val literal = format(tableReference)
    // split literals for prepared statements
    val csvs = literal.stripPrefix("(").stripSuffix(")").split(",")
    val statements = csvs.map(v => StatementPart.fromValue(v.trim().stripPrefix("'").stripSuffix("'")))
    statements.reduce(_ comma _).parenthesize
  }
}

