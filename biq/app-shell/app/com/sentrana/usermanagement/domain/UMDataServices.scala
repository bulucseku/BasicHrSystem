package com.sentrana.usermanagement.domain

/**
 * Created by szhao on 1/23/14.
 */

import org.squeryl.{ Query, KeyedEntity, Schema }
import org.squeryl.PrimitiveTypeMode._
import org.squeryl.annotations.Column
import org.squeryl.dsl.{ StatefulManyToOne, StatefulOneToMany, CompositeKey2, ManyToOne }
import java.sql.Timestamp
import scala.util.matching.Regex
import java.util.Date

// Tables
case class User(
    @Column("user_id") val id:                             Int,
    @Column("user_version") var userVersion:               Int,
    @Column("user_name") val userName:                     String,
    @Column("user_pwd") var password:                      String,
    @Column("user_email") var userEmail:                   Option[String],
    @Column("first_name") var firstName:                   String,
    @Column("last_name") var lastName:                     String,
    @Column("status") var status:                          Option[String],
    @Column("create_date") val createDate:                 Timestamp       = new Timestamp(System.currentTimeMillis),
    @Column("login_failure_count") var loginFailureCount:  Int,
    @Column("login_success_count") var loginSuccessCount:  Int,
    @Column("org_id") var orgId:                           Int,
    @Column("is_deleted") var isDeleted:                   Option[Boolean],
    @Column("last_pwd_change_date") var lastPwdChangeDate: Date            = new Date()
) extends KeyedEntity[Int] {

  // TODO It seems adding a new constructor creates some problem for Squeryl.
  //  def this(userName: String) = this(0, 0, userName, null, null, null, null, Some(null),
  //        null, 0, 0, 0, Some(false))

  lazy val loginRecords: StatefulOneToMany[UserLoginRecord] = UMDataServices.userToLoginRecords.leftStateful(this)
  lazy val userComments: StatefulOneToMany[UserComment] = UMDataServices.userToUserComments.leftStateful(this)
  lazy val userAppSessions: StatefulOneToMany[UserAppSession] = UMDataServices.userToUserAppSessions.leftStateful(this)

  lazy val modules = UMDataServices.userModules.leftStateful(this)
  lazy val userGroups = UMDataServices.userUserGroups.leftStateful(this)
  lazy val applicationRoles = UMDataServices.userApplicationRoles.leftStateful(this)
  lazy val dataFilterInstances = UMDataServices.userDataFilterInstances.leftStateful(this)

  lazy val organization = UMDataServices.orgToUsers.rightStateful(this).one.get
}

case class Application(
    @Column("app_id") id:        Int,
    @Column("app_name") appName: String,
    @Column("app_desc") appDesc: String
) extends KeyedEntity[Int] {
  lazy val applicationRoles: StatefulOneToMany[ApplicationRole] = UMDataServices.applicationToApplicationRoles.leftStateful(this)
}

case class ApplicationRole(
    @Column("app_role_id") id:     Int,
    @Column("role_name") roleName: String,
    @Column("role_desc") roleDesc: String,
    @Column("app_id") appId:       Int
) extends KeyedEntity[Int] {
  lazy val application: Application = UMDataServices.applicationToApplicationRoles.rightStateful(this).one.get
  lazy val userGroups = UMDataServices.userGroupApplicationRoles.rightStateful(this)
}

case class DataFilter(
    @Column("data_filter_id") id:                                   Int,
    @Column("field_id") fieldId:                                    String,
    @Column("field_desc") fieldDesc:                                String,
    @Column("data_type") dataType:                                  String,
    @Column("display_name") displayName:                            Option[String],
    @Column("repository_connection_name") repositoryConnectionName: String,
    @Column("allowable_values_query") allowableValuesQuery:         String,
    @Column("show_value_only") showValueOnly:                       Boolean
) extends KeyedEntity[Int] {
  lazy val dataFilterInstances: StatefulOneToMany[DataFilterInstance] = UMDataServices.dataFilterToDataFilterInstances.leftStateful(this)
}

