package com.sentrana.biq.core

import com.sentrana.appshell.metadata._
/**
 * Created by szhao on 1/8/2015.
 */
trait RepositoryManager {
  def repositoryId: String

  def repositoryName: String

  def destroy()

  def loadRepository: Repository
}

import scala.reflect.io.File

class XmlRepositoryManager(override val repositoryId: String, override val repositoryName: String, repositoryDefinitionFile: File) extends RepositoryManager {

  def destroy() = {
    if (repositoryDefinitionFile.exists) repositoryDefinitionFile.delete()
  }

  def loadRepository: Repository = {
    val repo = parseConfigFile[Repository](repositoryDefinitionFile.path).get

    repo.dataWarehouse.analyze()
    repo.refreshAttributeElements
    // repo.metadataFactory.ReadConstraints(metadataNode["constraints"], repo.metadata)
    repo
  }
}
