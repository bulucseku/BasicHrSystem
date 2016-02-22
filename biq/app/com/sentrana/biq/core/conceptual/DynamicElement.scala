package com.sentrana.biq.core.conceptual
import com.sentrana.appshell.utils.XmlUtils._

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

class DynamicElement(
    override val id:    String,
    override val value: String,
    val targetElement:  AttributeElement
) extends AttributeElement(id, value) with FilterUnit {

  override def fundamentalElements: Traversable[AttributeElement] = targetElement.fundamentalElements

}

trait DynamicElementSelector {
  def selectElement(orderedElements: Traversable[AttributeElement]): Option[AttributeElement]
}

object DynamicElementSelector {
  def apply(selectorType: String): DynamicElementSelector = {
    selectorType match {
      case "Sentrana.BIQ.Conceptual.MaxElementSelector" =>
        new MaxElementSelector()
      case "Sentrana.BIQ.Conceptual.MinElementSelector" =>
        new MinElementSelector()
      case _ => throw new IllegalArgumentException("Invalid Selector Type")
    }
  }
}

class MaxElementSelector extends DynamicElementSelector {
  override def selectElement(orderedElements: Traversable[AttributeElement]): Option[AttributeElement] = {
    orderedElements.toList.reverse.find(ae => ae.name != "" && ae.name != "NULL")
  }
}

class MinElementSelector extends DynamicElementSelector {
  override def selectElement(orderedElements: Traversable[AttributeElement]): Option[AttributeElement] = {
    orderedElements.toList.find(ae => ae.name != "" && ae.name != "NULL")
  }
}

case class DynamicElementFactory(
    override val id:   String,
    override val name: String,
    elementSelector:   DynamicElementSelector
) extends HierarchicalConceptualObject[Attribute](id, name, None) {

  override def immediateChildren = List()

  def createDynamicElement(parent: AttributeForm, orderedElements: Traversable[AttributeElement]): DynamicElement = {
    new DynamicElement(
      s"${parent.id}:$id",
      name,
      elementSelector.selectElement(orderedElements).orNull
    )
  }
}

object DynamicElementFactory {
  implicit def fromXml(constraintNode: Node): Try[DynamicElementFactory] = {
    for {
      value <- constraintNode.attributeRequired("value")
      selector <- constraintNode.attributeRequired("selector")
    } yield DynamicElementFactory(
      value,
      value,
      DynamicElementSelector(selector)
    )
  }
}