case class DataFilterInstance(
    @Column("data_filter_ins_id") id:       Int,
    @Column("data_filter_id") dataFilterId: Int,
    @Column("operator") operator:           String,
    @Column("value") value:                 String,
    @Column("option_type") optionType:      Option[Int]
) extends KeyedEntity[Int] {
  lazy val dataFilter: DataFilter = UMDataServices.dataFilterToDataFilterInstances.rightStateful(this).one.get
}

case class GroupType(
    @Column("group_type_id") id:              Int,
    @Column("org_id") var orgId:              Int,
    @Column("group_type_name") groupTypeName: String
) extends KeyedEntity[Int] {
  lazy val organization: Organization = UMDataServices.orgToGroupTypes.rightStateful(this).one.get

  lazy val userGroups: StatefulOneToMany[UserGroup] = UMDataServices.groupTypeToUserGroups.leftStateful(this)
}

case class Module(
    @Column("module_id") val id:       Int,
    @Column("module_name") moduleName: String,
    @Column("module_desc") moduleDesc: String,
    @Column("module_type") moduleType: String
) extends KeyedEntity[Int] {
}

class Organization(
    @Column("org_id") val id:              Int,
    @Column("org_version") var orgVersion: Int,
    @Column("org_name") var orgName:       String,
    @Column("org_desc") var orgDesc:       Option[String],
    @Column("org_status") var orgStatus:   String,
    @Column("is_deleted") var isDeleted:   Option[Boolean]
) extends KeyedEntity[Int] {
  lazy val userGroups: StatefulOneToMany[UserGroup] = UMDataServices.orgToUserGroups.leftStateful(this)

  lazy val applications = UMDataServices.orgApplications.leftStateful(this)
  lazy val dataFilterInstances = UMDataServices.orgDataFilterInstances.leftStateful(this)
}

class UserAppSession(
    @Column("user_app_session_id") val id:    Int,
    @Column("login_user_id") var loginUserId: Int,
    @Column("session_id") val sessionId:      String,
    @Column("login_time") var loginTime:      Timestamp,
    @Column("expire_time") var expireTime:    Timestamp
) extends KeyedEntity[Int] {
  lazy val user: User = UMDataServices.userToUserAppSessions.rightStateful(this).one.get
}

case class UserComment(
    @Column("comment_id") id:            Int,
    @Column("object_id") objectId:       Int,
    @Column("date_created") dateCreated: Timestamp,
    @Column("date_updated") dateUpdated: Timestamp,
    @Column("text") text:                String,
    @Column("module_id") moduleId:       Int,
    @Column("user_id") userId:           Int
) extends KeyedEntity[Int] {
  lazy val module: Module = UMDataServices.moduleToUserComments.rightStateful(this).one.get
  lazy val user: User = UMDataServices.userToUserComments.rightStateful(this).one.get
}

class UserGroup(
    @Column("group_id") val id:                   Int,
    @Column("group_name") var groupName:          String,
    @Column("group_desc") var groupDesc:          Option[String],
    @Column("org_id") var orgId:                  Option[Int],
    @Column("parent_group_id") var parentGroupId: Option[Int],
    @Column("group_type_id") var groupTypeId:     Option[Int]
) extends KeyedEntity[Int] {
  // def this() = this(0, "", Some(""), Some(0), Some(0), Some(0))
  lazy val organization: Organization = UMDataServices.orgToUserGroups.rightStateful(this).one.get
  lazy val parentUserGroup: UserGroup = UMDataServices.userGroupToUserGroups.rightStateful(this).one.getOrElse(null)
  lazy val groupType: GroupType = UMDataServices.groupTypeToUserGroups.rightStateful(this).one.getOrElse(null)

  lazy val applicationRoles = UMDataServices.userGroupApplicationRoles.leftStateful(this)
  lazy val dataFilterInstances = UMDataServices.userGroupDataFilterInstances.leftStateful(this)
}

case class UserLoginRecord(
    @Column("record_id") id:              Int,
    @Column("login_time") loginTime:      Timestamp,
    @Column("login_ip") loginIp:          String,
    @Column("login_result") loginResult:  Boolean,
    @Column("login_user_id") loginUserId: Int
) extends KeyedEntity[Int] {
  lazy val loginUser = UMDataServices.userToLoginRecords.rightStateful(this).one.get
}

