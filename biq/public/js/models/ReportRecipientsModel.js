/**
 * @class ReportRecipients
 * @module Sentrana
 * @namespace Sentrana.Models
 * @extends jQuery.Model
 * @description This class is a model which represents the recipients of a single report.
 * @constructor
 */
can.Model.extend("Sentrana.Models.ReportRecipients", {
    /* This is the URL method base for all of these service methods. */
    methodBase: "ReportRecipients/",

    /* Convert a user ID into a user key which is used in our maps (and vice versa). */
    toUserKey: function (userID) {
        return "u" + userID;
    },
    fromUserKey: function (userKey) {
        return userKey.substr(1);
    },

    /* Find the recipients for a single report. */
    findOne: function (params, success, error) {
        var id = params.id,
            that = this;

        // Remove properties that do not belong in the call...
        delete params.id;

        // Load the recipients from the server...
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl(this.methodBase + id),
            type: "GET",
            dataType: "json",
            success: success,
            error: error
        }).pipe(function (data) {
            // TODO Consider using jQueryMX.model to have conversion of JSON into an instance done in another method.

            // Loop through the array, indexing entries by their ID...
            //var attrs = { existingRecipsMap: {}, existingRecipsArray: data, newRecipsMap: {}, existingRecipsToNotifyMap: {} };
            var attrs = {
                existingRecipsMap: {},
                existingRecipsArray: data,
                newRecipsMap: {},
                newRecipsArray: [],
                existingRecipsToNotifyMap: {}
            };
            $.each(data, function (index, recipInfo) {
                attrs.existingRecipsMap[that.toUserKey(recipInfo.userID)] = recipInfo.partStatus;
            });

            // Create a new instance from the JSON...
            if (that.methodBase === "BookletRecipients/") {
                return new Sentrana.Models.BookletRecipients(attrs);
            }

            return new Sentrana.Models.ReportRecipients(attrs);
        });
    },

    /* Remove all recipients for a given report. */
    destroy: function (id, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl(this.methodBase + id),
            type: "DELETE",
            success: success,
            error: error
        });
    },

    /* Modify the list of recipients for a given report. */
    update: function (id, attrs, success, error) {
        var that = this,
            map = {},
            mapArray = [];

        // Convert the map into an array of recipient info objects...
        var recips = [];

        mapArray = Sentrana.mergeSecondArrayWithFirstArrayByProperty(attrs.existingRecipsArray, attrs.newRecipsArray, "userID");

        for (var i = 0; i < mapArray.length; i++) {
            recips.push(mapArray[i]);
        }

        // Construct the list of email notification info objects...
        var emailInfos = [];
        if (attrs.notifyNew) {
            emailInfos.push({
                fromStatus: null,
                toStatus: "AC",
                subject: attrs.subjectNew,
                body: attrs.bodyNew
            });
        }
        if (attrs.notifyExisting) {
            emailInfos.push({
                fromStatus: "AC",
                toStatus: "RV",
                subject: "",
                body: ""
            });
            emailInfos.push({
                fromStatus: "RV",
                toStatus: "AC",
                subject: "",
                body: ""
            });
        }

        // Construct the sharing modification request object...
        var sharingModReq = {
            recips: recips,
            emailInfos: emailInfos
        };

        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl(this.methodBase + id),
            type: "PUT",
            dataType: "json",
            contentType: "text/json",
            data: JSON.stringify(sharingModReq),
            success: success,
            error: error
        });
    }

}, {
    /* Whether the report has the supplied user as an existing recipient. */
    hasExistingRecipient: function (userID) {
        return !!(this.constructor.toUserKey(userID) in this.existingRecipsMap);
    },

    /* Returns the number of existing recipients. */
    numExistingRecipients: function () {
        return this.existingRecipsArray.length;
    },

    /* Add a new recipient to the report. */
    addNewRecipient: function (userID, partStatus) {
        // Add the user to the map with the specified participation status
        this.newRecipsMap[this.constructor.toUserKey(userID)] = partStatus;
        this.newRecipsArray.push({
            "userID": userID,
            "partStatus": partStatus
        });
        // We need to explicitly trigger an event as jQueryMX's can.Model.extend doesn't handle non-flattened attributes.
        $.event.trigger("change", undefined, this, true);
    },

    /* Remove a newly added recipient from the report. */
    removeNewRecipient: function (userID) {
        // Remove the association from the map...
        delete this.newRecipsMap[this.constructor.toUserKey(userID)];
        var index = this.getUserIndex(this.newRecipsArray, userID);
        if (index > -1) {
            this.newRecipsArray.splice(index, 1);
        }
        // We need to explicitly trigger an event as jQueryMX's can.Model.extend doesn't handle non-flattened attributes.
        $.event.trigger("change", undefined, this, true);
    },

    getUserIndex: function (users, id) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].userID === id) {
                return i;
            }
        }

        return -1;
    },
    /* Modify the participation status associated with an existing recipient of the given report. */
    modifyExistingRecipient: function (userID, partStatus) {
        var userKey = this.constructor.toUserKey(userID);
        var index = this.getUserIndex(this.newRecipsArray, userID);

        // Does this new status match the existing status?
        if (partStatus === this.existingRecipsMap[userKey]) {
            // Remove this entry from the new map...
            delete this.newRecipsMap[userKey];

            if (index > -1) {
                this.newRecipsArray.splice(index, 1);
            }

            delete this.existingRecipsToNotifyMap[userKey];

        }
        else {
            // Store the association in the new map... 
            this.newRecipsMap[userKey] = partStatus;
            this.newRecipsArray.push({
                "userID": userID,
                "partStatus": partStatus
            });

            if (partStatus != "EX") {
                this.existingRecipsToNotifyMap[userKey] = partStatus;
            }
            else {
                delete this.existingRecipsToNotifyMap[userKey];
            }
        }

        // We need to explicitly trigger an event as jQueryMX's can.Model.extend doesn't handle non-flattened attributes.
        // Updated by Sheng 7/13/2015, change the event from updated.attr to change after we upgrade CanJS from 1.1.6 to 2.2.6
        $.event.trigger("change", undefined, this, true);
    },

    /* Are there any changes associated with the recipients of this report? */
    hasChanges: function () {
        return !$.isEmptyObject(this.newRecipsMap);
    },

    isEmailNotificationEnabled: function () {
        return !$.isEmptyObject(this.existingRecipsToNotifyMap);
    }
});
