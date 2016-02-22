package com.sentrana.usermanagement.authentication
import java.sql.Timestamp
import java.util.concurrent.TimeUnit._

import com.mongodb.casbah.Imports._
import com.sentrana.usermanagement.domain.document._
import org.joda.time.{ DateTime, Minutes }
import play.Logger
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.libs.Akka

import scala.concurrent.duration.FiniteDuration

/**
 * Created by szhao on 3/14/14.
 */
trait SessionManager[T] {
  // In minutes
  var sessionTimeout: Int = 60

  def saveSession(session: T): Unit

  def getSession(sessionToken: Guid[Session]): Option[T]

  def closeSession(guid: Guid[Session]): Unit

  def cleanUpOldSessions(): Unit

  def createCleanUpTimer(interval: Int) = {
    val sessionManager = this
    if (interval < 0)
      throw new IndexOutOfBoundsException("Clean up interval must be positive.")
    Akka.system.scheduler.schedule(FiniteDuration(interval.toLong, MINUTES), FiniteDuration(interval.toLong, MINUTES), new Runnable {
      def run(): Unit = {
        Logger.debug("Cleaning old session now")
        sessionManager.cleanUpOldSessions()
      }
    })
  }
}

class InMemorySessionManager[TSession <: UserSession] extends SessionManager[TSession] {

  var sessionDictionary = Map[Guid[Session], TSession]()

  def saveSession(session: TSession): Unit = {
    saveSession(session, markModified = true)
  }

  def saveSession(session: TSession, markModified: Boolean): Unit = {
    if (session == null)
      throw new Exception("session Cannot save null session.")
    if (markModified)
      session.markModified()
    sessionDictionary += ((session.sessionToken, session))
  }

  def getSession(sessionToken: Guid[Session]): Option[TSession] = {
    val session = sessionDictionary.get(sessionToken)

    if (session != None) {
      val s = session.get
      if (s.isOpen) {
        if (isExpired(s))
          s.close()
        else
          s.markAccessed()
        saveSession(s, markModified = false)
      }
    }
    session
  }

  def getSessions(predicate: TSession => Boolean): Traversable[TSession] = {
    sessionDictionary.values.filter(predicate)
  }

  def closeSession(sessionToken: Guid[Session]): Unit = {
    sessionDictionary -= sessionToken
  }

  def closeStaleSessions(): Unit = {
    val now = DateTime.now()
    val oldSessions = sessionDictionary.values.filter(s => isClosedOrExpired(s, Some(now)))

    for (s <- oldSessions) {
      closeSession(s.sessionToken)
    }
  }

  // virtual
  def cleanUpOldSessions(): Unit = {
    closeStaleSessions()
  }

  def isExpired(session: TSession, now: Option[DateTime] = None): Boolean = {
    val currentTime = if (now == None) DateTime.now else now.get
    (sessionTimeout == 0) && (Minutes.minutesBetween(currentTime, session.accessTime).getMinutes > sessionTimeout)
  }

  def isClosedOrExpired(session: TSession, now: Option[DateTime] = None): Boolean = {
    !session.isOpen || isExpired(session, now)
  }
}

object InMemorySessionManager {
  def apply[TSession <: UserSession](timeout: Int): InMemorySessionManager[TSession] = {
    val newObj = new InMemorySessionManager[TSession]()
    newObj.sessionTimeout = timeout
    newObj
  }
}

class AppSessionManager[TSession <: UserSession](var inMemorySessionManagerInstance: InMemorySessionManager[TSession]) extends SessionManager[TSession] {

  def saveSession(session: TSession): Unit = {
    // Save it to database
    // var existingAppSession = UMDataServices.UserAppSessions.FirstOrDefault(x => x.LoginUser.UserId.Equals(session.User.UserId));
    // UserAppSession uas = existingAppSession == null ? new UserAppSession() : existingAppSession;
    val now = new Timestamp(DateTime.now.getMillis)
    val uas: UserAppSession = UserAppSession(
      UMDataServices.getObjectId,
      session.user.id,
      session.sessionToken.id,
      now,
      new Timestamp(new DateTime(now).plusMinutes(this.inMemorySessionManagerInstance.sessionTimeout).getMillis) //TODO This is ridiculous conversion.
    )

    UMDataServices().saveDocument(uas)
    // Save it in memory
    inMemorySessionManagerInstance.saveSession(session)
  }

  def closeSession(sessionToken: Guid[Session]): Unit = {
    UMDataServices().removeDocuments[UserAppSession](Map("sessionId" -> sessionToken.id))

    inMemorySessionManagerInstance.closeSession(sessionToken)
  }

  def getSession(sessionToken: Guid[Session]): Option[TSession] = {
    var session = inMemorySessionManagerInstance.getSession(sessionToken)
    if (session == None) {
      // We need to look up in database session list.
      session = downloadSessionToMemory(sessionToken)
    }
    else {
      // Update expire time
      val userAppSession = UMDataServices().getDocuments[UserAppSession](Map("sessionId" -> sessionToken.id)).headOption

      userAppSession match {
        case Some(uas) =>
          val newAppSession = uas.copy(expireTime = new Timestamp(session.get.accessTime.plusMinutes(inMemorySessionManagerInstance.sessionTimeout).getMillis))
          UMDataServices().updateDocument(Map("id" -> newAppSession.id), newAppSession)
        case None =>
          session = None
      }
    }
    session
  }

  def downloadSessionToMemory(sessionToken: Guid[Session]): Option[TSession] = {
    val uas = UMDataServices().getDocuments[UserAppSession](Map("sessionId" -> sessionToken.id)).headOption
    if (uas != None) {
      inMemorySessionManagerInstance.saveSession(SecurityManager.createSession(uas.get.user.userName, sessionToken).asInstanceOf[TSession])
      inMemorySessionManagerInstance.getSession(sessionToken)
    }
    else {
      None
    }
  }

  def getSessions(predicate: TSession => Boolean): Traversable[TSession] = {
    inMemorySessionManagerInstance.getSessions(predicate)
  }

  def cleanUpOldSessions(): Unit = {
    UMDataServices().removeDocuments[UserAppSession](Map("expireTime" -> MongoDBObject("$lt" -> new Timestamp(DateTime.now.getMillis))))
    this.inMemorySessionManagerInstance.cleanUpOldSessions()
  }
}

object AppSessionManager {
  def apply[TSession <: UserSession](timeout: Int): AppSessionManager[TSession] = {
    new AppSessionManager(InMemorySessionManager[TSession](timeout))
  }
}
