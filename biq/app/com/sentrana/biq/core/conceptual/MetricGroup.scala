package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.XmlUtils._

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

case class MetricGroup(
    override val id:          String,
    override val name:        String,
    override val description: Option[String],
    metrics:                  Traversable[Metric]
) extends ConceptualObjectWithChildren(id: String, name: String, description) {

  override def immediateChildren: Traversable[ConceptualObjectWithChildren] = List()
}

object MetricGroup {
  def fromXml(metrics: Traversable[Metric])(metricGroupNode: Node): Try[MetricGroup] = {
    for {
      id <- metricGroupNode.attributeRequired("id")
      name <- metricGroupNode.attributeRequired("name")
      metricIds <- parseSeq[String](metricGroupNode \ "metric")(_.attributeRequired("id"))
    } yield MetricGroup(
      id,
      name,
      Some((metricGroupNode \ "@desc").textOrNone.getOrElse(name)),
      metricIds.map(id => metrics.find(_.id == id).getOrElse(
        throw new IllegalArgumentException(
          s"A metric with the given metric id $id could not be found"
        )
      ))
    )
  }
}