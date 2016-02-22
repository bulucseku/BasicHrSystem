steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.ResultDefinition", {
        pluginName: 'sentrana_dialogs_result_definition',
        defaults: {
            title: "Result Options",
            autoOpen: false,
            buttons: [{
                label: "CANCEL",
                className: "btn-cancel btn-default"
            }, {
                label: "RESET",
                className: "btn-reset btn-default"
            }, {
                label: "OK",
                className: "btn-ok btn-primary"
            }]
        }
    }, {
        init: function (el, options) {
            this._super(el, options);
        },

        open: function () {

            if (this.resultDefinitionController && !this.resultDefinitionController._destroyed) {
                this.resultDefinitionController.destroy();
            }

            this.resultDefinitionController = this.element.find('.result-definition-element').sentrana_result_definition({
                app: this.options.app,
                resultDataModel: this.options.resultDataModel
            }).control();
            this.openDialog();
        },

        handleRESET: function () {

            this.updateStatus(true, "Reseting filters. Please wait...");

            var that = this;

            if (!that.options.resultDataModel.dataChanged) {
                that.closeDialog();
                return;
            }

            setTimeout(function () {

                that.closeDialog();

                that.options.resultDataModel.startDataChange();
                setTimeout(function () {
                    that.resultDefinitionController.resetDataModel();
                    that.options.resultDataModel.endDataChange();
                }, 300);
            }, 300);

        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            this.updateStatus(true, "Updating filters. Please wait...");
            var that = this;
            var changes = that.resultDefinitionController.getChanges();
            if (!changes) {
                that.closeDialog();
                return;
            }

            setTimeout(function () {
                var filters = that.resultDefinitionController.getFilters();

                if (filters.error) {
                    that.updateStatus(false, 'No item selected from column "' + filters.columnName + '".');
                    return;
                }

                that.closeDialog();

                that.options.resultDataModel.startDataChange();
                setTimeout(function () {
                    that.resultDefinitionController.updateDataModel(filters);
                    that.options.resultDataModel.endDataChange();
                }, 300);
            }, 300);

        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
