package com.sentrana.biq.domain

import java.sql.Timestamp

import com.sentrana.biq.datacontract.{ ChartTextOptions, CommentStreamInfo }
import org.squeryl.{ KeyedEntity, Schema }
import org.squeryl.annotations.Column
import java.sql.Timestamp

import com.sentrana.appshell.data.FormulaType
import com.sentrana.usermanagement.domain.{ UMDataServices, User }
import org.joda.time.DateTime
import org.squeryl.annotations.Column
import org.squeryl.PrimitiveTypeMode._
import org.squeryl.{ Query, KeyedEntity, Schema }
import org.squeryl.dsl.{ StatefulManyToOne, StatefulOneToMany, CompositeKey2, ManyToOne }
import org.squeryl.Schema

/**
 * Created by william.hogben on 2/4/2015.
 */
case class DerivedColumn(
    @Column("derived_column_id") id:         Int,
    @Column("data_source") dataSource:       String,
    @Column("name") derivedColumnName:       String,
    @Column("version") derivedColumnVersion: Int,
    @Column("create_date") createDate:       Timestamp = new Timestamp(System.currentTimeMillis),
    @Column("create_user") createUserId:     Int,
    @Column("last_mod_date") lastModDate:    Timestamp = new Timestamp(System.currentTimeMillis),
    @Column("last_mod_user") lastModUserId:  Int,
    @Column("expression") expression:        String,
    @Column("decimal_place") precision:      Int,
    @Column("data_type") dataType:           String,
    @Column("formula_type") formulaType:     String
) extends KeyedEntity[Int] {
  lazy val createUser = BIQDataServices.userDerivedColumnsCreated.rightStateful(this)
  lazy val lastModUser = BIQDataServices.userDerivedColumnsLastModified.rightStateful(this)
}

case class AdhocReport(
    @Column("adhoc_report_id") id:                    Int,
    @Column("version") version:                       String,
    @Column("data_source") data_source:               String,
    @Column("name") name:                             String,
    @Column("create_date") create_date:               Timestamp,
    @Column("create_user") create_user:               Int,
    @Column("last_mod_date") last_mod_date:           Timestamp,
    @Column("last_mod_user") last_mod_user:           Int,
    @Column("show_grid") show_grid:                   Boolean,
    @Column("show_chart") show_chart:                 Boolean,
    @Column("template_unit_ids") template_unit_ids:   String,
    @Column("filter_unit_ids") filter_unit_ids:       Option[String],
    @Column("totals_on") totals_on:                   Boolean,
    @Column("sort_specification") sort_specification: String,
    @Column("page_by") page_by:                       Option[String],
    @Column("booklet_id") booklet_id:                 Option[String],
    @Column("report_order") report_order:             Option[Int]
) extends KeyedEntity[Int] {
  lazy val createUser = BIQDataServices.userReportCreated.rightStateful(this)
  lazy val lastModUser = BIQDataServices.userReportLastModified.rightStateful(this)
}

case class ChartOption(
  @Column("adhoc_report_id") id:                                          Int,
  @Column("chart_type") chart_type:                                       String,
  @Column("chart_title") chart_title:                                     String,
  @Column("chart_subtitle") chart_subtitle:                               String,
  @Column("chart_xaxis_label") chart_xaxis_label:                         String,
  @Column("chart_yaxis_label") chart_yaxis_label:                         String,
  @Column("chart_xlabel_rotation") chart_xlabel_rotation:                 Int,
  @Column("chart_collapse_item_name") chart_collapse_item_name:           String,
  @Column("chart_collapse_row_limit") chart_collapse_row_limit:           Int,
  @Column("chart_legend_attr_column_name") chart_legend_attr_column_name: String,
  @Column("chart_collapse_tail") chart_collapse_tail:                     Boolean,
  @Column("chart_auto_segmentation") chart_auto_segmentation:             Boolean,
  @Column("chart_seg_attr_column_name") chart_seg_attr_column_name:       String,
  @Column("chart_attr_column_names") chart_attr_column_names:             String,
  @Column("chart_seg_metric_column_name") chart_seg_metric_column_name:   String,
  @Column("chart_metric_column_names") chart_metric_column_names:         String,
  @Column("start_pos") start_pos:                                         Int,
  @Column("end_pos") end_pos:                                             Int
) extends KeyedEntity[Int]

case class AdhocReportSharing(
  @Column("adhoc_report_sharing_id") id:      Int,
  @Column("share_status") share_status:       String,
  @Column("adhoc_report_id") adhoc_report_id: Int,
  @Column("share_to_user") share_to_user:     Int
) extends KeyedEntity[Int]

case class Booklet(
    @Column("booklet_id") id:               Int,
    @Column("version") version:             Int,
    @Column("data_source") data_source:     String,
    @Column("name") name:                   String,
    @Column("create_date") create_date:     Timestamp,
    @Column("create_user") create_user:     Int,
    @Column("last_mod_date") last_mod_date: Timestamp,
    @Column("last_mod_user") last_mod_user: Int
) extends KeyedEntity[Int] {
  lazy val createUser = BIQDataServices.userBookletCreated.rightStateful(this)
  lazy val lastModUser = BIQDataServices.userBookletLastModified.rightStateful(this)
}

case class BookletSharing(
  @Column("booklet_sharing_id") id:       Int,
  @Column("share_status") share_status:   String,
  @Column("booklet_id") booklet_id:       Int,
  @Column("share_to_user") share_to_user: Int
) extends KeyedEntity[Int]

case class UserComment(
    @Column("comment_id") id:            Int,
    @Column("object_id") objectId:       Int,
    @Column("date_created") dateCreated: Timestamp,
    @Column("date_updated") dateUpdated: Timestamp,
    @Column("text") text:                String,
    @Column("module_id") moduleId:       Int,
    @Column("user_id") userId:           Int
) extends KeyedEntity[Int] {
}

object BIQDataServices extends Schema {
  val adhocReports = table[AdhocReport]("adhoc_report")
  val userReportCreated = oneToManyRelation(UMDataServices.users, adhocReports)
    .via((a, b) => a.id === b.create_user)
  val userReportLastModified = oneToManyRelation(UMDataServices.users, adhocReports)
    .via((a, b) => a.id === b.last_mod_user)

  val chartOptions = table[ChartOption]("adhoc_report_chart_option")

  val AdhocReportSharing = table[AdhocReportSharing]("adhoc_report_sharing")

  val booklets = table[Booklet]("booklet")
  val userBookletCreated = oneToManyRelation(UMDataServices.users, booklets)
    .via((a, b) => a.id === b.create_user)
  val userBookletLastModified = oneToManyRelation(UMDataServices.users, booklets)
    .via((a, b) => a.id === b.last_mod_user)

  val bookletSharing = table[BookletSharing]("booklet_sharing")

  val derivedColumns = table[DerivedColumn]("derived_column")
  val userDerivedColumnsCreated = oneToManyRelation(UMDataServices.users, derivedColumns)
    .via((a, b) => a.id === b.createUserId)
  val userDerivedColumnsLastModified = oneToManyRelation(UMDataServices.users, derivedColumns)
    .via((a, b) => a.id === b.lastModUserId)

  val userComments = table[UserComment]("um_user_comment")
}
