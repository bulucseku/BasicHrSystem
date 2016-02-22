package com.sentrana.biq.datacontract

/**
 * This is the object sent back from the tree filter control on the client side. Whenever the user is trying to unfold a node in the tree, a object representing the current selected node will be sent to the server. And the server will figure out all the child elments and send back an array of FilterElement objects so that the tree control on the client side could render the tree properly.
 *
 * @constructor
 * @param oid
 * @param name
 * @param hasChildren
 */
case class FilterElement(
  oid:         String,
  name:        Option[String],
  hasChildren: Option[Boolean]
)
