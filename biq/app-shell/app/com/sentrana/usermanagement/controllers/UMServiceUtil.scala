package com.sentrana.usermanagement.controllers

import com.sentrana.appshell.domain.DataServices
import com.sentrana.usermanagement.authentication.{ Guid, PasswordHash }
import com.sentrana.usermanagement.domain._
import com.sentrana.usermanagement.datacontract._
import org.squeryl.PrimitiveTypeMode._
import org.json4s.native.Serialization.{ read, write }
import JsonFormat.formats
import java.sql.Timestamp
import com.sentrana.usermanagement.domain.DataFilterInstance
import scala.Some
import com.sentrana.usermanagement.domain.User
import com.sentrana.usermanagement.domain.DataFilter
import com.sentrana.usermanagement.domain.ApplicationRole
import com.sentrana.usermanagement.datacontract.GroupTypeInfo
import com.sentrana.usermanagement.domain.Application
import com.sentrana.usermanagement.domain.GroupType

/**
 * Created by szhao on 2/25/14.
 */
object UMServiceUtil {

  /**
   * Convert Domain Object: 'Application' to Data Contact Object: 'ApplicationInfo'
   * @param application
   */
  def ConvertApplicationToApplicationInfo(application: Application): ApplicationInfo = {
    new ApplicationInfo(application.id.toString, application.appName, None, None, null)
  }

  /**
   * Convert Data Contract Object: 'ApplicationInfo' to Domain Object: 'Application'
   * @param application desired object
   * @param applicationInfo source object
   * @return Application
   */
  def convertApplicationInfoToApplication(application: Application, applicationInfo: ApplicationInfo): Application = {
    new Application(applicationInfo.id.toInt, applicationInfo.name, "")
  }

  /**
   * Convert Domain Object: 'ApplicationRole' to Data Contact Object: 'AppRoleInfo'
   * @param applicationRole
   * @return AppRoleInfo
   */
  def convertApplicationRoleToAppRoleInfo(applicationRole: ApplicationRole): AppRoleInfo = {
    if (applicationRole == null) None
    new AppRoleInfo(applicationRole.id.toString, applicationRole.roleName)
  }

  /**
   * Convert Domain Object: 'UserGroup' to Data Contact Object: 'GroupInfo'
   * @param userGroup
   * @return GroupInfo
   */
  def convertUserGroupToGroupInfo(userGroup: UserGroup): GroupInfo = {
    convertUserGroupToGroupInfo(userGroup, loadChildGroups = false, loadGroupPath = true)
  }

  /**
   * Convert Domain Object: 'UserGroup' to Data Contact Object: 'GroupInfo'
   * @param userGroup
   * @param loadChildGroups
   * @param loadGroupPath
   * @return GroupInfo
   */
  def convertUserGroupToGroupInfo(userGroup: UserGroup, loadChildGroups: Boolean, loadGroupPath: Boolean): GroupInfo = {
    if (userGroup == null) None
    val ug = userGroup
    val parentGroup = {
      userGroup.parentGroupId match {
        case None => null
        //case _ => from(UMDataServices.userGroups)(ug => where(ug.id === userGroup.id) select new GroupInfo(
        case _ => Some(new GroupInfo(
          ug.parentUserGroup.groupName, Some(getSingleOrganization(ug.orgId)), None, None, None,
          if (ug.parentUserGroup.applicationRoles != None)
            Some(ug.parentUserGroup.applicationRoles.toList.map(ar => convertApplicationRoleToAppRoleInfo(ar)))
          else None,
          if (ug.parentUserGroup.dataFilterInstances != None)
            Some(ug.parentUserGroup.dataFilterInstances.toList.map(dfi => convertDataFilterInstanceToDataFilterInstanceInfo(dfi)))
          else None,
          None,
          None,
          ug.parentGroupId.get.toString
        ))
      }
    }

    //val organization = convertOrganizationToOrganizationInfo(userGroup.organization)
    val groupType = userGroup.groupTypeId match {
      case None => null
      case _    => Some(new GroupTypeInfo(userGroup.groupTypeId.map(_.toString), userGroup.groupType.groupTypeName, Some(convertOrganizationToOrganizationInfo(userGroup.groupType.organization))))
    }

    val appRoles = userGroup.applicationRoles.toList.map(ar => convertApplicationRoleToAppRoleInfo(ar))
    val dataFilterInstances = userGroup.dataFilterInstances.toList.map(dfi => convertDataFilterInstanceToDataFilterInstanceInfo(dfi))

    val groupPath = if (loadGroupPath) getGroupPath(userGroup) else null
    val newGroupInfo = new GroupInfo(userGroup.groupName, Some(getSingleOrganization(userGroup.orgId)),
      parentGroup, groupType, Some(groupPath), Some(appRoles), Some(dataFilterInstances), None, None, userGroup.id.toString)

    if (loadChildGroups)
      convertMembersFromGroupInfo(userGroup, newGroupInfo)
    else
      newGroupInfo
  }

