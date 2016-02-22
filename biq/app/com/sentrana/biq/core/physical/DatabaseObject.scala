package com.sentrana.biq.core.physical

import com.sentrana.biq.core.conceptual.ConceptualObject

/**
 * Created by szhao on 1/12/2015.
 */
abstract class DatabaseObject(val databaseId: String) {
  // A unique identifier to be used within a query.
  def queryAlias: String

  def immediateChildren: Traversable[DatabaseObject]

  @deprecated("May not perform well when there is a large number of children.", "")
  def allChildren: Traversable[DatabaseObject] = immediateChildren ++ immediateChildren.flatMap(child => child.allChildren)

  def conceptualEquivalent: Option[ConceptualObject]

  @deprecated("May not perform well when there is a large number of children.", "")
  def conceptualObjects: Traversable[ConceptualObject] = {
    val childObjects = immediateChildren.flatMap(child => child.conceptualObjects)
    if (conceptualEquivalent != None)
      conceptualEquivalent ++ childObjects
    else childObjects
  }

  override def toString: String = queryAlias

  def contains(concept: ConceptualObject): Boolean = findEquivalent(concept) != None

  def findEquivalent(concept: ConceptualObject): Option[DatabaseObject] = {
    if (Some(concept) == conceptualEquivalent)
      Some(this)
    else immediateChildren.map(child => child.findEquivalent(concept))
      .find(dbo => dbo != None).getOrElse(None)
  }
}

abstract class HierarchicalDatabaseObject[TParent <: DatabaseObject](databaseId: String) extends DatabaseObject(databaseId) {

  var parent: TParent

  def addTo(parent: TParent): Unit = {
    this.parent = parent
  }
}