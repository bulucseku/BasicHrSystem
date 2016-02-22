package com.sentrana.biq.datacontract

/**
 * Information about the drill options that are possible for a report that was recently executed.
 *
 * @constructor
 * @param exptMsg   The message from an exception that was raised during the operation. Not clear what value that has other than for debugging.
 * @param errorCode   The error code of an exception that was raised during the operation. This can be used for generating the custom message.
 * @param opts   A list of options that are possible for this report, given the elements selected on the row.
 */
case class DrillOptions(
  exptMsg:   Option[String],
  errorCode: Option[Int],
  opts:      Seq[DrillOption]
)
