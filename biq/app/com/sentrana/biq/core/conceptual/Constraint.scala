package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.core.Report

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

trait Constrainable {
  def id: String
  def constraints: Traversable[Constraint]
  def addConstraints(constraints: Traversable[Constraint])
}

trait Constraint {
  def isSatisfied(report: Report): Boolean
}

case class AttributeElementConstraint(
    attributeFormId:        String,
    attributeElementValues: Traversable[String]
) extends Constraint {

  def isSatisfied(report: Report) = {
    val repo = report.repository.getOrElse(
      throw new Exception("Repository is not defined")
    )
    val form = repo.metaData.getAttributeForm(attributeFormId).get
    val elements = attributeElementValues
      .map(value => form.allElements.find(_.name == value))
      .filter(_.isDefined).map(_.get)
    if (elements.size == 0)
      false
    else {
      val domains = elements.map(e => e.parent.parent).toList.distinct
      require(
        domains.size == 1,
        "Domain elements must all belong to a single Attribute."
      )
      val filterElements = report.filters
        .flatMap(f => f.fundamentalElements)
        .filter(e => e.parent.parent == domains.head)
      // Check that all the filter elements match at least one of the allowable domain elements.
      filterElements.toList.diff(elements.toList).isEmpty
    }
  }
}

object Constraint {
  implicit def fromXml(constraintNode: Node): Try[Constraint] = {
    for {
      attributeFormId <- constraintNode.attributeRequired("id")
      attributeElementValues <- parseSeq(constraintNode \ "attributeElement")(_.attributeRequired("value"))
    } yield AttributeElementConstraint(
      attributeFormId,
      attributeElementValues
    )
  }
}
