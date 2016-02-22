package com.sentrana.appshell.cache

import play.api.Play.current
/**
 * Created by szhao on 10/13/2014.
 */
object CacheManager {

  val cacheProvider = play.api.cache.Cache

  /**
   * This will set the data in cache
   * @param key Unique key as string
   * @param data data to cache as object
   */
  def setDataInCache(key: String, data: Any): Unit = {
    cacheProvider.set(key, data, 0)
  }

  /**
   * This will set the data in cache and keep that for certain minutes as specified in parameter.
   * @param key Unique key as string
   * @param data data to cache as object
   * @param expiredInMinutes Cached object will expired after expiredInMinutes
   */
  def setDataInCache(key: String, data: Object, expiredInMinutes: Int): Unit = {
    cacheProvider.set(key, data, expiredInMinutes * 60)
  }

  /**
   * This will return the cached data. If the data is not in cache, will return null
   * @param key Unique key as string to retrieve the cached data
   * @return Returned data as object
   */
  def getCachedData(key: String): Option[Any] = {
    cacheProvider.get(key)
  }

  /**
   * This will be used to remove the data from cache.
   * @param key Unique key as string
   * @return
   */
  def removeCachedData(key: String): Unit = {
    cacheProvider.remove(key)
  }
}
