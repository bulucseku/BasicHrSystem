package com.sentrana.usermanagement.authentication

import org.joda.time._

/**
 * Note that by default, a session does not have any implicit attachment to its session manager.
 * Rather, an Session instance represents only the local copy of the session's state, and any
 * changes must be saved to a session manager to ensure their persistence.
 * Created by szhao on 1/23/14.
 */
trait Session {
  /**
   * The unique identifier for this session.
   */
  val sessionToken: Guid[Session]

  val creationTime: DateTime
  var accessTime: DateTime
  var modificationTime: DateTime

  var isOpen: Boolean

  /**
   * Updates the access time to reflect the current instant in time.
   * In general, this method need only be called by a session manager.
   */
  def markAccessed(): Unit
  /**
   * Updates the modification time to reflect the current instant in time.
   * In general, this method need only be called by a session manager.
   */
  def markModified(): Unit
  /**
   * Changes this session's local state to open.
   * This method should always return gracefully if the operation succeeds; otherwise it should
   * generate some kind of exception.
   */
  def open(): Unit

  /**
   * Changes this session's local state to closed.
   * In general, this method need only be called by a session manager.
   */
  def close(): Unit
}