  def convertMembersFromGroupInfo(userGroup: UserGroup, dataContractGroup: GroupInfo): GroupInfo = {
    // adding child groups
    val childGroups = UMDataServices.getAllGroupsUnderGroup(userGroup.id)
    val childGroupInfos = childGroups.map(cg => convertUserGroupToGroupInfo(cg))

    // adding users
    // val users = UMDataServices.users.where(u => u.userGroups.where(ug => ug.id === userGroup.id).size gt 0)
    val users = UMDataServices.getUsersOfGroup(userGroup.id).toList
    val userInfos = users.map(u => convertUserToUserInfo(u)).toList

    new GroupInfo(dataContractGroup.name, Some(getSingleOrganization(userGroup.orgId)),
      dataContractGroup.parentGroup, dataContractGroup.groupType,
      dataContractGroup.groupPath, dataContractGroup.appRoles, dataContractGroup.dataFilterInstances, Some(childGroupInfos), Some(userInfos), dataContractGroup.id)
  }

  /**
   * Convert Data Contract Object: 'OrganizationInfoMin' to Domain Object: 'Organization'
   * @param organization destination object
   * @param organizationInfoMin source object
   * @return Organization
   */
  def convertOrganizationInfoMinToOrganization(organization: Organization, organizationInfoMin: OrganizationInfoMin): Organization = {
    if (organizationInfoMin == null) null

    val applications = organizationInfoMin.applications.map(a => convertApplicationInfoToApplication(null, a))
    var dataFilterInstances = organizationInfoMin.dataFilterInstances.map(d => convertDataFilterInstanceInfoToDataFilterInstance(d))

    val org = {
      if (organization == null) {
        new Organization(0, 0, organizationInfoMin.name, None, organizationInfoMin.status.get, Some(false))
      }
      else {
        organization.orgName = organizationInfoMin.name
        organization.orgStatus = organizationInfoMin.status.get
        organization
      }
    }
    UMDataServices.organizations.insertOrUpdate(org)

    // Insert or update child records including org application and data filter instances.
    org.applications.dissociateAll
    applications.map(a => org.applications.associate(a))
    org.dataFilterInstances.dissociateAll
    // There could be new dataFilterInstances created, we need to save them first
    dataFilterInstances = dataFilterInstances.filter(dfi => dfi.id == 0).map(d => new DataFilterInstance(
      d.id, d.dataFilterId, d.operator, d.value, d.optionType
    )).map(d => UMDataServices.dataFilterInstances.insert(d)) ++ dataFilterInstances.filter(dfi => dfi.id != 0)
    dataFilterInstances.map(d => org.dataFilterInstances.associate(d))
    // Return inserted or updated object
    org
  }

