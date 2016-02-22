package com.sentrana.usermanagement.controllers

import scala.concurrent.Future

import play.api.mvc.{ Request, Result }

import com.sentrana.appshell.controllers.BaseController
import com.sentrana.usermanagement.authentication.{ SecurityManager, UserSession }
import com.sentrana.usermanagement.datacontract.EnumApplicationRoles

trait Authorization {
  this: BaseController with Authentication =>

  case class RoleAction(appRole: EnumApplicationRoles.Value) extends HasRole with ErrorHandling[UserSessionRequest]
  case class OrgAction(orgId: String) extends HasOrg with ErrorHandling[UserSessionRequest]

  trait HasRole extends HasAuthorization {
    val appRole: EnumApplicationRoles.Value

    def authorizeSession(userSession: UserSession): Unit = {
      SecurityManager.requireRole(userSession.user, appRole)
    }
  }

  trait HasOrg extends HasAuthorization {
    val orgId: String

    def authorizeSession(userSession: UserSession): Unit = {
      SecurityManager.requireAdminOrValidOrg(userSession.user, orgId)
    }
  }

  trait HasAuthorization extends HasSession {
    override def invokeBlock[A](request: Request[A], block: (UserSessionRequest[A]) => Future[Result]) = {
      val sessionRequestHandler = { (req: UserSessionRequest[A]) =>
        authorizeSession(req.userSession)
        block(req)
      }
      super.invokeBlock(request, sessionRequestHandler)
    }

    def authorizeSession(userSession: UserSession): Unit
  }
}
