package com.sentrana.biq.controllers

import scala.concurrent.Future

import play.api.mvc.{ ActionBuilder, Request, Result, WrappedRequest }

import com.sentrana.appshell.controllers.BaseController
import com.sentrana.biq.core.Repository
import com.sentrana.biq.exceptions.NoRepositoryIDInRequestException
import com.sentrana.usermanagement.authentication.UserSession
import com.sentrana.usermanagement.controllers.Authentication

/**
 * Created by joshuahagins on 7/6/15.
 */
trait RepoAccess {
  this: BaseController with Authentication =>

  object RepoAction extends RepoAction(None) {
    def apply(repoID: String) = new RepoAction(Some(repoID))
  }

  case class RepoAction(repositoryID: Option[String]) extends HasRepository with ErrorHandling[RepositoryRequest]

  case class RepositoryRequest[A](
    userSession: UserSession,
    repository:  Repository,
    request:     Request[A]
  ) extends WrappedRequest[A](request)

  trait HasRepository extends ActionBuilder[RepositoryRequest] {
    val repositoryID: Option[String]

    def invokeBlock[A](request: Request[A], block: (RepositoryRequest[A]) => Future[Result]) = {
      val sessionRequestHandler = { (req: UserSessionRequest[A]) =>
        val repoID = repositoryID getOrElse getRepositoryID(req)
        val repository = BIQServiceUtil.getRepository(req.userSession.user, repoID)
        block(RepositoryRequest(req.userSession, repository, req))
      }
      AuthAction.invokeBlock(request, sessionRequestHandler)
    }

    private def getRepositoryID[A](request: Request[A]): String = {
      request.getQueryString("repositoryid")
        .orElse(request.headers.get("RepositoryID"))
        .getOrElse(throw new NoRepositoryIDInRequestException)
    }
  }
}
