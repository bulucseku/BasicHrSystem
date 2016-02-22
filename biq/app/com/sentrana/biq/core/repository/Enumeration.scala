package com.sentrana.biq.core.repository

import com.sentrana.appshell.utils.Enum

object joinOperator extends Enum {
  type joinOperator = Value
  val InnerJoin, LeftOuterJoin, FullOuterJoin, CrossJoin = Value
}

object BinaryOperator extends Enumeration {
  type BinaryOperator = Value
  val Addition, Subtraction, Multiplication, Division = Value
}