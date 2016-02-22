steal("lib/sentrana/DialogControl/SentranaDialog.js", function() {

    Sentrana.Controllers.Dialog.extend("Sentrana.Controllers.AlertDialog", {
        pluginName: 'sentrana_alert_dialog',
        defaults: {
            tmplInit: "confirmDialog.ejs",
            title: "",
            autoOpen: true,
            message:"",
            onOk: null,
            buttons: [{
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
            this.closeDialog();
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
