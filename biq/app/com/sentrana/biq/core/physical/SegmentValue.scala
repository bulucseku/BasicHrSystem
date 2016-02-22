package com.sentrana.biq.core.physical

import com.sentrana.biq.core.conceptual._

/**
 * Created by szhao on 1/12/2015.
 */
class SegmentValue(
    databaseId:           String,
    val attributeElement: AttributeElement
) extends HierarchicalDatabaseObject[Segment](databaseId) {

  val value: String = databaseId

  var parent: Segment = _

  override def queryAlias: String = parent.formatLiteral(Some(value))

  override def conceptualEquivalent = Some(attributeElement)

  override def immediateChildren: Traversable[DatabaseObject] = List[DatabaseObject]()
}
