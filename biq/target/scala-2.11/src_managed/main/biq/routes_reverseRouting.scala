// @SOURCE:D:/git/biq/conf/biq.routes
// @HASH:e63a8c9b4f28d5377ee092a4bf2eea4d3d5f050c
// @DATE:Wed Feb 17 14:21:05 BDT 2016

import biq.Routes.{prefix => _prefix, defaultPrefix => _defaultPrefix}
import play.core._
import play.core.Router._
import play.core.Router.HandlerInvokerFactory._
import play.core.j._

import play.api.mvc._
import _root_.controllers.Assets.Asset

import Router.queryString


// @LINE:11
package controllers {

// @LINE:11
class ReverseAssets {


// @LINE:11
def at(file:String): Call = {
   implicit val _rrc = new ReverseRouteContext(Map(("path", "/public/")))
   Call("GET", _prefix + { _defaultPrefix } + "public/" + implicitly[PathBindable[String]].unbind("file", file))
}
                        

}
                          
}
                  

// @LINE:25
// @LINE:24
package com.sentrana.usermanagement.controllers {

// @LINE:25
// @LINE:24
class ReverseSalesforceService {


// @LINE:25
def salesforceCallback(code:String, orgId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SalesforceService.svc/SalesforceCallback/" + implicitly[PathBindable[String]].unbind("orgId", dynamicString(orgId)) + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("code", code)))))
}
                        

// @LINE:24
def renderApp(orgId:String, loginUrl:Option[String]): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SalesforceService.svc/RenderApp/" + implicitly[PathBindable[String]].unbind("orgId", dynamicString(orgId)) + queryString(List(Some(implicitly[QueryStringBindable[Option[String]]].unbind("loginUrl", loginUrl)))))
}
                        

}
                          
}
                  

// @LINE:108
// @LINE:107
// @LINE:104
// @LINE:103
// @LINE:102
// @LINE:99
// @LINE:98
// @LINE:97
// @LINE:96
// @LINE:92
// @LINE:91
// @LINE:90
// @LINE:89
// @LINE:88
// @LINE:87
// @LINE:83
// @LINE:82
// @LINE:81
// @LINE:80
// @LINE:79
// @LINE:78
// @LINE:74
// @LINE:73
// @LINE:72
// @LINE:71
// @LINE:70
// @LINE:69
// @LINE:68
// @LINE:67
// @LINE:66
// @LINE:63
// @LINE:60
// @LINE:59
// @LINE:58
// @LINE:57
// @LINE:54
// @LINE:53
// @LINE:52
// @LINE:51
// @LINE:50
// @LINE:49
// @LINE:48
// @LINE:47
// @LINE:46
// @LINE:45
// @LINE:42
// @LINE:41
// @LINE:40
// @LINE:39
// @LINE:38
// @LINE:37
// @LINE:36
// @LINE:35
// @LINE:34
// @LINE:33
// @LINE:32
// @LINE:31
// @LINE:30
// @LINE:29
// @LINE:28
// @LINE:21
// @LINE:20
// @LINE:19
// @LINE:18
// @LINE:17
// @LINE:16
// @LINE:15
// @LINE:14
package com.sentrana.biq.controllers {

// @LINE:74
// @LINE:73
// @LINE:72
// @LINE:71
// @LINE:70
// @LINE:69
// @LINE:68
// @LINE:67
// @LINE:66
class ReverseReportService {


// @LINE:67
def getReport(reportId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/Report/" + implicitly[PathBindable[String]].unbind("reportId", reportId))
}
                        

// @LINE:70
def deleteReport(reportId:String): Call = {
   import ReverseRouteContext.empty
   Call("DELETE", _prefix + { _defaultPrefix } + "SqlGen.svc/Report/" + implicitly[PathBindable[String]].unbind("reportId", reportId))
}
                        

// @LINE:71
def addReportComment(reportId:String): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/ReportComment/" + implicitly[PathBindable[String]].unbind("reportId", reportId))
}
                        

// @LINE:68
def addReport(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/Report")
}
                        

// @LINE:66
def getReports(): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/Reports")
}
                        

// @LINE:72
def getReportComment(reportId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/ReportComment/" + implicitly[PathBindable[String]].unbind("reportId", reportId))
}
                        

// @LINE:73
def editReportComment(reportId:String, commentId:String): Call = {
   import ReverseRouteContext.empty
   Call("PUT", _prefix + { _defaultPrefix } + "SqlGen.svc/ReportComment/" + implicitly[PathBindable[String]].unbind("reportId", reportId) + "/" + implicitly[PathBindable[String]].unbind("commentId", commentId))
}
                        

// @LINE:69
def editReport(reportId:String): Call = {
   import ReverseRouteContext.empty
   Call("PUT", _prefix + { _defaultPrefix } + "SqlGen.svc/Report/" + implicitly[PathBindable[String]].unbind("reportId", reportId))
}
                        

// @LINE:74
def deleteReportComment(reportId:String, commentId:String): Call = {
   import ReverseRouteContext.empty
   Call("DELETE", _prefix + { _defaultPrefix } + "SqlGen.svc/ReportComment/" + implicitly[PathBindable[String]].unbind("reportId", reportId) + "/" + implicitly[PathBindable[String]].unbind("commentId", commentId))
}
                        

}
                          

// @LINE:60
// @LINE:59
// @LINE:58
// @LINE:57
class ReverseDerivedColumnService {


// @LINE:57
def validateFormula(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/ValidateFormula")
}
                        

// @LINE:59
def deleteDerivedColumn(columnId:String): Call = {
   import ReverseRouteContext.empty
   Call("DELETE", _prefix + { _defaultPrefix } + "SqlGen.svc/DerivedColumn/" + implicitly[PathBindable[String]].unbind("columnId", dynamicString(columnId)))
}
                        

// @LINE:60
def updateDerivedColumn(columnId:String): Call = {
   import ReverseRouteContext.empty
   Call("PUT", _prefix + { _defaultPrefix } + "SqlGen.svc/DerivedColumn/" + implicitly[PathBindable[String]].unbind("columnId", dynamicString(columnId)))
}
                        

// @LINE:58
def addDerivedColumn(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/DerivedColumn")
}
                        

}
                          

