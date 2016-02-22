package com.sentrana.usermanagement.datacontract

import com.sentrana.appshell.domain.DocumentObject
import com.sentrana.appshell.utils.Enum

/**
 * Main information about the Organization.
 *
 * @constructor
 * @param name   The organization's name.
 * @param status   The organization's status.
 * @param applications   The organization's application list.
 * @param dataFilterInstances   The organization's DataFilterInstances.
 */
case class OrganizationInfoMin(
  name:                String,
  status:              Option[String],
  applications:        List[ApplicationInfo],
  dataFilterInstances: List[DataFilterInstanceInfo]
)

/**
 * Information about an Application. Typically, this is used to display information about an Application.
 *
 * @constructor
 * @param id   The application's id.
 * @param name   The application's name.
 * @param appRoles   The application's role list.
 */
case class ApplicationInfo(
  id:       String,
  name:     String,
  desc:     Option[String],
  url:      Option[String],
  appRoles: List[AppRoleInfo]
) extends DocumentObject

object ApplicationInfo extends DocumentObject {
  override def source = "application"
}

/**
 * Typically, this is used to display information about the organization in the application 'The Kraft Foods Group organization has 20 groups' ".
 *
 * @constructor
 * @param name   The organization's name.
 * @param status   The organization's status.
 * @param applications   The organization's application list.
 * @param dataFilterInstances   The organization's DataFilterInstances.
 * @param id   The organization's id.
 * @param userCount   The organization's total number of users.
 * @param groupCount   The organization's total number of groups.
 * @param roleCount   The organization's total number of roles.
 */
case class OrganizationInfo(
  name:                String,
  status:              Option[String],
  applications:        Option[List[ApplicationInfo]],
  dataFilterInstances: Option[List[DataFilterInstanceInfo]],
  id:                  String,
  userCount:           Option[Int],
  groupCount:          Option[Int],
  roleCount:           Option[Int]
)

/**
 * Information about an GroupType.
 *
 * @constructor
 * @param id   The GroupType's id.
 * @param name   The GroupType's name.
 * @param organization   GroupType's Organization.
 */
case class GroupTypeInfo(
  id:           Option[String],
  name:         String,
  organization: Option[OrganizationInfo]
)

/**
 * Information about an ApplicationRole.
 *
 * @constructor
 * @param id   The ApplicationRole's id.
 * @param name   The ApplicationRole's Name.
 */
case class AppRoleInfo(
  id:   String,
  name: String,
  desc: Option[String] = None
)

/**
 * Information about RoleAssignee
 *
 * @constructor
 * @param assignedGroups   AssignedGroups for a Role.
 * @param assignedUsers   AssignedUsers for a Role.
 */
case class RoleAssignee(
  assignedGroups: List[GroupInfo],
  assignedUsers:  List[UserInfo]
)

/**
 * Information about changing assignees of any role
 *
 * @param organizationId
 * @param roleId
 * @param addedUserIds
 * @param removedUserIds
 * @param addedGroupIds
 * @param removedGroupIds
 */
case class RoleAssigneeUpdate(
  organizationId:  String,
  roleId:          String,
  addedUserIds:    Seq[String],
  removedUserIds:  Seq[String],
  addedGroupIds:   Seq[String],
  removedGroupIds: Seq[String]
)

/**
 * Information about User.
 *
 * @constructor
 * @param firstName   User's FirstName.
 * @param lastName   User's LastName.
 * @param userName   User's login user name.
 * @param email   User's Email.
 * @param activeStatus   User's ActiveStatus.
 * @param organization   User's Organization.
 * @param password   User's login Password.
 * @param appRoles   User's Application Roles.
 * @param dataFilterInstances   User's DataFilterInstances.
 * @param groupMemberships   User's GroupMemberships.
 */
case class UserInfoMin(
  firstName:           Option[String],
  lastName:            Option[String],
  userName:            Option[String],
  email:               String,
  activeStatus:        String,
  organization:        OrganizationInfo,
  password:            Option[String],
  appRoles:            Option[List[AppRoleInfo]],
  dataFilterInstances: Option[List[DataFilterInstanceInfo]],
  groupMemberships:    Option[List[GroupInfo]]
)

