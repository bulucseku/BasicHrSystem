package com.sentrana.biq.core.physical

import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp

import com.sentrana.biq.UnitSpec
import com.sentrana.biq.core.physical.Sql.MySQL.MySqlStatementBuilder
import com.sentrana.biq.core.physical.StatementPart.Implicits._

/**
 * Created by williamhogben on 7/20/15.
 */
@DoNotDiscover
class SqlStatementBuilderSpec extends UnitSpec with ConfiguredApp {

  "SqlStatementBuilder.buildPreparedStatement" should {
    "Build a valid sql statement" in {
      val select = List(StatementPart("orderType"))
      val from = List(StatementPart("tableName"))
      val where = List("bacon = " +/ StatementPart.fromValue("value"))
      val groupBy = List(StatementPart("table.count"))
      val orderBy = List(StatementPart("name DESC"))
      val builder = new MySqlStatementBuilder(select, from, where, groupBy, orderBy)
      val statement = builder.buildPreparedStatement
      statement.sql mustBe "SELECT\n" +
        "    orderType\n" +
        "FROM\n" +
        "    tableName\n" +
        "WHERE\n" +
        s"    bacon = {${statement.parameters.head.name}}\n" +
        "GROUP BY\n" +
        "    table.count\n" +
        "ORDER BY\n" +
        "    name DESC"
    }

    "Build a valid sql statement with rollups" in {
      val select = List(StatementPart("orderType"))
      val from = List(StatementPart("tableName"))
      val where = List("bacon = " +/ StatementPart.fromValue("value"))
      val groupBy = List(StatementPart("table.count"))
      val orderBy = List(StatementPart("name DESC"))
      val builder = new PostgreSqlStatementBuilder(select, from, where, groupBy, orderBy, true)
      val statement = builder.buildPreparedStatement
      statement.sql mustBe "SELECT\n" +
        "    orderType\n" +
        "FROM\n" +
        "    tableName\n" +
        "WHERE\n" +
        s"    bacon = {${statement.parameters.head.name}}\n" +
        "GROUP BY ROLLUP((table.count))\n" +
        "ORDER BY\n" +
        "    name DESC"
    }
  }

}
