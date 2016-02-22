/*...................Sentrana.Models.Booklet...................*/

can.Model.extend("Sentrana.Models.Dashboard", {
    create: function D_create(attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Dashboard"),
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
            url: Sentrana.Controllers.BIQController.generateUrl("Dashboards"),
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
    }
});
