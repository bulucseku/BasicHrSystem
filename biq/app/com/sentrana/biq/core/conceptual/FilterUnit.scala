package com.sentrana.biq.core.conceptual

trait FilterUnit extends ConceptualObject {
  def fundamentalElements: Traversable[AttributeElement]
  def filterGroup: ConceptualObjectWithChildren
}