package com.sentrana.biq.core.physical

import com.sentrana.appshell.data.DataType
import com.sentrana.biq.core.conceptual.{ ConceptualObject, Metadata }

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

/**
 * Created by szhao on 1/12/2015.
 */
abstract class Column(databaseId: String) extends HierarchicalDatabaseObject[Table](databaseId) {

  override def queryAlias: String = parent.queryAlias + "." + databaseId

  var parent: Table = null

  override def conceptualEquivalent: Option[ConceptualObject]

  def dataType: DataType.Value

  def parent(dataWarehouse: SqlDataWarehouse): Table = {
    dataWarehouse.allTables.find(_.queryAlias == parent.queryAlias).getOrElse(
      throw new Exception("Parent Table not found")
    )
  }

  def formatLiteral(rawValue: Option[String]): String = {
    if (rawValue.isEmpty)
      "NULL"
    else {
      val quoted = rawValue.get.map(s => if (s == '\'') "''" else s).mkString("")
      if (dataType == DataType.STRING) "'" + quoted + "'" else quoted
    }
  }
}

object Column {
  def fromXml(metadata: Metadata)(columnNode: Node): Try[Column] = {
    columnNode.label match {
      case "datum"   => Datum.fromXml(metadata, columnNode)
      case "segment" => Segment.fromXml(metadata, columnNode)
      case _         => throw new IllegalArgumentException(s"Column node has invalid Type: ${columnNode.label}")
    }
  }
}

