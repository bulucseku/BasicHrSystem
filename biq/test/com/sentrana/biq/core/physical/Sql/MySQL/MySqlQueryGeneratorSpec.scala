package com.sentrana.biq.core.physical.Sql.MySQL

import com.sentrana.biq.core.conceptual.FilterUnit
import com.sentrana.biq.core.physical.Sql.PostgreSQL.{ PostgreSQLQuery, PostgreSQLQueryGenerator, PostgreSQLDataWarehouse }
import com.sentrana.biq.core.physical.{ SqlQuery, SqlQueryGenerator, SqlDataWarehouse }
import com.sentrana.biq.core._
import com.sentrana.biq.metadata.MetadataRepository
import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp

/**
 * Created by william.hogben on 2/18/2015.
 */
@DoNotDiscover
class MySqlQueryGeneratorSpec extends FromXmlSpec with ConfiguredApp {

  lazy val repository = MetadataRepository().metadata("farmland")
  def generator(x: Report): SqlQueryGenerator = {
    repository.dataWarehouse match {
      case s: MySqlDataWarehouse      => new MySqlQueryGenerator(s, x)
      case p: PostgreSQLDataWarehouse => new PostgreSQLQueryGenerator(p, x)
      case _                          => throw new Exception("Not a Mysql Repository, Something went wrong")
    }
  }

  "test parse" in {

  }

  "SqlQueryGenerator.buildQuery" should {
    "Create valid query text for a Segment value clause" in {
      val af = repository.metaData.getAttributeForm("af_cal_mth_id")
      repository.loadAttributeElements(af.get)
      val templates = List(new TemplateUnit(af.get, SortUnit(1, SortOrder.ASC)))
      val report = new Report(Some(repository), templates, Nil, false)
      val query = generator(report).buildQuery
      query.queryText mustBe {
        "SELECT TOP 100000\n    primaryTable_1.cal_mth_id AS \"Cal Mth ID\"\nFROM\n" +
          "    v2_sales_and_claims_flat_v3 AS primaryTable_1\n\nGROUP BY\n" +
          "    primaryTable_1.cal_mth_id\nORDER BY\n    primaryTable_1.cal_mth_id ASC"
      }
    }

    "Add a where clause when a filter unit is included" in {
      val af = repository.metaData.getAttributeForm("af_cal_mth_id")
      val templates = List(new TemplateUnit(af.get, SortUnit(1, SortOrder.ASC)))
      val ae = repository.metaData.getAttributeElement("af_cal_mth_id:201211").get
      val filters = List(ae)
      val report = new Report(Some(repository), templates, filters, false)
      val query = generator(report).buildQuery
      inside(query) {
        case PostgreSQLQuery(dbName, rep, statement, formatStrList, timeout) =>
          statement.sql mustBe {
            "SELECT TOP 100000\n    primaryTable_1.cal_mth_id AS \"Cal Mth ID\"\nFROM\n" +
              "    v2_sales_and_claims_flat_v3 AS primaryTable_1\nWHERE\n" +
              s"    (primaryTable_1.cal_mth_id = {${statement.parameters.head.name}})\nGROUP BY\n" +
              "    primaryTable_1.cal_mth_id\nORDER BY\n    primaryTable_1.cal_mth_id ASC"
          }
      }
    }

    "Correctly parse a report with multiple report units" in {
      val af2 = repository.metaData.getReportUnit("irmfkimg")
      val af = repository.metaData.getAttributeForm("af_cal_mth_id")
      val templates = List(
        new TemplateUnit(af.get, SortUnit(1, SortOrder.ASC)),
        new TemplateUnit(af2.get, SortUnit(2, SortOrder.DESC))
      )
      val report = new Report(Some(repository), templates, Nil, false)
      val query = generator(report).buildQuery
      query.queryText mustBe {
        "SELECT TOP 100000\n" +
          "    primaryTable_1.cal_mth_id AS \"Cal Mth ID\", \n" +
          "    SUM(CAST(primaryTable_1.irmfkimg AS DECIMAL(26,5))) AS \"Claim Qty.\"\n" +
          "FROM\n" +
          "    v2_sales_and_claims_flat_v3 AS primaryTable_1\n\n" +
          "GROUP BY\n" +
          "    primaryTable_1.cal_mth_id\n" +
          "ORDER BY\n" +
          "    primaryTable_1.cal_mth_id ASC, \n" +
          "    \"Claim Qty.\" DESC"
      }
    }
  }
}
