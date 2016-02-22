Sentrana.Controllers.ApplicationShellController.extend("Sentrana.Controllers.BIQController", {

    pluginName: 'sentrana_biq',
    defaults: {},
    //sessionID: "",
    userLoginId: "",
    repositoryID: "",
    methodMap: {},
    repositoryCookiePrefix: 'repo',
    menuCookiePrefix: 'menu',
    pageBuilderReportInfoPrefix: 'pg-builder-report-info',

    convertParamMapToUrlParams: function BIQC_convertParamMapToUrlParams(params) {
        var nameValuePairs = [];
        for (var p in params) {
            nameValuePairs.push(p + "=" + escape(params[p]));
        }

        return nameValuePairs.join("&");
    },

    generateUrl: function BIQC_generateUrl(method, params) {

        var endpoint_method = method.substr(0, method.indexOf("/") > 0 ? method.indexOf("/") : method.length);

        if (!this.methodMap[endpoint_method.toLowerCase()]) {
            Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.method_map.no_entry.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.method_map.no_entry.dialog_msg, method), function () {
                return null;
            });
        }

        params = params || {};
        if (this.repositoryID) {
            params.repositoryid = this.repositoryID;
        }
        return this.methodMap[endpoint_method.toLowerCase()] + "/" + method + "?" + this.convertParamMapToUrlParams(params);
    },

    //navBarModel:{
    //    logo: {
    //        position: 'right',
    //        visible: true
    //    },
    //    tabs:{
    //        position: 'right',
    //        visible: true
    //    },
    //    userOptions:{
    //        position: 'left',
    //        visible: true
    //    }
    //},

    // This later on should be retrieved from server side service after we have user role integrated on the server side.
    menuModel: {
        mainMenuItems: [{
            menuItem: {
                id: "saved",
                text: "Reports & Booklets"
            }
        }, {
            menuItem: {
                id: "bldr",
                text: "Builder"
            }
        }, {
            menuItem: {
                id: "edit_config",
                text: "Repository Manager"
            }
        }, {
            menuItem: {
                id: "page-layout",
                text: "Layout Demo"
            }
        }],
        subNavigationMenus: {}
    }
}, {

    getMessageByErrorCode: function (errorCode) {
        switch (errorCode) {
        case Sentrana.Enums.ErrorCode.WRONG_PASSWORD:
            return Sentrana.getMessageText(window.app_resources.app_msg.change_password.wrong_current_password_msg);
        case Sentrana.Enums.ErrorCode.PREVIOUSLY_USED_PASSWORD:
            return Sentrana.getMessageText(window.app_resources.app_msg.change_password.same_password_msg);
        case Sentrana.Enums.ErrorCode.PASSWORD_CANNOT_BE_EMPTY:
            return Sentrana.getMessageText(window.app_resources.app_msg.change_password.empty_new_password_msg);
        case Sentrana.Enums.ErrorCode.PASSWORD_FORMAT_IS_INVALID:
            return Sentrana.getMessageText(window.app_resources.app_msg.change_password.invalidPasswordformateMessage);
        case Sentrana.Enums.ErrorCode.PASSWORD_POLICY_VIOLATED:
            return Sentrana.getMessageText(window.app_resources.app_msg.change_password.passwordPolicyViolatedMessage);
        default:
            return undefined;
        }
    },
    
    "{Sentrana.Models.SavedFilterGroupInfo} destroyed": function (model, ev, destroyedItem) {
        var savedReportPageControl = $("#saved").control();
        if (savedReportPageControl) {
            savedReportPageControl.reloadReportsAndBooklets();
        }
    },

    loadServiceInfo: function () {
        var that = this;
        $.ajax({
            url: "resources/" + "serviceInfo.json",
            dataType: "json",
            async: false,
            success: function (data) {
                that.constructor.methodMap = {};
                for (var i = 0, l = (data.endpoints || []).length; i < l; i++) {
                    var endpoint = data.endpoints[i];
                    for (var j = 0, m = (endpoint.methods || []).length; j < m; j++) {
                        that.constructor.methodMap[endpoint.methods[j].toLowerCase()] = data.baseUrl + "/" + endpoint.name;
                    }
                }
            }
        });
    },

    initDOMObjects: function () {
        this.$biqMain = this.element.find('#biq-main');
        this.$mainContent = this.element.find('#biq-main');
    },

    handleGlobalAjaxComplete: function (that) {
        // create universal ajax complete handler
        $(document).ajaxComplete(function (e, xhr, settings) {
            //Check if it is a logout call or not
            var userInfo = that.retrieveUserInfo();
            if (userInfo) {
                //update the observer
                var createTime = new Date(xhr.getResponseHeader('Date'));
                that.sessionObserver.attr('createTime', createTime);
            }
            else {
                //reset the timer
                window.clearTimeout(this.sessionExtensionTimer);
            }

            if (!that.isSiletServiceCall(settings.url)) {
                $.unblockUI();
            }

            var errorCode = xhr.getResponseHeader("ErrorCode");
            var errorMsg = xhr.getResponseHeader("ErrorMsg");
            if (errorMsg === app_resources.app_msg.session_time_out) {
                // TODO We need a better way to identify a particular type of backend error...
                that.closeSession("timeout");
            }
            else if (errorCode === Sentrana.Enums.ErrorCode.REPOSITORY_RETRIEVE_FAILED) {
                errorMsg = Sentrana.getMessageText(window.app_resources.app_msg.repository.loading_error_msg);
                that.blockUI(errorMsg, that.ajaxCallStatus.ERROR, 'OK',
                    function () {
                        that.undoDwSelection();
                        $.unblockUI();
                    });
            }
        });
    },

    isSiletServiceCall: function (url) {
        if (url.indexOf("WriteActionLog") > 0) {
            return true;
        }

        if (url.indexOf("ValidateSession") > 0) {
            return true;
        }

        if (url.indexOf("GetSharingUpdate") > 0) {
            return true;
        }

        return false;
    },

    updateUserSessoinVariables: function (createTime) {
        var cookieExpireTime = new Date($.cookie('timeout'));
        if (cookieExpireTime) {
            this.lastInteractionTime = this.cookieCreateTime = createTime;
            this.cookieExpireTime = cookieExpireTime;
            this.cookieLifeTimeInMinutes = Sentrana.getDateDiff(createTime, cookieExpireTime, 'minutes');
            this.timerCallingDelayInMinutes = this.cookieLifeTimeInMinutes - app_resources.runTimerBeforeSessionExpireInMinutes;
        }
    },

    setSessionExtensionTimer: function () {
        var that = this;
        this.sessionExtensionTimer = setTimeout(function () {
            if (that.lastInteractionTime !== that.cookieCreateTime) {
                that.sessionObserver.callServiceMethodToExtendSession(that);
            }
        }, that.timerCallingDelayInMinutes * 60000); //convert in milliseconds
    },

    initUserSessionVariables: function () {
        this.lastInteractionTime = undefined;
        this.cookieLifeTimeInMinutes = undefined;
        this.cookieCreateTime = undefined;
        this.cookieExpireTime = undefined;
        this.timerCallingDelayInMinutes = undefined;
        this.sessionObserver = new Sentrana.Models.SessionKeepAlive();

        var that = this;
        this.sessionObserver.bind("change", function (ev, attr, how, newVal, oldVal) {
            if (attr === 'createTime') {
                window.clearTimeout(this.sessionExtensionTimer);
                that.updateUserSessoinVariables(newVal);
                that.setSessionExtensionTimer();
            }
        });
    },

    init: function AHRC_init() {

        var that = this;
        jQuery.support.cors = true;

        this._super();
        this.metricAtrributeMappingStatus = !Sentrana.Enums.ENABLE_METRIC_ATTRIBUTE_MAPPING_TOGGLE;
        this.initUserSessionVariables();
        this.ajaxCallStatus = {
            PROGRESS: 'progress',
            ERROR: 'error'
        };

        if (this.externalLink && this.externalLink.token === "viewsharedobject") {
            var linkInfo = this.externalLink.linkInfo;
            if (linkInfo.id && linkInfo.type && linkInfo.repository) {
                this.sharedInfo = {
                    id: this.externalLink.linkInfo.id,
                    type: this.externalLink.linkInfo.type,
                    repository: this.externalLink.linkInfo.repository
                };
                document.location.hash = "";
            }
        }

        this.loadServiceInfo(that);
        this.initDOMObjects();
        this.initDialogs();

        $(document.body).sentrana_router({
            app: this
        });

        this.repositoryViewDlg = $("#view-repository-metadata").sentrana_dialogs_view_repository_metadata({
            app: this
        }).control();
        this.handleGlobalAjaxComplete(that);
    },
    

    toggleMetricAtrributeMappingStatus: function () {
        this.metricAtrributeMappingStatus = !this.metricAtrributeMappingStatus;
    },

    filterMenuModel: function () {
        var isBIQAdmin = false;

        if (Sentrana.LoginData && Sentrana.LoginData.userInfo && Sentrana.LoginData.userInfo.appRoles) {
            var adminRole = $.grep(Sentrana.LoginData.userInfo.appRoles, function (appRoles) {
                return appRoles.id == Sentrana.Enums.ApplicationRoles.BIQ_ADMIN; // BIQ_ADMIN is the Id of the BIQ administrator role
            });

            isBIQAdmin = adminRole.length > 0;
        }

        $.each(this.constructor.menuModel.mainMenuItems, function (index, model) {
            if (model.menuItem.id === "edit_config") {
                model.menuItem.visible = isBIQAdmin;
            }

            if (model.menuItem.id === "page-layout") {
                model.menuItem.visible = isBIQAdmin;
            }
        });
    },

    redirectToCorrectPage: function (sessionInfo) {
        this.initdwChoicesModel(sessionInfo);
        this.filterMenuModel();
        var repositoryInfo = this.retrieveRepositoryInfo();
        if (repositoryInfo && repositoryInfo.repositoryID) {
            if (this.$dwSelector) {
                this.$dwSelector.hide();
            }
            this.loginController.showLoadingWheel(window.app_resources.app_msg.navigation.redirect_last_page);
            this.retrieveRepository(false, repositoryInfo.repositoryID);
        }
        else {
            this.renderDWSelector();
            this.hideLoginForm();
            this.$dwSelector.sentrana_dw_selector({
                dwChoicesModel: this.dwChoicesModel,
                app: this
            });
            this.showLoginDWSelector();
        }
    },

    blockMain: function () {
        var html = '<div class="loading"><p class="small-waitingwheel"><img src="images/loader.gif"/></p></div>';
        this.blockElement('.main', html);
        this.isMainBlocked = true;
    },

    unBlockMain: function () {
        this.unBlockElement('.main');
        this.isMainBlocked = false;
    },

    retrieveRepositoryInfo: function (loginId) {
        var repositoryID = "",
            repositoryName = "",
            userLoginId = "";

        loginId ? userLoginId = loginId : userLoginId = this.constructor.userLoginId;

        var repoInfo = $.cookie(this.constructor.repositoryCookiePrefix + userLoginId);
        
        if (repoInfo) {
            repoInfo = JSON.parse(repoInfo);
            repositoryID = repoInfo.repositoryID;
            repositoryName = repoInfo.repositoryName;
        }

        if (!repositoryID) {
            return null;
        }

        return {
            "repositoryID": repositoryID,
            "repositoryName": repositoryName
        };
    },

    saveRepository: function (id, name) {
        this.constructor.repositoryID = this.repositoryID = id;
        this.saveCookie(this.constructor.repositoryCookiePrefix + this.constructor.userLoginId, {
            "repositoryID": id,
            "repositoryName": name
        });
    },

    clearRepositoryInfo: function AHRC_clearRepositoryInfo() {
        this.saveRepository("", "");
    },

    savePageInfo: function (page) {
        this.saveCookie(this.constructor.menuCookiePrefix + this.constructor.userLoginId, {
            "lastAccessedPage": page
        });
    },

    retrievePageInfo: function () {
        var page = $.cookie(this.constructor.menuCookiePrefix + this.constructor.userLoginId);
        
        if (page) {
           page = JSON.parse(page);
           page = page.lastAccessedPage;
        }
        return page;
    },

    clearPageInfo: function () {
        this.savePageInfo("");
    },

    retrieveBuilderPageReportInfo: function () {
        return $.cookie(this.constructor.pageBuilderReportInfoPrefix + this.constructor.userLoginId);
    },

    saveBuilderPageReportInfo: function (value) {
        this.saveCookie(this.constructor.pageBuilderReportInfoPrefix + this.constructor.userLoginId, value);
    },

    clearBuilderPageReportInfo: function () {
        this.saveBuilderPageReportInfo("");
    },

    getDWRepository: function AHRC_getDWRepository() {
        return this.dwRepository;
    },

    //Override the base class method. This will show the top navigation only when the repository is loaded.
    displayNavigationHeader: function (options) {
        if (this.dwRepository) {
            this._super(options);
        }
        else {
            this.loginController.show();
            if (!this.dwChoicesModel) {
                this.loginController.showLoadingWheel(window.app_resources.app_msg.navigation.redirect_last_page);
            }
        }
    },

    retrieveRepository: function AHRC_retrieveRepository(fromLogin, repositoryid, destroyExistingController) {
        var that = this;
        that.repositoryChanged = false;

        $.ajax({
            url: this.constructor.generateUrl("Repository/" + repositoryid),
            dataType: "json",
            success: function (data) {
                if (!data) {
                    return;
                }

                if (destroyExistingController) {
                    // destroy existing controls for pages
                    $('#main-content > div').each(function (ev, el) {
                        if ($(el).control()) {
                            $(el).control().destroy();
                            $(el).html('');
                        }
                    });
                }

                that.saveRepository(data.oid, data.name);
                that.loginController.hideLoadingWheel();
                that.selectDWChoicesModel(data.oid, data.name);
                that.dwRepository = new Sentrana.Models.DataWarehouseRepository(data, that);
                that.displayNavigationHeader(that.getUserActionsForNavBar());

                // Wait for the animation to finish before launching our navigation bar...
                $.when(that.element).done(function () {
                    that.repositoryChanged = true;
                    that.isFromLogin = false;
                    var page;
                    if (that.sharedInfo) {
                        page = "saved";
                        document.location.hash = "saved";
                    }else {
                        page = that.retrievePageInfo();
                    }
                    
                    if (!page) {
                        page = 'bldr';
                    }
                    //reset the route first and then redirect to appropriate page
                    can.route.attr('page', '');
                    can.route.attr('page', page);
                });
            }
        });
    },

    selectDWChoicesModel: function (oid, name) {
        if (this.dwChoicesModel) {
            this.dwChoicesModel.attr('selectedID', oid);
            this.dwChoicesModel.attr('selectedName', name);
        }
    },

    getUserActionsForNavBar: function () {
        var userActions = [];

        userActions.push({
            templatePath: "templates/dwInfo.ejs",
            templateOptions: {},
            controllerName: "sentrana_user_options",
            controllerOptions: {},
            selector: ".dwInfo"
        });

        if (Sentrana.LoginData && Sentrana.LoginData.repositories && Sentrana.LoginData.repositories.length > 1) {
            userActions.push({
                templatePath: "templates/topNavDWSelector.ejs",
                templateOptions: {
                    dwModel: this.dwChoicesModel
                },
                controllerName: "sentrana_top_nav_dw_selector",
                controllerOptions: {
                    app: this
                },
                selector: ".top-nav-dw-selector"
            });
        }

        userActions.push({
            templatePath: "templates/appHelp.ejs",
            templateOptions: {},
            controllerName: "sentrana_user_options",
            controllerOptions: {},
            selector: ".app-help"
        });

        userActions.push({
            templatePath: "templates/userOptions.ejs",
            templateOptions: {},
            controllerName: "sentrana_user_options",
            controllerOptions: {},
            selector: ".app-user-options"
        });

        return userActions;
    },

    sessionOut: function () {
        this.sessionInfo = undefined;
        this.isSessionOut = true;
        this.lastUserLoginId = this.userLoginId;

        this.clearUserInfo();
        $('html,body').attr('style', 'height:auto');
        this.$nav.hide();
        this.$mainContent.hide();
        this.loginController.hideLoadingWheel();
        if (this.$dwSelector) {
            this.$dwSelector.hide();
        }
        this.loginController.show();
        this.loginController.showErrorMessage(Sentrana.getMessageText(window.app_resources.app_msg.session_out.dialog_msg));
        this.redirectToLogin();
        this.clearSharingUpdateTimer();
    },

    logout: function () {
        this.loginController.hideLoadingWheel();
        this.removeLoginDWSelector();
        this.clearSharingUpdateTimer();
        this._super();
    },

    clearSharingUpdateTimer: function(){
        if(this.sharingUpdate){
            window.clearInterval(this.sharingUpdate);
        }
    },

    clearApplicationInfo: function () {
        this.clearUserInfo();
        this.clearRepositoryInfo();
        this.clearPageInfo();
        this.initUserSessionVariables();
    },

    showLoginDWSelector: function () {
        this.loginController.hideLoadingWheel();
        this.hideLoginForm();
        this.$dwSelector.show();
    },

    removeLoginDWSelector: function () {
        this.showLoginForm();
        $('.signin-form').find("#repository-selector-container").remove();
    },

    showLoginContainer: function () {
        this.$loginContainer.show();
    },

    resetFilmstrip: function () {
        this.hideFilmstripButtonInNavBar();
        if (this.filmstripController) {
            this.filmstripController.hide();
            this.filmstripController.isRendered = false;
        }
    },

    showFilmstripButtonInNavBar: function () {
        $('.btn-show-hide-filmstrip').css('display', 'block');
    },

    hideFilmstripButtonInNavBar: function () {
        $('.btn-show-hide-filmstrip').css('display', 'none');
    },

    blockElement: function (el, html) {
        $(el).block({
            message: html,
            css: {
                width: 'auto',
                padding: 0,
                border: 0,
                backgroundColor: 'transparent',
                cursor: 'default'
            },
            overlayCSS: {
                backgroundColor: '#000',
                opacity: 0.3,
                cursor: 'default'

            }
        });
    },

    unBlockElement: function (el) {
        $(el).unblock();
    },

    loginSuccess: function (loginData) {
        if (this.lastUserLoginId === this.userLoginId && this.isSessionOut) {
            this.lastUserLoginId = this.userLoginId;
            this.isSessionOut = false;
            this.displayNavigationHeader(this.getUserActionsForNavBar());
            var page = this.retrievePageInfo();
            if (!page) {
                page = 'bldr';
            }
            can.route.attr('page', page);
        }
        else {
            this.constructor.userLoginId = loginData.userInfo.userName;
            this.filterMenuModel();
            this.renderDWSelector();
            this.initdwChoicesModel(loginData);
            this.hideLoginForm();
            this.$dwSelector.sentrana_dw_selector({
                dwChoicesModel: this.dwChoicesModel,
                app: this
            });
        }
    },

    isPasswordExpired: function (jqXHR) {
        var errorCode = jqXHR.getResponseHeader ? jqXHR.getResponseHeader("ErrorCode") : undefined;
        return errorCode === Sentrana.Enums.ErrorCode.PASSWORD_EXPIRED;
    },

    hideLoginForm: function () {
        this.element.find('.login-form').hide();
    },

    showLoginForm: function () {
        this.element.find('.login-form').show();
    },

    renderDWSelector: function () {
        if (!$("#repository-selector-container").length) {
            $('.signin-form').append('<div id="repository-selector-container"></div>');
            this.$dwSelector = $("#repository-selector-container");
        }
        else {
            this.$dwSelector.show();
        }
    },

    initdwChoicesModel: function (loginData) {
        this.dwChoicesModel = new Sentrana.Models.Choices();
        this.dwChoicesModel.attr("choices", loginData.repositories);
        this.dwChoicesModel.attr("jsonChoices", loginData.jsonRepositoryNames);
    },

    " repository_selected": function (el, ev, params) {
        var actionLog = {
            ActionName: Sentrana.ActionLog.ActionNames.RepositoriesAccessed,
            Context: Sentrana.ActionLog.Contexts.RepositorySelection,
            ElementType: Sentrana.ActionLog.ElementTypes.Repository,
            ElementId: params.selectedID
        };

        this.writeActionLog(actionLog);

        this.isFromLogin = true;
        this.$dwSelector.hide();
        this.loginController.showLoadingWheel(window.app_resources.app_msg.repository.loading_msg);
        this.retrieveRepository(true, params.selectedID, true);
    },

    " DWSelectionChanged": function (el, ev, params) {
        if (!this.retrieveUserInfo()) {
            return;
        }

        var actionLog = {
            ActionName: Sentrana.ActionLog.ActionNames.RepositoriesAccessed,
            Context: Sentrana.ActionLog.Contexts.UserOptions,
            ElementType: Sentrana.ActionLog.ElementTypes.Repository,
            ElementId: params.oid
        };

        this.writeActionLog(actionLog);

        var that = this;
        var lastSelectedPage = can.route.attr('page');

        this.blockUI(Sentrana.getMessageText(window.app_resources.app_msg.navigation.switch_repository), this.ajaxCallStatus.PROGRESS, 'CANCEL',
            function () {
                $.ajaxManager.abortAll();
                that.undoDwSelection();
                can.route.attr('page', lastSelectedPage);
                $.unblockUI();
            });

        this.retrieveRepository(false, params.oid, true);

    },

    " UserSelectionChanged": function (el, ev, params) {
        switch (params.action) {
        case "changepwd":
            this.changePasswordController.open();
            break;
        case "help":
            var actionLog = {
                ActionName: Sentrana.ActionLog.ActionNames.HelpAccesss,
                Context: Sentrana.ActionLog.Contexts.ReportOption,
                ElementType: Sentrana.ActionLog.ElementTypes.HelpPage,
                ElementId: 'help/index.html'
            };

            this.writeActionLog(actionLog);
            window.open("help/index.html", "_blank");
            break;
        case "dwInfo":
            this.showDWinfo();
            break;
        case "logout":
            this.loginController.logout();
            break;
        default:
            break;
        }
    },

    initDialogs: function () {
        this.shareRptDlg = $("#share-report-dialog").sentrana_dialogs_share_report({
            app: this
        }).control();
    },

    " share_report": function (el, ev, report) {
        this.shareRptDlg.open(report);
    },

    changeReportIcon: function (report) {
        var savedReportPageControl = $("#saved").control();
        if (savedReportPageControl) {
            savedReportPageControl.changeReportIcon(report);
        }
    },

    showDWinfo: function () {
        var actionLog = {
            ActionName: Sentrana.ActionLog.ActionNames.ViewRepositoryInformation,
            Context: Sentrana.ActionLog.Contexts.RepositoryInformation,
            ElementType: Sentrana.ActionLog.ElementTypes.Dialog
        };

        this.writeActionLog(actionLog);
        this.repositoryViewDlg.open();
    },

    switchToPage: function (page, event, eventParams) {
        document.location.hash = can.route.url({
            "page": page
        });

        this.routeEvent = event;
        this.routeEventParams = eventParams;
    },

    //override the base method
    showPasswordResetPage: function (token) {
        this.hideNavigationHeader();
        this.loginController.showResetPasswordForm(token);

        //remove the repository selector
        if (this.$dwSelector) {
            this.$dwSelector.hide();
        }
    },

    updateScreen: function (page) {
        var that = this;
        $('#application-loading-wheel').hide();
        if (page !== "login") {
            this.displayNavigationHeader();
            this.savePageInfo(page);
            if (!this.dwRepository) {
                return;
            }
        }
        switch (page) {
        case "login":
            // Check if redirected to login from Application Shell
            if (Sentrana.ApplicationStorage.getData("redirectedToLogin")) {
                Sentrana.ApplicationStorage.setData("redirectedToLogin", false);
            }

            if(this.retrieveRepositoryInfo(this.constructor.userLoginId)){
                return;
            }

            if (this.sessionInfo) {
                this.redirectToCorrectPage(this.sessionInfo);
            }
            else {
                this.hideNavigationHeader();
                this.removeLoginDWSelector();
                this.loginController.show();
                this.loginController.showLoginForm();
            }
            break;
        case "saved":
            $("#saved").show();
            $("#saved").sentrana_saved_reports({
                app: this
            });
            break;
        case "bldr":
            $("#bldr").show();
            $("#bldr").sentrana_builder_page({
                app: this
            });
            break;
        case "page-layout":
            $("#page-layout").show();
            $("#page-layout").sentrana_page_layout_demo({
                    app: this
                });
                break;
        case "edit_config":
            $("#edit_config").show();
            $("#edit_config").sentrana_configuration_manager({
                app: this,
                editorsMaxLine: 43,
                editorsMinLine: 43,
                serviceMethodMap: {
                    "getConfigurationGroup": "getRepo",
                    "saveConfigurationGroup": "SaveRepository",
                    "getAllConfigurationGroup": "GetRepoList",
                    "getAllConfigurationGroupNames": "getRepoNameList",
                    "saveSelectedConfiguration": "SaveConfigFile",
                    "saveAllConfiguration": "SaveAllConfigFiles",
                    "deleteConfigurationGroup": "DeleteRepository",
                    "publishConfigFiles": "PublishConfigChange",
                    "uploadConfigFiles": "UploadConfigFiles",
                    "downloadConfigurationGroup": "DownloadConfigurationFiles"
                },
                labels: {
                    "groupsHeader": "Repositories",
                    "addGroupBtnLitle": "Add Repository",
                    "groupName": "repository"
                },
                fixedConfigurations: ["Repository", "Datafilter", "MetricDimensionMappings"],
                selectedGroup: that.retrieveRepositoryInfo().repositoryID
            });
            break;
        case "logout":
            this.loginController.logout();
            Sentrana.ApplicationStorage.setData("redirectedToLogin", true);
            can.route.attr("page", 'login');
            break;
        default:
            break;
        }

        if (this.routeEvent) {
            $('#' + page).trigger(this.routeEvent, this.routeEventParams);
            this.routeEvent = undefined;
            this.routeEventParams = undefined;
        }
    },

    blockUI: function (message, status, buttonCaption, buttonCallbackFunction) {
        var html = $('<div class="sentrana-common-dlg"></div>').html(can.view('templates/commonDlg.ejs', {
            headerText: 'Business IQ',
            bodyText: message,
            status: status,
            buttonCaption: buttonCaption
        }));

        $.blockUI({
            message: html,
            css: {
                padding: 0,
                width: 500,
                left: '30%'
            },
            overlayCSS: {
                backgroundColor: '#000',
                opacity: 0.3
            }
        });

        $('.block-ui-btn', $('.sentrana-common-dlg')).button().click(function () {
            /* If the callback function is not empty then call it*/
            if (buttonCallbackFunction && typeof buttonCallbackFunction === 'function') {
                buttonCallbackFunction();
            }
        });
    },

    undoDwSelection: function () {
        if (this.isFromLogin) {
            this.showLoginDWSelector();
        }
    },

    "{document} click": function (el, ev) {
        this.handleUserInteraction();
    },

    "{document} keydown": function (el, ev) {
        this.handleUserInteraction();
    },

    handleUserInteraction: function () {
        if (this.lastInteractionTime) {
            var userInfo = this.retrieveUserInfo();
            if (!userInfo || !userInfo.sessionId) {
                this.closeSession("timeout");
            }
            else {
                var dateToCompare = this.addMinutes(this.cookieCreateTime, this.timerCallingDelayInMinutes);

                if (dateToCompare) {
                    if (new Date() > dateToCompare) {
                        this.sessionObserver.callServiceMethodToExtendSession(this);
                    }
                    else {
                        this.lastInteractionTime = new Date();
                    }
                }
            }
        }
    },

    addMinutes: function (date, minutes) {
        if (date && minutes) {
            return new Date(date.getTime() + minutes * 60000);
        }

        return null;
    },

    // Found it one the web
    // http://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
    post: function (path, params, method) {
        method = method || "post"; // Set method to post by default if not specified.

        // The rest of this code assumes you are not using a library.
        // It can be made less wordy if you use one.
        var form = document.createElement("form");
        form.setAttribute("method", method);
        form.setAttribute("action", path);

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", params[key]);

                form.appendChild(hiddenField);
            }
        }

        document.body.appendChild(form);
        form.submit();
    },

    writeActionLog: function (actionLog) {
        if (!actionLog) {
            return;
        }

        $.ajax({
            url: this.constructor.generateUrl('WriteActionLog'),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(actionLog),
            success: function (data) {

            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        });
    }
});

// http://stackoverflow.com/questions/1802936/stop-all-active-ajax-requests-in-jquery
$.ajaxManager = (function () {
    var id = 0,
        Q = {};

    $(document).ajaxSend(function (e, jqx) {
        jqx._id = id + 1;
        Q[jqx._id] = jqx;
    });
    $(document).ajaxComplete(function (e, jqx) {
        delete Q[jqx._id];
    });

    return {
        abortAll: function () {
            var r = [];
            $.each(Q, function (i, jqx) {
                r.push(jqx._id);
                jqx.abort();
            });
            return r;
        }
    };
})();
