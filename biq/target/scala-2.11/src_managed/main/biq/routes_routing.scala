// @SOURCE:D:/git/biq/conf/biq.routes
// @HASH:e63a8c9b4f28d5377ee092a4bf2eea4d3d5f050c
// @DATE:Wed Feb 17 14:21:05 BDT 2016
package biq

import scala.language.reflectiveCalls
import play.core._
import play.core.Router._
import play.core.Router.HandlerInvokerFactory._
import play.core.j._

import play.api.mvc._
import _root_.controllers.Assets.Asset

import Router.queryString

object Routes extends Router.Routes {

import ReverseRouteContext.empty

private var _prefix = "/"

def setPrefix(prefix: String): Unit = {
  _prefix = prefix
  List[(String,Routes)]().foreach {
    case (p, router) => router.setPrefix(prefix + (if(prefix.endsWith("/")) "" else "/") + p)
  }
}

def prefix = _prefix

lazy val defaultPrefix = { if(Routes.prefix.endsWith("/")) "" else "/" }


// @LINE:11
private[this] lazy val controllers_Assets_at0_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("public/"),DynamicPart("file", """.+""",false))))
private[this] lazy val controllers_Assets_at0_invoker = createInvoker(
controllers.Assets.at(fakeValue[String], fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "controllers.Assets", "at", Seq(classOf[String], classOf[String]),"GET", """ Map static resources from the /public folder to the /public URL path""", Routes.prefix + """public/$file<.+>"""))
        

// @LINE:14
private[this] lazy val com_sentrana_biq_controllers_SecurityService_login1_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SecurityService.svc/login"))))
private[this] lazy val com_sentrana_biq_controllers_SecurityService_login1_invoker = createInvoker(
com.sentrana.biq.controllers.SecurityService.login,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SecurityService", "login", Nil,"POST", """ Security Services Replaced by modular user management""", Routes.prefix + """SecurityService.svc/login"""))
        

// @LINE:15
private[this] lazy val com_sentrana_biq_controllers_SecurityService_logout2_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SecurityService.svc/logout"))))
private[this] lazy val com_sentrana_biq_controllers_SecurityService_logout2_invoker = createInvoker(
com.sentrana.biq.controllers.SecurityService.logout,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SecurityService", "logout", Nil,"GET", """""", Routes.prefix + """SecurityService.svc/logout"""))
        

// @LINE:16
private[this] lazy val com_sentrana_biq_controllers_SecurityService_checkLogin3_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ValidateSession"))))
private[this] lazy val com_sentrana_biq_controllers_SecurityService_checkLogin3_invoker = createInvoker(
com.sentrana.biq.controllers.SecurityService.checkLogin,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SecurityService", "checkLogin", Nil,"GET", """""", Routes.prefix + """SqlGen.svc/ValidateSession"""))
        

// @LINE:17
private[this] lazy val com_sentrana_biq_controllers_SecurityService_changePassword4_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SecurityService.svc/ChangePassword"))))
private[this] lazy val com_sentrana_biq_controllers_SecurityService_changePassword4_invoker = createInvoker(
com.sentrana.biq.controllers.SecurityService.changePassword,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SecurityService", "changePassword", Nil,"POST", """""", Routes.prefix + """SecurityService.svc/ChangePassword"""))
        

// @LINE:18
private[this] lazy val com_sentrana_biq_controllers_SecurityService_forgotPassword5_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SecurityService.svc/ForgotPassword"))))
private[this] lazy val com_sentrana_biq_controllers_SecurityService_forgotPassword5_invoker = createInvoker(
com.sentrana.biq.controllers.SecurityService.forgotPassword(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SecurityService", "forgotPassword", Seq(classOf[String]),"GET", """""", Routes.prefix + """SecurityService.svc/ForgotPassword"""))
        

// @LINE:19
private[this] lazy val com_sentrana_biq_controllers_SecurityService_forgotUsername6_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SecurityService.svc/ForgotUsername"))))
private[this] lazy val com_sentrana_biq_controllers_SecurityService_forgotUsername6_invoker = createInvoker(
com.sentrana.biq.controllers.SecurityService.forgotUsername(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SecurityService", "forgotUsername", Seq(classOf[String]),"GET", """""", Routes.prefix + """SecurityService.svc/ForgotUsername"""))
        

// @LINE:20
private[this] lazy val com_sentrana_biq_controllers_SecurityService_changeAutoGeneratedPassword7_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SecurityService.svc/ChangeAutoGeneratedPassword"))))
private[this] lazy val com_sentrana_biq_controllers_SecurityService_changeAutoGeneratedPassword7_invoker = createInvoker(
com.sentrana.biq.controllers.SecurityService.changeAutoGeneratedPassword,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SecurityService", "changeAutoGeneratedPassword", Nil,"POST", """""", Routes.prefix + """SecurityService.svc/ChangeAutoGeneratedPassword"""))
        

// @LINE:21
private[this] lazy val com_sentrana_biq_controllers_SecurityService_isValidToken8_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SecurityService.svc/IsValidToken"))))
private[this] lazy val com_sentrana_biq_controllers_SecurityService_isValidToken8_invoker = createInvoker(
com.sentrana.biq.controllers.SecurityService.isValidToken(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SecurityService", "isValidToken", Seq(classOf[String]),"GET", """""", Routes.prefix + """SecurityService.svc/IsValidToken"""))
        

// @LINE:24
private[this] lazy val com_sentrana_usermanagement_controllers_SalesforceService_renderApp9_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SalesforceService.svc/RenderApp/"),DynamicPart("orgId", """[^/]+""",true))))
private[this] lazy val com_sentrana_usermanagement_controllers_SalesforceService_renderApp9_invoker = createInvoker(
com.sentrana.usermanagement.controllers.SalesforceService.renderApp(fakeValue[String], fakeValue[Option[String]]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.usermanagement.controllers.SalesforceService", "renderApp", Seq(classOf[String], classOf[Option[String]]),"GET", """ Salesforce Integration""", Routes.prefix + """SalesforceService.svc/RenderApp/$orgId<[^/]+>"""))
        

// @LINE:25
private[this] lazy val com_sentrana_usermanagement_controllers_SalesforceService_salesforceCallback10_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SalesforceService.svc/SalesforceCallback/"),DynamicPart("orgId", """[^/]+""",true))))
private[this] lazy val com_sentrana_usermanagement_controllers_SalesforceService_salesforceCallback10_invoker = createInvoker(
com.sentrana.usermanagement.controllers.SalesforceService.salesforceCallback(fakeValue[String], fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.usermanagement.controllers.SalesforceService", "salesforceCallback", Seq(classOf[String], classOf[String]),"GET", """""", Routes.prefix + """SalesforceService.svc/SalesforceCallback/$orgId<[^/]+>"""))
        

// @LINE:28
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getXmlRepositoryObjects11_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Repository/"),DynamicPart("repoId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getXmlRepositoryObjects11_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.getXmlRepositoryObjects(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "getXmlRepositoryObjects", Seq(classOf[String]),"GET", """ Metadata Service""", Routes.prefix + """SqlGen.svc/Repository/$repoId<.+>"""))
        

// @LINE:29
private[this] lazy val com_sentrana_biq_controllers_MetadataService_readConfigFiles12_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/ReadConfigFiles"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_readConfigFiles12_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.readConfigFiles(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "readConfigFiles", Seq(classOf[String]),"GET", """""", Routes.prefix + """MetadataService.svc/ReadConfigFiles"""))
        

// @LINE:30
private[this] lazy val com_sentrana_biq_controllers_MetadataService_publishConfigChange13_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/PublishConfigChange"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_publishConfigChange13_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.publishConfigChange,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "publishConfigChange", Nil,"POST", """""", Routes.prefix + """MetadataService.svc/PublishConfigChange"""))
        

// @LINE:31
private[this] lazy val com_sentrana_biq_controllers_MetadataService_saveRepository14_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/SaveRepository"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_saveRepository14_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.saveRepository,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "saveRepository", Nil,"POST", """""", Routes.prefix + """MetadataService.svc/SaveRepository"""))
        

// @LINE:32
private[this] lazy val com_sentrana_biq_controllers_MetadataService_saveConfigFile15_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/SaveConfigFile"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_saveConfigFile15_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.saveConfigFile,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "saveConfigFile", Nil,"POST", """""", Routes.prefix + """MetadataService.svc/SaveConfigFile"""))
        

// @LINE:33
private[this] lazy val com_sentrana_biq_controllers_MetadataService_saveAllConfigFiles16_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/SaveAllConfigFiles"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_saveAllConfigFiles16_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.saveAllConfigFiles,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "saveAllConfigFiles", Nil,"POST", """""", Routes.prefix + """MetadataService.svc/SaveAllConfigFiles"""))
        

// @LINE:34
private[this] lazy val com_sentrana_biq_controllers_MetadataService_uploadConfigFiles17_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/UploadConfigFiles"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_uploadConfigFiles17_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.uploadConfigFiles,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "uploadConfigFiles", Nil,"POST", """""", Routes.prefix + """MetadataService.svc/UploadConfigFiles"""))
        

// @LINE:35
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getRepoList18_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/GetRepoList"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getRepoList18_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.getRepoList,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "getRepoList", Nil,"GET", """""", Routes.prefix + """MetadataService.svc/GetRepoList"""))
        

// @LINE:36
private[this] lazy val com_sentrana_biq_controllers_MetadataService_clearMetadataCache19_route = Route("DELETE", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/MetadataCache/"),DynamicPart("repoId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_clearMetadataCache19_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.clearMetadataCache(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "clearMetadataCache", Seq(classOf[String]),"DELETE", """""", Routes.prefix + """MetadataService.svc/MetadataCache/$repoId<[^/]+>"""))
        

// @LINE:37
private[this] lazy val com_sentrana_biq_controllers_MetadataService_downloadConfigFiles20_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/DownloadConfigurationFiles"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_downloadConfigFiles20_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.downloadConfigFiles(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "downloadConfigFiles", Seq(classOf[String]),"GET", """""", Routes.prefix + """MetadataService.svc/DownloadConfigurationFiles"""))
        

// @LINE:38
private[this] lazy val com_sentrana_biq_controllers_MetadataService_deleteRepository21_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/DeleteRepository"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_deleteRepository21_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.deleteRepository,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "deleteRepository", Nil,"POST", """""", Routes.prefix + """MetadataService.svc/DeleteRepository"""))
        

// @LINE:39
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getAttributeForm22_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/AttributeForm/"),DynamicPart("formId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getAttributeForm22_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.getAttributeForm(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "getAttributeForm", Seq(classOf[String]),"GET", """""", Routes.prefix + """MetadataService.svc/AttributeForm/$formId<[^/]+>"""))
        

// @LINE:40
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getRepoNameList23_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/getRepoNameList"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getRepoNameList23_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.getRepoNameList,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "getRepoNameList", Nil,"GET", """""", Routes.prefix + """MetadataService.svc/getRepoNameList"""))
        

// @LINE:41
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getRepo24_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/getRepo"))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getRepo24_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.getRepo(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "getRepo", Seq(classOf[String]),"GET", """""", Routes.prefix + """MetadataService.svc/getRepo"""))
        

// @LINE:42
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getRepositoryMetadata25_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("MetadataService.svc/RepositoryMetadata/"),DynamicPart("repoId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_MetadataService_getRepositoryMetadata25_invoker = createInvoker(
com.sentrana.biq.controllers.MetadataService.getRepositoryMetadata(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.MetadataService", "getRepositoryMetadata", Seq(classOf[String]),"GET", """""", Routes.prefix + """MetadataService.svc/RepositoryMetadata/$repoId<[^/]+>"""))
        

// @LINE:45
private[this] lazy val com_sentrana_biq_controllers_ReportingService_execute26_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Execute"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_execute26_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.execute,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "execute", Nil,"POST", """ Reporting Serivce""", Routes.prefix + """SqlGen.svc/Execute"""))
        

// @LINE:46
private[this] lazy val com_sentrana_biq_controllers_ReportingService_getDrillOptions27_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/GetDrillOptions"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_getDrillOptions27_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.getDrillOptions(fakeValue[String], fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "getDrillOptions", Seq(classOf[String], classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/GetDrillOptions"""))
        

