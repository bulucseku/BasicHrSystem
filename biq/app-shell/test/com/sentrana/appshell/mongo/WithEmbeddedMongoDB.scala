package com.sentrana.appshell.mongo

import org.scalatest.{ BeforeAndAfterAll, Suite }

import com.sentrana.appshell.play.config.WithMongoDBConfig

trait WithEmbeddedMongoDB extends BeforeAndAfterAll {
  this: Suite with WithMongoDBConfig =>

  def collectionsToCreate: Map[String, Seq[String]]
  def collectionsToImport: Map[String, Map[String, String]]

  private lazy val embeddedMongo = new EmbeddedMongoDB(mongoHost, mongoPort)

  override def beforeAll(): Unit = {
    // Spin up embedded MongoDB instance
    embeddedMongo.start()

    // Add admin user for authentication through the app
    embeddedMongo.addAdminUser(mongoUsername, mongoPassword)

    // Initialize all specified collections on the given database
    collectionsToCreate.foreach {
      case (dbName, collections) =>
        collections.foreach{ embeddedMongo.createCollection(dbName, _) }
    }

    // Import specified collections from JSON files
    collectionsToImport.foreach{
      case (dbName, collections) => collections.foreach {
        case (collection, jsonFile) =>
          embeddedMongo.importCollection(dbName, collection, jsonFile)
      }
    }
  }

  override def afterAll(): Unit = {
    embeddedMongo.stop()
  }
}
