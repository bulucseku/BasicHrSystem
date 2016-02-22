package com.sentrana.biq.core.conceptual

import scala.util.matching.Regex
import scala.util.{ Failure, Success, Try }

trait MetricPattern {
  def tryParse(expression: String, getKnownMetric: String => Metric): Option[Metric]
}

object MetricExpressionParser {
  def default(metadata: Metadata): MetricExpressionParser = new MetricExpressionParser(
    List(
      new DerivedMetric.MetricPattern(metadata),
      new BinaryOperationMetric.MetricPattern(),
      new PercentTotalMetric.MetricPattern(),
      new FilteredMetric.MetricPattern(metadata),
      new AggregateMetric.MetricPattern
    )
  )

  def getKnownMetric(metadata: Metadata)(id: String): Metric = {
    val knownMetrics = metadata.metrics.map(m => (m.id, m)).toMap
    knownMetrics.getOrElse(
      id,
      throw new IllegalArgumentException(
        "Could not parse provided metric expression: " + id
      )
    )
  }
}

class MetricExpressionParser(var patterns: Traversable[MetricPattern]) {
  val nestedExpressionPattern: Regex = new Regex("""\(([^()]+)\)""", "content")

  def Register(pattern: MetricPattern) = {
    val contained: Boolean = patterns.exists(_ == pattern)
    if (!contained)
      patterns ++= List(pattern)
    !contained
  }

  def Parse(expression: String, metadata: Metadata): Option[Metric] = {
    val getKnownMetric = MetricExpressionParser.getKnownMetric(metadata)_
    val single = GetSingleMetric(expression, MetricExpressionParser.getKnownMetric(metadata))

    def expressionOrNestedExpression(recursiveExpression: String, depth: Int): Option[Metric] = {
      if (depth == 0) {
        throw new IllegalArgumentException(
          "Could not parse provided metric expression."
        )
      }
      nestedExpressionPattern.findFirstMatchIn(recursiveExpression) match {
        case None =>
          Some(getKnownMetric(recursiveExpression))
        case Some(matches) =>
          val nestedExpression = matches.group("content")
          val nestedMetric = parseSingle(nestedExpression, getKnownMetric)
          expressionOrNestedExpression(
            nestedExpressionPattern.replaceAllIn(recursiveExpression, nestedMetric.get.id),
            depth - 1
          )
      }
    }

    if (single.isEmpty) {
      expressionOrNestedExpression(expression, expression.size)
    }
    else
      single
  }

  def tryParse(expression: String, metadata: Metadata): Option[Metric] = {
    Try(Parse(expression, metadata)) match {
      case Success(metric) => metric
      case Failure(e)      => None
    }
  }

  def parseSingle(expression: String, getKnownMetric: String => Metric): Option[Metric] = {
    val single = GetSingleMetric(expression, getKnownMetric)
    if (single.isDefined) single
    else throw new Exception("Could not parse provided metric expression: " + expression)
  }

  def GetSingleMetric(expression: String, getKnownMetric: String => Metric): Option[Metric] = {
    patterns.foldLeft(Option[Metric](null))(
      (left: Option[Metric], right: MetricPattern) => {
        if (left.isDefined)
          left
        else
          right.tryParse(expression, getKnownMetric)
      }
    )
  }
}