  /**
   * Convert Domain Object: 'User' to Data Contact Object: 'UserInfo'
   * @param user
   * @return UserInfo
   */
  def convertUserToUserInfo(user: User): UserInfo = {
    val organization = convertOrganizationToMinOrganizationInfo(user.organization)
    val appRoles = user.applicationRoles.map(ar => convertApplicationRoleToAppRoleInfo(ar)).toList
    val groupMemberships = user.userGroups.map(ug => convertUserGroupToGroupInfo(ug)).toList
    val dataFilterInstances = user.dataFilterInstances.map(dfi => convertDataFilterInstanceToDataFilterInstanceInfo(dfi)).toList

    new UserInfo(
      user.firstName,
      user.lastName,
      user.userName,
      None,
      user.userEmail.getOrElse(""),
      user.status,
      organization,
      organization.name,
      Some(appRoles),
      Some(dataFilterInstances),
      Some(groupMemberships),
      None,
      user.id.toString,
      user.loginFailureCount
    )
  }

  /**
   * Convert Data Contract Object: 'UserInfoMin' to Domain Object: 'User'
   * @param user desired object
   * @param userInfoMin source object
   * @return User
   */
  def convertUserInfoMinToUserInfo(user: Option[UserInfo], userInfoMin: UserInfoMin): UserInfo = {
    user match {
      case None => {
        new UserInfo(
          firstName           = userInfoMin.firstName.getOrElse(""),
          lastName            = userInfoMin.lastName.getOrElse(""),
          userName            = userInfoMin.userName.getOrElse(""),
          password            = Some(PasswordHash.create(userInfoMin.password.getOrElse("")).toBase64String),
          email               = userInfoMin.email,
          activeStatus        = Some(userInfoMin.activeStatus),
          organization        = userInfoMin.organization,
          orgName             = "",
          appRoles            = None,
          dataFilterInstances = None,
          groupMemberships    = None,
          groupIds            = None,
          id                  = Guid[String].random.id,
          loginFailureCount   = 0
        )
      }
      case Some(u) => {
        u.copy(
          firstName    = userInfoMin.firstName.getOrElse(u.firstName),
          lastName     = userInfoMin.lastName.getOrElse(u.lastName),
          email        = userInfoMin.email,
          activeStatus = Some(userInfoMin.activeStatus),
          password     = if (userInfoMin.password == None) u.password else Some(PasswordHash.create(userInfoMin.password.getOrElse("")).toBase64String)
        )
      }
    }
  }

  def updateUserAssociations(user: User, userInfoMin: UserInfoMin): User = {
    user.applicationRoles.dissociateAll //TODO is this the right way to update ManyToMany relationships?
    user.userGroups.dissociateAll
    user.dataFilterInstances.dissociateAll

    // Update associate
    if (userInfoMin.appRoles != None) {
      val appRoles = userInfoMin.appRoles.get.toList.map(UMServiceUtil.convertAppRoleInfoToApplicationRole)
      appRoles.map(x => user.applicationRoles.associate(x))
    }

    if (userInfoMin.groupMemberships != None) {
      val groups = userInfoMin.groupMemberships.get.toList.map(g => UMDataServices.userGroups.where(ug => ug.id.toString === g.id).head)
      groups.map(x => user.userGroups.associate(x))
    }

    if (userInfoMin.dataFilterInstances != None) {
      var dataFilterInstances = userInfoMin.dataFilterInstances.get.toList.map(UMServiceUtil.convertDataFilterInstanceInfoToDataFilterInstance)
      // There could be new dataFilterInstances created, we need to save them first
      dataFilterInstances = dataFilterInstances.filter(dfi => dfi.id == 0).map(d => new DataFilterInstance(
        d.id, d.dataFilterId, d.operator, d.value, d.optionType
      )).map(d => UMDataServices.dataFilterInstances.insert(d))

      dataFilterInstances.map(x => user.dataFilterInstances.associate(x))
    }

    user
  }

