package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject

/**
 * Information about BIQ repository configuration
 *
 * @constructor
 * @param name    The name of the repository.
 * @param id   The ID of the repository.
 */
case class RepositoryDocument(
  name:              String,
  id:                String,
  xmlConfiguration:  Option[String],
  jsonConfiguration: Option[String]
) extends DocumentObject

object RepositoryDocument extends DocumentObject {
  override def source = "repository"
}

case class DataMappingDocument(
  mapping: String
) extends DocumentObject

object DataMappingDocument extends DocumentObject {
  override def source = "dataFilterMapping"
}