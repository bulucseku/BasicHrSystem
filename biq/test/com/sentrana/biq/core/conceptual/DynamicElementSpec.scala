package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.DataType._
import com.sentrana.biq.core.FromXmlSpec

/**
 * Created by william.hogben on 2/2/2015.
 */
class DynamicElementSpec extends FromXmlSpec {
  val attributeForm = new AttributeForm("id", Some("description"), "shortName", true, true, true, Some("default"), Some("formatString"), STRING)
  val dynamicXml = {
    <dynamicElement value="CURRENT PERIOD" selector="Sentrana.BIQ.Conceptual.MaxElementSelector" />
  }

  val dynamicElement = DynamicElementFactory.fromXml(dynamicXml).success.value

  "DynamicElementFactory.fromXml" should {

    implicit def fromXml = DynamicElementFactory.fromXml _
    "Successfully parse a node with all optional fields" in {
      dynamicElement.id mustBe "CURRENT PERIOD"
      dynamicElement.name mustBe "CURRENT PERIOD"
      dynamicElement.elementSelector mustBe a[MaxElementSelector]
    }

    "Fail to parse a node without a value attribute" in {
      failWithoutAttr("value", dynamicXml)
    }

    "Fail to parse a node without a selector attribute" in {
      failWithoutAttr("selector", dynamicXml)
    }
  }

  "DynamicElementFactory.createDynamicElement" should {
    "Create a dynamic element" in {
      val dynElement = dynamicElement.createDynamicElement(attributeForm, Nil)
      dynElement.id mustBe s"${attributeForm.id}:${dynamicElement.id}"
      dynElement.name mustBe dynamicElement.name
    }
  }

  "MaxElementSelector.selectElement" should {
    val ae = new AttributeElement("id1", "name1")
    val ordered = List(ae, ae.copy(value = "bacon"), ae.copy(value = "NULL"))

    "return the last not null element in the ordered list" in {
      val selector = new MaxElementSelector
      selector.selectElement(ordered).get.name mustBe "bacon"
    }
  }
}
