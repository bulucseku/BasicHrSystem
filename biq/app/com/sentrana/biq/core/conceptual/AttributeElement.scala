package com.sentrana.biq.core.conceptual

/**
 *
 * @param id
 * @param value
 */
case class AttributeElement(
    override val id:            String,
    value:                      String,
    private var _childElements: Traversable[AttributeElement] = Nil,
    var ancestorForm:           Option[AttributeForm]         = None
) extends HierarchicalConceptualObject[AttributeForm](id, value, None) with FilterUnit {

  var parentElement: Option[AttributeElement] = None

  def childElements = _childElements
  def childElements_=(elems: Traversable[AttributeElement]): Unit = {
    _childElements = elems
    _childElementsString = _childElements.map(_.name).mkString("|")
  }

  /**
   *  This is just a string object to improve
   *  the search performance. Instead of search all the childElement objects,
   *  we can just search substring inside this string.
   */
  def childElementsString = _childElementsString
  private var _childElementsString: String = _childElements.map(_.name).mkString("|")

  def fundamentalElements: Traversable[AttributeElement] = {
    Traversable(this)
  }

  var _filterGroup: Option[ConceptualObjectWithChildren] = None
  def filterGroup: ConceptualObjectWithChildren = _filterGroup.getOrElse(parent)

  override def immediateChildren: Traversable[ConceptualObjectWithChildren] = {
    Nil
  }

  def parentElements: Traversable[AttributeElement] = {
    if (parentElement.isEmpty)
      List[AttributeElement]()
    else
      parentElement.get.parentElements ++ Traversable(parentElement.get)
  }
}

object AttributeElement {
  val expressionSeparator: Char = ':'
}