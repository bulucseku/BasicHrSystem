package com.sentrana.biq.controllers

import com.sentrana.usermanagement.controllers.ApplicationMessages

/**
 * Created by joshuahagins on 7/6/15.
 */
object ApplicationMessages extends ApplicationMessages {
  // Repository access
  val NoRepositoryIDInRequest = "RepositoryId must be included in request"
  def RepositoryIDNotFound(repoID: String) = s"Repository could not be found with id: $repoID"
  val UnauthorizedRepositoryAccess = "You are not permitted to access this repository!"

  // BookletService
  def BookletIDNotFound(bookletID: String) = s"Booklet could not be found with id: $bookletID"
  val BookletNameAlreadyInUse = "Booklet name already in use!"
  val UnauthorizedBookletAccess = "User does not have permission to access this booklet"
  val UnauthorizedBookletCopy = "User does not have permission to copy this booklet"
  val UnauthorizedBookletDelete = "User does not have permission to delete this booklet"

  // DerivedColumnService
  val DerivedColumnIDNotFound = "No derived column found with the given ID"
  val DerivedColumnNameAlreadyInUse = "A derived column with the given name already exists"

  // MetadataService
  def InvalidConfigurationFileFormat(configFileID: String, errorMessage: String) =
    s"$configFileID configuration has invalid format with message: $errorMessage"

  // ReportingService
  def CacheKeyNotFound(cacheKey: String) = s"Provided cache key not found in cache: $cacheKey"
  def MissingRequestParameter(paramName: String) = s"'$paramName' parameter must be included in request"

  // ReportService
  val ReportNameAlreadyInUse = "Report name already in use!"
  val ReportNameRequired = "Report name is required"
  def SharedReportIDNotFound(reportID: String) = s"Shared report not found with id: $reportID"
  def UnauthorizedReportAccess(reportID: String) = s"User does not have access to report: $reportID"
  val UnauthorizedReportDelete = "User does not have permission to delete this report"
  val UnauthorizedReportEdit = "User does not have permission to edit this report"
  val UnauthorizedReportCommentDelete = "User does not have permission to delete this comment"
  val UnauthorizedReportCommentEdit = "User does not have permission to edit this comment"

  // SavedFilterGroupService
  val SavedFilterGroupIdNotFound = "No saved filter group found with the given id"
  val SavedFilterGroupNameAlreadyInUse = "A saved filter group with the given name already exists"

  //Dashboard
  val DashboardNameAlreadyInUse = "Dashboard name already in use!"

  // ReportSharingService
  def ReportIDNotFound(reportID: String) = s"Report not found with id: $reportID"
}
