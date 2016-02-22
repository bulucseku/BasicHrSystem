package com.sentrana.biq.core.physical.Sql.MySQL

import com.sentrana.biq.core.conceptual.AttributeElement
import com.sentrana.biq.core.physical.Sql.PostgreSQL.PostgreSQLDataWarehouse
import com.sentrana.biq.core.{ FromXmlSpec, Repository }
import com.sentrana.biq.metadata.MetadataCache
import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await
import scala.concurrent.duration._
import scala.language.postfixOps

/**
 * Created by william.hogben on 2/10/2015.
 */
@DoNotDiscover
class MySqlDataWarehouseSpec extends FromXmlSpec with ConfiguredApp {

  val dataWarehouseXml = {
    <repository xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="MetadataModel.xsd" id="MMIB" name="MarketMover">
      <metadata>
        <dimensions>
          <dimension name="Product">
            <attribute id="MajorClass" name="Major Class" desc="The second level category of a product" attrValueType="DiscreteSeries" filterControl="None">
              <forms>
                <attributeForm id="MajorClassDesc" name="Name" dataType="String" default="true" />
              </forms>
              <groupsBy>
                <attribute id="ItemCategory" name="Item Category" desc="The category of the item" attrValueType="DiscreteSeries" filterControl="Tree">
                  <forms>
                    <attributeForm id="ItemCategoryDesc" name="Name" dataType="String" default="true" />
                  </forms>
                </attribute>
              </groupsBy>
            </attribute>
          </dimension>
          <dimension name="Time">
            <attribute id="FiscalMonth" name="Fiscal Month" desc="The fiscal month" attrValueType="TimeSeries">
              <forms>
                <attributeForm id="FiscalMonthId" name="Id" dataType="Number" default="true"/>
              </forms>
            </attribute>
          </dimension>
        </dimensions>
      </metadata>
      <datawarehouse factory="Sentrana.BIQ.Physical.Sql.PostgreSQL.PostgreSQLDataWarehouseFactory">
        <connection providerName="Npgsql" connectionString="Server=redshift-db-01.cf2kn4jlwevq.us-east-1.redshift.amazonaws.com;Database=sysco;User Id=biq_dev;Password=sDGmln)*2ng;port=5439;command timeout=1000;"/>
        <configuration commandTimeout="120" rowLimit="1000000" />
        <tables>
          <table id="ProductDimension" databaseId="mm_datamart_dev.dimension_product">
            <columns>
              <segment databaseId="item_cat_desc">
                <attributeForm id="ItemCategoryDesc" />
              </segment>
              <segment databaseId="major_class_desc">
                <attributeForm id="MajorClassDesc" />
              </segment>
            </columns>
          </table>
          <table id="FiscalMonthDimension" databaseId="mm_datamart_dev.dimension_fiscal_month">
            <columns>
              <segment databaseId="fiscal_mth_id">
                <attributeForm id="FiscalMonthId" />
              </segment>
            </columns>
          </table>
        </tables>
      </datawarehouse>
    </repository>
  }

  lazy val repository = Repository.fromXml(dataWarehouseXml).get
  lazy val dataWarehouse = repository.dataWarehouse.asInstanceOf[PostgreSQLDataWarehouse]

  "Clear the cache" in {
    MetadataCache().removeFromCache("MMIB")
  }

  "MySQLDataWarehouse.queryForElements" should {
    "Return all months for monthId attr form" in {
      val form = repository.metaData.getAttributeForm("FiscalMonthId").get
      val elements = dataWarehouse.queryForElements(form)
      elements.size mustBe 13
      form.elementsById.toMap mustBe elements.map(el => el.id -> el).toMap
    }
  }

  "MySql.queryForTreeElements" should {
    "Populate all child attributeElements and populate the base attribute elements" in {
      val af = repository.metaData.getAttributeForm("ItemCategoryDesc").get
      val elements = Await.result(dataWarehouse.queryForTreeElements(af), 120 seconds)
      elements.size mustBe 13
      val element = elements.find(_.id == "ItemCategoryDesc:CANNED AND DRY").get
      element.childElements.size mustBe 50
      element.childElements.find(_.id == "MajorClassDesc:ADMINISTRATIVE") must be ('defined)
    }
  }

  "Clear the cache after tests" in {
    MetadataCache().removeFromCache("MMIB")
  }

}
