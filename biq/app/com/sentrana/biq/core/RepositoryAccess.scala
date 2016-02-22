package com.sentrana.biq.core

import com.sentrana.biq.controllers.ProductCategory
import com.sentrana.usermanagement.domain.Accessible
import com.sentrana.usermanagement.domain.document._

/**
 * Created by tawkir on 3/10/2015.
 */

object RepositoryAccess {

  var accessibleCache = scala.collection.mutable.Map[String, List[Accessible]]()
  val attributeMapping: Map[String, String] = Map("CATEGORY_ID" -> "CategoryName")
  val accessibleMapping: Map[String, AccessibleFactory] = Map("CATEGORY_ID" -> ProductCategory)

  def createAccessible(factory: AccessibleFactory, name: String): Accessible = {
    factory.create(name)
  }

  def getAllAccessibles(repository: Repository, fieldId: String): List[Accessible] = {
    if (!accessibleCache.contains(repository.id)) {
      accessibleCache += (repository.id -> repository.metaData.getAttributeForm(attributeMapping(fieldId))
        .get.allElements.map(e => createAccessible(accessibleMapping(fieldId), e.name)).toList)
    }

    accessibleCache(repository.id)
  }

  def createAllAccessibles(repository: Repository, fieldId: String, filterElements: List[String]): List[Accessible] = {
    val implicitCategories = if (filterElements.length == 0)
      getAllAccessibles(repository, fieldId)
    else
      getAllAccessibles(repository, fieldId).filter(c => false)

    filterElements.map(v => createAccessible(accessibleMapping(fieldId), v)).union(implicitCategories)
  }

  def getOrgAccessibles(repository: Repository, orgId: String): List[Accessible] = {
    val fieldId = "CATEGORY_ID"
    val filterElements =
      UMDataServices.getOrgFilterElements(
        orgId, fieldId
      )

    createAllAccessibles(repository, fieldId, filterElements)
  }
}

trait AccessibleFactory {
  def create(id: String, name: String): Accessible
  def create(name: String): Accessible
}