// @LINE:92
// @LINE:91
// @LINE:90
// @LINE:89
// @LINE:88
// @LINE:87
class ReverseReportSharingService {


// @LINE:87
def getAvailableRecipients(recipientsFor:String, repositoryid:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/Users" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("recipientsFor", recipientsFor)), Some(implicitly[QueryStringBindable[String]].unbind("repositoryid", repositoryid)))))
}
                        

// @LINE:91
def clearSharingInfoCache(userId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/ClearSharingInfoCache/" + implicitly[PathBindable[String]].unbind("userId", dynamicString(userId)))
}
                        

// @LINE:88
def getReportRecipients(reportId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/ReportRecipients/" + implicitly[PathBindable[String]].unbind("reportId", dynamicString(reportId)))
}
                        

// @LINE:89
def getSharingUpdate(userId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/GetSharingUpdate/" + implicitly[PathBindable[String]].unbind("userId", dynamicString(userId)))
}
                        

// @LINE:92
def removeAllReportRecipients(reportId:String): Call = {
   import ReverseRouteContext.empty
   Call("DELETE", _prefix + { _defaultPrefix } + "SqlGen.svc/ReportRecipients/" + implicitly[PathBindable[String]].unbind("reportId", dynamicString(reportId)))
}
                        

// @LINE:90
def modifyReportRecipients(reportId:String): Call = {
   import ReverseRouteContext.empty
   Call("PUT", _prefix + { _defaultPrefix } + "SqlGen.svc/ReportRecipients/" + implicitly[PathBindable[String]].unbind("reportId", dynamicString(reportId)))
}
                        

}
                          

// @LINE:42
// @LINE:41
// @LINE:40
// @LINE:39
// @LINE:38
// @LINE:37
// @LINE:36
// @LINE:35
// @LINE:34
// @LINE:33
// @LINE:32
// @LINE:31
// @LINE:30
// @LINE:29
// @LINE:28
class ReverseMetadataService {


// @LINE:37
def downloadConfigFiles(id:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "MetadataService.svc/DownloadConfigurationFiles" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("id", id)))))
}
                        

// @LINE:32
def saveConfigFile(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "MetadataService.svc/SaveConfigFile")
}
                        

// @LINE:29
def readConfigFiles(repoId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "MetadataService.svc/ReadConfigFiles" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("repoId", repoId)))))
}
                        

// @LINE:36
def clearMetadataCache(repoId:String): Call = {
   import ReverseRouteContext.empty
   Call("DELETE", _prefix + { _defaultPrefix } + "MetadataService.svc/MetadataCache/" + implicitly[PathBindable[String]].unbind("repoId", dynamicString(repoId)))
}
                        

// @LINE:33
def saveAllConfigFiles(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "MetadataService.svc/SaveAllConfigFiles")
}
                        

// @LINE:28
def getXmlRepositoryObjects(repoId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/Repository/" + implicitly[PathBindable[String]].unbind("repoId", repoId))
}
                        

// @LINE:40
def getRepoNameList(): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "MetadataService.svc/getRepoNameList")
}
                        

// @LINE:30
def publishConfigChange(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "MetadataService.svc/PublishConfigChange")
}
                        

// @LINE:34
def uploadConfigFiles(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "MetadataService.svc/UploadConfigFiles")
}
                        

// @LINE:35
def getRepoList(): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "MetadataService.svc/GetRepoList")
}
                        

// @LINE:41
def getRepo(id:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "MetadataService.svc/getRepo" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("id", id)))))
}
                        

// @LINE:39
def getAttributeForm(formId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "MetadataService.svc/AttributeForm/" + implicitly[PathBindable[String]].unbind("formId", dynamicString(formId)))
}
                        

// @LINE:42
def getRepositoryMetadata(repoId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "MetadataService.svc/RepositoryMetadata/" + implicitly[PathBindable[String]].unbind("repoId", dynamicString(repoId)))
}
                        

// @LINE:38
def deleteRepository(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "MetadataService.svc/DeleteRepository")
}
                        

// @LINE:31
def saveRepository(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "MetadataService.svc/SaveRepository")
}
                        

}
                          

// @LINE:104
// @LINE:103
// @LINE:102
class ReverseSavedFilterGroupService {


// @LINE:104
def updateSavedFilterGroup(filterGroupId:String): Call = {
   import ReverseRouteContext.empty
   Call("PUT", _prefix + { _defaultPrefix } + "SqlGen.svc/SavedFilterGroup/" + implicitly[PathBindable[String]].unbind("filterGroupId", dynamicString(filterGroupId)))
}
                        

// @LINE:103
def deleteSavedFilterGroup(filterGroupId:String): Call = {
   import ReverseRouteContext.empty
   Call("DELETE", _prefix + { _defaultPrefix } + "SqlGen.svc/SavedFilterGroup/" + implicitly[PathBindable[String]].unbind("filterGroupId", dynamicString(filterGroupId)))
}
                        

// @LINE:102
def addSavedFilterGroup(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/SavedFilterGroup")
}
                        

}
                          

// @LINE:54
// @LINE:53
// @LINE:52
// @LINE:51
// @LINE:50
// @LINE:49
// @LINE:48
// @LINE:47
// @LINE:46
// @LINE:45
class ReverseReportingService {


// @LINE:47
def dropCache(cacheid:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/DropCache" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("cacheid", cacheid)))))
}
                        

// @LINE:48
def dropCaches(): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/DropCaches")
}
                        

// @LINE:45
def execute(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/Execute")
}
                        

// @LINE:46
def getDrillOptions(cacheid:String, sElems:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/GetDrillOptions" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("cacheid", cacheid)), Some(implicitly[QueryStringBindable[String]].unbind("sElems", sElems)))))
}
                        

// @LINE:50
def exportToCsv(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/ExportToCsv")
}
                        

// @LINE:52
def exportPivotTable(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/ExportPivotTable")
}
                        

// @LINE:53
def getMatchingElementPaths(str:String, form_id:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/GetMatchingElementPaths" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("str", str)), Some(implicitly[QueryStringBindable[String]].unbind("form_id", form_id)))))
}
                        

// @LINE:51
def exportChart(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/ExportChart")
}
                        

// @LINE:49
def dropCachesByRepository(repositoryIds:String, username:String, password:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/DropCachesByRepository" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("repositoryIds", repositoryIds)), Some(implicitly[QueryStringBindable[String]].unbind("username", username)), Some(implicitly[QueryStringBindable[String]].unbind("password", password)))))
}
                        

// @LINE:54
def getChildElements(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/GetChildElements")
}
                        

}
                          

// @LINE:108
// @LINE:107
class ReverseDashboardService {


// @LINE:107
def getDashboards(): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/Dashboards")
}
                        

// @LINE:108
def addDashboard(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/Dashboard")
}
                        

}
                          

// @LINE:83
// @LINE:82
// @LINE:81
// @LINE:80
// @LINE:79
// @LINE:78
class ReverseBookletService {


// @LINE:83
def copyBooklet(bookletId:String): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/Booklet/" + implicitly[PathBindable[String]].unbind("bookletId", dynamicString(bookletId)))
}
                        

// @LINE:82
def deleteBooklet(bookletId:String): Call = {
   import ReverseRouteContext.empty
   Call("DELETE", _prefix + { _defaultPrefix } + "SqlGen.svc/Booklet/" + implicitly[PathBindable[String]].unbind("bookletId", bookletId))
}
                        

// @LINE:80
def addBooklet(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/Booklet")
}
                        

// @LINE:81
def editBooklet(bookletId:String): Call = {
   import ReverseRouteContext.empty
   Call("PUT", _prefix + { _defaultPrefix } + "SqlGen.svc/Booklet/" + implicitly[PathBindable[String]].unbind("bookletId", dynamicString(bookletId)))
}
                        

