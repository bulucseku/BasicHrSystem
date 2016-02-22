package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject
import com.sentrana.usermanagement.domain.document.{ UMDataServices, User }
import org.joda.time.DateTime

/**
 * Created by ba on 8/6/2015.
 */
case class SavedFilterGroup(
    id:            Option[String],
    dataSource:    String,
    name:          String,
    createDate:    Long             = DateTime.now().getMillis,
    createUserId:  String,
    lastModDate:   Long             = DateTime.now().getMillis,
    lastModUserId: String,
    filters:       Seq[SavedFilter]
) extends DocumentObject {

  lazy val createUser: User = UMDataServices.getActiveUser("id", createUserId).get
  lazy val lastModUser: User = UMDataServices.getActiveUser("id", lastModUserId).get
}

case class SavedFilter(filterId: String)

object SavedFilterGroup extends DocumentObject {
  override def source = "savedFilterGroup"
}