case class UserPasswordHistory(
    @Column("password_history_id") id:   Int,
    @Column("user_id") userId:           Int,
    @Column("old_pwd") oldPassword:      String,
    @Column("new_pwd") newPassword:      String,
    @Column("date_created") dateCreated: Timestamp
) extends KeyedEntity[Int] {
  lazy val user = UMDataServices.userToPasswordHistory.rightStateful(this).one.get
}

// ManyToMany Table
case class UserModule(
    @Column("user_id") userId:     Int,
    @Column("module_id") moduleId: Int
) extends KeyedEntity[CompositeKey2[Int, Int]] {
  def id = compositeKey(userId, moduleId)
}

case class UserUserGroup(
    @Column("user_id") var userId:            Int,
    @Column("user_group_id") var userGroupId: Int
) extends KeyedEntity[CompositeKey2[Int, Int]] {
  def id = compositeKey(userId, userGroupId)
}

case class UserApplicationRole(
    @Column("user_id") userId:        Int,
    @Column("app_role_id") appRoleId: Int
) extends KeyedEntity[CompositeKey2[Int, Int]] {
  def id = compositeKey(userId, appRoleId)
}

case class UserDataFilterInstance(
    @Column("user_id") userId:                     Int,
    @Column("data_filter_ins_id") dataFilterInsId: Int
) extends KeyedEntity[CompositeKey2[Int, Int]] {
  def id = compositeKey(userId, dataFilterInsId)
}

case class OrgApplication(
    @Column("org_id") orgId: Int,
    @Column("app_id") appId: Int
) extends KeyedEntity[CompositeKey2[Int, Int]] {
  def id = compositeKey(orgId, appId)
}

case class OrgDataFilterInstance(
    @Column("org_id") orgId:                       Int,
    @Column("data_filter_ins_id") dataFilterInsId: Int
) extends KeyedEntity[CompositeKey2[Int, Int]] {
  def id = compositeKey(orgId, dataFilterInsId)
}

case class UserGroupApplicationRole(
    @Column("group_id") groupId:      Int,
    @Column("app_role_id") appRoleId: Int
) extends KeyedEntity[CompositeKey2[Int, Int]] {
  def id = compositeKey(groupId, appRoleId)
}

case class UserGroupDataFilterInstance(
    @Column("group_id") groupId:                   Int,
    @Column("data_filter_ins_id") dataFilterInsId: Int
) extends KeyedEntity[CompositeKey2[Int, Int]] {
  def id = compositeKey(groupId, dataFilterInsId)
}

case class PasswordResetRequest(
    @Column("request_id") id:                Int,
    @Column("request_token") requestToken:   String,
    @Column("security_code") securityCode:   String,
    @Column("request_status") requestStatus: Boolean,
    @Column("request_time") requestTime:     Timestamp = new Timestamp(System.currentTimeMillis),
    @Column("user_id") userId:               Int
) extends KeyedEntity[Int] {
  lazy val user = UMDataServices.userToPasswordResetRequest.rightStateful(this).one.get
}

object UMDataServices extends Schema {
  //When the table name doesn't match the class name, it is specified here :
  val users = table[User]("um_basic_user")
  val applications = table[Application]("um_application")
  val applicationRoles = table[ApplicationRole]("um_application_role")
  val dataFilters = table[DataFilter]("um_data_filter")
  val dataFilterInstances = table[DataFilterInstance]("um_data_filter_instance")
  val groupTypes = table[GroupType]("um_group_type")
  val modules = table[Module]("um_module")
  val organizations = table[Organization]("um_organization")
  val userAppSessions = table[UserAppSession]("um_user_app_session")
  val userComments = table[UserComment]("um_user_comment")
  val userGroups = table[UserGroup]("um_user_group")
  val userLoginRecords = table[UserLoginRecord]("um_user_login_record")
  val userPasswordHistories = table[UserPasswordHistory]("um_user_password_history")
  val passwordResetRequests = table[PasswordResetRequest]("um_password_reset_request")

