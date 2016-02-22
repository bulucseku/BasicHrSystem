package com.sentrana.usermanagement.controllers

import scala.concurrent.Future

import play.api.mvc.{ ActionBuilder, Request, Result, WrappedRequest }

import com.sentrana.appshell.controllers.BaseController
import com.sentrana.usermanagement.authentication.{ InvalidSessionException, NoSessionTokenException, SecurityManager, UserSession }

trait Authentication {
  this: BaseController =>

  object AuthAction extends HasSession with ErrorHandling[UserSessionRequest]

  case class UserSessionRequest[A](userSession: UserSession, request: Request[A]) extends WrappedRequest[A](request)

  trait HasSession extends ActionBuilder[UserSessionRequest] {
    def invokeBlock[A](request: Request[A], block: (UserSessionRequest[A]) => Future[Result]) = {
      val session = SecurityManager.getSession(request)
      block(UserSessionRequest(session, request))
    }
  }
}
