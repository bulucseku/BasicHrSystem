package com.sentrana.biq.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.biq.controllers.ApplicationMessages

/**
 * Created by joshuahagins on 7/9/15.
 */
sealed abstract class ReportSharingServiceException extends ServiceException

class ReportIDNotFoundException(reportID: String) extends ReportSharingServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.ReportIDNotFound(reportID)
  val logMessage = s"Report not found with id: $reportID"
}
