package com.sentrana.biq.metadata

import com.sentrana.appshell.metadata._
import com.sentrana.biq.core.Repository
import com.sentrana.biq.datacontract.MetricDimensionMappingInfo
import play.api.{ Configuration, Logger }

import scala.collection.mutable
import scala.util.Try
import scala.xml.Node
import com.sentrana.appshell.utils.XmlUtils._

/**
 * Created by Yogisha.Dixit on 12/3/2014.
 */
trait MetadataRepository {

  val loggerForInit: Logger = Logger("loggerForInit")

  val metadata: mutable.Map[String, Repository] = mutable.Map[String, Repository]()

  def dicLookupDataSource: mutable.Map[String, mutable.Map[String, String]] =
    mutable.Map[String, mutable.Map[String, String]]()

  def loadAllMetadata(): Unit

  def loadAllDataFilterMappings(): Map[String, Map[String, String]]

  def loadRepositoryDataFilterMappings(repositoryId: String): Map[String, String]

  def loadRepositoryMetricsDimensionMappings(repositoryId: String): Seq[MetricDimensionMappingInfo]

  def reloadMetadata(organization: String): Unit

  def readConnections: Seq[RepositoryConnection]
  /* For now the connection initialization is tied to Play application.
  Later on when we have a separate database connection management layer, we could uncomment this method in the trait
  def readConnections = {
    metadata.map{
      kv =>
        {
          kv._2.dataWarehouse match {
            case x: SqlDataWarehouse =>
              (kv._1, x.connection)
          }
        }
    }
  }
  */

  def parseDataFilter(node: Node): Try[(String, String)] = {
    for {
      formId <- (node \ "@id").textRequired
      filterId <- (node \ "dataFilter" \ "@id").textRequired
    } yield (filterId, formId)
  }

  def parseDataFilterMap(node: Node): Try[(String, Map[String, String])] = {
    for {
      repoId <- (node \ "@id").textRequired
      maps <- parseSeq(node \ "attributeForm")(parseDataFilter)
      map = maps.toMap[String, String]
    } yield repoId -> map
  }
}

object MetadataRepository {
  @volatile private var _instance: MetadataRepository = _

  def apply(config: Configuration): MetadataRepository = {
    _instance = config.getString("biq.configurationManager.type") match {
      case Some("file") => new FileMetadataRepository
      case _            => new MongoMetadataRepository
    }
    _instance
  }

  def apply(): MetadataRepository = {
    _instance
  }
}