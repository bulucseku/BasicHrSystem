package com.sentrana.biq.core.conceptual

import com.sentrana.biq.core.FromXmlSpec

/**
 * Created by william.hogben on 2/2/2015.
 */
class FactSpec extends FromXmlSpec {
  val factXml = {
    <fact id="fact_sales" name="Current Sales" desc="desc"/>
  }
  val fact = Fact.fromXml(factXml).success.value

  "Fact.fromXml" should {
    implicit def fromXml = Fact.fromXml _
    "Parse correctly with all optional fields" in {
      inside(fact) {
        case Fact(id, name, desc) =>
          id mustBe "fact_sales"
          name mustBe "Current Sales"
          desc mustBe Some("desc")
      }
    }

    "Parse successfully without description attribute." in {
      succeedWithoutAttr[Fact]("desc", factXml, (a, b) => b == a.copy(description = Some(a.name)))
    }

    "Fail to parse a fact without a name." in {
      failWithoutAttr("name", factXml)
    }

    "Fail to parse a fact without an id." in {
      failWithoutAttr("id", factXml)
    }
  }

  "Fact.addConstraints" should {
    "Add constraints to the constraints list" in {
      fact.constraints mustBe Traversable()
      val constraint = AttributeElementConstraint("id", List("id"))
      fact.addConstraints(List(constraint))
      fact.constraints mustBe List(constraint)
    }
  }
}
