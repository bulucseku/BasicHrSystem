package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.utils.XmlUtils._

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

case class Fact(
    override val id:          String,
    override val name:        String,
    override val description: Option[String]
) extends ConceptualObjectWithChildren(id, name, description) with Constrainable {

  def immediateChildren: Traversable[ConceptualObjectWithChildren] = {
    Nil
  }

  var constraints: Traversable[Constraint] = Nil

  def addConstraints(c: Traversable[Constraint]) {
    constraints = constraints ++ c
  }
}

object Fact {
  implicit def fromXml(factNode: Node): Try[Fact] = {
    for {
      id <- factNode.attributeRequired("id")
      name <- factNode.attributeRequired("name")
    } yield Fact(
      id,
      name,
      Some((factNode \ "@desc").textOrNone.getOrElse(name))
    )
  }
}