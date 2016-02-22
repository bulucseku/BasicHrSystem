steal("lib/sentrana/DialogControl/SentranaDialog.js", function() {

    Sentrana.Controllers.Dialog.extend("Sentrana.Controllers.ConfirmDialog", {
        pluginName: 'sentrana_confirm_dialog',
        defaults: {
            tmplInit: "confirmDialog.ejs",
            title: "Confirm",
            message: "Click OK to confirm.",
            onOk: null,
            onCancel: null,
            buttons: [{
                label: "Cancel",
                className: "btn-cancel btn-default"
            }, {
                label: "OK",
                className: "btn-ok btn-primary"
            }]
        }
    }, {
        init: function(el, options) {
            this._super(el, options);
        },

        update: function(options) {
            this._super(options);
        },

        handleCancel: function() {
            this.closeDialog(this.options.onCancel);
        },

        handleOK: function() {
            this.closeDialog(this.options.onOk);
        },

        "button.close click": function(el, ev) {
            ev.preventDefault();
            this.handleCancel();
        }
    });
});
