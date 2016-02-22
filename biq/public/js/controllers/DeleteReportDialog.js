steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.DeleteReport", {
        pluginName: 'sentrana_dialogs_delete_report',
        defaults: {
            title: "Delete Report",
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
            this.$name = this.element.find(".report-name");
        },

        // Instance Method: Load the information from the model into the dialog...
        loadForm: function (reportDefinitionInfoModel) {
            this.$name.text(reportDefinitionInfoModel.name);
        },

        // Instance Method: Open the dialog with a report model
        open: function (reportDefinitionInfoModel) {
            // Load the form...
            this.loadForm(reportDefinitionInfoModel);

            // Save the report model...
            this.reportDefinitionInfoModel = reportDefinitionInfoModel;

            // Open the dialog...
            this.openDialog();
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            var that = this;

            // Show status...
            this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.report_operation.remove.processing_msg));

            // Save the changes back to the server...
            var promise = this.reportDefinitionInfoModel.destroy();
            promise.done(function (data) {
                // Show status...
                that.updateStatus(false, "Success!");

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
