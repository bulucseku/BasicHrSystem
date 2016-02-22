package com.sentrana.biq.core.physical

import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.core.conceptual.Metadata
import com.sentrana.biq.core.physical.StatementPart.Implicits._
import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

/**
 * Created by szhao on 1/12/2015.
 */
case class Table(
    override val databaseId: String,
    id:                      String,
    joins:                   Traversable[Join],
    columns:                 Traversable[Column],
    rootFilter:              Option[Comparison]
) extends HierarchicalDatabaseObject[Table](databaseId) {

  var size: Int = 0

  var parent: Table = null

  def childTables: Traversable[Table] = joins.map(_.child)

  def allChildTables: Traversable[Table] = childTables ++ childTables.flatMap(_.allChildTables)

  override def conceptualEquivalent = None

  override def immediateChildren: Traversable[DatabaseObject] = columns ++ childTables

  override def queryAlias: String = id

  def rootFilterStatement: Option[StatementPart] = {
    rootFilter.map { _.toStatement(queryAlias, queryAlias) }
  }
}

object Table {
  def fromXml(metadata: Metadata)(attrNode: Node): Try[Table] = {
    for {
      databaseId <- attrNode.attributeRequired("databaseId")
      id <- attrNode.attributeRequired("id")
      joins <- parseSeq[Join](attrNode \ "joins" \ "join")(Join.fromXml(metadata))
      columns <- parseSeq[Column](attrNode \ "columns" \ "_")(Column.fromXml(metadata))
      rootFilter <- parseSeq[Comparison](attrNode \ "rootFilter" \ "comparison")
    } yield {
      val table = Table(
        id         = id,
        databaseId = databaseId,
        joins      = joins,
        columns    = columns,
        rootFilter = rootFilter.headOption
      )
      table.childTables.foreach(_.addTo(table))
      table.columns.foreach(_.addTo(table))
      table
    }
  }
}
