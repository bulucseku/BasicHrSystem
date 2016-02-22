package com.sentrana.usermanagement.domain.document

import java.sql.Timestamp
import com.sentrana.appshell.domain.{ FileDataServices, MongoDataServices, DocumentObject, DataServices }
import com.sentrana.appshell.exceptions.ConfigurationException
import com.sentrana.usermanagement.authentication.Guid
import com.sentrana.usermanagement.datacontract.{ DataFilterInfo, AppRoleInfo, ApplicationInfo }
import com.sentrana.usermanagement.exceptions._
import org.squeryl.Query
import play.api.{ Play, Configuration }
import play.api.Play.current
import scala.util.matching.Regex

// Tables
case class User(
    id:                  String,
    userName:            String,
    password:            String,
    email:               String,
    firstName:           String,
    lastName:            String,
    status:              Option[String],
    createDate:          Timestamp               = new Timestamp(System.currentTimeMillis),
    loginFailureCount:   Int                     = 0,
    loginSuccessCount:   Int                     = 0,
    isDeleted:           Option[Boolean],
    dataFilterInstances: Seq[DataFilterInstance],
    appRoles:            Seq[AppRoleInfo],
    userGroupIds:        Seq[String],
    organizationId:      String
) {

  lazy val ds = UMDataServices()
  var organization: Organization = _
  lazy val loginRecords: List[UserLoginRecord] = ds.getDocuments[UserLoginRecord](Map("loginUserId" -> id))
  lazy val userComments: List[UserComment] = ds.getDocuments[UserComment](Map("userId" -> id))
  lazy val userAppSessions: List[UserAppSession] = ds.getDocuments[UserAppSession](Map("loginUserId" -> id))
  lazy val userGroups = organization.userGroups.filter(ug => userGroupIds.contains(ug.id))
}

case class Organization(
    id:                  String,
    name:                String,
    desc:                Option[String],
    status:              String,
    isDeleted:           Boolean,
    userGroups:          Seq[UserGroup],
    applications:        Seq[ApplicationInfo],
    dataFilterInstances: Seq[DataFilterInstance],
    groupTypes:          Seq[GroupType],
    users:               Seq[User]
) extends DocumentObject {

  def initializeChildren() = {
    userGroups.foreach(_.organization = this)
    groupTypes.foreach(_.organization = this)
    users.foreach(_.organization = this)
  }
  initializeChildren()

  def activeUsers = users.filter(user => user.status == Some("A") && !user.isDeleted.getOrElse(false))
}

object Organization extends DocumentObject {
  override def source = "organization"
}

case class UserGroup(
    id:                  String,
    name:                String,
    desc:                Option[String],
    var parentGroupId:   Option[String],
    appRoles:            Seq[AppRoleInfo],
    dataFilterInstances: Seq[DataFilterInstance],
    groupTypeId:         Option[String],
    orgId:               Option[String]
) extends DocumentObject {

  var organization: Organization = _
  lazy val parentGroup: Option[UserGroup] = organization.userGroups.find(ug => Some(ug.id) == parentGroupId)
  lazy val groupType: Option[GroupType] = groupTypeId.flatMap(id => organization.groupTypes.find(_.id == id))
}

object UserGroup extends DocumentObject {
  override def source = "organization"
}

case class DataFilterInstance(
    id:           String,
    dataFilterId: String,
    operator:     String,
    value:        String,
    optionType:   Option[Int]
) {
  lazy val ds = UMDataServices()
  lazy val dataFilter: DataFilterInfo = ds.getDocuments[DataFilterInfo](Map("filterId" -> dataFilterId)).headOption.getOrElse(
    throw new Exception("Invalid reference to missing data filter for data filter instance with id: " + id)
  )
}

case class UserLoginRecord(
    id:          String,
    loginTime:   Timestamp,
    loginIp:     String,
    loginResult: Boolean,
    loginUserId: String
) extends DocumentObject {
  lazy val user = UMDataServices.getUser("id", loginUserId)
}

object UserLoginRecord extends DocumentObject {
  override val source = "userLoginRecord"
}

