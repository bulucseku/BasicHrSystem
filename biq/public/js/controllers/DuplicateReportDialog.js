steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {
    /**
     * This dialog allows a user to make a duplicate (copy) of an existing report.
     */
    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.DuplicateReport", {
        pluginName: 'sentrana_dialogs_duplicate_report',
        defaults: {
            app: null,
            title: "Duplicate Report",
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

        // Instance Method: Load information from the Model into the Dialog...
        loadForm: function (reportDefinitionInfoModel) {
            // Set the report name...
            this.$name.val("Copy of " + reportDefinitionInfoModel.name);
        },

        /* Check whether report with same name exists.*/
        isReportExistsWithSameName: function (name) {
            if (!this.options.app.reportDefnInfoList || !this.options.app.reportDefnInfoList.savedReports) {
                return false;
            }
            var userInfo = this.options.app.retrieveUserInfo();
            var selecteditem = $.grep(this.options.app.reportDefnInfoList.savedReports, function (report) {
                return ($.trim(report.name) === $.trim(name) && report.createUserId === userInfo.userID);
            });

            return selecteditem.length > 0;
        },

        // Instance Method: Open the dialog and display what is provided in the report
        open: function (reportDefinitionInfoModel) {
            this.reportDefinitionInfoModel = reportDefinitionInfoModel;
            this.loadForm(reportDefinitionInfoModel);
            this.enableButton("OK");
            this.openDialog();
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            if (this.isReportExistsWithSameName(this.$name.val())) {
                this.updateStatus(false, "Report name already in use!", 'fail');
                return;
            }

            // Update the status bar...
            this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.report_operation.copy.processing_msg));

            // Get the JSON for the existing report...
            var oldJson = this.reportDefinitionInfoModel.serialize();

            // Define the new report definition JSON...
            var json = {
                "chartOptions": oldJson.chartOptions,
                "chartType": oldJson.chartType,
                "name": this.$name.val(),
                "definition": oldJson.definition,
                "showChart": oldJson.showChart,
                "showGrid": oldJson.showGrid,
                "resultOptions": oldJson.resultOptions
            };

            // Create a new ReportDefinitionInfo object...
            var rdi = new Sentrana.Models.ReportDefinitionInfo({
                json: json,
                app: this.options.app
            });

            // Save the report...
            var that = this;
            rdi.save().done(function () {
                that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.report_operation.copy.success_msg));
                that.closeDialog("userClick");
            }).fail(function (err) {
                var errorCode = err.getResponseHeader("ErrorCode");
                var errorMsg = err.getResponseHeader("ErrorMsg");

                if (errorCode === Sentrana.Enums.ErrorCode.REPORT_NAME_IN_USE) {
                    that.updateStatus(false, errorMsg, 'fail');
                }
                else {
                    that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.copy_operation.failed), 'fail');
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
