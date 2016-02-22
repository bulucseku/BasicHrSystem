package com.sentrana.biq.core.physical

import scala.xml.Node

import com.sentrana.appshell.data.AttrValueType
import com.sentrana.appshell.data.DataType._
import com.sentrana.biq.core.FromXmlSpec
import com.sentrana.biq.core.conceptual._

/**
 * Created by william.hogben on 1/14/2015.
 */
class SegmentSpec extends FromXmlSpec {
  val attributeForm = new AttributeForm("af_prod_cat_lvl_1_combined", Some("description"), "shortName", true, true, true, Some("default"), Some("formatString"), STRING)
  val attribute = Attribute("id", "name", Some("desc"), None, true, AttrValueType.NA, true, "", None, Nil, List(attributeForm), Nil, Nil)
  val segment = new Segment("1", attributeForm, STRING)
  val table = new Table("database", "table", List(), List(segment), null)
  val xml = {
    <segment databaseId="prod_cat_lvl_1_combined">
      <attributeForm id="af_prod_cat_lvl_1_combined"/>
    </segment>
  }
  attributeForm.addTo(attribute)
  val attributeElement = new AttributeElement("id", "1", Nil, None)
  attributeForm.setAttributeElements(List(attributeElement))
  val segmentValue = new SegmentValue(segment.databaseId, attributeElement)
  segment.setSegmentValues(List(segmentValue))
  val metadata = new Metadata(List(new Dimension("", "", None, attribute)), Nil, Nil, Nil)

  "Test Immediate Children" in {
    segment.immediateChildren.head mustBe segmentValue
  }

  "Test defaultValue" in {
    segment.defaultValue mustBe attributeForm.defaultValue
  }

  "Test findEquivalent with attributeForm" in {
    segment.findEquivalent(attributeForm) mustBe Some(segment)
  }

  "Test findEquivalent with concept in segment values" in {
    segment.findEquivalent(segmentValue.conceptualEquivalent.get) mustBe Some(segmentValue)
  }

  "Test findEquivalent with unknown concept" in {
    segment.findEquivalent(attributeForm.copy(id = "newId")) mustBe None
  }

  "Segment.fromXml" should {

    implicit def fromXml(x: Node) = Segment.fromXml(metadata, x)
    "Parse correctly" in {
      val seg = Segment.fromXml(metadata, xml).get
      seg.databaseId mustBe "prod_cat_lvl_1_combined"
      seg.attributeForm mustBe attributeForm
    }

    "Fail without databaseId" in {
      failWithoutAttr("databaseId", xml)
    }

    "Fail without attributeForm" in {
      failWithoutElem("attributeForm", xml)
    }
  }
}
