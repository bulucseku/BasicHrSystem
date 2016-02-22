package com.sentrana.biq.datacontract

import com.sentrana.usermanagement.datacontract.{ BaseSessionInfo, UserInfo }

/**
 * Information about the user's session. Contains an opaque ID that can be used to identify the session along with user  information, a list of available data warehouses ("repositories") and other information.
 *
 * @constructor
 * @param sessionId   An opaque identifier for this session.
 * @param userInfo   Information about the logged on user, including first name, last name and other descriptive fields.
 * @param categoryList   This is an unfortunate artifact of the CatMan heritage. This returns a list of element IDs that represent the categories this user has access to. <STRONG>We need to find a better way to pass this information in  a DW-agnostic manner.<STRONG>
 * @param repositories   This is a list of available data warehouses that the user may select from.
 * @param jsonRepositoryNames    This list of json repository names is temporary. It exist as a proof of concept that the data serialization  works properly.
 * @param debugMode   This boolean property indicates whether the logged on user can see diagnostic information, such as  generated SQL statements and timing information.
 */

case class BIQSessionInfo(
  sessionId:           String,
  userInfo:            UserInfo,
  categoryList:        Seq[Int],
  repositories:        Seq[UserRepository],
  jsonRepositoryNames: Seq[String],
  debugMode:           Boolean
) extends BaseSessionInfo

case class UserRepository(oid: String, name: String)
