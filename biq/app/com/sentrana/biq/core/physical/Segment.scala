package com.sentrana.biq.core.physical

import com.sentrana.appshell.data.DataType
import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.core.conceptual._

import scala.collection.mutable
import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

/**
 * Created by szhao on 1/12/2015.
 */
case class Segment(
    override val databaseId: String,
    attributeForm:           AttributeForm,
    override val dataType:   DataType.Value
) extends Column(databaseId) {

  private val segmentValues: mutable.Map[String, SegmentValue] = mutable.Map()

  def defaultValue: Option[String] = {
    conceptualEquivalent.getOrElse (
      throw new Exception("Attribute Form could not be found")
    ).defaultValue
  }

  def conceptualEquivalent: Option[AttributeForm] = Option(attributeForm)

  def queryAliasNoDefault: String = super.queryAlias

  override def queryAlias: String = {
    if (defaultValue.isEmpty)
      queryAliasNoDefault
    else
      "COALESCE(" + super.queryAlias + "," + formatLiteral(defaultValue) + ")"
  }

  override def immediateChildren: Traversable[SegmentValue] = segmentValues.values

  def setSegmentValues(segmentValues: Traversable[SegmentValue]): Unit = {
    this.segmentValues.clear()
    this.segmentValues ++= segmentValues.map(
      segment => (segment.conceptualEquivalent.get.id, segment)
    )
    segmentValues.foreach(_.addTo(this))
  }

  override def findEquivalent(concept: ConceptualObject): Option[DatabaseObject] = {
    if (Some(concept) == conceptualEquivalent)
      Some(this)
    else
      Option(segmentValues.getOrElse(concept.id, null))
  }
}

object Segment {
  def fromXml(metadata: Metadata, attrNode: Node): Try[Segment] = {
    for {
      databaseId <- attrNode.attributeRequired("databaseId")
      attributeForm <- (attrNode \ "attributeForm").head.attributeRequired("id")
    } yield Segment(
      databaseId,
      metadata.attributeForms.find(_.id == attributeForm).getOrElse(
        throw new IllegalArgumentException(
          "Attribute form was not found with id: " + attributeForm
        )
      ),
      dataType = DataType.STRING
    )
  }
}
