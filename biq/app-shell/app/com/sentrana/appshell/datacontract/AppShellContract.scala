package com.sentrana.appshell.datacontract

/**
 * Information about User.
 *
 * @constructor
 * @param firstName   User's FirstName.
 * @param lastName   User's LastName.
 * @param userName   User's login user name.
 * @param email   User's Email.
 * @param companyName   User's ActiveStatus.
 * @param userID   User's Id.
 */
case class UserInfo(
  val firstName:   String,
  val lastName:    String,
  val userName:    String,
  val email:       Option[String],
  val companyName: String,
  val userID:      String
)

/**
 * Information about the user's session. Contains an opaque ID that can be used to identify the session along with user  information, a list of available data warehouses ("repositories") and other information.
 *
 * @constructor
 * @param sessionId   An opaque identifier for this session.
 * @param userInfo   Information about the logged on user, including first name, last name and other descriptive fields.
 * @param sessionTimeOutSeconds After how many seconds the session will timeout.
 */
case class SessionInfo(
  val sessionId:             String,
  val userInfo:              UserInfo,
  val sessionTimeOutSeconds: Int
)
