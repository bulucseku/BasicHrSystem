package com.sentrana.appshell.utils

import com.sentrana.usermanagement.authentication.PasswordHash

/**
 * Created by szhao on 4/15/2014.
 */
class PasswordGenerator(minLen: Int, maxLen: Int) {
  def create(): String = {
    val randomLen = (new scala.util.Random).nextInt(maxLen - minLen + 1) + minLen
    PasswordHash.randomString("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*.?")(randomLen)
  }
}
