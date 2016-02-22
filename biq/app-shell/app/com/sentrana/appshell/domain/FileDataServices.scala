package com.sentrana.appshell.domain

import scala.io.Source
import scala.reflect.ClassTag
import scala.reflect.io.File
import scala.reflect.runtime.universe._

import org.json4s.native.Serialization._

import com.sentrana.appshell.Global.JsonFormat.formats

/**
 * Created by yogisha.dixit on 10/9/2014.
 */
class FileDataServices(filePath: String) extends DataServices {
  def saveDocument[T <: DocumentObject](obj: T)(implicit tt: TypeTag[T], ct: ClassTag[T]): Unit = {
    withCollection { (fileName, docs: List[T]) =>
      val updatedDocs = docs :+ obj
      saveFile(fileName, updatedDocs)
    }
  }

  def updateDocument[T <: DocumentObject](query: Map[String, Any], obj: T)(implicit tt: TypeTag[T], ct: ClassTag[T]): Unit = {
    withCollection { (fileName, docs: List[T]) =>
      val updatedDocs = docs map { elem =>
        if (matchesQuery(query, elem)) obj else elem
      }
      saveFile(fileName, updatedDocs)
    }
  }

  def getDocuments[T <: DocumentObject](query: Map[String, Any])(implicit tt: TypeTag[T], ct: ClassTag[T]): List[T] = {
    withCollection { (_, docs: List[T]) =>
      docs filter { matchesQuery(query, _) }
    }
  }

  def removeDocuments[T <: DocumentObject](query: Map[String, Any])(implicit tt: TypeTag[T], ct: ClassTag[T]): Unit = {
    withCollection { (fileName, docs: List[T]) =>
      val updatedDocs = docs filterNot { matchesQuery(query, _) }
      saveFile(fileName, updatedDocs)
    }
  }

  private def withCollection[T <: DocumentObject, R](block: (String, List[T]) => R)(implicit tt: TypeTag[T], ct: ClassTag[T]): R = {
    val fileName = getCollectionName
    val docs = getFileContent(fileName)
    block(fileName, docs)
  }

  private def matchesQuery[T <: DocumentObject](query: Map[String, Any], obj: T)(implicit tt: TypeTag[T], ct: ClassTag[T]): Boolean = {
    val mirror = runtimeMirror(getClass.getClassLoader)
    val objInstanceMirror = mirror.reflect(obj)
    query forall {
      case (field, value) =>
        val fieldSymbol = typeOf[T].decl(TermName(field)).asTerm
        val fieldMirror = objInstanceMirror.reflectField(fieldSymbol)
        fieldMirror.get == value
    }
  }

  private def saveFile[T <: DocumentObject](fileName: String, obj: List[T]): Unit = {
    File(getFilePath(fileName)).writeAll(writePretty(obj))
  }

  private def getFileContent[T <: DocumentObject](fileName: String)(implicit tt: TypeTag[T], ct: ClassTag[T]): List[T] = {
    read[List[T]](Source.fromFile(getFilePath(fileName)).mkString)
  }

  private def getFilePath(fileName: String): String = {
    filePath + File.separator + fileName + ".json"
  }
}

object FileDataServices {
  @volatile private var _instance: FileDataServices = _

  def apply(filePath: String): FileDataServices = {
    _instance = new FileDataServices(filePath)
    _instance
  }

  def apply() = {
    _instance
  }
}
