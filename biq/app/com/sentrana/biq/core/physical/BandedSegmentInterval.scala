package com.sentrana.biq.core.physical

import com.sentrana.biq.core.conceptual._

/**
 * Created by szhao on 1/12/2015.
 */
class BandedSegmentInterval(
    val lowerBound:       String,
    val upperBound:       String,
    val attributeElement: AttributeElement
) extends HierarchicalDatabaseObject[BandedSegment](upperBound) {

  def isLowerInclusive: Boolean = !isUpperInclusive

  var isUpperInclusive: Boolean = false

  var parent: BandedSegment = null

  def formattedLowerBound: String = parent.formatLiteral(Some(lowerBound))

  def formattedUpperBound: String = parent.formatLiteral(Some(upperBound))

  def queryAlias: String = formattedUpperBound

  override def conceptualEquivalent: Some[ConceptualObject] = Some(attributeElement)

  override def immediateChildren: Traversable[DatabaseObject] = List()
}
