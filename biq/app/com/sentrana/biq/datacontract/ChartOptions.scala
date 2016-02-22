package com.sentrana.biq.datacontract

/**
 * This ChartOptions DataContract is to restore a chart that has been persisted in database.
 *
 * @constructor
 * @param chartType   The type of chart could be line, pie, column, bar, stacked column, stacked bar.
 * @param chartTextOptions   A composite object which contains text information on the chart.
 * @param chartCollapseItemName   The category name for the collapsed item on the chart.
 * @param chartCollapseRowLimit   After how many rows we should start the collapsing.
 * @param chartLegendAttrColumnName   The name of selected attribute used for legend, only applicable to scatter and bubble chart at the moment.
 * @param chartCollapseTail   Flag that determines whether we are going to collapse the chart.
 * @param chartAutoSegmentation   Flag that dtermins whether the application is going to create a segmented chart for you automatically. This option will be valid when you are creating a report containing one metric and more than one attribute.  If this option is checked, the application will automatically create a segmented chart based on the report you have defined.  The basic idea is pivoting on one of the attribute columns. For each of the distinct values under that attribute, a pivoted series will be created.
 * @param chartSegAttrColumnName   The name of selected attribute used for segmentation.
 * @param chartAttrColumnNames   The list of the names of all the attributes available in the dataset.
 * @param chartSegMetricColumnName   The name of selected metric used for segmentation.
 * @param chartMetricColumnNames   The list of the names of all the metrics available in the dataset.
 * @param startPos   The start position of the row range that will be used to determine which rows will be used to generate the chart.
 * @param endPos   The end position of the row range that will be used to determine which rows will be used to generate the chart.
 */
case class ChartOptions(
  chartType:                 String,
  chartTextOptions:          ChartTextOptions,
  chartCollapseItemName:     String,
  chartCollapseRowLimit:     Int,
  chartLegendAttrColumnName: String,
  chartCollapseTail:         Boolean,
  chartAutoSegmentation:     Boolean,
  chartSegAttrColumnName:    String,
  chartAttrColumnNames:      Seq[String],
  chartSegMetricColumnName:  String,
  chartMetricColumnNames:    Seq[String],
  startPos:                  Int,
  endPos:                    Int
)
