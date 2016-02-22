package com.sentrana.biq.domain.document

import com.sentrana.appshell.domain.{ DataServices, MongoDataServices }
import com.sentrana.biq.datacontract.DerivedColumn
import com.sentrana.biq.exceptions.DerivedColumnIDNotFoundException
import play.api.Configuration

/**
 * Created by szhao on 5/1/2015.
 */

object BIQDataServices {

  lazy private val _dataServices = MongoDataServices("biq")

  def apply() = _dataServices

  def getDerivedColumn(derivedColumnId: String): DerivedColumn = {
    val dc = _dataServices.getDocument[DerivedColumn](
      Map("id" -> derivedColumnId)
    )
    dc.getOrElse(
      throw new DerivedColumnIDNotFoundException(derivedColumnId)
    )
  }

  def getUserDerivedColumns(repositoryId: String, userId: String): Traversable[DerivedColumn] = {
    _dataServices.getDocuments[DerivedColumn](
      Map("dataSource" -> repositoryId, "createUserId" -> userId)
    )
  }

  def getRepositoryDerivedColumns(repositoryId: String): Traversable[DerivedColumn] = {
    _dataServices.getDocuments[DerivedColumn](
      Map("dataSource" -> repositoryId)
    )
  }

}