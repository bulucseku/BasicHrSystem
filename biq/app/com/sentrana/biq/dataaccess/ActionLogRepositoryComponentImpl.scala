package com.sentrana.biq.dataaccess

import com.sentrana.appshell.dataaccess.{ ActionLog, ActionLogRepositoryComponent }
import com.sentrana.biq.domain.document.BIQDataServices

/**
 * Created by nwongsaroj on 10/30/14.
 */
trait ActionLogRepositoryComponentImpl extends ActionLogRepositoryComponent {
  val actionLogRepository = ActionLogRepositoryImpl

  object ActionLogRepositoryImpl extends ActionLogRepository {
    def find(id: String): Option[ActionLog] =
      BIQDataServices().getDocument(Map("id" -> id))

    def save(actionLog: ActionLog) = {
      BIQDataServices().saveDocument(actionLog)
    }
  }
}
