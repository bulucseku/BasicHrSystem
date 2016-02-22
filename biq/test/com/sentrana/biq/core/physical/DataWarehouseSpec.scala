package com.sentrana.biq.core.physical

import scala.xml.Node

import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.core.FromXmlSpec
import com.sentrana.biq.core.conceptual.Metadata
import com.sentrana.biq.core.physical.Sql.MySQL.MySqlDataWarehouse

/**
 * Created by william.hogben on 1/28/2015.
 */
class DataWarehouseSpec extends FromXmlSpec {

  val metadata = Metadata(Nil, Nil, Nil, Nil)
  val xmlNode = {
    <datawarehouse factory="Sentrana.BIQ.Physical.Sql.MySql.MySqlDataWarehouseFactory">
      <connection connectionString="Server=127.0.0.1 ;Database=database;Uid=sentrana;Pwd=password;port=5029;command timeout=1000;" providerName="MySql.Data.MySqlClient"/>
      <configuration rowLimit="1000"/>
      <tables>
        <table databaseId="tb1DbId" id="tb1Id">
        </table>
      </tables>
    </datawarehouse>
  }

  "DataWarehouse.apply" should {

    implicit def fromXml(x: Node) = DataWarehouse(metadata, "repoId", x)

    "Parse correctly with all optional fields" in {
      val warehouse = DataWarehouse(metadata, "repoId", xmlNode)
      warehouse.success.value mustBe a[MySqlDataWarehouse]
      val sqlWarehouse = warehouse.success.value.asInstanceOf[MySqlDataWarehouse]
      sqlWarehouse.tables mustBe List(Table("tb1DbId", "tb1Id", Nil, Nil, None))
      sqlWarehouse.repositoryId mustBe "repoId"
      sqlWarehouse.configuration mustBe Map("rowLimit" -> "1000")
    }

    "Fail to parse without factory attribute" in {
      failWithoutAttr("factory", xmlNode)
    }

    "Fail to parse a repository with an invalid factory type" in {
      val xml = xmlNode.removeAttr("factory").addAttr("factory", "bad.factory")
      failWithoutAttr("", xml)
    }
  }

}
