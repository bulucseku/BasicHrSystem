steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.SaveUpdateAsReport", {
        pluginName: 'sentrana_dialogs_save_update_as_report',
        defaults: {
            title: "Save Report Definition As?",
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
        loadForm: function (reportName) {
            // Set the report name...
            this.$name.val(reportName);
        },

        // Open the dialog using the model supplied as input...
        open: function (reportName, showGrid, showChart, chartOptions, grandparent, bookletId, order, resultOptions) {
            // Hold a reference to our model...
            this.reportName = reportName;
            this.showGrid = showGrid;
            this.showChart = showChart;
            this.chartOptions = chartOptions;
            this.grandparent = grandparent;
            this.bookletId = bookletId;
            this.order = order;
            this.resultOptions = resultOptions;
            this.element.find(".modal-title").html("Save Existing Report As");

            // Load the contents of the model into the dialog...
            this.loadForm(reportName);
            this.enableButton("OK");
            // Open the dialog...
            this.openDialog();
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            if (this.bookletId) {
                if (this.grandparent.bookletController.isReportExistsWithSameName(this.$name.val())) {
                    this.updateStatus(false, "Report name already in use for this booklet!", 'fail');
                    return;
                }
            }
            else {
                if (this.options.reportDefnModel.isReportExistsWithSameName(this.$name.val())) {
                    this.updateStatus(false, "Report name already in use!", 'fail');
                    return;
                }
            }
            // Update the status bar...
            this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.report_operation.save.processing_msg));

            this.reportDefinitionInfoModel = new Sentrana.Models.ReportDefinitionInfo({
                "name": this.reportName,
                "showGrid": this.showGrid,
                "showChart": this.showChart,
                "chartOptions": this.chartOptions,
                "resultOptions": this.resultOptions
            });

            // Update a bunch of attributes!
            this.reportDefinitionInfoModel.attr({
                "name": this.$name.val(),
                "bookletId": this.bookletId,
                "order": this.order,
                "definition": this.options.reportDefnModel.getReportDefinitionParameters()
            }, false);

            this.options.app.update({
                reportDefinitionInfoModel: this.reportDefinitionInfoModel
            });

            var that = this;
            this.reportDefinitionInfoModel.save().done(function () {
                // Show status...
                that.updateStatus(false, "Success!");
                // Close the dialog...
                that.closeDialog();
                // reload the page with newly saved copy
                that.options.app.switchToPage("bldr", "edit_report", that.reportDefinitionInfoModel);
            }).fail(function (err) {
                // Show status...
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
