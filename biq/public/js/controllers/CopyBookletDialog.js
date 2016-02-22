steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.CopyBooklet", {
        pluginName: 'sentrana_dialogs_copy_booklet',
        defaults: {
            title: "Duplicate Booklet",
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

        loadForm: function (bookletModel) {
            this.$name.val("Copy of " + bookletModel.name);
        },

        handleOK: function () {
            this.updateStatus(true, "Copying the booklet...");

            var bookletdefn = {
                "id": this.bookletModel.id,
                "name": $.trim(this.$name.val())
            };
            var that = this;

            $.when(Sentrana.Models.Booklet.copy(that.bookletModel.id, bookletdefn)).done(function (data) {

                data.reports = $.map(data.reports, function (rdi, index) {
                    return new Sentrana.Models.ReportDefinitionInfo({
                        json: rdi,
                        app: that.options.app
                    });
                });

                var booklet = new Sentrana.Models.Booklet(data);
                booklet.attr("reportsRefreshed", false);
                booklet.attr('reports', data.reports);

                that.updateStatus(false, "Booklet copied successfully");
                that.closeDialog("userClick");

                that.options.parent.bookletCopied(booklet);

            }).fail(function (jqXHR, textStatus, errorThrown) {
                var errorCode = jqXHR.getResponseHeader("ErrorCode");
                var errorMsg = jqXHR.getResponseHeader("ErrorMsg");

                if (errorCode === Sentrana.Enums.ErrorCode.BOOKLET_NAME_IN_USE) {
                    that.updateStatus(false, errorMsg, 'fail');
                }
                else {
                    that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.copy_operation.failed), 'fail');
                }
            });

        },

        open: function (bookletModel) {
            this.bookletModel = bookletModel;
            this.loadForm(bookletModel);
            this.enableButton("OK");
            this.openDialog();
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

        handleCANCEL: function () {
            this.closeDialog();
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
