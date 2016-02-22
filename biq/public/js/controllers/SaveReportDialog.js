steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.SaveUpdateReport", {
        pluginName: 'sentrana_dialogs_save_update_report',
        defaults: {
            reportDefnModel: null,
            title: "Save New Report Definition?",
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
            this.$name = this.element.find('input[name="report-name"]');
        },

        // Load the contents of the input model into the dialog
        loadForm: function (reportDefinitionInfoModel) {
            // Set the report name...
            this.$name.val(reportDefinitionInfoModel.name);
        },

        // Open the dialog using the model supplied as input...
        open: function (reportDefinitionInfoModel) {
            // Hold a reference to our model...
            this.reportDefinitionInfoModel = reportDefinitionInfoModel;

            // Is this a new report (not yet saved)?
            if (reportDefinitionInfoModel.isNew()) {
                this.element.find(".modal-title").html("Save New Report");
            }
            else {
                this.element.find(".modal-title").html("Update Existing Report");
            }

            // Load the contents of the model into the dialog...
            this.loadForm(reportDefinitionInfoModel);
            this.enableButton("OK");
            // Open the dialog...
            this.openDialog();
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            if (this.options.reportDefnModel.isReportExistsWithSameName(this.$name.val())) {
                this.updateStatus(false, "Report name already in use!", 'fail');
                return;
            }

            // Update the status bar...
            this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.report_operation.save.processing_msg));

            // Update a bunch of attributes!
            this.reportDefinitionInfoModel.attr({
                "name": this.$name.val(),
                "definition": this.options.reportDefnModel.getReportDefinitionParameters()
            }, false);

            // Save changes on the model!
            var that = this;
            this.reportDefinitionInfoModel.save().done(function () {
                // Show status...
                that.updateStatus(false, "Success!");
                that.element.find(".save-button").button({
                    "disabled": true
                });
                that.element.find(".save-as-button").button({
                    "disabled": true
                });

                // Close the dialog...
                that.closeDialog();
            }).fail(function (err) {

                var errorCode = err.getResponseHeader("ErrorCode");
                var errorMsg = err.getResponseHeader("ErrorMsg");

                if (errorCode === Sentrana.Enums.ErrorCode.REPORT_NAME_IN_USE) {
                    that.updateStatus(false, errorMsg, 'fail');
                }
                else {
                    that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.save_operation.failed), 'fail');
                }
            }).always(function () {

            });
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        },

        // Browser Event: What to do when the user types in the input box...
        'input[name="report-name"] keyup': function (el, ev) {
            var trimmedText = $.trim(el.val());

            // Enable (or disable) the OK button...
            if (trimmedText !== "") {
                this.enableButton("OK");
            }
            else {
                this.disableButton("OK");
            }
        }
    });
});
