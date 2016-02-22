package com.sentrana.usermanagement.controllers

import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.Calendar

import scala.collection.JavaConversions._

import play.Configuration
import play.api.Play
import play.api.Play.current
import play.api.mvc.{ DiscardingCookie, Result }

import org.joda.time.DateTime
import org.json4s.native.Serialization._

import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.logging.{ PlayLoggerComponent, LoggerComponent, Logging }
import com.sentrana.appshell.utils.{ ConfigurationUtil, MailService }
import com.sentrana.usermanagement.authentication._
import com.sentrana.usermanagement.controllers.JsonFormat.formats
import com.sentrana.usermanagement.datacontract._
import com.sentrana.usermanagement.domain.document._

/**
 * @author Sheng Zhao
 *
 */
trait SecurityService extends BaseController with Authentication with Logging {
  this: LoggerComponent =>

  // Application Identifier.
  val applicationId: String = Play.current.configuration.getString("application_id").getOrElse("")

  lazy val timeoutSetting = Play.configuration.getInt("SessionTimeoutMinutes").getOrElse(60)

  /**
   * Validate user credentials
   * @return
   */
  def login() = Action(parse.json) { implicit request =>
    val userName = (request.body \ "userName").as[String]
    val pass = (request.body \ "password").as[String]
    logger.info(s"Attempting login for user: $userName")
    try {
      val userSession = SecurityManager.createSession(userName, pass)
      (for {
        app <- userSession.applications.find{ _.id == applicationId }
        _ <- UMDataServices.getUserApplicationRoles(userSession.user, app.id).headOption
      } yield {
        logger.info(s"Login succeeded for user: $userName")
        returnValidSession(userSession)
      }) getOrElse {
        throw new UnauthorizedApplicationAccessException(userName)
      }
    }
    catch {
      case ex: Exception =>
        logger.info(s"Login failed for user: $userName")
        throw ex
    }
  }

  /**
   * Validate user session. This service is called when the user has valid session so they don't need to log in again.
   * @return
   */
  def checkLogin() = AuthAction(parse.anyContent) { request =>
    returnValidSession(request.userSession)
  }

  private def returnValidSession(userSession: UserSession): Result = {
    val sessionDto = createSessionInfo(userSession)
    val timeout = DateTime.now.plusMinutes(timeoutSetting)
    Ok(write(sessionDto)).withCookies(
      BaseDomainCookie("sessionId", sessionDto.sessionId),
      BaseDomainCookie("timeout", URLEncoder.encode(timeout.toString, "UTF-8")),
      BaseDomainCookie("userName", userSession.user.userName),
      BaseDomainCookie("userID", userSession.user.id.toString),
      BaseDomainCookie("applicationId", applicationId)
    )
  }

  /**
   * Creating required info of user which are required just after login
   * @param userSession >user's session information
   * @return
   */
  def createSessionInfo(userSession: UserSession): BaseSessionInfo = {
    val appRoles = userSession.user.appRoles.toList
    val isUnrestrictedAdmin: Boolean = appRoles.exists(applicationRole => applicationRole.id == EnumApplicationRoles.UNRESTRICTED_USER_ADMIN.toString)

    //Creating Session Info object for logged in user
    val userInfo = UMDocumentServiceUtil.convertUserToUserInfo(userSession.user)
    val orgInfo = UMDocumentServiceUtil.convertOrganizationToOrganizationInfo(userSession.organization)
    new SessionInfo(userSession.sessionToken.id, userInfo, orgInfo, isUnrestrictedAdmin)
  }

  /**
   * This is a method used in User Management application.
   * TODO Probably we can remove it from here later.
   * @return
   */
  def hasConnection() = Action {
    Ok("true")
  }

  /**
   * This is a method used in User Management application.
   * @return
   */
  def getConnections() = AuthAction {
    val maybeMongoConfig = Option(Configuration.root().getConfig("mongodb-mdr"))
    val mongoConnectionList = maybeMongoConfig map { config =>
      val mongoKeys: Set[String] = config.subKeys.toSet
      mongoKeys.map{ x => KeyValuePair(x, "MongoDB") }
    } getOrElse Set()

    val maybeDBConfig = Option(Configuration.root().getConfig("db"))
    maybeDBConfig map { config =>
      val dbKeys: Set[String] = config.subKeys.toSet
      val connectionList = dbKeys.map{ x => KeyValuePair(x, "SQL") }
      Ok(write(connectionList ++ mongoConnectionList))
    } getOrElse {
      Ok(write(mongoConnectionList))
    }
  }

