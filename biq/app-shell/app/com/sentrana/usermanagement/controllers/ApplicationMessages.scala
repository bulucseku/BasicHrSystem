package com.sentrana.usermanagement.controllers

/**
 * Created by szhao on 2/28/14.
 */
trait ApplicationMessages {
  // Authentication
  val EmptyCredentials = "Empty credentials!"
  val InactiveUser = "Inactive user"
  val InvalidCredentials = "Login information is not correct or user is not active."
  val NotAuthenticated = "The user is not authenticated. Please login."
  val SalesforceCredentialsNotFound = "Salesforce credentials not found."
  val SessionExpired = "User's session expired."

  // Authorization
  val UnauthorizedApplicationAccess = "You have not been given access to this application. Please contact Sentrana."
  val UnauthorizedServiceAccess = "You are not permitted to call this service!"

  // Password reset
  val ChooseAnotherPassword = "Choose a password you haven't previously used with this account."
  val EmptyPassword = "Password cannot be empty."
  val FailedToSendPasswordResetEmail = "Failed to send password reset email."
  val InvalidPasswordFormat =
    """Invalid password. Valid passwords must contain at least eight characters, no spaces, both
      |lowercase and uppercase characters, at least one numeric digit, and at least one special
      |character (any character not 0-9, a-z, A-Z).""".stripMargin.replaceAll("\n", " ")
  val PasswordNotReset = "Password not reset."
  val PasswordResetInvalidSecurityCode = "Incorrect security code"
  val PasswordResetLinkExpired = "Password reset link is no longer valid."
  val PasswordUpdated = "Password updated successfully!"
  val UserEmailNotFound = "Your email address was not recognized. Please try again or contact your administrator."
  val UserIdDoesNotExist = "User with the specified id does not exist."
  val UserNameDoesNotExist = "User with the specified username does not exist."
  val WrongPassword = "Wrong password."

  // User management
  def Duplicate(entityName: String, entityValue: Option[String] = None) =
    s"Duplicate $entityName${entityValue.map{ v => s": $v" }.getOrElse("")}."

  def DuplicateGroup(groupName: String) = Duplicate("group name", Some(groupName))
  def DuplicateGroupType(groupType: String) = Duplicate("group type", Some(groupType))
  def DuplicateOrganization(orgName: String) = Duplicate("organization name", Some(orgName))
  def DuplicateUser(userName: String) = Duplicate("user name", Some(userName))
  def DuplicateUserEmail(userEmail: String) = Duplicate("user email address", Some(userEmail))

  def GroupTypeMissingOrganization = "GroupType must have an organization property"

  def CyclicalGroupReferences = "User Group definition contains cyclical group parent/child references."
  def NoParentGroup = "Group does not have an associated parent group"

  def UserNotFoundWithProperty(property: String, value: String) = s"User not found with $property: $value"

  def IdNotFound(objectName: String, id: String) = s"$objectName not found with id: $id"
  def OrganizationIdNotFound(orgID: String) = IdNotFound("Organization", orgID)
  def RoleIdNotFound(id: String) = IdNotFound("Application Role", id)
  def GroupIdNotFound(groupID: String) = IdNotFound("Group", groupID)
  def GroupTypeIdNotFound(groupTypeId: String) = IdNotFound("Group Type", groupTypeId)

  // Miscellaneous
  val UnknownException = "An unknown error occurred."

  // Data export
  def ExportCSVFailed(cacheId: String) = s"Failed to export to CSV; cacheId = $cacheId"
  def NoDatasetToExport(cacheId: String) = s"No dataset found to export; cacheId=$cacheId"
  def InvalidRequestedContentType(contentType: String) = s"Invalid content type requested: $contentType."
  val InvalidRequestXML = "Invalid XML in request"
}

object ApplicationMessages extends ApplicationMessages
