package com.sentrana.biq.core.physical

import com.sentrana.appshell.data.AttrValueType
import com.sentrana.appshell.data.DataType._
import com.sentrana.biq.core.FromXmlSpec
import com.sentrana.biq.core.conceptual._

/**
 * Created by william.hogben on 1/27/2015.
 */
class TableSpec extends FromXmlSpec {
  val attributeForm = new AttributeForm("Brand", Some("description"), "shortName", true, true, true, Some("default"), Some("formatString"), STRING)
  val segment = new Segment("1", attributeForm, STRING)
  val attributeElement = new AttributeElement("id", "value", Nil, None)
  attributeElement.addTo(attributeForm)
  val segmentValue = new SegmentValue(segment.databaseId, attributeElement)
  val attribute = Attribute("id", "name", Some("desc"), None, true, AttrValueType.NA, true, "", None, Nil, List(attributeForm), Nil, Nil)
  val fact = new Fact("factId", "name", Some("desc"))
  val metadata = Metadata(List(new Dimension("", "", None, attribute)), List(fact), Nil, Nil)
  val xml = <table id="tableId" databaseId="dbId">
    <columns>
      <datum databaseId="column1">
        <fact id="factId"></fact>
      </datum>
      <segment databaseId="brand_id">
        <attributeForm id="Brand" />
      </segment>
    </columns>
    <joins>
      <join operator="Inner">
        <condition>
          <comparison operator="Equals">
            <column databaseId="column1" />
            <column databaseId="col2" />
          </comparison>
        </condition>
        <table id="t2Id" databaseId="t2DbId">
          <columns></columns>
          <joins>
            <join operator="Left">
              <condition>
              </condition>
              <table id="t3Id" databaseId="t3DbId">
                <columns></columns>
                <joins></joins>
              </table>
            </join>
          </joins>
        </table>
      </join>
    </joins>
    <rootFilter>
      <comparison operator="Equals">
        <column databaseId="column1" />
        <literal value="14" />
      </comparison>
    </rootFilter>
  </table>

  "Table.fromXml" should {

    implicit def fromXml = Table.fromXml(metadata) _
    "Parse the xml correctly" in {
      val table = fromXml(xml)
      inside(table.success.value) {
        case Table(databaseId, id, joins, columns, rootFilter) =>
          databaseId mustBe "dbId"
          id mustBe "tableId"
          joins.toSeq must have length 1
          inside(joins.toSeq(0)) {
            case Join(joinTable, operator, comparisons) =>
              operator mustBe "Inner"
              comparisons.toList must have length 1
              inside(comparisons.toList(0)) {
                case Comparison(operator, leftValue, rightValue) =>
                  operator mustBe "Equals"
                  leftValue mustBe ComparisonColumn("column1")
                  rightValue mustBe ComparisonColumn("col2")
              }
              inside(joinTable) {
                case Table(databaseId, id, joins, columns, rootFilter) =>
                  databaseId mustBe "t2DbId"
                  id mustBe "t2Id"
              }
          }
          columns.toList must have length 2
          inside(columns.toList(0)) {
            case Datum(databaseId, fact, dataType) =>
              databaseId mustBe "column1"
              inside(fact) {
                case Fact(id, name, description) =>
                  id mustBe "factId"
                  name mustBe "name"
              }
          }
          inside(columns.toList(1)) {
            case Segment(databaseId, af, dataType) =>
              databaseId mustBe "brand_id"
              af mustBe attributeForm
          }
          inside(rootFilter.get) {
            case Comparison(operator, leftValue, rightValue) =>
              operator mustBe "Equals"
              leftValue mustBe ComparisonColumn("column1")
              rightValue mustBe ComparisonLiteral("14")
          }
      }
    }

    "Fail without databaseId" in {
      failWithoutAttr("databaseId", xml)
    }

    "Fail without id" in {
      failWithoutAttr("id", xml)
    }

    "Succeed without joins" in {
      succeedWithoutElem[Table]("joins", xml, (a, b) => b == a.copy(joins = Nil))
    }

    "Succeed without rootFilter" in {
      succeedWithoutElem[Table]("rootFilter", xml, (a, b) => b == a.copy(rootFilter = None))
    }
  }

  val table = Table.fromXml(metadata)(xml)

  "Table.allchildTables should return all child tables" in {
    val tables = table.success.value.allChildTables
    tables.toSeq must have length 2
    tables.toList(0).id mustBe "t2Id"
    tables.toList(1).id mustBe "t3Id"
  }

  "Test Immediate Children" in {
    val children = table.get.immediateChildren
    children.toList(0).databaseId mustBe "column1"
    children.toList(1).databaseId mustBe "brand_id"
    children.toList(2).databaseId mustBe "t2DbId"
  }

  "Test Root Filter Statement" in {
    table.get.rootFilterStatement.get.sql must include regex """tableId\.column1 = \(\{a[\w]+\}\)"""
  }

}
