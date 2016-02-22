steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.SaveUpdateBooklet", {
        pluginName: 'sentrana_dialogs_save_update_booklet',
        defaults: {
            title: "Save New Booklet?",
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
            this.$name = this.element.find('input[name="booklet-name"]');
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            var bookletName = $.trim(this.$name.val());

            this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.booklet_operation.save.processing_msg));

            this.bookletModel.attr({
                "name": bookletName
            }, false);

            var that = this;
            this.bookletModel.save().done(function (data) {

                data.reports = $.map(data.reports, function (rdi, index) {
                    return new Sentrana.Models.ReportDefinitionInfo({
                        json: rdi.attr(),
                        app: that.options.app
                    });
                });

                that.options.parent.updateControllerModel(that.bookletModel);
                that.bookletModel.attr("reportsRefreshed", true);
                that.updateStatus(false, "Success!");
                $(".booklet-save-as-button").button({
                    "disabled": false
                }).show();
                $(".booklet-share-button").button({
                    "disabled": false
                }).show();
                $(".booklet-composition-panel-header-title").text("Booklet Composition: " + that.bookletModel.name + " by " + that.bookletModel.createUser);
                that.closeDialog();

                that.options.parent.updateObserverReports(data.reports);
                that.options.parent.addEditbuttonToBookletView();

            }).fail(function (err) {
                var errorCode = err.getResponseHeader("ErrorCode");
                var errorMsg = err.getResponseHeader("ErrorMsg");

                if (errorCode === Sentrana.Enums.ErrorCode.BOOKLET_NAME_IN_USE) {
                    that.updateStatus(false, errorMsg, 'fail');
                }
                else {
                    that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.save_operation.failed), 'fail');
                }

            }).always(function () {

            });
        },

        loadForm: function (bookletModel) {
            this.$name.val(bookletModel.name);
            if (!bookletModel.name || bookletModel.name.length <= 0) {
                this.disableButton("OK");
            }
        },

        open: function (bookletModel) {

            this.bookletModel = bookletModel;

            if (!bookletModel.name) {
                this.element.find(".modal-title").html("Save New Booklet");
            }
            else {
                this.element.find(".modal-title").html("Save Existing Booklet As");
                this.enableButton("OK");
            }

            this.loadForm(bookletModel);

            this.openDialog();

            var name = this.$name.val();
            this.$name.focus().val("").val(name);
        },

        'input[name="booklet-name"] keyup': function (el, ev) {
            this.handleInputTexEvent(el, ev);
        },

        'input[name="booklet-name"] paste': function (el, ev) {
            var that = this;
            setTimeout(function () {
                that.handleInputTexEvent(el, ev);
            }, 400);

        },

        handleInputTexEvent: function (el, ev) {
            var trimmedText = $.trim(el.val());
            if (trimmedText !== "") {
                this.enableButton("OK");
            }
            else {
                this.disableButton("OK");
            }
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
