package com.sentrana.biq.datacontract

import com.sentrana.appshell.domain.DocumentObject
import com.sentrana.usermanagement.domain.document.{ UMDataServices, User }
import org.joda.time.DateTime

/**
 * Created by william.hogben on 3/4/2015.
 */
case class DerivedColumn(
    id:                   Option[String],
    dataSource:           String,
    derivedColumnName:    String,
    derivedColumnVersion: Int,
    createDate:           Long           = DateTime.now().getMillis,
    createUserId:         String,
    lastModDate:          Long           = DateTime.now().getMillis,
    lastModUserId:        String,
    expression:           String,
    precision:            Int,
    dataType:             String,
    formulaType:          String
) extends DocumentObject {

  lazy val createUser: User = UMDataServices.getActiveUser("id", createUserId).getOrElse(
    throw new Exception("User could not be found with userId: " + createUserId)
  )
  lazy val lastModUser: User = UMDataServices.getActiveUser("id", createUserId).getOrElse(
    throw new Exception("User could not be found with userId: " + lastModUserId)
  )
}

object DerivedColumn extends DocumentObject {
  override def source = "derivedColumn"
}
