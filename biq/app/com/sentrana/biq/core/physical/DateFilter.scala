package com.sentrana.biq.core.physical

import com.sentrana.appshell.data.DataType
import com.sentrana.biq.core.conceptual._
import org.joda.time.DateTime

/**
 * Created by szhao on 1/12/2015.
 */
class DateFilter(
    databaseId:        String,
    val date:          String,
    attributeElement:  AttributeElement,
    val attributeForm: AttributeForm
) extends SegmentValue(databaseId, attributeElement) with FilterUnit {

  def formattedDate: String = {
    val dateTime = DateTime.parse(date)
    formatLiteral(Some(dateTime.toString(DateFilter.dateFormat)))
  }

  def fundamentalElements: Traversable[AttributeElement] = List(attributeForm.allElements.head)

  private val _filterGroup: Option[ConceptualObjectWithChildren] = None
  def filterGroup: ConceptualObjectWithChildren = {
    this._filterGroup.getOrElse(attributeForm.parent)
  }

  def formatLiteral(rawValue: Option[String]): String = {
    if (rawValue.isEmpty)
      "NULL"
    else {
      "'" + rawValue.get.replaceAll("'", "''") + "'"
    }
  }

  def id: String = attributeElement.id

  def name: String = date

  def description: Option[String] = None

}

object DateFilter {
  val dateFormat = "yyyy-MM-dd hh:mm:ss tt"

  def isDateFilter(filterId: String, oMetaData: Metadata): Boolean = {
    oMetaData.attributeForms.find(
      form => Option(form.elementsById.getOrElse(filterId, None)).isEmpty && form.dataType == DataType.DATETIME
    ).size > 0
  }
}