  /**
   * Convert Domain Object: 'UserGroup' to Data Contact Object: 'SearchedGroupInfo'
   * @param userGroup
   * @return
   */
  def convertUserGroupToSearchGroupInfo(userGroup: UserGroup): SearchedGroupInfo = {
    val userGroupInfo = convertUserGroupToGroupInfo(userGroup)
    val userGroupInfoWithMembers = convertMembersFromGroupInfo(userGroup, userGroupInfo)

    new SearchedGroupInfo(
      userGroup.id.toString,
      userGroupInfoWithMembers.childGroups.size,
      userGroupInfoWithMembers.users.size,
      "",
      userGroupInfoWithMembers.name,
      userGroupInfoWithMembers.organization.get,
      userGroupInfoWithMembers.parentGroup.getOrElse(new GroupInfo()),
      userGroupInfoWithMembers.groupType.getOrElse(new GroupTypeInfo(None, "", None)),
      getGroupPath(userGroup),
      userGroupInfoWithMembers.appRoles,
      userGroupInfoWithMembers.dataFilterInstances,
      userGroupInfoWithMembers.childGroups,
      userGroupInfoWithMembers.users
    )
  }

  /**
   * Convert Domain Object: 'UserGroup' to Data Contact Object: 'SearchedGroupInfo'
   * @return
   */
  def convertGroupInfoToSearchGroupInfo(groupInfo: GroupInfo): SearchedGroupInfoNew = {
    new SearchedGroupInfoNew(
      groupInfo.id.toInt,
      groupInfo.childGroups.get.size,
      groupInfo.users.get.size,
      "",
      groupInfo.name,
      groupInfo.organization,
      groupInfo.parentGroup,
      groupInfo.groupType,
      "", //getGroupInfoPath(groupInfo),
      groupInfo.appRoles,
      groupInfo.dataFilterInstances,
      groupInfo.childGroups,
      groupInfo.users
    )
  }

  /**
   * Get group hierarchical path
   * @param userGroup
   * @return
   */
  private def getGroupPath(userGroup: UserGroup): String = {
    var groupPath = ""
    if (userGroup.parentGroupId != None)
      groupPath = getGroupPath(userGroup.parentUserGroup) + " >> "

    groupPath += userGroup.groupName

    if (userGroup.parentGroupId == None && userGroup.organization != null)
      userGroup.organization.orgName + " >> " + groupPath
    else
      groupPath
  }

  /**
   * Get group hierarchical path
   * @param userGroup
   * @return
   */
  private def getGroupInfoPath(userGroup: GroupInfo): String = {
    var groupPath = ""
    if (userGroup.parentGroup != None)
      groupPath = getGroupInfoPath(userGroup.parentGroup.get) + " >> "

    groupPath += userGroup.name

    if (userGroup.parentGroup == None && userGroup.organization != null)
      userGroup.organization.get.name + " >> " + groupPath
    else
      groupPath
  }

  /**
   * Convert Data Contract Object: 'GroupInfo' to Domain Object: 'UserGroup'
   * @param groupInfo source object
   * @return UserGroup
   */
  def convertGroupInfoToUserGroup(groupInfo: GroupInfo): UserGroup = {

    val group = new UserGroup(
      groupInfo.id.toInt,
      groupInfo.name,
      None,
      groupInfo.organization match { case None => None; case _ => Some(groupInfo.organization.get.id.toInt) },
      groupInfo.parentGroup match { case None => None; case _ => Some(groupInfo.parentGroup.get.id.toInt) },
      groupInfo.groupType match { case None => None; case _ => groupInfo.groupType.get.id.map(_.toInt) }
    )

    group.applicationRoles.dissociateAll
    group.dataFilterInstances.dissociateAll

    if (groupInfo.appRoles != None) {
      val appRoles = groupInfo.appRoles.get.toList.map(UMServiceUtil.convertAppRoleInfoToApplicationRole)
      appRoles.map(x => group.applicationRoles.associate(x))
    }

    if (groupInfo.dataFilterInstances != None) {
      var dataFilterInstances = groupInfo.dataFilterInstances.get.toList.map(UMServiceUtil.convertDataFilterInstanceInfoToDataFilterInstance)
      dataFilterInstances = dataFilterInstances.filter(dfi => dfi.id == 0).map(d => new DataFilterInstance(
        d.id, d.dataFilterId, d.operator, d.value, d.optionType
      )).map(d => UMDataServices.dataFilterInstances.insert(d))

      dataFilterInstances.map(x => group.dataFilterInstances.associate(x))
    }

    group
  }

