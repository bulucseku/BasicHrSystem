package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.AttrValueType
import com.sentrana.appshell.data.AttrValueType.AttrValueType
import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.XmlUtils._

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

case class Attribute(
    override val id:          String,
    override val name:        String,
    override val description: Option[String],
    filterName:               Option[String],
    isRequired:               Boolean,
    attrValueType:            AttrValueType,
    hasFilter:                Boolean,
    filterControl:            String,
    uidFormId:                Option[String],
    groups:                   Traversable[Attribute],
    forms:                    Traversable[AttributeForm],
    dynamicElementFactories:  Traversable[DynamicElementFactory],
    surrogateGroupings:       Traversable[CompositeAttribute]
) extends HierarchicalConceptualObject[Attribute](id, name, description) with Constrainable {

  def allChildAttributes: Traversable[Attribute] = {
    groups ++ groups.flatMap(g => g.allChildAttributes)
  }

  def visibleForms = forms.filter(!_.isHidden)

  def defaultForms = forms.filter(_.isDefaultForm)

  def canonicalSortForm = forms.find(_.isCanonicalSort)

  var constraints: Traversable[Constraint] = Traversable[Constraint]()

  def uidForm = forms.filter(form => if (uidFormId == None) true else Some(form.id) == uidFormId)

  def immediateChildren: Traversable[ConceptualObjectWithChildren] = {
    groups ++ forms ++ surrogateGroupings
  }

  def addConstraints(c: Traversable[Constraint]) = {
    constraints = constraints ++ c
  }
}

object Attribute {
  implicit def fromXml(attrNode: Node): Try[Attribute] = {
    for {
      id <- attrNode.attributeRequired("id")
      name <- attrNode.attributeRequired("name")
      description = (attrNode \ "@desc").textOrNone
      filterName = (attrNode \ "@filterName").textOrNone
      isRequired <- (attrNode \ "@required").boolOrNone
      attrValueType <- attrNode.attributeRequired("attrValueType")
      uidFormId = (attrNode \ "@uidFormId").textOrNone
      groups <- parseSeq[Attribute](attrNode \ "groupsBy" \ "attribute")
      forms <- parseSeq[AttributeForm](attrNode \ "forms" \ "attributeForm")
      dynamicElementFactories <- parseSeq[DynamicElementFactory](attrNode \ "dynamicElements" \ "dynamicElement")
      surrogateGroupings <- parseSeq[CompositeAttribute](attrNode \ "surrogateGroupings" \ "elementGrouping")
      filterControl = (attrNode \ "@filterControl").textOrNone
    } yield {
      val attribute = Attribute(
        id            = id,
        name          = name,
        description   = Some(description.getOrElse(name)),
        filterName    = Some(filterName.getOrElse(name)),
        isRequired    = isRequired.getOrElse(false),
        attrValueType = AttrValueType.forName(attrValueType.toUpperCase),
        hasFilter     = filterControl.map(_ != "None").getOrElse(true),
        filterControl = filterControl.getOrElse("Button"),
        uidFormId     = uidFormId,
        groups,
        forms,
        dynamicElementFactories,
        surrogateGroupings
      )
      groups.foreach(_.addTo(attribute))
      forms.foreach(_.addTo(attribute))
      surrogateGroupings.foreach(_.addTo(attribute))
      attribute
    }
  }
}