/**
 * Information about User.
 *
 * @constructor
 * @param firstName   User's FirstName.
 * @param lastName   User's LastName.
 * @param userName   User's login user name.
 * @param email   User's Email.
 * @param orgName   User's Organization name.
 * @param appRoles   User's Application Roles.
 * @param dataFilterInstances   User's DataFilterInstances.
 * @param groupMemberships   User's GroupMemberships.
 */
case class UserInfo(
  firstName:           String,
  lastName:            String,
  userName:            String,
  password:            Option[String],
  email:               String,
  activeStatus:        Option[String],
  organization:        OrganizationInfo,
  orgName:             String,
  appRoles:            Option[List[AppRoleInfo]],
  dataFilterInstances: Option[List[DataFilterInstanceInfo]],
  groupMemberships:    Option[List[GroupInfo]],
  groupIds:            Option[Seq[String]],
  id:                  String,
  loginFailureCount:   Int
)

/**
 * Information about an UserSearchKeys.
 *
 * @constructor
 * @param lastName   The UserSearchKeys's LastName.
 * @param userName   The UserSearchKeys's UserName.
 * @param organizationId   The UserSearchKeys's UserName.
 * @param activeStatus   The UserSearchKeys's ActiveStatus.
 * @param memberOf   The UserSearchKeys's MemberOf
 * @param withSubgroups   he UserSearchKeys's WithSubgroups
 * @param userRoles   The UserSearchKeys's UserRoles.
 * @param isInverted   The UserSearchKeys's IsInverted.
 * @param iDisplayStart   Display startIndex in dataTable
 * @param iDisplayLength   Display records in dataTable
 * @param sColumns   Sort columns in table
 * @param sSearch   SearchText in dataTable
 * @param aaSorting   Sorting Columns and direction in dataTable
 * @param reloadOrganization   Is Change organization?
 */
case class UserSearchKeys(
  lastName:           Option[String],
  userName:           Option[String],
  organizationId:     String,
  activeStatus:       String,
  memberOf:           Option[List[String]],
  withSubgroups:      Boolean,
  userRoles:          Option[List[String]],
  isInverted:         Boolean,
  iDisplayStart:      Int,
  iDisplayLength:     Int,
  sColumns:           String,
  sSearch:            String,
  aaSorting:          List[List[String]],
  reloadOrganization: Option[Boolean]
)

/**
 * User Search Result
 *
 * @constructor
 * @param searchUsers   User List
 * @param totalRecords   Total count of records
 * @param displayRecords   Total count of records to be displayed
 */
case class UserSearchResult(
  searchUsers:    List[UserInfo],
  totalRecords:   Int,
  displayRecords: Int
)

/**
 * UserGroup Search Result
 *
 * @constructor
 * @param searchGroups   Group list
 * @param totalRecords   Total count of records
 * @param displayRecords   Total count of records to be displayed
 */
case class UserGroupSearchResult(
  searchGroups:   List[SearchedGroupInfo],
  totalRecords:   Int,
  displayRecords: Int
)

case class GroupInfoSearchResult(
  searchGroups:   List[SearchedGroupInfoNew],
  totalRecords:   Int,
  displayRecords: Int
)

/**
 * User Search Result   UserGroup Search Result   Information about a GroupInfoMin. Client passes group information during creating a group
 *
 * @constructor
 * @param name   The Group's Name.
 * @param organization   The Group's OrganizationId.
 * @param parentGroup   The Group's ParentGroup
 * @param groupType   The Group's GroupType
 * @param groupPath   The Group's path.
 */
case class GroupInfoMin(
  name:         String,
  organization: OrganizationInfo,
  parentGroup:  GroupInfo,
  groupType:    GroupTypeInfo,
  groupPath:    String
)

