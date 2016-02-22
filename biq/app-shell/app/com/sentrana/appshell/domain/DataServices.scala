package com.sentrana.appshell.domain

import scala.reflect.ClassTag
import scala.reflect.runtime.universe._

/**
 * Created by yogisha.dixit on 10/9/2014.
 */
trait DataServices {
  def saveDocument[T <: DocumentObject](obj: T)(implicit tt: TypeTag[T], ct: ClassTag[T]): Unit
  def updateDocument[T <: DocumentObject](query: Map[String, Any], obj: T)(implicit tt: TypeTag[T], ct: ClassTag[T]): Unit
  def getDocuments[T <: DocumentObject](query: Map[String, Any])(implicit tt: TypeTag[T], ct: ClassTag[T]): List[T]
  def removeDocuments[T <: DocumentObject](query: Map[String, Any])(implicit tt: TypeTag[T], ct: ClassTag[T]): Unit

  def getDocument[T <: DocumentObject](query: Map[String, Any])(implicit tt: TypeTag[T], ct: ClassTag[T]): Option[T] =
    getDocuments(query).headOption

  protected def getCollectionName[T <: DocumentObject](implicit tt: TypeTag[T], ct: ClassTag[T]): String = {
    val mirror = runtimeMirror(getClass.getClassLoader)
    val mod = typeOf[T].typeSymbol.companion.asModule
    val im = mirror.reflect(mirror.reflectModule(mod).instance)
    im.reflectMethod(im.symbol.typeSignature.member(TermName("source")).asMethod)().asInstanceOf[String]
  }
}
