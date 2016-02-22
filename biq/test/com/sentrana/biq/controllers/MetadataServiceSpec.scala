package com.sentrana.biq.controllers

import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.Cookie
import play.api.test.FakeRequest
import play.api.test.Helpers._

import org.json4s.native.Serialization._
import org.scalatest.DoNotDiscover

import com.sentrana.appshell.Global.JsonFormat.formats
import com.sentrana.appshell.configuration.{ ConfigurationFile, ConfigurationGroup }
import com.sentrana.biq.BIQServiceSpec
import com.sentrana.biq.core.conceptual.AggregationOperation
import com.sentrana.biq.datacontract._
import com.sentrana.biq.metadata.{ MetadataCache, MetadataRepository }
import com.sentrana.usermanagement.domain.document.{ DataFilterInstance, UMDataServices }

/**
 * Created by william.hogben on 2/4/2015.
 */
@DoNotDiscover
class MetadataServiceSpec extends BIQServiceSpec {

  var sessionId = ""
  "login" in {
    val userInfo: JsValue = Json.parse("""{"userName": "sentrana", "password": "monday1"}""")
    val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
    sessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
  }

  "The getXmlRepositoryObject service" should {
    "return the repository objects" in {
      val response = route(FakeRequest(
        GET, s"$applicationContext/SqlGen.svc/Repository/farmland"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))).get
      status(response)(120000) mustBe OK
      inside(read[MetadataObjectRepository](contentAsString(response))) {
        case MetadataObjectRepository(name, oid, showDataDic, supportedFeatures, metricGroups, dimensions, derivedColumns, savedFilterGroups, datafilters, totalReport, totalBooklet, aggregateFunctions, metricDimensionMapping) =>
          name mustBe "Farmland"
          oid mustBe "farmland"
          showDataDic mustBe false
          supportedFeatures mustBe MetadataObjectRepositorySupportedFeatures(totals = true)
          inside(dimensions) {
            case List(dim1, dim2, dim3, dim4, dim5, dim6) =>
              dim1.name mustBe "Time Dimension"
              dim2.name mustBe "Customer"
              dim3.name mustBe "Product Attributes"
              dim4.name mustBe "Vendor"
              dim5.name mustBe "Sales Attributes"
              dim6.name mustBe "Claims Attributes"
          }
          derivedColumns mustBe Nil
          datafilters mustBe Nil
          metricDimensionMapping mustBe Nil
          totalReport mustBe 0
          totalBooklet mustBe 0
          aggregateFunctions mustBe List(
            AggregationOperation("Min", "Min"),
            AggregationOperation("Max", "Max"),
            AggregationOperation("Sum", "Sum"),
            AggregationOperation("Count", "Count"),
            AggregationOperation("StdDev", "StdDev"),
            AggregationOperation("Average", "Avg")
          )
          inside(metricGroups) {
            case List(metricGroup1, metricGroup2, metricGroup3) =>
              metricGroup1.id mustBe "SalesMetrics"
              metricGroup2.id mustBe "ClaimsMetrics"
              metricGroup3.id mustBe "Others"
          }
      }
    }

    "Return a 401 response code if the user does not have access to the repo" in {
      val response = route(FakeRequest(
        GET, s"$applicationContext/SqlGen.svc/Repository/RichsProdR2"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))).get
      status(response) mustBe UNAUTHORIZED
    }
  }

  "The getAttributeForm Action" should {
    "Populate the attribute form" in {
      val response = route(FakeRequest(
        GET, s"$applicationContext/MetadataService.svc/AttributeForm/SyscoBrandInd?repositoryid=MMIB"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))).get
      status(response) mustBe OK
      inside(read[MetadataAttributeForm](contentAsString(response))) {
        case MetadataAttributeForm(name, oid, desc, dataType, elements) =>
          name mustBe "Y/N"
          oid mustBe "SyscoBrandInd"
          desc mustBe ""
          dataType mustBe Some("STRING")
          elements mustBe Some(List(MetadataObject("N", "SyscoBrandInd:N", None, None), MetadataObject("Y", "SyscoBrandInd:Y", None, None)))
      }
    }
  }

  "the getClientNames method" should {
    "return repo list" in {
      val response = route(FakeRequest(
        GET, s"$applicationContext/MetadataService.svc/GetRepoList"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))).get
      status(response) mustBe OK
      val repoList = read[List[ConfigurationGroup]](contentAsString(response))
      repoList.size mustBe 2
      inside(repoList(0)) {
        case ConfigurationGroup(repoId, _, _, _) =>
          repoId mustBe "MMIB"
      }
    }

    "only return repositories the user has permssion to access" in {
      val dataFilter = DataFilterInstance(
        "testId", "20", "<>", "MMIB", None
      )
      val org = UMDataServices.getOrganization("1").get
      val user = org.users.find(_.id == "1").get.copy(dataFilterInstances = Seq(dataFilter))
      UMDataServices.updateOrganization(org.copy(users = Seq(user)))
      val response = route(FakeRequest(
        GET, s"$applicationContext/MetadataService.svc/GetRepoList"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))).get
      status(response) mustBe OK
      val repoList = read[List[ConfigurationGroup]](contentAsString(response))
      repoList.size mustBe 1
      inside(repoList.head) {
        case ConfigurationGroup(repoId, _, _, _) =>
          repoId mustBe "farmland"
      }
      UMDataServices.updateOrganization(org)
    }
  }

  "the readConfigFiles method" should {
    "return repo for client MMIB" in {
      val response = route(FakeRequest(
        GET, s"$applicationContext/MetadataService.svc/ReadConfigFiles?repoId=MMIB"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))).get
      status(response) mustBe OK
      val repo = read[Seq[ConfigurationFile]](contentAsString(response))
      inside(repo) {
        case Seq(ConfigurationFile(id, _, _, _, _, _, _), ConfigurationFile(id2, _, _, _, _, _, _)) =>
          id mustBe "repository"
          id2 mustBe "datafilter"
      }
    }

    "Fail for a regular user" in {
      val userInfo: JsValue = Json.parse("""{"userName": "biq", "password": "monday1"}""")
      val loginResult = route(FakeRequest(POST, s"$applicationContext/SecurityService.svc/login"), userInfo).get
      val normalUserSessionId = cookies(loginResult)(timeout = 60000).get("sessionId").get.value
      val response = route(FakeRequest(
        GET, s"$applicationContext/MetadataService.svc/ReadConfigFiles?repoId=MMIB"
      ).withHeaders("sessionId" -> normalUserSessionId).withCookies(Cookie("sessionId", normalUserSessionId))).get
      status(response) mustBe UNAUTHORIZED
    }
  }

  "the clearMetadataCache action" should {
    "Remove the repository from the cache" in {
      val repo = MetadataRepository().metadata("farmland")
      val form = repo.metaData.attributeForms.head
      repo.loadAttributeElements(form)
      MetadataCache().existsInCache(form.id, repo.id) mustBe true
      val response = route(FakeRequest(
        DELETE, s"$applicationContext/MetadataService.svc/MetadataCache/farmland"
      ).withHeaders("sessionId" -> sessionId).withCookies(Cookie("sessionId", sessionId))).get
      status(response) mustBe OK
      MetadataCache().existsInCache(form.id, "farmland") mustBe false
    }
  }
}
