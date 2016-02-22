package com.sentrana.biq.core

import com.sentrana.usermanagement.domain.document._

object RepositoryPermissions {

  def getOrganizations(repositoryId: String): Iterable[String] = {

    var organizationRepositoryPermissions: Map[String, List[String]] = Map()
    val orgs = UMDataServices.getOrganizations

    orgs.foreach(org => organizationRepositoryPermissions += (org.name -> UMDataServices.getOrgFilterElements(org.id, "REPOSITORY_KEY")))

    organizationRepositoryPermissions.keys.filter(key => organizationRepositoryPermissions(key).contains(repositoryId))
  }
}