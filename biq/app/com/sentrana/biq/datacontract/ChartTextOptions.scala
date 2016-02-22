package com.sentrana.biq.datacontract

/**
 * The composite object which contains text information on the chart.
 *
 * @constructor
 * @param chartTitle   The title of the chart.
 * @param chartSubtitle   The subtitle of the chart.
 * @param chartXAxisLabel   The X axis label name.
 * @param chartYAxisLabel   The Y axis label name.
 * @param chartXLabelRotation   The rotation degree of the X axis label.
 */
case class ChartTextOptions(
  chartTitle:          String,
  chartSubtitle:       String,
  chartXAxisLabel:     String,
  chartYAxisLabel:     String,
  chartXLabelRotation: Option[Int]
)
