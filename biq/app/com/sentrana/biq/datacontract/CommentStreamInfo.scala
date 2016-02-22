package com.sentrana.biq.datacontract

/**
 * Information about a "stream" of comments, associated with a single report.
 *
 * @constructor
 * @param version   The version of this stream. It changes with each new comment added.
 * @param comments   A list of individual comments.
 */
case class CommentStreamInfo(
  version:  Option[String],
  comments: List[CommentInfo]
)
