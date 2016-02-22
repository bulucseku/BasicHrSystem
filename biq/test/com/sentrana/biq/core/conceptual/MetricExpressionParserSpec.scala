package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.DataType
import com.sentrana.biq.UnitSpec

/**
 * Created by william.hogben on 3/11/2015.
 */
class MetricExpressionParserSpec extends UnitSpec {
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

  val metadata = Metadata.fromXml(metaXml).success.value
  metadata.getAttributeForm("FiscalMonthId").get.setAttributeElements(
    List(AttributeElement("FiscalMonthId:12", "12"))
  )

  val parser = MetricExpressionParser.default(metadata)

  "MetricExpressionParse.tryParse" should {
    "Parse a filtered metric expression" in {
      val expression = "Sales((7)):if((FiscalMonthId=[12]),Sales),dataType:CURRENCY,precision:0,formulaType:CM"
      val metric = parser.tryParse(expression, metadata)
      inside(metric) {
        case Some(FilteredMetric(id, name, desc, base, filters, data, format)) =>
          id mustBe "Sales((7)):if((FiscalMonthId=[12]),Sales),dataType:CURRENCY,precision:0,formulaType:CM"
          name mustBe "Sales((7))"
          desc mustBe None
          base mustBe metadata.getReportUnit("Sales").get
          filters mustBe Array(metadata.getFilterUnit("FiscalMonthId:12").get)
          data mustBe DataType.CURRENCY
          format mustBe Some("C0")
      }
    }
  }

}
