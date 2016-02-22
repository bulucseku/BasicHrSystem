package com.sentrana.biq.core.conceptual

/**
 * Created by szhao on 1/8/2015.
 */
case class AggregateFunction(
  override val id:          String,
  override val name:        String,
  override val description: Option[String],
  formatString:             Option[String]
) extends ConceptualObject