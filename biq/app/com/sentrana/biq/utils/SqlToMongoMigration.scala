package com.sentrana.biq.utils

import java.io.File
import javassist.bytecode.stackmap.TypeTag

import com.sentrana.appshell.dataaccess.ConnectionProvider
import com.sentrana.appshell.domain.DocumentObject
import com.sentrana.biq.Global
import com.sentrana.biq.datacontract._
import com.sentrana.biq.domain.BIQDataServices
import com.sentrana.biq.domain.document
import com.sentrana.usermanagement.domain.document.UMDataServices
import org.squeryl.PrimitiveTypeMode._
import org.squeryl.Session
import org.squeryl.adapters.{ H2Adapter, MySQLAdapter, PostgreSqlAdapter }
import org.squeryl.internals.DatabaseAdapter
import play.api.{ DefaultApplication, Mode, Play }

import scala.language.postfixOps
import scala.reflect.ClassTag
import scala.reflect.runtime.universe._
import scala.util.Failure
import scala.util.Success
import scala.util.Try

/**
 * Migration script to move data from SQL Database to MongoDB
 */
class SqlToMongoMigration(val driver: String)(implicit connectionProvider: ConnectionProvider) {

  def getAdapter: DatabaseAdapter = {
    driver match {
      case "org.h2.Driver"         => new H2Adapter
      case "org.postgresql.Driver" => new PostgreSqlAdapter
      case _                       => new MySQLAdapter
    }
  }

  def getUserFullName(id: String): String = {
    val user = getUser(id)
    user.firstName + " " + user.lastName
  }

  def getUserName(id: String): String = {
    getUser(id).userName
  }

  def getUser(id: String) = {
    Try(UMDataServices.getUser("id", id)) match {
      case Success(v) => v
      case Failure(e) => UMDataServices.getUser("id", "69") // Use Yaseen's name as the default is the user is missing in new MongoDB.
    }
  }

  def migrateReports = {
    connectionProvider.withConnection("biq") {
      implicit c =>
        transaction(Session.create(c, getAdapter)) {
          val reports = from(BIQDataServices.adhocReports)(r => select(r))
          reports.foreach { r =>
            val comments = BIQDataServices.userComments.find(_.objectId == r.id)
            val sharings = BIQDataServices.AdhocReportSharing.find(_.adhoc_report_id == r.id)
            val chartOptionsRecord = BIQDataServices.chartOptions.find(_.id == r.id).headOption match {
              case None => None
              case Some(rco) =>
                Some(ChartOptions(
                  chartType                 = rco.chart_type,
                  chartTextOptions          = ChartTextOptions(
                    chartTitle          = rco.chart_title,
                    chartSubtitle       = rco.chart_subtitle,
                    chartXAxisLabel     = rco.chart_xaxis_label,
                    chartYAxisLabel     = rco.chart_yaxis_label,
                    chartXLabelRotation = Some(rco.chart_xlabel_rotation)
                  ),
                  chartCollapseItemName     = rco.chart_collapse_item_name,
                  chartCollapseRowLimit     = rco.chart_collapse_row_limit,
                  chartLegendAttrColumnName = rco.chart_legend_attr_column_name,
                  chartCollapseTail         = rco.chart_collapse_tail,
                  chartAutoSegmentation     = rco.chart_auto_segmentation,
                  chartSegAttrColumnName    = rco.chart_seg_attr_column_name,
                  chartAttrColumnNames      = rco.chart_attr_column_names.split('|'),
                  chartSegMetricColumnName  = rco.chart_seg_metric_column_name,
                  chartMetricColumnNames    = rco.chart_metric_column_names.split('|'),
                  startPos                  = rco.start_pos,
                  endPos                    = rco.end_pos
                ))
            }

            val newReport = ReportInfo(
              name           = r.name,
              id             = Some(r.id.toString),
              dataSource     = Some(r.data_source),
              version        = None,
              createDate     = Some(r.create_date.getTime),
              createUser     = Some(getUserFullName(r.create_user.toString)),
              createUserId   = Some(r.create_user.toString),
              lastModDate    = Some(r.last_mod_date.getTime),
              lastModUser    = Some(getUserFullName(r.last_mod_user.toString)),
              definition     = ReportSpecification(r.template_unit_ids, r.filter_unit_ids, r.totals_on, r.sort_specification),
              chartOptions   = chartOptionsRecord.getOrElse(null),
              showGrid       = r.show_grid,
              showChart      = r.show_chart,
              chartType      = None,
              comments       = Some(CommentStreamInfo(version = None, comments =
                comments.map(c => CommentInfo(
                  userName = Some(getUserName(c.userId.toString)),
                  userId   = Some(c.userId.toString),
                  date     = Some(c.dateUpdated.getTime),
                  msg      = c.text,
                  cid      = Some(c.id.toString),
                  editable = Some(true)
                )).toList)),
              shared         = None,
              order          = r.report_order,
              bookletId      = r.booklet_id,
              resultOptions  = None, //This feature was introduced after v2.1.
              reportSharings = if (sharings.size > 0) Some(sharings.map(_.id.toString).toSet) else None
            )
            document.BIQDataServices().saveDocument(newReport)
          }
        }
    }
  }

