package com.sentrana.biq.datacontract

import com.sentrana.biq.core.conceptual.AggregationOperation

/**
 * Information about a given data warehouse repository. Include the textual name, ID, supported features, list of metrics and dimensions.
 *
 * @constructor
 * @param name   A textual name of the data warehouse for the user.
 * @param oid   An identifier to uniquely identify the data warehouse.
 * @param showDataDictionaryDefinition   An identifier to uniquely identify the data warehouse.
 * @param supportedFeatures   A set of features that are accessible in this data warehouse.
 * @param metricGroups   A list of metric group that are found in the data warehouse.
 * @param dimensions   A list of dimensions that are found in this data warehouse.
 * @param derivedColumns   List of available derived columns of the user
 * @param datafilters   List of available datafilters of the user
 * @param totalReport   Total no of Report in the repository
 * @param totalBooklet   Total no of Booklet in the repository
 * @param aggregateFunctions   Aggregate Functions id,name pair
 * @param metricDimensionMapping Metric and Dimension Mappings to restrict the selection of wrong column
 */
case class MetadataObjectRepository(
  name:                         String,
  oid:                          String,
  showDataDictionaryDefinition: Boolean,
  supportedFeatures:            MetadataObjectRepositorySupportedFeatures,
  metricGroups:                 Seq[MetadataMetricGroups],
  dimensions:                   Seq[MetadataDimension],
  derivedColumns:               Seq[DerivedColumnInfo],
  savedFilterGroups:            Seq[SavedFilterGroupInfo],
  datafilters:                  Seq[DataFilterInfo],
  totalReport:                  Int,
  totalBooklet:                 Int,
  aggregateFunctions:           Seq[AggregationOperation],
  metricDimensionMapping:       Seq[MetricDimensionMappingInfo]
)
