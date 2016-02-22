package com.sentrana.biq.datacontract

import com.sentrana.appshell.utils.Enum

/**
 * Created by tawkir on 3/3/2015.
 */

object SharingObjectType extends Enumeration {
  type SharingObjectType = Value
  val REPORT, BOOKLET = Value
}

object SharingObjectChangeType extends Enumeration {
  type SharingObjectChangeType = Value
  val AC, RV, UPDATED, DELETED = Value
}
