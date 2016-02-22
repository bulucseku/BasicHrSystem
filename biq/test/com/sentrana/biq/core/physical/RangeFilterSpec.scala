package com.sentrana.biq.core.physical

import org.scalatestplus.play.PlaySpec

import com.sentrana.appshell.data.DataType._
import com.sentrana.biq.core.conceptual.{ AttributeForm, Fact }

/**
 * Created by william.hogben on 1/20/2015.
 */
class RangeFilterSpec extends PlaySpec {
  val attributeForm = new AttributeForm("id", Some("description"), "shortName", true, true, true, Some("default"), Some("formatString"), STRING)
  val fact = new Fact("id", "name", Some("description"))
  val rangeFilter = new RangeFilter("filterId", "dbId", "5", "9", attributeForm)
  val dateRangeFilter = new RangeFilter("filterId", "dbId", "2013-12-12", "2013-12-13 00:00:00", attributeForm)

  "Test formatLowerBound" in {
    rangeFilter.formattedLowerBound mustBe "'5'"
  }

  "Test formatLowerBound With Date String" in {
    dateRangeFilter.formattedLowerBound mustBe "'2013-12-12'"
  }

  "Test formatUpperBound With Date String" in {
    dateRangeFilter.formattedUpperBound mustBe "'2013-12-13 00:00:00'"
  }

  "Test formatLiteral" in {
    dateRangeFilter.formatLiteral("blah'blah") mustBe "'blah''blah'"
  }

  "Test filterGroup" in {
    val filterGroup = new Fact("id", "name", Some("description"))
    rangeFilter.filterGroup mustBe attributeForm.parent
    rangeFilter.filterGroup = filterGroup
    rangeFilter.filterGroup mustBe filterGroup
  }

  "Test formatLiteral with null value" in {
    rangeFilter.formatLiteral(null) mustBe "NULL"
  }
}
