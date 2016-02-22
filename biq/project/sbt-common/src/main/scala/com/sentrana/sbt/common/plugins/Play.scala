package com.sentrana.sbt.common.plugins

import sbt._
import sbt.Keys._
import sbtbuildinfo.{ BuildInfoKey, BuildInfoKeys }

import play.PlayImport.PlayKeys._

import com.typesafe.sbt.web.SbtWeb.autoImport.Assets

object Play {

  lazy val settings: Seq[Setting[_]] =
    packageExcludeSources ++
    packageExcludeDocs ++
    packageExcludeAssets ++
    buildInfoSettings

  lazy val packageExcludeSources = Seq(
    publishArtifact in (Compile, packageSrc) := false
  )

  lazy val packageExcludeDocs = Seq(
    publishArtifact in (Compile, packageDoc) := false,
    sources in (Compile, doc) := Seq.empty
  )

  lazy val packageExcludeAssets = Seq(
    unmanagedSourceDirectories in Assets := Seq.empty,
    unmanagedResourceDirectories in Assets := Seq.empty
  )

  lazy val buildInfoSettings = Seq(
    BuildInfoKeys.buildInfoKeys ++= buildInfoKeys
  )

  lazy val buildInfoKeys = Seq[BuildInfoKey](
    playVersion
  )
}