case class UserAppSession(
    id:          String,
    loginUserId: String,
    sessionId:   String,
    loginTime:   Timestamp,
    expireTime:  Timestamp
) extends DocumentObject {
  lazy val user: User = UMDataServices.getUser("id", loginUserId)
}

object UserAppSession extends DocumentObject {
  override val source = "userAppSession"
}

case class UserComment(
    id:          String,
    objectId:    String,
    dateCreated: Timestamp,
    dateUpdated: Timestamp,
    text:        String,
    userId:      String
) extends DocumentObject {
  lazy val user: User = UMDataServices.getUser("id", userId)
}

object UserComment extends DocumentObject {
  override val source = "userComment"
}

case class GroupType(
    id:            String,
    groupTypeName: String,
    userGroups:    Seq[UserGroup]
) {
  var organization: Organization = _
}

case class UserPasswordHistory(
    id:          String,
    userId:      String,
    oldPassword: String,
    newPassword: String,
    dateCreated: Timestamp
) extends DocumentObject {
  lazy val user = UMDataServices.getUser("id", userId)
}

case class PasswordResetRequest(
    id:            String,
    requestToken:  String,
    securityCode:  String,
    requestStatus: Boolean,
    requestTime:   Timestamp = new Timestamp(System.currentTimeMillis),
    userId:        String
) extends DocumentObject {
  lazy val user = UMDataServices.getUser("id", userId)
}

object PasswordResetRequest extends DocumentObject {
  override val source = "passwordResetRequest"
}

object UserPasswordHistory extends DocumentObject {
  override val source = "userPasswordHistory"
}

object UMDataServices {
  private var _dataServices: DataServices = _

  def getOrganizations: List[Organization] = {
    _dataServices.getDocuments[Organization](Map("isDeleted" -> false))
  }

  def getOrganization(orgId: String): Option[Organization] = {
    _dataServices.getDocuments[Organization](Map("id" -> orgId, "isDeleted" -> false)).headOption
  }

  def updateOrganization(organization: Organization): Unit = {
    _dataServices.updateDocument[Organization](Map("id" -> organization.id), organization)
  }

  def apply(config: Configuration): DataServices = {
    config.getString("um.data-services.type") match {
      case Some("mongo") =>
        _dataServices = MongoDataServices("um")
      case Some("file") =>
        _dataServices = FileDataServices(
          Play.application.path.getAbsolutePath + java.io.File.separator + "conf"
        )
      case _ => throw new ConfigurationException("um.data-services.type must be either file or mongo")
    }
    _dataServices
  }

  def apply() = _dataServices

  def getUsers(field: String, value: String): Traversable[User] = {
    _dataServices.getDocuments[Organization](Map(s"users.$field" -> value)).headOption match {
      case Some(org) =>
        field match {
          case "userName" => org.users.filter(_.userName == value)
          case "id"       => org.users.filter(_.id == value)
          case "email"    => org.users.filter(_.email == value)
          case _          => throw new IllegalArgumentException("Field values can only be id or userName")
        }
      case None => throw new UserNotFoundWithPropertyException(field, value)
    }
  }

  def getUser(field: String, value: String): User = {
    getUsers(field, value).head
  }

  def getUserById(userId: String) = getUser("id", userId)

  def getActiveUser(field: String, value: String): Option[User] = {
    getUsers(field, value).find(_.status == Some("A"))
  }

  def activeUsers = {
    _dataServices.getDocuments[Organization](Map()).flatMap(o =>
      o.activeUsers)
  }

  /**
   * This will return the application roles for the user in a specific application.
   * If there is no role in user level, then it will look into the group level.
   * @param user The provided user
   * @param applicationId The current application Id
   * @return
   */
  def getUserApplicationRoles(user: User, applicationId: String): Traversable[String] = {
    _dataServices.getDocuments[ApplicationInfo](Map("id" -> applicationId)).headOption match {
      case None => List()
      case Some(application) =>
        val appRoles = application.appRoles.filter(appRole => user.appRoles.exists(userRole => userRole.id == appRole.id)).map(_.id)
        val userGroupRoles = user.userGroups.flatMap(_.appRoles)
        val userGroupRolesFiltered = application.appRoles.filter(appRole => userGroupRoles.exists(groupRole => groupRole.id == appRole.id)).map(_.id)
        appRoles ++ userGroupRolesFiltered
    }
  }

