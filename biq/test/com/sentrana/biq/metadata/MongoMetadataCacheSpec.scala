package com.sentrana.biq.metadata

import com.sentrana.biq.UnitSpec
import com.sentrana.biq.core.Repository
import com.sentrana.biq.core.conceptual.AttributeElement
import com.sentrana.biq.core.physical.{ SegmentValue, SqlDataWarehouse }
import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp

/**
 * Created by williamhogben on 3/25/15.
 */
@DoNotDiscover
class MongoMetadataCacheSpec extends UnitSpec with ConfiguredApp {
  val repoXml = <repository id="repoId" name="Test Repo Id">
    <metadata>
      <dimensions>
        <dimension name="Product">
          <attribute id="MajorClass" name="Major Class" desc="The second level category of a product" attrValueType="DiscreteSeries" filterControl="None">
            <forms>
              <attributeForm id="MajorClassId" name="ID" dataType="String" />
            </forms>
            <groupsBy>
              <attribute id="ItemCategory" name="Item Category" desc="The category of the item" attrValueType="DiscreteSeries" filterControl="Tree">
                <forms>
                  <attributeForm id="ItemCategoryID" name="ID" dataType="String" />
                </forms>
              </attribute>
            </groupsBy>
          </attribute>
        </dimension>
      </dimensions>
    </metadata>
    <datawarehouse factory="Sentrana.BIQ.Physical.Sql.MySql.MySqlDataWarehouseFactory">
      <configuration commandTimeout="120" rowLimit="100000" />
      <connection connectionString="Server=127.0.0.1 ;Database=database;Uid=sentrana;Pwd=password;port=5029;command timeout=1000;" providerName="MySql.Data.MySqlClient" />
      <tables>
        <table id="ProductDimension" databaseId="mm_datamart_dev.dimension_product">
          <columns>
            <segment databaseId="item_cat_id">
              <attributeForm id="ItemCategoryID" />
            </segment>
            <segment databaseId="major_class_id">
              <attributeForm id="MajorClassId" />
            </segment>
          </columns>
        </table>
      </tables>
    </datawarehouse>
  </repository>

  val repository = Repository.fromXml(repoXml).success.value
  val metadata = repository.metaData
  val itemElement = AttributeElement(
    "ItemCategoryId:steak", "steak"
  )
  val itemForm = metadata.getAttributeForm("ItemCategoryID").get
  itemForm.setAttributeElements(Seq(itemElement))

  val majorElement = AttributeElement(
    "MajorClassId:beef", "beef", Seq(itemElement), Some(itemForm)
  )
  val majorForm = metadata.getAttributeForm("MajorClassId").get
  itemElement.parentElement = Some(majorElement)
  majorForm.setAttributeElements(Seq(majorElement))
  val warehouse = repository.dataWarehouse match {
    case warehouse: SqlDataWarehouse =>
      warehouse.segments.find(_.databaseId == "major_class_id").get.setSegmentValues(
        Seq(new SegmentValue("beef", majorElement))
      )
      warehouse.segments.find(_.databaseId == "item_cat_id").get.setSegmentValues(
        Seq(new SegmentValue("steak", itemElement))
      )
      warehouse
  }

  val majorFormCache = AttributeFormCacheInfo(
    majorForm.id,
    majorForm.allElements.map(el =>
    AttributeElementCacheInfo(
      el.id, el.id, el.parentElement.map(_.id)
    )).toSeq,
    "repoId",
    1.toLong
  )

  val itemFormCache = AttributeFormCacheInfo(
    itemForm.id,
    itemForm.allElements.map(el =>
    AttributeElementCacheInfo(
      el.id, el.id, el.parentElement.map(_.id)
    )).toSeq,
    "repoId",
    1.toLong
  )

  "The MongoMetadataCache.saveToCache" should {
    "Save the attribute elements and segments to the cache" in {
      MongoMetadataCache().saveToCache(majorFormCache)
      MongoMetadataCache().saveToCache(itemFormCache)
      val newRepo = Repository.fromXml(repoXml).success.value
      newRepo.loadAttributeElements(majorForm)
      newRepo mustBe repository
    }
  }

  "MongoMetadataCache.existsInCache" should {
    "Return true if the repo is in the cache" in {
      MongoMetadataCache().existsInCache("MajorClassId", repository.id) mustBe true
    }

    "Return false if the repo is not in the cache" in {
      val repo = repository.copy(id = "MMIB")
      MongoMetadataCache().existsInCache("FakeId", repository.id) mustBe false
    }
  }

  "MongoMetadataCache.removeFromCache" should {
    "Remove the repository from the cache" in {
      MongoMetadataCache().existsInCache("MajorClassId", repository.id) mustBe true
      MongoMetadataCache().removeFromCache(repository.id)
      MongoMetadataCache().existsInCache("MajorClassId", repository.id) mustBe false
    }
  }
}
