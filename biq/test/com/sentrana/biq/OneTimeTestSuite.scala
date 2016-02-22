package com.sentrana.biq

import com.sentrana.biq.metadata.MongoMetadataCacheSpec
import org.scalatest.{ DoNotDiscover, Suites }

/**
 * This one is used when you are working on a specific spec or a couple of ones.
 * You can run this suite to get the spec executed and tested.
 * Just change the the specs included in the constructor.
 */
@DoNotDiscover
class OneTimeTestSuite extends Suites(
  new MongoMetadataCacheSpec
) with BIQTestSuite