  // ManyToManyRelations
  val userModules = manyToManyRelation(users, modules, "um_user_module_permission").
    via[UserModule]((a, b, c) => (a.id === c.userId, b.id === c.moduleId))
  val userUserGroups = manyToManyRelation(users, userGroups, "um_user_group_membership").
    via[UserUserGroup]((a, b, c) => (a.id === c.userId, b.id === c.userGroupId))
  val userApplicationRoles = manyToManyRelation(users, applicationRoles, "um_user_app_role").
    via[UserApplicationRole]((a, b, c) => (a.id === c.userId, b.id === c.appRoleId))
  val userDataFilterInstances = manyToManyRelation(users, dataFilterInstances, "um_user_data_filter").
    via[UserDataFilterInstance]((a, b, c) => (a.id === c.userId, b.id === c.dataFilterInsId))

  val orgApplications = manyToManyRelation(organizations, applications, "um_organization_app_permission").
    via[OrgApplication]((a, b, c) => (a.id === c.orgId, b.id === c.appId))
  val orgDataFilterInstances = manyToManyRelation(organizations, dataFilterInstances, "um_organization_data_filter").
    via[OrgDataFilterInstance]((a, b, c) => (a.id === c.orgId, b.id === c.dataFilterInsId))

  val userGroupApplicationRoles = manyToManyRelation(userGroups, applicationRoles, "um_user_group_app_role").
    via[UserGroupApplicationRole]((a, b, c) => (a.id === c.groupId, b.id === c.appRoleId))
  val userGroupDataFilterInstances = manyToManyRelation(userGroups, dataFilterInstances, "um_user_group_data_filter").
    via[UserGroupDataFilterInstance]((a, b, c) => (a.id === c.groupId, b.id === c.dataFilterInsId))

  // OneToManyRelations
  val applicationToApplicationRoles = oneToManyRelation(applications, applicationRoles)
    .via((a, b) => a.id === b.appId)
  val dataFilterToDataFilterInstances = oneToManyRelation(dataFilters, dataFilterInstances)
    .via((a, b) => a.id === b.dataFilterId)
  val orgToGroupTypes = oneToManyRelation(organizations, groupTypes)
    .via((a, b) => a.id === b.orgId)
  val userToUserAppSessions = oneToManyRelation(users, userAppSessions)
    .via((a, b) => a.id === b.loginUserId)
  val moduleToUserComments = oneToManyRelation(modules, userComments)
    .via((a, b) => a.id === b.moduleId)
  val userToUserComments = oneToManyRelation(users, userComments)
    .via((a, b) => a.id === b.userId)
  val orgToUserGroups = oneToManyRelation(organizations, userGroups)
    .via((a, b) => a.id === b.orgId)
  val orgToUsers = oneToManyRelation(organizations, users)
    .via((a, b) => a.id === b.orgId)
  val userGroupToUserGroups = oneToManyRelation(userGroups, userGroups)
    .via((a, b) => a.id === b.parentGroupId)
  val groupTypeToUserGroups = oneToManyRelation(groupTypes, userGroups)
    .via((a, b) => a.id === b.groupTypeId)
  val userToLoginRecords = oneToManyRelation(users, userLoginRecords)
    .via((a, b) => a.id === b.loginUserId)
  val userToPasswordHistory = oneToManyRelation(users, userPasswordHistories)
    .via((a, b) => a.id === b.userId)
  val userToPasswordResetRequest = oneToManyRelation(users, passwordResetRequests)
    .via((a, b) => a.id === b.userId)
  // Auxiliary methods
  def getAllGroupsUnderGroup(groupId: Int): List[UserGroup] = {
    UMDataServices.userGroups.where(ug => ug.parentGroupId === Some(groupId)).toList
  }

  def getOrganizations: Query[Organization] = {
    organizations.where(org => org.isDeleted <> Some(true))
  }
  /*
   * Gets all the active users. This method should be the one most likely to be used in application as the application doesn't need to get those inactive users.
   */
  def activeUsers: Query[User] = {
    from(users, organizations)((u, o) =>
      where(u.orgId === o.id and u.status === Some("A")
        and u.isDeleted <> Some(true)
        and o.isDeleted <> Some(true))
        select (u))
  }

