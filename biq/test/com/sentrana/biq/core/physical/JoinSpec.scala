package com.sentrana.biq.core.physical

import com.sentrana.biq.core.FromXmlSpec
import com.sentrana.biq.core.conceptual.Metadata

/**
 * Created by william.hogben on 1/14/2015.
 */
class JoinSpec extends FromXmlSpec {

  var join: Join = null
  val metadata: Metadata = new Metadata(Nil, Nil, Nil, Nil)
  val xml = {
    <join operator="Left">
      <condition>
        <comparison operator="Equals">
          <column databaseId="cust_key" />
          <column databaseId="cust_key" />
        </comparison>
      </condition>
      <table databaseId="dbId" id="joinTable"></table>
    </join>
  }

  "Join.fromXml" should {
    implicit def fromXml = Join.fromXml(metadata) _

    "Parse XML Correctly" in {
      join = Join.fromXml(metadata)(xml).get
      join.joinOperator mustBe "Left"
      join.comparisons mustBe List(
        new Comparison(
          "Equals",
          new ComparisonColumn("cust_key"),
          new ComparisonColumn("cust_key")
        )
      )
    }

    "Succeed if Comparison is missing" in {
      succeedWithoutElem[Join]("condition", xml, (a, b) => b == a.copy(comparisons = List()))
    }

    "Fail if operator is missing" in {
      failWithoutAttr("operator", xml)
    }

    "Fail without table" in {
      failWithoutElem[Join]("table", xml)
    }
  }

  "Join.joinStatment" should {
    "return the correct join statement string" in {
      val table = new Table("database", "table", List(join), List(), null)
      join.child.addTo(table)
      join.joinStatment mustBe "LEFT OUTER JOIN dbId AS joinTable ON table.cust_key = joinTable.cust_key"
    }
  }
}
