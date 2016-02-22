package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.{ DataType, FormulaType }
import com.sentrana.appshell.exceptions.MetadataException
import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.exceptions.UninitializedFormException

import scala.language.implicitConversions
import scala.util.Try
import scala.util.matching.Regex
import scala.xml.Node

case class Metadata(
    dimensions:   Traversable[Dimension],
    facts:        Traversable[Fact],
    metrics:      Traversable[Metric],
    metricGroups: Traversable[MetricGroup]
) {

  var derivedMetrics: Traversable[DerivedMetric] = Traversable()

  val attributes: Traversable[Attribute] = {
    dimensions.flatMap(d => d.allAttributes)
  }

  val attributeForms: Traversable[AttributeForm] = {
    attributes.flatMap(a => a.forms)
  }

  val reportUnits: Traversable[ReportUnit] = {
    attributeForms ++ metrics
  }

  val constrainables: Traversable[Constrainable] = {
    attributes ++ facts
  }

  def parseForAttributeForms(target: String): Traversable[AttributeForm] = {
    attributeForms.filter(form => target.contains(form.id))
  }

  /**
   * Helper method to unify how conceptual elements are retrieved.
   * @param result
   * @param id
   * @param typeName
   * @param errorOnNull
   * @tparam TConcept
   * @return
   */
  def checkResult[TConcept](result: Option[TConcept], id: String, typeName: String, errorOnNull: Boolean): Option[TConcept] = {
    if (errorOnNull && result.isEmpty)
      throw new MetadataException(s"Could not find $typeName with id: $id")
    result
  }

  def getReportUnit(id: String, errorOnMissing: Boolean = true): Option[ReportUnit] = {
    val result = getAttributeForm(id, errorOnMissing = false)
      .getOrElse(getMetric(id, errorOnMissing = false)
        .getOrElse(getDerivedMetrics(id, errorOnMissing = false).orNull))

    checkResult(Option(result.asInstanceOf[ReportUnit]), id, "report unit", errorOnMissing)
  }

  def getFilterUnit(id: String, errorOnMissing: Boolean = true): Option[FilterUnit] = {
    val result: FilterUnit = getAttributeElement(id, errorOnMissing = false).getOrElse(
      attributes.flatMap(attr => attr.surrogateGroupings)
      .map(grouping => grouping.compositeAttributeElementsById.get(id))
      .find(e => e.isDefined)
      .getOrElse(None).orNull
    )

    checkResult(Option(result), id, "filter unit", errorOnMissing)
  }

  def getConstrainable(id: String, errorOnMissing: Boolean = true): Option[Constrainable] = {
    val result = constrainables.find(unit => unit.id == id)
    checkResult(result, id, "constrainable", errorOnMissing)
  }

  def getMetric(id: String, errorOnMissing: Boolean = true): Option[Metric] = {
    val result: (String, Option[Metric]) = metrics.find(form => form.id == id) match {
      case None    => getDerivedMetrics(id)
      case Some(r) => id -> Some(r)
      case _       => id -> None
    }
    checkResult(result._2, result._1, "metric", errorOnMissing)
  }

  private def getDerivedMetrics(id: String): (String, Option[Metric]) = {
    val result = derivedMetrics.find(form => form.id == id && form.formulaType == FormulaType.CM)
    val derivedMetricId = if (result.isDefined) {
      val ifRegexPattern = new Regex("""^if\(([^,]+)\,(.+)\)$""", "filter", "metric")
      val description = result.get.description.getOrElse("")
      val ifMatches = ifRegexPattern.findFirstMatchIn(description).getOrElse(
        throw new Exception("Derived Metric string is Invalid: " + description)
      )
      val metricGroup = ifMatches.group("metric")
      val metricParts = metricGroup.split(",")
      val metricId = if (metricParts.size > 1)
        metricParts(0).split(":")(1)
      else
        metricGroup

      val regex = """\s+\=\s+""".r
      val filterExpression = regex.replaceAllIn(ifMatches.group("filter"), "=")
      val andValues = filterExpression.split(" and ")
      val filterIdsAsString = andValues.flatMap(_.split(" or ")).mkString(",")
      val filterIds = filterIdsAsString.replaceAll("\\)", "")
        .replaceAll("\\[", "").replaceAll("\\]", "")
        .replaceAll("\\=", ":").split(",")
      s"(${result.get.name}:$metricId@$filterIds)"
    }
    else
      id
    derivedMetricId -> MetricExpressionParser.default(this).tryParse(derivedMetricId, this)
  }

  def getAttributeForm(id: String, errorOnMissing: Boolean = true) = {
    val result = attributeForms.find(form => form.id == id)
    checkResult(result, id, "attribute form", errorOnMissing)
  }

  def getDerivedMetrics(id: String, errorOnMissing: Boolean = true): Option[Metric] = {
    val result = derivedMetrics.find(form => form.id == id)
    if (result.isDefined) {
      val metricPattern: DerivedMetric.MetricPattern = new DerivedMetric.MetricPattern(this)
      result.get.binaryOperationMetric =
        Some(metricPattern.parse(
          result.get.description.getOrElse("")
        ))
    }
    checkResult(result, id, "metric", errorOnMissing)
  }

  def getCompositeAttribute(id: String, errorOnMissing: Boolean = true): Option[CompositeAttribute] = {
    val result = attributes.flatMap(_.surrogateGroupings).find(_.id == id)
    checkResult(result, id, "composite attribute", errorOnMissing)
  }

  def getAttributeElement(id: String, errorOnMissing: Boolean = true): Option[AttributeElement] = {
    // id must be in the form "AttributeFormId:elementValue"
    val result = id.split(":").toList match {
      case formId :: elementValue :: Nil =>
        getAttributeForm(formId, false) match {
          case None => None
          case Some(form) =>
            if (form.allElements.isEmpty)
              throw new UninitializedFormException(form)
            else form.elementsById.get(id)
        }
      case _ => None
    }

    checkResult(result, id, "attribute element", errorOnMissing)
  }

  def getMetricsFor(facts: Traversable[Fact]) = {
    // Ensure that facts is not computed multiple times
    val factSet = facts.toSet
    metrics.filter(metric => metric.dependentFacts.toSet.diff(factSet).isEmpty)
  }
}

