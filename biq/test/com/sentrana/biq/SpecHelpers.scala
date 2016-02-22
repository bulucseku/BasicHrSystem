package com.sentrana.biq

import org.scalatest._
import org.scalatest.concurrent.ScalaFutures

trait SpecHelpers extends MustMatchers
  with OptionValues
  with TryValues
  with Inside
  with Inspectors
  with ScalaFutures
