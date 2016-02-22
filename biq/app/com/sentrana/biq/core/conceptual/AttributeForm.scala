package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.AttrValueType.AttrValueType
import com.sentrana.appshell.data.DataType
import com.sentrana.appshell.data.DataType.DataType
import com.sentrana.appshell.utils.XmlUtils._

import scala.collection.mutable
import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

case class AttributeForm(
    override val id:          String,
    override val description: Option[String],
    shortName:                String,
    isDefaultForm:            Boolean,
    isHidden:                 Boolean,
    isCanonicalSort:          Boolean,
    defaultValue:             Option[String],
    formatString:             Option[String],
    dataType:                 DataType,
    storeInCache:             Boolean        = true
) extends HierarchicalConceptualObject[Attribute](id, shortName, description) with ReportUnit {

  val isSegment: Boolean = true

  // Is in tree or is the child of a tree form
  def isTreeAncestorForm: Boolean = parent.filterControl == "Tree"

  def isInTree: Boolean = isTreeAncestorForm || parentForm.nonEmpty

  def childForm: Option[AttributeForm] = {
    if (isInTree)
      Option(parent.parent).map(_.forms.find(_.shortName == shortName)).getOrElse(None)
    else
      None
  }

  def parentForm: Option[AttributeForm] = {
    parent.groups.map {
      attribute => attribute.forms.find(form => form.shortName == shortName && form.isInTree)
    }.find(_.nonEmpty).getOrElse(None)
  }

  def ancestorForm: Option[AttributeForm] = {
    if (!isInTree)
      None
    else if (isTreeAncestorForm)
      Some(this)
    else
      parentForm.get.ancestorForm
  }

  override def name: String = {
    if (parent.forms.size == 1)
      parent.name
    else
      s"${parent.name} ($shortName)"
  }

  def attrValueType: AttrValueType = parent.attrValueType

  @volatile var allElements: Traversable[AttributeElement] = List()

  val elementsById: mutable.Map[String, AttributeElement] = mutable.Map()

  def immediateChildren: Traversable[AttributeElement] = {
    allElements
  }

  override def canonicalSortConcept: ConceptualObjectWithChildren = {
    if (isCanonicalSort) this
    else {
      parent.canonicalSortForm.getOrElse(this)
    }
  }

  def fundamentalConceptualObjects: Traversable[ConceptualObjectWithChildren] = {
    List(this, canonicalSortConcept).distinct
  }

  def setAttributeElements(elements: Traversable[AttributeElement]) = {
    try {
      val dynamicElements = if (elements.size > 0)
        parent.dynamicElementFactories
          .map(factory => factory.createDynamicElement(this, elements))
      else
        List()

      allElements = elements ++ dynamicElements
      allElements.foreach(_.addTo(this))
      elementsById.clear()
      elementsById ++= allElements.map(el => el.id -> el)
    }
    catch {
      case e: IllegalArgumentException => throw new Exception(
        s"For attribute form $name, you don't have correct unique ID value set " +
          s"up. Inner exception message: ${e.getMessage}"
      )
    }
  }

  def accept[T](visitor: ReportUnitVisitor[T]): T = {
    visitor.visit(this)
  }

  override def constraints: Traversable[Constraint] = parent.constraints
}

object AttributeForm {
  implicit def fromXML(attrFormNode: Node): Try[AttributeForm] = {
    for {
      id <- attrFormNode.attributeRequired("id")
      isDefaultForm <- (attrFormNode \ "@default").boolOrNone
      isHidden <- (attrFormNode \ "@hidden").boolOrNone
      isCanonicalSort <- (attrFormNode \ "@canonicalSort").boolOrNone
      storeInCache <- (attrFormNode \ "@cache").boolOrNone
    } yield AttributeForm(
      id              = id,
      description     = (attrFormNode \ "@desc").textOrNone,
      shortName       = (attrFormNode \ "@name").text,
      isDefaultForm   = isDefaultForm.getOrElse(false),
      isHidden        = isHidden.getOrElse(false),
      isCanonicalSort = isCanonicalSort.getOrElse(false),
      defaultValue    = (attrFormNode \ "@defaultValue").textOrNone,
      formatString    = (attrFormNode \ "@formatString").textOrNone,
      dataType        = DataType.forName((attrFormNode \ "@dataType").textOrNone.getOrElse("STRING").toUpperCase),
      storeInCache    = storeInCache.getOrElse(true)
    )
  }
}