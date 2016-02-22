package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.AttrValueType.AttrValueType
import com.sentrana.appshell.data.DataType.DataType

trait ReportUnit extends ConceptualObject {
  def attrValueType: AttrValueType
  def dataType: DataType
  def formatString: Option[String]

  def fundamentalConceptualObjects: Traversable[ConceptualObject]

  def canonicalSortConcept: ConceptualObject

  def isSegment: Boolean

  def constraints: Traversable[Constraint]

  def accept[T](visitor: ReportUnitVisitor[T]): T
}

trait ReportUnitVisitor[T] {
  def visit(metric: Metric): T
  def visit(attributeForm: AttributeForm): T
  def enter(reportUnit: ReportUnit): T = {
    reportUnit.accept(this)
  }
}

object ReportUnitVisitorExtensions {
  def enter[T](reportUnitVisitor: ReportUnitVisitor[T], reportUnit: ReportUnit) {
    reportUnit.accept(reportUnitVisitor)
  }
}