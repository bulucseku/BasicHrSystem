package com.sentrana.usermanagement.authentication

import com.sentrana.usermanagement.datacontract.ApplicationInfo
import com.sentrana.usermanagement.domain.Accessible
import com.sentrana.usermanagement.domain.document._

/**
 * Created by szhao on 1/23/14.
 */
class UserSession(
    var user:           User,
    var organization:   Organization,
    var applications:   List[ApplicationInfo],
    var getAccessibles: () => List[Accessible]
)(implicit token: Guid[Session] = null) extends BasicSession(token) {
  var cacheKeyList = List[String]()
  val cache = play.api.cache.Cache
  val sessionData = collection.mutable.Map[String, AnyRef]()

  var accessibles = List[Accessible]()
  var dataFilterElementsDict = collection.mutable.Map[String, List[String]]()
  var dataFilterInstancesDict = collection.mutable.Map[Int, List[Seq[DataFilterInstance]]]()

  def this(user: User, organization: Organization, applications: List[ApplicationInfo]) = this(user, organization, applications, () => null)

  def this(user: User, organization: Organization, applications: List[ApplicationInfo], sessionToken: Guid[Session]) = this(user, organization, applications, () => null)(sessionToken)

  def personalizationFilter: Traversable[DataFilterInstance] = {
    val userFilters = organization.users.find(u => u.id == user.id).headOption.map(_.dataFilterInstances).getOrElse(List())
    userFilters ++ UMDataServices.getUserDataFilterInstances(user)
  }

  def getFilterElement(fieldId: String): Option[List[String]] = {
    if (!dataFilterElementsDict.contains(fieldId)) {
      dataFilterElementsDict.put(fieldId, UMDataServices.getUserFilterElements(user, fieldId).allowed.toList)
    }
    dataFilterElementsDict.get(fieldId)
  }
}
