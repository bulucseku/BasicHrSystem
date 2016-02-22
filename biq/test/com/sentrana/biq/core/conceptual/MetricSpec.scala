package com.sentrana.biq.core.conceptual

import org.scalatest.DoNotDiscover
import org.scalatestplus.play.ConfiguredApp

import com.sentrana.appshell.data.{ DataType, FormulaType }
import com.sentrana.appshell.metadata._
import com.sentrana.biq.core.FromXmlSpec
import com.sentrana.biq.metadata.MetadataRepository

/**
 * Created by william.hogben on 2/12/2015.
 */
@DoNotDiscover
class MetricSpec extends FromXmlSpec with ConfiguredApp {

  val metricXml = {
    <simpleMetric id="Sales" name="Sales" desc="Net sales" dataType="Currency" operation="Sum" formatString="C0">
      <fact id="Sales" />
    </simpleMetric>
    <simpleMetric id="GrossProfit" name="GP" desc="Gross profit" dataType="Currency" operation="Sum" formatString="C0">
      <fact id="GrossProfit" />
    </simpleMetric>
    <simpleMetric id="CostOfGoodsSold" name="COGS" desc="Cost of goods sold" dataType="Currency" operation="Sum" formatString="C0">
      <fact id="CostOfGoodsSold" />
    </simpleMetric>
    <simpleMetric id="CaseCount" name="Cases" desc="Number of cases (or case equivalent) sold" dataType="Number" operation="Sum" formatString="N0">
      <fact id="CaseCount" />
    </simpleMetric>
  }

  val factXml = {
    <fact id="Sales" name="Sales" />
    <fact id="GrossProfit" name="GP" />
    <fact id="CostOfGoodsSold" name="COGS" />
    <fact id="CaseCount" name="Case Count" />
    <fact id="SalesPerCase" name="Sales Per Case" />
    <fact id="GpPerCase" name="GP Per Case" />
    <fact id="GpMargin" name="GP Margin" />
  }

  "CompositeMetricSPec.fromXml" should {
    "parse a per metric correctly" in {
      val facts = parseSeq(factXml)(Fact.fromXml).success.value
      val simpleMetrics = parseSeq(metricXml)(SimpleMetric.fromXml(facts)).success.value
      val perMetricXml = {
        <perMetric id="SalesPerCase" name="Sales Per Case" desc="Description" dataType="Currency" formatString="C2">
          <metric id="Sales" />
          <metric id="CaseCount" />
        </perMetric>
      }
      val metric = CompositeMetric.fromXml(simpleMetrics)(perMetricXml).success.value
      inside(metric) {
        case per: PerMetric =>
          per.numerator mustBe simpleMetrics.find(_.id == "Sales").get
          per.denominator mustBe simpleMetrics.find(_.id == "CaseCount").get
          per.id mustBe "SalesPerCase"
          per.name mustBe "Sales Per Case"
          per.description mustBe Some("Description")
          per.dataType mustBe DataType.CURRENCY
      }

    }

    "parse a perCent metric correctly" in {
      val facts = parseSeq(factXml)(Fact.fromXml).success.value
      val simpleMetrics = parseSeq(metricXml)(SimpleMetric.fromXml(facts)).success.value
      val perMetricXml = {
        <percentTotalMetric id="SalesPerCase" name="Sales Per Case" desc="sales" dataType="Currency" formatString="C2">
          <metric id="Sales" />
        </percentTotalMetric>
      }
      val metric = CompositeMetric.fromXml(simpleMetrics)(perMetricXml).success.value
      inside(metric) {
        case PercentTotalMetric(id, name, description, baseMetric, dataType, formatString) =>
          id mustBe "SalesPerCase"
          name mustBe "Sales Per Case"
          description mustBe Some("sales")
          baseMetric mustBe simpleMetrics.find(_.id == "Sales").get
          dataType mustBe DataType.CURRENCY
      }
    }
  }

  lazy val repository = MetadataRepository().metadata("MMIB")
  lazy val metaDataMap = repository.metaData.metrics.map(m => m.id -> m).toMap
  def getMetric(id: String): Metric = metaDataMap.getOrElse(id, throw new Exception(
    "Failed to find existing metric with id: " + id
  ))

