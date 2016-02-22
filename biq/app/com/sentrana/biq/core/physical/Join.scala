package com.sentrana.biq.core.physical

import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.core.conceptual.Metadata

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

/**
 * Created by szhao on 1/12/2015.
 */
case class Join(
    child:        Table,
    joinOperator: String,
    comparisons:  Traversable[Comparison]
) {

  def joinStatment: String = {
    val predicateStatment = comparisons map (
      _.queryAlias(child.parent.queryAlias, child.queryAlias)
    ) mkString " AND "
    s"${parseJoinOperator(joinOperator)} ${child.databaseId} AS ${child.queryAlias} ON $predicateStatment"
  }

  private def parseJoinOperator(operator: String) = {
    operator match {
      case "Inner"     => "INNER JOIN"
      case "Left"      => "LEFT OUTER JOIN"
      case "FullOuter" => "FULL OUTER JOIN"
      case "Cross"     => "CROSS JOIN"
      case _           => throw new IllegalArgumentException("Operator is Invalid")
    }
  }
}

object Join {
  def fromXml(metadata: Metadata)(attrNode: Node): Try[Join] = {
    for {
      childNode <- Try((attrNode \ "table").head)
      child <- Table.fromXml(metadata)(childNode)
      comparisons <- parseSeq[Comparison](attrNode \ "condition" \ "comparison")
      operator <- attrNode.attributeRequired("operator")
    } yield Join(
      child        = child,
      joinOperator = operator,
      comparisons  = comparisons
    )
  }
}

