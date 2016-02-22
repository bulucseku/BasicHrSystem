steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.DeleteReusableColumn", {
        pluginName: 'sentrana_dialogs_delete_reusable_column',
        defaults: {
            title: "Delete Derived Column",
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
            this.$name = this.element.find('.reusable-column-name');
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        // Instance Method: What to do when the user hits the OK button...
        handleOK: function () {
            var that = this;

            // Show status...
            this.updateStatus(true, "Deleting the derived column...");

            // Save the changes back to the server...
            var promise = this.reusableColumnInfoModel.destroy();
            promise.done(function (data) {
                // Show status...
                that.updateStatus(false, "Derived column deleted successfully");

                // Close the dialog...
                that.closeDialog();
            });
            promise.fail(function (err) {
                var errorCode = err.getResponseHeader("ErrorCode");
                var errorMsg = err.getResponseHeader("ErrorMsg");

                if (errorCode === Sentrana.Enums.ErrorCode.NO_DATA_RETURNED) {
                    that.updateStatus(false, errorMsg, 'fail');
                }
                else {
                    that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.save_operation.failed), 'fail');
                }
            });
        },

        // Instance Method: Load the information from the model into the dialog...
        loadForm: function (reusableColumnInfoModel) {
            this.$name.text(reusableColumnInfoModel.name);
        },

        // Instance Method: Open the dialog with a report model
        open: function (reusableColumnInfoModel) {
            // Load the form...
            this.loadForm(reusableColumnInfoModel);

            // Save the report model...
            this.reusableColumnInfoModel = reusableColumnInfoModel;

            // Open the dialog...
            this.openDialog();
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
