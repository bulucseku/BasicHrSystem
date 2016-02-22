package com.sentrana.biq.core

import anorm.NamedParameter
import com.sentrana.appshell.data.Dataset

/**
 * Created by szhao on 1/8/2015.
 */
trait Query {
  val queryText: String
  val queryParameters: Traversable[NamedParameter]
  def execute: Dataset
}
