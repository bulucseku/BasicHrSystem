/*...................Sentrana.Models.Booklet...................*/

can.Model.extend("Sentrana.Models.Booklet", {
    create: function B_create(attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Booklet"),
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

    destroy: function B_destroy(id, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Booklet/" + id),
            type: "DELETE",
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },

    findAll: function B_findAll(params, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Booklets"),
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

    getReports: function B_getReports(id, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Reports/" + id),
            type: "GET",
            dataType: "json",
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },

    update: function B_update(id, attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Booklet/" + id),
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

    copy: function B_update(id, attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Booklet/" + id),
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
    }

}, {

    formatModified: function RDI_formatModified() {
        return Sentrana.formatDate(new Date(this.lastModDate)) + " (" + this.lastModUser + ")";
    }

});
