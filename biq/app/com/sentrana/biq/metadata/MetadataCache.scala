package com.sentrana.biq.metadata

import com.sentrana.appshell.domain.DocumentObject
import play.Logger
import play.api.Configuration

/**
 * Created by williamhogben on 3/25/15.
 */
trait MetadataCache {

  protected def store(info: AttributeFormCacheInfo): Unit
  protected def retrieve(attributeFormId: String, repositoryId: String): Option[AttributeFormCacheInfo]
  protected def deleteAll(repositoryId: String): Unit
  protected def delete(attributeFormId: String, repositoryId: String): Unit

  def saveToCache(formInfo: AttributeFormCacheInfo) = {
    Logger.debug("Saving attribute form to cache: " + formInfo.id)
    store(formInfo)
  }

  def loadFromCache(attributeFormId: String, repositoryId: String): Seq[AttributeElementCacheInfo] = {
    val form = retrieve(attributeFormId, repositoryId)
    form.map(_.attributeElements).getOrElse {
      Logger.debug("No Elements found in cache for attribute form: " + attributeFormId)
      Seq()
    }.sortBy(_.value)
  }

  def removeFromCache(repositoryId: String): Boolean = {
    deleteAll(repositoryId)
    true
  }

  def existsInCache(attributeFormId: String, repositoryId: String): Boolean = {
    retrieve(attributeFormId, repositoryId) match {
      case s: Some[AttributeFormCacheInfo] => true
      case _                               => false
    }
  }
}

object MetadataCache {
  private var _useCache: Boolean = false
  def useCache = _useCache
  private var _instance: MetadataCache = _

  def apply(conf: Configuration) = {
    conf.getBoolean("metadata-cache.use-cache") match {
      case Some(true) =>
        _useCache = true
        conf.getString("metadata-cache.type") match {
          case Some("mongo") => _instance = MongoMetadataCache(conf)
          case _             => _useCache = false
        }
      case _ => _useCache = false
    }
  }

  def apply() = _instance
}

case class AttributeElementCacheInfo(
  value:           String,
  rawValue:        String,
  parentElementId: Option[String]
)

case class AttributeFormCacheInfo(
  id:                String,
  attributeElements: Seq[AttributeElementCacheInfo],
  repositoryId:      String,
  createDate:        Long,
  chunkId:           Option[Int]                    = None // In case we need to divide up attribute elements
) extends DocumentObject

object AttributeFormCacheInfo extends DocumentObject {
  override def source = "metadataCache"
}

