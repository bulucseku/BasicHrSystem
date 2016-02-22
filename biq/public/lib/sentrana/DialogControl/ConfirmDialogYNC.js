steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Controllers.ConfirmDialogYNC", {
        pluginName: 'sentrana_confirm_yes_no_cancel_dialog',
        defaults: {
            tmplInit: "confirmDialog.ejs",
            title: "",
            message: "",
            onYes: null,
            onCancel: null,
            onNo: null,
            buttons: [
                {
                    label: "CANCEL",
                    className: "btn-cancel btn-default"
                },
                {
                    label: "NO",
                    className: "btn-no btn-default"
                },
                {
                    label: "YES",
                    className: "btn-ok btn-primary"
                }
            ]
        }
    }, {
        init: function (el, options) {
            this._super(el, options);
        },

        update: function (options) {
            this._super(options);
        },

        handleCANCEL: function () {
            this.closeDialog(this.options.onCancel);
        },

        handleNO: function () {
            this.closeDialog(this.options.onNo);
        },

        handleYES: function () {
            this.closeDialog(this.options.onYes);
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCancel();
        }
    });
});

