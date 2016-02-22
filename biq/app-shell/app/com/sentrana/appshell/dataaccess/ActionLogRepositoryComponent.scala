package com.sentrana.appshell.dataaccess

import java.sql.Timestamp

import com.sentrana.appshell.domain.DocumentObject

/**
 * Created by nwongsaroj on 10/30/14.
 */
trait ActionLogRepositoryComponent {
  def actionLogRepository: ActionLogRepository

  trait ActionLogRepository {
    def find(id: String): Option[ActionLog]
    def save(actionLog: ActionLog): Unit
  }
}

case class ActionLog(
  LogId:       String,
  ActionName:  Option[String],
  ActionTime:  Option[Timestamp],
  UserId:      Option[String],
  Context:     Option[String],
  ElementType: Option[String],
  ElementId:   Option[String]
) extends DocumentObject

object ActionLog extends DocumentObject {
  override val source = "actionLog"
}
