package com.sentrana.biq.core.physical

import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp

import com.sentrana.biq.UnitSpec

/**
 * Created by william.hogben on 1/14/2015.
 */
@DoNotDiscover
class ComparisonSpec extends UnitSpec with ConfiguredApp {

  var comparison: Comparison = null

  "Test fromXml" in {
    val xml = <comparison operator="Equals"><column databaseId="cust_key" /><literal value="14" /></comparison>
    comparison = Comparison.fromXml(xml).get
    comparison.leftValue mustBe new ComparisonColumn("cust_key")
    comparison.rightValue mustBe new ComparisonLiteral("14")
  }

  "Test format" in {
    comparison.queryAlias("left", "right") mustBe "left.cust_key = 14"
  }

  "Test statement" in {
    inside(comparison.toStatement("left", "rioht")) {
      case StatementPart(sql, values) =>
        sql must include regex """left\.cust_key = \(\{a[\w]+\}\)"""
    }
  }
}
