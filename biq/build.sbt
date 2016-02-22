import com.sentrana.sbt.common.Dependencies._

name := "BIQ"

git.baseVersion := "3.3.2"

libraryDependencies ++= Seq(
  apacheHttpClient,
  apacheHttpMime,
  casbah,
  commonsIo,
  jdbc,
  json4sExt,
  json4sMongo,
  json4sNative,
  nscalaTime,
  postgresql,
  prefuse,
  scalaReflect.value,
  scalaTestPlusPlay,
  twitterUtilCore,
  ws
)

lazy val biq = project.in(file("."))
  .enablePlugins(play.PlayScala)
  .aggregate(appshell)
  .dependsOn(appshell % "test->test;compile->compile")

lazy val appshell = project.in(file("app-shell"))
  .enablePlugins(play.PlayScala)

val mongoMigration = TaskKey[Unit]("migrate", "Migrate BIQ data from MySQL to MongoDB")

//Adds command line run task
fullRunTask(mongoMigration, Compile, "com.sentrana.biq.utils.SqlToMongoMigration", null)
