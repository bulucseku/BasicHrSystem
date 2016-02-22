package com.sentrana.biq.exceptions

import com.sentrana.biq.core.conceptual.AttributeForm

/**
 * Created by williamhogben on 4/1/15.
 */
class UninitializedFormException(val form: AttributeForm) extends Exception {
  override def getMessage: String = {
    "The attribute was not initialized with id: " + form.id
  }
}