// @LINE:78
def getBooklets(): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/Booklets")
}
                        

// @LINE:79
def getReports(bookletId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/Reports/" + implicitly[PathBindable[String]].unbind("bookletId", bookletId))
}
                        

}
                          

// @LINE:63
class ReverseActivityTrackingService {


// @LINE:63
def WriteActionLog(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SqlGen.svc/WriteActionLog")
}
                        

}
                          

// @LINE:21
// @LINE:20
// @LINE:19
// @LINE:18
// @LINE:17
// @LINE:16
// @LINE:15
// @LINE:14
class ReverseSecurityService {


// @LINE:21
def isValidToken(token:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SecurityService.svc/IsValidToken" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("token", token)))))
}
                        

// @LINE:16
def checkLogin(): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/ValidateSession")
}
                        

// @LINE:15
def logout(): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SecurityService.svc/logout")
}
                        

// @LINE:20
def changeAutoGeneratedPassword(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SecurityService.svc/ChangeAutoGeneratedPassword")
}
                        

// @LINE:17
def changePassword(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SecurityService.svc/ChangePassword")
}
                        

// @LINE:18
def forgotPassword(emailAddress:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SecurityService.svc/ForgotPassword" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("emailAddress", emailAddress)))))
}
                        

// @LINE:19
def forgotUsername(emailAddress:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SecurityService.svc/ForgotUsername" + queryString(List(Some(implicitly[QueryStringBindable[String]].unbind("emailAddress", emailAddress)))))
}
                        

// @LINE:14
def login(): Call = {
   import ReverseRouteContext.empty
   Call("POST", _prefix + { _defaultPrefix } + "SecurityService.svc/login")
}
                        

}
                          

// @LINE:99
// @LINE:98
// @LINE:97
// @LINE:96
class ReverseBookletSharingService {


// @LINE:96
def getAvailableBookletRecipients(bookletId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/Booklets/" + implicitly[PathBindable[String]].unbind("bookletId", dynamicString(bookletId)) + "/PossibleRecipients")
}
                        

// @LINE:98
def removeAllBookletRecipients(bookletId:String): Call = {
   import ReverseRouteContext.empty
   Call("DELETE", _prefix + { _defaultPrefix } + "SqlGen.svc/BookletRecipients/" + implicitly[PathBindable[String]].unbind("bookletId", dynamicString(bookletId)))
}
                        

// @LINE:97
def getBookletRecipients(bookletId:String): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "SqlGen.svc/BookletRecipients/" + implicitly[PathBindable[String]].unbind("bookletId", dynamicString(bookletId)))
}
                        

// @LINE:99
def modifyBookletRecipients(bookletId:String): Call = {
   import ReverseRouteContext.empty
   Call("PUT", _prefix + { _defaultPrefix } + "SqlGen.svc/BookletRecipients/" + implicitly[PathBindable[String]].unbind("bookletId", dynamicString(bookletId)))
}
                        

}
                          
}
                  


// @LINE:11
package controllers.javascript {
import ReverseRouteContext.empty

// @LINE:11
class ReverseAssets {


// @LINE:11
def at : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Assets.at",
   """
      function(file) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "public/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("file", file)})
      }
   """
)
                        

}
              
}
        

// @LINE:25
// @LINE:24
package com.sentrana.usermanagement.controllers.javascript {
import ReverseRouteContext.empty

// @LINE:25
// @LINE:24
class ReverseSalesforceService {


// @LINE:25
def salesforceCallback : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.usermanagement.controllers.SalesforceService.salesforceCallback",
   """
      function(code,orgId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SalesforceService.svc/SalesforceCallback/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("orgId", encodeURIComponent(orgId)) + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("code", code)])})
      }
   """
)
                        

// @LINE:24
def renderApp : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.usermanagement.controllers.SalesforceService.renderApp",
   """
      function(orgId,loginUrl) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SalesforceService.svc/RenderApp/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("orgId", encodeURIComponent(orgId)) + _qS([(""" + implicitly[QueryStringBindable[Option[String]]].javascriptUnbind + """)("loginUrl", loginUrl)])})
      }
   """
)
                        

}
              
}
        

// @LINE:108
// @LINE:107
// @LINE:104
// @LINE:103
// @LINE:102
// @LINE:99
// @LINE:98
// @LINE:97
// @LINE:96
// @LINE:92
// @LINE:91
// @LINE:90
// @LINE:89
// @LINE:88
// @LINE:87
// @LINE:83
// @LINE:82
// @LINE:81
// @LINE:80
// @LINE:79
// @LINE:78
// @LINE:74
// @LINE:73
// @LINE:72
// @LINE:71
// @LINE:70
// @LINE:69
// @LINE:68
// @LINE:67
// @LINE:66
// @LINE:63
// @LINE:60
// @LINE:59
// @LINE:58
// @LINE:57
// @LINE:54
// @LINE:53
// @LINE:52
// @LINE:51
// @LINE:50
// @LINE:49
// @LINE:48
// @LINE:47
// @LINE:46
// @LINE:45
// @LINE:42
// @LINE:41
// @LINE:40
// @LINE:39
// @LINE:38
// @LINE:37
// @LINE:36
// @LINE:35
// @LINE:34
// @LINE:33
// @LINE:32
// @LINE:31
// @LINE:30
// @LINE:29
// @LINE:28
// @LINE:21
// @LINE:20
// @LINE:19
// @LINE:18
// @LINE:17
// @LINE:16
// @LINE:15
// @LINE:14
package com.sentrana.biq.controllers.javascript {
import ReverseRouteContext.empty

// @LINE:74
// @LINE:73
// @LINE:72
// @LINE:71
// @LINE:70
// @LINE:69
// @LINE:68
// @LINE:67
// @LINE:66
class ReverseReportService {


// @LINE:67
def getReport : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportService.getReport",
   """
      function(reportId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Report/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", reportId)})
      }
   """
)
                        

// @LINE:70
def deleteReport : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportService.deleteReport",
   """
      function(reportId) {
      return _wA({method:"DELETE", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Report/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", reportId)})
      }
   """
)
                        

// @LINE:71
def addReportComment : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportService.addReportComment",
   """
      function(reportId) {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ReportComment/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", reportId)})
      }
   """
)
                        

// @LINE:68
def addReport : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportService.addReport",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Report"})
      }
   """
)
                        

// @LINE:66
def getReports : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportService.getReports",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Reports"})
      }
   """
)
                        

// @LINE:72
def getReportComment : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportService.getReportComment",
   """
      function(reportId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ReportComment/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", reportId)})
      }
   """
)
                        

// @LINE:73
def editReportComment : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportService.editReportComment",
   """
      function(reportId,commentId) {
      return _wA({method:"PUT", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ReportComment/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", reportId) + "/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("commentId", commentId)})
      }
   """
)
                        

// @LINE:69
def editReport : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportService.editReport",
   """
      function(reportId) {
      return _wA({method:"PUT", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Report/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", reportId)})
      }
   """
)
                        

