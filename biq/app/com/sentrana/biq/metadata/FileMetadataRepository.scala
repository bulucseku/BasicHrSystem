package com.sentrana.biq.metadata

import java.io.File

import com.sentrana.appshell.metadata._
import com.sentrana.appshell.utils.FileUtils
import com.sentrana.biq.core._
import com.sentrana.biq.datacontract.MetricDimensionMappingInfo

import scala.collection.mutable
import scala.util.{ Failure, Success, Try }
import scala.xml.Node

/**
 * Created by william.hogben on 2/3/2015.
 */
class FileMetadataRepository extends MetadataRepository {

  val configFolderLocation: String = "conf"

  val metadataMap: mutable.Map[String, Repository] = mutable.Map[String, Repository]()

  override def loadAllMetadata(): Unit = loadSomeMetadata{ _ => true }

  override def reloadMetadata(organization: String): Unit = loadSomeMetadata{ _.getName == organization }

  private def loadSomeMetadata(filterFolders: File => Boolean): Unit = {
    for {
      repositoryFile <- loadSomeRepo(filterFolders)
      repository <- readRepositories(repositoryFile.getAbsolutePath)
    } metadata.update(repository.id, repository)
  }

  private def loadSomeRepo(filterFolders: File => Boolean): Seq[File] = {
    val baseFolder = new File(configFolderLocation)
    val folderContents = Some(baseFolder.listFiles) // returns null if not a directory
    for {
      folders <- folderContents.map{ _.filter{ _.isDirectory } }.toSeq
      clientFolder <- folders.filter{ filterFolders }
      repositoryFile <- clientFolder.listFiles.filter{ _.isFile }.filter{ _.getName.matches(""".*\.xml$""") }
    } yield repositoryFile
  }

  def readConnections: Seq[RepositoryConnection] = {
    for {
      repositoryFile <- loadSomeRepo(_ => true)
      conn <- parseConfigFile[RepositoryConnection](repositoryFile.getAbsolutePath) match {
        case Success(repositoryConnection) =>
          Some(repositoryConnection)
        case Failure(e) =>
          loggerForInit.error("Error loading connection configuration. Error message: " + e.getMessage)
          None
      }
    } yield conn
  }

  def readRepositories(filePath: String): Option[Repository] = {
    val parsed = parseConfigFile[Repository](filePath)
    parsed match {
      case Success(repository) =>
        Some(repository)
      case Failure(e) =>
        loggerForInit.error("Error loading repository. Error message: " + e.getMessage)
        None
    }
  }

  def getRepository(repositoryId: String): Option[Repository] = {
    metadata.get(repositoryId).find(_.id == repositoryId)
  }

  def loadRepositoryDataFilterMappings(repositoryId: String): Map[String, String] = {
    val fileSeparator = java.io.File.separator
    val filterFile = new File(configFolderLocation + fileSeparator + repositoryId + fileSeparator + "DataFilterMapping.xml")
    val maps = readDataFilterMapping(filterFile.getAbsolutePath)
    maps.get(repositoryId) match {
      case Some(map) =>
        map
      case None =>
        Map()
    }
  }

  def loadAllDataFilterMappings: Map[String, Map[String, String]] = {
    val baseFolder = new File(configFolderLocation)
    val filterFiles = FileUtils.recursiveListFiles(baseFolder, """DataFilterMapping\.xml$""".r)
    val maps = filterFiles.map {
      file => readDataFilterMapping(file.getAbsolutePath)
    }
    maps reduce { (a, b) => a ++ b.toList }
  }

  def readDataFilterMapping(filePath: String): Map[String, Map[String, String]] = {
    loadXMLFile(filePath) match {
      case Success(node) => {
        val repoMappings = parseSeq(node \ "repository")(parseDataFilterMap)
        repoMappings.get.toMap[String, Map[String, String]]
      }
      case Failure(e) =>
        loggerForInit.error("Error loading data filter mappings. Error message: " + e.getMessage)
        Map()
    }
  }

  def loadRepositoryMetricsDimensionMappings(repositoryId: String): Seq[MetricDimensionMappingInfo] = {
    //TODO: Need to read the mappings from file
    Seq()
  }

}
