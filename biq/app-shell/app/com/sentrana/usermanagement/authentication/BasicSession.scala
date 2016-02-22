package com.sentrana.usermanagement.authentication

import org.joda.time.DateTime

/**
 * Created by szhao on 1/23/14.
 */
class BasicSession(val sessionToken: Guid[Session], val creationTime: DateTime, var accessTime: DateTime, var modificationTime: DateTime, var isOpen: Boolean) {
  def this() = this(Guid[Session].random, DateTime.now(), DateTime.now(), DateTime.now(), true)

  def this(session: Session) = this(session.sessionToken, session.creationTime, session.accessTime, session.modificationTime, session.isOpen)

  def this(sessionToken: Guid[Session]) = this(if (sessionToken == null) Guid[Session].random else sessionToken, DateTime.now(), DateTime.now(), DateTime.now(), true)

  def markAccessed(): Unit = {
    accessTime = DateTime.now()
  }

  def markModified(): Unit = {
    modificationTime = DateTime.now()
  }

  def open(): Unit = {
    isOpen = true
  }

  def close(): Unit = {
    isOpen = false
  }
}
