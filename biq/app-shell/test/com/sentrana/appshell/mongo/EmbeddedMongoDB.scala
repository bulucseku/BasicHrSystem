package com.sentrana.appshell.mongo

import scala.collection.JavaConversions._

import com.mongodb.{ BasicDBObject, MongoClient }

import de.flapdoodle.embed.mongo.{ MongoImportProcess, MongoImportStarter, MongodProcess, MongodStarter }
import de.flapdoodle.embed.mongo.config.{ MongoImportConfigBuilder, MongodConfigBuilder, Net }
import de.flapdoodle.embed.mongo.distribution.Version
import de.flapdoodle.embed.process.runtime.Network

class EmbeddedMongoDB(mongoHost: String, mongoPort: Int) {
  private val mongoVersion = Version.Main.PRODUCTION

  private var mongodProcess: MongodProcess = _
  private var mongoImportProcesses: Seq[MongoImportProcess] = Seq()

  private lazy val mongoClient: MongoClient = new MongoClient(mongoHost, mongoPort)

  def start(): Unit = {
    mongodProcess = startMongod(mongoPort)
  }

  def stop(): Unit = {
    Option(mongodProcess).foreach{ _.stop() }
    mongoImportProcesses.foreach{ _.stop() }
  }

  def addAdminUser(username: String, password: String): Unit = {
    val db = mongoClient.getDB("admin")
    val cmd = new BasicDBObject(Map(
      "createUser" -> username,
      "pwd" -> password,
      "roles" -> Array("root")
    ))
    db.command(cmd)
    ()
  }

  def createCollection(database: String, collection: String): Unit = {
    val db = mongoClient.getDB(database)
    db.createCollection(collection, new BasicDBObject())
    ()
  }

  def importCollection(database: String, collection: String, jsonFile: String): Unit = {
    val mongoImportProcess = startMongoImport(
      port       = mongoPort,
      dbName     = database,
      collection = collection,
      jsonFile   = jsonFile
    )
    mongoImportProcesses :+= mongoImportProcess
  }

  /**
   * The following methods were adapted from the example at:
   *   https://github.com/flapdoodle-oss/de.flapdoodle.embed.mongo#import-json-file-with-mongoimport-command
   */

  private def startMongod(port: Int): MongodProcess = {
    val mongodConfig = new MongodConfigBuilder()
      .version(mongoVersion)
      .net(new Net(port, Network.localhostIsIPv6))
      .build

    val mongodExecutable = MongodStarter.getDefaultInstance.prepare(mongodConfig)
    mongodExecutable.start()
  }

  private def startMongoImport(
    port:       Int,
    dbName:     String,
    collection: String,
    jsonFile:   String,
    jsonArray:  Boolean = true,
    upsert:     Boolean = true,
    drop:       Boolean = true
  ): MongoImportProcess = {
    val mongoImportConfig = new MongoImportConfigBuilder()
      .version(mongoVersion)
      .net(new Net(port, Network.localhostIsIPv6))
      .db(dbName)
      .collection(collection)
      .upsert(upsert)
      .dropCollection(drop)
      .jsonArray(jsonArray)
      .importFile(jsonFile)
      .build

    val mongoImportExecutable = MongoImportStarter.getDefaultInstance.prepare(mongoImportConfig)
    mongoImportExecutable.start()
  }
}
