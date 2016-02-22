package com.sentrana.appshell.utils

import scala.util.{ Success, Failure }

object XmlUtils {

  import scala.util.Try
  import scala.util.control.Exception._
  import scala.xml._
  import scala.xml.transform.{ RewriteRule, RuleTransformer }
  import SeqUtils._

  implicit class XmlOps(node: NodeSeq) {

    // def noneIfEmpty: Option[NodeSeq] = if (node.isEmpty) None else Some(node)

    def addAttr(name: String, value: Any): Elem = node match {
      case e: Elem => e % Attribute(name, Text(value.toString), Null)
      case _       => throw new IllegalArgumentException("node must be an Elem")
    }

    def addElem(child: NodeSeq): Elem = node match {
      case e: Elem => e.copy(child = e.child ++ child)
      case _       => throw new IllegalArgumentException("node must be an Elem")
    }

    def removeAttr(name: String, recursive: Boolean = false): NodeSeq = node match {
      case e: Elem if !recursive    => e.copy(attributes = e.attributes.remove(name))
      case n: NodeSeq if !recursive => n flatMap { _.removeAttr(name, recursive) }
      case _                        => new RuleTransformer(new RemoveAttrRule(name)).transform(node)
    }

    def removeElem(name: String, recursive: Boolean = false): NodeSeq = node match {
      case e: Elem if !recursive    => e.copy(child = e.child.filter(_.label != name))
      case n: NodeSeq if !recursive => n flatMap { _.removeElem(name, recursive) }
      case _                        => new RuleTransformer(new RemoveElemRule(name)).transform(node)
    }

    def splitAttr(attr: String, delim: String = ","): Seq[String] =
      (node \ s"@$attr").textOrNone map (_.split(delim).toSeq) getOrElse Seq()

    def strOrNone: Option[String] =
      node.toString.toSeq.noneIfEmpty.map(_.toString)

    def textOrNone: Option[String] =
      node.text.trim.toSeq.noneIfEmpty.map(_.toString)

    def boolOrNone: Try[Option[Boolean]] =
      catching(classOf[IllegalArgumentException]) withTry {
        node.text.trim match {
          case ""   => None
          case text => Some(text.toBoolean)
        }
      }

    def intOrNone: Try[Option[Int]] =
      catching(classOf[NumberFormatException]) withTry {
        node.text.trim match {
          case ""   => None
          case text => Some(text.toInt)
        }
      }

    def textRequired: Try[String] =
      catching(classOf[IllegalArgumentException]) withTry {
        val nodeLabel = node.headOption map { _.label } getOrElse {
          throw new IllegalArgumentException("Node sequence must be non-empty")
        }
        node.text.trim match {
          case ""   => throw new IllegalArgumentException(s"Node '$nodeLabel' must contain text")
          case text => text
        }
      }

    def attributeRequired(attribute: String): Try[String] =
      catching(classOf[IllegalArgumentException]) withTry {
        (node \ s"@$attribute").textRequired match {
          case Failure(e) => throw new IllegalArgumentException(
            s"Node must have attribute $attribute. Node was: $node"
          )
          case Success(text) => text
        }
      }
  }

  class RemoveAttrRule(name: String) extends RewriteRule {
    override def transform(n: Node): NodeSeq = n match {
      case e: Elem => e.copy(attributes = e.attributes.remove(name))
      case _       => n
    }
  }

  class RemoveElemRule(name: String) extends RewriteRule {
    override def transform(n: Node): NodeSeq = n match {
      case e: Elem if e.label == name => NodeSeq.Empty
      case _                          => n
    }
  }

}