  /**
   * This method returns all the ancestors for current user, excluding direct parent.
   * This is for indirect user groups showing on the UI.
   * @param userId User ID
   * @return A queryable object contains a set of user groups.
   */
  def getAllAncestors(userId: Int): List[UserGroup] = {
    val parentGroups = users.where(u => u.id === userId).head.userGroups
    var result: List[UserGroup] = Nil
    for (parent <- parentGroups) {
      var currentParent = parent
      while (currentParent != null && currentParent.parentUserGroup != null) {
        result ::= currentParent.parentUserGroup
        currentParent = currentParent.parentUserGroup
      }
    }
    result
  }

  /**
   * This method returns all the parent groups for specific user.
   * @param userId
   * @return
   */
  def getAllParentGroups(userId: Int): List[UserGroup] = {
    users.where(u => u.id === userId).head.userGroups.toList ::: getAllAncestors(userId)
  }

  /**
   * This method returns all the ancestors for current user group.
   * @param groupId Group ID
   * @return A queryable object contains a set of user groups.
   */
  def getAllAncestorGroups(groupId: Int): List[UserGroup] = {
    val group = userGroups.where(ug => ug.id === groupId).headOption
    if (group != None) {
      var result: List[UserGroup] = Nil
      var currentParent = group.get.parentUserGroup
      while (currentParent != null) {
        result ::= currentParent
        currentParent = currentParent.parentUserGroup
      }
      result
    }
    Nil
  }

  /**
   * #region Retrieve Data Filter Instances as Filter Elements, right now these methods are used in BIQ.
   */

  /**
   * Combine all the data filter instances associated with the organization and return a set of strings that represents the filter elements.
   * @param orgId Organization ID
   * @param fieldId Field ID to find the data filters.
   * @return A list of filter element strings
   */
  def getOrgFilterElements(orgId: Int, fieldId: String): List[String] = {
    val filterInstances = organizations.where(o => o.id === orgId).flatMap(x => x.dataFilterInstances).toList
    val filters = dataFilters.where(d => d.fieldId === fieldId).toList

    val inFilterInstances = filterInstances.filter(df => df.operator == "IN").toList
    val notInFilterInstances = filterInstances.filter(df => df.operator == "NOT IN").toList
    val equalFilterInstances = filterInstances.filter(df => df.operator == "=").toList
    val notEqualFilterInstances = filterInstances.filter(df => df.operator == "<>").toList

    return combineFilterElements(filters, inFilterInstances, notInFilterInstances, equalFilterInstances, notEqualFilterInstances)
  }

  /**
   * Combine all the data filter instances associated with the user group and return a set of strings that represents the filter elements.
   * @param groupId Group ID
   * @param fieldId Field ID to find the data filters.
   * @return A list of filter element strings
   */
  def getUserGroupFilterElements(groupId: Int, fieldId: String): List[String] = {
    val userGroup = userGroups.where(ug => ug.id === groupId).toList
    val filters = UMDataServices.dataFilters.where(d => d.fieldId === fieldId).toList
    val filterInstances = userGroups.where(ug => ug.id === groupId).flatMap(x => x.dataFilterInstances).toList

    val inFilterInstances = filterInstances.filter(df => df.operator == "IN").toList //UMDataServices.GetAllAncestors(groupId).Union(userGroup).flatMap(x => x.dataFilterInstances).where(df => df.operator == "IN").toList
    val notInFilterInstances = filterInstances.filter(df => df.operator == "NOT IN").toList
    val equalFilterInstances = filterInstances.filter(df => df.operator == "=").toList
    val notEqualFilterInstances = filterInstances.filter(df => df.operator == "<>").toList

    combineFilterElements(filters, inFilterInstances, notInFilterInstances, equalFilterInstances, notEqualFilterInstances)
  }

  /**
   * Combine operators IN, NOT IN, =, <>
   * @param filters A set of data filters
   * @param inFilterInstances Filter instances in IN clause
   * @param notInFilterInstances Filter instances in NOT IN clause
   * @param equalFilterInstances Filter instances in EQUAL clause
   * @param notEqualFilterInstances Filter instances in NOT EQUAL clause
   * @return A list of filter element strings
   */
  def combineFilterElements(filters: List[DataFilter], inFilterInstances: List[DataFilterInstance], notInFilterInstances: List[DataFilterInstance],
                            equalFilterInstances: List[DataFilterInstance], notEqualFilterInstances: List[DataFilterInstance]): List[String] = {
    val inFilterElements = getFilterElement(filters, inFilterInstances)
    val notInFilterElements = getFilterElement(filters, notInFilterInstances)
    val equalFilterElements = getFilterElement(filters, equalFilterInstances)
    val notEqualFilterElements = getFilterElement(filters, notEqualFilterInstances)

    (inFilterElements.toSet ++ equalFilterElements.toSet -- notInFilterElements.toSet -- notEqualFilterElements.toSet).toList
  }