/**
 * Information about a GroupInfo. Server returns this object after creating a new group
 *
 * @constructor
 * @param name   The Group's Name.
 * @param organization   The Group's OrganizationId.
 * @param parentGroup   The Group's ParentGroup
 * @param groupType   The Group's GroupType
 * @param groupPath   The Group's path.
 * @param appRoles   The Group's AppRoles
 * @param dataFilterInstances   The Group's DataFilterInstances
 * @param childGroups   The Group's ChildGroups.
 * @param users   The Group's ChildGroups.
 */
case class GroupDetail(
  name:                String,
  organization:        Option[OrganizationInfo],
  parentGroup:         Option[GroupInfo],
  groupType:           Option[GroupTypeInfo],
  groupPath:           Option[String],
  appRoles:            Option[List[AppRoleInfo]],
  dataFilterInstances: Option[List[DataFilterInstanceInfo]],
  childGroups:         Option[List[GroupInfo]],
  users:               Option[List[UserInfo]]
)

/**
 * Information about a GroupInfo. Server returns this object after creating a new group
 *
 * @constructor
 * @param name   The Group's Name.
 * @param organization   The Group's OrganizationId.
 * @param parentGroup   The Group's ParentGroup
 * @param groupType   The Group's GroupType
 * @param groupPath   The Group's path.
 * @param appRoles   The Group's AppRoles
 * @param dataFilterInstances   The Group's DataFilterInstances
 * @param childGroups   The Group's ChildGroups.
 * @param users   The Group's ChildGroups.
 * @param id   The Group's id.
 */
case class GroupInfo(
  name:                String                               = "",
  organization:        Option[OrganizationInfo]             = None,
  parentGroup:         Option[GroupInfo]                    = None,
  groupType:           Option[GroupTypeInfo]                = None,
  groupPath:           Option[String]                       = None,
  appRoles:            Option[List[AppRoleInfo]]            = None,
  dataFilterInstances: Option[List[DataFilterInstanceInfo]] = None,
  childGroups:         Option[List[GroupInfo]]              = None,
  users:               Option[List[UserInfo]]               = None,
  id:                  String                               = ""
) extends DocumentObject

object GroupInfo extends DocumentObject {
  override val source = "group"
}

/**
 * This represents hierarchy of groups(as a tree) in an organization
 *
 * @constructor
 * @param name   The Group's Name.
 * @param parentGroup   The Group's ParentGroup
 * @param groupType   The Group's GroupType
 * @param groupPath   The Group's path.
 * @param id   The Group's Id.
 * @param childGroups   The Group's ChildGroups.
 */
case class OrganizationGroup(
  name:        String,
  parentGroup: Option[GroupInfo],
  groupType:   GroupTypeInfo,
  groupPath:   String,
  id:          String,
  childGroups: List[OrganizationGroup]
)

/**
 * Information about SearchedGroupInfo. It presents group information after searching on.
 *
 * @constructor
 * @param id   The Group's id.
 * @param memberCount   The Group's Totla Number of Member.
 * @param containedUser   The Group's Total Number of User.
 * @param parentHierarchy   The Group's Parent Hierarchy.
 * @param name   The Group's Name.
 * @param organization   The Group's OrganizationId.
 * @param parentGroup   The Group's ParentGroup
 * @param groupType   The Group's GroupType
 * @param groupPath   The Group's path.
 * @param appRoles   The Group's AppRoles
 * @param dataFilterInstances   The Group's DataFilterInstances
 * @param childGroups   The Group's ChildGroups.
 * @param users   The Group's ChildGroups.
 */
case class SearchedGroupInfo(
  id:                  String,
  memberCount:         Int,
  containedUser:       Int,
  parentHierarchy:     String,
  name:                String,
  organization:        OrganizationInfo,
  parentGroup:         GroupInfo,
  groupType:           GroupTypeInfo,
  groupPath:           String,
  appRoles:            Option[List[AppRoleInfo]],
  dataFilterInstances: Option[List[DataFilterInstanceInfo]],
  childGroups:         Option[List[GroupInfo]],
  users:               Option[List[UserInfo]]
)