  /**
   * Convert Data Contract Object: 'GroupInfo' to Domain Object: 'UserGroup'
   * @param userGroup desired object
   * @param groupDetail source object
   * @return UserGroup
   */
  def convertGroupDetailToUserGroup(userGroup: UserGroup, groupDetail: GroupDetail): UserGroup = {

    if (userGroup == null) {
      new UserGroup(
        0,
        groupDetail.name,
        None,
        groupDetail.organization match { case None => None; case _ => Some(groupDetail.organization.get.id.toInt) },
        groupDetail.parentGroup match { case None => None; case _ => Some(groupDetail.parentGroup.get.id.toInt) },
        groupDetail.groupType match { case None => None; case _ => groupDetail.groupType.get.id.map(_.toInt) }
      )
    }
    else {
      userGroup.groupName = groupDetail.name
      if (groupDetail.name == None || groupDetail.name.isEmpty()) {
        userGroup.groupName = groupDetail.name
      }

      userGroup.orgId = groupDetail.organization match { case None => None; case _ => Some(groupDetail.organization.get.id.toInt) }
      userGroup.parentGroupId = groupDetail.parentGroup match { case None => None; case _ => Some(groupDetail.parentGroup.get.id.toInt) }
      userGroup.groupTypeId = groupDetail.groupType match { case None => None; case _ => groupDetail.groupType.get.id.map(_.toInt) }

      userGroup.applicationRoles.dissociateAll
      userGroup.dataFilterInstances.dissociateAll

      if (groupDetail.appRoles != None) {
        val appRoles = groupDetail.appRoles.get.toList.map(UMServiceUtil.convertAppRoleInfoToApplicationRole)
        appRoles.map(x => userGroup.applicationRoles.associate(x))
      }

      if (groupDetail.dataFilterInstances != None) {
        var dataFilterInstances = groupDetail.dataFilterInstances.get.toList.map(UMServiceUtil.convertDataFilterInstanceInfoToDataFilterInstance)
        dataFilterInstances = dataFilterInstances.filter(dfi => dfi.id == 0).map(d => new DataFilterInstance(
          d.id, d.dataFilterId, d.operator, d.value, d.optionType
        )).map(d => UMDataServices.dataFilterInstances.insert(d))

        dataFilterInstances.map(x => userGroup.dataFilterInstances.associate(x))
      }

      userGroup
    }
  }

  /**
   * Convert Data Contract Object: 'DataFilterInstanceInfo' to Domain Object: 'DataFilterInstance'
   * @param dataFilterInstanceInfo
   * @return DataFilterInstance
   */
  def convertDataFilterInstanceInfoToDataFilterInstance(dataFilterInstanceInfo: DataFilterInstanceInfo): DataFilterInstance = {
    if (dataFilterInstanceInfo == null) null

    new DataFilterInstance(dataFilterInstanceInfo.id.toInt, dataFilterInstanceInfo.dataFilter.filterId.toInt,
      dataFilterInstanceInfo.operator, dataFilterInstanceInfo.value, dataFilterInstanceInfo.optionType)
  }

