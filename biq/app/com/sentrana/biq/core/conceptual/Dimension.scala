package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.XmlUtils._

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

case class Dimension(
    override val id:          String,
    override val name:        String,
    override val description: Option[String],
    primaryAttribute:         Attribute
) extends ConceptualObjectWithChildren(id, name, description) {

  def allAttributes: List[Attribute] = {
    primaryAttribute :: primaryAttribute.allChildAttributes.toList
  }

  override def immediateChildren: List[ConceptualObjectWithChildren] = {
    List(primaryAttribute)
  }
}

object Dimension {
  implicit def fromXml(dimNode: Node): Try[Dimension] = {
    for {
      name <- dimNode.attributeRequired("name")
      attr <- parseSeq[Attribute](dimNode \ "attribute")
    } yield Dimension(
      id               = name,
      name             = name,
      description      = Some(name),
      primaryAttribute = attr.head
    )
  }
}