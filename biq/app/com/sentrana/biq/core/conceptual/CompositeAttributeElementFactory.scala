package com.sentrana.biq.core.conceptual

trait CompositeAttributeElementFactory {

  def generateGroups(attribute: Attribute, parentId: String, keyForm: String): Traversable[CompositeAttributeElement]
}

class TtmElementFactory extends CompositeAttributeElementFactory {

  def generateGroups(attribute: Attribute, parentId: String, keyForm: String): Traversable[CompositeAttributeElement] = {
    val fiscalFormMonth = attribute.forms.find(_.id == keyForm).getOrElse(
      throw new IllegalArgumentException("Key attribute form not found with id: " + keyForm)
    )
    val elements = fiscalFormMonth.allElements.filter(!_.isInstanceOf[DynamicElement])
      .filter(el => el.name != "NULL" && el.name != "")

    val renderedElements: Map[AttributeElement, CompositeAttributeElement] =
      (for (i <- 11 to elements.size - 1) yield {
        val top = elements.toList(i)
        (
          top,
          CompositeAttributeElement(
            s"$parentId:TTM ${top.name}",
            s"TTM ${top.name}",
            elements.slice(i - 11, i + 1)
          )
        )
      }).toMap
    val dynElements = for (
      dynElement <- fiscalFormMonth.allElements.filter(_.isInstanceOf[DynamicElement]).map(_.asInstanceOf[DynamicElement])
    ) yield {
      CompositeAttributeElement(
        s"$parentId:TTM ${dynElement.name}",
        s"TTM ${dynElement.name}",
        renderedElements(dynElement.targetElement).sourceElements
      )
    }

    renderedElements.values ++ dynElements
  }
}