  /**
   * Convert Data Contract Object: 'DataFilterInfo' to Domain Object: 'DataFilter'
   * @param dataFilter desired object
   * @param dataFilterInfo source object
   * @return DataFilter
   */
  def convertDataFilterInfoToDataFilter(dataFilter: DataFilter, dataFilterInfo: DataFilterInfo): DataFilter = {
    if (dataFilterInfo == null) null

    new DataFilter(dataFilterInfo.filterId.toInt, dataFilterInfo.fieldId,
      dataFilterInfo.fieldDesc, dataFilterInfo.dataType,
      dataFilterInfo.displayName, dataFilterInfo.repositoryConnectionName,
      dataFilterInfo.allowableValuesQuery, dataFilterInfo.showValueOnly)
  }

  /**
   * Convert Domain Object: 'DataFilterInstance' to Data Contact Object: 'DataFilterInstanceInfo'
   * @param dataFilterInstance
   * @return
   */
  def convertDataFilterInstanceToDataFilterInstanceInfo(dataFilterInstance: DataFilterInstance): DataFilterInstanceInfo = {
    if (dataFilterInstance == null) None
    new DataFilterInstanceInfo(
      dataFilterInstance.id.toString,
      dataFilterInstance.operator,
      dataFilterInstance.value,
      Some(getDataFilterValueTexts(dataFilterInstance.dataFilter, dataFilterInstance.value)),
      convertDataFilterToDataFilterInfo(dataFilterInstance.dataFilter),
      dataFilterInstance.optionType
    )
  }

  def getDataFilterValueTexts(dataFilter: DataFilter, value: String): String = {
    /*
    if (dataFilter != null)
    {
      var isSingleValue = (value.IndexOf('(') != 0 && value.LastIndexOf(')') != value.Length - 1)

      if (isSingleValue)
      {
        if (dataFilter.filterType != "INT")
        {
          value = "('" + value + "')"
        }
        else
        {
          value = "(" + value + ")"
        }
      }
      val query = "SELECT * FROM (" + dataFilter.allowableValuesQuery + ") df WHERE df.value IN " + value
      var reader = new DBDataReader()
      var filterValueList = reader.GetLookupData(dataFilter.repositoryConnectionName, query)
      if (filterValueList != null && filterValueList.Count > 0)
      {
        retText = filterValueList.Aggregate(retText, (current, filterVal) => current + (filterVal.Value + ", "))
        retText = retText.TrimEnd().TrimEnd(',')
        if (!isSingleValue)
        {
          retText = "(" + retText + ")"
        }
      }
    }
    */
    ""
  }

  /**
   * Convert Domain Object: 'DataFilter' to Data Contact Object: 'DataFilterInfo'
   * @param dataFilter
   * @return
   */
  def convertDataFilterToDataFilterInfo(dataFilter: DataFilter): DataFilterInfo = {
    if (dataFilter == null) None

    new DataFilterInfo(
      dataFilter.id.toString,
      dataFilter.fieldId,
      dataFilter.fieldDesc,
      dataFilter.dataType,
      dataFilter.displayName,
      dataFilter.repositoryConnectionName,
      None,
      dataFilter.allowableValuesQuery, None,
      dataFilter.showValueOnly,
      None
    )
  }

  /**
   * Convert Domain Object: 'GroupType' to Data Contract Object: 'GroupTypeInfo'
   * @param groupTypeInfo
   * @param groupType
   * @return GroupTypeInfo
   */
  def convertGroupTypeToGroupTypeInfo(groupTypeInfo: GroupTypeInfo, groupType: GroupType): GroupTypeInfo = {
    new GroupTypeInfo(Some(groupType.id.toString), groupType.groupTypeName, Some(convertOrganizationToOrganizationInfo(groupType.organization)))
  }

  /**
   * Convert Data Contract Object: 'GroupTypeInfo' to Domain Object: 'GroupType'
   * @param groupTypeId
   * @param groupTypeInfo
   * @return GroupType
   */
  def convertGroupTypeInfoToGroupType(groupTypeId: Option[Int], groupTypeInfo: GroupTypeInfo): GroupType = {
    val groupTypeOrg = groupTypeInfo.organization.getOrElse(
      throw new Exception("Parameter groupTypeInfo must have an organization property")
    )
    new GroupType(groupTypeId.getOrElse(0), groupTypeOrg.id.toInt, groupTypeInfo.name)
  }

