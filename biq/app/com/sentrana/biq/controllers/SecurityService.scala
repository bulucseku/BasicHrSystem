package com.sentrana.biq.controllers

import com.sentrana.appshell.logging.{ LoggerComponent, PlayLoggerComponent }
import com.sentrana.biq.datacontract.{ BIQSessionInfo, UserRepository }
import com.sentrana.biq.metadata.MetadataRepository
import com.sentrana.usermanagement.authentication.UserSession
import com.sentrana.usermanagement.controllers.{ SecurityService => BaseSecurityService, UMDocumentServiceUtil }
import com.sentrana.usermanagement.datacontract.BaseSessionInfo
import com.sentrana.usermanagement.domain.Accessible

/**
 * Created by szhao on 9/23/2014.
 */
trait SecurityService extends BaseSecurityService {
  this: LoggerComponent =>
  /**
   * Creating required info of user which are required just after login
   * @param userSession >user's session information
   * @return
   */
  override def createSessionInfo(userSession: UserSession): BaseSessionInfo =
    createBiqSessionInfo(userSession)

  /**
   * Create Dashboard application session object.
   * @param userSession user's basic session information
   * @return
   */
  def createBiqSessionInfo(userSession: UserSession): BIQSessionInfo = {

    // create user info from user session of current user
    val userInfo = UMDocumentServiceUtil.convertUserToUserInfo(userSession.user)

    // look for repository data filters
    val permittedIds = BIQServiceUtil.getPermittedRepositoryIds(userSession.user.id)

    val repositories = if (permittedIds.isEmpty) {
      List[UserRepository]()
    }
    else {
      val repositories = MetadataRepository().metadata.values
      repositories.filter(x => permittedIds.contains(x.id)).toList.sortBy(_.name).map { repo =>
        UserRepository(repo.id, repo.name)
      }
    }

    new BIQSessionInfo(userSession.sessionToken.id, userInfo, Nil, repositories, Nil, true)
  }
}

object SecurityService extends SecurityService with PlayLoggerComponent

case class BiqAccessible(id: String, name: String) extends Accessible {
  var selected: Boolean = false
}
