package com.sentrana.biq.controllers

import com.sentrana.appshell.controllers.ActivityTrackingService
import com.sentrana.appshell.logging.PlayLoggerComponent
import com.sentrana.biq.dataaccess.ActionLogRepositoryComponentImpl

/**
 * Created by nwongsaroj on 10/28/14.
 */
object ActivityTrackingService extends ActivityTrackingService
  with ActionLogRepositoryComponentImpl
  with PlayLoggerComponent
