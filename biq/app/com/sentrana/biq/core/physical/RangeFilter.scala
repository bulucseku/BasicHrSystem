package com.sentrana.biq.core.physical

import com.sentrana.biq.core.conceptual._
import org.joda.time.format.DateTimeFormat

/**
 * Created by szhao on 1/12/2015.
 */
class RangeFilter(
    val filterId:   String,
    databaseId:     String,
    val lowerBound: String,
    val upperBound: String,
    attributeForm:  AttributeForm
) extends SegmentValue(databaseId, null) with FilterUnit {

  private def formatBound(bound: String): String = {
    try {
      val format = DateTimeFormat.forPattern(RangeFilter.dateFormat)
      val dateTime = format.parseDateTime(bound)
      formatLiteral(dateTime.toString(RangeFilter.dateFormat))
    }
    catch {
      case e: IllegalArgumentException => formatLiteral(bound)
    }
  }

  val isLowerInclusive = true
  val isUpperInclusive = true

  def formattedUpperBound: String = formatBound(upperBound)

  def formattedLowerBound: String = formatBound(lowerBound)

  def fundamentalElements: Traversable[AttributeElement] = List(attributeForm.allElements.head)

  private var _filterGroup: Option[ConceptualObjectWithChildren] = None
  def filterGroup: ConceptualObjectWithChildren = _filterGroup.getOrElse(attributeForm.parent)
  def filterGroup_=(group: ConceptualObjectWithChildren): Unit = _filterGroup = Option(group)

  def formatLiteral(rawValue: String): String = {
    if (rawValue == null)
      "NULL"
    else
      "'" + rawValue.replaceAll("'", "''") + "'"
  }

  val id: String = filterId

  val name: String = formatLiteral(lowerBound) + " - " + formatLiteral(upperBound)

  val description: Option[String] = None
}

object RangeFilter {
  val elementSeperator: String = "--"
  val dateFormat: String = "yyyy-MM-dd"

  def isRangeFilter(filterId: String): Boolean = {
    filterId.contains(this.elementSeperator)
  }
}