// @LINE:74
def deleteReportComment : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportService.deleteReportComment",
   """
      function(reportId,commentId) {
      return _wA({method:"DELETE", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ReportComment/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", reportId) + "/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("commentId", commentId)})
      }
   """
)
                        

}
              

// @LINE:60
// @LINE:59
// @LINE:58
// @LINE:57
class ReverseDerivedColumnService {


// @LINE:57
def validateFormula : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.DerivedColumnService.validateFormula",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ValidateFormula"})
      }
   """
)
                        

// @LINE:59
def deleteDerivedColumn : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.DerivedColumnService.deleteDerivedColumn",
   """
      function(columnId) {
      return _wA({method:"DELETE", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/DerivedColumn/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("columnId", encodeURIComponent(columnId))})
      }
   """
)
                        

// @LINE:60
def updateDerivedColumn : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.DerivedColumnService.updateDerivedColumn",
   """
      function(columnId) {
      return _wA({method:"PUT", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/DerivedColumn/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("columnId", encodeURIComponent(columnId))})
      }
   """
)
                        

// @LINE:58
def addDerivedColumn : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.DerivedColumnService.addDerivedColumn",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/DerivedColumn"})
      }
   """
)
                        

}
              

// @LINE:92
// @LINE:91
// @LINE:90
// @LINE:89
// @LINE:88
// @LINE:87
class ReverseReportSharingService {


// @LINE:87
def getAvailableRecipients : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportSharingService.getAvailableRecipients",
   """
      function(recipientsFor,repositoryid) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Users" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("recipientsFor", recipientsFor), (""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("repositoryid", repositoryid)])})
      }
   """
)
                        

// @LINE:91
def clearSharingInfoCache : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportSharingService.clearSharingInfoCache",
   """
      function(userId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ClearSharingInfoCache/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("userId", encodeURIComponent(userId))})
      }
   """
)
                        

// @LINE:88
def getReportRecipients : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportSharingService.getReportRecipients",
   """
      function(reportId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ReportRecipients/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", encodeURIComponent(reportId))})
      }
   """
)
                        

// @LINE:89
def getSharingUpdate : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportSharingService.getSharingUpdate",
   """
      function(userId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/GetSharingUpdate/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("userId", encodeURIComponent(userId))})
      }
   """
)
                        

// @LINE:92
def removeAllReportRecipients : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportSharingService.removeAllReportRecipients",
   """
      function(reportId) {
      return _wA({method:"DELETE", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ReportRecipients/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", encodeURIComponent(reportId))})
      }
   """
)
                        

// @LINE:90
def modifyReportRecipients : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportSharingService.modifyReportRecipients",
   """
      function(reportId) {
      return _wA({method:"PUT", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ReportRecipients/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("reportId", encodeURIComponent(reportId))})
      }
   """
)
                        

}
              

// @LINE:42
// @LINE:41
// @LINE:40
// @LINE:39
// @LINE:38
// @LINE:37
// @LINE:36
// @LINE:35
// @LINE:34
// @LINE:33
// @LINE:32
// @LINE:31
// @LINE:30
// @LINE:29
// @LINE:28
class ReverseMetadataService {


// @LINE:37
def downloadConfigFiles : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.downloadConfigFiles",
   """
      function(id) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/DownloadConfigurationFiles" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("id", id)])})
      }
   """
)
                        

// @LINE:32
def saveConfigFile : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.saveConfigFile",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/SaveConfigFile"})
      }
   """
)
                        

// @LINE:29
def readConfigFiles : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.readConfigFiles",
   """
      function(repoId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/ReadConfigFiles" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("repoId", repoId)])})
      }
   """
)
                        

// @LINE:36
def clearMetadataCache : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.clearMetadataCache",
   """
      function(repoId) {
      return _wA({method:"DELETE", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/MetadataCache/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("repoId", encodeURIComponent(repoId))})
      }
   """
)
                        

// @LINE:33
def saveAllConfigFiles : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.saveAllConfigFiles",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/SaveAllConfigFiles"})
      }
   """
)
                        

// @LINE:28
def getXmlRepositoryObjects : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.getXmlRepositoryObjects",
   """
      function(repoId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Repository/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("repoId", repoId)})
      }
   """
)
                        

// @LINE:40
def getRepoNameList : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.getRepoNameList",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/getRepoNameList"})
      }
   """
)
                        

// @LINE:30
def publishConfigChange : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.publishConfigChange",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/PublishConfigChange"})
      }
   """
)
                        

// @LINE:34
def uploadConfigFiles : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.uploadConfigFiles",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/UploadConfigFiles"})
      }
   """
)
                        

// @LINE:35
def getRepoList : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.getRepoList",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/GetRepoList"})
      }
   """
)
                        

// @LINE:41
def getRepo : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.getRepo",
   """
      function(id) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/getRepo" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("id", id)])})
      }
   """
)
                        

// @LINE:39
def getAttributeForm : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.getAttributeForm",
   """
      function(formId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/AttributeForm/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("formId", encodeURIComponent(formId))})
      }
   """
)
                        

// @LINE:42
def getRepositoryMetadata : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.getRepositoryMetadata",
   """
      function(repoId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/RepositoryMetadata/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("repoId", encodeURIComponent(repoId))})
      }
   """
)
                        

// @LINE:38
def deleteRepository : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.deleteRepository",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/DeleteRepository"})
      }
   """
)
                        

// @LINE:31
def saveRepository : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.MetadataService.saveRepository",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "MetadataService.svc/SaveRepository"})
      }
   """
)
                        

}
              

// @LINE:104
// @LINE:103
// @LINE:102
class ReverseSavedFilterGroupService {


// @LINE:104
def updateSavedFilterGroup : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SavedFilterGroupService.updateSavedFilterGroup",
   """
      function(filterGroupId) {
      return _wA({method:"PUT", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/SavedFilterGroup/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("filterGroupId", encodeURIComponent(filterGroupId))})
      }
   """
)
                        

// @LINE:103
def deleteSavedFilterGroup : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SavedFilterGroupService.deleteSavedFilterGroup",
   """
      function(filterGroupId) {
      return _wA({method:"DELETE", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/SavedFilterGroup/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("filterGroupId", encodeURIComponent(filterGroupId))})
      }
   """
)
                        

// @LINE:102
def addSavedFilterGroup : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SavedFilterGroupService.addSavedFilterGroup",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/SavedFilterGroup"})
      }
   """
)
                        

}
              

// @LINE:54
// @LINE:53
// @LINE:52
// @LINE:51
// @LINE:50
// @LINE:49
// @LINE:48
// @LINE:47
// @LINE:46
// @LINE:45
class ReverseReportingService {


// @LINE:47
def dropCache : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.dropCache",
   """
      function(cacheid) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/DropCache" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("cacheid", cacheid)])})
      }
   """
)
                        

// @LINE:48
def dropCaches : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.dropCaches",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/DropCaches"})
      }
   """
)
                        

