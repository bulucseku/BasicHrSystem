package com.sentrana.biq.core.physical

import com.sentrana.appshell.data.DataType._
import com.sentrana.biq.core.FromXmlSpec
import com.sentrana.biq.core.conceptual._

/**
 * Created by william.hogben on 1/13/2015.
 */
class BandedSegmentSpec extends FromXmlSpec {
  val attributeForm = new AttributeForm("id", Some("description"), "shortName", true, true, true, Some("default"), Some("formatString"), STRING)
  val databaseId = "dbId"
  val segment = new BandedSegment(databaseId, attributeForm)
  val table = new Table("database", "table", List(), List(segment), null)
  val attributeElement = new AttributeElement("id", "value", Nil, None)
  attributeElement.addTo(attributeForm)
  val segmentInterval = new BandedSegmentInterval(
    "lower",
    "upper",
    attributeElement
  )

  "Test setSegmentValues" in {
    segment.setSegmentValues(List(segmentInterval))
    segment.segmentValues mustBe Map((segmentInterval.conceptualEquivalent.get, segmentInterval))
  }

  "Test Immediate Children" in {
    segment.immediateChildren.head mustBe segmentInterval
  }

  "Test queryAlias" in {
    segment.addTo(table)
    segment.queryAlias mustBe "COALESCE(table.dbId" +
      ", 'default')"
  }

  "Test queryAlias with no default value" in {
    val attrForm = attributeForm.copy(defaultValue = None)
    val segment2 = new BandedSegment("id", attrForm)
    segment2.addTo(table)
    segment2.queryAlias mustBe segment2.queryAliasNoDefault
  }
}
