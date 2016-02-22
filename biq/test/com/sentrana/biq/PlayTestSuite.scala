package com.sentrana.biq

import com.sentrana.biq.controllers._
import com.sentrana.biq.core._
import com.sentrana.biq.core.conceptual._
import com.sentrana.biq.core.physical.Sql.MySQL.{ MySqlDataWarehouseSpec, MySqlQueryGeneratorSpec }
import com.sentrana.biq.core.physical._
import com.sentrana.biq.metadata.MongoMetadataCacheSpec
import org.scalatest.Suites

/**
 * This is the master Play test suite we are going to execute.
 * After you create a new object or function and you need the app context to execute it, you need
 * to create a test spec like [class DataUtilitySpec extends PlaySpec with ConfiguredApp], and then add it
 * to this master Suites constructor.
 * You can also add additional configuration to overwrite default application configuration for testing purpose.
 * Created by szhao on 10/23/2014.
 */
// This is the "master" suite
class PlayTestSuite extends Suites(
  /* Conceptual object specs */
  new MetricSpec,

  /* Physical object specs */
  new ComparisonSpec,
  new MySqlDataWarehouseSpec,
  new MySqlQueryGeneratorSpec,
  new RepositorySpec,
  new SqlStatementBuilderSpec,
  new StatementPartSpec,

  /* Metadata specs */
  new MongoMetadataCacheSpec,

  /* Service Specs */
  new AccessCheckSpec,
  new BIQServiceUtilSpec,
  new BookletServiceSpec,
  // new BookletSharingServiceSpec,
  new SecurityServiceSpec, // Must be run before MetadataServiceSpec
  new MetadataServiceSpec, // Must be run before DerivedColumnServiceSpec
  new DerivedColumnServiceSpec,
  new ReportingServiceSpec,
  new ReportServiceSpec,
  // new ReportSharingServiceSpec,
  new SalesforceServiceSpec,

  /* Report Sharing Service's Unit Tests */
  new ReportRecipientManagerSpec,
  new TransitionHandlerSpec,

  /* Booklet Sharing Service's Unit Specs */
  new BookletRecipientManagerSpec,
  new BookletTransitionHandlerSpec
) with BIQTestSuite
