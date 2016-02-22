package com.sentrana.biq.core.physical

import com.sentrana.appshell.data.DataType
import com.sentrana.appshell.data.DataType._
import com.sentrana.biq.core.FromXmlSpec
import com.sentrana.biq.core.conceptual.{ Fact, Metadata }

/**
 * Created by william.hogben on 1/13/2015.
 */
class DatumSpec extends FromXmlSpec {
  val datumXml = <datum databaseId="delivery_ispu_ct"><fact id="id" /></datum>
  val fact = new Fact("id", "name", Some("description"))
  val metadata = new Metadata(Nil, List(fact), Nil, Nil)

  "Datum.fromXml" should {
    "Parse the data correctly" in {
      val parsed = Datum.fromXml(metadata, datumXml)
      inside(parsed.get) {
        case Datum(databaseId, fact1, dataType) =>
          databaseId mustBe "delivery_ispu_ct"
          inside(fact1) {
            case Fact(id, name, description) =>
              id mustBe "id"
              name mustBe "name"
          }
          dataType mustBe DataType.NUMBER
      }
    }
  }

  "Datum.formatLiteral" should {
    "return NULL with  None Value" in {
      val datum = new Datum("1", fact, NUMBER)
      datum.formatLiteral(None) mustBe "NULL"
    }

    "Return the literal when present" in {
      val datum = new Datum("1", fact, NUMBER)
      datum.formatLiteral(Some("5")) mustBe "5"
    }
  }
}
