package com.sentrana.appshell.utils

trait Enum extends Enumeration {

  /**
   * Like `withName`, but returns the matching `Value` wrapped in an `Option`
   * if one exists, or `None` otherwise.
   */
  def withNameOpt(n: String): Option[Value] = {
    values.find(_.toString == n)
  }

  /**
   * Like `withName`, but with a more informative exception thrown
   * if no `Value` with name `n` is present.
   */
  def forName(n: String): Value = {
    withNameOpt(n).getOrElse {
      throw new java.util.NoSuchElementException(s"Wrong ${this.toString()} value: $n")
    }
  }

}
