can.Model.extend("Sentrana.Models.ReusableColumnInfo", {

    // Class Method: Create a new instance on the server...
    create: function RCI_create(attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("DerivedColumn"),
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

    // Class Method: Delete an existing instance...
    destroy: function RCI_destroy(id, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("DerivedColumn/" + id),
            type: "DELETE",
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },

    // Class Method: Update a reusable column
    update: function RCI_update(id, attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("DerivedColumn/" + id),
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
    // Constructor...
    init: function (app) {
        // Store a reference to the application controller...
        this.app = app;
    }

});
