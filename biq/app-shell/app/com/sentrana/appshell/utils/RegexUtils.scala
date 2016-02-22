package com.sentrana.appshell.utils

import scala.util.matching.Regex

object RegexUtils {
  implicit class RegexOps(underlying: Regex) {

    /**
     * Returns `true` if `s` fully matches this `Regex`, `false` otherwise
     */
    def matches(s: String): Boolean = underlying.pattern.matcher(s).matches
  }
}
