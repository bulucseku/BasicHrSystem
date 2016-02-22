package com.sentrana.biq.metadata

import com.sentrana.biq.domain.document.BIQDataServices
import play.api.Configuration

/**
 * Created by williamhogben on 3/25/15.
 */
case class MongoMetadataCache(maxSeqSize: Option[Int] = None) extends MetadataCache {

  lazy val mongoDataServices = BIQDataServices()

  protected def store(attributeFormCacheInfo: AttributeFormCacheInfo) = {
    val forms: Traversable[AttributeFormCacheInfo] = maxSeqSize match {
      case Some(max) =>
        val elements = attributeFormCacheInfo.attributeElements
        if (elements.size > max) {
          elements.grouped(max).zipWithIndex.map {
            case (els, index) =>
              AttributeFormCacheInfo(
                attributeFormCacheInfo.id,
                els,
                attributeFormCacheInfo.repositoryId,
                attributeFormCacheInfo.createDate,
                Some(index)
              )
          }.toList
        }
        else Traversable(attributeFormCacheInfo)
      case None => Traversable(attributeFormCacheInfo)
    }
    forms foreach mongoDataServices.saveDocument[AttributeFormCacheInfo]
  }

  protected def retrieve(attributeFormId: String, repositoryId: String) = {
    val docs = mongoDataServices.getDocuments[AttributeFormCacheInfo](
      Map(
        "repositoryId" -> repositoryId,
        "id" -> attributeFormId
      )
    )

    // join chunked attribute forms
    docs.headOption match {
      case Some(af) =>
        af.chunkId match {
          case Some(chunkId) =>
            val distinct = docs.toList.groupBy(_.chunkId).map(_._2.head)
            val elements = distinct.map(_.attributeElements).reduceLeft((a, b) => a ++ b)
            Some(af.copy(attributeElements = elements.toSeq))
          case _ => Some(af)
        }
      case None => None
    }
  }

  protected def delete(attributeFormId: String, repositoryId: String) = {
    mongoDataServices.removeDocuments[AttributeFormCacheInfo](
      Map(
        "repositoryId" -> repositoryId,
        "id" -> attributeFormId
      )
    )
  }

  protected def deleteAll(repositoryId: String) = {
    mongoDataServices.removeDocuments[AttributeFormCacheInfo](
      Map(
        "repositoryId" -> repositoryId
      )
    )
  }
}

object MongoMetadataCache {

  def apply(conf: Configuration): MongoMetadataCache = {
    MongoMetadataCache(conf.getInt("metadata-cache.mongodb.maxSeqSize"))
  }
}