  private def createDataFilterInstanceElement(
    fieldId:         String,
    filterOperator:  String,
    valueList:       Traversable[String],
    addClosingQuote: Boolean,
    parenthesize:    Boolean             = true
  ): DataFilterInstance = {
    val dataFilterDef = _dataServices.getDocuments[DataFilterInfo](Map("fieldId" -> fieldId)).headOption
    val value = prepareFilterValueFromList(valueList, addClosingQuote, parenthesize)
    DataFilterInstance(getObjectId, dataFilterId = dataFilterDef.get.filterId, filterOperator, value, None)
  }

  private def prepareFilterValueFromList(valueList: Traversable[String], addClosingQuote: Boolean, parenthesize: Boolean = true): String = {
    val retValueString = valueList.map { str =>
      if (addClosingQuote && !str.startsWith("'") && !str.endsWith("'")) s"'$str'" else str
    }.mkString(",")

    if (retValueString.nonEmpty && parenthesize) {
      // dropRight(1) is to remove the last ","
      s"($retValueString)"
    }
    else {
      retValueString
    }
  }

  def getUserFilterInstanceElement(
    user:            User,
    fieldId:         String,
    addClosingQuote: Boolean = false,
    parenthesize:    Boolean = true
  ): Option[DataFilterInstance] = {
    val dataFilterElementValues = getUserFilterElements(user, fieldId)
    val valueList = dataFilterElementValues.allowed
    val outerFilterElements = dataFilterElementValues.notAllowed
    if (valueList.size > 0) {
      Some(createDataFilterInstanceElement(fieldId, "IN", valueList, addClosingQuote, parenthesize))
    }
    else if (outerFilterElements.size > 0) {
      Some(createDataFilterInstanceElement(fieldId, "NOT IN", outerFilterElements, addClosingQuote, parenthesize))
    }
    else {
      None
    }
  }

  /**
   * Combine all the data filter instances associated with the user and return a set of strings that represents the filter elements.
   * @param userId User ID
   * @param fieldId Field ID to find the data filters
   * @return A list of filter element strings and excluded filter elements
   */
  def getUserFilterElements(userId: String, fieldId: String): DataFilterElementValues = {
    val user = getUser("id", userId)
    getUserFilterElements(user, fieldId)
  }

  private def prepareFilterElementsValues(
    filterInstances: Traversable[DataFilterInstance]
  ): DataFilterElementValues = {
    val inFilterInstances = getDataFilterElementValues(filterInstances, "IN")
    val notInFilterInstances = getDataFilterElementValues(filterInstances, "NOT IN")
    val equalFilterInstances = getDataFilterElementValues(filterInstances, "=")
    val notEqualFilterInstances = getDataFilterElementValues(filterInstances, "<>")

    val inFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(inFilterInstances)
    val notInFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(notInFilterInstances)
    val equalFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(equalFilterInstances)
    val notEqualFilterElements = getSeperatedDataFilterElementValuesWithoutParenthesis(notEqualFilterInstances)

    val allowed = inFilterElements.toSet ++ equalFilterElements.toSet -- notInFilterElements.toSet -- notEqualFilterElements.toSet
    val notAllowed = notInFilterElements.toSet ++ notEqualFilterElements.toSet
    DataFilterElementValues(allowed, notAllowed)
  }

  private def getDataFilterElementValues(filterInstances: Traversable[DataFilterInstance], filterOperator: String): List[String] = {
    filterInstances.filter(df => df.operator.toUpperCase == filterOperator).map(de => de.value).toList
  }

  private def getSeperatedDataFilterElementValuesWithoutParenthesis(filterInstanceValues: Traversable[String]): Traversable[String] = {
    filterInstanceValues.flatMap(v => removeClosingParenthesis(v).split(',').map(_.trim))
  }

