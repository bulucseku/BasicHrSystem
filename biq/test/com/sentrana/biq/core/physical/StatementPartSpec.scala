package com.sentrana.biq.core.physical

import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp

import com.sentrana.biq.UnitSpec
import com.sentrana.biq.core.physical.StatementPart.Implicits._

import anorm.NamedParameter

/**
 * Created by williamhogben on 7/20/15.
 */
@DoNotDiscover
class StatementPartSpec extends UnitSpec with ConfiguredApp {

  val np1 = List(NamedParameter("1", "1"))
  val np2 = List(NamedParameter("2", "2"))
  val namedParams = np1 ::: np2

  "or" should {
    "Join two statement parts with an or" in {
      StatementPart("a", np1) or StatementPart("b", np2) mustBe StatementPart("a OR b", namedParams)
    }
  }

  "and" should {
    "Join two statement parts with an and" in {
      StatementPart("a", np1) and StatementPart("b", np2) mustBe StatementPart("a AND b", namedParams)
    }
  }

  "isEmpty" should {
    "return true if the sql is empty" in {
      StatementPart("", np1) mustBe 'empty
    }

    "return false if the sql is not empty" in {
      StatementPart("1", np2) must not be 'empty
    }
  }

  "editSql" should {
    "run a function on the sql" in {
      val f: String => String = x => "edited " + x
      StatementPart("a", np1).editSql(f) mustBe StatementPart("edited a", np1)
    }
  }

  "addition (+/)" should {
    "Add strings to sql" in {
      StatementPart("a", np1) +/ "bacon" mustBe StatementPart("abacon", np1)
    }

    "Add two statement parts" in {
      StatementPart("a", np1) +/ StatementPart("b", np2) mustBe StatementPart("ab", namedParams)
    }

    "Use implicits to convert strings to statement parts" in {
      "b" +/ StatementPart("a", np1) mustBe StatementPart("ba", np1)
    }
  }

  "parenthesize" should {
    "Add parenthesis to a statement" in {
      StatementPart("a", np1).parenthesize mustBe StatementPart("(a)", np1)
    }
  }

  "fromValue" should {
    "Create a statement part with a guid named parameter" in {
      inside(StatementPart.fromValue("value")) {
        case StatementPart(sql, params) =>
          sql must include regex """\{a[\w]+\}"""
          params.head.value.toString mustBe "ParameterValue(value)"
      }
    }
  }

}
