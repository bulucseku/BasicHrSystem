package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject
import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.XmlUtils._

import scala.util.Try
import scala.xml.Node

/**
 * Created by ba on 3/11/2015.
 */

/**
 * Information about a given metric and dimension mapping to restrict the selection of wrong column.
 *
 * @constructor
 * @param groupId   Id of a metric group.
 * @param groupName name of a metric group.
 * @param groupDesc description of a metric group.
 * @param dimensions dimensions related to this metric group.
 * @param repositoryId applicable repository id for the mapping
 */
case class MetricDimensionMappingInfo(
  groupId:      String,
  groupName:    String,
  groupDesc:    String,
  dimensions:   Seq[DimensionForMappingInfo],
  repositoryId: String
)

object MetricDimensionMappingInfo {

  implicit def fromXml(repoId: String)(node: Node): Try[MetricDimensionMappingInfo] = {
    for {
      groupId <- (node \ "@id").textRequired
      groupName <- (node \ "@name").textRequired
      dimensions <- parseSeq[DimensionForMappingInfo](node \ "dimension")
    } yield MetricDimensionMappingInfo(groupId, groupName, "", dimensions, repoId)
  }
}

/**
 * Information about a given dimension for mapping Info.
 *
 * @constructor
 * @param name name of a dimension.
 * @param attributes included or excluded attributes .
 */
case class DimensionForMappingInfo(
  name:       String,
  attributes: Option[Seq[AttributesForMappingInfo]]
)

object DimensionForMappingInfo {

  implicit def fromXml(node: Node): Try[DimensionForMappingInfo] = {
    for {
      name <- (node \ "@name").textRequired
      attributes <- parseSeq[AttributesForMappingInfo](node \ "attribute")
    } yield DimensionForMappingInfo(name, Some(attributes))
  }
}

/**
 * Information about a given attribute for mapping Info.
 *
 * @constructor
 * @param id of a attribute.
 * @param operation included or excluded value.
 */
case class AttributesForMappingInfo(
  id:        String,
  operation: String
)

object AttributesForMappingInfo {
  implicit def fromXml(node: Node): Try[AttributesForMappingInfo] = {
    for {
      id <- (node \ "@id").textRequired
      operation <- (node \ "@operation").textRequired
    } yield AttributesForMappingInfo(id, operation)
  }
}