  def getUserFilterInstanceElement(userId: Int, fieldId: String, addClosingQuote: Boolean = false): DataFilterInstance = {
    val result = getUserFilterElements(userId, fieldId)
    val valueList = result._1
    val outerFilterElements = result._2
    if (valueList != null && valueList.size > 0) {
      createDataFilterInstanceElement(fieldId, "IN", valueList, addClosingQuote)
    }
    else if (outerFilterElements != null && outerFilterElements.size > 0) {
      createDataFilterInstanceElement(fieldId, "NOT IN", outerFilterElements, addClosingQuote)
    }
    else {
      null
    }
  }

  private def createDataFilterInstanceElement(fieldId: String, filterOperator: String, valueList: Traversable[String], addClosingQuote: Boolean): DataFilterInstance = {
    val dataFilterDef = UMDataServices.dataFilters.where(df => df.fieldId === fieldId).headOption
    val value = {
      if (dataFilterDef != None && dataFilterDef.get.dataType.toLowerCase.equals("int"))
        prepareFilterValueFromList(valueList, false)
      else
        prepareFilterValueFromList(valueList, addClosingQuote)
    }
    new DataFilterInstance(0, dataFilterId = dataFilterDef.get.id, filterOperator, value, None)
  }

  private def prepareFilterValueFromList(valueList: Traversable[String], addClosingQuote: Boolean): String = {
    var retValueString = ""
    for (str <- valueList) {
      if (addClosingQuote) {
        if (str.startsWith("'") && str.endsWith("'"))
          retValueString += str + ","
        else
          retValueString += "'" + str + "'" + ","
      }
      else {
        retValueString += str + ","
      }
    }

    if (retValueString.isEmpty) {
      // dropRight(1) is to remove the last ","
      retValueString = "(" + retValueString.dropRight(1) + ")"
    }
    retValueString
  }

  /**
   * Combine all the data filter instances associated with the user and return a set of strings that represents the filter elements.
   * @param userId User ID
   * @param fieldId Field ID to find the data filters
   * @return A list of filter element strings and excluded filter elements
   */
  def getUserFilterElements(userId: Int, fieldId: String): (Traversable[String], Traversable[String]) = {
    var tmpRetList: Traversable[String] = null
    val user = users.where(u => u.id === userId).head

    val filterInstances = user.dataFilterInstances.filter(df => df.dataFilter.fieldId == fieldId)

    var inFilterInstances = getDataFilterElementValues(filterInstances, "IN")
    var notInFilterInstances = getDataFilterElementValues(filterInstances, "NOT IN")
    var equalFilterInstances = getDataFilterElementValues(filterInstances, "=")
    var notEqualFilterInstances = getDataFilterElementValues(filterInstances, "<>")

    if (inFilterInstances.size == 0 && equalFilterInstances.size == 0) {
      //take from group
      val result = getUserGroupsFilterElements(fieldId, user, inFilterInstances, notInFilterInstances, equalFilterInstances, notEqualFilterInstances)
      tmpRetList = result._1
      inFilterInstances = result._2
      notInFilterInstances = result._3
      equalFilterInstances = result._4
      notEqualFilterInstances = result._5
    }
    else {
      tmpRetList = prepareFilterElementsValues(inFilterInstances, notInFilterInstances, equalFilterInstances, notEqualFilterInstances)
      if (tmpRetList.size == 0) {
        //take from group
        val result = getUserGroupsFilterElements(fieldId, user, inFilterInstances, notInFilterInstances, equalFilterInstances, notEqualFilterInstances)
        tmpRetList = result._1
        inFilterInstances = result._2
        notInFilterInstances = result._3
        equalFilterInstances = result._4
        notEqualFilterInstances = result._5
      }
    }

    val notInFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(notInFilterInstances)
    val notEqualFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(notEqualFilterInstances)

    val outerFilterElements = notInFilterElements ++ notEqualFilterElements

    (tmpRetList, outerFilterElements)
  }

