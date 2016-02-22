package com.sentrana.appshell

import java.io.{ File, FileInputStream }

import scala.util.Try
import scala.xml.parsing.NoBindingFactoryAdapter
import scala.xml.{ Node, NodeSeq, PrettyPrinter }

import play.libs.XML

import org.w3c.dom.{ Node => DOMNode }

import com.sun.org.apache.xalan.internal.xsltc.trax.DOM2SAX

import com.sentrana.appshell.utils.SeqUtils

package object metadata {

  val PrettyPrinterWidth = 200
  val PrettyPrinterStep = 2

  /** Pretty printer for formatted XML output */
  val prettyPrinter: PrettyPrinter = new PrettyPrinter(PrettyPrinterWidth, PrettyPrinterStep)

  /**
   * Tries to read the file `name` as XML
   *
   * @param name  the name of the file to be read as XML
   * @return      `Success` containing the root XML `Node` if there were no problems
   *              or `Failure` otherwise
   */
  def loadXMLFile(name: String): Try[Node] = Try {
    val inputStream = new FileInputStream(new File(name))
    val dom = XML.fromInputStream(inputStream, "utf-8")
    asXmlNode(dom)
  }

  /**
   * Tries to read the file `name` as XML
   *
   * @param xml   The XML content.
   * @return      `Success` containing the root XML `Node` if there were no problems
   *              or `Failure` otherwise
   */
  def loadXMLString(xml: String): Try[Node] = Try {
    val dom = XML.fromString(xml)
    asXmlNode(dom)
  }

  /* Adapted from http://stackoverflow.com/a/3922305/1500244 */
  private def asXmlNode(dom: DOMNode): Node = {
    val dom2sax = new DOM2SAX(dom)
    val adapter = new NoBindingFactoryAdapter
    dom2sax.setContentHandler(adapter)
    dom2sax.parse()
    adapter.rootElem
  }

  /**
   * Reads the given XML `configFile` and tries to parse it into an instance
   * of the given type `A`.
   *
   * @param configFile  the name of the XML config file to be parsed
   * @param fromXml     a function that converts an XML `Node` to a `Try[A]`
   * @tparam A          the type of the class that the XML `Node` will be parsed to
   * @return            `Success` of type `A` if parsing succeeded without error,
   *                    `Failure` otherwise
   */
  def parseConfigFile[A](configFile: String)(implicit fromXml: Node => Try[A]): Try[A] = {
    val configNode = loadXMLFile(configFile)
    configNode flatMap fromXml
  }

  /**
   * Reads the given XML `configFile` and tries to parse it into an instance
   * of the given type `A`.
   *
   * @param configXml   the content of the XML config to be parsed
   * @param fromXml     a function that converts an XML `Node` to a `Try[A]`
   * @tparam A          the type of the class that the XML `Node` will be parsed to
   * @return            `Success` of type `A` if parsing succeeded without error,
   *                    `Failure` otherwise
   */
  def parseConfig[A](configXml: String)(implicit fromXml: Node => Try[A]): Try[A] = {
    val configNode = loadXMLString(configXml)
    configNode flatMap fromXml
  }

  /**
   * Tries to parse the given `NodeSeq` to a sequence of `A`s
   *
   * @param nodes     the `NodeSeq` to be parsed
   * @param fromXml   a function that converts an XML `Node` to a `Try[A]`
   * @tparam A        the type of the class that the XML `Node`s will be parsed to
   * @return          `Success` of type `Seq[A]` if parsing succeeded without error,
   *                  `Failure` otherwise
   */
  def parseSeq[A](nodes: NodeSeq)(implicit fromXml: Node => Try[A]): Try[Seq[A]] = {
    val seq = nodes map fromXml
    SeqUtils.trySequence(seq)
  }

}
