package com.sentrana.biq.controllers

import com.sentrana.appshell.cache.CacheManager
import com.sentrana.appshell.controllers.BaseController
import com.sentrana.appshell.logging.{ PlayLoggerComponent, LoggerComponent }
import com.sentrana.biq.datacontract._
import com.sentrana.biq.domain.document.BIQDataServices
import com.sentrana.biq.exceptions.{ SavedFilterGroupIDNotFoundException, SavedFilterGroupNameAlreadyInUseException }
import com.sentrana.usermanagement.authentication.Guid
import com.sentrana.usermanagement.controllers.Authentication
import com.sentrana.usermanagement.datacontract.{ ResponseMessageCode, ResponseMessage }
import org.json4s.native.Serialization._
import com.sentrana.appshell.Global.JsonFormat.formats
import play.api.libs.json.JsValue
import play.api.mvc.Action
import play.api.mvc.BodyParsers.parse

import scala.util.{ Failure, Success, Try }

/**
 * Created by ba on 8/6/2015.
 */

object SavedFilterGroupService extends SavedFilterGroupService with PlayLoggerComponent

trait SavedFilterGroupService extends BaseController with Authentication with RepoAccess {
  this: LoggerComponent =>
  lazy val mongoDataServices = BIQDataServices()

  def addSavedFilterGroup: Action[JsValue] = RepoAction(parse.json) { implicit request =>
    logger.debug("Adding Saved Filter Group: " + request.body.toString)
    val filterGroupInfo = read[SavedFilterGroupInfo](request.body.toString)
    val userSession = request.userSession
    val repository = request.repository
    if (checkForDuplicate(filterGroupInfo, userSession.user.id))
      throw new SavedFilterGroupNameAlreadyInUseException(filterGroupInfo.name)
    else {
      val fg = BIQServiceUtil.convertSavedFilterGroupInfoToSavedFilterGroup(filterGroupInfo, userSession)
      val filterGroup = fg.copy(id = BIQServiceUtil.getObjectId)
      mongoDataServices.saveDocument[SavedFilterGroup](filterGroup)

      // add  filter group to cache
      val fgCacheEntry = SavedFilterGroupCache.retrieveFromCache(repository.id) match {
        case None => SavedFilterGroupCacheEntry(repository.id, filterGroup :: Nil)
        case Some(fgCache) =>
          fgCache.copy(savedFilterGroups = fgCache.savedFilterGroups ++ List(filterGroup))
      }

      SavedFilterGroupCache.saveInCache(fgCacheEntry)

      Ok(write(BIQServiceUtil.convertSavedFilterGroupToSavedFilterGroupInfo(filterGroup)))
    }
  }

  def checkForDuplicate(filterGroup: SavedFilterGroupInfo, userId: String, columnId: Option[String] = None): Boolean = {
    val duplicates = mongoDataServices.getDocuments[SavedFilterGroup](
      Map(
        "name" -> filterGroup.name,
        "createUserId" -> userId,
        "dataSource" -> filterGroup.dataSource
      )
    )
    var hasDuplicate = false

    if (duplicates.size > 0) {
      hasDuplicate = columnId match {
        case None     => true
        case Some(id) => !duplicates.exists(d => d.id == Some(id))
      }
    }

    if (hasDuplicate) {
      logger.debug("Provided filter  group is a duplicate of filter groups: " + duplicates.head.name)
    }

    hasDuplicate
  }

  def deleteSavedFilterGroup(filterGroupId: String) = RepoAction { implicit request =>
    logger.debug("Deleting derived column: " + filterGroupId)
    val repository = request.repository
    val query = mongoDataServices.getDocuments[SavedFilterGroup](
      Map("id" -> filterGroupId)
    )
    query.headOption match {
      case Some(fg) =>
        UpdateReportsWithSavedFilterGroup(fg)
        mongoDataServices.removeDocuments[SavedFilterGroup](Map("id" -> filterGroupId))
        //remove from cache
        SavedFilterGroupCache.retrieveFromCache(repository.id) match {
          case None =>
          case Some(fgCache) =>
            SavedFilterGroupCache.saveInCache(
              fgCache.copy(
                savedFilterGroups = fgCache.savedFilterGroups.filter(_.id != Some(filterGroupId))
              )
            )
        }
        logger.debug("Successfully deleted saved filter group with id: " + filterGroupId)
      case None =>
        logger.debug("Failed deleted saved filter group. No saved filter group with id: " + filterGroupId)
        throw new SavedFilterGroupIDNotFoundException(filterGroupId)
    }
    Ok(write(new ResponseMessage(ResponseMessageCode.SUCCESS.toString, "Saved filter group deleted successfully!")))
  }