  private def getUserGroupsFilterElements(fieldId: String, user: User, inFilterInstances: List[String], notInFilterInstances: List[String], equalFilterInstances: List[String], notEqualFilterInstances: List[String]) = {
    var tmpRetList: Traversable[String] = null

    val groupFiltersInstances = getAllParentGroups(user.id).flatMap(ug => ug.dataFilterInstances.filter(df => df.dataFilter.fieldId == fieldId))

    val updatedFilterElements = prepareFilterElements(groupFiltersInstances, inFilterInstances, notInFilterInstances, equalFilterInstances, notEqualFilterInstances)

    if (inFilterInstances.size == 0 && equalFilterInstances.size == 0) {
      //take from organization
      tmpRetList = getUserOrganizationFilterElements(fieldId, user, updatedFilterElements._1, updatedFilterElements._2, updatedFilterElements._3, updatedFilterElements._4)
    }

    tmpRetList = prepareFilterElementsValues(updatedFilterElements._1, updatedFilterElements._2, updatedFilterElements._3, updatedFilterElements._4)
    if (tmpRetList.size == 0) {
      //take from organization
      tmpRetList = getUserOrganizationFilterElements(fieldId, user, updatedFilterElements._1, updatedFilterElements._2, updatedFilterElements._3, updatedFilterElements._4)
    }

    (tmpRetList, updatedFilterElements._1, updatedFilterElements._2, updatedFilterElements._3, updatedFilterElements._4)
  }

  private def getUserOrganizationFilterElements(fieldId: String, user: User, inFilterInstances: List[String], notInFilterInstances: List[String], equalFilterInstances: List[String], notEqualFilterInstances: List[String]): Traversable[String] = {
    val orgFilterInstances = user.organization.dataFilterInstances.filter(df => df.dataFilter.fieldId == fieldId)

    val updatedFilterElements = prepareFilterElements(orgFilterInstances, inFilterInstances, notInFilterInstances, equalFilterInstances, notEqualFilterInstances)

    prepareFilterElementsValues(updatedFilterElements._1, updatedFilterElements._2, updatedFilterElements._3, updatedFilterElements._4)
  }

  private def prepareFilterElements(filterInstances: Traversable[DataFilterInstance], inFilterInstances: List[String], notInFilterInstances: List[String], equalFilterInstances: List[String], notEqualFilterInstances: List[String]) = {
    (inFilterInstances ::: getDataFilterElementValues(filterInstances, "IN"),
      notInFilterInstances ::: getDataFilterElementValues(filterInstances, "NOT IN"),
      equalFilterInstances ::: getDataFilterElementValues(filterInstances, "="),
      notEqualFilterInstances ::: getDataFilterElementValues(filterInstances, "<>"))
  }

  private def prepareFilterElementsValues(inFilterInstances: Traversable[String], notInFilterInstances: Traversable[String], equalFilterInstances: Traversable[String], notEqualFilterInstances: Traversable[String]): Traversable[String] = {
    val inFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(inFilterInstances)
    val notInFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(notInFilterInstances)
    val equalFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(equalFilterInstances)
    val notEqualFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(notEqualFilterInstances)

    (inFilterElements.toSet ++ equalFilterElements.toSet -- notInFilterElements.toSet -- notEqualFilterElements.toSet).toList
  }

  private def getDataFilterElementValues(filterInstances: Traversable[DataFilterInstance], filterOperator: String): List[String] = {
    filterInstances.filter(df => df.operator.toUpperCase == filterOperator).map(de => de.value).toList
  }

  private def getSeperatedDataFilterElementValues(filterInstanceValues: Traversable[String]): Traversable[String] = {
    filterInstanceValues.flatMap(v => removeChar(v).split(',').map(_.trim))
  }

  private def getSeperatedDataFilterElementValuesWithoutParenthesis(filterInstanceValues: Traversable[String]): Traversable[String] = {
    filterInstanceValues.flatMap(v => removeClosingParenthesis(v).split(',').map(_.trim))
  }

