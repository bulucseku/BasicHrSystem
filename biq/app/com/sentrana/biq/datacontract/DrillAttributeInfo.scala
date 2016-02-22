package com.sentrana.biq.datacontract

/**
 * Information about an attribute that is being drilled to. <strong>Not sure why we need a class for this. Perhaps we should simply send attribute name?<strong>
 *
 * @constructor
 * @param formName   The name of the attribute form.
 * @param formCount   The count of the attribute form.
 */
case class DrillAttributeInfo(
  formName:  String,
  formCount: Int
)
