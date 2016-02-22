package com.sentrana.biq.core.conceptual

import com.sentrana.biq.core.FromXmlSpec

/**
 * Created by william.hogben on 2/6/2015.
 */
class CompositeAttributeSpec extends FromXmlSpec {
  val compNode = {
    <elementGrouping id="TTM" name="Trailing Twelve Months" desc="The twelve calendar months" filterName="Trailing Twelve Months Filter" factory="Sentrana.BIQ.Conceptual.TtmElementFactory" keyForm="calendar_year_id_month_name_short" />
  }

  "CompositeAttribute.fromXml" should {

    implicit def fromXml = CompositeAttribute.fromXml _
    "Parse valid xml node successfully" in {
      val compAttr = CompositeAttribute.fromXml(compNode).success.value
      inside(compAttr) {
        case CompositeAttribute(id, name, description, filterName, compAttrElements, groupFactory, keyForm) =>
          id mustBe "TTM"
          name mustBe "Trailing Twelve Months"
          description mustBe Some("The twelve calendar months")
          filterName mustBe Some("Trailing Twelve Months Filter")
          groupFactory mustBe a[Some[TtmElementFactory]]
          compAttrElements mustBe Nil
          keyForm mustBe Some("calendar_year_id_month_name_short")
      }
    }

    "Fail to parse a node without an id attribute" in {
      failWithoutAttr("id", compNode)
    }

    "Fail to parse a node without a name attribute" in {
      failWithoutAttr("name", compNode)
    }

    "Fail to parse a node without a keyForm attribute" in {
      failWithoutAttr("keyForm", compNode)
    }
  }
}