  /**
   * Convert json string to UserSearchKeys object
   * @param jsonString
   * @return
   */
  def getParametersFromJsonString(jsonString: String): UserSearchKeys = {
    read[UserSearchKeys](jsonString)
  }

  /**
   * Convert json string to GroupSearchKeys object
   * @param jsonString
   * @return
   */
  def getGroupSearchParametersFromJsonString(jsonString: String): GroupSearchKeys = {
    read[GroupSearchKeys](jsonString)
  }

  /// <summary>
  /// Convert Data Contract Object: 'AppRoleInfo' to DomainObject: 'ApplicationRole'
  /// </summary>
  /// <param name="appRoleInfo">source object</param>
  /// <returns>ApplicationRole</returns>
  def convertAppRoleInfoToApplicationRole(appRoleInfo: AppRoleInfo): ApplicationRole = {
    new ApplicationRole(appRoleInfo.id.toInt, appRoleInfo.name, "", 0)
  }

  /**
   * Convert Domain Object: 'Organization' to Data Contact Object: 'OrganizationInfo'
   * @param organization
   * @return OrganizationInfo
   */
  def convertOrganizationToOrganizationInfo(organization: Organization): OrganizationInfo = {
    val applications: List[ApplicationInfo] = {
      if (organization.applications == null) None

      organization.applications.map(app => {
        val appRoleInfos = UMDataServices.applications.where(a => a.id === app.id).single.applicationRoles.toList
          .map(ar => convertApplicationRoleToAppRoleInfo(ar))
        new ApplicationInfo(
          app.id.toString,
          app.appName,
          None,
          None,
          appRoleInfos
        )
      }).toList
    }.sortBy(_.name)

    val dataFilterInstances = {
      if (organization.dataFilterInstances == null) None
      organization.dataFilterInstances.toList.map(d => convertDataFilterInstanceToDataFilterInstanceInfo(d))
    }
    new OrganizationInfo(
      organization.orgName,
      Some(organization.orgStatus),
      Some(applications),
      Some(dataFilterInstances),
      organization.id.toString,
      None,
      None,
      None
    )
  }

  /**
   * Convert Domain Object: 'Organization' to Data Contact Object: 'OrganizationInfo', without data filter instances attached.
   * @param organization
   * @return
   */
  def convertOrganizationToMinOrganizationInfo(organization: Organization): OrganizationInfo = {
    val applications: List[ApplicationInfo] = {
      if (organization.applications == null) None

      organization.applications.map(app => {
        val appRoleInfos = UMDataServices.applications.where(a => a.id === app.id).single.applicationRoles.toList
          .map(ar => convertApplicationRoleToAppRoleInfo(ar))
        new ApplicationInfo(
          app.id.toString,
          app.appName,
          None,
          None,
          appRoleInfos
        )
      }).toList
    }.sortBy(_.name)

    new OrganizationInfo(
      organization.orgName,
      Some(organization.orgStatus),
      Some(applications),
      None,
      organization.id.toString,
      None,
      None,
      None
    )
  }

  /**
   * Get Organization from persistence service and return DataContract object
   * @param orgId
   * @return
   */
  def getSingleOrganization(orgId: Option[Int]): OrganizationInfo = {
    //Monitor.Enter(lockObj, ref lockWasTaken)
    val orgList = UMDataServices.organizations.where(org => org.id === orgId).toList
    if (orgList.size == 0) null
    else {
      val organizationInfo = UMServiceUtil.convertOrganizationToOrganizationInfo(orgList.head)
      organizationInfo.copy(
        userCount  = Some(UMDataServices.users.where(u => u.orgId === orgList.head.id).size),
        groupCount = Some(UMServiceUtil.getOrganizationAllChildGroups(orgList.head.id).size),
        roleCount  = Some(organizationInfo.applications.get.map(application => application.appRoles.size).sum)
      )
    }
  }

