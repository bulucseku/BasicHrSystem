steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {
    /**
     * @class ShareReport
     * @module Sentrana
     * @namespace Sentrana.Dialogs
     * @extends jQuery.Controller
     * @description This class is a controller which manages the "Sharing" dialog for a report.
     * @constructor
     */
    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.ShareReport", {
        pluginName: 'sentrana_dialogs_share_report',
        defaults: {
            app: null,
            /* This is assumed to be an instance of an BIQController class */
            maxRptName: 50,
            /* The maximum length of the report name to use before truncating it... */
            title: "Share Report",
            autoOpen: false,
            buttons: [{
                label: "CANCEL",
                className: "btn-cancel btn-default"
            }, {
                label: "UNSHARE",
                className: "btn-unshare btn-default"
            }, {
                label: "OK",
                className: "btn-ok btn-primary"
            }]
        }
    }, {
        init: function (el, options) {
            this._super(el, options);
            // Capture some elements...
            this.$tabs = this.element.find(".shrd-tabs");
            this.$userAutoComp = this.element.find(".users-auto-complete");
            this.$userLoading = this.element.find(".users-loading");
            this.$userParagraph = this.element.find(".users-para");
            this.$newRecipients = this.element.find(".recipients");
            this.$emailNewRecips = this.element.find(".shrd-email-recips-new");
            this.$emailExistRecips = this.element.find(".shrd-email-recips-existing");
            this.$emailSection = this.element.find(".email-section");
            this.$emailSubject = this.element.find(".email-subject");
            this.$emailBody = this.element.find(".email-body");
            this.$existRecips = this.element.find(".table tbody", this.element.find("#shrd-tab-existing"));
            this.$existingRecipientsTab = this.element.find("#shrd-tab-existing");
            this.$inviteTab = this.element.find("#shrd-tab-invite");

        },

        handleSelectEvent: function (el) {
            if ($(el).find('a').attr('href') === '#shrd-tab-existing') {
                this.showButton("UNSHARE");
                if (this.recipientsModel.numExistingRecipients() > 0) {
                    this.enableButton("UNSHARE");
                }
                else {
                    this.disableButton("UNSHARE");
                }
            }
            else {
                this.hideButton("UNSHARE");
            }

        },

        handleCANCEL: function () {
            this.closeDialog();

            this.$emailExistRecips.prop("disabled", true);

            // Unbind any changes to the model...
            if (this.recipientsModel) {
                this.recipientsModel.unbind("change");
            }
        },

        handleOK: function () {
            var that = this;

            // Update the model for body and subject (for new recipients)
            this.recipientsModel.attr("subjectNew", this.$emailSubject.val());
            this.recipientsModel.attr("bodyNew", this.$emailBody.val());

            // Show status...
            this.updateStatus(true, app_resources.app_msg.share_report.update_recipients);

            // Save the changes back to the server...
            var promise = this.recipientsModel.save();
            promise.done(function (data) {
                // Show status...
                that.updateStatus(false, "Success!");

                // Close the dialog...
                that.closeDialog();

                // Ask the report to retrieve a new set of comments...
                that.reportDefinitionInfo.reloadCommentStream();

                if (that.hasShare(data.existingRecipsArray)) {
                    that.reportDefinitionInfo.shared = true;
                }
                else if (!that.isEmpty(data.newRecipsMap)) {
                    if (that.providedShare(data.newRecipsArray)) {
                        that.reportDefinitionInfo.shared = true;
                    }
                    else {
                        that.reportDefinitionInfo.shared = false;
                    }
                }
                else {
                    that.reportDefinitionInfo.shared = false;
                }

                that.options.app.changeReportIcon(that.reportDefinitionInfo);

            });
            promise.fail(function (promise) {
                // Produce an error message...
                var msg = "Failure: " + promise.getResponseHeader("ErrorMsg");

                // Show status...
                that.updateStatus(false, msg, 'fail');
            });
        },

        isEmpty: function (map) {
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        },

        hasShare: function (recipients) {
            for (var i = 0; i < recipients.length; i++) {
                if (recipients[i].partStatus === 'AC') {
                    return true;
                }
            }
            return false;
        },

        providedShare: function (recipients) {
            for (var i = 0; i < recipients.length; i++) {
                if (recipients[i].partStatus === 'AC') {
                    return true;
                }
            }
            return false;
        },

        /* Handle the Unshare click */
        handleUNSHARE: function () {
            var that = this;

            // Show status...
            this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.share_report.deleting_recipients));

            // Save the changes back to the server...
            var promise = this.recipientsModel.destroy();
            promise.done(function (data) {
                // Show status...
                that.updateStatus(false, "Success!");

                // Close the dialog...
                that.closeDialog();

                // Ask the report to retrieve a new set of comments...
                that.reportDefinitionInfo.reloadCommentStream();

                that.reportDefinitionInfo.shared = false;
                that.options.app.changeReportIcon(that.reportDefinitionInfo);
            });
            promise.fail(function (promise) {
                // Produce an error message...
                var msg = "Failure: " + promise.getResponseHeader("ErrorMsg");

                // Show status...
                that.updateStatus(false, msg, 'fail');
            });
        },

        /* Show the loading users section (and hide actual users)... */
        showLoadingUsers: function (show) {
            this.$userLoading[(show) ? "show" : "hide"]();
            this.$userParagraph[(!show) ? "show" : "hide"]();
        },

        /* Update the list of users for the autocomplete list. Filter out existing recipients and the sender. */
        updateUserList: function () {
            var that = this,
                recips4autoComplete;

            // Process each possible recipient...
            recips4autoComplete = $.map(this.filteredUserInfoArray, function (userInfo, index) {
                // Is the user NOT already listed as one of the new recipients?
                if ($.inArray(userInfo.userID, that.newRecipientUserIDs) === -1) {
                    return {
                        label: userInfo.fullName,
                        value: userInfo.userID
                    };
                }
            });

            // Update the autocomplete control...
            this.$userAutoComp.autocomplete({
                source: recips4autoComplete,
                minLength: 2
            });
        },

        /* Load the list of possible recipients for the specified report. Server removes the user making the request, but does not remove existing recipients. */
        loadUsers: function (reportDefinitionInfoModel) {
            var that = this;

            // Use the model's ID to see if already have the recipients...
            if (this.recipientsModelID === reportDefinitionInfoModel.id) {
                // Hide the loading section...
                this.showLoadingUsers(false);
                return;
            }

            // Show the loading div...
            this.showLoadingUsers(true);

            // Get the promise for data...
            this.usersPromise = $.ajax({
                url: Sentrana.Controllers.BIQController.generateUrl("Users", {
                    "recipientsFor": reportDefinitionInfoModel.id
                }),
                type: "GET",
                dataType: "json"
            }).pipe(function (data) {
                // Record the full list of users...
                that.userInfoArray = data;

                // Construct a map for faster lookup...
                that.userInfoMap = {};
                $.each(that.userInfoArray, function (index, userInfo) {
                    // Construct the full name using first, last and company names...
                    userInfo.fullName = userInfo.firstName + " " + userInfo.lastName + " " + "(" + userInfo.companyName + ")";

                    // Index the entry by the user ID...
                    that.userInfoMap[Sentrana.Models.ReportRecipients.toUserKey(userInfo.userID)] = userInfo;
                });

                // Record our model ID...
                that.recipientsModelID = reportDefinitionInfoModel.id;
            });
        },

        /* Load the set of existing recipients... */
        loadExistingRecipients: function (reportDefinitionInfoModel) {
            // Find our existing recipients...
            var recipientsPromise = Sentrana.Models.ReportRecipients.findOne({
                id: reportDefinitionInfoModel.id,
                app: this.options.app
            });

            // Synchronize the loading of the recipients with the loading of users...
            var that = this;
            $.when(recipientsPromise, this.usersPromise).done(function (recipientsModel, usersPromiseInfo) {
                // Hold a reference to the model in our options...
                that.recipientsModel = recipientsModel;
                that.recipientsModel.attr('id', reportDefinitionInfoModel.id);

                // Bind to it...
                that.recipientsModel.bind("change", function () {
                    // Update the OK dialog box to reflect whether there are changes to save or not...
                    if (that.recipientsModel.hasChanges()) {
                        that.enableButton("OK");
                    }
                    else {
                        that.disableButton("OK");
                    }

                    that.$emailExistRecips.prop("checked", that.recipientsModel.isEmailNotificationEnabled() ? that.$emailExistRecips.prop("checked") : false);
                    that.$emailExistRecips.prop("disabled", !that.recipientsModel.isEmailNotificationEnabled());
                });

                // Sort the recipients by their full name (first name sorted first, before last name)...
                function sortFullNamesAsc(a, b) {
                    var toUserKey = Sentrana.Models.ReportRecipients.toUserKey,
                        fa = that.userInfoMap[toUserKey(a.userID)].fullName,
                        fb = that.userInfoMap[toUserKey(b.userID)].fullName;

                    return (fa < fb) ? -1 : ((fa > fb) ? 1 : 0);
                }

                //that.recipientsModel.existingRecipsArray.sort(sortFullNamesAsc);

                // Fill up the existing recipients section...
                that.$existRecips.html(can.view("templates/shrd-existing-recips.ejs", {
                    recipModel: that.recipientsModel,
                    userInfoMap: that.userInfoMap,
                    id: "R" + that.recipientsModel.id
                }));

                // Are we with without any existing recipients?
                var noExistingRecips = that.recipientsModel.numExistingRecipients() === 0;

                // Filter the list of users to exclude current recipients...
                that.filteredUserInfoArray = $.grep(that.userInfoArray, function (userInfo, index) {
                    return !that.recipientsModel.hasExistingRecipient(userInfo.userID);
                });

                // Update the recipient list in the autocomplete...
                that.updateUserList();

                // Hide the loading...
                that.showLoadingUsers(false);

                // Focus on the autocomplete box...
                that.$userAutoComp.focus();
            }).fail(function (jqXHR, textStatus, errorThrown) {
                // Did the users promise fail?
                //if (jqXHR.isRejected()) {
                // Try to get the jqXHR object for the call...
                var errorMsg = jqXHR.getResponseHeader("ErrorMsg");

                // Is this a situation OTHER THAN session timeout?
                if (errorMsg !== app_resources.app_msg.session_time_out) {
                    Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.ajax_error.recipient.load.failed.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.ajax_error.recipient.load.failed.dialog_msg));
                }
                //}
            });
        },

        /* Load the dialog with the contents of the model */
        loadForm: function (reportDefinitionInfoModel) {

            // Hold a reference to the Report Definition Info model...
            this.reportDefinitionInfo = reportDefinitionInfoModel;

            // Truncate the model's name, if necessary...
            var truncRptName = (this.reportDefinitionInfo.name.length > this.options.maxRptName) ? this.reportDefinitionInfo.name.substr(0, this.options.maxRptName) + "..." : this.reportDefinitionInfo.name + "-By " + this.reportDefinitionInfo.createUser;

            // Modify the title...
            this.element.find(".modal-title").html("<span class='header-title-part-1'>Share:</span><span class='header-title-part-2'> '" + truncRptName + "'</span>");

            // Load the users...
            this.loadUsers(this.reportDefinitionInfo);

            // Remove the previous new recipients...
            this.$newRecipients.empty();

            // Hide the new recipients div...
            this.$newRecipients.hide();

            // Get the user ID of the logged on user...
            this.senderUserID = this.options.app.retrieveUserInfo().userID;

            // Reset the list of recipient user ids...
            this.newRecipientUserIDs = [];

            // Empty any text in the input...
            this.$userAutoComp.val("");

            // Reset the notify recipients via email checkboxes...
            this.$emailNewRecips.prop("checked", false);
            this.$emailExistRecips.prop("checked", false);

            this.$emailExistRecips.prop("disabled", true);

            // Reset the email subject...
            this.$emailSubject.val("Report Routing: " + this.reportDefinitionInfo.name + "-by " + this.reportDefinitionInfo.createUser);

            // Reset the email body...
            this.$emailBody.val("");

            // Load the existing recipients...
            this.loadExistingRecipients(this.reportDefinitionInfo);

            // Hide the mail section...
            this.$emailSection.hide();

            //select the first tab
            $("#share-report-tabs li:eq(0) a").tab('show');
        },

        /* Open the dialog with a given report. */
        open: function (reportDefinitionInfoModel) {
            // Disable the OK and UNSHARE buttons...
            this.disableButton("OK");
            this.hideButton("UNSHARE");

            // Load the dialog with data from the model...
            this.loadForm(reportDefinitionInfoModel);

            // Open the dialog...
            this.openDialog();
        },

        /* Add the specified user to the list of new recipients... */
        addUserToRecipients: function (item) {
            // Show the recipients box...
            this.$newRecipients.show();

            // Add the item to the end of the list...
            this.$newRecipients.append(can.view("templates/shrd-recipient.ejs", item));

            // Add it to our model(s)...
            // TODO Can we get the ReportRecipients model to manage both lists?
            this.recipientsModel.addNewRecipient(item.value, "AC");
            this.newRecipientUserIDs.push(item.value);

            // Update our autocomplete list of users...
            this.updateUserList();
        },

        changeOKButtonStatus: function () {
            //if no new user is selected or no action is taken on existing users then disable the "OK" button
            if (this.newRecipientUserIDs.length <= 0 && this.recipientsModel.newRecipsArray.length <= 0) {
                this.disableButton("OK");
                this.$emailExistRecips.prop("checked", false);
                this.$emailExistRecips.prop("disabled", true);
            }
        },

        /* Handle the selection of a recipient */
        ".users-auto-complete autocompleteselect": function (el, ev, ui) {
            // Prevent the default action: fill in the input field with the selected user...
            ev.preventDefault();

            // Clear out the text that the user has entered thus far...
            el.val("");

            // Add the selected user to the list of recipients...
            this.addUserToRecipients(ui.item);
        },

        /* Handle when the user focus on an item. */
        ".users-auto-complete autocompletefocus": function (el, ev, ui) {
            ev.preventDefault();
        },

        /* Handle when a user tries to delete a newly added recipient */
        ".delete-recipient-container click": function (el, ev) {
            var parentDiv = $(el).parent(".recipient"),
                userID = parentDiv.attr("userid");

            // Remove the element...
            parentDiv.remove();

            // Remove the user ID from the list...
            this.newRecipientUserIDs = $.grep(this.newRecipientUserIDs, function (n, i) {
                return (n != userID);
            });
            this.recipientsModel.removeNewRecipient(userID);

            // Show or hide the new recipients section...
            this.$newRecipients[(this.newRecipientUserIDs.length > 0) ? "show" : "hide"](100);

            // Update our autocomplete list of users...
            this.updateUserList();

            this.changeOKButtonStatus();
        },

        /* Handle when a user clicks on the checkbox to email new recipients */
        ".shrd-email-recips-new click": function (el, ev) {
            var checked = el.prop("checked");

            // Hide or show the email section appropriately...
            this.$emailSection[(checked) ? "show" : "hide"](250);

            // Update our model...
            this.recipientsModel.attr("notifyNew", checked);
        },

        /* Handle when a user clicks on the checkbox to email existing recipients */
        ".shrd-email-recips-existing click": function (el, ev) {
            var checked = el.prop("checked");

            // Update our model...
            this.recipientsModel.attr("notifyExisting", checked);
        },

        /* Handle when a user clicks on the "Revoke" checkbox... */
        ".revoke-euser-action click": function (el, ev) {
            var checked = el.prop("checked"),
                userid = el.parents("td").attr("userid"),
                partStatusValue = (checked) ? "RV" : "AC";

            // Store the new status...
            this.recipientsModel.modifyExistingRecipient(userid, partStatusValue);
            this.changeOKButtonStatus();
        },

        /* Handle when a user clicks on the "Remove from the list" checkbox... */
        ".remove-euser-action click": function (el, ev) {
            var checked = el.prop("checked"),
                userid = el.parents("td").attr("userid"),
                partStatusValue = (checked) ? "EX" : "RJ";

            // Store the new status...
            this.recipientsModel.modifyExistingRecipient(userid, partStatusValue);
        },

        /* Handle when a user clicks on the "Regrant Access" or "Remove from the list" radio... */
        ".regrant-remove-euser-action click": function (el, ev) {
            var userid = el.parents("td").attr("userid"),
                partStatusValue = el.val();

            // Store the new status...
            this.recipientsModel.modifyExistingRecipient(userid, partStatusValue);
        },

        ".nav-tabs>li click": function (el, ev) {
            this.handleSelectEvent(el);
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
