package com.sentrana.biq

import com.sentrana.appshell.play.config.{ WithConfigSubFolderLocation, WithBaseConfig }
import com.sentrana.usermanagement.mongo.WithUMEmbeddedMongoDB
import org.scalatest.Suites
import org.scalatestplus.play.OneAppPerSuite
import play.api.test.FakeApplication

/**
 * Created by williamhogben on 5/13/15.
 */
trait BIQTestSuite extends OneAppPerSuite
    with WithBaseConfig
    with WithConfigSubFolderLocation
    with WithUMEmbeddedMongoDB {
  this: Suites =>

  abstract override def config: Map[String, Any] =
    super.config + ("smtp.mock" -> "yes")

  override val configSubFolderLocation = "/conf/"

  // Override app if you need a FakeApplication with other than non-default parameters.
  implicit override lazy val app: FakeApplication = FakeApplication(withGlobal = Some(Global), additionalConfiguration = config)

  val databaseName = "biq"

  override val additionalMongoDatabases = List(databaseName)

  override val additionalCollectionsToCreate = Map(
    databaseName -> Seq(
      "actionLog",
      "booklet",
      "bookletRecipients",
      "configurationGroup",
      "dataFilterMapping",
      "derivedColumn",
      "metadataCache",
      "repoDefs",
      "report",
      "reportRecipients",
      "repository"
    )
  )

  override val additionalCollectionsToImport = Map[String, Map[String, String]](
    databaseName -> Map(
      "configurationGroup" -> s"${app.path.getAbsolutePath}/test/com/sentrana/biq/mongo/json/configurationGroup.json"
    )
  )
}
