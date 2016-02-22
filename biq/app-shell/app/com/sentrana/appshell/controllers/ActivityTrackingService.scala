package com.sentrana.appshell.controllers

import java.sql.Timestamp
import java.util.UUID

import org.joda.time.DateTime
import org.json4s.NoTypeHints
import org.json4s.native.Serialization._

import com.sentrana.appshell.dataaccess.{ ActionLog, ActionLogRepositoryComponent }
import com.sentrana.appshell.logging.LoggerComponent
import com.sentrana.usermanagement.controllers.Authentication

/**
 * Created by nwongsaroj on 10/28/14.
 */
trait ActivityTrackingService extends BaseController with Authentication {
  this: ActionLogRepositoryComponent with LoggerComponent =>

  implicit val formats = org.json4s.native.Serialization.formats(NoTypeHints)

  def WriteActionLog = AuthAction(parse.json) { request =>
    val actionLogPosted = read[ActionLogPosted](request.body.toString())
    val userSession = request.userSession
    val userName = userSession.user.userName

    val actionLog = ActionLog(
      UUID.randomUUID().toString,
      actionLogPosted.ActionName,
      Some(new Timestamp(DateTime.now.getMillis)),
      Some(userName),
      actionLogPosted.Context,
      actionLogPosted.ElementType,
      actionLogPosted.ElementId
    )

    actionLogRepository.save(actionLog)

    Ok("value = " + actionLog)
  }
}

case class ActionLogPosted(
  ActionName:  Option[String],
  Context:     Option[String],
  ElementType: Option[String],
  ElementId:   Option[String]
)
