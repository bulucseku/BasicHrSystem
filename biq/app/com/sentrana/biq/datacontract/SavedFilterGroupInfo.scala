package com.sentrana.biq.datacontract

/**
 * Created by ba on 8/6/2015.
 */

case class SavedFilterGroupInfo(
  id:         Option[String],
  dataSource: String,
  name:       String,
  filterIds:  Seq[String]
)
