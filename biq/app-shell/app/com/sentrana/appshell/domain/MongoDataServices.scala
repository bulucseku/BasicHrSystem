package com.sentrana.appshell.domain

import scala.collection.JavaConversions
import scala.reflect.ClassTag
import scala.reflect.runtime.universe._

import play.api.Configuration

import org.jongo.{ Jongo, RawResultHandler }
import org.json4s.native.Serialization._

import com.mongodb.MongoException
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.commons.TypeImports._
import com.mongodb.util.JSON
import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.exceptions.ExternalServiceError

/**
 * Created by yogisha.dixit on 10/9/2014.
 */
class MongoDataServices(
    mongoDbHost:     String,
    mongoDbPort:     Int,
    mongoDbDatabase: String,
    mongoDbUser:     String,
    mongoDbPass:     String
) extends DataServices {

  private val server = new ServerAddress(mongoDbHost, mongoDbPort)
  private val credentials = MongoCredential.createCredential(mongoDbUser, "admin", mongoDbPass.toCharArray)
  private val mongoClient = handleMongoError { MongoClient(server, List(credentials)) }
  private val db: MongoDB = handleMongoError { mongoClient(mongoDbDatabase) }
  private val writeConcern = WriteConcern.Safe

  private def handleMongoError[A](block: => A): A = try block catch {
    case ex: MongoException => throw new ExternalServiceError(s"Mongo error: ${ex.getMessage}", Some(ex))
  }

  def saveDocument[T <: DocumentObject](obj: T)(implicit tt: TypeTag[T], ct: ClassTag[T]): Unit = {
    withCollection { coll =>
      val dbObj = JSON.parse(write(obj)).asInstanceOf[BasicDBObject]
      coll.save(dbObj, concern = writeConcern)
      ()
    }
  }

  def updateDocument[T <: DocumentObject](query: Map[String, Any], obj: T)(implicit tt: TypeTag[T], ct: ClassTag[T]): Unit = {
    withCollection { coll =>
      val dbObj = JSON.parse(write(obj)).asInstanceOf[BasicDBObject]
      coll.update(query.asDBObject, dbObj, concern = writeConcern)
      ()
    }
  }

  def getDocuments[T <: DocumentObject](query: Map[String, Any] = Map())(implicit tt: TypeTag[T], ct: ClassTag[T]): List[T] = {
    withCollection { coll =>
      val results = JSON.serialize(coll.find(query.asDBObject).toList)
      read[List[T]](results)
    }
  }

  def removeDocuments[T <: DocumentObject](query: Map[String, Any])(implicit tt: TypeTag[T], ct: ClassTag[T]): Unit = {
    withCollection { coll =>
      coll.remove(query.asDBObject, concern = writeConcern)
      ()
    }
  }

  private def withCollection[T <: DocumentObject, R](block: MongoCollection => R)(implicit tt: TypeTag[T], ct: ClassTag[T]): R = {
    handleMongoError {
      val collectionName = getCollectionName
      val collection = db(collectionName)
      block(collection)
    }
  }

  def aggregate[T <: Object](aggregations: List[String], collection: String)(implicit ev: Manifest[T]): List[T] = {
    handleMongoError {
      val jongo = new Jongo(db.underlying)
      val coll = jongo.getCollection(collection)
      val result = aggregations match {
        case Nil => coll.aggregate("")
        case head :: tail =>
          val aggs = coll.aggregate(head)
          tail.foreach(t => aggs.and(t))
          aggs
      }
      val results = JavaConversions.asScalaIterator(result.map(new RawResultHandler[DBObject])).toList
      val json = JSON.serialize(results)
      read[List[T]](json)
    }
  }

}

object MongoDataServices {

  private val _mongoDatabases = collection.mutable.Map[String, MongoDataServices]()

  def apply(
    connectionName:  String,
    mongoDbHost:     String,
    mongoDbPort:     Int,
    mongoDbDatabase: String,
    mongoDbUser:     String,
    mongoDbPass:     String
  ): MongoDataServices = {
    val instance = new MongoDataServices(mongoDbHost, mongoDbPort, mongoDbDatabase, mongoDbUser, mongoDbPass)
    _mongoDatabases(connectionName) = instance
    instance
  }

  def apply(mongoDb: String) = {
    _mongoDatabases(mongoDb)
  }

  def fromConfig(configuration: Configuration): Unit = {
    val mongoConfig = configuration.getConfig("mongodb-mdr")
    mongoConfig.map(_.subKeys).getOrElse(Seq()).foreach { connectionName =>
      val config = mongoConfig.get.getConfig(connectionName).get
      MongoDataServices(
        connectionName,
        config.getString("host").getOrElse(""),
        config.getInt("port").getOrElse(27017),
        config.getString("database").getOrElse(""),
        config.getString("user").getOrElse(""),
        config.getString("pass").getOrElse("")
      )
    }
  }

}