// @LINE:47
private[this] lazy val com_sentrana_biq_controllers_ReportingService_dropCache28_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/DropCache"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_dropCache28_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.dropCache(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "dropCache", Seq(classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/DropCache"""))
        

// @LINE:48
private[this] lazy val com_sentrana_biq_controllers_ReportingService_dropCaches29_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/DropCaches"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_dropCaches29_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.dropCaches,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "dropCaches", Nil,"GET", """""", Routes.prefix + """SqlGen.svc/DropCaches"""))
        

// @LINE:49
private[this] lazy val com_sentrana_biq_controllers_ReportingService_dropCachesByRepository30_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/DropCachesByRepository"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_dropCachesByRepository30_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.dropCachesByRepository(fakeValue[String], fakeValue[String], fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "dropCachesByRepository", Seq(classOf[String], classOf[String], classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/DropCachesByRepository"""))
        

// @LINE:50
private[this] lazy val com_sentrana_biq_controllers_ReportingService_exportToCsv31_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ExportToCsv"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_exportToCsv31_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.exportToCsv,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "exportToCsv", Nil,"POST", """""", Routes.prefix + """SqlGen.svc/ExportToCsv"""))
        

// @LINE:51
private[this] lazy val com_sentrana_biq_controllers_ReportingService_exportChart32_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ExportChart"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_exportChart32_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.exportChart,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "exportChart", Nil,"POST", """""", Routes.prefix + """SqlGen.svc/ExportChart"""))
        

// @LINE:52
private[this] lazy val com_sentrana_biq_controllers_ReportingService_exportPivotTable33_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ExportPivotTable"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_exportPivotTable33_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.exportPivotTable,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "exportPivotTable", Nil,"POST", """""", Routes.prefix + """SqlGen.svc/ExportPivotTable"""))
        

// @LINE:53
private[this] lazy val com_sentrana_biq_controllers_ReportingService_getMatchingElementPaths34_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/GetMatchingElementPaths"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_getMatchingElementPaths34_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.getMatchingElementPaths(fakeValue[String], fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "getMatchingElementPaths", Seq(classOf[String], classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/GetMatchingElementPaths"""))
        

// @LINE:54
private[this] lazy val com_sentrana_biq_controllers_ReportingService_getChildElements35_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/GetChildElements"))))
private[this] lazy val com_sentrana_biq_controllers_ReportingService_getChildElements35_invoker = createInvoker(
com.sentrana.biq.controllers.ReportingService.getChildElements,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportingService", "getChildElements", Nil,"POST", """""", Routes.prefix + """SqlGen.svc/GetChildElements"""))
        

// @LINE:57
private[this] lazy val com_sentrana_biq_controllers_DerivedColumnService_validateFormula36_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ValidateFormula"))))
private[this] lazy val com_sentrana_biq_controllers_DerivedColumnService_validateFormula36_invoker = createInvoker(
com.sentrana.biq.controllers.DerivedColumnService.validateFormula,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.DerivedColumnService", "validateFormula", Nil,"POST", """ Derived Column Service""", Routes.prefix + """SqlGen.svc/ValidateFormula"""))
        

// @LINE:58
private[this] lazy val com_sentrana_biq_controllers_DerivedColumnService_addDerivedColumn37_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/DerivedColumn"))))
private[this] lazy val com_sentrana_biq_controllers_DerivedColumnService_addDerivedColumn37_invoker = createInvoker(
com.sentrana.biq.controllers.DerivedColumnService.addDerivedColumn,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.DerivedColumnService", "addDerivedColumn", Nil,"POST", """""", Routes.prefix + """SqlGen.svc/DerivedColumn"""))
        

// @LINE:59
private[this] lazy val com_sentrana_biq_controllers_DerivedColumnService_deleteDerivedColumn38_route = Route("DELETE", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/DerivedColumn/"),DynamicPart("columnId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_DerivedColumnService_deleteDerivedColumn38_invoker = createInvoker(
com.sentrana.biq.controllers.DerivedColumnService.deleteDerivedColumn(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.DerivedColumnService", "deleteDerivedColumn", Seq(classOf[String]),"DELETE", """""", Routes.prefix + """SqlGen.svc/DerivedColumn/$columnId<[^/]+>"""))
        

// @LINE:60
private[this] lazy val com_sentrana_biq_controllers_DerivedColumnService_updateDerivedColumn39_route = Route("PUT", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/DerivedColumn/"),DynamicPart("columnId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_DerivedColumnService_updateDerivedColumn39_invoker = createInvoker(
com.sentrana.biq.controllers.DerivedColumnService.updateDerivedColumn(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.DerivedColumnService", "updateDerivedColumn", Seq(classOf[String]),"PUT", """""", Routes.prefix + """SqlGen.svc/DerivedColumn/$columnId<[^/]+>"""))
        

// @LINE:63
private[this] lazy val com_sentrana_biq_controllers_ActivityTrackingService_WriteActionLog40_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/WriteActionLog"))))
private[this] lazy val com_sentrana_biq_controllers_ActivityTrackingService_WriteActionLog40_invoker = createInvoker(
com.sentrana.biq.controllers.ActivityTrackingService.WriteActionLog,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ActivityTrackingService", "WriteActionLog", Nil,"POST", """ Action Log""", Routes.prefix + """SqlGen.svc/WriteActionLog"""))
        

// @LINE:66
private[this] lazy val com_sentrana_biq_controllers_ReportService_getReports41_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Reports"))))
private[this] lazy val com_sentrana_biq_controllers_ReportService_getReports41_invoker = createInvoker(
com.sentrana.biq.controllers.ReportService.getReports,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportService", "getReports", Nil,"GET", """ Report Service""", Routes.prefix + """SqlGen.svc/Reports"""))
        

// @LINE:67
private[this] lazy val com_sentrana_biq_controllers_ReportService_getReport42_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Report/"),DynamicPart("reportId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_ReportService_getReport42_invoker = createInvoker(
com.sentrana.biq.controllers.ReportService.getReport(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportService", "getReport", Seq(classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/Report/$reportId<.+>"""))
        

