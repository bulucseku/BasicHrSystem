package com.sentrana.biq.core.conceptual

trait ConceptualObject {
  def id: String
  def name: String
  def description: Option[String]
}

abstract class ConceptualObjectWithChildren(
    val id:            String,
    private val _name: String,
    val description:   Option[String]
) extends ConceptualObject {

  def name = _name

  def immediateChildren: Traversable[ConceptualObjectWithChildren]

  def allChildren: Traversable[ConceptualObjectWithChildren] = {
    immediateChildren ++ immediateChildren.flatMap(child => child.allChildren)
  }

  override def toString: String = {
    s"$name [$id]"
  }
}

abstract class HierarchicalConceptualObject[TParent <: ConceptualObjectWithChildren](
    id:          String,
    name:        String,
    description: Option[String]
) extends ConceptualObjectWithChildren(id, name, description) {
  var parent: TParent = _
  def addTo(parent: TParent) {
    this.parent = parent
  }
}