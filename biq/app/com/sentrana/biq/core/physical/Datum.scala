package com.sentrana.biq.core.physical

import com.sentrana.appshell.data.DataType
import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.core.conceptual.{ ConceptualObject, Fact, Metadata }

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

/**
 * Created by szhao on 1/12/2015.
 */
case class Datum(
    override val databaseId: String,
    fact:                    Fact,
    override val dataType:   DataType.Value
) extends Column(databaseId) {

  override def conceptualEquivalent: Option[ConceptualObject] = Some(fact)

  override def immediateChildren: Traversable[DatabaseObject] = List[DatabaseObject]()
}

object Datum {
  def fromXml(metadata: Metadata, attrNode: Node): Try[Datum] = {
    for {
      databaseId <- attrNode.attributeRequired("databaseId")
      fact <- (attrNode \ "fact").attributeRequired("id")
    } yield Datum(
      databaseId,
      metadata.facts.find(_.id == fact).orNull,
      DataType.NUMBER
    )
  }
}
