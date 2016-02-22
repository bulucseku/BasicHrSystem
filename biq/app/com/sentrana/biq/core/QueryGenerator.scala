package com.sentrana.biq.core

import com.sentrana.biq.core.conceptual._

/**
 * Created by szhao on 1/8/2015.
 */
trait QueryGenerator {
  def buildQuery: Query
}

abstract class BaseQueryGenerator(
    val report: Report
) extends QueryGenerator {
  def buildQuery: Query

  val reportUnits = report.templates.map(tu => tu.reportUnit)

  val filterGroups: Iterable[Traversable[FilterUnit]] = report.filters
    .groupBy(f => f.filterGroup).values

  val fundamentalConceptualObjects: Traversable[ConceptualObject] =
    (reportUnits.flatMap(unit => unit.fundamentalConceptualObjects)
      ++ report.filters.filter(f => f.fundamentalElements.nonEmpty).flatMap(f => f.fundamentalElements)).toList.distinct

  // TODO?: match result order so that rollups are calculated correctly
  val groupingElements: Iterable[Traversable[AttributeForm]] =
    reportUnits
      .filter(unit => unit.isSegment)
      .flatMap(unit => List(unit.asInstanceOf[AttributeForm], unit.canonicalSortConcept.asInstanceOf[AttributeForm]))
      .groupBy(form => form.parent).values

  val sortUnits: Traversable[TemplateUnit] = report.templates
    .groupBy(tu => tu.reportUnit.canonicalSortConcept)
    .map(group => group._2.head).toList
    .sortBy(tu => tu.sortUnit.sortPosition)

  def createNewQuery: Query
}

