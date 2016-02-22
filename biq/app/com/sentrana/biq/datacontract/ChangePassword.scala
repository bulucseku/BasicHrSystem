package com.sentrana.biq.datacontract

/**
 * The json object the client sends to the server.
 *
 * @constructor
 * @param userName   The logged on user's user name.
 * @param currentPassword   The current password for this user.
 * @param newPassword   The updated new password for this user.
 * @param isExpired   Wheter current password has expired or not
 */
case class ChangePassword(
  userName:        String,
  currentPassword: String,
  newPassword:     String,
  isExpired:       Boolean
)
