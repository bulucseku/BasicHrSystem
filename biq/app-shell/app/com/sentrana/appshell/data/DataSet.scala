package com.sentrana.appshell.data

import java.sql.Timestamp
import java.text.DecimalFormat
import java.util.Date

import anorm._
import com.sentrana.appshell.exceptions.{ DataRetrievalException, ConfigurationException }
import com.sentrana.appshell.utils.ConfigurationUtil
import com.sentrana.appshell.dataaccess.ConnectionProvider
import org.joda.time.DateTime
import play.api.Play.current
import play.api.db.DB
import scala.util.{ Failure, Try, Success }

/**
 * Created by szhao on 10/9/2014.
 */
class Dataset private (
    dbName:           String,
    sql:              String,
    columnFmtStrList: Seq[String],
    columnNameList:   Seq[String],
    parameterList:    Seq[NamedParameter] = Seq()
)(implicit connectionProvider: ConnectionProvider) {

  // TODO private System.Configuration.ConnectionStringSettings connectionString;
  val columnFormatString: Seq[String] = Seq[String]()
  val commandTimeOut = ""
  val defaultTimeOut = 30

  // TODO This metaItemList is newly added for scala application. Need to figure out whether it is necessary.
  var metaItemList: Seq[MetaDataItem] = Seq()
  var columnNames: Seq[String] = Seq()
  var columnTypes: Seq[String] = Seq()
  // Use an array because we need to update the element inside often.
  var columnWidths: Array[Int] = Array()

  // TODO We will get rid of this rows property. We will directly populate the rows, colInfos, timingInfo required by DatasetResult object.

  var colInfos: Array[ColumnInfo] = Array[ColumnInfo]()
  // var timingInfo
  var rows: List[ResultRow] = List[ResultRow]()

  implicit val columnToTimestamp: Column[Timestamp] = Column.nonNull {
    (value, meta) =>
      val MetaDataItem(qualified, _, _) = meta
      value match {
        case l: Timestamp => Right(l)
        case _            => Left(TypeDoesNotMatch(s"Cannot convert $value: ${value.asInstanceOf[AnyRef].getClass} to Int for column $qualified"))
      }
  }

  private def retrieveData(): Unit = {
    val result = connectionProvider.withConnection(dbName) {
      implicit c =>
        val query: Sql = if (parameterList.nonEmpty) SQL(sql).on(parameterList: _*) else SQL(sql)
        query().map(row => {
          // Only retrieve the metadata once
          if (columnNames.size == 0) {
            // set column metadata
            metaItemList = row.metaData.ms
            columnNames = if (columnNameList == Nil) metaItemList.map(m => m.column.alias.getOrElse(m.column.qualified)) else columnNameList
            columnTypes = metaItemList.map(m => m.clazz)
            columnWidths = columnNames.map(cn => cn.size).toArray
            // Start to populate colInfos
            // TODO This is the place where we inject metadata merging logic
          }
          // Create a new row with cells
          val cells = for ((m, i) <- metaItemList.zipWithIndex) yield {
            // Assume everything is nullable, use empty string as the value
            val qualifiedName = m.column.qualified
            val cellValue: Any = m.clazz match {
              case "java.lang.Integer"    => row[Option[Int]](qualifiedName).getOrElse("")
              case "java.lang.Long"       => row[Option[Long]](qualifiedName).getOrElse("")
              case "java.lang.Double"     => row[Option[Double]](qualifiedName).getOrElse("")
              case "java.math.BigDecimal" => scala.math.BigDecimal(row[Option[java.math.BigDecimal]](qualifiedName).getOrElse(java.math.BigDecimal.ZERO))
              case "java.math.BigInteger" => scala.math.BigInt(row[Option[java.math.BigInteger]](qualifiedName).getOrElse(java.math.BigInteger.ZERO))
              case "java.sql.Timestamp"   => row[Option[Timestamp]](qualifiedName).getOrElse("")
              case "java.sql.Date"        => row[Option[Date]](qualifiedName).getOrElse("")
              case "java.lang.Boolean"    => row[Option[Boolean]](qualifiedName).getOrElse("")
              case _                      => row[Option[String]](qualifiedName).getOrElse("")
            }
            // TODO Here are the place where we want to inject logic about transforming cell values.
            val (formatterValue, rawValue) = formatValue(cellValue, if (columnFmtStrList == Nil) "" else columnFmtStrList(i))
            val cell = new ResultCell(formatterValue.getOrElse(throw ConfigurationException(s"for column $qualifiedName, format ${columnFmtStrList(i)} for column value '$rawValue' is wrong!")), rawValue, false)

            // Update our column widths
            columnWidths(i) = Math.max(columnWidths(i), cell.fmtValue.size)
            cell
          }
          // TODO Here are the place where we want to inject logic about transforming result rows.
          new ResultRow(cells, false)
        }).toList
    }
    rows = result match {
      case Success(rowList) => rowList
      case Failure(e) => throw new DataRetrievalException(
        "Error retrieving results from the database with message: " + e.getMessage, e
      )
    }
  }

  protected def formatValue(value: Any, colFormatStr: String): (Try[String], Any) = {
    // get null default value
    val nullDefaultValue = ConfigurationUtil.getAppSettingValue("dataset.nullValue")
    val numberPattern = "N(\\d+)".r
    val currencyPattern = "C(\\d+)".r
    val percentPattern = "P(\\d+)".r
    val formattedValue = Try(
      colFormatStr match {
        case ""             => value.toString
        // Get month name based on month number. 1 -> Jan, 10 -> Oct
        // 2014-xx-24 is just a made up date.
        case "MMMM" | "MMM" => DateTime.parse(s"2014-${value.toString}-24").toString(colFormatStr)
        // TODO, we need to figure out a generic way of formatting date time values, currency and numbers
        case "yyyy-MMM"     => DateTime.parse(value.toString).toString(colFormatStr)
        case numberPattern(n) =>
          if (value == null || value.toString.isEmpty) nullDefaultValue else new DecimalFormat("###,###" + getDigitalFormat(n)).format(value)
        case currencyPattern(n) =>
          if (value == null || value.toString.isEmpty) nullDefaultValue else new DecimalFormat("$###,###" + getDigitalFormat(n)).format(value)
        case percentPattern(n) =>
          if (value == null || value.toString.isEmpty) nullDefaultValue else new DecimalFormat("###,###" + getDigitalFormat(n) + " %").format(value)
        case _ => value.toString.format(colFormatStr)
      }
    )
    val rawValue = value.getClass.getName match {
      case "joda.time.DateTime" => Dataset.toJsonDateTime(value.asInstanceOf[DateTime])
      case "java.sql.Date"      => value.toString
      case _                    => value
    }
    (formattedValue, rawValue)
  }

  def getDigitalFormat(n: String) = {
    (1 to n.toInt).map(i => if (i == 1) ".#" else "#").mkString("")
  }
}

object Dataset {
  def apply(
    dbName:          String,
    sql:             String,
    colFormatString: Seq[String]                 = Seq(),
    queryParameters: Traversable[NamedParameter] = Seq()
  )(implicit connectionProvider: ConnectionProvider): Dataset = {
    val ds = new Dataset(dbName, sql, colFormatString, Nil, queryParameters.toSeq)
    ds.retrieveData()
    ds
  }

  def toJsonDateTime(datetime: DateTime): Long = {
    datetime.getMillis
    // (Long)Math.Round((datetime.ToUniversalTime() - JsonEpoch).TotalMilliseconds);
  }
}