  def migrateReportSharing = {
    connectionProvider.withConnection("biq") {
      implicit c =>
        transaction(Session.create(c, getAdapter)) {
          val sharings = from(BIQDataServices.AdhocReportSharing)(x => select(x))
          sharings.foreach { s =>
            val report = BIQDataServices.adhocReports.find(_.id == s.adhoc_report_id).head
            val newSharing = ReportInfoSharingRecipient (
              id          = s.id.toString,
              shareStatus = s.share_status,
              dataSource  = Some(report.data_source),
              userId      = s.share_to_user.toString,
              reportId    = s.adhoc_report_id.toString
            )
            document.BIQDataServices().saveDocument(newSharing)
          }
        }
    }
  }

  def migrateBooklets = {
    connectionProvider.withConnection("biq") {
      implicit c =>
        transaction(Session.create(c, getAdapter)) {
          val booklets = from(BIQDataServices.booklets)(r => select(r))
          booklets.foreach { b =>
            val allReports = BIQDataServices.adhocReports.find(_.booklet_id == b.id)
            val sharings = BIQDataServices.bookletSharing.find(_.booklet_id == b.id)
            val newBooklet = BookletInfo(
              id              = Some(b.id.toString),
              name            = b.name,
              dataSource      = b.data_source,
              version         = Some(b.version),
              createDate      = b.create_date.getTime,
              createUser      = getUserFullName(b.create_user.toString),
              createUserId    = b.create_user.toString,
              lastModDate     = b.last_mod_date.getTime,
              lastModUser     = getUserFullName(b.last_mod_user.toString),
              numberOfReports = allReports.size,
              reports         = allReports.map(_.id.toString).toSeq,
              comments        = None,
              shared          = Some(true),
              filterUnitIds   = None,
              bookletSharings = if (sharings.size > 0) Some(sharings.map(_.id.toString).toSet) else None
            )
            document.BIQDataServices().saveDocument(newBooklet)
          }
        }
    }
  }

  def migrateBookletSharing = {
    connectionProvider.withConnection("biq") {
      implicit c =>
        transaction(Session.create(c, getAdapter)) {
          val sharings = from(BIQDataServices.bookletSharing)(x => select(x))
          sharings.foreach { s =>
            val report = BIQDataServices.booklets.find(_.id == s.booklet_id).head
            val newSharing = BookletInfoSharingRecipient (
              id          = s.id.toString,
              shareStatus = s.share_status,
              dataSource  = Some(report.data_source),
              userId      = s.share_to_user.toString,
              bookletId   = s.booklet_id.toString
            )
            document.BIQDataServices().saveDocument(newSharing)
          }
        }
    }
  }

  def migrateDerivedColumn = {
    connectionProvider.withConnection("biq") {
      implicit c =>
        transaction(Session.create(c, getAdapter)) {
          val dc = from(BIQDataServices.derivedColumns)(x => select(x))
          dc.foreach { c =>
            val newDerivedColumn = DerivedColumn(
              id                   = Some(c.id.toString),
              dataSource           = c.dataSource,
              derivedColumnName    = c.derivedColumnName,
              derivedColumnVersion = c.derivedColumnVersion,
              createDate           = c.createDate.getTime,
              createUserId         = c.createUserId.toString,
              lastModDate          = c.lastModDate.getTime,
              lastModUserId        = c.lastModUserId.toString,
              expression           = c.expression,
              precision            = c.precision,
              dataType             = c.dataType,
              formulaType          = c.formulaType
            )
            document.BIQDataServices().saveDocument(newDerivedColumn)
          }
        }
    }
  }
}

object SqlToMongoMigration {

  def main(args: Array[String]): Unit = {
    val application = new DefaultApplication(new File("."), this.getClass.getClassLoader(), None, Mode.Dev)
    Play.start(application)
    implicit val connectionProvider = Global.connectionProvider
    val url = application.configuration.getString("db.biq.url").getOrElse("")
    val driver = application.configuration.getString("db.biq.driver").getOrElse("")
    connectionProvider.addConnectionPool("biq", driver, url, "", "")
    val migration = new SqlToMongoMigration(driver)
    println("Starting migration from Sql to MongoDb")
    println("Migrating Report...")
    migration.migrateReports
    migration.migrateReportSharing
    println("Migrating Booklet...")
    migration.migrateBooklets
    migration.migrateBookletSharing
    println("Migrating Derived Column...")
    migration.migrateDerivedColumn
    println("Finished.")
  }
}
