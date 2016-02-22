/**
 * @class CommentItem
 * @module Sentrana
 * @namespace Sentrana.Models
 * @extends jQuery.Model
 * @description This class is a model which represents a single comment.
 * @constructor
 */
can.Model.extend("Sentrana.Models.CommentItem", {

    // use comment id (cid) as id
    id: "cid",

    // Class Method: Extract the report ID from the map of parameters...
    extractReportID: function CI_extractReportID(params) {
        // Are we without a reportID parameter?
        if (!"reportID" in params) {
            return null;
        }

        // Extract out the report ID...
        var reportID = params.reportID;
        delete params.reportID;

        return reportID;
    },

    // Class Method: Return all comments for this report...
    findAll: function CI_findAll(params, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("ReportComment" + "/" + this.extractReportID(params)),
            type: "GET",
            dataType: "json",
            data: params,
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },

    // Class Method: Create a new comment...
    create: function CI_create(attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("ReportComment" + "/" + this.extractReportID(attrs)),
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(attrs),
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },

    update: function CI_update(id, attrs, success, error) {
        var reportId = id.split('_')[0];
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("ReportComment" + "/" + reportId + "/" + id),
            type: "PUT",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(attrs),
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },

    destroy: function CI_destroy(id, success, error) {
        var reportId = id.split('_')[0];
        var that = this;
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("ReportComment" + "/" + reportId + "/" + id),
            type: "DELETE",
            dataType: "json",
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    }

}, {
    // Instance Method: Format the comment's date for display...
    formatDate: function CI_formatDate() {
        return Sentrana.formatCommentDate(new Date(this.date));
    },

    formatTime: function CI_formatTime() {
        return Sentrana.formatCommentTime(new Date(this.date));
    }
});