// @LINE:45
def execute : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.execute",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Execute"})
      }
   """
)
                        

// @LINE:46
def getDrillOptions : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.getDrillOptions",
   """
      function(cacheid,sElems) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/GetDrillOptions" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("cacheid", cacheid), (""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("sElems", sElems)])})
      }
   """
)
                        

// @LINE:50
def exportToCsv : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.exportToCsv",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ExportToCsv"})
      }
   """
)
                        

// @LINE:52
def exportPivotTable : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.exportPivotTable",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ExportPivotTable"})
      }
   """
)
                        

// @LINE:53
def getMatchingElementPaths : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.getMatchingElementPaths",
   """
      function(str,form_id) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/GetMatchingElementPaths" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("str", str), (""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("form_id", form_id)])})
      }
   """
)
                        

// @LINE:51
def exportChart : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.exportChart",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ExportChart"})
      }
   """
)
                        

// @LINE:49
def dropCachesByRepository : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.dropCachesByRepository",
   """
      function(repositoryIds,username,password) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/DropCachesByRepository" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("repositoryIds", repositoryIds), (""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("username", username), (""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("password", password)])})
      }
   """
)
                        

// @LINE:54
def getChildElements : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ReportingService.getChildElements",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/GetChildElements"})
      }
   """
)
                        

}
              

// @LINE:108
// @LINE:107
class ReverseDashboardService {


// @LINE:107
def getDashboards : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.DashboardService.getDashboards",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Dashboards"})
      }
   """
)
                        

// @LINE:108
def addDashboard : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.DashboardService.addDashboard",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Dashboard"})
      }
   """
)
                        

}
              

// @LINE:83
// @LINE:82
// @LINE:81
// @LINE:80
// @LINE:79
// @LINE:78
class ReverseBookletService {


// @LINE:83
def copyBooklet : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletService.copyBooklet",
   """
      function(bookletId) {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Booklet/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("bookletId", encodeURIComponent(bookletId))})
      }
   """
)
                        

// @LINE:82
def deleteBooklet : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletService.deleteBooklet",
   """
      function(bookletId) {
      return _wA({method:"DELETE", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Booklet/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("bookletId", bookletId)})
      }
   """
)
                        

// @LINE:80
def addBooklet : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletService.addBooklet",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Booklet"})
      }
   """
)
                        

// @LINE:81
def editBooklet : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletService.editBooklet",
   """
      function(bookletId) {
      return _wA({method:"PUT", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Booklet/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("bookletId", encodeURIComponent(bookletId))})
      }
   """
)
                        

// @LINE:78
def getBooklets : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletService.getBooklets",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Booklets"})
      }
   """
)
                        

// @LINE:79
def getReports : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletService.getReports",
   """
      function(bookletId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Reports/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("bookletId", bookletId)})
      }
   """
)
                        

}
              

// @LINE:63
class ReverseActivityTrackingService {


// @LINE:63
def WriteActionLog : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.ActivityTrackingService.WriteActionLog",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/WriteActionLog"})
      }
   """
)
                        

}
              

// @LINE:21
// @LINE:20
// @LINE:19
// @LINE:18
// @LINE:17
// @LINE:16
// @LINE:15
// @LINE:14
class ReverseSecurityService {


// @LINE:21
def isValidToken : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SecurityService.isValidToken",
   """
      function(token) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SecurityService.svc/IsValidToken" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("token", token)])})
      }
   """
)
                        

// @LINE:16
def checkLogin : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SecurityService.checkLogin",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/ValidateSession"})
      }
   """
)
                        

// @LINE:15
def logout : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SecurityService.logout",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SecurityService.svc/logout"})
      }
   """
)
                        

// @LINE:20
def changeAutoGeneratedPassword : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SecurityService.changeAutoGeneratedPassword",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SecurityService.svc/ChangeAutoGeneratedPassword"})
      }
   """
)
                        

// @LINE:17
def changePassword : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SecurityService.changePassword",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SecurityService.svc/ChangePassword"})
      }
   """
)
                        

// @LINE:18
def forgotPassword : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SecurityService.forgotPassword",
   """
      function(emailAddress) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SecurityService.svc/ForgotPassword" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("emailAddress", emailAddress)])})
      }
   """
)
                        

// @LINE:19
def forgotUsername : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SecurityService.forgotUsername",
   """
      function(emailAddress) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SecurityService.svc/ForgotUsername" + _qS([(""" + implicitly[QueryStringBindable[String]].javascriptUnbind + """)("emailAddress", emailAddress)])})
      }
   """
)
                        

// @LINE:14
def login : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.SecurityService.login",
   """
      function() {
      return _wA({method:"POST", url:"""" + _prefix + { _defaultPrefix } + """" + "SecurityService.svc/login"})
      }
   """
)
                        

}
              

// @LINE:99
// @LINE:98
// @LINE:97
// @LINE:96
class ReverseBookletSharingService {


// @LINE:96
def getAvailableBookletRecipients : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletSharingService.getAvailableBookletRecipients",
   """
      function(bookletId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/Booklets/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("bookletId", encodeURIComponent(bookletId)) + "/PossibleRecipients"})
      }
   """
)
                        

// @LINE:98
def removeAllBookletRecipients : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletSharingService.removeAllBookletRecipients",
   """
      function(bookletId) {
      return _wA({method:"DELETE", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/BookletRecipients/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("bookletId", encodeURIComponent(bookletId))})
      }
   """
)
                        

// @LINE:97
def getBookletRecipients : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletSharingService.getBookletRecipients",
   """
      function(bookletId) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/BookletRecipients/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("bookletId", encodeURIComponent(bookletId))})
      }
   """
)
                        

// @LINE:99
def modifyBookletRecipients : JavascriptReverseRoute = JavascriptReverseRoute(
   "com.sentrana.biq.controllers.BookletSharingService.modifyBookletRecipients",
   """
      function(bookletId) {
      return _wA({method:"PUT", url:"""" + _prefix + { _defaultPrefix } + """" + "SqlGen.svc/BookletRecipients/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("bookletId", encodeURIComponent(bookletId))})
      }
   """
)
                        

}
              
}
        


// @LINE:11
package controllers.ref {


// @LINE:11
class ReverseAssets {


// @LINE:11
def at(path:String, file:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Assets.at(path, file), HandlerDef(this.getClass.getClassLoader, "", "controllers.Assets", "at", Seq(classOf[String], classOf[String]), "GET", """ Map static resources from the /public folder to the /public URL path""", _prefix + """public/$file<.+>""")
)
                      

}
                          
}
        

