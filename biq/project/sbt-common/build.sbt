sbtPlugin := true

name := "sbt-common"

organization := "com.sentrana"

version := "0.1.0-SNAPSHOT"

scalaVersion := "2.10.4"

// Compile-time build info plugin
addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.5.0")

// Git versioning plugin
addSbtPlugin("com.typesafe.sbt" % "sbt-git" % "0.8.5")

// Scalariform plugin
addSbtPlugin("org.scalariform" % "sbt-scalariform" % "1.5.1")

// Scalastyle plugin
addSbtPlugin("org.scalastyle" %% "scalastyle-sbt-plugin" % "0.7.0")

// Scoverage plugin
addSbtPlugin("org.scoverage" % "sbt-scoverage" % "1.3.3")

// Play plugin
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.3.10")