  /**
   * Log out application.
   * @return
   */
  def logout() = AuthAction { request =>
    SecurityManager.closeSession(request.userSession.sessionToken.id)
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString))).discardingCookies(
      DiscardingCookie("sessionId"),
      DiscardingCookie("timeout"),
      DiscardingCookie("userName"),
      DiscardingCookie("userID")
    )
  }

  /**
   * Change user password.
   * @return
   */
  def changePassword() = AuthAction(parse.json) { request =>
    val newPasswordInfo = read[ChangePassword](request.body.toString())
    val user = UMDataServices.getActiveUser("userName", newPasswordInfo.userName) getOrElse {
      throw new UserNameNotFoundException(newPasswordInfo.userName)
    }
    if (!SecurityManager.checkPassword(user.password, newPasswordInfo.currentPassword)) {
      throw new WrongPasswordException(user.userName)
    }
    SecurityManager.changePasswordWithPolicy(user, newPasswordInfo.newPassword)
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, ApplicationMessages.PasswordUpdated)))
  }

  def changeAutoGeneratedPassword() = Action(parse.json) { request =>
    val passwordInfo = read[ChangeAutoGeneratedPassword](request.body.toString())
    val passwordResetRequest = UMDataServices.getPasswordResetRequest(passwordInfo.token) getOrElse {
      throw new PasswordResetTokenNotFoundException(passwordInfo.token)
    }
    val user = UMDataServices.getActiveUser("id", passwordResetRequest.userId) getOrElse {
      throw new UserIdNotFoundException(passwordResetRequest.userId)
    }
    SecurityManager.changeAutoGeneratedPassword(user, passwordInfo, passwordResetRequest)
    sendEmail("PasswordResetConfirmationMail", user, None)
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, "Password updated successfully!")))
  }

  def forgotPassword(emailAddress: String) = Action { request =>
    val user = getUserByEmailAddress(emailAddress)
    val passwordResetRequest = SecurityManager.createPasswordResetRequest(user)
    val appUrl = getAppUrl
    sendEmail("PasswordResetMail", user, Some(passwordResetRequest), appUrl)
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString)))
  }

  def forgotUsername(emailAddress: String) = Action { request =>
    val user = getUserByEmailAddress(emailAddress)
    val appUrl = getAppUrl
    sendEmail("ForgotUsernameMail", user, None, appUrl)
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString)))
  }

  /**
   * Send Email for Forget username and or password
   * @param emailTemplate email template name
   * @param user Current user
   * @param passwordResetRequest Password reset request
   * @param appUrl Application URL
   * @return
   */
  private def sendEmail(emailTemplate: String, user: User, passwordResetRequest: Option[PasswordResetRequest], appUrl: String = "") = {
    val senderName = ConfigurationUtil.getAppSettingValue("EmailSenderName")
    val senderAddress = ConfigurationUtil.getAppSettingValue("SupportEmail")
    val timeOut = ConfigurationUtil.getAppSettingValue("PasswordResetLinkTimeout").toInt

    val userName = user.userName
    val toAddress = user.email
    val receiverName = user.firstName.trim()

    val (messageBody, subject) = emailTemplate match {
      case "ForgotUsernameMail" =>
        // forgot user name or email request
        // @(userName: String, firstName: String, link: String)
        (views.html.emails.ForgotUsernameMail(userName, receiverName, appUrl), "Your Application Username")
      case "PasswordResetMail" =>
        val securityCode = passwordResetRequest.get.securityCode
        val passwordResetLink = getPasswordResetUrl(appUrl, passwordResetRequest.get.requestToken)
        // password reset request
        // @(firstName: String, link: String, securityCode: String, timeout: Int)
        (views.html.emails.PasswordResetMail(receiverName, passwordResetLink, securityCode, timeOut), "Your Change Password Link")
      case "PasswordResetConfirmationMail" =>
        // password reset request
        // @(firstName: String, changedDateTime: String)
        val passwordResetConfirmationMailDateFormat = ConfigurationUtil.getAppSettingValue("PasswordResetConfirmationMailDateFormat")
        val currentDateTime = new SimpleDateFormat(passwordResetConfirmationMailDateFormat).format(Calendar.getInstance().getTime())
        (views.html.emails.PasswordResetConfirmationMail(receiverName, currentDateTime), "Your Change Password Link")
    }
    MailService.sendHtmlFormattedEmail(subject, messageBody.toString, senderName, receiverName, senderAddress, toAddress)
  }

  def isValidToken(token: String) = Action { implicit request =>
    val passwordResetRequest = UMDataServices.getPasswordResetRequest(token) getOrElse {
      throw new PasswordResetTokenNotFoundException(token)
    }
    if (SecurityManager.isPasswordResetLinkExpired(passwordResetRequest)) {
      throw new PasswordResetLinkExpiredException(token)
    }
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, "This is a valid token!")))
  }

  private def getUserByEmailAddress(emailAddress: String): User = {
    UMDataServices.getActiveUser("email", emailAddress) getOrElse {
      throw new UserEmailNotFoundException(emailAddress)
    }
  }

  def getAppUrl: String = {
    ConfigurationUtil.getAppSettingValue("ApplicationUrl")
  }

  private def getPasswordResetUrl(appUrl: String, token: String): String = {
    s"$appUrl/#!resetpassword?token=$token"
  }
}

object SecurityService extends SecurityService with PlayLoggerComponent
