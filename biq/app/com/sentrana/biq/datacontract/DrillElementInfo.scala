package com.sentrana.biq.datacontract

/**
 * A single drill element. Information about the element that was selected by the user.
 *
 * @constructor
 * @param formName   The name of the attribute form (for the user to see).
 * @param formID   The ID of the attribute form.
 * @param eName   The name of the element (for the user to see).
 * @param actualName   The name of the element (for the drill path).
 * @param eID   The ID of the element.
 */
case class DrillElementInfo(
  formName:   String,
  formID:     String,
  eName:      String,
  actualName: String,
  eID:        String
)