  def updateUserFilterElements(userId: String, filterElement: String, fieldId: String) = {
    val user = getUser("id", userId)
    val dataFilterInstance = user.dataFilterInstances.filter(df => df.dataFilter.fieldId == fieldId).headOption match {
      case None         => createDataFilterInstanceElement(fieldId, "IN", Seq(filterElement), false)
      case Some(filter) => filter.copy(value = s"(${removeClosingParenthesis(filter.value)}, $filterElement)")
    }

    val unchangedFilters = user.dataFilterInstances.filter(f => f.dataFilterId != dataFilterInstance.dataFilterId)
    val updatedUser = user.copy(dataFilterInstances = unchangedFilters ++ Some(dataFilterInstance))

    updateUser(updatedUser)
  }

  def updateUser(user: User) = {
    val unchangedUsers = user.organization.users.filter(u => user.id != u.id)
    val newOrg = user.organization.copy(users = unchangedUsers ++ Some(user))
    updateOrganization(newOrg)
  }

  def updateOrganizationFilterElements(orgId: String, filterElement: String, fieldId: String) = {
    val organization = getOrganizationById(orgId)
    val dataFilterInstance = organization.dataFilterInstances.filter(df => df.dataFilter.fieldId == fieldId).headOption match {
      case None         => createDataFilterInstanceElement(fieldId, "IN", Seq(filterElement), false)
      case Some(filter) => filter.copy(value = s"(${removeClosingParenthesis(filter.value)}, $filterElement)")
    }

    val unchangedFilters = organization.dataFilterInstances.filter(f => f.dataFilterId != dataFilterInstance.dataFilterId)
    val updatedOrganization = organization.copy(dataFilterInstances = unchangedFilters ++ Some(dataFilterInstance))

    updateOrganization(updatedOrganization)
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
   * Find the data filter instances attached to nearest user group or organization that has data filter defined.
   * TODO Need to change the funciton name to a proper one.
   * @param user User object
   * @return A list of sets of data filter instances.
   */
  def getUserDataFilterInstances(user: User): Traversable[DataFilterInstance] = {
    val userFilterFieldIds = user.dataFilterInstances.map { dfi => dfi.dataFilter.fieldId }.toSet
    val userDataFilterInstances = userFilterFieldIds.map { fieldId =>
      getUserFilterInstanceElement(user, fieldId)
    }.flatten

    // get list of group field ids not part of the user datafilters
    val groupFilterFieldIds = user.userGroups.flatMap { ug =>
      ug.dataFilterInstances.map { _.dataFilter.fieldId }
    }.toSet.filterNot(userFilterFieldIds)
    val groupDataFilterInstances = groupFilterFieldIds.map { fieldId =>
      getUserFilterInstanceElement(user, fieldId)
    }.flatten

    // get list of org field ids not part of the user or group datafilters
    val organizationFilterFieldIds = user.organization.dataFilterInstances
      .map { _.dataFilter.fieldId }.toSet
      .filterNot(userFilterFieldIds ++ groupFilterFieldIds)
    val organizationFilterInstances = organizationFilterFieldIds.map { fieldId =>
      getUserFilterInstanceElement(user, fieldId)
    }.flatten

    userDataFilterInstances ++ groupDataFilterInstances ++ organizationFilterInstances
  }

  /**
   * Combine all the data filter instances associated with the user and return a set of strings that represents the filter elements.
   * @param user User ID
   * @param fieldId Field ID to find the data filters
   * @return A list of filter element strings and excluded filter elements
   */
  def getUserFilterElements(user: User, fieldId: String): DataFilterElementValues = {
    val filterInstances = user.dataFilterInstances.filter(df => df.dataFilter.fieldId == fieldId)
    val dataFilterElementValues = prepareFilterElementsValues(filterInstances)
    getUserGroupsFilterElements(fieldId, user, dataFilterElementValues)
  }

  /**
   * This method returns all the parent groups for specific user.
   * @param user
   * @return
   */
  def getAllParentGroups(user: User): List[UserGroup] = {
    user.userGroups.toList ::: getAllAncestors(user)
  }

  /**
   * This method returns all the ancestors for current user, excluding direct parent.
   * This is for indirect user groups showing on the UI.
   * @param user User ID
   * @return A queryable object contains a set of user groups.
   */
  def getAllAncestors(user: User): List[UserGroup] = {
    val parentGroups = user.userGroups
    var result: List[UserGroup] = Nil
    for (parent <- parentGroups) {
      var currentParent = parent
      while (currentParent.parentGroup.nonEmpty) {
        result ::= currentParent.parentGroup.get
        currentParent = currentParent.parentGroup.get
      }
    }
    result
  }

  /**
   * Combine all the data filter instances associated with the organization and return a set of strings that represents the filter elements.
   * @param orgId Organization ID
   * @param fieldId Field ID to find the data filters.
   * @return A list of filter element strings
   */
  def getOrgFilterElements(orgId: String, fieldId: String): List[String] = {
    val org = getOrganizationById(orgId)
    val filterInstances = org.dataFilterInstances.toList
    val filters = _dataServices.getDocuments[DataFilterInfo](Map("fieldId" -> fieldId))

    val inFilterInstances = filterInstances.filter(df => df.operator == "IN")
    val notInFilterInstances = filterInstances.filter(df => df.operator == "NOT IN")
    val equalFilterInstances = filterInstances.filter(df => df.operator == "=")
    val notEqualFilterInstances = filterInstances.filter(df => df.operator == "<>")

    combineFilterElements(filters, inFilterInstances, notInFilterInstances, equalFilterInstances, notEqualFilterInstances)
  }

  private def getUserOrganizationFilterElements(
    fieldId:                 String,
    user:                    User,
    dataFilterElementValues: DataFilterElementValues
  ): DataFilterElementValues = {
    val orgFilterInstances = user.organization.dataFilterInstances.filter(df => df.dataFilter.fieldId == fieldId)
    val orgDataFilterElementValues = prepareFilterElementsValues(orgFilterInstances)
    val notAllowed = (orgDataFilterElementValues.notAllowed -- dataFilterElementValues.allowed) ++ dataFilterElementValues.notAllowed
    val allowed = (orgDataFilterElementValues.allowed ++ dataFilterElementValues.allowed) -- notAllowed
    DataFilterElementValues(allowed, notAllowed)
  }

  private def getUserGroupsFilterElements(
    fieldId:                 String,
    user:                    User,
    dataFilterElementValues: DataFilterElementValues
  ) = {
    val groupFilterInstances = getAllParentGroups(user).flatMap(ug => ug.dataFilterInstances.filter(df => df.dataFilter.fieldId == fieldId))
    val groupDataFilterElementValues = prepareFilterElementsValues(groupFilterInstances)
    val notAllowed = (groupDataFilterElementValues.notAllowed -- dataFilterElementValues.allowed) ++ dataFilterElementValues.notAllowed
    val allowed = (groupDataFilterElementValues.allowed ++ dataFilterElementValues.allowed) -- notAllowed
    val combinedDataFilterElementValues = DataFilterElementValues(allowed, notAllowed)
    getUserOrganizationFilterElements(fieldId, user, combinedDataFilterElementValues)
  }

  /**
   * Combine all the data filter instances associated with the user group and return a set of strings that represents the filter elements.
   * @param group Group ID
   * @param fieldId Field ID to find the data filters.
   * @return A list of filter element strings
   */
  def getUserGroupFilterElements(group: UserGroup, fieldId: String): List[String] = {
    val filters = _dataServices.getDocuments[DataFilterInfo](Map("fieldId" -> fieldId))
    val filterInstances = group.dataFilterInstances

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
  def combineFilterElements(filters: List[DataFilterInfo], inFilterInstances: List[DataFilterInstance], notInFilterInstances: List[DataFilterInstance],
                            equalFilterInstances: List[DataFilterInstance], notEqualFilterInstances: List[DataFilterInstance]): List[String] = {
    val inFilterElements = getFilterElement(filters, inFilterInstances)
    val notInFilterElements = getFilterElement(filters, notInFilterInstances)
    val equalFilterElements = getFilterElement(filters, equalFilterInstances)
    val notEqualFilterElements = getFilterElement(filters, notEqualFilterInstances)

    (inFilterElements.toSet ++ equalFilterElements.toSet -- notInFilterElements.toSet -- notEqualFilterElements.toSet).toList
  }

  /**
   * Get the filter element list from all the filter instances and filters passed in.
   * @param filters List of data filter objects.
   * @param filterInstances List of data filter instance objects.
   * @return A list of filter element strings
   */
  def getFilterElement(filters: List[DataFilterInfo], filterInstances: List[DataFilterInstance]): List[String] = {
    filterInstances.filter(fi => filters.map(_.filterId).contains(fi.dataFilterId)).map(_.value).flatMap(v => removeChar(v).split(','))
  }

  /**
   * Remove unnecessary characters
   * @param v String value
   * @return String with "\(\)\s" removed.
   */
  private def removeChar(v: String): String = {
    val rgx = new Regex("(\\s+)?(\\*)?(\\()?(\\))?")
    rgx.replaceAllIn(v, "")
  }

  def getObjectId = Guid[String].random.id

  def getUserGroups(orgId: String): Traversable[UserGroup] = {
    getOrganizationById(orgId).userGroups
  }

  def getOrganizationById(orgId: String): Organization = {
    getOrganization(orgId) match {
      case Some(org) => org
      case None      => throw new OrganizationIDNotFoundException(orgId)
    }
  }

  def getUserGroup(groupId: String, orgId: String): UserGroup = {
    getUserGroup(getOrganizationById(orgId), groupId)
  }

  def getUserGroup(groupId: String): UserGroup = {
    _dataServices.getDocuments[Organization](Map("userGroups.id" -> groupId)).headOption match {
      case None      => throw new GroupIDNotFoundException(groupId)
      case Some(org) => getUserGroup(org, groupId)
    }
  }

  def getUserGroup(organization: Organization, groupId: String): UserGroup = {
    val groups = organization.userGroups.filter(_.id == groupId)
    if (groups.isEmpty) {
      throw new GroupIDNotFoundException(groupId)
    }
    groups.head
  }

  def getUserGroupsByGroupType(groupTypeId: String): Traversable[UserGroup] = {
    UMDataServices().getDocument[Organization](Map("userGroups.groupTypeId" -> groupTypeId)).map {
      org => org.userGroups.filter(ug => ug.groupTypeId == Some(groupTypeId))
    }.getOrElse(Seq())
  }

  def getChildUserGroups(parentId: String): Traversable[UserGroup] = {
    getUserGroup(parentId).organization.userGroups.filter(_.parentGroupId == Some(parentId))
  }

  def getChildUserGroups(parentId: String, orgId: String): Traversable[UserGroup] = {
    getUserGroups(orgId).filter(_.parentGroupId == Some(parentId))
  }

  def getChildUserGroups(group: UserGroup): Traversable[UserGroup] = {
    getChildUserGroups(group.id, group.orgId.get)
  }

  def getUsersOfGroup(groupId: String): Traversable[User] = {
    getUsersOfGroup(getUserGroup(groupId))
  }

  def getUsersOfGroup(groupId: String, orgId: String): Traversable[User] = {
    getOrganizationById(orgId).users.filter(u => u.userGroupIds.contains(groupId))
  }

  def getUsersOfGroup(group: UserGroup): Traversable[User] = {
    group.organization.users.filter(u => u.userGroupIds.contains(group.id))
  }

  def getGroupType(groupTypeId: String): GroupType = {
    UMDataServices().getDocument[Organization](Map("groupTypes.id" -> groupTypeId)) match {
      case None => throw new GroupTypeIDNotFoundException(groupTypeId)
      case Some(org) =>
        val groupType = org.groupTypes.find(_.id == groupTypeId)
        groupType.foreach(_.organization = org)
        groupType.getOrElse(
          throw new GroupTypeIDNotFoundException(groupTypeId)
        )
    }
  }

  def getAllApplicationRoles(): Traversable[AppRoleInfo] = {
    UMDataServices().getDocuments[ApplicationInfo](Map()).flatMap(
      app =>
        app.appRoles.map(
          role => new AppRoleInfo(role.id, role.name, None)
        )
    )
  }

  def getPasswordResetRequest(token: String): Option[PasswordResetRequest] = {
    _dataServices.getDocuments[PasswordResetRequest](Map("requestToken" -> token)).headOption
  }

  def removePasswordResetRequest(id: String): Unit = {
    _dataServices.removeDocuments[PasswordResetRequest](Map("id" -> id))
  }
}

case class DataFilterElementValues(
  allowed:    Set[String],
  notAllowed: Set[String]
)