// @LINE:68
private[this] lazy val com_sentrana_biq_controllers_ReportService_addReport43_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Report"))))
private[this] lazy val com_sentrana_biq_controllers_ReportService_addReport43_invoker = createInvoker(
com.sentrana.biq.controllers.ReportService.addReport,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportService", "addReport", Nil,"POST", """""", Routes.prefix + """SqlGen.svc/Report"""))
        

// @LINE:69
private[this] lazy val com_sentrana_biq_controllers_ReportService_editReport44_route = Route("PUT", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Report/"),DynamicPart("reportId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_ReportService_editReport44_invoker = createInvoker(
com.sentrana.biq.controllers.ReportService.editReport(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportService", "editReport", Seq(classOf[String]),"PUT", """""", Routes.prefix + """SqlGen.svc/Report/$reportId<.+>"""))
        

// @LINE:70
private[this] lazy val com_sentrana_biq_controllers_ReportService_deleteReport45_route = Route("DELETE", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Report/"),DynamicPart("reportId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_ReportService_deleteReport45_invoker = createInvoker(
com.sentrana.biq.controllers.ReportService.deleteReport(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportService", "deleteReport", Seq(classOf[String]),"DELETE", """""", Routes.prefix + """SqlGen.svc/Report/$reportId<.+>"""))
        

// @LINE:71
private[this] lazy val com_sentrana_biq_controllers_ReportService_addReportComment46_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ReportComment/"),DynamicPart("reportId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_ReportService_addReportComment46_invoker = createInvoker(
com.sentrana.biq.controllers.ReportService.addReportComment(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportService", "addReportComment", Seq(classOf[String]),"POST", """""", Routes.prefix + """SqlGen.svc/ReportComment/$reportId<.+>"""))
        

// @LINE:72
private[this] lazy val com_sentrana_biq_controllers_ReportService_getReportComment47_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ReportComment/"),DynamicPart("reportId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_ReportService_getReportComment47_invoker = createInvoker(
com.sentrana.biq.controllers.ReportService.getReportComment(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportService", "getReportComment", Seq(classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/ReportComment/$reportId<.+>"""))
        

// @LINE:73
private[this] lazy val com_sentrana_biq_controllers_ReportService_editReportComment48_route = Route("PUT", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ReportComment/"),DynamicPart("reportId", """.+""",false),StaticPart("/"),DynamicPart("commentId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_ReportService_editReportComment48_invoker = createInvoker(
com.sentrana.biq.controllers.ReportService.editReportComment(fakeValue[String], fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportService", "editReportComment", Seq(classOf[String], classOf[String]),"PUT", """""", Routes.prefix + """SqlGen.svc/ReportComment/$reportId<.+>/$commentId<.+>"""))
        

// @LINE:74
private[this] lazy val com_sentrana_biq_controllers_ReportService_deleteReportComment49_route = Route("DELETE", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ReportComment/"),DynamicPart("reportId", """.+""",false),StaticPart("/"),DynamicPart("commentId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_ReportService_deleteReportComment49_invoker = createInvoker(
com.sentrana.biq.controllers.ReportService.deleteReportComment(fakeValue[String], fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportService", "deleteReportComment", Seq(classOf[String], classOf[String]),"DELETE", """""", Routes.prefix + """SqlGen.svc/ReportComment/$reportId<.+>/$commentId<.+>"""))
        

// @LINE:78
private[this] lazy val com_sentrana_biq_controllers_BookletService_getBooklets50_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Booklets"))))
private[this] lazy val com_sentrana_biq_controllers_BookletService_getBooklets50_invoker = createInvoker(
com.sentrana.biq.controllers.BookletService.getBooklets,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletService", "getBooklets", Nil,"GET", """""", Routes.prefix + """SqlGen.svc/Booklets"""))
        

// @LINE:79
private[this] lazy val com_sentrana_biq_controllers_BookletService_getReports51_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Reports/"),DynamicPart("bookletId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_BookletService_getReports51_invoker = createInvoker(
com.sentrana.biq.controllers.BookletService.getReports(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletService", "getReports", Seq(classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/Reports/$bookletId<.+>"""))
        

// @LINE:80
private[this] lazy val com_sentrana_biq_controllers_BookletService_addBooklet52_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Booklet"))))
private[this] lazy val com_sentrana_biq_controllers_BookletService_addBooklet52_invoker = createInvoker(
com.sentrana.biq.controllers.BookletService.addBooklet,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletService", "addBooklet", Nil,"POST", """""", Routes.prefix + """SqlGen.svc/Booklet"""))
        

// @LINE:81
private[this] lazy val com_sentrana_biq_controllers_BookletService_editBooklet53_route = Route("PUT", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Booklet/"),DynamicPart("bookletId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_BookletService_editBooklet53_invoker = createInvoker(
com.sentrana.biq.controllers.BookletService.editBooklet(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletService", "editBooklet", Seq(classOf[String]),"PUT", """""", Routes.prefix + """SqlGen.svc/Booklet/$bookletId<[^/]+>"""))
        

// @LINE:82
private[this] lazy val com_sentrana_biq_controllers_BookletService_deleteBooklet54_route = Route("DELETE", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Booklet/"),DynamicPart("bookletId", """.+""",false))))
private[this] lazy val com_sentrana_biq_controllers_BookletService_deleteBooklet54_invoker = createInvoker(
com.sentrana.biq.controllers.BookletService.deleteBooklet(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletService", "deleteBooklet", Seq(classOf[String]),"DELETE", """""", Routes.prefix + """SqlGen.svc/Booklet/$bookletId<.+>"""))
        

// @LINE:83
private[this] lazy val com_sentrana_biq_controllers_BookletService_copyBooklet55_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Booklet/"),DynamicPart("bookletId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_BookletService_copyBooklet55_invoker = createInvoker(
com.sentrana.biq.controllers.BookletService.copyBooklet(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletService", "copyBooklet", Seq(classOf[String]),"POST", """""", Routes.prefix + """SqlGen.svc/Booklet/$bookletId<[^/]+>"""))
        

// @LINE:87
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_getAvailableRecipients56_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Users"))))
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_getAvailableRecipients56_invoker = createInvoker(
com.sentrana.biq.controllers.ReportSharingService.getAvailableRecipients(fakeValue[String], fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportSharingService", "getAvailableRecipients", Seq(classOf[String], classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/Users"""))
        

// @LINE:88
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_getReportRecipients57_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ReportRecipients/"),DynamicPart("reportId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_getReportRecipients57_invoker = createInvoker(
com.sentrana.biq.controllers.ReportSharingService.getReportRecipients(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportSharingService", "getReportRecipients", Seq(classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/ReportRecipients/$reportId<[^/]+>"""))
        