object Metadata {

  val AggregateFunctions: Map[String, AggregateFunction] = Map(
    "Average" -> AggregateFunction("Average", "Avg", None, None),
    "Sum" -> AggregateFunction("Sum", "Sum", None, None),
    "Count" -> AggregateFunction("Count", "Count", None, Some("N0")),
    "Max" -> AggregateFunction("Max", "Max", None, None),
    "Min" -> AggregateFunction("Min", "Min", None, None),
    "StdDev" -> AggregateFunction("StdDev", "StdDev", None, None)
  )

  implicit def fromXml(metaNode: Node): Try[Metadata] = {
    for {
      dimensions <- parseSeq[Dimension](metaNode \ "dimensions" \ "dimension")
      facts <- parseSeq[Fact](metaNode \ "facts" \ "fact")
      simpleMetrics <- parseSeq[SimpleMetric](metaNode \ "metrics" \ "simpleMetrics" \ "_")(SimpleMetric.fromXml(facts))
      compositeMetrics <- parseSeq[CompositeMetric](metaNode \ "metrics" \ "compositeMetrics" \ "_")(CompositeMetric.fromXml(simpleMetrics))
      metricGroups <- parseSeq[MetricGroup](metaNode \ "metricGroups" \ "metricGroup")(MetricGroup.fromXml(simpleMetrics ++ compositeMetrics))
      constraints <- Try(parseConstraints(metaNode))
    } yield {
      val metadata = Metadata(
        dimensions,
        facts,
        simpleMetrics ++ compositeMetrics,
        parseMetricGroups(metricGroups, simpleMetrics ++ compositeMetrics)
      )
      constraints.foreach(
        tuple => metadata.getConstrainable(tuple._1).get.addConstraints(tuple._2)
      )
      metadata
    }
  }

  private def parseConstraints(constraintNode: Node): Map[String, Traversable[Constraint]] = {
    val attributeConstraints = constraintNode \ "constraints" \ "pertinence"
    attributeConstraints.map(
      ac => {
        val id = (ac \ "attribute" \ "@id").textOrNone.getOrElse(
          (ac \ "fact" \ "@id").textOrNone.getOrElse(
            throw new IllegalArgumentException(
              "Node must contain either a fact or attribute node with an id attribute. Node was: " + ac
            )
          )
        )
        id ->
          (ac \ "requiredElements" \ "attributeForm").map(node => Constraint.fromXml(node).get)
      }
    ).toMap
  }

  private def parseMetricGroups(
    metricGroups: Traversable[MetricGroup],
    allMetrics:   Traversable[Metric]
  ): Traversable[MetricGroup] = {
    if (metricGroups.isEmpty)
      List(
        MetricGroup("ACTUAL", "ACTUAL", Some("ACTUAL"), allMetrics.filter(_.dataType != DataType.PERCENTAGE)),
        MetricGroup("PERCENTAGE", "PERCENTAGE", Some("PERCENTAGE"), allMetrics.filter(_.dataType == DataType.PERCENTAGE))
      )
    else if (metricGroups.find(_.id == "Others").isEmpty)
      metricGroups ++ List(MetricGroup("Others", "Others", Some("Others"), allMetrics.filterNot(allMetrics.toSeq.contains(_))))
    else
      metricGroups
  }
}