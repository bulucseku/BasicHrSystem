package com.sentrana.biq.core.physical

import com.sentrana.biq.core.conceptual._

import scala.util.matching.Regex

/**
 * Created by szhao on 1/12/2015.
 */
case class TreeFilter(
    override val databaseId:       String,
    treeColumnForm:                AttributeForm,
    parentElements:                Traversable[AttributeElement],
    override val attributeElement: AttributeElement,
    attributeForm:                 AttributeForm
) extends SegmentValue(databaseId, attributeElement) with FilterUnit {

  val parentNodes: Traversable[AttributeElement] = parentElements
  val fundamentalElements: Traversable[AttributeElement] = List(attributeElement)
  var parentSegmentValues: Traversable[SegmentValue] = Nil

  private var _filterGroup: Option[ConceptualObjectWithChildren] = None
  def filterGroup: ConceptualObjectWithChildren = _filterGroup.getOrElse(treeColumnForm.parent)
  def filterGroup_=(group: ConceptualObjectWithChildren): Unit = _filterGroup = Option(group)

  override val id: String = attributeElement.id

  override val name: String = fundamentalElements.map(_.id).mkString("|")

  override val description: Option[String] = Some((fundamentalElements ++ parentNodes).map(e => e.id).mkString("|"))

  def treePath: String = {
    val allNodes = parentNodes ++ fundamentalElements
    "(" + treeColumnForm.id + TreeFilter.treeNodeSeparator +
      allNodes.map(_.id).mkString(TreeFilter.treeNodeSeparator.toString) + ")"
  }

  override def equals(tr: Any): Boolean = {
    tr match {
      case that: TreeFilter => hashCode == that.hashCode
      case _                => false
    }
  }

  override def hashCode = parentSegmentValues.map(_.value).mkString("").hashCode
}

object TreeFilter {

  val treeNodeSeparator: Char = '+'
  val formId: String = "formID"
  val group: String = "group"
  val filterElement: String = "filterElement"

  val treeFilterRegex = new Regex("""^\(([^\+]+)\+(.*)\)(.+)""", "formID", "group", "filterElement")

  def isTreeFilter(filterId: String): Boolean = {
    val matching = treeFilterRegex.findFirstMatchIn(filterId)
    matching.isDefined
  }

  def getTreeFilterPart(filterId: String, part: String): Option[String] = {
    val matching = treeFilterRegex.findFirstMatchIn(filterId)
    if (matching.isDefined) Some(matching.get.group(part)) else None
  }
}

