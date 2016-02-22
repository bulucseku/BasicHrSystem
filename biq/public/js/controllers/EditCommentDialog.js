steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.EditComment", {
        pluginName: 'sentrana_dialogs_edit_comment',
        defaults: {
            title: "Edit Comment",
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
            this.$commentText = this.element.find(".comment-text-edit");
            this.$desc = this.element.find(".comment-item-desc");
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        // Instance Method: What to do when the user hits the OK button...
        handleOK: function () {
            var that = this;

            var value = this.$commentText.val();
            if ($.trim(value) !== "") {
                // Show status...
                this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.comment_operation.update.processing_msg));

                // Save changes on the model!
                var oldMsg = this.comment.msg;
                this.comment.attr("msg", this.$commentText.val());
                this.comment.save().done(function (data) {
                    // Show status...
                    that.updateStatus(false, "Success!");

                    that.options.parent.refreshComments(that.commentStreamModel);
                    // Close the dialog...
                    that.closeDialog();
                }).fail(function (err) {
                    that.comment.msg = oldMsg;
                    that.updateStatus(false, "The update operation failed.", 'fail');
                }).always(function () {

                });
            }
            else {
                that.updateStatus(false, "Empty comment can not be saved.", 'fail');
            }

        },

        // Instance Method: Load the information from the model into the dialog...
        loadForm: function (comment) {
            this.$desc.text('Please write comment to edit:');
            this.$commentText.val(comment.msg).show();
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

            //set focus to the end
            var commentValue = this.$commentText.val();
            this.$commentText.focus().val("").val(commentValue);
        },

        '.comment-text-edit keyup': function (el, ev) {

            if ($.trim(this.$commentText.val()).length <= 0) {
                return;
            }

            // Is this a return character?
            if (ev.ctrlKey && ev.keyCode === 13) {
                this.handleOK();
            }
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
