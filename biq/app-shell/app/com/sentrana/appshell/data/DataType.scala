package com.sentrana.appshell.data

import com.sentrana.appshell.utils.Enum

/**
 * Created by szhao on 10/8/2014.
 */
object Justify extends Enum {
  type Justify = Value
  val LEFT, RIGHT = Value
}

object ColType extends Enum {
  type ColType = Value
  val ATTRIBUTE, METRIC = Value
}

object AttrValueType extends Enum {
  type AttrValueType = Value
  val TIMESERIES, DISCRETESERIES, CONTINUOUS_VALUES, NA = Value
}

object DataType extends Enum {
  type DataType = Value
  val DATETIME, STRING, CURRENCY, NUMBER, PERCENTAGE, DATAARRAY, DATE = Value
}

object DataBehavior extends Enum {
  type DataBehavior = Value
  val NONE, PREDICTED_LOW, PREDICTED_HIGH, PREDICTED, ACTUAL, PRESCRIBED_LOW, PRESCRIBED_HIGH, PRESCRIBED = Value
}

object FormulaType extends Enum {
  type FormulaType = Value
  val CM, DM = Value
}

object DrillType extends Enum {
  type DrillType = Value
  val DRILL_UP, DRILL_DOWN = Value
}
