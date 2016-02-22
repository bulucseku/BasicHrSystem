package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.AttrValueType.AttrValueType
import com.sentrana.appshell.data.DataType._
import com.sentrana.appshell.data.FormulaType.FormulaType
import com.sentrana.appshell.data.{ AttrValueType, DataType, FormulaType }
import com.sentrana.appshell.utils.Enum
import com.sentrana.appshell.utils.XmlUtils._
import prefuse.data.Schema
import prefuse.data.expression._
import prefuse.data.expression.parser.ExpressionParser

import scala.language.implicitConversions
import scala.util.Try
import scala.util.matching.Regex
import scala.xml.Node

abstract class Metric(
    override val id:          String,
    override val name:        String,
    override val description: Option[String],
    val dataType:             DataType,
    val formatString:         Option[String]
) extends ConceptualObjectWithChildren(id, name, description) with ReportUnit {

  override def fundamentalConceptualObjects: Traversable[ConceptualObjectWithChildren] = Traversable(this)

  def canonicalSortConcept: ConceptualObjectWithChildren = {
    this
  }

  def isSegment: Boolean = false

  def immediateChildren: Traversable[ConceptualObjectWithChildren] = Traversable()

  def dependentFacts: Traversable[Fact] = {
    fundamentalConceptualObjects.collect { case x: Fact => x }
  }

  override def constraints: Traversable[Constraint] = {
    fundamentalConceptualObjects.filter(concept => concept.isInstanceOf[Constrainable])
      .flatMap(concept => concept.asInstanceOf[Constrainable].constraints)
  }

  var attrValueType: AttrValueType = AttrValueType.NA

  def accept[T](visitor: ReportUnitVisitor[T]): T = {
    visitor.visit(this)
  }

  def accept[T](visitor: MetricVisitor[T]): T
}

trait MetricVisitor[T] {
  def visit(metric: Metric): T

  def enter(metric: Metric): T = {
    metric.accept(this)
  }
}

case class AggregationOperation(Key: String, Value: String)

object AggregationOperation extends Enum {
  val Sum, Average, Count, CountDistinct, Max, Min, StdDev = Value
}

case class SimpleMetric(
    override val id:           String,
    override val name:         String,
    override val description:  Option[String],
    fact:                      Fact,
    operation:                 AggregationOperation.Value,
    override val formatString: Option[String],
    override val dataType:     DataType
) extends Metric(id, name, description, dataType, formatString) {

  override def fundamentalConceptualObjects: Traversable[ConceptualObjectWithChildren] = {
    // Incorrect should return the actual object
    List(fact)
  }

  def accept[T](visitor: MetricVisitor[T]): T = {
    visitor.visit(this)
  }
}

abstract class CompositeMetric(
    id:                        String,
    name:                      String,
    description:               Option[String],
    val fact:                  Option[Fact],
    override val dataType:     DataType,
    override val formatString: Option[String]
) extends Metric(id, name, description, dataType, formatString) {
  def dependentMetrics: Traversable[Metric]

  override def fundamentalConceptualObjects: Traversable[ConceptualObjectWithChildren] = {
    dependentMetrics.flatMap(metric => metric.fundamentalConceptualObjects).toList.distinct
  }

  def this(
    id:           String,
    name:         String,
    description:  Option[String],
    dataType:     DataType,
    formatString: Option[String]
  ) = this(id, name, description, None, dataType, formatString)
}

case class BinaryOperation(canonicalSymbol: String, isLinear: Boolean) {
  def valuesBySymbol: Traversable[Symbol] = List('+, '-, '*, '/)
}

object BinaryOperation {
  val Addition = BinaryOperation("+", true)
  val Division = BinaryOperation("/", true)
  val Multiplication = BinaryOperation("*", true)
  val Subtraction = BinaryOperation("-", true)
}

case class ConstantMetric(
    override val id:           String,
    override val name:         String,
    override val description:  Option[String],
    override val dataType:     DataType,
    override val formatString: Option[String]
) extends Metric(id, name, description, dataType, formatString) {

  val fact = new Fact(id, name, description)

  override def fundamentalConceptualObjects: Traversable[ConceptualObjectWithChildren] = {
    Traversable(this)
  }

  def accept[T](visitor: MetricVisitor[T]): T = {
    visitor.visit(this)
  }
}

