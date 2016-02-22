package com.sentrana.appshell.utils

import java.io.File

/**
 * Created by szhao on 10/31/2014.
 */
object FileUtils {
  import scala.util.matching.Regex
  def recursiveListFiles(f: File, r: Regex): Array[File] = {
    if (!f.isDirectory) return Array()
    val these = f.listFiles
    val good = these.filter(f => r.findFirstIn(f.getName).isDefined)
    good ++ these.filter(_.isDirectory).flatMap(recursiveListFiles(_, r))
  }
}
