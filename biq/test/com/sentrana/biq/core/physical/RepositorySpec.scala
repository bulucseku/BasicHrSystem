package com.sentrana.biq.core.physical

import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp

import com.sentrana.biq.core.conceptual.{ Metadata, MetricGroup }
import com.sentrana.biq.core.physical.Sql.MySQL.MySqlDataWarehouse
import com.sentrana.biq.core.{ FromXmlSpec, Repository }
import com.sentrana.biq.metadata.{ Connection, MetadataRepository, RepositoryConnection }

/**
 * Created by william.hogben on 1/13/2015.
 */
@DoNotDiscover
class RepositorySpec extends FromXmlSpec with ConfiguredApp {
  val xmlNode = <repository id="repoId" name="Test Repo Id">
      <metadata></metadata>
      <datawarehouse factory="Sentrana.BIQ.Physical.Sql.MySql.MySqlDataWarehouseFactory">
        <configuration commandTimeout="120" rowLimit="100000" />
        <connection connectionString="Server=127.0.0.1 ;Database=database;Uid=sentrana;Pwd=password;port=5029;command timeout=1000;" providerName="MySql.Data.MySqlClient" />
      </datawarehouse>
    </repository>

  "Repository" should {
    "read connection correctly" in {
      val connection = MetadataRepository().readConnections.find(_.name == "MMIB")
      inside(connection) {
        case Some(RepositoryConnection(name, source, connectionType, connectionUrl)) =>
          name mustBe "MMIB"
          source mustBe "Database"
          connectionType mustBe "Npgsql"
          connectionUrl mustBe "Server=redshift-db-01.cf2kn4jlwevq.us-east-1.redshift.amazonaws.com;Database=sysco;User Id=biq_dev;Password=sDGmln)*2ng;port=5439;command timeout=1000;"
      }
    }

    "read dataFilters for MMIB correctly" in {
      val mappings = MetadataRepository().loadRepositoryDataFilterMappings("MMIB")
      mappings("CITY") mustBe "FiscalQuarterId"
    }
  }

  "Repository.fromXml" should {
    implicit def fromXml = Repository.fromXml _

    "succcessfuly parse a repository with all fields" in {
      val repo = Repository.fromXml(xmlNode)
      inside(repo.success.value) {
        case Repository(id, name, showData, metaData, dataWarehouse) =>
          id mustBe "repoId"
          name mustBe "Test Repo Id"
          showData mustBe false
          metaData mustBe Metadata(
            Nil, Nil, Nil,
            List(
              MetricGroup("ACTUAL", "ACTUAL", Some("ACTUAL"), List()),
              MetricGroup("PERCENTAGE", "PERCENTAGE", Some("PERCENTAGE"), List())
            )
          )
          inside(dataWarehouse) {
            case MySqlDataWarehouse(repoId, tables, configuration, connection) =>
              repoId mustBe "repoId"
              tables mustBe Nil
              configuration mustBe Map("commandTimeout" -> "120", "rowLimit" -> "100000")
              connection mustBe Connection("MySql.Data.MySqlClient", "Server=127.0.0.1 ;Database=database;Uid=sentrana;Pwd=password;port=5029;command timeout=1000;")
          }
      }
    }

    "Fail to parse a repository without repository Id" in {
      failWithoutAttr("id", xmlNode)
    }

    "Fail to parse a repository without name" in {
      failWithoutAttr("name", xmlNode)
    }

    "Succeed in parsing a repository without a datawarehouse" in {
      succeedWithoutAttr[Repository]("datawarehouse", xmlNode, (a, b) => b == a.copy(dataWarehouse = null))
    }

    "Succeed in parsing a repository without metadata" in {
      succeedWithoutAttr[Repository]("metadata", xmlNode, (a, b) => b == a.copy(metaData = null))
    }
  }
}
