package com.sentrana.biq

import java.io.File
import java.lang.String
import java.net.URL
import scala._; import Predef._

/** This object was generated by sbt-buildinfo. */
case object BuildInfo {
  /** The value is "BIQ". */
  val name: String = "BIQ"
  /** The value is "3.3.2-50771598acaefcac666369bc83ea4ded21d2fd51-SNAPSHOT". */
  val version: String = "3.3.2-50771598acaefcac666369bc83ea4ded21d2fd51-SNAPSHOT"
  /** The value is "2.11.7". */
  val scalaVersion: String = "2.11.7"
  /** The value is "0.13.8". */
  val sbtVersion: String = "0.13.8"
  /** The value is "2016-02-18T10:14Z". */
  val buildDate: String = "2016-02-18T10:14Z"
  /** The value is "2.3.10". */
  val playVersion: String = "2.3.10"
  override val toString: String = {
    "name: %s, version: %s, scalaVersion: %s, sbtVersion: %s, buildDate: %s, playVersion: %s" format (
      name, version, scalaVersion, sbtVersion, buildDate, playVersion
    )
  }
}