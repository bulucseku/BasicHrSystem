package com.sentrana.biq.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.biq.controllers.ApplicationMessages
import com.sentrana.usermanagement.authentication.AuthorizationException
import com.sentrana.usermanagement.datacontract.ServiceErrorCode

/**
 * Created by joshuahagins on 7/9/15.
 */
sealed abstract class ReportServiceException extends ServiceException

class SharedReportIDNotFoundException(reportID: String) extends ReportServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.SharedReportIDNotFound(reportID)
  val logMessage = s"Shared report not found with id: $reportID"
}

class UnauthorizedReportAccessException(userName: String, reportID: String) extends ReportServiceException with AuthorizationException {
  val resultMessage = ApplicationMessages.UnauthorizedReportAccess(reportID)
  val logMessage = s"User $userName does not have access to report: $reportID"
}

class UnauthorizedReportDeleteException(userName: String, reportID: String) extends ReportServiceException with AuthorizationException {
  val resultMessage = ApplicationMessages.UnauthorizedReportDelete
  val logMessage = s"User $userName does not have permission to delete report: $reportID"
}

class UnauthorizedReportEditException(userName: String, reportID: String) extends ReportServiceException with AuthorizationException {
  val resultMessage = ApplicationMessages.UnauthorizedReportEdit
  val logMessage = s"User $userName does not have permission to edit report: $reportID"
}

class UnauthorizedReportCommentDeleteException(userName: String, commentID: String) extends ReportServiceException with AuthorizationException {
  val resultMessage = ApplicationMessages.UnauthorizedReportCommentDelete
  val logMessage = s"User $userName does not have permission to delete report comment: $commentID"
}

class UnauthorizedReportCommentEditException(userName: String, commentID: String) extends ReportServiceException with AuthorizationException {
  val resultMessage = ApplicationMessages.UnauthorizedReportCommentEdit
  val logMessage = s"User $userName does not have permission to edit report comment: $commentID"
}

class ReportNameAlreadyInUseException(reportName: String) extends ReportServiceException with InvalidInputException {
  override val errorCode = Some(ServiceErrorCode.REPORT_NAME_IN_USE)
  val resultMessage = ApplicationMessages.ReportNameAlreadyInUse
  val logMessage = s"Report name already in use: $reportName"
}

class ReportNameRequiredException extends ReportServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.ReportNameRequired
  val logMessage = s"No report name given in request body"
}
