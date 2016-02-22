package com.sentrana.appshell.controllers

import scala.concurrent.Future
import scala.language.higherKinds
import scala.util.control.NonFatal

import play.api.mvc.{ ActionBuilder, Controller, Request, Result }

import com.sentrana.appshell.logging.{ LoggerComponent, Logging }
import com.sentrana.appshell.utils.ExceptionUtil

/**
 * Created by joshuahagins on 6/24/15.
 */
trait BaseController extends Controller with Logging {
  this: LoggerComponent =>

  object Action extends SimpleAction with ErrorHandling[Request]

  trait SimpleAction extends ActionBuilder[Request] {
    def invokeBlock[A](request: Request[A], block: (Request[A]) => Future[Result]) = {
      block(request)
    }
  }

  trait ErrorHandling[R[_] <: Request[_]] extends ActionBuilder[R] {
    abstract override def invokeBlock[A](request: Request[A], block: (R[A]) => Future[Result]) = {
      try super.invokeBlock(request, block)
      catch {
        case NonFatal(e) => Future.successful(ExceptionUtil.generateServiceError(e))
      }
    }
  }
}
