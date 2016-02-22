Sentrana.Dialogs.ShareReport("Sentrana.Dialogs.ShareBooklet", {
    pluginName: 'sentrana_dialogs_share_booklet',
    defaults: {
        title: "Share Booklet",
        autoOpen: false,
        buttons: [{
            label: "CANCEL",
            className: "btn-cancel btn-default"
        }, {
            label: "UNSHARE",
            className: "btn-unshare btn-default",
            disabled: true
        }, {
            label: "OK",
            className: "btn-ok btn-primary",
            disabled: true
        }]
    }
}, {

    init: function (el, options) {
        this._super(el, options);

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
        this.$existRecips = $(".table tbody", this.element.find("#shrd-tab-existing-booklet"));
    },

    loadForm: function (bookletModel) {
        this.booklet = bookletModel;
        var truncRptName = (this.booklet.name.length > this.options.maxRptName) ? this.booklet.name.substr(0, this.options.maxRptName) + "..." : this.booklet.name + "-By " + this.booklet.createUser;
        this.element.find(".modal-title").html("<span class='header-title-part-1'>Share:</span><span class='header-title-part-2'> '" + truncRptName + "'</span>");
        this.loadUsers(this.booklet);
        this.$newRecipients.empty();
        this.$newRecipients.hide();
        this.senderUserID = this.options.app.retrieveUserInfo().userID;
        this.newRecipientUserIDs = [];
        this.$userAutoComp.val("");
        this.$emailNewRecips.prop("checked", false);
        this.$emailExistRecips.prop("checked", false);
        this.$emailExistRecips.prop("disabled", true);
        this.$emailSubject.val("Booklet Routing: " + this.booklet.name + "-by " + this.booklet.createUser);
        this.$emailBody.val("");
        this.loadExistingRecipients(this.booklet);
        this.$emailSection.hide();
        //select the first tab
        $("#share-booklet-tabs li:eq(0) a").tab('show');
    },
    loadUsers: function (bookletModel) {
        var that = this;

        if (this.recipientsModelID === bookletModel.id) {
            this.showLoadingUsers(false);
            return;
        }

        this.showLoadingUsers(true);

        this.usersPromise = $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Booklets/" + bookletModel.id + "/PossibleRecipients"),
            type: "GET",
            dataType: "json"
        }).pipe(function (data) {

            that.userInfoArray = data;
            that.userInfoMap = {};
            $.each(that.userInfoArray, function (index, userInfo) {

                userInfo.fullName = userInfo.firstName + " " + userInfo.lastName + " " + "(" + userInfo.companyName + ")";

                that.userInfoMap[Sentrana.Models.BookletRecipients.toUserKey(userInfo.userID)] = userInfo;
            });

            that.recipientsModelID = bookletModel.id;
            return that.userInfoMap;
        });
    },

    loadExistingRecipients: function (bookletModel) {

        var recipientsPromise = Sentrana.Models.BookletRecipients.findOne({
            id: bookletModel.id,
            app: this.options.app
        });

        var that = this;
        $.when(recipientsPromise, that.usersPromise).done(function (recipientsModel, usersPromiseInfo) {

            that.recipientsModel = recipientsModel;
            that.recipientsModel.attr('id', bookletModel.id);

            that.recipientsModel.bind("change", function () {

                if (that.recipientsModel.hasChanges()) {
                    that.enableButton("OK");
                }
                else {
                    that.disableButton("OK");
                }

                that.$emailExistRecips.prop("checked", that.recipientsModel.isEmailNotificationEnabled() ? that.$emailExistRecips.prop("checked") : false);
                that.$emailExistRecips.prop("disabled", !that.recipientsModel.isEmailNotificationEnabled());
            });

            function sortFullNamesAsc(a, b) {
                var toUserKey = Sentrana.Models.BookletRecipients.toUserKey,
                    fa = that.userInfoMap[toUserKey(a.userID)].fullName,
                    fb = that.userInfoMap[toUserKey(b.userID)].fullName;

                return (fa < fb) ? -1 : ((fa > fb) ? 1 : 0);
            }
            //            that.recipientsModel.existingRecipsArray.sort(sortFullNamesAsc);

            that.$existRecips.html(can.view("templates/shrd-existing-recips.ejs", {
                recipModel: that.recipientsModel,
                userInfoMap: that.userInfoMap,
                id: "B" + that.recipientsModel.id
            }));

            var noExistingRecips = that.recipientsModel.numExistingRecipients() === 0;

            that.filteredUserInfoArray = $.grep(that.userInfoArray, function (userInfo, index) {
                return !that.recipientsModel.hasExistingRecipient(userInfo.userID);
            });

            that.updateUserList();
            that.showLoadingUsers(false);

            that.$userAutoComp.focus();
        }).fail(function (jqXHR, textStatus, errorThrown) {

            //if (jqXHR.isRejected()) {

            var errorMsg = jqXHR.getResponseHeader("ErrorMsg");

            if (errorMsg !== app_resources.app_msg.session_time_out) {
                Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.ajax_error.recipient.load.failed.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.ajax_error.recipient.load.failed.dialog_msg));
            }
            //}
        });
    },

    handleSelectEvent: function (el) {
        if ($(el).find('a').attr('href') === '#shrd-tab-existing-booklet') {
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

    handleOK: function () {
        var that = this;

        this.recipientsModel.attr("subjectNew", this.$emailSubject.val());
        this.recipientsModel.attr("bodyNew", this.$emailBody.val());

        this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.share_report.update_recipients));

        var promise = this.recipientsModel.save();
        promise.done(function (data) {

            that.updateStatus(false, "Success!");
            that.closeDialog();

            // that.booklet.reloadCommentStream();

            if (that.hasShare(data.existingRecipsArray)) {
                that.booklet.shared = true;
            }
            else if (!that.isEmpty(data.newRecipsMap)) {
                if (that.providedShare(data.newRecipsArray)) {
                    that.booklet.shared = true;
                }
                else {
                    that.booklet.shared = false;
                }
            }
            else {
                that.booklet.shared = false;
            }

            that.options.parent.changeBookletIcon(that.booklet);
        });
        promise.fail(function (promise) {

            var msg = "Failure: " + promise.getResponseHeader("ErrorMsg");
            that.updateStatus(false, msg, 'fail');

        });
    },

    handleUNSHARE: function () {
        var that = this;

        this.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.share_report.deleting_recipients));

        var promise = this.recipientsModel.destroy();
        promise.done(function (data) {

            that.updateStatus(false, "Success!");
            that.closeDialog();
            //that.booklet.reloadCommentStream();
            that.booklet.shared = false;
            that.options.parent.changeBookletIcon(that.booklet);
        });
        promise.fail(function (promise) {
            var msg = "Failure: " + promise.getResponseHeader("ErrorMsg");
            that.updateStatus(false, msg, 'fail');
        });
    }

});
