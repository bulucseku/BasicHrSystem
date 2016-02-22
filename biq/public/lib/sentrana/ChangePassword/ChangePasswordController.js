steal ("lib/sentrana/Authentication/AuthenticationModel.js", function(){
    can.Control.extend("Sentrana.Controllers.ChangePasswordController", {
        defaults: {
            changePasswordTemplate: 'lib/sentrana/ChangePassword/changePassword.ejs',
            authenticationModel: Sentrana.Models.AuthenticationModel,
            defaultMessages: {
                blankPasswordFieldMessage: "The password field cannot be left blank.",
                passwordNotMatchMessage: "Passwords do not match.",
                errorMessage: "Failed to change your password, please try later again.",
                successMessage: "Your password has been updated successfully. Please log in with your new credentials. Logging out now...",
                wrongCurrentPasswordMessage: "Your current password is incorrect.",
                samePasswordMessage: "Choose a password you haven't previously used with this account.",
                emptyPasswordMessage: "New password cannot be empty.",
                invalidPasswordFormatMessage: "Invalid password. Valid passwords must contain at least eight characters, no spaces, " +
                    "both lowercase and uppercase characters, at least one numeric digit, and at least one special character (any character not 0-9, a-z, A-Z).",
                passwordPolicyViolatedMessage: "Password policy violated. You cannot use recently used 3 passwords as New Password"
            }
        },
        pluginName: 'sentrana_change_password'
    },{
        init: function() {
            this.render();
            $('[data-toggle="tooltip"]').tooltip();
        },

        render:function() {
            var that = this;
            this.element.html(can.view(that.options.changePasswordTemplate, {}));
            this.$currentPwd = $("input[name=old-password]", $(this.element));
            this.$newPwd = $("input[name=new-password]", $(this.element));
            this.$newPwdConfirm = $("input[name=confirm-password]", $(this.element));
            this.$cancelButton = $("#change-password-cancel");
            this.$submitButton = $("#change-password-submit");
            this.$success = $(".change-pwd-success", $(this.element));
            this.$success.hide();
            this.$error = $(".change-pwd-error", $(this.element));
            this.$error.hide();
            this.userInfo = this.options.app.retrieveUserInfo();

            this.element.find('.form-control').focus(function(ev) {
                $(ev.target).prop('type', 'password');
            }).blur(function(ev) {
                var self = $(ev.target),
                    value = self.val();
                if(!value || value.length<=0){
                    self.prop('type', 'text').val('');
                }
            });
        },

        open: function (callback, userName, isExpired) {
            this.resetInputBox();
            this.userName = userName;
            this.isExpired = isExpired;
            this.$success.hide();
            this.$error.hide();

            $('#change-password-modal').on('show.bs.modal', this.centerModal);
            $('#change-password-modal').modal('show');
            if (callback) {
                $('#change-password-modal').one('shown.bs.modal', callback);
            }
        },

        resetInputBox: function () {
            this.$currentPwd.val('');
            this.$newPwd.val('');
            this.$newPwdConfirm.val('');
        },

        centerModal: function centerModal() {
            $(this).css('display', 'block');
            var $dialog = $(this).find(".modal-dialog");
            var offset = ($(window).height() - $dialog.height()) / 2;
            // Center modal vertically in window
            $dialog.css("margin-top", offset);
        },

        getClientErrorMessage: function (messageKey) {
            //this method need to be overwritten by specific app main controller
            var errorText = this.options.app.getClientErrorMessage(messageKey);

            if (!errorText) {
                errorText = this.options.defaultMessages[messageKey];
            }

            return errorText;
        },

        handleOK: function () {
            this.currentPassword = this.$currentPwd.val();
            this.newPassword = this.$newPwd.val();
            this.newPasswordConfirm = this.$newPwdConfirm.val();

            // Messages to validate password.
            var blankPasswordFieldMessage = this.getClientErrorMessage("blankPasswordFieldMessage");
            var passwordNotMatchMessage = this.getClientErrorMessage("passwordNotMatchMessage");
            var samePasswordMessage = this.getClientErrorMessage("samePasswordMessage");

            // Validate password
            if (this.currentPassword.length === 0 || this.newPassword.length === 0 || this.newPasswordConfirm.length === 0) {
                this.$error.html(blankPasswordFieldMessage);
                this.$error.show();
                return;
            }
            if (this.newPasswordConfirm !== this.newPassword) {
                this.$error.html(passwordNotMatchMessage);
                this.$error.show();
                return;
            }

            if (this.currentPassword === this.newPassword) {
                this.$error.html(samePasswordMessage);
                this.$error.show();
                return;
            }

            // Messages used after receiving service response.
            var errorMessage = this.getClientErrorMessage("errorMessage");
            var successMessage = this.getClientErrorMessage("successMessage");
            var wrongCurrentPasswordMessage = this.getClientErrorMessage("wrongCurrentPasswordMessage");
            var emptyPasswordMessage = this.getClientErrorMessage("emptyPasswordMessage");

            var that = this;

            var changePasswordServiceUrl = this.options.app.generateUrl ? this.options.app.generateUrl("ChangePassword", {}) : this.options.app.constructor.generateUrl("ChangePassword", {});

            // Save the new password to server.
           this.options.authenticationModel.changePassword(changePasswordServiceUrl,{
                    userName: this.userName || this.options.app.retrieveUserInfo().userName,
                    currentPassword: this.currentPassword,
                    newPassword: this.newPassword,
                    isExpired: this.isExpired
                }, function () {

                    that.$currentPwd.val('').focus();
                    that.$newPwd.val('').focus();
                    that.$newPwdConfirm.val('').focus();
                    // Disable buttons.
                    that.$submitButton.addClass('disabled');
                    that.$cancelButton.addClass('disabled');
                    that.$error.hide();
                    that.$success.html(successMessage);
                    that.$success.show();
                    setTimeout(function () {
                        $('#change-password-modal').modal('hide');
                        $('#change-password-form').each(function(){
                            this.reset();
                        });
                        that.$success.hide();
                        that.$submitButton.removeClass('disabled');
                        that.$cancelButton.removeClass('disabled');
                        that.options.app.loginController.logout(that.isExpired);
                    }, 3000);
                }, function (jqXHR /*textStatus, errorThrown*/) {
                   var errorText = that.options.app.getServerErrorMessage(jqXHR);

                   if (!errorText || !errorText.trim()) {
                       errorText = errorMessage;
                   }

                   that.$error.html(errorText);
                   that.$error.show();
                }
            );

        },

        "#change-password-cancel click":function(elem){
            $('#change-password-modal').modal('hide');
            $('#change-password-form').each(function(){
                this.reset();
            });
        },

        "#change-password-submit click":function(elem){
            this.handleOK();
        },

        ".close click":function(elem){
            $('#change-password-modal').modal('hide');
            $('#change-password-form').each(function(){
                this.reset();
            });
        },

        'input[type="password"] keypress': function (el, ev) {
            // Is this a return character?
            if (ev.keyCode === 13) {
                // Trigger a click of the OK button...
                this.handleOK();
            }
        }
    });
});

