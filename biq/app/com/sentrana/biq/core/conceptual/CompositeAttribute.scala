package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.utils.XmlUtils._

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

case class CompositeAttribute(
    override val id:                String,
    override val name:              String,
    override val description:       Option[String],
    filterName:                     Option[String],
    var compositeAttributeElements: Traversable[CompositeAttributeElement],
    groupFactory:                   Option[CompositeAttributeElementFactory],
    keyForm:                        Option[String]
) extends HierarchicalConceptualObject[Attribute](id, name, description) {

  def generateGroups(): Unit = {
    if (groupFactory.isDefined)
      setCompositeAttributeElements(groupFactory.get.generateGroups(parent, id, keyForm.orNull))
  }

  def compositeAttributeElementsById: Map[String, CompositeAttributeElement] =
    compositeAttributeElements.map(cae => (cae.id, cae)).toMap

  private def setCompositeAttributeElements(compositeAttributeElements: Traversable[CompositeAttributeElement]) = {
    this.compositeAttributeElements = compositeAttributeElements.toSeq.sortBy(_.name)
    compositeAttributeElements.foreach(_.addTo(this))
  }

  override def immediateChildren = compositeAttributeElements

  def this(
    id:           String,
    name:         String,
    description:  Option[String],
    filterName:   Option[String],
    groupFactory: CompositeAttributeElementFactory,
    keyForm:      String
  ) = this(id, name, description, filterName, Nil, Some(groupFactory), Some(keyForm))

}

object CompositeAttribute {

  def apply(
    id:                         String,
    name:                       String,
    description:                Option[String],
    filerName:                  Option[String],
    compositeAttributeElements: Traversable[CompositeAttributeElement]
  ): CompositeAttribute = {
    val attribute = CompositeAttribute(id, name, description, filerName, compositeAttributeElements, None, None)
    compositeAttributeElements.foreach(_.addTo(attribute))
    attribute
  }

  implicit def fromXml(compAttrNode: Node): Try[CompositeAttribute] = {
    for {
      keyForm <- compAttrNode.attributeRequired("keyForm")
      id <- compAttrNode.attributeRequired("id")
      name <- compAttrNode.attributeRequired("name")
    } yield new CompositeAttribute(
      id,
      name,
      (compAttrNode \ "@desc").textOrNone,
      Some((compAttrNode \ "@filterName").textOrNone.getOrElse(name)),
      new TtmElementFactory,
      keyForm
    )
  }
}

case class CompositeAttributeElement(
    override val id:   String,
    override val name: String,
    attributeElements: Traversable[AttributeElement]
) extends HierarchicalConceptualObject[CompositeAttribute](id, name, None) with FilterUnit {
  override def immediateChildren = List()

  val sourceElements = attributeElements

  var filterGroupObject: Option[ConceptualObjectWithChildren] = None

  override def filterGroup: ConceptualObjectWithChildren = filterGroupObject.getOrElse(parent)

  override def fundamentalElements: Traversable[AttributeElement] = sourceElements.flatMap(_.fundamentalElements)
}