object ConstantMetric {

  class MetricPattern extends com.sentrana.biq.core.conceptual.MetricPattern {
    val RegexPattern: Regex = """^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$""".r

    def tryParse(expression: String, getKnownMetric: String => Metric): Option[ConstantMetric] = {
      RegexPattern.findFirstMatchIn(expression) match {
        case Some(matchResult) =>
          val id = matchResult.group(0)
          val name = matchResult.group(0)
          Some(ConstantMetric(id, name, None, DataType.NUMBER, Option(id)))
        case _ => None
      }
    }
  }
}

case class BinaryOperationMetric(
    override val id:           String,
    override val name:         String,
    override val description:  Option[String],
    operation:                 BinaryOperation,
    left:                      Metric,
    right:                     Metric,
    override val dataType:     DataType,
    override val formatString: Option[String]
) extends CompositeMetric(id, name, description, None, dataType, formatString) {

  override def dependentMetrics: Traversable[Metric] = {
    List(left, right)
  }

  override def accept[T](visitor: MetricVisitor[T]): T = {
    visitor.visit(this)
  }
}

object BinaryOperationMetric {

  /**
   * <summary>
   * / Recognizes metric expressions of the form (A [+-*\/
   */
  class MetricPattern extends com.sentrana.biq.core.conceptual.MetricPattern {
    val binarySymbols = """+\-\*\\/"""
    val regexPattern: Regex = new Regex(
      """^([^\""" + binarySymbols + """]+)\s+([\""" + binarySymbols
        + """])\s+([^@\""" + binarySymbols + """]+)""", "left", "op", "right"
    )
    val regexConditionalPattern: Regex = new Regex(
      """^(.*):(.*),dataType:(.*),precision:(.*),formulaType:(CM)$""",
      "name", "formula", "dataType", "precision", "formulaType"
    )

    override def tryParse(expression: String, getKnownMetric: String => Metric): Option[BinaryOperationMetric] = {
      (
        regexConditionalPattern.findFirstMatchIn(expression),
        regexPattern.findFirstMatchIn(expression)
      ) match {
          case (None, Some(matchResult)) =>
            val op = new BinaryOperation(matchResult.group("op"), true)
            val left = getKnownMetric(matchResult.group("left"))
            val right = getKnownMetric(matchResult.group("right"))
            val id = s"${left.id}${op.canonicalSymbol}${right.id}"
            val name = s"${left.name}${op.canonicalSymbol}${right.name}"
            Some(
              new BinaryOperationMetric(
                id,
                name,
                None,
                op, left, right,
                left.dataType,
                if (op.isLinear) left.formatString else None
              )
            )
          case _ => None
        }
    }
  }
}

class PerMetric(
  override val id:           String,
  override val name:         String,
  override val description:  Option[String],
  val numerator:             Metric,
  val denominator:           Metric,
  override val dataType:     DataType,
  override val formatString: Option[String]
) extends BinaryOperationMetric(id, name, description, BinaryOperation.Division, numerator, denominator, dataType, formatString)

case class PercentTotalMetric(
    override val id:           String,
    override val name:         String,
    override val description:  Option[String],
    baseMetric:                Metric,
    override val dataType:     DataType,
    override val formatString: Option[String]
) extends CompositeMetric(id, name, description, dataType, formatString) {

  override def dependentMetrics = List(baseMetric)

  override def accept[T](visitor: MetricVisitor[T]): T = {
    visitor.visit(this)
  }
}

object PercentTotalMetric {

  class MetricPattern extends com.sentrana.biq.core.conceptual.MetricPattern {
    override def tryParse(expression: String, getKnownMetric: String => Metric): Option[PercentTotalMetric] =
      {
        if (expression.charAt(0) != '%')
          None
        else {
          val id = expression.dropWhile(_ == '%').trim
          val baseMetric = getKnownMetric(id)
          val name = s"(Percent ${baseMetric.name})"
          Some(PercentTotalMetric(
            "Percent" + baseMetric.id, name, None, baseMetric,
            baseMetric.dataType, baseMetric.formatString
          ))
        }
      }
  }
}

case class FilteredMetric(
    override val id:           String,
    override val name:         String,
    override val description:  Option[String],
    baseMetric:                Metric,
    filters:                   Traversable[FilterUnit],
    override val dataType:     DataType,
    override val formatString: Option[String]
) extends CompositeMetric(id, name, description, dataType, formatString) {

  override def dependentMetrics: Traversable[Metric] = List(baseMetric)

  override def fundamentalConceptualObjects = {
    val conceptualObjects = super.fundamentalConceptualObjects
    val fundamentalElements = filters.map(filter => filter.fundamentalElements)

    fundamentalElements.fold(conceptualObjects)(
      (current, elements) => current ++ elements
    )
  }

  override def accept[T](visitor: MetricVisitor[T]): T = {
    visitor.visit(this)
  }
}

object FilteredMetric {

  class MetricPattern(val metadata: Metadata) extends com.sentrana.biq.core.conceptual.MetricPattern {
    private val regexPattern = new Regex("""^\(([^@]*)@(.*)\)$""", "metric", "filter")
    private val regexPatternConditional = new Regex(
      """^(.*):(.*),dataType:(.*),precision:(.*),formulaType:(CM)$""",
      "name", "formula", "dataType", "precision", "formulaType"
    )
    private val ifRegexPattern = new Regex("""^if\(([^,]+)\,(.+)\)$""", "filter", "metric")

    def tryParse(expression: String, getKnownMetric: String => Metric): Option[FilteredMetric] = {

      def getMetric(metricIdParts: String, name: String, filterIds: Traversable[String]): FilteredMetric = {
        val metricParts = metricIdParts.split(",")
        val metricId = if (metricParts.size > 1)
          metricParts.head.split(":")(1)
        else
          metricIdParts

        val filters = filterIds.map(metadata.getFilterUnit(_).get)
        val filterName = filters.map(_.name).mkString(",")
        val aggregateMetric = new AggregateMetric.MetricPattern

        val metricOption = aggregateMetric.tryParse(metricId, getKnownMetric)
        val metric = metricOption.getOrElse(getKnownMetric(metricId))
        val metricName: String = if (metricParts.size > 1)
          metricParts.head.split(":")(0)
        else if (name.nonEmpty)
          name
        else if (metricOption.isEmpty) {
          s"${metric.name} ($filterName)"
        }
        else {
          s"${metric.asInstanceOf[AggregateMetric].baseMetric.name}(${aggregateMetric.getAggregateFunction(metricId)})(),$filterName"
        }

        FilteredMetric(expression, metricName, None, metric, filters, metric.dataType, metric.formatString)
      }

      regexPattern.findFirstMatchIn(expression) match {
        case Some(matches) =>
          val metricSplit = matches.group("metric").split(":")
          val metricId = if (metricSplit.size > 1) metricSplit(1) else matches.group("metric")
          val name = if (metricSplit.size > 1) metricSplit(0) else ""
          val filterIds = matches.group("filter").split(",")
          Some(getMetric(metricId, name, filterIds))
        case None =>
          regexPatternConditional.findFirstMatchIn(expression) match {
            case Some(newMatch) =>
              val name = newMatch.group("name")
              val formula = newMatch.group("formula")
              val ifPatternMatch = ifRegexPattern.findFirstMatchIn(formula).getOrElse(
                throw new Exception("Formula inside expression is formatted incorrectly")
              )
              val metricId = ifPatternMatch.group("metric")
              val regex = """\s+\=\s+""".r
              val filterExpression = regex.replaceAllIn(ifPatternMatch.group("filter"), "=")
              val andValues = filterExpression.split(" and ")
              val filterIdsAsString = andValues.flatMap(_.split(" or ")).mkString(",")
              val filterIds = filterIdsAsString.replaceAll("\\)", "")
                .replaceAll("\\[", "").replaceAll("\\]", "").replaceAll("\\(", "")
                .replaceAll("=", ":").split(",")
              Some(getMetric(metricId, name, filterIds))
            case None => None
          }
      }
    }
  }
}

case class DerivedMetric(
    override val id:           String,
    override val name:         String,
    override val description:  Option[String],
    override val dataType:     DataType,
    override val formatString: Option[String],
    formulaType:               FormulaType,
    var binaryOperationMetric: Option[Metric]
) extends CompositeMetric(id, name, description, None, dataType, formatString) {

  override def accept[T](visitor: MetricVisitor[T]): T = {
    visitor.visit(this)
  }

  override def dependentMetrics = binaryOperationMetric.toList

}

/**
 * Parse metrics of form if(test predicate, then expression)
 */
class IfFunction() extends FunctionExpression(2) {
  def getName = "IFF"
  def getType(schema: Schema) = classOf[String]
  def getTestPredicate = param(0)
  def getThenExpression = param(1)
}

class DerivedMetricFunction() extends FunctionExpression(1) {
  def getName = "F"
  def getType(schema: Schema) = classOf[String]
  def derivedMetricId = param(0)
}

object DerivedMetric {

  val FormatSpecifier: Map[DataType.DataType, String => String] = Map(
    DataType.CURRENCY -> { s: String => s"C$s" },
    DataType.NUMBER -> { s: String => s"N$s" },
    DataType.PERCENTAGE -> { s: String => s"#,##$s%;(#,##$s%)" }
  )

  case class MetricPattern(metadata: Metadata) extends com.sentrana.biq.core.conceptual.MetricPattern {

    private val regexPattern = new Regex(
      """^(.*):(.*),dataType:(.*),precision:(\d+)$""",
      "name", "formula", "dataType", "precision"
    )
    private val regexPatternWithFormulaType = new Regex(
      """^(.*):(.*),dataType:(.*),precision:(\d+),formulaType:(DM)$""",
      "name", "formula", "dataType", "precision", "formulaType"
    )

    private val BinaryExpressionType: Map[Int, BinaryOperation] = Map(
      ArithmeticExpression.SUB -> BinaryOperation.Subtraction,
      ArithmeticExpression.ADD -> BinaryOperation.Addition,
      ArithmeticExpression.MUL -> BinaryOperation.Multiplication,
      ArithmeticExpression.DIV -> BinaryOperation.Division
    )

    def tryParse(expression: String, getKnownMetric: String => Metric): Option[DerivedMetric] = {
      val matches = regexPattern.findFirstMatchIn(expression)
      val matchesWithFormula = regexPatternWithFormulaType.findFirstMatchIn(expression)
      if (matches.nonEmpty || matchesWithFormula.nonEmpty) {
        val formulaType = FormulaType.DM.toString
        val name = if (matches.nonEmpty) matches.get.group("name") else matchesWithFormula.get.group("name")
        val formula = if (matches.nonEmpty) matches.get.group("formula") else matchesWithFormula.get.group("formula")
        val dataType = if (matches.nonEmpty) matches.get.group("dataType") else matchesWithFormula.get.group("dataType")
        val precision = if (matches.nonEmpty) matches.get.group("precision") else matchesWithFormula.get.group("precision")
        val result = parse(formula)
        Some(
          DerivedMetric(
            expression,
            name,
            Some(expression.replace(formula, result.description.getOrElse(""))),
            DataType.withNameOpt(dataType.toUpperCase).get,
            precision.toInt,
            FormulaType.withNameOpt(formulaType.toUpperCase).get,
            Some(result)
          )
        )
      }
      else
        None
    }

    def parse(expression: String): Metric = {
      if (!FunctionTable.hasFunction("IFF"))
        FunctionTable.addFunction("IFF", classOf[IfFunction])
      if (!FunctionTable.hasFunction("F"))
        FunctionTable.addFunction("F", classOf[DerivedMetricFunction])
      // Replace if with iff to use custom if functions
      val iffExpression = expression.replaceAll("""(i|I)(f|F)\(""", "iff(")
      val getKnownMetric = MetricExpressionParser.getKnownMetric(metadata)_
      val parsedExpression = ExpressionParser.parse(iffExpression)
      prepareMetric(parsedExpression, getKnownMetric)
    }

    def prepareMetric(expression: Expression, getKnownMetric: String => Metric): Metric = {
      val constantPattern = new ConstantMetric.MetricPattern()
      expression match {
        case col: ColumnExpression => getKnownMetric(col.getColumnName)
        case function: DerivedMetricFunction =>
          metadata.derivedMetrics.find (_.id == s"f(${function.derivedMetricId})") match {
            case Some(d) =>
              prepareMetric (ExpressionParser.parse (d.description.get.replaceAll("""(i|I)(f|F)\(""", "iff(")), getKnownMetric)
            case None => throw new Exception(
              "Derived metric could not be found in metadata: " + function.derivedMetricId
            )
          }
        case iff: IfFunction =>
          val filters = iff.getTestPredicate.toString.replaceAll("""\s+\=\s+""", "=")
          val asString = filters.split(" AND ").map(_.split(" OR ").mkString(",")).mkString(",")
          val filterIds = asString.replace(")", "").replace("(", "").replace("[", "").replace("]", "").replace("=", ":")
          val trueMetric = prepareMetric(iff.getThenExpression, getKnownMetric)
          metadata.getMetric("(" + trueMetric.id + "@" + filterIds + ")").get
        case literal: Literal =>
          constantPattern.tryParse(literal.toString, getKnownMetric).getOrElse(
            throw new Exception("Could not parse constant metric: " + literal)
          )
        case binExp: ArithmeticExpression =>
          val left = prepareMetric(binExp.getLeftExpression, getKnownMetric)
          val right = prepareMetric(binExp.getRightExpression, getKnownMetric)
          if (right.isInstanceOf[ConstantMetric] && right.id == "0" && binExp.getOperation == ArithmeticExpression.DIV)
            throw new Exception("Cannot divide by zero in Formula: " + expression.toString)
          val op = BinaryExpressionType(binExp.getOperation)
          val id = s"${left.id}${op.canonicalSymbol}${right.id}"
          val name = s"(${left.name} ${op.canonicalSymbol} ${right.name})"
          val leftDesc = left match {
            case s: SimpleMetric   => s"[${left.id}]"
            case c: ConstantMetric => left.id
            case _                 => left.description
          }
          val rightDesc = right match {
            case s: SimpleMetric   => s"[${s.id}]"
            case c: ConstantMetric => c.id
            case _                 => right.description
          }
          val desc = s"$leftDesc ${op.canonicalSymbol} $rightDesc"
          val formatString = if (op.isLinear) left.formatString else None
          BinaryOperationMetric(id, name, Some(desc), op, left, right, left.dataType, formatString)
        case _ => throw new IllegalArgumentException(
          "The given expression has invalid format: " + expression.toString
        )
      }
    }
  }

  def apply(
    id:          String,
    name:        String,
    description: Option[String],
    dataType:    DataType.DataType,
    precision:   Int,
    formulaType: FormulaType.FormulaType,
    metric:      Option[Metric]
  ): DerivedMetric = DerivedMetric(
    id,
    name,
    description,
    dataType,
    Some(FormatSpecifier(dataType){
      if (dataType != DataType.PERCENTAGE)
        precision.toString
      else
        "0." + ("0" * precision)
    }),
    formulaType,
    metric
  )
}

case class AggregateMetric(
    override val id:           String,
    override val name:         String,
    override val description:  Option[String],
    baseMetric:                Metric,
    override val dataType:     DataType,
    override val formatString: Option[String]
) extends CompositeMetric(id, name, description, dataType, formatString) {

  override def dependentMetrics = List(baseMetric)

  override def accept[T](visitor: MetricVisitor[T]): T = {
    visitor.visit(this)
  }
}

object AggregateMetric {

  class MetricPattern extends com.sentrana.biq.core.conceptual.MetricPattern {

    val regexPattern = new Regex(
      """^([^f]+)\((.+)\)$""",
      "aggregateFunction", "metricId"
    )

    def tryParse(expression: String, getKnownMetric: String => Metric): Option[AggregateMetric] = {
      regexPattern.findFirstMatchIn(expression) match {
        case Some(matches) =>
          val aggregateFunctionId = matches.group("aggregateFunction")
          val metricId = matches.group("metricId")
          val baseMetric = getKnownMetric(metricId)

          if (baseMetric.asInstanceOf[SimpleMetric].operation != AggregationOperation.Sum)
            throw new UnsupportedOperationException(
              "Aggregation on metric failed. As aggregation is only applicable " +
                "on metrics whose default aggregation is SUM"
            )

          if (AggregationOperation.withNameOpt(aggregateFunctionId).nonEmpty) {
            val simpleMetric = new SimpleMetric(
              baseMetric.id,
              baseMetric.name,
              baseMetric.description,
              baseMetric.asInstanceOf[SimpleMetric].fact,
              AggregationOperation.withName(aggregateFunctionId),
              baseMetric.formatString,
              baseMetric.dataType
            )
            Some(new AggregateMetric(
              expression,
              s"${simpleMetric.name}(${Metadata.AggregateFunctions(aggregateFunctionId).name})",
              None,
              simpleMetric,
              simpleMetric.dataType,
              Option(Metadata.AggregateFunctions(aggregateFunctionId).formatString.getOrElse(simpleMetric.formatString.orNull))
            ))
          }
          else
            None
        case None => None
      }
    }

    def getAggregateFunction(expression: String): String = {
      regexPattern.findFirstMatchIn(expression) match {
        case Some(matches) => matches.group("aggregateFunction")
        case None          => ""
      }
    }
  }
}

object SimpleMetric {
  implicit def fromXml(facts: Traversable[Fact])(metricNode: Node): Try[SimpleMetric] = {
    metricNode.label match {
      case "simpleMetric" =>
        for {
          id <- metricNode.attributeRequired("id")
          name <- metricNode.attributeRequired("name")
          factId <- (metricNode \ "fact").attributeRequired("id")
          operation <- metricNode.attributeRequired("operation")
          dataType <- metricNode.attributeRequired("dataType")
        } yield new SimpleMetric(
          id,
          name,
          Some((metricNode \ "@desc").textOrNone.getOrElse(name)),
          facts.find(_.id == factId).orNull,
          AggregationOperation.withName(operation),
          (metricNode \ "@formatString").textOrNone,
          DataType.withName(dataType.toUpperCase)
        )
    }
  }
}

object CompositeMetric {

  def fromXml(metrics: Traversable[Metric])(metricNode: Node): Try[CompositeMetric] = {
    metricNode.label match {
      case "percentTotalMetric" =>
        for {
          id <- metricNode.attributeRequired("id")
          name <- metricNode.attributeRequired("name")
          metric <- (metricNode \ "metric").attributeRequired("id")
          dataType <- metricNode.attributeRequired("dataType")
        } yield PercentTotalMetric(
          id,
          name,
          Some((metricNode \ "@desc").textOrNone.getOrElse(name)),
          metrics.find(_.id == metric).orNull,
          DataType.withName(dataType.toUpperCase),
          (metricNode \ "formatString").textOrNone
        )
      case "perMetric" =>
        for {
          id <- metricNode.attributeRequired("id")
          name <- metricNode.attributeRequired("name")
          metricNodes = metricNode \ "metric"
          dataType <- metricNode.attributeRequired("dataType")
          metricId1 <- metricNodes(0).attributeRequired("id")
          metricId2 <- metricNodes(1).attributeRequired("id")
        } yield new PerMetric(
          id,
          name,
          Some((metricNode \ "@desc").textOrNone.getOrElse(name)),
          metrics.find(_.id == metricId1).getOrElse(
            throw new IllegalArgumentException(
              s"Metric with id [$metricId1] not found in simple metrics"
            )
          ),
          metrics.find(_.id == metricId2).getOrElse(
            throw new IllegalArgumentException(
              s"Metric with id [$metricId2] not found in simple metrics"
            )
          ),
          DataType.withName(dataType.toUpperCase),
          (metricNode \ "formatString").textOrNone
        )
    }
  }
}
