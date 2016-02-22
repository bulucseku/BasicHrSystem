/**
 * @class ChangePassword
 * @module Sentrana
 * @namespace Sentrana.Dialogs
 * @extends jQuery.Controller
 * @description This class is a controller which manages change password dialog.
 * @constructor
 */
Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.ChangePassword", {
    defaults: {
        width: 358
    }
}, {
    /* Constructor */
    init: function () {
        // Base class
        this._super([{
            text: "OK"
        }, "CANCEL"], 100);

        // Capture some elements...
        this.$currentPwd = this.element.find(".current-password");
        this.$newPwd = this.element.find(".new-password");
        this.$newPwdConfirm = this.element.find(".new-password-confirm");
        this.$lblCurrentPwd = this.element.find(".lbl-current-password");
        this.$lblPasswordExpireInfo = this.element.find(".tr-password-expire-info");

        this.element.dialog(this.getDialogOptions());
        this.removeExInCorner();
    },

    /* Close up the dialog */
    closeDialog: function () {
        // Extend the base class version...
        this._super();
    },

    /* Handle the OK click */
    handleOK: function () {
        this.currentPassword = this.$currentPwd.val();
        this.newPassword = this.$newPwd.val();
        this.newPasswordConfirm = this.$newPwdConfirm.val();

        // Messages to validate password.
        var blankPasswordFieldMessage = Sentrana.getMessageText(window.app_resources.app_msg.change_password.empty_password_msg);
        var passwordNotMatchMessage = Sentrana.getMessageText(window.app_resources.app_msg.change_password.password_not_match_msg);
        // Validate password

        if (this.currentPassword.length === 0 || this.newPassword.length === 0 || this.newPasswordConfirm.length === 0) {
            this.updateStatusBar(false, blankPasswordFieldMessage, 'fail');
            return;
        }

        if (this.newPasswordConfirm != this.newPassword) {
            this.updateStatusBar(false, passwordNotMatchMessage, 'fail');
            return;
        }

        // Messages used after receiving service response.
        var errorMessage = Sentrana.getMessageText(window.app_resources.app_msg.change_password.error_msg);
        var successMessage = Sentrana.getMessageText(window.app_resources.app_msg.change_password.success_msg);
        var wrongCurrentPasswordMessage = Sentrana.getMessageText(window.app_resources.app_msg.change_password.wrong_current_password_msg);
        var samePasswordMessage = Sentrana.getMessageText(window.app_resources.app_msg.change_password.same_password_msg);
        var emptyPasswordMessage = Sentrana.getMessageText(window.app_resources.app_msg.change_password.empty_new_password_msg);
        var invalidPasswordformateMessage = Sentrana.getMessageText(window.app_resources.app_msg.change_password.invalidPasswordformateMessage);
        var passwordPolicyViolatedMessage = Sentrana.getMessageText(window.app_resources.app_msg.change_password.passwordPolicyViolatedMessage);

        var that = this;
        // Save the new password to server.
        $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("ChangePassword"),
            type: "POST",
            contentType: "text/json",
            data: JSON.stringify({
                userName: that.userInfo.userName,
                currentPassword: this.currentPassword,
                newPassword: this.newPassword,
                isExpired: that.isPasswordExpired
            }),
            async: true,
            success: function (data) {
                // Disable buttons.
                that.enableButton("OK", false);
                that.enableButton("CANCEL", false);

                that.updateStatusBar(true, successMessage);
                setTimeout(function () {
                    that.closeDialog();
                    that.options.app.logout();
                }, 3000);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var errorCode = jqXHR.getResponseHeader("ErrorCode");
                if (errorCode == Sentrana.Enums.ErrorCode.WRONG_PASSWORD) {
                    that.updateStatusBar(false, wrongCurrentPasswordMessage, 'fail');
                }
                else if (errorCode == Sentrana.Enums.ErrorCode.PREVIOUSLY_USED_PASSWORD) {
                    that.updateStatusBar(false, samePasswordMessage, 'fail');
                }
                else if (errorCode == Sentrana.Enums.ErrorCode.PASSWORD_CANNOT_BE_EMPTY) {
                    that.updateStatusBar(false, emptyPasswordMessage, 'fail');
                }
                else if (errorCode == Sentrana.Enums.ErrorCode.PASSWORD_FORMAT_IS_INVALID) {
                    that.updateStatusBar(false, invalidPasswordformateMessage, 'fail');
                }
                else if (errorCode == Sentrana.Enums.ErrorCode.PASSWORD_POLICY_VIOLATED) {
                    that.updateStatusBar(false, passwordPolicyViolatedMessage, 'fail');
                }
                else {
                    that.updateStatusBar(false, errorMessage, 'fail');
                }
            }
        });

    },

    /* Open the dialog for current user. */
    open: function (userInfo, isPasswordExpired) {
        this.userInfo = userInfo;
        this.isPasswordExpired = isPasswordExpired;

        // Empty fields
        this.$currentPwd.val('');
        this.$newPwd.val('');
        this.$newPwdConfirm.val('');

        this.$lblPasswordExpireInfo[this.isPasswordExpired ? "show" : "hide"]();

        // Enable buttons.
        this.enableButton("OK", true);
        this.enableButton("CANCEL", true);

        // Open the dialog...
        this.openDialog();
    }
});