// @LINE:25
// @LINE:24
package com.sentrana.usermanagement.controllers.ref {


// @LINE:25
// @LINE:24
class ReverseSalesforceService {


// @LINE:25
def salesforceCallback(code:String, orgId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.usermanagement.controllers.SalesforceService.salesforceCallback(code, orgId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.usermanagement.controllers.SalesforceService", "salesforceCallback", Seq(classOf[String], classOf[String]), "GET", """""", _prefix + """SalesforceService.svc/SalesforceCallback/$orgId<[^/]+>""")
)
                      

// @LINE:24
def renderApp(orgId:String, loginUrl:Option[String]): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.usermanagement.controllers.SalesforceService.renderApp(orgId, loginUrl), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.usermanagement.controllers.SalesforceService", "renderApp", Seq(classOf[String], classOf[Option[String]]), "GET", """ Salesforce Integration""", _prefix + """SalesforceService.svc/RenderApp/$orgId<[^/]+>""")
)
                      

}
                          
}
        

// @LINE:108
// @LINE:107
// @LINE:104
// @LINE:103
// @LINE:102
// @LINE:99
// @LINE:98
// @LINE:97
// @LINE:96
// @LINE:92
// @LINE:91
// @LINE:90
// @LINE:89
// @LINE:88
// @LINE:87
// @LINE:83
// @LINE:82
// @LINE:81
// @LINE:80
// @LINE:79
// @LINE:78
// @LINE:74
// @LINE:73
// @LINE:72
// @LINE:71
// @LINE:70
// @LINE:69
// @LINE:68
// @LINE:67
// @LINE:66
// @LINE:63
// @LINE:60
// @LINE:59
// @LINE:58
// @LINE:57
// @LINE:54
// @LINE:53
// @LINE:52
// @LINE:51
// @LINE:50
// @LINE:49
// @LINE:48
// @LINE:47
// @LINE:46
// @LINE:45
// @LINE:42
// @LINE:41
// @LINE:40
// @LINE:39
// @LINE:38
// @LINE:37
// @LINE:36
// @LINE:35
// @LINE:34
// @LINE:33
// @LINE:32
// @LINE:31
// @LINE:30
// @LINE:29
// @LINE:28
// @LINE:21
// @LINE:20
// @LINE:19
// @LINE:18
// @LINE:17
// @LINE:16
// @LINE:15
// @LINE:14
package com.sentrana.biq.controllers.ref {


// @LINE:74
// @LINE:73
// @LINE:72
// @LINE:71
// @LINE:70
// @LINE:69
// @LINE:68
// @LINE:67
// @LINE:66
class ReverseReportService {


// @LINE:67
def getReport(reportId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportService.getReport(reportId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportService", "getReport", Seq(classOf[String]), "GET", """""", _prefix + """SqlGen.svc/Report/$reportId<.+>""")
)
                      

// @LINE:70
def deleteReport(reportId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportService.deleteReport(reportId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportService", "deleteReport", Seq(classOf[String]), "DELETE", """""", _prefix + """SqlGen.svc/Report/$reportId<.+>""")
)
                      

// @LINE:71
def addReportComment(reportId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportService.addReportComment(reportId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportService", "addReportComment", Seq(classOf[String]), "POST", """""", _prefix + """SqlGen.svc/ReportComment/$reportId<.+>""")
)
                      

// @LINE:68
def addReport(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportService.addReport(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportService", "addReport", Seq(), "POST", """""", _prefix + """SqlGen.svc/Report""")
)
                      

// @LINE:66
def getReports(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportService.getReports(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportService", "getReports", Seq(), "GET", """ Report Service""", _prefix + """SqlGen.svc/Reports""")
)
                      

// @LINE:72
def getReportComment(reportId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportService.getReportComment(reportId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportService", "getReportComment", Seq(classOf[String]), "GET", """""", _prefix + """SqlGen.svc/ReportComment/$reportId<.+>""")
)
                      

// @LINE:73
def editReportComment(reportId:String, commentId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportService.editReportComment(reportId, commentId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportService", "editReportComment", Seq(classOf[String], classOf[String]), "PUT", """""", _prefix + """SqlGen.svc/ReportComment/$reportId<.+>/$commentId<.+>""")
)
                      

// @LINE:69
def editReport(reportId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportService.editReport(reportId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportService", "editReport", Seq(classOf[String]), "PUT", """""", _prefix + """SqlGen.svc/Report/$reportId<.+>""")
)
                      

// @LINE:74
def deleteReportComment(reportId:String, commentId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportService.deleteReportComment(reportId, commentId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportService", "deleteReportComment", Seq(classOf[String], classOf[String]), "DELETE", """""", _prefix + """SqlGen.svc/ReportComment/$reportId<.+>/$commentId<.+>""")
)
                      

}
                          

// @LINE:60
// @LINE:59
// @LINE:58
// @LINE:57
class ReverseDerivedColumnService {


// @LINE:57
def validateFormula(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.DerivedColumnService.validateFormula(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.DerivedColumnService", "validateFormula", Seq(), "POST", """ Derived Column Service""", _prefix + """SqlGen.svc/ValidateFormula""")
)
                      

// @LINE:59
def deleteDerivedColumn(columnId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.DerivedColumnService.deleteDerivedColumn(columnId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.DerivedColumnService", "deleteDerivedColumn", Seq(classOf[String]), "DELETE", """""", _prefix + """SqlGen.svc/DerivedColumn/$columnId<[^/]+>""")
)
                      

// @LINE:60
def updateDerivedColumn(columnId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.DerivedColumnService.updateDerivedColumn(columnId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.DerivedColumnService", "updateDerivedColumn", Seq(classOf[String]), "PUT", """""", _prefix + """SqlGen.svc/DerivedColumn/$columnId<[^/]+>""")
)
                      

// @LINE:58
def addDerivedColumn(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.DerivedColumnService.addDerivedColumn(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.DerivedColumnService", "addDerivedColumn", Seq(), "POST", """""", _prefix + """SqlGen.svc/DerivedColumn""")
)
                      

}
                          

// @LINE:92
// @LINE:91
// @LINE:90
// @LINE:89
// @LINE:88
// @LINE:87
class ReverseReportSharingService {


// @LINE:87
def getAvailableRecipients(recipientsFor:String, repositoryid:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportSharingService.getAvailableRecipients(recipientsFor, repositoryid), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportSharingService", "getAvailableRecipients", Seq(classOf[String], classOf[String]), "GET", """""", _prefix + """SqlGen.svc/Users""")
)
                      

// @LINE:91
def clearSharingInfoCache(userId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportSharingService.clearSharingInfoCache(userId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportSharingService", "clearSharingInfoCache", Seq(classOf[String]), "GET", """""", _prefix + """SqlGen.svc/ClearSharingInfoCache/$userId<[^/]+>""")
)
                      

// @LINE:88
def getReportRecipients(reportId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportSharingService.getReportRecipients(reportId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportSharingService", "getReportRecipients", Seq(classOf[String]), "GET", """""", _prefix + """SqlGen.svc/ReportRecipients/$reportId<[^/]+>""")
)
                      

// @LINE:89
def getSharingUpdate(userId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportSharingService.getSharingUpdate(userId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportSharingService", "getSharingUpdate", Seq(classOf[String]), "GET", """""", _prefix + """SqlGen.svc/GetSharingUpdate/$userId<[^/]+>""")
)
                      

// @LINE:92
def removeAllReportRecipients(reportId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportSharingService.removeAllReportRecipients(reportId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportSharingService", "removeAllReportRecipients", Seq(classOf[String]), "DELETE", """""", _prefix + """SqlGen.svc/ReportRecipients/$reportId<[^/]+>""")
)
                      

// @LINE:90
def modifyReportRecipients(reportId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportSharingService.modifyReportRecipients(reportId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportSharingService", "modifyReportRecipients", Seq(classOf[String]), "PUT", """""", _prefix + """SqlGen.svc/ReportRecipients/$reportId<[^/]+>""")
)
                      

}
                          

// @LINE:42
// @LINE:41
// @LINE:40
// @LINE:39
// @LINE:38
// @LINE:37
// @LINE:36
// @LINE:35
// @LINE:34
// @LINE:33
// @LINE:32
// @LINE:31
// @LINE:30
// @LINE:29
// @LINE:28
class ReverseMetadataService {


// @LINE:37
def downloadConfigFiles(id:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.downloadConfigFiles(id), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "downloadConfigFiles", Seq(classOf[String]), "GET", """""", _prefix + """MetadataService.svc/DownloadConfigurationFiles""")
)
                      

// @LINE:32
def saveConfigFile(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.saveConfigFile(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "saveConfigFile", Seq(), "POST", """""", _prefix + """MetadataService.svc/SaveConfigFile""")
)
                      

// @LINE:29
def readConfigFiles(repoId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.readConfigFiles(repoId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "readConfigFiles", Seq(classOf[String]), "GET", """""", _prefix + """MetadataService.svc/ReadConfigFiles""")
)
                      

// @LINE:36
def clearMetadataCache(repoId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.clearMetadataCache(repoId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "clearMetadataCache", Seq(classOf[String]), "DELETE", """""", _prefix + """MetadataService.svc/MetadataCache/$repoId<[^/]+>""")
)
                      

// @LINE:33
def saveAllConfigFiles(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.saveAllConfigFiles(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "saveAllConfigFiles", Seq(), "POST", """""", _prefix + """MetadataService.svc/SaveAllConfigFiles""")
)
                      

// @LINE:28
def getXmlRepositoryObjects(repoId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.getXmlRepositoryObjects(repoId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "getXmlRepositoryObjects", Seq(classOf[String]), "GET", """ Metadata Service""", _prefix + """SqlGen.svc/Repository/$repoId<.+>""")
)
                      

// @LINE:40
def getRepoNameList(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.getRepoNameList(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "getRepoNameList", Seq(), "GET", """""", _prefix + """MetadataService.svc/getRepoNameList""")
)
                      

// @LINE:30
def publishConfigChange(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.publishConfigChange(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "publishConfigChange", Seq(), "POST", """""", _prefix + """MetadataService.svc/PublishConfigChange""")
)
                      

// @LINE:34
def uploadConfigFiles(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.uploadConfigFiles(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "uploadConfigFiles", Seq(), "POST", """""", _prefix + """MetadataService.svc/UploadConfigFiles""")
)
                      

// @LINE:35
def getRepoList(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.getRepoList(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "getRepoList", Seq(), "GET", """""", _prefix + """MetadataService.svc/GetRepoList""")
)
                      

// @LINE:41
def getRepo(id:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.getRepo(id), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "getRepo", Seq(classOf[String]), "GET", """""", _prefix + """MetadataService.svc/getRepo""")
)
                      

// @LINE:39
def getAttributeForm(formId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.getAttributeForm(formId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "getAttributeForm", Seq(classOf[String]), "GET", """""", _prefix + """MetadataService.svc/AttributeForm/$formId<[^/]+>""")
)
                      

// @LINE:42
def getRepositoryMetadata(repoId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.getRepositoryMetadata(repoId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "getRepositoryMetadata", Seq(classOf[String]), "GET", """""", _prefix + """MetadataService.svc/RepositoryMetadata/$repoId<[^/]+>""")
)
                      

// @LINE:38
def deleteRepository(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.deleteRepository(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "deleteRepository", Seq(), "POST", """""", _prefix + """MetadataService.svc/DeleteRepository""")
)
                      

// @LINE:31
def saveRepository(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.MetadataService.saveRepository(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.MetadataService", "saveRepository", Seq(), "POST", """""", _prefix + """MetadataService.svc/SaveRepository""")
)
                      

}
                          

// @LINE:104
// @LINE:103
// @LINE:102
class ReverseSavedFilterGroupService {


// @LINE:104
def updateSavedFilterGroup(filterGroupId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SavedFilterGroupService.updateSavedFilterGroup(filterGroupId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SavedFilterGroupService", "updateSavedFilterGroup", Seq(classOf[String]), "PUT", """""", _prefix + """SqlGen.svc/SavedFilterGroup/$filterGroupId<[^/]+>""")
)
                      

// @LINE:103
def deleteSavedFilterGroup(filterGroupId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SavedFilterGroupService.deleteSavedFilterGroup(filterGroupId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SavedFilterGroupService", "deleteSavedFilterGroup", Seq(classOf[String]), "DELETE", """""", _prefix + """SqlGen.svc/SavedFilterGroup/$filterGroupId<[^/]+>""")
)
                      

// @LINE:102
def addSavedFilterGroup(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SavedFilterGroupService.addSavedFilterGroup(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SavedFilterGroupService", "addSavedFilterGroup", Seq(), "POST", """ Saved Filter Group Service""", _prefix + """SqlGen.svc/SavedFilterGroup""")
)
                      

}
                          

// @LINE:54
// @LINE:53
// @LINE:52
// @LINE:51
// @LINE:50
// @LINE:49
// @LINE:48
// @LINE:47
// @LINE:46
// @LINE:45
class ReverseReportingService {


// @LINE:47
def dropCache(cacheid:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.dropCache(cacheid), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "dropCache", Seq(classOf[String]), "GET", """""", _prefix + """SqlGen.svc/DropCache""")
)
                      

// @LINE:48
def dropCaches(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.dropCaches(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "dropCaches", Seq(), "GET", """""", _prefix + """SqlGen.svc/DropCaches""")
)
                      

// @LINE:45
def execute(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.execute(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "execute", Seq(), "POST", """ Reporting Serivce""", _prefix + """SqlGen.svc/Execute""")
)
                      

// @LINE:46
def getDrillOptions(cacheid:String, sElems:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.getDrillOptions(cacheid, sElems), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "getDrillOptions", Seq(classOf[String], classOf[String]), "GET", """""", _prefix + """SqlGen.svc/GetDrillOptions""")
)
                      

// @LINE:50
def exportToCsv(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.exportToCsv(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "exportToCsv", Seq(), "POST", """""", _prefix + """SqlGen.svc/ExportToCsv""")
)
                      

// @LINE:52
def exportPivotTable(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.exportPivotTable(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "exportPivotTable", Seq(), "POST", """""", _prefix + """SqlGen.svc/ExportPivotTable""")
)
                      

// @LINE:53
def getMatchingElementPaths(str:String, form_id:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.getMatchingElementPaths(str, form_id), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "getMatchingElementPaths", Seq(classOf[String], classOf[String]), "GET", """""", _prefix + """SqlGen.svc/GetMatchingElementPaths""")
)
                      

// @LINE:51
def exportChart(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.exportChart(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "exportChart", Seq(), "POST", """""", _prefix + """SqlGen.svc/ExportChart""")
)
                      

// @LINE:49
def dropCachesByRepository(repositoryIds:String, username:String, password:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.dropCachesByRepository(repositoryIds, username, password), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "dropCachesByRepository", Seq(classOf[String], classOf[String], classOf[String]), "GET", """""", _prefix + """SqlGen.svc/DropCachesByRepository""")
)
                      

// @LINE:54
def getChildElements(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ReportingService.getChildElements(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ReportingService", "getChildElements", Seq(), "POST", """""", _prefix + """SqlGen.svc/GetChildElements""")
)
                      

}
                          

// @LINE:108
// @LINE:107
class ReverseDashboardService {


// @LINE:107
def getDashboards(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.DashboardService.getDashboards(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.DashboardService", "getDashboards", Seq(), "GET", """ Dashboard Services""", _prefix + """SqlGen.svc/Dashboards""")
)
                      

// @LINE:108
def addDashboard(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.DashboardService.addDashboard(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.DashboardService", "addDashboard", Seq(), "POST", """""", _prefix + """SqlGen.svc/Dashboard""")
)
                      

}
                          

// @LINE:83
// @LINE:82
// @LINE:81
// @LINE:80
// @LINE:79
// @LINE:78
class ReverseBookletService {


// @LINE:83
def copyBooklet(bookletId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletService.copyBooklet(bookletId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletService", "copyBooklet", Seq(classOf[String]), "POST", """""", _prefix + """SqlGen.svc/Booklet/$bookletId<[^/]+>""")
)
                      

// @LINE:82
def deleteBooklet(bookletId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletService.deleteBooklet(bookletId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletService", "deleteBooklet", Seq(classOf[String]), "DELETE", """""", _prefix + """SqlGen.svc/Booklet/$bookletId<.+>""")
)
                      

// @LINE:80
def addBooklet(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletService.addBooklet(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletService", "addBooklet", Seq(), "POST", """""", _prefix + """SqlGen.svc/Booklet""")
)
                      

// @LINE:81
def editBooklet(bookletId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletService.editBooklet(bookletId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletService", "editBooklet", Seq(classOf[String]), "PUT", """""", _prefix + """SqlGen.svc/Booklet/$bookletId<[^/]+>""")
)
                      

// @LINE:78
def getBooklets(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletService.getBooklets(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletService", "getBooklets", Seq(), "GET", """""", _prefix + """SqlGen.svc/Booklets""")
)
                      

// @LINE:79
def getReports(bookletId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletService.getReports(bookletId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletService", "getReports", Seq(classOf[String]), "GET", """""", _prefix + """SqlGen.svc/Reports/$bookletId<.+>""")
)
                      

}
                          

// @LINE:63
class ReverseActivityTrackingService {


// @LINE:63
def WriteActionLog(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.ActivityTrackingService.WriteActionLog(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.ActivityTrackingService", "WriteActionLog", Seq(), "POST", """ Action Log""", _prefix + """SqlGen.svc/WriteActionLog""")
)
                      

}
                          

// @LINE:21
// @LINE:20
// @LINE:19
// @LINE:18
// @LINE:17
// @LINE:16
// @LINE:15
// @LINE:14
class ReverseSecurityService {


// @LINE:21
def isValidToken(token:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SecurityService.isValidToken(token), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SecurityService", "isValidToken", Seq(classOf[String]), "GET", """""", _prefix + """SecurityService.svc/IsValidToken""")
)
                      

// @LINE:16
def checkLogin(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SecurityService.checkLogin(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SecurityService", "checkLogin", Seq(), "GET", """""", _prefix + """SqlGen.svc/ValidateSession""")
)
                      

// @LINE:15
def logout(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SecurityService.logout(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SecurityService", "logout", Seq(), "GET", """""", _prefix + """SecurityService.svc/logout""")
)
                      

// @LINE:20
def changeAutoGeneratedPassword(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SecurityService.changeAutoGeneratedPassword(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SecurityService", "changeAutoGeneratedPassword", Seq(), "POST", """""", _prefix + """SecurityService.svc/ChangeAutoGeneratedPassword""")
)
                      

// @LINE:17
def changePassword(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SecurityService.changePassword(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SecurityService", "changePassword", Seq(), "POST", """""", _prefix + """SecurityService.svc/ChangePassword""")
)
                      

// @LINE:18
def forgotPassword(emailAddress:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SecurityService.forgotPassword(emailAddress), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SecurityService", "forgotPassword", Seq(classOf[String]), "GET", """""", _prefix + """SecurityService.svc/ForgotPassword""")
)
                      

// @LINE:19
def forgotUsername(emailAddress:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SecurityService.forgotUsername(emailAddress), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SecurityService", "forgotUsername", Seq(classOf[String]), "GET", """""", _prefix + """SecurityService.svc/ForgotUsername""")
)
                      

// @LINE:14
def login(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.SecurityService.login(), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.SecurityService", "login", Seq(), "POST", """ Security Services Replaced by modular user management""", _prefix + """SecurityService.svc/login""")
)
                      

}
                          

// @LINE:99
// @LINE:98
// @LINE:97
// @LINE:96
class ReverseBookletSharingService {


// @LINE:96
def getAvailableBookletRecipients(bookletId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletSharingService.getAvailableBookletRecipients(bookletId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletSharingService", "getAvailableBookletRecipients", Seq(classOf[String]), "GET", """""", _prefix + """SqlGen.svc/Booklets/$bookletId<[^/]+>/PossibleRecipients""")
)
                      

// @LINE:98
def removeAllBookletRecipients(bookletId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletSharingService.removeAllBookletRecipients(bookletId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletSharingService", "removeAllBookletRecipients", Seq(classOf[String]), "DELETE", """""", _prefix + """SqlGen.svc/BookletRecipients/$bookletId<[^/]+>""")
)
                      

// @LINE:97
def getBookletRecipients(bookletId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletSharingService.getBookletRecipients(bookletId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletSharingService", "getBookletRecipients", Seq(classOf[String]), "GET", """""", _prefix + """SqlGen.svc/BookletRecipients/$bookletId<[^/]+>""")
)
                      

// @LINE:99
def modifyBookletRecipients(bookletId:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   com.sentrana.biq.controllers.BookletSharingService.modifyBookletRecipients(bookletId), HandlerDef(this.getClass.getClassLoader, "", "com.sentrana.biq.controllers.BookletSharingService", "modifyBookletRecipients", Seq(classOf[String]), "PUT", """""", _prefix + """SqlGen.svc/BookletRecipients/$bookletId<[^/]+>""")
)
                      

}
                          
}
        
    