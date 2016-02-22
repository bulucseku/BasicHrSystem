package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.AttrValueType
import com.sentrana.biq.core.FromXmlSpec

/**
 * Created by william.hogben on 2/2/2015.
 */
class AttributeSpec extends FromXmlSpec {
  val attrXml = {
    <attribute id="FiscalMonth" name="Fiscal Month" desc="The fiscal month" filterName="Fiscal Month Filter" uidFormId="uIdForm" attrValueType="TimeSeries" filterControl="ListBox">
      <forms>
        <attributeForm id="FiscalMonthId" name="Id" dataType="Number" default="true"/>
      </forms>
      <groupsBy>
        <attribute id="FiscalQuarter" name="Fiscal Quarter" desc="The fiscal quarter" attrValueType="TimeSeries">
          <forms>
            <attributeForm id="FiscalQuarterId" name="Id" dataType="Number" default="true" />
          </forms>
          <groupsBy>
            <attribute id="FiscalYear" name="Fiscal Year" desc="The fiscal year" attrValueType="TimeSeries">
              <forms>
                <attributeForm id="FiscalYear" name="Year" dataType="Number" default="true" />
              </forms>
            </attribute>
          </groupsBy>
        </attribute>
      </groupsBy>
      <dynamicElements>
        <dynamicElement value="CURRENT PERIOD" selector="Sentrana.BIQ.Conceptual.MaxElementSelector" />
      </dynamicElements>
      <surrogateGroupings>
        <elementGrouping id="TTM" name="Trailing Twelve Months" desc="The twelve calendar months prior to and including the specified calendar month" factory="Sentrana.BIQ.Conceptual.TtmElementFactory" keyForm="calendar_year_id_month_name_short" />
      </surrogateGroupings>
    </attribute>
  }

  val attr = Attribute.fromXml(attrXml)
  val attri = attr.success
  val attribute = attri.value

  "Attribute.fromXml" should {

    implicit def fromXml = Attribute.fromXml _

    "Parse correctly with all optional fields" in {
      inside(attribute) {
        case Attribute(id, name, description, filterName, isRequired, attrValueType, hasFilter, filterControl, uidFormId, groups, forms, dynamicElementFactories, surrogateGroupings) =>
          id mustBe "FiscalMonth"
          name mustBe "Fiscal Month"
          description mustBe Some("The fiscal month")
          filterName mustBe Some("Fiscal Month Filter")
          isRequired mustBe false
          attrValueType mustBe AttrValueType.TIMESERIES
          hasFilter mustBe true
          filterControl mustBe "ListBox"
          uidFormId mustBe Some("uIdForm")
          inside(groups) {
            case List(attr) =>
              attr.id mustBe "FiscalQuarter"
          }
          inside(forms) {
            case List(attrForm) =>
              attrForm.id mustBe "FiscalMonthId"
          }
          inside(dynamicElementFactories) {
            case List(defact) => {
              defact.id mustBe "CURRENT PERIOD"
            }
          }
          inside(surrogateGroupings) {
            case List(sg) =>
              sg.id mustBe "TTM"
          }
      }
    }

    "Fail to parse an Attribute without an id" in {
      failWithoutAttr("id", attrXml)
    }

    "Fail to parse an Attribute without a name attribute" in {
      failWithoutAttr("name", attrXml)
    }

    "Fail to parse an Attribute without an attrValueType attribute" in {
      failWithoutAttr("attrValueType", attrXml)
    }

    "Succeed in parsing an Attribute without a description" in {
      succeedWithoutAttr[Attribute]("description", attrXml, (a, b) => b == a.copy(description = Some(a.name)))
    }

    "Succeed in parsing an Attribute without uidFormId" in {
      succeedWithoutAttr[Attribute]("uidFormId", attrXml, (a, b) => b == a.copy(uidFormId = None))
    }

    "Succeed in parsing an Attribute without groups" in {
      succeedWithoutAttr[Attribute]("groupsBy", attrXml, (a, b) => b == a.copy(groups = Nil))
    }
  }

  "Attribute.allChildAttributes" should {
    "Return a list of all child attributes" in {
      inside(attribute.allChildAttributes) {
        case List(attr1, attr2) =>
          attr1.id mustBe "FiscalQuarter"
          attr2.id mustBe "FiscalYear"
      }
    }
  }

  "Attribute.visibleForms" should {
    "Return all forms that are not hidden" in {
      inside(attribute.visibleForms) {
        case List(form) =>
          form.id mustBe "FiscalMonthId"
      }
    }
  }

  "Attribute.addConstraints" should {
    "Add constraints to the constraints list" in {
      attribute.constraints mustBe Traversable()
      val constraint = AttributeElementConstraint("id", List("id"))
      attribute.addConstraints(List(constraint))
      attribute.constraints mustBe List(constraint)
    }
  }
}
