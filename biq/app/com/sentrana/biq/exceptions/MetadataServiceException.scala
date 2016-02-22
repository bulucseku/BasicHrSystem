package com.sentrana.biq.exceptions

import com.sentrana.appshell.exceptions.{ InvalidInputException, ServiceException }
import com.sentrana.biq.controllers.ApplicationMessages

/**
 * Created by joshuahagins on 7/8/15.
 */
sealed abstract class MetadataServiceException extends ServiceException

class InvalidConfigurationFileFormatException(configFileID: String, cause: Throwable) extends MetadataServiceException with InvalidInputException {
  val resultMessage = ApplicationMessages.InvalidConfigurationFileFormat(configFileID, cause.getMessage)
  val logMessage = s"Invalid format for config with id $configFileID; error: ${cause.getMessage}"
}