  "ConstantMetric.MetricPatter.tryParse" should {
    "parse a constant metric string with a valid number format" in {
      val parser = new ConstantMetric.MetricPattern()
      val constantMetric = parser.tryParse("11048e7", getMetric).get
      inside(constantMetric) {
        case ConstantMetric(id, name, desc, datatype, formatString) =>
          id mustBe "11048e7"
          name mustBe "11048e7"
          desc mustBe None
          datatype mustBe DataType.NUMBER
          formatString mustBe Some("11048e7")
      }
    }

    "Fail to parse a constant metric with a word based string" in {
      val parser = new ConstantMetric.MetricPattern()
      val constantMetric = parser.tryParse("bacon", getMetric)
      constantMetric must be ('Empty)
    }
  }

  "BinaryOperationMetric.MetricPattern.tryParse" should {
    val parser = new BinaryOperationMetric.MetricPattern()
    "Parse a valid binaryMetric string successfully" in {
      val binString = "Sales / GrossProfit"
      val metric = parser.tryParse(binString, getMetric)
      inside(metric.get) {
        case BinaryOperationMetric(id, name, desc, op, left, right, dataType, formatString) =>
          id mustBe "Sales/GrossProfit"
          name mustBe "Sales/GP"
          desc mustBe None
          op mustBe BinaryOperation.Division
          left mustBe getMetric("Sales")
          right mustBe getMetric("GrossProfit")
          dataType mustBe DataType.CURRENCY
          formatString mustBe Some("C0")
      }
    }

    "Fail to parse an invalid binary operation string" in {
      parser.tryParse("batman", getMetric) must be ('Empty)
    }
  }

  "PercentTotalMetric.MetricPattern.tryParse" should {
    val parser = new PercentTotalMetric.MetricPattern()
    "Correctly parse a valid percent metric string" in {
      val perString = "%Sales"
      val metric = parser.tryParse(perString, getMetric)
      inside(metric.get) {
        case PercentTotalMetric(id, name, desc, base, dataType, formatString) =>
          id mustBe "PercentSales"
          name mustBe "(Percent Sales)"
          desc must be ('Empty)
          base mustBe getMetric("Sales")
          dataType mustBe DataType.CURRENCY
          formatString mustBe Some("C0")
      }
    }

    "Fail to parse an invalid metric string" in {
      parser.tryParse("Sales%", getMetric) must be ('Empty)
    }
  }

  "FilteredMetric.MetricPatter.tryParse" should {
    lazy val parser = new FilteredMetric.MetricPattern(repository.metaData)
    "Correctly parse a valid filtered metric string using the @ pattern" in {
      // for this test we need to load in some attribute elements
      repository.dataWarehouse.queryForElements(
        repository.metaData.getAttributeForm("FiscalQuarterId").get
      )
      // sales when we are in the 1st quarter
      val filMetric = "(Sales@FiscalQuarterId:1)"
      val metric = parser.tryParse(filMetric, getMetric)
      inside (metric.get) {
        case FilteredMetric(id, name, desc, base, filters, dataType, format) =>
          id mustBe "(Sales@FiscalQuarterId:1)"
          name mustBe "Sales (1)"
          desc must be ('empty)
          base mustBe getMetric("Sales")
          filters.toList mustBe List(repository.metaData.getAttributeElement("FiscalQuarterId:1").get)
          dataType mustBe DataType.CURRENCY
          format mustBe Some("C0")
      }
    }

    "Correctly parse a valid if statement metric string" in {
      val filMetric = "filtered:if(FiscalQuarterId=1,Sales),dataType:Currency,precision:2,formulaType:CM"
      val metric = parser.tryParse(filMetric, getMetric)
      inside (metric.get) {
        case FilteredMetric(id, name, desc, base, filters, dataType, format) =>
          id mustBe "filtered:if(FiscalQuarterId=1,Sales),dataType:Currency,precision:2,formulaType:CM"
          name mustBe "filtered"
          desc must be ('empty)
          base mustBe getMetric("Sales")
          filters.toList mustBe List(repository.metaData.getAttributeElement("FiscalQuarterId:1").get)
          dataType mustBe DataType.CURRENCY
          format mustBe Some("C0")
      }
    }

    "Fail to parse an invalid metric string" in {
      parser.tryParse("if(asdhf = 2134) then cheese", getMetric) must be ('Empty)
    }
  }

  "AggregateMetric.MetricPatter.tryParse" should {
    val parser = new AggregateMetric.MetricPattern()
    "Correctly parser a valid aggregate metric string" in {
      val aggString = "Sum(Sales)"
      val metric = parser.tryParse(aggString, getMetric)
      inside(metric.get) {
        case AggregateMetric(id, name, desc, base, data, format) =>
          id mustBe "Sum(Sales)"
          name mustBe "Sales(Sum)"
          desc must be ('empty)
          val sales = getMetric("Sales")
          inside(base) {
            case SimpleMetric(id, name, desc, fact, op, format, dataType) =>
              id mustBe sales.id
              name mustBe sales.name
              desc mustBe sales.description
              fact mustBe sales.asInstanceOf[SimpleMetric].fact
              op mustBe AggregationOperation.Sum
              format mustBe sales.formatString
              dataType mustBe sales.dataType
          }
          data mustBe sales.dataType
          format mustBe sales.formatString
      }
    }

    "Fail to parse an invalid metric string" in {
      parser.tryParse("Bacon(Sales)", getMetric) must be ('Empty)
    }
  }

  "DerivedMetric.MetricPattern.tryParse" should {
    lazy val parser = new DerivedMetric.MetricPattern(repository.metaData)
    "Correctly parse a binary operation" in {
      val filMetric = "test:[GrossProfit]*[Sales],dataType:Currency,precision:2"
      val metric = parser.tryParse(filMetric, getMetric)
      inside(metric) {
        case Some(DerivedMetric(id, name, desc, data, format, formula, binMetric)) =>
          id mustBe "test:[GrossProfit]*[Sales],dataType:Currency,precision:2"
          name mustBe "test"
          desc mustBe Some("test:[GrossProfit] * [Sales],dataType:Currency,precision:2")
          data mustBe DataType.CURRENCY
          formula mustBe FormulaType.DM
          format mustBe Some("C2")
          inside(binMetric) {
            case Some(BinaryOperationMetric(id, name, desc, op, left, right, data, format)) =>
              id mustBe "GrossProfit*Sales"
              name mustBe "(GP * Sales)"
              desc mustBe Some("[GrossProfit] * [Sales]")
              op mustBe BinaryOperation.Multiplication
              left mustBe metaDataMap("GrossProfit")
              right mustBe metaDataMap("Sales")
              data mustBe DataType.CURRENCY
              format mustBe Some("C0")
          }
      }
    }

    "Correctly parse an if statement" in {
      repository.loadAttributeElements(repository.metaData.getAttributeForm("FiscalYear").get)
      val filMetric = "test:if([FiscalYear]=2012, [GrossProfit]),dataType:Currency,precision:2"
      val metric = parser.tryParse(filMetric, getMetric)
      inside(metric) {
        case Some(DerivedMetric(id, name, desc, data, format, formula, binMetric)) =>
          id mustBe "test:if([FiscalYear]=2012, [GrossProfit]),dataType:Currency,precision:2"
          name mustBe "test"
          desc mustBe Some("test:,dataType:Currency,precision:2")
          data mustBe DataType.CURRENCY
          formula mustBe FormulaType.DM
          format mustBe Some("C2")
          inside(binMetric) {
            case Some(FilteredMetric(id, name, desc, base, filters, data, format)) =>
              id mustBe "(GrossProfit@FiscalYear:2012)"
              name mustBe "GP (2012)"
              desc mustBe None
              base mustBe metaDataMap("GrossProfit")
              filters mustBe Array(repository.metaData.getFilterUnit("FiscalYear:2012").get)
              data mustBe DataType.CURRENCY
              format mustBe Some("C0")
          }
      }
    }

    "Correctly parse an if with or clauses statement" in {
      repository.loadAttributeElements(repository.metaData.getAttributeForm("AccountType").get)
      val filMetric = "test:if([FiscalYear]=2012 or [AccountType]=CMU, [GrossProfit]),dataType:Currency,precision:2"
      val metric = parser.tryParse(filMetric, getMetric)
      inside(metric) {
        case Some(DerivedMetric(id, name, desc, data, format, formula, binMetric)) =>
          id mustBe "test:if([FiscalYear]=2012 or [AccountType]=CMU, [GrossProfit]),dataType:Currency,precision:2"
          name mustBe "test"
          desc mustBe Some("test:,dataType:Currency,precision:2")
          data mustBe DataType.CURRENCY
          formula mustBe FormulaType.DM
          format mustBe Some("C2")
          inside(binMetric) {
            case Some(FilteredMetric(id, name, desc, base, filters, data, format)) =>
              id mustBe "(GrossProfit@FiscalYear:2012,AccountType:CMU)"
              name mustBe "GP (2012,CMU)"
              desc mustBe None
              base mustBe metaDataMap("GrossProfit")
              filters mustBe Array(
                repository.metaData.getFilterUnit("FiscalYear:2012").get,
                repository.metaData.getFilterUnit("AccountType:CMU").get
              )
              data mustBe DataType.CURRENCY
              format mustBe Some("C0")
          }
      }
    }
  }

}