// @LINE:89
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_getSharingUpdate58_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/GetSharingUpdate/"),DynamicPart("userId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_getSharingUpdate58_invoker = createInvoker(
com.sentrana.biq.controllers.ReportSharingService.getSharingUpdate(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportSharingService", "getSharingUpdate", Seq(classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/GetSharingUpdate/$userId<[^/]+>"""))
        

// @LINE:90
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_modifyReportRecipients59_route = Route("PUT", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ReportRecipients/"),DynamicPart("reportId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_modifyReportRecipients59_invoker = createInvoker(
com.sentrana.biq.controllers.ReportSharingService.modifyReportRecipients(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportSharingService", "modifyReportRecipients", Seq(classOf[String]),"PUT", """""", Routes.prefix + """SqlGen.svc/ReportRecipients/$reportId<[^/]+>"""))
        

// @LINE:91
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_clearSharingInfoCache60_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ClearSharingInfoCache/"),DynamicPart("userId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_clearSharingInfoCache60_invoker = createInvoker(
com.sentrana.biq.controllers.ReportSharingService.clearSharingInfoCache(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportSharingService", "clearSharingInfoCache", Seq(classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/ClearSharingInfoCache/$userId<[^/]+>"""))
        

// @LINE:92
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_removeAllReportRecipients61_route = Route("DELETE", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/ReportRecipients/"),DynamicPart("reportId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_ReportSharingService_removeAllReportRecipients61_invoker = createInvoker(
com.sentrana.biq.controllers.ReportSharingService.removeAllReportRecipients(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.ReportSharingService", "removeAllReportRecipients", Seq(classOf[String]),"DELETE", """""", Routes.prefix + """SqlGen.svc/ReportRecipients/$reportId<[^/]+>"""))
        

// @LINE:96
private[this] lazy val com_sentrana_biq_controllers_BookletSharingService_getAvailableBookletRecipients62_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Booklets/"),DynamicPart("bookletId", """[^/]+""",true),StaticPart("/PossibleRecipients"))))
private[this] lazy val com_sentrana_biq_controllers_BookletSharingService_getAvailableBookletRecipients62_invoker = createInvoker(
com.sentrana.biq.controllers.BookletSharingService.getAvailableBookletRecipients(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletSharingService", "getAvailableBookletRecipients", Seq(classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/Booklets/$bookletId<[^/]+>/PossibleRecipients"""))
        

// @LINE:97
private[this] lazy val com_sentrana_biq_controllers_BookletSharingService_getBookletRecipients63_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/BookletRecipients/"),DynamicPart("bookletId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_BookletSharingService_getBookletRecipients63_invoker = createInvoker(
com.sentrana.biq.controllers.BookletSharingService.getBookletRecipients(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletSharingService", "getBookletRecipients", Seq(classOf[String]),"GET", """""", Routes.prefix + """SqlGen.svc/BookletRecipients/$bookletId<[^/]+>"""))
        

// @LINE:98
private[this] lazy val com_sentrana_biq_controllers_BookletSharingService_removeAllBookletRecipients64_route = Route("DELETE", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/BookletRecipients/"),DynamicPart("bookletId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_BookletSharingService_removeAllBookletRecipients64_invoker = createInvoker(
com.sentrana.biq.controllers.BookletSharingService.removeAllBookletRecipients(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletSharingService", "removeAllBookletRecipients", Seq(classOf[String]),"DELETE", """""", Routes.prefix + """SqlGen.svc/BookletRecipients/$bookletId<[^/]+>"""))
        

// @LINE:99
private[this] lazy val com_sentrana_biq_controllers_BookletSharingService_modifyBookletRecipients65_route = Route("PUT", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/BookletRecipients/"),DynamicPart("bookletId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_BookletSharingService_modifyBookletRecipients65_invoker = createInvoker(
com.sentrana.biq.controllers.BookletSharingService.modifyBookletRecipients(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.BookletSharingService", "modifyBookletRecipients", Seq(classOf[String]),"PUT", """""", Routes.prefix + """SqlGen.svc/BookletRecipients/$bookletId<[^/]+>"""))
        

// @LINE:102
private[this] lazy val com_sentrana_biq_controllers_SavedFilterGroupService_addSavedFilterGroup66_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/SavedFilterGroup"))))
private[this] lazy val com_sentrana_biq_controllers_SavedFilterGroupService_addSavedFilterGroup66_invoker = createInvoker(
com.sentrana.biq.controllers.SavedFilterGroupService.addSavedFilterGroup,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SavedFilterGroupService", "addSavedFilterGroup", Nil,"POST", """ Saved Filter Group Service""", Routes.prefix + """SqlGen.svc/SavedFilterGroup"""))
        

// @LINE:103
private[this] lazy val com_sentrana_biq_controllers_SavedFilterGroupService_deleteSavedFilterGroup67_route = Route("DELETE", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/SavedFilterGroup/"),DynamicPart("filterGroupId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_SavedFilterGroupService_deleteSavedFilterGroup67_invoker = createInvoker(
com.sentrana.biq.controllers.SavedFilterGroupService.deleteSavedFilterGroup(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SavedFilterGroupService", "deleteSavedFilterGroup", Seq(classOf[String]),"DELETE", """""", Routes.prefix + """SqlGen.svc/SavedFilterGroup/$filterGroupId<[^/]+>"""))
        

// @LINE:104
private[this] lazy val com_sentrana_biq_controllers_SavedFilterGroupService_updateSavedFilterGroup68_route = Route("PUT", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/SavedFilterGroup/"),DynamicPart("filterGroupId", """[^/]+""",true))))
private[this] lazy val com_sentrana_biq_controllers_SavedFilterGroupService_updateSavedFilterGroup68_invoker = createInvoker(
com.sentrana.biq.controllers.SavedFilterGroupService.updateSavedFilterGroup(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.SavedFilterGroupService", "updateSavedFilterGroup", Seq(classOf[String]),"PUT", """""", Routes.prefix + """SqlGen.svc/SavedFilterGroup/$filterGroupId<[^/]+>"""))
        

// @LINE:107
private[this] lazy val com_sentrana_biq_controllers_DashboardService_getDashboards69_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Dashboards"))))
private[this] lazy val com_sentrana_biq_controllers_DashboardService_getDashboards69_invoker = createInvoker(
com.sentrana.biq.controllers.DashboardService.getDashboards,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.DashboardService", "getDashboards", Nil,"GET", """ Dashboard Services""", Routes.prefix + """SqlGen.svc/Dashboards"""))
        

// @LINE:108
private[this] lazy val com_sentrana_biq_controllers_DashboardService_addDashboard70_route = Route("POST", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("SqlGen.svc/Dashboard"))))
private[this] lazy val com_sentrana_biq_controllers_DashboardService_addDashboard70_invoker = createInvoker(
com.sentrana.biq.controllers.DashboardService.addDashboard,
HandlerDef(this.getClass.getClassLoader, "biq", "com.sentrana.biq.controllers.DashboardService", "addDashboard", Nil,"POST", """""", Routes.prefix + """SqlGen.svc/Dashboard"""))
        
def documentation = List(("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """public/$file<.+>""","""controllers.Assets.at(path:String = "/public/", file:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SecurityService.svc/login""","""com.sentrana.biq.controllers.SecurityService.login"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SecurityService.svc/logout""","""com.sentrana.biq.controllers.SecurityService.logout"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ValidateSession""","""com.sentrana.biq.controllers.SecurityService.checkLogin"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SecurityService.svc/ChangePassword""","""com.sentrana.biq.controllers.SecurityService.changePassword"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SecurityService.svc/ForgotPassword""","""com.sentrana.biq.controllers.SecurityService.forgotPassword(emailAddress:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SecurityService.svc/ForgotUsername""","""com.sentrana.biq.controllers.SecurityService.forgotUsername(emailAddress:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SecurityService.svc/ChangeAutoGeneratedPassword""","""com.sentrana.biq.controllers.SecurityService.changeAutoGeneratedPassword"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SecurityService.svc/IsValidToken""","""com.sentrana.biq.controllers.SecurityService.isValidToken(token:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SalesforceService.svc/RenderApp/$orgId<[^/]+>""","""com.sentrana.usermanagement.controllers.SalesforceService.renderApp(orgId:String, loginUrl:Option[String])"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SalesforceService.svc/SalesforceCallback/$orgId<[^/]+>""","""com.sentrana.usermanagement.controllers.SalesforceService.salesforceCallback(code:String, orgId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Repository/$repoId<.+>""","""com.sentrana.biq.controllers.MetadataService.getXmlRepositoryObjects(repoId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/ReadConfigFiles""","""com.sentrana.biq.controllers.MetadataService.readConfigFiles(repoId:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/PublishConfigChange""","""com.sentrana.biq.controllers.MetadataService.publishConfigChange"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/SaveRepository""","""com.sentrana.biq.controllers.MetadataService.saveRepository"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/SaveConfigFile""","""com.sentrana.biq.controllers.MetadataService.saveConfigFile"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/SaveAllConfigFiles""","""com.sentrana.biq.controllers.MetadataService.saveAllConfigFiles"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/UploadConfigFiles""","""com.sentrana.biq.controllers.MetadataService.uploadConfigFiles"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/GetRepoList""","""com.sentrana.biq.controllers.MetadataService.getRepoList"""),("""DELETE""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/MetadataCache/$repoId<[^/]+>""","""com.sentrana.biq.controllers.MetadataService.clearMetadataCache(repoId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/DownloadConfigurationFiles""","""com.sentrana.biq.controllers.MetadataService.downloadConfigFiles(id:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/DeleteRepository""","""com.sentrana.biq.controllers.MetadataService.deleteRepository"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/AttributeForm/$formId<[^/]+>""","""com.sentrana.biq.controllers.MetadataService.getAttributeForm(formId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/getRepoNameList""","""com.sentrana.biq.controllers.MetadataService.getRepoNameList"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/getRepo""","""com.sentrana.biq.controllers.MetadataService.getRepo(id:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """MetadataService.svc/RepositoryMetadata/$repoId<[^/]+>""","""com.sentrana.biq.controllers.MetadataService.getRepositoryMetadata(repoId:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Execute""","""com.sentrana.biq.controllers.ReportingService.execute"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/GetDrillOptions""","""com.sentrana.biq.controllers.ReportingService.getDrillOptions(cacheid:String, sElems:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/DropCache""","""com.sentrana.biq.controllers.ReportingService.dropCache(cacheid:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/DropCaches""","""com.sentrana.biq.controllers.ReportingService.dropCaches"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/DropCachesByRepository""","""com.sentrana.biq.controllers.ReportingService.dropCachesByRepository(repositoryIds:String, username:String, password:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ExportToCsv""","""com.sentrana.biq.controllers.ReportingService.exportToCsv"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ExportChart""","""com.sentrana.biq.controllers.ReportingService.exportChart"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ExportPivotTable""","""com.sentrana.biq.controllers.ReportingService.exportPivotTable"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/GetMatchingElementPaths""","""com.sentrana.biq.controllers.ReportingService.getMatchingElementPaths(str:String, form_id:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/GetChildElements""","""com.sentrana.biq.controllers.ReportingService.getChildElements"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ValidateFormula""","""com.sentrana.biq.controllers.DerivedColumnService.validateFormula"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/DerivedColumn""","""com.sentrana.biq.controllers.DerivedColumnService.addDerivedColumn"""),("""DELETE""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/DerivedColumn/$columnId<[^/]+>""","""com.sentrana.biq.controllers.DerivedColumnService.deleteDerivedColumn(columnId:String)"""),("""PUT""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/DerivedColumn/$columnId<[^/]+>""","""com.sentrana.biq.controllers.DerivedColumnService.updateDerivedColumn(columnId:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/WriteActionLog""","""com.sentrana.biq.controllers.ActivityTrackingService.WriteActionLog"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Reports""","""com.sentrana.biq.controllers.ReportService.getReports"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Report/$reportId<.+>""","""com.sentrana.biq.controllers.ReportService.getReport(reportId:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Report""","""com.sentrana.biq.controllers.ReportService.addReport"""),("""PUT""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Report/$reportId<.+>""","""com.sentrana.biq.controllers.ReportService.editReport(reportId:String)"""),("""DELETE""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Report/$reportId<.+>""","""com.sentrana.biq.controllers.ReportService.deleteReport(reportId:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ReportComment/$reportId<.+>""","""com.sentrana.biq.controllers.ReportService.addReportComment(reportId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ReportComment/$reportId<.+>""","""com.sentrana.biq.controllers.ReportService.getReportComment(reportId:String)"""),("""PUT""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ReportComment/$reportId<.+>/$commentId<.+>""","""com.sentrana.biq.controllers.ReportService.editReportComment(reportId:String, commentId:String)"""),("""DELETE""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ReportComment/$reportId<.+>/$commentId<.+>""","""com.sentrana.biq.controllers.ReportService.deleteReportComment(reportId:String, commentId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Booklets""","""com.sentrana.biq.controllers.BookletService.getBooklets"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Reports/$bookletId<.+>""","""com.sentrana.biq.controllers.BookletService.getReports(bookletId:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Booklet""","""com.sentrana.biq.controllers.BookletService.addBooklet"""),("""PUT""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Booklet/$bookletId<[^/]+>""","""com.sentrana.biq.controllers.BookletService.editBooklet(bookletId:String)"""),("""DELETE""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Booklet/$bookletId<.+>""","""com.sentrana.biq.controllers.BookletService.deleteBooklet(bookletId:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Booklet/$bookletId<[^/]+>""","""com.sentrana.biq.controllers.BookletService.copyBooklet(bookletId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Users""","""com.sentrana.biq.controllers.ReportSharingService.getAvailableRecipients(recipientsFor:String, repositoryid:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ReportRecipients/$reportId<[^/]+>""","""com.sentrana.biq.controllers.ReportSharingService.getReportRecipients(reportId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/GetSharingUpdate/$userId<[^/]+>""","""com.sentrana.biq.controllers.ReportSharingService.getSharingUpdate(userId:String)"""),("""PUT""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ReportRecipients/$reportId<[^/]+>""","""com.sentrana.biq.controllers.ReportSharingService.modifyReportRecipients(reportId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ClearSharingInfoCache/$userId<[^/]+>""","""com.sentrana.biq.controllers.ReportSharingService.clearSharingInfoCache(userId:String)"""),("""DELETE""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/ReportRecipients/$reportId<[^/]+>""","""com.sentrana.biq.controllers.ReportSharingService.removeAllReportRecipients(reportId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Booklets/$bookletId<[^/]+>/PossibleRecipients""","""com.sentrana.biq.controllers.BookletSharingService.getAvailableBookletRecipients(bookletId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/BookletRecipients/$bookletId<[^/]+>""","""com.sentrana.biq.controllers.BookletSharingService.getBookletRecipients(bookletId:String)"""),("""DELETE""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/BookletRecipients/$bookletId<[^/]+>""","""com.sentrana.biq.controllers.BookletSharingService.removeAllBookletRecipients(bookletId:String)"""),("""PUT""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/BookletRecipients/$bookletId<[^/]+>""","""com.sentrana.biq.controllers.BookletSharingService.modifyBookletRecipients(bookletId:String)"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/SavedFilterGroup""","""com.sentrana.biq.controllers.SavedFilterGroupService.addSavedFilterGroup"""),("""DELETE""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/SavedFilterGroup/$filterGroupId<[^/]+>""","""com.sentrana.biq.controllers.SavedFilterGroupService.deleteSavedFilterGroup(filterGroupId:String)"""),("""PUT""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/SavedFilterGroup/$filterGroupId<[^/]+>""","""com.sentrana.biq.controllers.SavedFilterGroupService.updateSavedFilterGroup(filterGroupId:String)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Dashboards""","""com.sentrana.biq.controllers.DashboardService.getDashboards"""),("""POST""", prefix + (if(prefix.endsWith("/")) "" else "/") + """SqlGen.svc/Dashboard""","""com.sentrana.biq.controllers.DashboardService.addDashboard""")).foldLeft(List.empty[(String,String,String)]) { (s,e) => e.asInstanceOf[Any] match {
  case r @ (_,_,_) => s :+ r.asInstanceOf[(String,String,String)]
  case l => s ++ l.asInstanceOf[List[(String,String,String)]]
}}
      

def routes:PartialFunction[RequestHeader,Handler] = {

// @LINE:11
case controllers_Assets_at0_route(params) => {
   call(Param[String]("path", Right("/public/")), params.fromPath[String]("file", None)) { (path, file) =>
        controllers_Assets_at0_invoker.call(controllers.Assets.at(path, file))
   }
}
        

// @LINE:14
case com_sentrana_biq_controllers_SecurityService_login1_route(params) => {
   call { 
        com_sentrana_biq_controllers_SecurityService_login1_invoker.call(com.sentrana.biq.controllers.SecurityService.login)
   }
}
        

// @LINE:15
case com_sentrana_biq_controllers_SecurityService_logout2_route(params) => {
   call { 
        com_sentrana_biq_controllers_SecurityService_logout2_invoker.call(com.sentrana.biq.controllers.SecurityService.logout)
   }
}
        

// @LINE:16
case com_sentrana_biq_controllers_SecurityService_checkLogin3_route(params) => {
   call { 
        com_sentrana_biq_controllers_SecurityService_checkLogin3_invoker.call(com.sentrana.biq.controllers.SecurityService.checkLogin)
   }
}
        

// @LINE:17
case com_sentrana_biq_controllers_SecurityService_changePassword4_route(params) => {
   call { 
        com_sentrana_biq_controllers_SecurityService_changePassword4_invoker.call(com.sentrana.biq.controllers.SecurityService.changePassword)
   }
}
        

// @LINE:18
case com_sentrana_biq_controllers_SecurityService_forgotPassword5_route(params) => {
   call(params.fromQuery[String]("emailAddress", None)) { (emailAddress) =>
        com_sentrana_biq_controllers_SecurityService_forgotPassword5_invoker.call(com.sentrana.biq.controllers.SecurityService.forgotPassword(emailAddress))
   }
}
        

// @LINE:19
case com_sentrana_biq_controllers_SecurityService_forgotUsername6_route(params) => {
   call(params.fromQuery[String]("emailAddress", None)) { (emailAddress) =>
        com_sentrana_biq_controllers_SecurityService_forgotUsername6_invoker.call(com.sentrana.biq.controllers.SecurityService.forgotUsername(emailAddress))
   }
}
        

// @LINE:20
case com_sentrana_biq_controllers_SecurityService_changeAutoGeneratedPassword7_route(params) => {
   call { 
        com_sentrana_biq_controllers_SecurityService_changeAutoGeneratedPassword7_invoker.call(com.sentrana.biq.controllers.SecurityService.changeAutoGeneratedPassword)
   }
}
        

// @LINE:21
case com_sentrana_biq_controllers_SecurityService_isValidToken8_route(params) => {
   call(params.fromQuery[String]("token", None)) { (token) =>
        com_sentrana_biq_controllers_SecurityService_isValidToken8_invoker.call(com.sentrana.biq.controllers.SecurityService.isValidToken(token))
   }
}
        

// @LINE:24
case com_sentrana_usermanagement_controllers_SalesforceService_renderApp9_route(params) => {
   call(params.fromPath[String]("orgId", None), params.fromQuery[Option[String]]("loginUrl", None)) { (orgId, loginUrl) =>
        com_sentrana_usermanagement_controllers_SalesforceService_renderApp9_invoker.call(com.sentrana.usermanagement.controllers.SalesforceService.renderApp(orgId, loginUrl))
   }
}
        

// @LINE:25
case com_sentrana_usermanagement_controllers_SalesforceService_salesforceCallback10_route(params) => {
   call(params.fromQuery[String]("code", None), params.fromPath[String]("orgId", None)) { (code, orgId) =>
        com_sentrana_usermanagement_controllers_SalesforceService_salesforceCallback10_invoker.call(com.sentrana.usermanagement.controllers.SalesforceService.salesforceCallback(code, orgId))
   }
}
        

// @LINE:28
case com_sentrana_biq_controllers_MetadataService_getXmlRepositoryObjects11_route(params) => {
   call(params.fromPath[String]("repoId", None)) { (repoId) =>
        com_sentrana_biq_controllers_MetadataService_getXmlRepositoryObjects11_invoker.call(com.sentrana.biq.controllers.MetadataService.getXmlRepositoryObjects(repoId))
   }
}
        

// @LINE:29
case com_sentrana_biq_controllers_MetadataService_readConfigFiles12_route(params) => {
   call(params.fromQuery[String]("repoId", None)) { (repoId) =>
        com_sentrana_biq_controllers_MetadataService_readConfigFiles12_invoker.call(com.sentrana.biq.controllers.MetadataService.readConfigFiles(repoId))
   }
}
        

// @LINE:30
case com_sentrana_biq_controllers_MetadataService_publishConfigChange13_route(params) => {
   call { 
        com_sentrana_biq_controllers_MetadataService_publishConfigChange13_invoker.call(com.sentrana.biq.controllers.MetadataService.publishConfigChange)
   }
}
        

// @LINE:31
case com_sentrana_biq_controllers_MetadataService_saveRepository14_route(params) => {
   call { 
        com_sentrana_biq_controllers_MetadataService_saveRepository14_invoker.call(com.sentrana.biq.controllers.MetadataService.saveRepository)
   }
}
        

// @LINE:32
case com_sentrana_biq_controllers_MetadataService_saveConfigFile15_route(params) => {
   call { 
        com_sentrana_biq_controllers_MetadataService_saveConfigFile15_invoker.call(com.sentrana.biq.controllers.MetadataService.saveConfigFile)
   }
}
        

// @LINE:33
case com_sentrana_biq_controllers_MetadataService_saveAllConfigFiles16_route(params) => {
   call { 
        com_sentrana_biq_controllers_MetadataService_saveAllConfigFiles16_invoker.call(com.sentrana.biq.controllers.MetadataService.saveAllConfigFiles)
   }
}
        

// @LINE:34
case com_sentrana_biq_controllers_MetadataService_uploadConfigFiles17_route(params) => {
   call { 
        com_sentrana_biq_controllers_MetadataService_uploadConfigFiles17_invoker.call(com.sentrana.biq.controllers.MetadataService.uploadConfigFiles)
   }
}
        

// @LINE:35
case com_sentrana_biq_controllers_MetadataService_getRepoList18_route(params) => {
   call { 
        com_sentrana_biq_controllers_MetadataService_getRepoList18_invoker.call(com.sentrana.biq.controllers.MetadataService.getRepoList)
   }
}
        

// @LINE:36
case com_sentrana_biq_controllers_MetadataService_clearMetadataCache19_route(params) => {
   call(params.fromPath[String]("repoId", None)) { (repoId) =>
        com_sentrana_biq_controllers_MetadataService_clearMetadataCache19_invoker.call(com.sentrana.biq.controllers.MetadataService.clearMetadataCache(repoId))
   }
}
        

// @LINE:37
case com_sentrana_biq_controllers_MetadataService_downloadConfigFiles20_route(params) => {
   call(params.fromQuery[String]("id", None)) { (id) =>
        com_sentrana_biq_controllers_MetadataService_downloadConfigFiles20_invoker.call(com.sentrana.biq.controllers.MetadataService.downloadConfigFiles(id))
   }
}
        

// @LINE:38
case com_sentrana_biq_controllers_MetadataService_deleteRepository21_route(params) => {
   call { 
        com_sentrana_biq_controllers_MetadataService_deleteRepository21_invoker.call(com.sentrana.biq.controllers.MetadataService.deleteRepository)
   }
}
        

// @LINE:39
case com_sentrana_biq_controllers_MetadataService_getAttributeForm22_route(params) => {
   call(params.fromPath[String]("formId", None)) { (formId) =>
        com_sentrana_biq_controllers_MetadataService_getAttributeForm22_invoker.call(com.sentrana.biq.controllers.MetadataService.getAttributeForm(formId))
   }
}
        

// @LINE:40
case com_sentrana_biq_controllers_MetadataService_getRepoNameList23_route(params) => {
   call { 
        com_sentrana_biq_controllers_MetadataService_getRepoNameList23_invoker.call(com.sentrana.biq.controllers.MetadataService.getRepoNameList)
   }
}
        

// @LINE:41
case com_sentrana_biq_controllers_MetadataService_getRepo24_route(params) => {
   call(params.fromQuery[String]("id", None)) { (id) =>
        com_sentrana_biq_controllers_MetadataService_getRepo24_invoker.call(com.sentrana.biq.controllers.MetadataService.getRepo(id))
   }
}
        

// @LINE:42
case com_sentrana_biq_controllers_MetadataService_getRepositoryMetadata25_route(params) => {
   call(params.fromPath[String]("repoId", None)) { (repoId) =>
        com_sentrana_biq_controllers_MetadataService_getRepositoryMetadata25_invoker.call(com.sentrana.biq.controllers.MetadataService.getRepositoryMetadata(repoId))
   }
}
        

// @LINE:45
case com_sentrana_biq_controllers_ReportingService_execute26_route(params) => {
   call { 
        com_sentrana_biq_controllers_ReportingService_execute26_invoker.call(com.sentrana.biq.controllers.ReportingService.execute)
   }
}
        

// @LINE:46
case com_sentrana_biq_controllers_ReportingService_getDrillOptions27_route(params) => {
   call(params.fromQuery[String]("cacheid", None), params.fromQuery[String]("sElems", None)) { (cacheid, sElems) =>
        com_sentrana_biq_controllers_ReportingService_getDrillOptions27_invoker.call(com.sentrana.biq.controllers.ReportingService.getDrillOptions(cacheid, sElems))
   }
}
        

// @LINE:47
case com_sentrana_biq_controllers_ReportingService_dropCache28_route(params) => {
   call(params.fromQuery[String]("cacheid", None)) { (cacheid) =>
        com_sentrana_biq_controllers_ReportingService_dropCache28_invoker.call(com.sentrana.biq.controllers.ReportingService.dropCache(cacheid))
   }
}
        

// @LINE:48
case com_sentrana_biq_controllers_ReportingService_dropCaches29_route(params) => {
   call { 
        com_sentrana_biq_controllers_ReportingService_dropCaches29_invoker.call(com.sentrana.biq.controllers.ReportingService.dropCaches)
   }
}
        

// @LINE:49
case com_sentrana_biq_controllers_ReportingService_dropCachesByRepository30_route(params) => {
   call(params.fromQuery[String]("repositoryIds", None), params.fromQuery[String]("username", None), params.fromQuery[String]("password", None)) { (repositoryIds, username, password) =>
        com_sentrana_biq_controllers_ReportingService_dropCachesByRepository30_invoker.call(com.sentrana.biq.controllers.ReportingService.dropCachesByRepository(repositoryIds, username, password))
   }
}
        

// @LINE:50
case com_sentrana_biq_controllers_ReportingService_exportToCsv31_route(params) => {
   call { 
        com_sentrana_biq_controllers_ReportingService_exportToCsv31_invoker.call(com.sentrana.biq.controllers.ReportingService.exportToCsv)
   }
}
        

// @LINE:51
case com_sentrana_biq_controllers_ReportingService_exportChart32_route(params) => {
   call { 
        com_sentrana_biq_controllers_ReportingService_exportChart32_invoker.call(com.sentrana.biq.controllers.ReportingService.exportChart)
   }
}
        

// @LINE:52
case com_sentrana_biq_controllers_ReportingService_exportPivotTable33_route(params) => {
   call { 
        com_sentrana_biq_controllers_ReportingService_exportPivotTable33_invoker.call(com.sentrana.biq.controllers.ReportingService.exportPivotTable)
   }
}
        

// @LINE:53
case com_sentrana_biq_controllers_ReportingService_getMatchingElementPaths34_route(params) => {
   call(params.fromQuery[String]("str", None), params.fromQuery[String]("form_id", None)) { (str, form_id) =>
        com_sentrana_biq_controllers_ReportingService_getMatchingElementPaths34_invoker.call(com.sentrana.biq.controllers.ReportingService.getMatchingElementPaths(str, form_id))
   }
}
        

// @LINE:54
case com_sentrana_biq_controllers_ReportingService_getChildElements35_route(params) => {
   call { 
        com_sentrana_biq_controllers_ReportingService_getChildElements35_invoker.call(com.sentrana.biq.controllers.ReportingService.getChildElements)
   }
}
        

// @LINE:57
case com_sentrana_biq_controllers_DerivedColumnService_validateFormula36_route(params) => {
   call { 
        com_sentrana_biq_controllers_DerivedColumnService_validateFormula36_invoker.call(com.sentrana.biq.controllers.DerivedColumnService.validateFormula)
   }
}
        

// @LINE:58
case com_sentrana_biq_controllers_DerivedColumnService_addDerivedColumn37_route(params) => {
   call { 
        com_sentrana_biq_controllers_DerivedColumnService_addDerivedColumn37_invoker.call(com.sentrana.biq.controllers.DerivedColumnService.addDerivedColumn)
   }
}
        

// @LINE:59
case com_sentrana_biq_controllers_DerivedColumnService_deleteDerivedColumn38_route(params) => {
   call(params.fromPath[String]("columnId", None)) { (columnId) =>
        com_sentrana_biq_controllers_DerivedColumnService_deleteDerivedColumn38_invoker.call(com.sentrana.biq.controllers.DerivedColumnService.deleteDerivedColumn(columnId))
   }
}
        

// @LINE:60
case com_sentrana_biq_controllers_DerivedColumnService_updateDerivedColumn39_route(params) => {
   call(params.fromPath[String]("columnId", None)) { (columnId) =>
        com_sentrana_biq_controllers_DerivedColumnService_updateDerivedColumn39_invoker.call(com.sentrana.biq.controllers.DerivedColumnService.updateDerivedColumn(columnId))
   }
}
        

// @LINE:63
case com_sentrana_biq_controllers_ActivityTrackingService_WriteActionLog40_route(params) => {
   call { 
        com_sentrana_biq_controllers_ActivityTrackingService_WriteActionLog40_invoker.call(com.sentrana.biq.controllers.ActivityTrackingService.WriteActionLog)
   }
}
        

// @LINE:66
case com_sentrana_biq_controllers_ReportService_getReports41_route(params) => {
   call { 
        com_sentrana_biq_controllers_ReportService_getReports41_invoker.call(com.sentrana.biq.controllers.ReportService.getReports)
   }
}
        

// @LINE:67
case com_sentrana_biq_controllers_ReportService_getReport42_route(params) => {
   call(params.fromPath[String]("reportId", None)) { (reportId) =>
        com_sentrana_biq_controllers_ReportService_getReport42_invoker.call(com.sentrana.biq.controllers.ReportService.getReport(reportId))
   }
}
        

// @LINE:68
case com_sentrana_biq_controllers_ReportService_addReport43_route(params) => {
   call { 
        com_sentrana_biq_controllers_ReportService_addReport43_invoker.call(com.sentrana.biq.controllers.ReportService.addReport)
   }
}
        

// @LINE:69
case com_sentrana_biq_controllers_ReportService_editReport44_route(params) => {
   call(params.fromPath[String]("reportId", None)) { (reportId) =>
        com_sentrana_biq_controllers_ReportService_editReport44_invoker.call(com.sentrana.biq.controllers.ReportService.editReport(reportId))
   }
}
        

// @LINE:70
case com_sentrana_biq_controllers_ReportService_deleteReport45_route(params) => {
   call(params.fromPath[String]("reportId", None)) { (reportId) =>
        com_sentrana_biq_controllers_ReportService_deleteReport45_invoker.call(com.sentrana.biq.controllers.ReportService.deleteReport(reportId))
   }
}
        

// @LINE:71
case com_sentrana_biq_controllers_ReportService_addReportComment46_route(params) => {
   call(params.fromPath[String]("reportId", None)) { (reportId) =>
        com_sentrana_biq_controllers_ReportService_addReportComment46_invoker.call(com.sentrana.biq.controllers.ReportService.addReportComment(reportId))
   }
}
        

// @LINE:72
case com_sentrana_biq_controllers_ReportService_getReportComment47_route(params) => {
   call(params.fromPath[String]("reportId", None)) { (reportId) =>
        com_sentrana_biq_controllers_ReportService_getReportComment47_invoker.call(com.sentrana.biq.controllers.ReportService.getReportComment(reportId))
   }
}
        

// @LINE:73
case com_sentrana_biq_controllers_ReportService_editReportComment48_route(params) => {
   call(params.fromPath[String]("reportId", None), params.fromPath[String]("commentId", None)) { (reportId, commentId) =>
        com_sentrana_biq_controllers_ReportService_editReportComment48_invoker.call(com.sentrana.biq.controllers.ReportService.editReportComment(reportId, commentId))
   }
}
        

// @LINE:74
case com_sentrana_biq_controllers_ReportService_deleteReportComment49_route(params) => {
   call(params.fromPath[String]("reportId", None), params.fromPath[String]("commentId", None)) { (reportId, commentId) =>
        com_sentrana_biq_controllers_ReportService_deleteReportComment49_invoker.call(com.sentrana.biq.controllers.ReportService.deleteReportComment(reportId, commentId))
   }
}
        

// @LINE:78
case com_sentrana_biq_controllers_BookletService_getBooklets50_route(params) => {
   call { 
        com_sentrana_biq_controllers_BookletService_getBooklets50_invoker.call(com.sentrana.biq.controllers.BookletService.getBooklets)
   }
}
        

// @LINE:79
case com_sentrana_biq_controllers_BookletService_getReports51_route(params) => {
   call(params.fromPath[String]("bookletId", None)) { (bookletId) =>
        com_sentrana_biq_controllers_BookletService_getReports51_invoker.call(com.sentrana.biq.controllers.BookletService.getReports(bookletId))
   }
}
        

// @LINE:80
case com_sentrana_biq_controllers_BookletService_addBooklet52_route(params) => {
   call { 
        com_sentrana_biq_controllers_BookletService_addBooklet52_invoker.call(com.sentrana.biq.controllers.BookletService.addBooklet)
   }
}
        

// @LINE:81
case com_sentrana_biq_controllers_BookletService_editBooklet53_route(params) => {
   call(params.fromPath[String]("bookletId", None)) { (bookletId) =>
        com_sentrana_biq_controllers_BookletService_editBooklet53_invoker.call(com.sentrana.biq.controllers.BookletService.editBooklet(bookletId))
   }
}
        

// @LINE:82
case com_sentrana_biq_controllers_BookletService_deleteBooklet54_route(params) => {
   call(params.fromPath[String]("bookletId", None)) { (bookletId) =>
        com_sentrana_biq_controllers_BookletService_deleteBooklet54_invoker.call(com.sentrana.biq.controllers.BookletService.deleteBooklet(bookletId))
   }
}
        

// @LINE:83
case com_sentrana_biq_controllers_BookletService_copyBooklet55_route(params) => {
   call(params.fromPath[String]("bookletId", None)) { (bookletId) =>
        com_sentrana_biq_controllers_BookletService_copyBooklet55_invoker.call(com.sentrana.biq.controllers.BookletService.copyBooklet(bookletId))
   }
}
        

// @LINE:87
case com_sentrana_biq_controllers_ReportSharingService_getAvailableRecipients56_route(params) => {
   call(params.fromQuery[String]("recipientsFor", None), params.fromQuery[String]("repositoryid", None)) { (recipientsFor, repositoryid) =>
        com_sentrana_biq_controllers_ReportSharingService_getAvailableRecipients56_invoker.call(com.sentrana.biq.controllers.ReportSharingService.getAvailableRecipients(recipientsFor, repositoryid))
   }
}
        

// @LINE:88
case com_sentrana_biq_controllers_ReportSharingService_getReportRecipients57_route(params) => {
   call(params.fromPath[String]("reportId", None)) { (reportId) =>
        com_sentrana_biq_controllers_ReportSharingService_getReportRecipients57_invoker.call(com.sentrana.biq.controllers.ReportSharingService.getReportRecipients(reportId))
   }
}
        

// @LINE:89
case com_sentrana_biq_controllers_ReportSharingService_getSharingUpdate58_route(params) => {
   call(params.fromPath[String]("userId", None)) { (userId) =>
        com_sentrana_biq_controllers_ReportSharingService_getSharingUpdate58_invoker.call(com.sentrana.biq.controllers.ReportSharingService.getSharingUpdate(userId))
   }
}
        

// @LINE:90
case com_sentrana_biq_controllers_ReportSharingService_modifyReportRecipients59_route(params) => {
   call(params.fromPath[String]("reportId", None)) { (reportId) =>
        com_sentrana_biq_controllers_ReportSharingService_modifyReportRecipients59_invoker.call(com.sentrana.biq.controllers.ReportSharingService.modifyReportRecipients(reportId))
   }
}
        

// @LINE:91
case com_sentrana_biq_controllers_ReportSharingService_clearSharingInfoCache60_route(params) => {
   call(params.fromPath[String]("userId", None)) { (userId) =>
        com_sentrana_biq_controllers_ReportSharingService_clearSharingInfoCache60_invoker.call(com.sentrana.biq.controllers.ReportSharingService.clearSharingInfoCache(userId))
   }
}
        

// @LINE:92
case com_sentrana_biq_controllers_ReportSharingService_removeAllReportRecipients61_route(params) => {
   call(params.fromPath[String]("reportId", None)) { (reportId) =>
        com_sentrana_biq_controllers_ReportSharingService_removeAllReportRecipients61_invoker.call(com.sentrana.biq.controllers.ReportSharingService.removeAllReportRecipients(reportId))
   }
}
        

// @LINE:96
case com_sentrana_biq_controllers_BookletSharingService_getAvailableBookletRecipients62_route(params) => {
   call(params.fromPath[String]("bookletId", None)) { (bookletId) =>
        com_sentrana_biq_controllers_BookletSharingService_getAvailableBookletRecipients62_invoker.call(com.sentrana.biq.controllers.BookletSharingService.getAvailableBookletRecipients(bookletId))
   }
}
        

// @LINE:97
case com_sentrana_biq_controllers_BookletSharingService_getBookletRecipients63_route(params) => {
   call(params.fromPath[String]("bookletId", None)) { (bookletId) =>
        com_sentrana_biq_controllers_BookletSharingService_getBookletRecipients63_invoker.call(com.sentrana.biq.controllers.BookletSharingService.getBookletRecipients(bookletId))
   }
}
        

// @LINE:98
case com_sentrana_biq_controllers_BookletSharingService_removeAllBookletRecipients64_route(params) => {
   call(params.fromPath[String]("bookletId", None)) { (bookletId) =>
        com_sentrana_biq_controllers_BookletSharingService_removeAllBookletRecipients64_invoker.call(com.sentrana.biq.controllers.BookletSharingService.removeAllBookletRecipients(bookletId))
   }
}
        

// @LINE:99
case com_sentrana_biq_controllers_BookletSharingService_modifyBookletRecipients65_route(params) => {
   call(params.fromPath[String]("bookletId", None)) { (bookletId) =>
        com_sentrana_biq_controllers_BookletSharingService_modifyBookletRecipients65_invoker.call(com.sentrana.biq.controllers.BookletSharingService.modifyBookletRecipients(bookletId))
   }
}
        

// @LINE:102
case com_sentrana_biq_controllers_SavedFilterGroupService_addSavedFilterGroup66_route(params) => {
   call { 
        com_sentrana_biq_controllers_SavedFilterGroupService_addSavedFilterGroup66_invoker.call(com.sentrana.biq.controllers.SavedFilterGroupService.addSavedFilterGroup)
   }
}
        

// @LINE:103
case com_sentrana_biq_controllers_SavedFilterGroupService_deleteSavedFilterGroup67_route(params) => {
   call(params.fromPath[String]("filterGroupId", None)) { (filterGroupId) =>
        com_sentrana_biq_controllers_SavedFilterGroupService_deleteSavedFilterGroup67_invoker.call(com.sentrana.biq.controllers.SavedFilterGroupService.deleteSavedFilterGroup(filterGroupId))
   }
}
        

// @LINE:104
case com_sentrana_biq_controllers_SavedFilterGroupService_updateSavedFilterGroup68_route(params) => {
   call(params.fromPath[String]("filterGroupId", None)) { (filterGroupId) =>
        com_sentrana_biq_controllers_SavedFilterGroupService_updateSavedFilterGroup68_invoker.call(com.sentrana.biq.controllers.SavedFilterGroupService.updateSavedFilterGroup(filterGroupId))
   }
}
        

// @LINE:107
case com_sentrana_biq_controllers_DashboardService_getDashboards69_route(params) => {
   call { 
        com_sentrana_biq_controllers_DashboardService_getDashboards69_invoker.call(com.sentrana.biq.controllers.DashboardService.getDashboards)
   }
}
        

// @LINE:108
case com_sentrana_biq_controllers_DashboardService_addDashboard70_route(params) => {
   call { 
        com_sentrana_biq_controllers_DashboardService_addDashboard70_invoker.call(com.sentrana.biq.controllers.DashboardService.addDashboard)
   }
}
        
}

}
     