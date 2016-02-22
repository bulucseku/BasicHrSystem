package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.utils.XmlUtils._
import com.sentrana.biq.core.FromXmlSpec

/**
 * Created by william.hogben on 2/2/2015.
 */
class MetadataSpec extends FromXmlSpec {
  val metaXml = {
    <metadata>
      <dimensions>
        <dimension name="Time">
          <attribute id="FiscalMonth" name="Fiscal Month" desc="The fiscal month" attrValueType="TimeSeries">
            <forms>
              <attributeForm id="FiscalMonthId" name="Id" dataType="Number" default="true"/>
            </forms>
            <groupsBy>
            </groupsBy>
          </attribute>
        </dimension>
      </dimensions>
      <facts>
        <fact id="Sales" name="Sales" />
        <fact id="CaseCount" name="Case Count" />
      </facts>
      <metrics>
        <simpleMetrics>
          <simpleMetric id="Sales" name="Sales" desc="Net sales" dataType="Currency" operation="Sum" formatString="C0">
            <fact id="Sales" />
          </simpleMetric>
          <simpleMetric id="CaseCount" name="Case Count" desc="Net sales" dataType="Number" operation="Sum" formatString="N0">
            <fact id="CaseCount" />
          </simpleMetric>
        </simpleMetrics>
        <compositeMetrics>
          <perMetric id="SalesPerCase" name="Sales Per Case" desc="Average net sales per case sold" dataType="Currency" formatString="C2">
            <metric id="Sales" />
            <metric id="CaseCount" />
          </perMetric>
        </compositeMetrics>
      </metrics>
      <constraints>
        <pertinence>
          <fact id="Sales"/>
          <requiredElements>
            <attributeForm id="FiscalMonthId">
              <attributeElement value="value" />
            </attributeForm>
          </requiredElements>
        </pertinence>
      </constraints>
      <metricGroups>
        <metricGroup id="Sales" name="SalesMetric">
          <metric id="Sales" />
        </metricGroup>
      </metricGroups>
    </metadata>
  }

  val meta = Metadata.fromXml(metaXml).success.value

  "Metadata.fromXml" should {

    implicit def toXml = Metadata.fromXml _
    "Parse correctly with all optional fields" in {
      inside(meta) {
        case Metadata(dimensions, facts, metrics, metricGroups) =>
          inside(dimensions) {
            case List(dimension) =>
              dimension.id mustBe "Time"
          }
          inside(facts) {
            case List(fact, fact2) =>
              fact.id mustBe "Sales"
              inside(fact.constraints) {
                case List(attributeElement) =>
                  inside(attributeElement) {
                    case AttributeElementConstraint(attrId, attrElementIds) =>
                      attrId mustBe "FiscalMonthId"
                      attrElementIds mustBe List("value")
                  }
              }
          }
          inside(metrics) {
            case List(simpleMetric1, simpleMetric2, compositeMetric) =>
              simpleMetric1.id mustBe "Sales"
              simpleMetric2.id mustBe "CaseCount"
              compositeMetric.id mustBe "SalesPerCase"
          }
          inside(metricGroups) {
            case List(sales, others) =>
              sales.name mustBe "SalesMetric"
              others.name mustBe "Others"
          }
      }
    }

    "Fail if constraint points to non existent constrainable object" in {
      failWithoutElem("facts", metaXml)
    }

    "Succeed without facts and constraints" in {
      val withoutConstraints = metaXml.removeAttr("constraints").head
      succeedWithoutAttr[Metadata]("facts", withoutConstraints, (a, b) => b == a.copy(facts = Nil))
    }

    "Succeed without metric groups" in {
      succeedWithoutAttr[Metadata]("metricGroups", metaXml, (a, b) => b == a.copy(facts = Nil))
    }

    "Succeed without dimensions" in {
      succeedWithoutAttr[Metadata]("dimensions", metaXml, (a, b) => b == a.copy(facts = Nil))
    }
  }
}
