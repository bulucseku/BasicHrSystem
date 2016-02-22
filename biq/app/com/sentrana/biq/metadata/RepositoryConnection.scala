package com.sentrana.biq.metadata

import com.sentrana.appshell.utils.XmlUtils._

import scala.language.implicitConversions
import scala.util.Try
import scala.xml.Node

/**
 * RepositoryConnection case class
 *
 * TODO: Add semantic requirements and corresponding test cases for constructor
 * TODO: Add proper documentation for class and params
 *
 * @param name
 * @param source
 * @param connectionType
 * @param connectionUrl
 */
case class RepositoryConnection(
  name:           String,
  source:         String,
  connectionType: String,
  connectionUrl:  String
)

object RepositoryConnection {
  implicit def fromXml(connNode: Node): Try[RepositoryConnection] = {
    for {
      name <- (connNode \ "@id").textRequired
      connectionType <- (connNode \ "datawarehouse" \ "connection" \ "@providerName").textRequired
      connectionUrl <- (connNode \ "datawarehouse" \ "connection" \ "@connectionString").textRequired
    } yield RepositoryConnection(
      name,
      (connNode \ "@source").textOrNone.getOrElse("Database"),
      connectionType,
      connectionUrl
    )
  }
}

case class Connection(
  connectionType: String,
  connectionUrl:  String
)

object Connection {
  implicit def fromXml(connNode: Node): Try[Connection] = {
    for {
      connectionType <- (connNode \ "@providerName").textRequired
      connectionUrl <- (connNode \ "@connectionString").textRequired
    } yield Connection(
      connectionType,
      connectionUrl
    )
  }
}