case class SearchedGroupInfoNew(
  id:                  Int,
  memberCount:         Int,
  containedUser:       Int,
  parentHierarchy:     String,
  name:                String,
  organization:        Option[OrganizationInfo],
  parentGroup:         Option[GroupInfo],
  groupType:           Option[GroupTypeInfo],
  groupPath:           String,
  appRoles:            Option[List[AppRoleInfo]],
  dataFilterInstances: Option[List[DataFilterInstanceInfo]],
  childGroups:         Option[List[GroupInfo]],
  users:               Option[List[UserInfo]]
)

/**
 * Information about an GroupSearchKeys. These are the key parameters based on those group is searched
 *
 * @constructor
 * @param groupName   GroupSearchKeys's GroupName.
 * @param organizationId   The UserSearchKeys's UserName.
 * @param groupTypeId   GroupSearchKeys's GroupTypeId.
 * @param memberOf   GroupSearchKeys's Groups(List of group id)
 * @param withSubgroups   GroupSearchKeys's WithSubgroups.
 * @param groupRoles   GroupSearchKeys's Roles(List of role id)
 * @param isInverted   GroupSearchKeys's IsInverted.
 * @param iDisplayStart   Display startIndex in dataTable
 * @param iDisplayLength   Display records in dataTable
 * @param sColumns   Sort columns in table
 * @param sSearch   SearchText in dataTable
 * @param aaSorting   Sorting Columns and direction in dataTable
 * @param reloadOrganization   Is Change organization?
 */
case class GroupSearchKeys(
  groupName:          Option[String],
  organizationId:     String,
  groupTypeId:        Option[String],
  memberOf:           Option[List[String]],
  withSubgroups:      Boolean,
  groupRoles:         Option[List[String]],
  isInverted:         Boolean,
  iDisplayStart:      Int,
  iDisplayLength:     Int,
  sColumns:           String,
  sSearch:            String,
  aaSorting:          List[List[String]],
  reloadOrganization: Option[Boolean]
)

/**
 * Information about an DataFilter.
 *
 * @constructor
 * @param filterId   The DataFilter's FilterId.
 * @param fieldId  The DataFilter's FieldId.
 * @param fieldDesc   The DataFilter's FieldDesc.
 * @param dataType   The DataFilter's DataType.
 * @param displayName   The DataFilter's DisplayName.
 * @param repositoryConnectionName   The DataFilter's RepositoryConnectionName.
 * @param repositoryType The type of repository. mongo or sql.
 * @param allowableValuesQuery   The DataFilter's AllowableValuesQuery.
 * @param showValueOnly The DataFilter's ShowValueOnly.
 */
case class DataFilterInfo(
  filterId:                 String,
  fieldId:                  String,
  fieldDesc:                String,
  dataType:                 String,
  displayName:              Option[String],
  repositoryConnectionName: String,
  repositoryType:           Option[String],
  allowableValuesQuery:     String,
  collectionName:           Option[String],
  showValueOnly:            Boolean,
  organizationId:           Option[String]
) extends DocumentObject

object DataFilterInfo extends DocumentObject {
  override val source = "dataFilter"
}

/**
 * Information about an DataFilterInstance.
 *
 * @constructor
 * @param id   The DataFilterInstance's id.
 * @param operator   The DataFilterInstance's Operator.
 * @param value   The DataFilterInstance's Value.
 * @param valueText   The DataFilterInstance's Text corresponding to its Value .
 * @param dataFilter   DataFilter object
 * @param optionType   The OptionType of filterValue.
 */
case class DataFilterInstanceInfo(
  id:         String,
  operator:   String,
  value:      String,
  valueText:  Option[String],
  dataFilter: DataFilterInfo,
  optionType: Option[Int]
)

/**
 * Information about an DataFilter Users.
 *
 * @constructor
 * @param users   The DataFilter uses Users.
 * @param groups   The DataFilter uses Groups.
 * @param organizations   The DataFilter uses Organization.
 */
case class DataFilterUsesObject(
  users:         List[UserInfo],
  groups:        List[GroupInfo],
  organizations: List[OrganizationInfo]
)

