package com.sentrana.usermanagement.controllers

import com.sentrana.usermanagement.datacontract.BaseDomainCookie
import play.api.mvc.Cookie

import com.force.api._
import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.logging.{ LoggerComponent, Logging, PlayLoggerComponent }
import com.sentrana.appshell.utils.ConfigurationUtil
import com.sentrana.usermanagement.authentication._
import com.sentrana.usermanagement.domain.document._

/**
 * Created by szhao on 11/18/2014.
 */
trait SalesforceService extends BaseController with Logging {
  this: LoggerComponent =>

  // Construct salesforceLoginUrl, the parameter value should be encoded.
  val appRedirectUri = ConfigurationUtil.getAppSettingValue("sf.integration.redirectURI")
  val appName = ConfigurationUtil.getAppSettingValue("sf.integration.appName")
  val sentranaUserNameFieldName = ConfigurationUtil.getAppSettingValue("sf.integration.sentranaUserNameFieldName")
  val appURL = ConfigurationUtil.getAppSettingValue("sf.integration.appUrl")
  val salesforceMainPage = ConfigurationUtil.getAppSettingValue("sf.integration.salesforceMainPage")
  val appContext = ConfigurationUtil.getAppSettingValue("application.context")
  val salesforceAccountRefreshTokenDict = collection.mutable.Map[String, ApiSession]()

  val clientIdFilterId = appName.toUpperCase + "_SALESFORCE_CLIENT_ID"
  val clientSecretFilterId = appName.toUpperCase + "_SALESFORCE_CLIENT_SECRET"

  /**
   * This is the initial end point for Dashboard integration.
   * Dashboard will redirect the user to Salesforce.com login screen.
   * Once the user authorizes Dashboard to access Salesforce information on behalf of himself, which will only happen for the first time,
   * Salesforce.com will finally redirect the user to the address specified in redirect_uri.
   * @return
   */
  def renderApp(orgId: String, loginEndpoint: Option[String]) = Action { implicit request =>
    val authRequest = new AuthorizationRequest()
    loginEndpoint.foreach(url => SalesforceService.OrgLoginEndpoints(orgId) = url)
    val apiConfigStart = createApiConfig(orgId, loginEndpoint)
    authRequest.apiConfig(apiConfigStart).state("auth_start")
    val salesforceLoginUrl = Auth.startOAuthWebServerFlow(authRequest)
    Redirect(salesforceLoginUrl)
  }

  private def getClientId(orgId: String) = {
    val dataFilterElements = UMDataServices.getOrgFilterElements(orgId, clientIdFilterId)
    dataFilterElements.headOption.getOrElse(
      throw new SalesforceClientIdNotFoundException(orgId)
    )
  }

  private def getClientSecret(orgId: String) = {
    val dataFilterElements = UMDataServices.getOrgFilterElements(orgId, clientSecretFilterId)
    dataFilterElements.headOption.getOrElse(
      throw new SalesforceClientSecretNotFoundException(orgId)
    )
  }

  /**
   * This is the redirect uri defined in Salesforce.com for this app integration.
   * The purpose of this service is to access authentication code from Salesforce.com and use the code to get access token.
   * Then this service will redirect the client browser to the main application entrance for this integration.
   * @param authCode This application needs to send this auth code to Salesforce in order to get access token for later on information access operations.
   * @return
   */
  def salesforceCallback(authCode: String, orgId: String) = Action { implicit request =>
    // val api = new ForceApi(apiConfigComplete, session)
    val userNameInCookie = request.cookies.get("userName")
    val userName = userNameInCookie.map(_.value)
      .filter(salesforceAccountRefreshTokenDict.contains)
      // Need to create new session
      // This is the first time we request access token for this account. This could happen when userName is empty.
      .getOrElse(createApiSession(authCode, orgId))
    logger.debug(s"$userName just logged in through Salesforce OAuth.")

    // Create valid session for this user.
    try {
      val s = SecurityManager.createSession(userName)
      SecurityManager.saveSession(s)
      val sessionId = s.sessionToken.id

      // Save user name and session ID back to the client side via cookie
      val userNameCookie = BaseDomainCookie("userName", userName, httpOnly = false)
      val sessionIdCookie = BaseDomainCookie("sessionId", sessionId, httpOnly = false)

      // At the end, after valid session is created, we need to redirect the user to main Dashboard screen.
      Redirect(s"$appURL$salesforceMainPage").withCookies(userNameCookie, sessionIdCookie)
    }
    catch {
      case e: UserNameNotFoundException => throw new SalesforceUserNameNotFoundException(userName)
    }
  }

  private def createApiConfig(orgId: String, loginEndpoint: Option[String]): ApiConfig = {
    val clientId = getClientId(orgId)
    val clientSecret = getClientSecret(orgId)
    val apiConfig = new ApiConfig().setClientId(clientId)
      .setClientSecret(clientSecret)
      .setRedirectURI(s"$appURL$appContext$appRedirectUri$orgId")
    loginEndpoint.foreach(apiConfig.setLoginEndpoint)

    apiConfig
  }

  /**
   * This method create api session using auth code and return sentrana app user name.
   * @param authCode
   * @return
   */
  private def createApiSession(authCode: String, orgId: String): String = {
    val apiConfig = createApiConfig(orgId, SalesforceService.OrgLoginEndpoints.get(orgId))
    val authResponse = new AuthorizationResponse().apiConfig(apiConfig).code(authCode)
    val session = Auth.completeOAuthWebServerFlow(authResponse)
    val api = new ForceApi(apiConfig, session)
    val account = api.getSObject("User", api.getIdentity.getUserId).asMap()
    val userName = Option(account.get(sentranaUserNameFieldName)).map(_.toString).getOrElse("")
    salesforceAccountRefreshTokenDict += (userName -> session)
    userName
  }
}

object SalesforceService extends SalesforceService with PlayLoggerComponent {
  val OrgLoginEndpoints = scala.collection.mutable.Map[String, String]()
}
