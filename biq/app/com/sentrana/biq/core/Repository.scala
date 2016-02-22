package com.sentrana.biq.core

import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.core.conceptual._
import com.sentrana.biq.core.physical.{ DataWarehouse, DateFilter, RangeFilter, TreeFilter }
import play.api.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

/**
 * Created by szhao on 1/8/2015.
 */
case class Repository(
    id:                           String,
    name:                         String,
    showDataDictionaryDefinition: Boolean,
    metaData:                     Metadata,
    dataWarehouse:                DataWarehouse
) {
  override def toString = s"$name, [$id]"

  def refreshAttributeElements() = {
    metaData.attributeForms.foreach(_.setAttributeElements(Nil))
  }

  def loadAttributeElementsFromString(elementIds: String) = {
    val elements = metaData.parseForAttributeForms(elementIds)
    elements.foreach(loadAttributeElements)
  }

  def loadAttributeElements(attributeForm: AttributeForm) = {
    if (attributeForm.allElements.isEmpty) {
      if (attributeForm.isTreeAncestorForm)
        dataWarehouse.queryForTreeElements(attributeForm)
      else {
        dataWarehouse.queryForElements(attributeForm)
        // if this is a tree form load the entire tree in background
        if (attributeForm.isInTree) {
          val ancestorForm = attributeForm.ancestorForm.get
          if (ancestorForm.allElements.isEmpty)
            Future {
              dataWarehouse.queryForTreeElements(ancestorForm)
            }
        }
      }
    }
  }

  def loadAllAttributeElements() = {
    Logger.debug("Starting Loading of Attribute Elements for repository: " + id)
    this.synchronized {
      // Initialize all the attribute forms that will not be displayed as tree control.
      metaData.attributeForms.filter(
        form => !form.isInTree
      ).par.map(attributeForm => dataWarehouse.queryForElements(attributeForm))

      // Initialize all the attribute forms that will be displayed as tree control.
      metaData.attributeForms.filter(
        form => form.isTreeAncestorForm
      ).par.map(attributeForm =>
          dataWarehouse.queryForTreeElements(attributeForm))

      metaData.attributes.flatMap(attr => attr.surrogateGroupings)
        .foreach(_.generateGroups())
    }
    Logger.debug("Finished Loading Attribute Elements")
  }

  def getCategoryAttribute: Option[Attribute] = metaData.attributes.find(_.id == "Category")

  def createReport(
    templateIds:       Traversable[String],
    sortIds:           Traversable[String],
    filterIds:         Traversable[String],
    totals:            Boolean,
    additionalFilters: Traversable[FilterUnit] = Nil
  ): Report = {
    val reportUnits = templateIds.map(metaData.getReportUnit(_).get)

    // Add hidden
    val additions = reportUnits.toList.zip(sortIds.toList).collect {
      case (reportUnit, sortId) if reportUnit.canonicalSortConcept.id != reportUnit.id &&
        !templateIds.toList.contains(reportUnit.id) =>
        (reportUnit.canonicalSortConcept.asInstanceOf[ReportUnit], sortId, reportUnit.canonicalSortConcept.id)
    }
    val sortUnits = (sortIds ++ additions.map(_._2)).map(SortUnit.parse)
    val templates = (reportUnits ++ additions.map(_._1)).toList.zip(sortUnits.toList).map {
      case (ru, su) => TemplateUnit(ru, su)
    }
    val canonicalSortIds = additions.map(_._3)

    // The first kind of filter is element filter
    val elementFilter = filterIds.filter { id =>
      !RangeFilter.isRangeFilter(id) && !DateFilter.isDateFilter(id, metaData) && !TreeFilter.isTreeFilter(id)
    }.map(metaData.getFilterUnit(_).get)

    // The second kind of filter is range filter
    // For this kind of filter, we will directly jump to the physical layer
    // as the range value may not have corresponding conceptual object.
    val rangeFilter: Traversable[FilterUnit] = filterIds.filter(id => RangeFilter.isRangeFilter(id)).map(createRangeFilter)

    // The third kind of filter is tree filter
    // var treeFilter = CreateTreeFilter(filterIds);
    val treeFilter: Traversable[FilterUnit] = filterIds.filter(f => TreeFilter.isTreeFilter(f)).map(createTreeFilter)

    //The fourth kind of filter is date filter
    val dateFilter: Traversable[FilterUnit] = filterIds.filter(id => DateFilter.isDateFilter(id, metaData)).map(createDateFilter)

    // TODO metricFilter...

    val filter = rangeFilter ++ treeFilter ++ dateFilter ++ elementFilter ++ additionalFilters
    Report(Some(this), templates, filter, totals)
  }

  def createDateFilter(id: String): DateFilter = {
    val filterParts = id.split(AttributeElement.expressionSeparator)
    new DateFilter(
      filterParts(0), filterParts(1),
      metaData.getAttributeElement(id).get,
      metaData.getAttributeForm(filterParts(0)).get
    )
  }

  def createRangeFilter(id: String): RangeFilter = {
    val filterParts = id.split(AttributeElement.expressionSeparator)
    new RangeFilter(
      id,
      filterParts(0),
      filterParts(1).split(RangeFilter.elementSeperator)(0),
      filterParts(1).split(RangeFilter.elementSeperator)(1),
      metaData.getAttributeForm(filterParts(0)).get
    )
  }

  def createTreeFilter(id: String): TreeFilter = {
    val formId = TreeFilter.getTreeFilterPart(id, TreeFilter.formId)
    val group = TreeFilter.getTreeFilterPart(id, TreeFilter.group)
    val filterElement = TreeFilter.getTreeFilterPart(id, TreeFilter.filterElement)
    new TreeFilter(
      filterElement.getOrElse(""),
      metaData.getAttributeForm(formId.getOrElse("")).get,
      group.getOrElse("").split(TreeFilter.treeNodeSeparator)
        .filter(_.nonEmpty).map(metaData.getAttributeElement(_).get),
      metaData.getAttributeElement(filterElement.getOrElse("")).get,
      metaData.getAttributeForm(
        filterElement.getOrElse("").split(AttributeElement.expressionSeparator)(0)
      ).get
    )
  }
}

object Repository {
  implicit def fromXml(repoNode: Node): Try[Repository] = {
    for {
      id <- repoNode.attributeRequired("id")
      name <- repoNode.attributeRequired("name")
      showDataDictionaryDefinition <- (repoNode \ "@showDataDictionaryDefinition").boolOrNone
      metadata <- parseSeq[Metadata](repoNode \ "metadata")
      dataWarehouse <- DataWarehouse(metadata.head, id, (repoNode \ "datawarehouse").head)
    } yield Repository(
      id,
      name,
      showDataDictionaryDefinition.getOrElse(false),
      metadata.head,
      dataWarehouse
    )
  }
}
