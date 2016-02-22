package com.sentrana.biq.core.physical

import com.sentrana.biq.core.conceptual.ConceptualObject

trait Source {
  def conceptualObjects: Traversable[ConceptualObject]

  def contains(concept: ConceptualObject): Boolean
}