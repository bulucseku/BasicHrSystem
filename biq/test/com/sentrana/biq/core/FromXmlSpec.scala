package com.sentrana.biq.core

import scala.util.Try
import scala.xml._

import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.UnitSpec

abstract class FromXmlSpec extends UnitSpec {

  def failWithoutAttr[A](
    name:      String,
    node:      Node,
    recursive: Boolean = false
  )(implicit fromXml: Node => Try[A]) =
    failWithout(name, node, true, recursive)(fromXml)

  def failWithoutElem[A](
    name:      String,
    node:      Node,
    recursive: Boolean = false
  )(implicit fromXml: Node => Try[A]) =
    failWithout(name, node, false, recursive)(fromXml)

  def succeedWithoutAttr[A](
    name:        String,
    node:        Node,
    testSuccess: (A, A) => Unit,
    recursive:   Boolean        = false
  )(implicit fromXml: Node => Try[A]) =
    succeedWithout(name, node, true, testSuccess, recursive)(fromXml)

  def succeedWithoutElem[A](
    name:        String,
    node:        Node,
    testSuccess: (A, A) => Unit,
    recursive:   Boolean        = false
  )(implicit fromXml: Node => Try[A]) =
    succeedWithout(name, node, false, testSuccess, recursive)(fromXml)

  def failWithout[A](
    name:      String,
    node:      Node,
    isAttr:    Boolean,
    recursive: Boolean = false
  )(implicit fromXml: Node => Try[A]) = {
    val parsed = parseWithout(name, node, isAttr, recursive)(fromXml)
    parsed must be a 'failure
  }

  def succeedWithout[A](
    name:        String,
    node:        Node,
    isAttr:      Boolean,
    testSuccess: (A, A) => Unit,
    recursive:   Boolean        = false
  )(implicit fromXml: Node => Try[A]) = {
    val original = fromXml(node).success.value
    val removed = parseWithout(name, node, isAttr, recursive)(fromXml).success.value
    testSuccess(original, removed)
  }

  def parseWithout[A](
    name:      String,
    node:      Node,
    isAttr:    Boolean,
    recursive: Boolean = false
  )(implicit fromXml: Node => Try[A]) = {
    val withRemoved =
      if (isAttr) node.removeAttr(name, recursive)
      else node.removeElem(name, recursive)
    fromXml(withRemoved.head)
  }

}