  /**
   * Remove unnecessary Closing Parenthesis
   * @param v String value
   * @return String with "\(\)\s" removed.
   */
  private def removeClosingParenthesis(v: String): String = {
    val rgx = new Regex("(\\()?(\\))?")
    rgx.replaceAllIn(v, "")
  }

  /**
   * Remove unnecessary characters
   * @param v String value
   * @return String with "\(\)\s" removed.
   */
  private def removeChar(v: String): String = {
    val rgx = new Regex("(\\s+)?(\\.)?(\\*)?(\\()?(\\))?")
    rgx.replaceAllIn(v, "")
  }

  /**
   * Get the filter element list from all the filter instances and filters passed in.
   * @param filters List of data filter objects.
   * @param filterInstances List of data filter instance objects.
   * @return A list of filter element strings
   */
  def getFilterElement(filters: List[DataFilter], filterInstances: List[DataFilterInstance]): List[String] = {
    filterInstances.filter(fi => filters.map(_.id).contains(fi.dataFilterId)).map(_.value).flatMap(v => removeChar(v).split(','))
  }

  /**
   * #end region Retrieve Data Filter Instances as Filter Elements, right now these methods are used in BIQ.
   */

  /**
   * #region Retrieve Data Filter Instances as set of (key, operator, value).
   */

  /**
   * Find the data filter instances attached to nearest user group or organization that has data filter defined.
   * TODO Need to change the funciton name to a proper one.
   * @param userId User ID
   * @return A list of sets of data filter instances.
   */
  def getUserDataFilterInstances(userId: Int): List[DataFilterInstance] = {
    val user = activeUsers.where(u => u.id === userId).head
    val groupsWithFilters = getGroupsWithFilters(user.userGroups.toList)

    if (groupsWithFilters.size > 0) {
      val dataFilterInstances = groupsWithFilters.flatMap(ug => ug.dataFilterInstances)
      (dataFilterInstances.toSet ++ user.organization.dataFilterInstances.toSet).toList
    }
    else {
      // No filter instances have been attached to any of the user groups that the user belongs to.
      // We will need to use the filters attached to organization.
      user.organization.dataFilterInstances.toList
    }
  }

  /**
   * Get all the filters attached to this set of user groups and all their parents and ancestors.
   * @param groups A set of User Group objects
   * @return A list of User Group objects
   */
  private def getGroupsWithFilters(groups: List[UserGroup]): List[UserGroup] = {
    var result: List[UserGroup] = Nil
    for (u <- groups) {
      if (u.dataFilterInstances.size > 0) {
        result ::= u
      }
      var parent = u.parentUserGroup
      while (parent != null) {
        if (parent.dataFilterInstances.size > 0) {
          // Get the nearest parent that has data filter instances.
          result ::= parent
        }
        parent = parent.parentUserGroup
      }
    }
    result
  }

  /**
   * #end region Retrieve Data Filter Instances as set of (key, operator, value).
   */

  /**
   * This will return the application roles for the user in a specific application.
   * If there is no role in user level, then it will look into the group level.
   * @param user The provided user
   * @param applicationId The current application Id
   * @return
   */
  def getUserApplicationRoles(user: User, applicationId: Int): List[Int] = {
    val roleIds = user.applicationRoles
      .filter(appRole => appRole.appId == applicationId)
      .map(appRole => appRole.id).toList
    // TODO Optimize later
    val groupRoles = userGroups.where(ug => user.userGroups.filter(ugi => ugi.id == ug.id).size gt 0).flatMap(ug => ug.applicationRoles).map(ar => ar.id).toList.distinct

    roleIds ::: groupRoles
  }

  /**
   * Get all users under given group
   * @param groupId Given goup ID
   * @return A query for all the users under specific gruop.
   */
  def getUsersOfGroup(groupId: Int): Query[User] = {
    from(users, userUserGroups)((u, uug) =>
      where(u.id === uug.userId and u.status === Some("A")
        and uug.userGroupId === groupId
        and u.isDeleted <> Some(true)
        and u.isDeleted <> Some(true))
        select (u))
  }
}