  private def UpdateReportsWithSavedFilterGroup(filterGroup: SavedFilterGroup) = {
    logger.debug("Updating reports having saved filter group with id: " + filterGroup.id.get)

    val updatedFilterExpression = filterGroup.filters.map(f => f.filterId).mkString("&");

    val regex = s".*GroupedFilter.*".r
    val reports = mongoDataServices.getDocuments[ReportInfo](Map("definition.filter" -> regex))

    reports.foreach { report =>
      var updateRequired = false;
      val filters = report.definition.filter.getOrElse("").split("\\|").map { f =>
        val filterParts = f.split(",")

        if (filterParts.length > 1) {
          val keyValuePairs = scala.collection.mutable.Map[String, String]()
          filterParts.map { p =>
            val keyValue = p.split("@")
            keyValuePairs(keyValue(0).trim()) = keyValue(1)
          }

          if (keyValuePairs.get("value") == filterGroup.id) {
            updateRequired = true;
            s"type@GroupedFilter, name@${filterGroup.name}, isSaved@false, value@$updatedFilterExpression"
          }
        }
        else {
          f
        }
      }.mkString("|")
      if (updateRequired) {
        val updated = report.copy(definition = report.definition.copy(filter = Some(filters)))
        mongoDataServices.updateDocument[ReportInfo](Map("id" -> report.id.get), updated)
      }
    }
  }

  def updateSavedFilterGroup(filterGroupId: String): Action[JsValue] = RepoAction(parse.json) { implicit request =>
    logger.debug("Updating Saved Filter Group: " + request.body.toString)
    val filterGroupInfo = read[SavedFilterGroupInfo](request.body.toString)
    val userSession = request.userSession
    val repository = request.repository
    val where = Map("id" -> filterGroupId)

    // check for uniqueness
    if (checkForDuplicate(filterGroupInfo, userSession.user.id, Some(filterGroupId))) {
      throw new SavedFilterGroupNameAlreadyInUseException(filterGroupInfo.name)
    }

    mongoDataServices.getDocuments[SavedFilterGroup](where).headOption match {
      case None => BadRequest("Saved Filter Group does not exist with id: " + filterGroupId)
      case Some(existing) =>
        val fg = existing.copy(
          name          = filterGroupInfo.name,
          lastModUserId = userSession.user.id,
          filters       = filterGroupInfo.filterIds.map(id => SavedFilter(id))
        )
        mongoDataServices.updateDocument[SavedFilterGroup](where, fg)
        // update in derived column cache
        SavedFilterGroupCache.retrieveFromCache(repository.id) match {
          case None =>
          case Some(fgCache) =>
            SavedFilterGroupCache.saveInCache(
              fgCache.copy(
                savedFilterGroups = fgCache.savedFilterGroups.map(
                  f => if (f.id == filterGroupInfo.id) fg else f
                )
              )
            )
        }

        Ok(write(BIQServiceUtil.convertSavedFilterGroupToSavedFilterGroupInfo(fg)))
    }
  }
}

case class SavedFilterGroupCacheEntry(
  repositoryId:      String,
  savedFilterGroups: Traversable[SavedFilterGroup]
)

object SavedFilterGroupCache {
  val cachePrefix = "SavedFilterGroup-"

  def retrieveFromCache(repositoryId: String): Option[SavedFilterGroupCacheEntry] = {
    CacheManager.getCachedData(cachePrefix + repositoryId) match {
      case filterGroups: Some[SavedFilterGroupCacheEntry] => filterGroups
      case _ => None
    }
  }

  def saveInCache(savedFilterGroupCache: SavedFilterGroupCacheEntry): Unit = {
    CacheManager.setDataInCache(
      cachePrefix + savedFilterGroupCache.repositoryId,
      savedFilterGroupCache
    )
  }
}