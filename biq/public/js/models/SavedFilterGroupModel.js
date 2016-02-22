can.Model.extend("Sentrana.Models.SavedFilterGroupInfo", {
    
    create: function (attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("SavedFilterGroup"),
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
    
    destroy: function (id, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("SavedFilterGroup/" + id),
            type: "DELETE",
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },
    
    update: function (id, attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("SavedFilterGroup/" + id),
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
    }
}, {
    
    init: function (app) {
        this.app = app;
    }

});
