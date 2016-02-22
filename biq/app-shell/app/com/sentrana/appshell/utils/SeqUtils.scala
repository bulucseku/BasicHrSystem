package com.sentrana.appshell.utils

import scala.util.Try

object SeqUtils {

  implicit class SeqOps[A](seq: Seq[A]) {
    /**
     * Returns `Some(seq)` if `seq` is not empty, `None` otherwise
     */
    def noneIfEmpty: Option[Seq[A]] = if (seq.isEmpty) None else Some(seq)
  }

  /**
   * Tries to sequence the given Seq[Try[A]] to a Try[Seq[A]]
   *
   * @param xs  the collection of Try[A] to sequence
   * @tparam A  the type of the wrapped elements of the collection
   * @return    `Success(seq)` if all elements in the given collection
   *            are `Success`es, otherwise the first `Failure` encountered
   */
  def trySequence[A](xs: Seq[Try[A]]): Try[Seq[A]] = Try(xs.map(_.get))

}
