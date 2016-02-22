import com.sentrana.sbt.common.Dependencies._

name := "ApplicationShell"

version := "0.1"

resolvers += "softprops-maven" at "http://dl.bintray.com/content/softprops/maven"

libraryDependencies ++= Seq(
  anorm,
  apacheHttpClient,
  apacheHttpMime,
  cache,
  casbah,
  embeddedMongo,
  filters,
  forceRestAPI,
  jdbc,
  jongo,
  json4sExt,
  json4sMongo,
  json4sNative,
  mysql,
  playMailerPlugin,
  scalaCSV,
  scalaReflect.value,
  scalaTestPlusPlay,
  scalikeJDBCCore,
  scalikeJDBCTest,
  squeryl,
  twitterUtilCore,
  ws,
  "me.lessis" %% "courier" % "0.1.3"
)

lazy val appshell = project.in(file("."))
  .enablePlugins(play.PlayScala)
