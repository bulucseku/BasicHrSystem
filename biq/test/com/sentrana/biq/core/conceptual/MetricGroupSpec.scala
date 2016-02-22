package com.sentrana.biq.core.conceptual

import com.sentrana.appshell.data.DataType
import com.sentrana.biq.core.FromXmlSpec

/**
 * Created by william.hogben on 2/2/2015.
 */
class MetricGroupSpec extends FromXmlSpec {
  val fact = new Fact("id", "name", Some("desc"))
  val metric = new SimpleMetric("id", "name", Some("metric desc"), fact, AggregationOperation.Sum, None, DataType.NUMBER)
  val metrics = List(metric, metric.copy(id = "bacon"), metric.copy(id = "id2"))
  val metricGroupXml = {
    <metricGroup id="metricId" name="TestMetric">
      <metric id="id" />
      <metric id="id2" />
    </metricGroup>
  }

  "MetricGroup.fromXml" should {

    implicit def fromXml = MetricGroup.fromXml(metrics) _
    "Successfully parse a xml node with all optional params" in {
      val metricGroup = fromXml(metricGroupXml).success.value
      inside(metricGroup) {
        case MetricGroup(id, name, description, metricsList) =>
          id mustBe "metricId"
          name mustBe "TestMetric"
          description mustBe Some("TestMetric")
          metricsList mustBe List(metric, metric.copy(id = "id2"))
      }
    }

    "Successfully parse a metric group with no metric element" in {
      succeedWithoutElem[MetricGroup]("metric", metricGroupXml, (a, b) => b == a.copy(metrics = Nil))
    }

    "Fail to parse a node without an id attribute" in {
      failWithoutAttr("id", metricGroupXml)
    }

    "Fail to parse a node without a name attribute" in {
      failWithoutAttr("name", metricGroupXml)
    }

    val metricGroupXmlBad = {
      <metricGroup id="metricId" name="TestMetric">
        <metric id="bad" />
      </metricGroup>
    }
    "Fail to parse a node with a bad metricId" in {
      val parsed = fromXml(metricGroupXmlBad)
      parsed must be a 'failure
    }
  }
}
