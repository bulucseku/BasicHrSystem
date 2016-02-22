package com.sentrana.usermanagement.controllers

import com.sentrana.appshell.domain.DataServices
import com.sentrana.usermanagement.authentication.{ Guid, PasswordHash }
import com.sentrana.usermanagement.domain.document._
import com.sentrana.usermanagement.datacontract._
import org.json4s.native.Serialization.{ read, write }
import JsonFormat.formats
import java.sql.Timestamp
import scala.Some
import com.sentrana.usermanagement.datacontract.GroupTypeInfo

/**
 * Created by szhao on 2/25/14.
 */
object UMDocumentServiceUtil {

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
    val parentGroup = userGroup.parentGroup.map(convertUserGroupToGroupInfo)

    //val organization = convertOrganizationToOrganizationInfo(userGroup.organization)
    val groupType = userGroup.groupType.map(convertGroupTypeToGroupTypeInfo)

    val appRoles = userGroup.appRoles
    val dataFilterInstances = userGroup.dataFilterInstances.toList.map(convertDataFilterInstanceToDataFilterInstanceInfo)
    val groupPath = if (loadGroupPath) getGroupPath(userGroup) else null

    val newGroupInfo = new GroupInfo(userGroup.name, Some(convertOrganizationToOrganizationInfo(userGroup.organization)),
      parentGroup, groupType, Some(groupPath), Some(appRoles.toList), Some(dataFilterInstances), None, None, userGroup.id)
    if (loadChildGroups)
      convertMembersFromGroupInfo(userGroup, newGroupInfo)
    else
      newGroupInfo
  }

  def convertMembersFromGroupInfo(userGroup: UserGroup, dataContractGroup: GroupInfo): GroupInfo = {
    // adding child groups
    val childGroups = userGroup.organization.userGroups.filter(_.parentGroupId == Some(userGroup.id))
    val childGroupInfos = childGroups.map(convertUserGroupToGroupInfo).toList

    // adding users
    val users = userGroup.organization.users.filter(_.userGroupIds.contains(userGroup.id))
    val userInfos = users.map(convertUserToUserInfo).toList

    new GroupInfo(
      dataContractGroup.name,
      Some(convertOrganizationToOrganizationInfo(userGroup.organization)),
      dataContractGroup.parentGroup,
      dataContractGroup.groupType,
      dataContractGroup.groupPath,
      dataContractGroup.appRoles,
      dataContractGroup.dataFilterInstances,
      Some(childGroupInfos),
      Some(userInfos),
      dataContractGroup.id
    )
  }

  /**
   * Convert Data Contract Object: 'OrganizationInfoMin' to Domain Object: 'Organization'
   * @param organization destination object
   * @param organizationInfoMin source object
   * @return Organization
   */
  def convertOrganizationInfoMinToOrganization(organization: Option[Organization], organizationInfoMin: OrganizationInfoMin): Organization = {
    val dataFilterInstances = organizationInfoMin.dataFilterInstances.map(convertDataFilterInstanceInfoToDataFilterInstance)
    val appIds = organizationInfoMin.applications.map(_.id)
    // TODO We may expose other different kinds of expressions through getDocuments method.
    val applications = UMDataServices().getDocuments[ApplicationInfo](Map()).filter(app => appIds.contains(app.id))

    organization match {
      case Some(org) =>
        val copied = org.copy(
          name                = organizationInfoMin.name,
          status              = organizationInfoMin.status.getOrElse(""),
          dataFilterInstances = dataFilterInstances,
          applications        = applications
        )
        UMDataServices.updateOrganization(copied)
        copied
      case None =>
        val org = Organization(
          id                  = getObjectId,
          name                = organizationInfoMin.name,
          desc                = None,
          status              = organizationInfoMin.status.getOrElse(""),
          isDeleted           = false,
          userGroups          = Seq(),
          applications        = applications,
          dataFilterInstances = dataFilterInstances,
          groupTypes          = Seq(),
          users               = Seq()
        )
        UMDataServices().saveDocument[Organization](org)
        org
    }
  }

  /**
   * Convert Domain Object: 'User' to Data Contact Object: 'UserInfo'
   * @param user
   * @return UserInfo
   */
  def convertUserToUserInfo(user: User): UserInfo = {
    val organizationInfo = convertOrganizationToMinOrganizationInfo(user.organization)
    val groupMemberships = user.organization.userGroups.filter(
      group => user.userGroupIds.contains(group.id)
    ).flatMap(ug => getAllParentGroups(ug, user.organization)).map(ug => convertUserGroupToGroupInfo(ug)).toList.distinct
    val dataFilterInstances = user.dataFilterInstances.map(
      convertDataFilterInstanceToDataFilterInstanceInfo
    ).toList

    new UserInfo(
      user.firstName,
      user.lastName,
      user.userName,
      None,
      user.email,
      user.status,
      organizationInfo,
      organizationInfo.name,
      Some(user.appRoles.toList),
      Some(dataFilterInstances),
      Some(groupMemberships),
      Some(user.userGroupIds),
      user.id.toString,
      user.loginFailureCount
    )
  }

  def convertUserInfoToUser(userInfo: UserInfo): User = {
    val dataFilters = userInfo.dataFilterInstances.getOrElse(Seq()).map(
      convertDataFilterInstanceInfoToDataFilterInstance
    )
    User(
      id                  = userInfo.id,
      userName            = userInfo.userName,
      password            = userInfo.password.getOrElse(""),
      email               = userInfo.email,
      firstName           = userInfo.firstName,
      lastName            = userInfo.lastName,
      status              = userInfo.activeStatus,
      isDeleted           = Some(false),
      dataFilterInstances = dataFilters,
      appRoles            = userInfo.appRoles.getOrElse(Seq()),
      userGroupIds        = userInfo.groupMemberships.getOrElse(Seq()).map(_.id),
      organizationId      = userInfo.organization.id
    )
  }

  /**
   * Convert Data Contract Object: 'UserInfoMin' to Domain Object: 'User'
   * @param user desired object
   * @param userInfoMin source object
   * @return User
   */
  def convertUserInfoMinToUser(user: Option[User], userInfoMin: UserInfoMin): User = {
    user match {
      case None => {
        new User(
          firstName           = userInfoMin.firstName.getOrElse(""),
          lastName            = userInfoMin.lastName.getOrElse(""),
          userName            = userInfoMin.userName.getOrElse(""),
          password            = PasswordHash.create(userInfoMin.password.getOrElse("")).toBase64String,
          email               = userInfoMin.email,
          status              = Some(userInfoMin.activeStatus),
          isDeleted           = None,
          appRoles            = userInfoMin.appRoles.getOrElse(Seq()),
          dataFilterInstances = userInfoMin.dataFilterInstances.map(_.map(convertDataFilterInstanceInfoToDataFilterInstance)).getOrElse(Seq()),
          userGroupIds        = userInfoMin.groupMemberships.map(_.map(_.id)).getOrElse(Seq()),
          id                  = Guid[String].random.id,
          organizationId      = userInfoMin.organization.id
        )
      }
      case Some(u) => {
        val dataFilters = userInfoMin.dataFilterInstances.map(
          _.map(convertDataFilterInstanceInfoToDataFilterInstance)
        ).getOrElse(u.dataFilterInstances)
        u.copy(
          firstName           = userInfoMin.firstName.getOrElse(u.firstName),
          lastName            = userInfoMin.lastName.getOrElse(u.lastName),
          userName            = userInfoMin.userName.getOrElse(u.userName),
          email               = userInfoMin.email,
          status              = Some(userInfoMin.activeStatus),
          password            = if (userInfoMin.password == Some("")) u.password else PasswordHash.create(userInfoMin.password.getOrElse("")).toBase64String,
          appRoles            = userInfoMin.appRoles.getOrElse(u.appRoles),
          dataFilterInstances = dataFilters,
          userGroupIds        = userInfoMin.groupMemberships.map(_.map(_.id)).getOrElse(u.userGroupIds)
        )
      }
    }
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
      userGroup.id,
      userGroupInfoWithMembers.childGroups.map{ _.size }.getOrElse(0),
      userGroupInfoWithMembers.users.map{ _.size }.getOrElse(0),
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
   * Get group hierarchical path
   * @param userGroup
   * @return
   */
  private def getGroupPath(userGroup: UserGroup): String = {
    val groupPath = if (userGroup.parentGroup != None)
      getGroupPath(userGroup.parentGroup.get) + " >> " + userGroup.name
    else userGroup.name

    if (userGroup.parentGroup == None)
      userGroup.organization.name + " >> " + groupPath
    else
      groupPath
  }

  /**
   * Convert Data Contract Object: 'GroupInfo' to Domain Object: 'UserGroup'
   * @param userGroup desired object
   * @param groupDetail source object
   * @return UserGroup
   */
  def convertGroupDetailToUserGroup(userGroup: Option[UserGroup], groupDetail: GroupDetail): UserGroup = {

    userGroup match {
      case None =>
        new UserGroup(
          getObjectId,
          groupDetail.name,
          None,
          groupDetail.parentGroup.map(_.id),
          groupDetail.appRoles.getOrElse(Seq()),
          groupDetail.dataFilterInstances.getOrElse(Seq()).map(convertDataFilterInstanceInfoToDataFilterInstance),
          groupDetail.groupType.flatMap(_.id),
          groupDetail.organization.map(_.id)
        )
      case Some(ug) =>
        ug.copy(
          name                = groupDetail.name,
          desc                = None,
          parentGroupId       = groupDetail.parentGroup.map(_.id),
          appRoles            = groupDetail.appRoles.getOrElse(Seq()),
          dataFilterInstances = groupDetail.dataFilterInstances.getOrElse(Seq()).map(convertDataFilterInstanceInfoToDataFilterInstance),
          groupTypeId         = groupDetail.groupType.flatMap(_.id)
        )
    }
  }

  /**
   * Convert Data Contract Object: 'DataFilterInstanceInfo' to Domain Object: 'DataFilterInstance'
   * @param dataFilterInstanceInfo
   * @return DataFilterInstance
   */
  def convertDataFilterInstanceInfoToDataFilterInstance(dataFilterInstanceInfo: DataFilterInstanceInfo): DataFilterInstance = {
    val instanceId = dataFilterInstanceInfo.id match {
      case "" =>
        getObjectId
      case _ => dataFilterInstanceInfo.id
    }

    new DataFilterInstance(
      instanceId.toString,
      dataFilterInstanceInfo.dataFilter.filterId,
      dataFilterInstanceInfo.operator,
      dataFilterInstanceInfo.value,
      dataFilterInstanceInfo.optionType
    )
  }

  /**
   * Convert Domain Object: 'DataFilterInstance' to Data Contact Object: 'DataFilterInstanceInfo'
   * @param dataFilterInstance
   * @return
   */
  def convertDataFilterInstanceToDataFilterInstanceInfo(dataFilterInstance: DataFilterInstance): DataFilterInstanceInfo = {
    new DataFilterInstanceInfo(
      dataFilterInstance.id,
      dataFilterInstance.operator,
      dataFilterInstance.value,
      None,
      dataFilterInstance.dataFilter,
      dataFilterInstance.optionType
    )
  }

  /**
   * Convert Domain Object: 'GroupType' to Data Contract Object: 'GroupTypeInfo'
   * @param groupType
   * @return GroupTypeInfo
   */
  def convertGroupTypeToGroupTypeInfo(groupType: GroupType): GroupTypeInfo = {
    new GroupTypeInfo(
      Some(groupType.id),
      groupType.groupTypeName,
      Some(convertOrganizationToOrganizationInfo(groupType.organization))
    )
  }

  /**
   * Convert Data Contract Object: 'GroupTypeInfo' to Domain Object: 'GroupType'
   * @param groupTypeId
   * @param groupTypeInfo
   * @return GroupType
   */
  def convertGroupTypeInfoToGroupType(groupTypeId: Option[String], groupTypeInfo: GroupTypeInfo): GroupType = {
    new GroupType(groupTypeId.getOrElse(""), groupTypeInfo.name, Seq())
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

  /**
   * Convert Domain Object: 'Organization' to Data Contact Object: 'OrganizationInfo'
   * @param organization
   * @return OrganizationInfo
   */
  def convertOrganizationToOrganizationInfo(organization: Organization): OrganizationInfo = {
    val dataFilterInstances = organization.dataFilterInstances.toList.map(convertDataFilterInstanceToDataFilterInstanceInfo)
    new OrganizationInfo(
      organization.name,
      Some(organization.status),
      Some(organization.applications.toList),
      Some(dataFilterInstances),
      organization.id,
      userCount  = Some(organization.users.count(!_.isDeleted.getOrElse(false))),
      groupCount = Some(organization.userGroups.size),
      roleCount  = Some(organization.applications.map(application => application.appRoles.size).sum)
    )
  }

  /**
   * Convert Domain Object: 'Organization' to Data Contact Object: 'OrganizationInfo', without data filter instances attached.
   * @param organization
   * @return
   */
  def convertOrganizationToMinOrganizationInfo(organization: Organization): OrganizationInfo = {
    new OrganizationInfo(
      organization.name,
      Some(organization.status),
      Some(organization.applications.toList),
      Some(organization.dataFilterInstances.map(convertDataFilterInstanceToDataFilterInstanceInfo).toList),
      organization.id,
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
  def getSingleOrganization(orgId: String): Option[OrganizationInfo] = {
    //Monitor.Enter(lockObj, ref lockWasTaken)
    UMDataServices.getOrganization(orgId).map{ org =>
      convertOrganizationToOrganizationInfo(org)
    }
  }

  /**
   * Convert to GroupInfo to represent in UserInterface
   * @param groupModel
   * @return
   */
  def convertToOrganizationGroup(groupModel: UserGroup): OrganizationGroup = {
    OrganizationGroup(
      groupModel.name,
      groupModel.parentGroupId.map(id => GroupInfo(id = id)),
      new GroupTypeInfo(groupModel.groupTypeId, "", None),
      getGroupPath(groupModel),
      groupModel.id,
      UMDataServices.getChildUserGroups(groupModel).toList.map(convertToOrganizationGroup)
    )
  }

  /**
   * Get list of all sub groups
   * @param groupId
   * @return
   */
  def getAllChildGroups(groupId: String, organization: Organization): List[UserGroup] = {
    val dependentGroups = organization.userGroups.filter(_.parentGroupId == Some(groupId)).toList
    if (dependentGroups.size <= 0) {
      dependentGroups
    }
    else {
      dependentGroups ::: dependentGroups.flatMap(g => getAllChildGroups(g.id, organization))
    }
  }

  /**
   * Get group ids with subgroups(ids)
   * @param groupId
   * @param org
   * @return
   */
  def getAllChildGroupId(groupId: String, org: Organization): List[String] = {
    val dependentGroups = org.userGroups.filter(_.parentGroupId == Some(groupId)).toList
    if (dependentGroups.size == 0)
      dependentGroups.map(dg => dg.id)
    else
      dependentGroups.map(dg => dg.id) ::: dependentGroups.flatMap(dg => getAllChildGroupId(dg.id, org))
  }

  def getAllParentGroups(userGroup: UserGroup, organization: Organization): List[UserGroup] = {
    val parentGroups = List[UserGroup](userGroup)
    userGroup.parentGroup match {
      case None =>
        parentGroups
      case Some(parentGroup) =>
        parentGroups ::: getAllParentGroups(parentGroup, organization)
    }
  }

  def getObjectId = Guid[String].random.id
}
