package com.sentrana.biq.core

import com.sentrana.appshell.utils.Enum
import com.sentrana.biq.core.conceptual._

import scala.util.matching.Regex

/**
 * Created by szhao on 1/8/2015.
 */
case class Report(
    repository: Option[Repository],
    templates:  Traversable[TemplateUnit],
    filters:    Traversable[FilterUnit],
    totalsOn:   Boolean
) {

  def isTotalsAllowed: Boolean = {
    val noOfMetricsInReport = templates.count(template => template.reportUnit.isInstanceOf[Metric])
    val noOfAttributesInReport = templates.count(template => template.reportUnit.isInstanceOf[AttributeForm])

    noOfAttributesInReport != 0 && noOfMetricsInReport != 0
  }

  def this(template: Traversable[TemplateUnit], filters: Traversable[FilterUnit]) = {
    this(None, template, filters, false)
  }

  def validate() = {
    if (totalsOn && !isTotalsAllowed) {
      throw new Exception(
        "You must select at least one metric and one attribute in order to" +
          " create a report with totals!"
      )
    }
    if (repository.isEmpty)
      throw new Exception(
        "Repository must not be None for a valid report"
      )

    val repo = repository.get
    val requiredAttributes = repo.metaData.attributes.filter(_.isRequired)
    val filterElements = filters.filter(f => f.fundamentalElements != null).map(f => f.fundamentalElements).toList.distinct

    requiredAttributes.foreach(
      element => element.forms.map(_.allElements).toList.intersect(filterElements).find(x => true).getOrElse(
        throw new Exception(s"Attribute ${element.name} is required; one of its elements must be selected.")
      )
    )

    val badTemplate = templates.find(
      template => template.reportUnit.constraints != null && template.reportUnit.constraints.find(!_.isSatisfied(this)).nonEmpty
    )
    if (badTemplate.isDefined)
      throw new Exception(
        s"Unit ${badTemplate.get.reportUnit.name} is incompatible with the "
          + "selected elements."
      )
  }

  /**
   * Convenience method for accessing the data-warehouse-specific query generator.
   */
  def buildQuery: Query = {
    validate()
    repository.get.dataWarehouse.getQueryGenerator(this).buildQuery
  }

  /**
   * Creates a new report that results from drilling into this report with the
   * targeted elements, or null if it cannot be drilled into.
   *
   * @param targetElements The target attribute elements.
   * @return Option[Report] A new report.
   */
  def drillInto(targetElements: Traversable[AttributeElement]): Option[Report] = {
    val targetAttributes = getDrillPathTargetAttributes(targetElements)
    if (targetAttributes.isEmpty)
      None
    else {
      var targetTemplate = templates.toList
      targetAttributes.map { targetAttribute =>

        // Find the parent template units to be replaced.
        val formsToReplace = targetAttribute.allChildAttributes.flatMap(attr => attr.forms)
        val parentTemplateUnits = targetTemplate.filter(tu => formsToReplace.exists(_ == tu.reportUnit))

        // TODO?: Handle or die more gracefully?
        if (parentTemplateUnits.isEmpty)
          throw new Exception("Unable to find the template units for the given attribute elements.")

        // Isolate the first parent template unit (to use for placement/sorting of child unit).
        val firstParentTU: TemplateUnit = parentTemplateUnits.head

        // Create new TemplateUnits using the target attribute.
        val newUnits = targetAttribute.defaultForms.map(form => new TemplateUnit(form, firstParentTU.sortUnit))

        // Replace this template unit with one formed by using the child attribute.
        val split = targetTemplate.splitAt(templates.toList.indexOf(firstParentTU))
        targetTemplate = (split._1 ++ newUnits ++ split._2).filterNot(tu => parentTemplateUnits.contains(tu))
      }
      Some(new Report(repository, targetTemplate, filters ++ targetElements, totalsOn))
    }
  }

  def getDrillPathTargetAttributes(targetElements: Traversable[AttributeElement]): Traversable[Attribute] = {
    targetElements.map(_.parent)
      .map(x => getPathToRoot(x.parent))
      .groupBy(_.last)
      .map {
        case (root, paths) =>
          paths.map(path => path.drop(1).reverse)
            .reduce((a, b) => longestCommonPath(a, b).toList).lastOption
      }
      .collect { case Some(attr) if attr.visibleForms.nonEmpty => attr }
  }

  // TODO: Generalize and relocate?
  private def longestCommonPath(pathA: Iterable[Attribute], pathB: Iterable[Attribute]): Traversable[Attribute] =
    {
      pathA.zip(pathB).takeWhile(tuple => tuple._1 == tuple._2).map(_._1)
    }

  // TODO: Generalize and relocate?
  private def getPathToRoot(attribute: Attribute): List[Attribute] =
    {
      if (attribute == null)
        List()
      else
        attribute :: getPathToRoot(attribute.parent)
    }

  def IsDrillable: Boolean =
    {
      val attributeForms = templates.filter(template => template.reportUnit.isInstanceOf[AttributeForm]).map(t => t.reportUnit.asInstanceOf[AttributeForm])

      val targetAttributes = attributeForms
        .map(form => getPathToRoot(form.parent))
        .groupBy(path => path.lastOption)
        .map(group => group._2.map(path => path.drop(1).reverse).reduce((a, b) => longestCommonPath(a, b).toList).lastOption)
        .filter(attr => attr.isDefined && attr.get.visibleForms.nonEmpty)

      targetAttributes.nonEmpty
    }

}

object SortOrder extends Enum {
  type SortOrder = Value
  val ASC, DESC = Value
}

case class SortUnit(sortPosition: Int, sortOrder: SortOrder.SortOrder) {
  override def toString =
    s"$sortPosition${sortOrder.toString.charAt(0)}"
}

object SortUnit {

  val sortUnitPattern = new Regex("""^(\d+)([AD])?$""", "position", "order")
  def parse(sort: String): SortUnit = {
    val matcher = sortUnitPattern.findFirstMatchIn(sort)
    if (matcher.isEmpty)
      throw new Exception("Invalid sort unit specification: expecting sort position followed by optional 'A' or 'D'; found " + sort)
    val sortPosition = matcher.get.group("position").toInt
    val ascDesc = matcher.get.group("order")
    val sortOrder = if (ascDesc == "D") SortOrder.DESC else SortOrder.ASC

    SortUnit(sortPosition, sortOrder)
  }
}

case class TemplateUnit(
  reportUnit: ReportUnit,
  sortUnit:   SortUnit
)