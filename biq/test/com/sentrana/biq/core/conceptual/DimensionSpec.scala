package com.sentrana.biq.core.conceptual

import com.sentrana.biq.core.FromXmlSpec

/**
 * Created by william.hogben on 2/2/2015.
 */
class DimensionSpec extends FromXmlSpec {
  val dimXml = {
    <dimension name="Product">
      <attribute id="attrId" name="attribute" desc="" attrValueType="DiscreteSeries" filterControl="None">
        <forms>
          <attributeForm id="afId" name="Name" dataType="String" hidden="false" default="true" canonicalSort="true"/>
        </forms>
      </attribute>
    </dimension>
  }

  val dim = Dimension.fromXml(dimXml).success.value

  "Dimension.fromXml" should {

    implicit def fromXml = Dimension.fromXml _

    "Parse a dimension with all fields correctly" in {
      inside (dim) {
        case Dimension(id, name, desc, primaryAttribute) =>
          id mustBe "Product"
          name mustBe "Product"
          desc mustBe Some("Product")
          primaryAttribute.id mustBe "attrId"
      }
    }

    "Fail to parse a dimension without a name" in {
      failWithoutAttr("name", dimXml)
    }
  }

  "Dimension.immediateChildren" should {
    "Return a list containing the primaryAttribute" in {
      dim.immediateChildren mustBe List(dim.primaryAttribute)
    }
  }

  "Dimension.allAttributes" should {
    "Return a list containing the primaryAttribute and its children" in {
      dim.immediateChildren mustBe List(dim.primaryAttribute) ++
        dim.primaryAttribute.allChildAttributes
    }
  }
}
