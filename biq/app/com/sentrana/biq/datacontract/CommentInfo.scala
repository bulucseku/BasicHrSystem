package com.sentrana.biq.datacontract

/**
 * The comment information created by user.
 *
 * @constructor
 * @param userName   The name of the user who created the comment.
 * @param date   The date when the comment was created.
 * @param msg   The comment text content.
 * @param cid   The identifier of comment message.
 * @param editable   The identifier of user added the comment message.
 */
case class CommentInfo(
  userName: Option[String],
  userId:   Option[String],
  date:     Option[Long],
  msg:      String,
  cid:      Option[String],
  editable: Option[Boolean]
)
