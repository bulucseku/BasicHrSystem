package com.sentrana.biq.core.physical

import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.core.conceptual.{ AttributeElement, AttributeForm, Metadata }
import com.sentrana.biq.core.physical.Sql.MySQL.MySqlDataWarehouse
import com.sentrana.biq.core.physical.Sql.PostgreSQL.PostgreSQLDataWarehouse
import com.sentrana.biq.core.{ QueryGenerator, Report }

import scala.concurrent.Future
import scala.language.implicitConversions
import scala.util.{ Failure, Success, Try }
import scala.xml.Node

trait DataWarehouse {
  def repositoryId: String

  def sources: Traversable[Source]

  def getQueryGenerator(report: Report): QueryGenerator

  def queryForElements(form: AttributeForm): Traversable[AttributeElement]

  def queryForTreeElements(form: AttributeForm): Future[Traversable[AttributeElement]]

  def analyze()
}

object DataWarehouse {

  def apply(metadata: Metadata, repositoryId: String, xmlNode: Node): Try[DataWarehouse] = {
    xmlNode.attributeRequired("factory") match {
      case Success("Sentrana.BIQ.Physical.Sql.PostgreSQL.PostgreSQLDataWarehouseFactory") =>
        PostgreSQLDataWarehouse(metadata, repositoryId, xmlNode)
      case Success("Sentrana.BIQ.Physical.Sql.MySql.MySqlDataWarehouseFactory") =>
        MySqlDataWarehouse(metadata, repositoryId, xmlNode)
      case _ => Failure(new IllegalArgumentException("The provided Database Connection type is invalid"))
    }
  }
}