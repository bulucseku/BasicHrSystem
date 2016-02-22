package com.sentrana.biq.core.physical

import com.sentrana.biq.core.conceptual._

/**
 * Created by szhao on 1/12/2015.
 */
case class DataFilter(
    override val databaseId:       String,
    operator:                      String,
    override val value:            String,
    override val attributeElement: AttributeElement,
    attributeForm:                 AttributeForm
) extends SegmentValue(databaseId, attributeElement) with FilterUnit {

  override def fundamentalElements: Traversable[AttributeElement] = List(attributeElement)

  override val id: String = attributeElement.id

  override val name: String = attributeElement.name

  override val description: Option[String] = attributeElement.description

  var filterGroup: ConceptualObjectWithChildren = null
}
