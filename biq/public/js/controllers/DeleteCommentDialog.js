steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.DeleteComment", {
        pluginName: 'sentrana_dialogs_delete_comment',
        defaults: {
            title: "Delete Comment",
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
            this.comment = undefined;
            // Capture some jQuery objects...
            this.$comment = this.element.find(".comment-item-msg");
            this.$desc = this.element.find(".comment-item-desc");
        },

        // Instance Method: Load the information from the model into the dialog...
        loadForm: function (comment) {
            this.$desc.text(Sentrana.getMessageText(window.app_resources.app_msg.comment_operation.remove.confirm_msg));
            this.$comment.text(comment.msg).show();
        },

        // Instance Method: Open the dialog with a report model
        open: function (comment, commentStreamModel) {
            // Load the form...
            this.loadForm(comment);

            // Save the report model...
            this.comment = comment;
            this.commentStreamModel = commentStreamModel;
            // Open the dialog...
            this.openDialog();
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            var that = this;

            // Show status...
            this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.comment_operation.remove.processing_msg));

            // Save the changes back to the server...
            var promise = this.comment.destroy();
            promise.done(function (data) {
                that.commentStreamModel.removeComment(that.comment.cid);
                // Close the dialog...
                that.closeDialog();
            });
            promise.fail(function (promise) {
                // Show status...
                that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.delete_operation.failed), 'fail');
            });
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
