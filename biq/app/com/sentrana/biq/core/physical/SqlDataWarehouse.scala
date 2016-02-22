package com.sentrana.biq.core.physical

import com.sentrana.appshell.data.DataType._
import com.sentrana.appshell.data.ResultCell
import com.sentrana.biq.core._
import com.sentrana.biq.core.conceptual._
import com.sentrana.biq.metadata.{ AttributeElementCacheInfo, AttributeFormCacheInfo, Connection, MetadataCache }
import org.joda.time.DateTime
import play.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
 * Created by william.hogben on 1/15/2015.
 */
abstract class SqlDataWarehouse(
    override val repositoryId: String,
    val tables:                Traversable[Table],
    val configuration:         Map[String, String],
    val connection:            Connection
) extends DataWarehouse {

  val connectionName = repositoryId

  val segments = allTables.flatMap(_.columns).collect { case s: Segment => s }

  def allTables: Traversable[Table] = tables ++ tables.flatMap(_.allChildTables)

  def getQueryGenerator(report: Report): QueryGenerator

  def getDbType(column: Column): DataType = {
    val queryText = s"SELECT TOP 0 ${column.queryAlias} FROM ${column.parent(this).databaseId} AS ${column.parent.queryAlias}"
    val query = new SqlQuery(repositoryId, null, StatementPart(queryText))
    val result = query.executeRaw
    val dataType = result.colInfos(0).dataType.get
    if (dataType == STRING || dataType == DATETIME) STRING else NUMBER
  }

  def getIntConfigurationValue(key: String): Option[Int] = {
    configuration.get(key) match {
      case Some(str) =>
        if (str.forall(s => s.isDigit))
          Some(str.toInt)
        else None
      case None => None
    }
  }

  def queryForElements(attributeForm: AttributeForm): Traversable[AttributeElement] = {
    val cached = trySegmentValuesFromCache(attributeForm)
    val segmentValues = if (cached.nonEmpty)
      cached.map { case (parentElementId, segmentValue) => segmentValue }
    else {
      getSegmentValues(attributeForm)
    }
    val elements = attachSegmentValues(attributeForm, segmentValues)
    if (cached.isEmpty && MetadataCache.useCache && attributeForm.storeInCache)
      MetadataCache().saveToCache(prepareForCache(attributeForm, segmentValues.map(sv => None -> sv)))
    elements
  }

  private def getSegmentValues(attributeForm: AttributeForm): Traversable[SegmentValue] = {
    val mockReport = new Report(
      List(new TemplateUnit(attributeForm, new SortUnit(1, SortOrder.ASC))),
      Nil
    )
    val results = getQueryGenerator(mockReport).buildQuery.execute

    //filter out null values
    val cells = {
      val cells = results.rows.map(_.cells.head).filter(_.rawValue.toString.trim != "")
      if (!cells.exists(_.fmtValue == attributeForm.defaultValue.getOrElse(""))) {
        val defaultVal = attributeForm.defaultValue
        cells ++ List(new ResultCell(defaultVal.getOrElse("NULL"), defaultVal.getOrElse(""), false))
      }
      else cells
    }

    cells.map { cell =>
      new SegmentValue(
        cell.rawValue.toString.trim,
        AttributeElement(createAttributeElementId(attributeForm, cell.fmtValue.trim), cell.fmtValue.trim)
      )
    }
  }

  /**
   * Gets a list containing a tuple with the id of the parent element and the corresponding segment value
   * like:
   * parentElementId -> SegmentValue(rawValue, childElement)
   *
   * @param attributeForm The attribute form to retrieve from the cache.
   * @return
   */
  private def trySegmentValuesFromCache(attributeForm: AttributeForm): Traversable[(Option[String], SegmentValue)] = {
    if (MetadataCache.useCache && attributeForm.storeInCache) {
      val cache = MetadataCache()
      val elements = cache.loadFromCache(attributeForm.id, this.repositoryId)
      val ancestorForm = attributeForm.ancestorForm
      elements.map {
        element =>
          element.parentElementId -> new SegmentValue(
            element.rawValue,
            AttributeElement(
              createAttributeElementId(attributeForm, element.value),
              element.value,
              Nil,
              ancestorForm
            )
          )
      }
    }
    else Seq()
  }

  private def attachSegmentValues(
    attributeForm: AttributeForm,
    segmentValues: Traversable[SegmentValue]
  ): Traversable[AttributeElement] = {
    val matchingSegments = segments.filter(_.attributeForm == attributeForm)
    matchingSegments.foreach(_.setSegmentValues(segmentValues))
    Logger.debug(
      "Found " + segmentValues.size + " AttributeElements for attribute: "
        + attributeForm.id
    )
    val attributeElements = segmentValues.map(_.attributeElement)
    attributeForm.setAttributeElements(attributeElements)

    attributeElements
  }

  /**
   * This function returns the a future with the list of attribute elements. When the function returns
   * the future, the given attributeForm will have its elements loaded but the child attribute forms are not guaranteed
   * to be loaded until the Future resolves.
   *
   * @param ancestorForm
   * @return
   */
  def queryForTreeElements(ancestorForm: AttributeForm): Future[Traversable[AttributeElement]] = {
    //assign elements for ancestor form
    val elements = queryForElements(ancestorForm)
    elements.foreach(_.ancestorForm = ancestorForm.ancestorForm)

    // asynchronously populate the rest of the tree
    Future {
      if (ancestorForm.childForm.nonEmpty)
        queryForChildElements(
          ancestorForm,
          ancestorForm.childForm.get,
          ancestorForm.ancestorForm.get
        )
      elements
    }
  }

  private def queryForChildElements(
    parentForm:   AttributeForm,
    childForm:    AttributeForm,
    ancestorForm: AttributeForm
  ): Unit = {
    val cached = trySegmentValuesFromCache(childForm)
    val parentIdToChildSegments = if (cached.nonEmpty)
      cached
    else {
      getTreeSegmentValues(childForm, parentForm, ancestorForm)
    }

    // The tree segment values can have duplicates as a child element can have more than one parent
    val distinctSegmentsMap = parentIdToChildSegments.map(_._2).groupBy(_.attributeElement.id)
    attachSegmentValues(childForm, distinctSegmentsMap.map(_._2.head))
    val elementParentMapping = parentIdToChildSegments.collect {
      case (Some(parentId), segmentValue) => parentId -> distinctSegmentsMap(segmentValue.attributeElement.id).head
    }.groupBy(_._1).map { case (parentId, pairList) => parentId -> pairList.map(_._2.attributeElement) }

    attachChildElements(parentForm, elementParentMapping)

    if (cached.isEmpty && MetadataCache.useCache && childForm.storeInCache)
      MetadataCache().saveToCache(prepareForCache(childForm, parentIdToChildSegments))
    if (childForm.childForm.nonEmpty)
      queryForChildElements(childForm, childForm.childForm.get, ancestorForm)
  }

  /**
   * Create the cache object for the metadata cache.
   *
   * @param attributeForm
   * @param segmentValues A list containing a tuple with the parentElementId and the corresponding segment value
   *                      like (parentElementId -> segmentValue(rawValue, childElement)
   * @return
   */
  private def prepareForCache(
    attributeForm: AttributeForm,
    segmentValues: Traversable[(Option[String], SegmentValue)]
  ): AttributeFormCacheInfo = {
    AttributeFormCacheInfo(
      attributeForm.id,
      segmentValues.map {
      case (parentId, sv) =>
        AttributeElementCacheInfo(
          sv.attributeElement.value,
          sv.value,
          parentId
        )
    }.toSeq,
      this.repositoryId,
      DateTime.now().getMillis
    )
  }

  private def getTreeSegmentValues(
    childForm:    AttributeForm,
    parentForm:   AttributeForm,
    ancestorForm: AttributeForm
  ): Traversable[(Option[String], SegmentValue)] = {

    // get query results
    val mockReport = new Report(
      List(
        new TemplateUnit(parentForm, new SortUnit(1, SortOrder.ASC)),
        new TemplateUnit(childForm, new SortUnit(1, SortOrder.ASC))
      ),
      Nil
    )
    val cells = getQueryGenerator(mockReport).buildQuery.execute.rows collect {
      case row if row.cells(1).rawValue.toString.trim != "" && row.cells.head.rawValue.toString.trim != "" =>
        row.cells.head -> row.cells(1)
    }

    // attach children to parents
    val segmentValues = cells.map {
      case (parentCell, childCell) =>
        Some(createAttributeElementId(parentForm, parentCell.fmtValue.trim)) -> new SegmentValue(
          childCell.rawValue.toString.trim,
          AttributeElement(
            createAttributeElementId(childForm, childCell.fmtValue.trim),
            childCell.fmtValue.trim, Nil, Some(ancestorForm)
          )
        )
    }

    // Add the default value to the results array if it is not present
    val defaultExists = segmentValues.exists {
      sv => sv._2.attributeElement.value == childForm.defaultValue.getOrElse("")
    }
    val defaultSegmentValue = if (!defaultExists) {
      val default = childForm.defaultValue
      val sv = None -> new SegmentValue(
        default.getOrElse(""),
        AttributeElement(
          createAttributeElementId(childForm, default.getOrElse("NULL")),
          default.getOrElse("NULL"), Nil, Some(ancestorForm)
        )
      )
      List(sv)
    }
    else Nil

    segmentValues ++ defaultSegmentValue
  }

  /**
   * Attaches all child cells to the parent attributeForm AttributeElement
   * with the given formatValue. Returns the new element to attach to the
   *
   * @param parentForm
   * @param parentMapping
   * @return
   */
  private def attachChildElements(
    parentForm:    AttributeForm,
    parentMapping: Map[String, Traversable[AttributeElement]]
  ): Unit = {
    parentMapping.foreach {
      case (parentElementId, childElements) =>
        val parentElement = parentForm.elementsById.getOrElse(
          parentElementId,
          throw new Exception("Parent Element not found with id: " + parentElementId)
        )
        parentElement.childElements = childElements
        childElements.foreach(_.parentElement = Some(parentElement))
    }
  }

  private def createAttributeElementId(attributeForm: AttributeForm, value: String): String = {
    attributeForm.id + ":" + value
  }

  def analyze(): Unit = {
    allTables.foreach(table => table.size = getSize(table))
  }

  def getSize(table: Table): Int = {
    val queryText = "SELECT COUNT(*) FROM " + table.databaseId
    val result = new SqlQuery(repositoryId, null, StatementPart(queryText)).executeRaw

    result.rows.head.cells.head.fmtValue.toInt
  }
}

