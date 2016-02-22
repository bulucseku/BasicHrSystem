package com.sentrana.biq.datacontract

/**
 * Information about a single recipient of a shared report.
 *
 * @constructor
 * @param userID   The user ID of the recipient.
 * @param partStatus   The participation status for the recipient. Values include: <table> <tr><td>AC<td><td>Accepted. The recipient will see this report in his Shared Reports folder.<td><tr> <tr><td>RJ<td><td>Rejected. The recipient has deleted the report that was shared to him.<td><tr> <tr><td>RV<td><td>Revoked. The sender has revoked access of the report to the recipient.<td><tr> <tr><td>EX<td><td>Expunged. There is no longer any record of the recipient having been given access to the report.<td><tr> <table>
 */
case class RecipientInfo(
  userID:     String,
  partStatus: String
)
