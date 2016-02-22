/**
 * @class CommentStream
 * @module Sentrana
 * @namespace Sentrana.Models
 * @extends jQuery.Observe
 * @description This class is a model which represents a stream of comment (items).
 */
can.Observe.extend("Sentrana.Models.CommentStream", {}, {
    // Constructor...
    init: function CSM(reportID, commentStreamJson) {
        // Specify the observable attributes...
        this.setup({
            "count": 0
        });

        // Save the report ID...
        this.reportID = reportID;

        // If we lack a top level object or have an empty array, get out now...
        if (!commentStreamJson || !commentStreamJson.comments || !commentStreamJson.comments.length) {
            this.comments = [];
            return;
        }

        // Convert each Comment JSON into a CommentItem object...
        this.comments = $.map(commentStreamJson.comments, function (c, i) {
            return new Sentrana.Models.CommentItem(c.attr());
        });

        // Tidy things up...
        this.tidy();
    },

    // Instance method: Sort and update our count. This is basically some bookkeeping...
    tidy: function () {
        // Sort them in descending order (by date)...
        this.comments.sort(function (a, b) {
            return b.date - a.date;
        });

        // Update our count...
        this.attr("count", this.comments.length);
    },

    // Instance method: Sort item based on parameter
    sortItem: function (param) {
        // Sort them in descending order (by date)...
        switch (param) {
        case "date":
            this.comments.sort(function (a, b) {
                return b.date - a.date;
            });
            break;
        case "userName":
            this.comments.sort(function compare(a, b) {
                if (a.userName < b.userName) {
                    return -1;
                }

                if (a.userName > b.userName) {
                    return 1;
                }

                return 0;
            });
            break;
        default:
            this.comments.sort(function (a, b) {
                return b.date - a.date;
            });
            break;
        }

    },

    // Instance method: Whether we have comments in the stream...
    hasComments: function CSM_hasComments() {
        return this.comments && this.comments.length;
    },

    // Instance method: Return the array of CommentItem instances...
    getComments: function CSM_getComments() {
        return this.comments;
    },

    // Instance method: Add a new comment item...
    addCommentItem: function CSM_addCommentItem(commentJson) {
        // Add the report ID...
        commentJson.reportID = this.reportID;

        // Create a new CommentItem and save it...
        var that = this;
        new Sentrana.Models.CommentItem(commentJson).save().done(function (commentItem) {
            // Add it to our list...
            that.comments.push(commentItem);

            // Tidy things up...
            that.tidy();
        });
    },

    removeComment: function CSM_removeComment(id) {

        var that = this;
        $.each(this.comments, function (i, c) {
            if (c.cid === id) {
                that.comments.splice(i, 1);
                that.attr("count", that.comments.length);
                return false;
            }
        });

    },

    // Instance method: Reload comments from the server, weaving in new comments to the existing stream...
    reloadFromServer: function CSM_reloadFromServer() {
        // Get some references to the current objects...
        var that = this,
            existingCommentIDs = {};

        // Loop through all of the comments...
        $.each(this.comments, function (index, commentInfo) {
            existingCommentIDs[commentInfo.cid] = 1;
        });

        $.when(Sentrana.Models.CommentItem.findAll({
            reportID: this.reportID
        })).done(function (data) {
            $.each(data.comments, function (index, commentInfo) {
                if (!(commentInfo.cid in existingCommentIDs)) {
                    that.comments.push(new Sentrana.Models.CommentItem(commentInfo.attr()));
                }
            });

            // Tidy things up...
            that.tidy();
        });
    }
});
