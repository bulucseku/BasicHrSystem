package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.{ AttrValueType, DataType }
import com.sentrana.biq.core.FromXmlSpec

/**
 * Created by william.hogben on 3/11/2015.
 */
class AttributeFormSpec extends FromXmlSpec {
  val afXml = <attributeForm id="af_cal_qtr_name" name="Cal Qtr Name" dataType="String" hidden="false" default="true" canonicalSort="true" />

  "AttributeForm.fromXml" should {
    "Correctly parse a valid attribute form element" in {
      val form = AttributeForm.fromXML(afXml).success.value
      form.id mustBe "af_cal_qtr_name"
      form.shortName mustBe "Cal Qtr Name"
      form.description mustBe None
      form.isDefaultForm mustBe true
      form.isHidden mustBe false
      form.isCanonicalSort mustBe true
      form.defaultValue mustBe None
      form.formatString mustBe None
      form.dataType mustBe DataType.STRING
    }
  }

  val form = AttributeForm.fromXML(afXml).get

  "AttributeForm.name" should {
    "Return the name of the parent attribute and the shortName if the parent has no forms" in {
      form.parent = Attribute(
        "id", "parentName", None, None, false, AttrValueType.CONTINUOUS_VALUES, false, "Button", None, Nil, Nil, Nil, Nil
      )
      form.name mustBe "parentName (Cal Qtr Name)"
    }

    "Return the name of the parent attribute if the parent attribute has only one form" in {
      form.parent = Attribute(
        "id", "parentName", None, None, false, AttrValueType.CONTINUOUS_VALUES, false, "Button", None, Nil, List(form), Nil, Nil
      )
      form.name mustBe "parentName"
    }
  }
}
