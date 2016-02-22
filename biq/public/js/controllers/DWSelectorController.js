can.Control.extend("Sentrana.Controllers.DWSelector", {

    pluginName: 'sentrana_dw_selector',
    defaults: {
        dwChoicesModel: null
    }
}, {
    init: function DWS_init() {
        $('html,body').attr('style', 'height:auto');
        // Define our jQuery Objects...
        this.$dwSelectorContainer = $(".dw-selector");
        this.$loginMsg = $(".ahrc-action-msg");
        this.updateView();

        // This is for synchronized login. So the model will be available when this controller is initialized.
        if (!this.options.dwChoicesModel.attr("choices")) {
            this.$dwList.hide();
        }

    },

    update: function (options) {
        this._super(options);
        this.updateView();
    },

    updateView: function () {
        this.$dwSelectorContainer.show();
        this.element.html(can.view('templates/dw-selector.ejs', this.options.dwChoicesModel));
        this.$loginDWSelectorHeader = this.element.find(".login-dw-selector-header");
        this.$accessBtn = this.element.find('.login-dw-selector-access-button');
        this.$dwList = this.element.find('.login-dw-selector-dwlist');
        this.$dwSelector = this.element.find('.login-dw-selector');
        this.$dwSelectorBarSpan = this.element.find('.login-dw-selector span');

        if (!this.options.dwChoicesModel.attr("choices")) {
            this.$loginDWSelectorHeader.hide();
            this.$accessBtn.hide();
        }
        else {
            if (this.options.dwChoicesModel.choices.length <= 0) {
                var that = this;

                // Get the currently saved user info...
                var userInfo = this.options.app.retrieveUserInfo();

                // Only open the repository not found modal once
                if (!this.repositoryNotFoundModal) {
                    Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.repository.not_found.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.repository.not_found.dialog_msg, userInfo.userName), function () {
                        that.options.app.loginController.logout();
                        that.repositoryAccessModal = false;
                    });
                }

                this.repositoryNotFoundModal = true;

                this.$loginDWSelectorHeader.hide();
                this.$accessBtn.hide();

                return;
            }

            if (!this.options.dwChoicesModel.attr("selectedID")) {
                var repositoryFormCookie = this.getRepositoryFromCookie();
                if (!repositoryFormCookie) {
                    this.options.dwChoicesModel.attr("selectedID", this.options.dwChoicesModel.choices[0].oid);
                    this.options.dwChoicesModel.attr("selectedName", this.options.dwChoicesModel.choices[0].name);
                }
                else {
                    this.options.dwChoicesModel.attr("selectedID", repositoryFormCookie.repositoryID);
                    this.options.dwChoicesModel.attr("selectedName", repositoryFormCookie.repositoryName);

                }

            }

            this.$dwSelectorBarSpan.text(this.options.dwChoicesModel.selectedName);
            this.$dwSelectorBarSpan.attr('title', this.options.dwChoicesModel.selectedName);

            this.$accessBtn.show();
            this.$dwSelector.show();
            this.$accessBtn.button();
            this.$accessBtn.focus();

            if (!this.options.dropdownOnly) {
                if (this.options.app.sharedInfo) {
                    this.options.dwChoicesModel.attr("selectedID", this.options.app.sharedInfo.repository);
                    this.element.trigger("repository_selected", this.options.dwChoicesModel);
                }else if (this.options.dwChoicesModel.choices.length === 1) {
                    this.element.trigger("repository_selected", this.options.dwChoicesModel);
                }
            }
        }

        if (this.options.dropdownOnly) {
            this.$loginDWSelectorHeader.hide();
            this.$accessBtn.hide();
            if (this.options.dwChoicesModel.choices && this.options.dwChoicesModel.choices.length === 1) {
                this.$dwSelector.css('cursor', 'default');
            }
        }

    },

    getRepositoryFromCookie: function () {
        if (!this.options.app) {
            return false;
        }

        var repositoryID,
            repositoryName;

        var repoInfo = this.options.app.retrieveRepositoryInfo();
        if (repoInfo) {
            repositoryID = repoInfo.repositoryID;
            repositoryName = repoInfo.repositoryName;
        }

        if (!repositoryID || !repositoryName || repositoryID.length <= 0 || repositoryName.length <= 0) {
            return false;
        }

        return {
            repositoryID: repositoryID,
            repositoryName: repositoryName
        };
    },

    hasPreviousSelection: function () {
        if (this.options.dwChoicesModel.previousID && this.options.dwChoicesModel.previousName && this.options.dwChoicesModel.previousID.length > 0 && this.options.dwChoicesModel.previousName.length > 0) {
            return true;
        }
        return false;
    },

    resetSelectedDw: function () {
        if (this.options.app && !this.options.app.repositoryChanged) {
            if (this.hasPreviousSelection) {

                this.$dwSelectorBarSpan.text(this.options.dwChoicesModel.previousName);
                this.$dwSelectorBarSpan.attr('title', this.options.dwChoicesModel.previousName);

                this.options.dwChoicesModel.attr("selectedID", this.options.dwChoicesModel.previousID);
                this.options.dwChoicesModel.attr("selectedName", this.options.dwChoicesModel.previousName);

                this.options.dwChoicesModel.previousID = this.options.dwChoicesModel.attr("selectedID");
                this.options.dwChoicesModel.previousName = this.options.dwChoicesModel.attr("selectedName");

                this.options.app.saveRepository(this.options.dwChoicesModel.selectedID, this.options.dwChoicesModel.selectedName);
            }
        }
    },
    // Browser Event: What to do when user wants to perform a drill down...
    ".login-dw-selector-access-button click": function (el, ev) {
        this.element.trigger("repository_selected", this.options.dwChoicesModel);
    },

    ".login-dw-selector change": function (el, ev) {
        var selectedOption = $("option:selected", el);
        var selectedID = $(selectedOption).attr("value");
        var selectedName = $(selectedOption).text();
        if (selectedID === this.options.dwChoicesModel.attr('selectedID')) {
            // Write even tto the action log
            var actionLog = {
                ActionName: Sentrana.ActionLog.ActionNames.RepositoriesAccessed,
                Context: Sentrana.ActionLog.Contexts.BuilderPage,
                ElementType: Sentrana.ActionLog.ElementTypes.Repository,
                ElementId: el.attr("elementID")
            };

            this.options.app.writeActionLog(actionLog);
            return;
        }
        this.options.dwChoicesModel.attr("selectedID", selectedID);
        this.options.dwChoicesModel.attr("selectedName", selectedName);

        if (this.options.dropdownOnly) {
            can.trigger(this.element, "DWSelectionChanged", {
                oid: selectedID,
                name: selectedName
            });
        }
    },

    // Browser Event: What to do when the model changes...
    "{dwChoicesModel} change": function (dwChoicesModel, ev, attr, how, newVal, oldVal) {
        switch (attr) {
        case "choices":
            // After loading the repository list, hide this msg element.
            this.$loginMsg.hide();
            this.updateView();
            // Display the header
            this.$loginDWSelectorHeader.show();
            break;
        case "selectedName":
            this.options.dwChoicesModel.previousName = oldVal;
            break;
        case "selectedID":
            this.options.dwChoicesModel.previousID = oldVal;
            break;
        default:
            break;
        }
    }
});