/**
 * Information about the user's session. Contains an opaque ID that can be used to identify the session along with user  information, a list of available data warehouses ("repositories") and other information.
 *
 * @constructor
 * @param sessionId   An opaque identifier for this session.
 * @param userInfo   Information about the logged on user, including first name, last name and other descriptive fields.
 * @param organization
 * @param isUnrestrictedAdmin
 */
case class SessionInfo(
  sessionId:           String,
  userInfo:            UserInfo,
  organization:        OrganizationInfo,
  isUnrestrictedAdmin: Boolean
) extends BaseSessionInfo

abstract class BaseSessionInfo() {
  val sessionId: String
}

/**
 * Simple object to represent key value pair
 * @param key pair key
 * @param value pair value
 */
case class KeyValuePair(
  key:   String,
  value: String
)

/**
 * This case class is used when the user knows the current password and wants to change it.
 * @param userName
 * @param currentPassword
 * @param newPassword
 * @param isExpired
 */
case class ChangePassword(
  userName:        String,
  currentPassword: String,
  newPassword:     String,
  isExpired:       Option[Boolean]
)

/**
 * This case class when the user doesn't remember existing password and want to reset it.
 * @param token
 * @param securityCode
 * @param newPassword
 */
case class ChangeAutoGeneratedPassword(
  token:        String,
  securityCode: String,
  newPassword:  String
)

case class BulkOperation(
  organizationId: String,
  entityIds:      Seq[String],
  updatedIds:     Option[Seq[String]]
)

object ServiceErrorCode extends Enum {
  type ServiceErrorCode = Value
  // ChangePassword
  val WRONG_PASSWORD, PREVIOUSLY_USED_PASSWORD, PASSWORD_CANNOT_BE_EMPTY, PASSWORD_FORMAT_IS_INVALID, PASSWORD_POLICY_VIOLATED, USER_NOT_FOUND, PASSWORD_RESET_INVALID_SECURITY_CODE, PASSWORD_RESET_LINK_EXPIRED = Value

  // Access
  val UNAUTHORIZED_APPLICATION_ACCESS, UNAUTHORIZED_SERVICE_ACCESS, SALESFORCE_CREDENTIALS_NOT_FOUND = Value

  // ExportService
  val INVALID_REQUESTED_CONTENT_TYPE = Value

  // TODO Following error code are for BIQ application
  // We will move them to BIQ Scala application later
  // GetRepository
  val REPOSITORY_RETRIEVE_FAILED = Value
  // Saved report
  val UNKNOWN_ERROR, REPORT_NAME_IN_USE, BOOKLET_NAME_IN_USE, DERIVED_COLUMN_NAME_IN_USE, INCORRECT_EMAIL = Value
  // Login
  val INVALID_CREDENTIALS, INVALID_SESSION, PASSWORD_EXPIRED = Value
  // Drill down
  val NO_DATA_RETURNED, KEY_NOT_FOUND, ELEMENT_NOT_FOUND, UNABLE_TO_DRILL_DOWN, SERVICE_ERROR_OCCURRED = Value

  // TODO Error codes for UM Application.
  // createDataFilter
  val DUPLICATE_DATA_FILTER = Value
  // getGroup
  val GROUP_RETRIEVE_FAILED, GROUP_NAME_IN_USE, CIRCULAR_GROUP_REFERENCES = Value
  //groupType
  val GROUP_TYPE_NAME_IN_USE = Value
  //organization
  val ORGANIZATION_NAME_IN_USE = Value
  // user
  val USER_NAME_IN_USE, USER_EMAIL_IN_USE = Value

  // Saved Filter Group
  val SAVED_FILTER_GROUP_NAME_IN_USE, NO_SAVED_FILTER_GROUP_FOUND = Value

}

object EnumApplicationRoles extends Enum {
  type EnumApplicationRoles = Value
  val UNRESTRICTED_USER_ADMIN, RESTRICTED_USER_ADMIN, BIQ_ADMIN, DASHBOARD_ADMIN, BIQ_USER, DASHBOARD_USER = Value
}
