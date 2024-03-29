package com.sentrana.usermanagement.authentication

/**
 * Created by szhao on 2/28/14.
 */
sealed trait Permission
case object Administrator extends Permission
case object NormalUser extends Permission

object Permission {
  def valueOf(value: String): Permission = value match {
    case "Administrator" => Administrator
    case "NormalUser"    => NormalUser
    case _               => throw new IllegalArgumentException()
  }
}
