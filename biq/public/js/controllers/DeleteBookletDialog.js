steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.DeleteBooklet", {
        pluginName: 'sentrana_dialogs_delete_booklet',
        defaults: {
            title: "Delete Booklet",
            autoOpen: false,
            buttons: [{
                label: "CANCEL",
                className: "btn-cancel btn-default"
            }, {
                label: "OK",
                className: "btn-ok btn-primary"
            }]
        }
    }, {
        init: function (el, options) {
            this._super(el, options);
            this.$name = this.element.find(".booklet-name");
        },

        // Instance Method: Load the information from the model into the dialog...
        loadForm: function (bookletModel) {
            this.$name.text(bookletModel.name);
        },

        // Instance Method: Open the dialog with a report model
        open: function (bookletModel) {
            // Load the form...
            this.loadForm(bookletModel);

            // Save the report model...
            this.bookletModel = bookletModel;

            // Open the dialog...
            this.openDialog();
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            var that = this;

            // Show status...
            this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.booklet_operation.remove.processing_msg));

            // Save the changes back to the server...
            var promise = this.bookletModel.destroy();
            promise.done(function (data) {
                // Show status...
                that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.booklet_operation.remove.success_msg));

                // Close the dialog...
                that.closeDialog();
            });
            promise.fail(function (promise) {
                // Show status...
                that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.delete_operation.failed), 'fail');
            });
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
