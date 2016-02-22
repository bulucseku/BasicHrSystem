package com.sentrana.biq.metadata

import com.sentrana.appshell.configuration.ConfigurationGroup
import com.sentrana.appshell.metadata._
import com.sentrana.biq.core._
import com.sentrana.biq.datacontract.{ DimensionForMappingInfo, AttributesForMappingInfo, MetricDimensionMappingInfo, DataMappingDocument }
import com.sentrana.biq.domain.document.BIQDataServices

import scala.util.{ Failure, Success, Try }
import scala.xml.Node

/**
 * Created by szhao on 2/6/2015.
 */
class MongoMetadataRepository extends MetadataRepository {
  lazy val mongoDataServices = BIQDataServices()
  override def loadAllMetadata(): Unit = loadSomeMetadata{ _ => true }

  override def reloadMetadata(organization: String): Unit = loadSomeMetadata{ _ == organization }

  private def loadSomeMetadata(repoFilter: String => Boolean): Unit = {
    for {
      repo <- loadSomeRepo(repoFilter)
      parsedRepo <- readRepositories(repo.configurations.get.find(config => config.id.toLowerCase() == "repository").get.content.getOrElse(""))
    } metadata.update(repo.id, parsedRepo)
  }

  private def loadSomeRepo(repoFilter: String => Boolean): Seq[ConfigurationGroup] = {
    mongoDataServices.getDocuments[ConfigurationGroup]()
  }

  def readConnections: Seq[RepositoryConnection] = {
    loggerForInit.debug("Reading connections in repositories...")
    for {
      repositoryFile <- loadSomeRepo(_ => true)
      conn <- parseConfig[RepositoryConnection](repositoryFile.configurations.get.find(config => config.id.toLowerCase() == "repository").get.content.getOrElse("")) match {
        case Success(repositoryConnection) =>
          Some(repositoryConnection)
        case Failure(e) =>
          loggerForInit.error("Error loading connection configuration. Error message: " + e.getMessage)
          None
      }
    } yield conn
  }

  def readRepositories(xmlConfig: String): Option[Repository] = {
    loggerForInit.debug("Reading repository configurations...")
    val parsed = parseConfig[Repository](xmlConfig)
    parsed match {
      case Success(repository) =>
        Some(repository)
      case Failure(e) =>
        loggerForInit.error("Error loading repository. Error message: " + e.getMessage + xmlConfig)
        None
    }
  }

  def getRepository(repositoryId: String): Option[Repository] = {
    metadata.get(repositoryId).find(_.id == repositoryId)
  }

  def loadRepositoryDataFilterMappings(repositoryId: String): Map[String, String] = {
    val repository = mongoDataServices.getDocuments[ConfigurationGroup]().find(repository => repository.id == repositoryId)
    repository match {
      case Some(repo) =>
        repo.configurations.flatMap(_.find(config => config.id.toLowerCase() == "datafilter")).flatMap(_.content).flatMap {
          dataFilters =>
            val maps = readDataFilterMapping(dataFilters)
            maps.get(repositoryId)
        }.getOrElse(Map())
      case None => throw new IllegalArgumentException(
        "Repository not found with id: " + repositoryId
      )
    }
  }

  def loadRepositoryMetricsDimensionMappings(repositoryId: String): Seq[MetricDimensionMappingInfo] = {
    val repository = mongoDataServices.getDocuments[ConfigurationGroup]().find(repository => repository.id == repositoryId)
    val metricsAttributeMappingsConfig = repository.get.configurations.get.find(config => config.id.toLowerCase() == "metricdimensionmappings")

    metricsAttributeMappingsConfig match {
      case None =>
        Seq()
      case Some(config) =>
        readMetricsDimensionMapping(config.content.getOrElse(""), repositoryId)
    }
  }

  def loadAllDataFilterMappings: Map[String, Map[String, String]] = {
    val dataFilters = mongoDataServices.getDocuments[DataMappingDocument]()
    val maps = dataFilters.map {
      df => readDataFilterMapping(df.mapping)
    }
    maps reduce { (a, b) => a ++ b.toList }
  }

  def readDataFilterMapping(xmlConfig: String): Map[String, Map[String, String]] = {
    loadXMLString(xmlConfig) match {
      case Success(node) => {
        val repoMappings = parseSeq(node)(parseDataFilterMap)
        repoMappings.get.toMap[String, Map[String, String]]
      }
      case Failure(e) =>
        loggerForInit.error("Error loading data filter mappings. Error message: " + e.getMessage)
        Map()
    }
  }

  def readMetricsDimensionMapping(xmlConfig: String, repoId: String): Seq[MetricDimensionMappingInfo] = {
    loadXMLString(xmlConfig) match {
      case Success(node) => {
        val repoMappings = parseSeq(node \\ "metricGroup")(MetricDimensionMappingInfo.fromXml(repoId))
        repoMappings.get
      }
      case Failure(e) =>
        loggerForInit.error("Error loading metrics dimension mappings. Error message: " + e.getMessage)
        Seq()
    }
  }

}