  def getSingleOrganization(orgId: Int): OrganizationInfo = {
    getSingleOrganization(Some(orgId))
  }

  /**
   * Convert DataFilter to DataFilterInfo
   * @param dataFilter
   * @return
   */
  def convertToDataFilterInfo(dataFilter: DataFilter): DataFilterInfo = {
    new DataFilterInfo(
      dataFilter.id.toString,
      dataFilter.fieldId,
      dataFilter.fieldDesc,
      dataFilter.dataType,
      dataFilter.displayName,
      dataFilter.repositoryConnectionName, None,
      dataFilter.allowableValuesQuery, None,
      dataFilter.showValueOnly,
      None
    )
  }

  /**
   * Convert DataFilterInstance To DataFilterInstanceInfo
   * @param dataFilterInstance
   * @return
   */
  def convertToDataFilterInstanceInfo(dataFilterInstance: DataFilterInstance): DataFilterInstanceInfo = {
    new DataFilterInstanceInfo(
      dataFilterInstance.id.toString,
      operator = dataFilterInstance.operator,
      value    = dataFilterInstance.value,
      None,
      convertToDataFilterInfo(dataFilterInstance.dataFilter),
      None
    )
  }

  /**
   * Convert to GroupInfo to represent in UserInterface
   * @param groupModel
   * @return
   */
  def convertToOrganizationGroup(groupModel: UserGroup): OrganizationGroup = {
    new OrganizationGroup(
      groupModel.groupName,
      if (groupModel.parentGroupId != None) Some(new GroupInfo(null, null, null, null, None, null, null, null, null, groupModel.parentGroupId.get.toString)) else None,
      new GroupTypeInfo(groupModel.groupTypeId.map(_.toString), "", null),
      getGroupPath(groupModel),
      groupModel.id.toString,
      null
    )
  }

  /**
   * Convert ApplicationRole to data contract AppRoleInfo
   * @param applicationRole
   * @return
   */
  def convertToAppRoleInfo(applicationRole: ApplicationRole): AppRoleInfo = {
    new AppRoleInfo(
      applicationRole.id.toString,
      applicationRole.roleName
    )
  }

  /**
   * Get all groups for specific Organization
   * organizationId The Organization Id for which we want to get the groups
   */
  def getOrganizationAllChildGroups(organizationId: Int): List[UserGroup] = {
    /*
    val orgGroups = UMDataServices.organizations.where(o => o.id === organizationId).head.userGroups.toList
    if(orgGroups.size > 0)
      orgGroups ::: orgGroups.flatMap(g => getAllChildGroups(g.id)).toList
    else
      orgGroups
      */
    val orgGroups = UMDataServices.userGroups.where(ug => ug.orgId === organizationId).toList
    orgGroups ::: orgGroups.flatMap(g => getAllChildGroups(g.id)).toList
  }

  /**
   * Get list of all sub groups
   * @param groupId
   * @return
   */
  def getAllChildGroups(groupId: Int): List[UserGroup] = {
    val dependentGroups = UMDataServices.getAllGroupsUnderGroup(groupId)
    if (dependentGroups.size <= 0) {
      dependentGroups
    }
    else {
      dependentGroups ::: dependentGroups.flatMap(g => getAllChildGroups(g.id))
    }
  }

  /**
   * Get group ids with subgroups(ids)
   * @param parentId
   * @return
   */
  def getAllChildGroupId(parentId: Int): List[Int] = {
    val dependentGroups = UMDataServices.userGroups.where(ug => ug.parentGroupId === parentId).toList
    if (dependentGroups.size == 0)
      dependentGroups.map(dg => dg.id).toList
    else
      dependentGroups.map(dg => dg.id).toList ::: dependentGroups.flatMap(dg => getAllChildGroupId(dg.id)).toList
  }
}
