package com.sentrana.biq.core.physical

import com.sentrana.appshell.data.DataType
import com.sentrana.biq.core.conceptual._

/**
 * Created by szhao on 1/12/2015.
 */
class BandedSegment(databaseId: String, val attributeForm: AttributeForm) extends Column(databaseId) {

  var segmentValues = Map[ConceptualObject, BandedSegmentInterval]()

  val dataType = DataType.STRING

  def defaultValue: Option[String] = attributeForm.defaultValue

  def queryAliasNoDefault: String = super.queryAlias

  override def queryAlias: String = {
    if (defaultValue == None)
      queryAliasNoDefault
    else
      "COALESCE(" + super.queryAlias + ", " + formatLiteral(defaultValue) + ")"
  }

  override def conceptualEquivalent: Option[ConceptualObject] = Some(attributeForm)

  override def immediateChildren: Traversable[DatabaseObject] = segmentValues.values

  def setSegmentValues(segmentValues: Traversable[BandedSegmentInterval]): Unit = {
    this.segmentValues = segmentValues.map(
      value => (value.conceptualEquivalent.get, value)
    ).toMap[ConceptualObject, BandedSegmentInterval]
    segmentValues.map(_.addTo(this))
  }

  override def findEquivalent(concept: ConceptualObject): Option[DatabaseObject] = {
    if (concept == attributeForm) Some(this) else Option(segmentValues.getOrElse(concept, null))
  }

}
