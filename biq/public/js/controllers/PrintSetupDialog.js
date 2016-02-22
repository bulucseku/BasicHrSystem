steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.SetupPrintOptions", {
        pluginName: 'sentrana_dialogs_setup_print_options',
        defaults: {
            title: "Setup print options",
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
            
        },

        ".increase-value click": function (el) {
            this.increaseValue($(el).attr("type"));
        },

        ".decrease-value click": function (el) {
            this.decreaseValue($(el).attr("type"));
        },

        increaseValue: function (type) {
            var element = type==="row"? this.$rowNum : this.$colNum;
            element.val(parseInt(element.val(), 10) + 1);
        },

        decreaseValue: function (type) {
            var element = type === "row" ? this.$rowNum : this.$colNum;
            if (element.val() === "0") {
                return;
            }

            element.val(parseInt(element.val(), 10) - 1);
        },

        ".decimal-place-num keypress": function (el, ev) {
            if (!this.isNumberKey(el, ev)) {
                return false;
            }
            return true;
        },

        ".decimal-place-num blur": function (el, ev) {
            var val = $(el).val(), type =$(el).attr("inputfor");
            var defaultVal = type === "row" ? window.app_resources.print_config.rows_in_page :
                window.app_resources.print_config.columns_in_page;
            if (!val || val.length === 0) {
                $(el).val(defaultVal);
            }
        },

        isNumberKey: function (el, evt) {
            var charCode = (evt.which) ? evt.which : event.keyCode;
            if (charCode === 45 || charCode === 46) { //minus sign or decimal point
                    return false;
            }else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
            }
            return true;
        },

        open: function (tableOnly) {
            this.loadForm();
            if (tableOnly) {
                this.element.find("#print-options-outputtype-table").prop("checked", true);
                this.element.find("#print-options-outputtype-table").closest(".form-group").hide();
            }
            this.openDialog();
        },

        loadForm: function() {
            this.element.find(".print-setup-dialog-body").html(can.view('templates/print_setup.ejs',
                { rows: window.app_resources.print_config.rows_in_page, cols: window.app_resources.print_config.columns_in_page }));
            this.$rowNum = this.element.find('.print-options-maximum-rows');
            this.$colNum = this.element.find('.print-options-maximum-columns');
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            this.closeDialog();
            this.element.trigger("print-report-with-params", this.getSetupParams());
        },

        getSetupParams: function () {
            var printItem = this.element.find('input[name="print-options-outputtype"]:checked').val();
            var orientation = this.element.find('input[name="print-options-pagetype"]:checked').val();
            var rows = parseInt(this.$rowNum.val(),  10);
            var cols = parseInt(this.$colNum.val() , 10);
            return { printItem: printItem, orientation: orientation, rows: rows, cols: cols };
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
