lazy val root = project.in(file(".")).dependsOn(sbtCommon)
lazy val sbtCommon = file("sbt-common")
