package com.sentrana.sbt.common

import sbt._
import sbt.Keys._

object BuildSettings {

  lazy val settings: Seq[Setting[_]] = Seq(
    scalacOptions ++= compilerFlags
  )

  lazy val compilerFlags = Seq(
    "-unchecked",
    "-deprecation",
    "-feature",
    "-Xlint",
    // Temporary fix for https://github.com/playframework/playframework/issues/5134
    "-Xlint:-missing-interpolator"
  )
}
