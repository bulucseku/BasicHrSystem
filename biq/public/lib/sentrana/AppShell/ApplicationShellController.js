/***********************************************************************/
/*                             WARNING                                 */
/* Do not steal ApplicationShellController.js in any other controller. */
/* This would create a circular dependency, which StealJS is not yet   */
/* equipped to handle. This controller will act as the root of a DFS   */
/* that steals all others.                                             */
/***********************************************************************/
steal("lib/sentrana/AppShell/ApplicationStorage.js",
    "lib/sentrana/AppShell/SessionKeepAliveController.js",
    "lib/sentrana/AppShell/SentranaApplicationShell.js",
    "lib/sentrana/Navigation/stealNavigation.js",
    "lib/sentrana/Authentication/StealAuthenticationModule.js",
         function() {

    can.Control.extend('Sentrana.Controllers.ApplicationShellController', {
        // You can add class fields here.
        pluginName: 'sentrana_application_shell',

        // You can add class fields here.

        // Application name, or base url.
        appName: "",

        /* This is the session ID associated with the logged on user. */
        sessionID: "",

        // Class method: Convert a map of parameters into a URL string of name/value parameters...
        convertParamMapToUrlParams: function ASC_convertParamMapToUrlParams(params) {
            // Loop through the parameters...
            var nameValuePairs = [], p;
            for (p in params) {
                if (params.hasOwnProperty(p)) {
                    nameValuePairs.push(p + "=" + escape(params[p]));
                }
            }

            return nameValuePairs.join("&");
        },

        // Class method: Generate a URL for a middle tier WCF service after specifying the base URL, service method and parameter map
        // TODO Consider a method to return an AJAX object with URL set (along with other fields). What does the caller have to specify
        // to make this known?
        generateUrl: function ASC_generateUrl(method, params) {
            // Ensure we have an object to work with...
            params = params || {};

            // Do we have a non-null session ID?
            // TODO For RESTful method calls, the session ID (and repository ID) are supplied as header fields.
            // WE should try to make all of our backend APIs more consistent so that, for example, the session ID
            // is also supplied as an HTTP header.
            //if (this.sessionID) {
            //    params['sessionid'] = this.sessionID;
            //}

            // Add a time stamp...
            // TODO Should we use the cache property as a more reliable way to ensure that this call's data is not cached?
            // params['_ts'] = new Date().getTime();

            return "/" + method + "?" + this.convertParamMapToUrlParams(params);
        },
        // Following empty funciton will get overwritten by sub classes.
        initApp: function() {}
    }, {
        init: function() {
            var that = this;

            this.$mainContainer = this.element.find("#main-container");
            this.$nav = this.element.find("#top-nav");
            this.$loginContainer = this.element.find('#login-container');
            this.$mainContent = this.element.find('#main-content');
            this.$changePassword = this.element.find('#change-password');

            this.checkForExternalLink();
            // Load the service/deployment information file...
            this.loadServiceInfo();

            // Setup the ajax prefilter (which is only invoked for "json" requests)
            $.ajaxPrefilter("json script", function(options, originalOptions, jqXHR) {
                // Modify the URL to include both the IIS application name
                // as well as the service endpoint name (which is inferred from
                // the service method name)...

                // Add common HTTP request headers used by all service endpoint methods...
                jqXHR.setRequestHeader("sessionID", that.getSessionId());
            });
        },

        checkForExternalLink: function () {
            //#!viewsharedobject?id=38b6f387-35a8-4541-9b7d-298c53de5443&type=report&repositry=farmland
            //Above is an example of hash value, we are removing "#!" and spliting it by "?"
            var hash = unescape(document.location.hash).replace('#', '').replace('!', '').split("?");

            if (hash.length !== 2) {
                return;
            }

            var linkToken = hash[0], linkParams = hash[1];

            var keyValuePairs = linkParams.split("&");
            this.externalLink = {
                token: $.trim(linkToken),
                linkInfo: this.getLinkInfoAsObject(keyValuePairs)
            };

        },

        getLinkInfoAsObject: function (keyValuePairs) {
            var linkInfo = {};
            for (var i = 0; i < keyValuePairs.length; i++) {
                var splitedKeyValue = keyValuePairs[i].split("=");
                linkInfo[splitedKeyValue[0]] = $.trim(splitedKeyValue[1].replace(/['"]+/g, ''));
            }

            return linkInfo;
        },

        start: function() {
            this.loginController = this.$loginContainer.sentrana_login_page({
                app: this
            }).control();

            this.$mainContainer.show();
            this.changePasswordController = this.$changePassword.sentrana_change_password({
                app: this
            }).control();

            this.sessionKeepAliveController = new Sentrana.Controllers.SessionKeepAliveController(this);

            if (!this.isResetPasswordUrl()) {
                var userInfo = this.retrieveUserInfo(), rememberMeInfo = this.retrieveRememberMeInfo(), sessionInfo = null;
                this.loginController.setCookieInfo(rememberMeInfo);
                if (userInfo) {
                    sessionInfo = this.loginController.checkLogin(userInfo.userName);
                }
            } else {
                // If we are resetting password then clear any currently logged in user
                this.clearUserInfo();
            }

            if (sessionInfo) {
                this.redirectToCorrectPage(sessionInfo);
            } else {
                this.saveDataInAppStorage("redirectedToLogin", true);
                this.saveDataInAppStorage("lastAppState", {
                    userId: null,
                    urlHash: window.location.hash
                });
                this.redirectToLogin();
            }
        },

        redirectToCorrectPage: function () {
            if (this.isResetPasswordUrl()) {
                document.location.hash = can.route.url({
                    "page": document.location.hash
                });
            } else {
                document.location.hash = can.route.url({
                    "page": "home"
                });
            }
        },

        isResetPasswordUrl: function () {
            var hash = unescape(document.location.hash);
            var splitdUrl = hash.split("token=");
            if (splitdUrl.length === 2) {
                return true;
            } else {
                return false;
            }
        },

        updateScreen: function() {
            //this empty method need to be overwritten by specific app main controller
        },

        //this method need to be overwritten by specific app main controller
        isPasswordExpired: function (data) {
            return false;
        },

        getServerErrorMessage: function (jqXHR, textStatus, errorThrown) {
            //this method need to be overwritten by specific app main controller if needed
            var errorText = "";
            if (jqXHR.readyState === 4 && jqXHR.status !== 404) {//The request is complete and resource found
                var errorCode = jqXHR.getResponseHeader("ErrorCode"),
                    errorMsg = jqXHR.getResponseHeader("ErrorMsg");

                if (errorCode && errorCode.trim()) {
                    //this method need to be overwritten by specific app main controller
                    errorText = this.getMessageByErrorCode(errorCode);
                }

                if (!errorText || !errorText.trim()) {
                    if (errorMsg && errorMsg.trim()) {
                        errorText = errorMsg;
                    } else {
                        errorText = jqXHR.responseJSON ? jqXHR.responseJSON.message : jqXHR.responseText;
                    }
                }

            } else {
                errorText = "The requested URL was not found.";
            }

            return errorText;
        },

        getClientErrorMessage: function (messageKey) {
            //this method need to be overwritten by specific app main controller if needed
            var errorText = this.getMessageByKey(messageKey);
            return errorText ? errorText.trim() : errorText;
        },

        getMessageByErrorCode: function (errorCode) {
            //this empty method need to be overwritten by specific app main controller
        },

        getMessageByKey: function (messageKey) {
            //this empty method need to be overwritten by specific app main controller
        },

        // Define a method which loads the service/deployment information...
        loadServiceInfo: function() {
            var that = this, i, j, l, m;
            $.ajax({
                url: "resources/" + "deployment.json",
                dataType: "json",
                async: false,
                success: function(data) {
                    that.constructor.appName = data.baseUrl;
                }
            });
        },

        // Map the original URL (which may look like "/Organizations") to
        // a full name which includes the service endpoint name...
        expandServiceUrl: function(origUrl) {
            // remove the beginning slash.
            origUrl = origUrl.substr(0, 1) === "/" ? origUrl.substr(1, origUrl.length) : origUrl;
            // Compute the name of the endpoint method (as RESTful endpoints can include paths)
            var pos;
            if (origUrl.indexOf("?") > 0) {
                pos = origUrl.indexOf("?");
            } else {
                pos = origUrl.indexOf("/") > 0 ? origUrl.indexOf("/") : origUrl.length;
            }
            var endpoint_method = origUrl.substr(0, pos);

            if (endpoint_method === 'resources') {
                return origUrl;
            }

            return this.constructor.appName + "/" + origUrl;
        },

        getSessionId: function() {
            return this.constructor.sessionId;
        },

        // Application message related functions.
        hideAppMessage: function() {
            this.$appActionMsg.hide();
        },

        showAppMessage: function(message) {
            this.$appActionMsg.show();
            this.$appActionMsg.html(message);
        },

        showAppMessageWithBusyWheel: function(message) {
            this.$appActionMsg.show();
            this.$appActionMsg.html('templates/loadingwheel.ejs', {
                message: message
            });
        },

        loginSuccess: function(sessionInfo) {
            this.sessionInfo = sessionInfo;
        },

        loginFailure: function() {
            // TODO implement all application specific login failure handling here
            // this.hideLoginDWSelector();
        },

        loginComplete: function() {
            this.app.loginSuccess();
            this.app.hideAppMessage();
        },

        sessionOut: function() {
            this.logout();
        },

        // Logout function
        logout: function ASC_logout() {
            this.sessionInfo = undefined;
            // Remove any stored user credentials...
            this.clearUserInfo();
            // This is going to be a callback function passed in by specific application.
            this.clearApplicationInfo();

            $('html,body').attr('style', 'height:auto');

            // Display the login...
            this.$nav.hide();
            this.$mainContent.hide();
            this.loginController.show();

            this.redirectToLogin();
        },

        clearApplicationInfo: function() {
            return null;
        },

        // Cookie related functions.
        // Instance method: Save a cookie (to last the duration of this session)...
        // TODO Investigate jQueryMX enhancements for cookies
        saveCookie: function ASC_saveCookie(name, value, domain) {
            var expiresInDays = 14;

            if ( value instanceof Object === false) {
                $.cookie(name, value, {
                    expires: expiresInDays,
                    path: "/",
                    domain: domain
                });
            } else {
                $.cookie(name, JSON.stringify(value), {
                    expires: expiresInDays,
                    path: "/",
                    domain: domain
                });
            }
        },

        retrieveRememberMeInfo: function ASC_retrieveRememberMeInfo() {
            var rememberMe = $.cookie("rememberMe") === "true", userNameToRemember = $.cookie("userNameToRemember");

            return {
                "rememberMe": rememberMe,
                "userNameToRemember": userNameToRemember
            };
        },


        // Instance method: Return information about the currently logged on user or NULL if user is not logged in...
        retrieveUserInfo: function ASC_retrieveUserInfo() {
            var userInfo = {
                userName: $.cookie("userName"),
                userId: $.cookie("userID"),
                fullName: $.cookie("fullName"),
                orgName: $.cookie("orgName"),
                sessionId: $.cookie("sessionId"),
                isDeveloper: $.cookie("isDeveloper") === "true",
                rememberMe: $.cookie("rememberMe") === "true",
                userNameToRemember: $.cookie("userNameToRemember"),
                applications: $.cookie("applications"),
                applicationId: $.cookie("applicationId")
            };

            // If we don't have values for all fields, indicate null
            return (userInfo.userName && userInfo.sessionId) ? userInfo : null;
        },

        // Instance method: Save information about the currently logged on user...
        saveUserInfo: function ASC_saveUserInfo(userInfo) {
            var rememberMe = $('#id-chk-remember-me:checked').length > 0, userNameToRemember = "";
            if (rememberMe) {
                if (userInfo.userName.length > 0) {
                    userNameToRemember = userInfo.userName;
                } else {
                    var rememberMeInfo = this.retrieveRememberMeInfo();
                    userNameToRemember = rememberMeInfo.userNameToRemember;
                }

            }
            var domain = document.domain;
            var regex = /(?:[^.]+\.)*([^.]+\.(?:[a-zA-Z]{3}|[a-zA-Z]{2}))/;
            var match = regex.exec(domain);
            var baseDomain = match ? match[1] : match;

            this.saveCookie("userName", userInfo.userName, baseDomain);
            this.saveCookie("userNameToRemember", userNameToRemember, baseDomain);
            this.saveCookie("fullName", userInfo.fullName, baseDomain);
            this.saveCookie("userID", userInfo.userID, baseDomain);
            this.saveCookie("isDeveloper", userInfo.isDeveloper, baseDomain);
            this.saveCookie("rememberMe", rememberMe, baseDomain);
            this.saveCookie("orgName", userInfo.orgName, baseDomain);
            this.saveCookie("applications", userInfo.applications, baseDomain);
        },

        // Instance method: Clear information about the currently logged on user...
        clearUserInfo: function ASC_clearUserInfo() {
            this.saveUserInfo({
                "userName": "",
                "fullName": "",
                "isDeveloper": "false",
                "userID": "",
                "sessionId": ""
            });
        },

        saveSessionInfo: function ASC_saveSessionInfo(sessionId) {
            this.saveCookie("sessionId",sessionId);
        },

        clearSessionInfo: function ASC_clearSessionInfo() {
            this.saveSessionInfo("");
        },

        retrieveSessionInfo: function ASC_retrieveSessionInfo() {
          return $.cookie("sessionId");
        },

      redirectToLogin: function () {
          if (this.isResetPasswordUrl()) {
              document.location.hash = can.route.url({
                  "page": document.location.hash
              });
          } else {
              document.location.hash = can.route.url({
                  "page": "login"
              });
          }
        },

        showPasswordResetPage: function(token) {
            this.hideNavigationHeader();
            this.loginController.showResetPasswordForm(token);
        },

        saveDataInAppStorage: function(propertyName, propertyValue) {
            Sentrana.ApplicationStorage.setData(propertyName, propertyValue);
        },

        getDataFromAppStorage: function(propertyName) {
            return Sentrana.ApplicationStorage.getData(propertyName);
        },

        displayNavigationHeader: function(userActions) {
            if (this.constructor.menuModel) {
                var userInfo = this.retrieveUserInfo();
                this.$nav.show();
                this.$nav.sentrana_navigation_header({
                    user: userInfo,
                    menuModel: this.constructor.menuModel,
                    navBarModel: this.constructor.navBarModel,
                    userActions: userActions
                });
            } else {
                this.logout();
            }
        },

        hideNavigationHeader: function() {
          this.$nav.hide();
        },

        // Listen to global application state changes...
        "{Sentrana.ApplicationShell.AppState} change": function(model, ev, attr, how, newVal, oldVal) {
            // Is the session now closed?
            if (attr === "sessionOpen" && !newVal) {
                // Was the session closed because it timed out?
                if (model.closeSessionReason === "timeout") {
                    this.sessionOut();
                } else if (model.closeSessionReason !== "init") {
                    this.logout();
                }

                if (this.$nav.control()) {
                    this.$nav.control().destroy();
                }

                $.cookie('isLoggedIn', false);
            }
            if (attr === "sessionOpen" && newVal) {
                // Display main content and initialize navigation header
                this.$mainContent.show();
            }
            if (attr === "currentNotification") {
                // Show the most currentNotification
                this.notice(newVal.msg);
            }
        },
        // Browser Event: What to do when the window resizes...
        "{window} resize": function(el, ev) {
            // Are we showing the login box?
      /*      if (this.loginController.showLogin) {
                var props = this.computeCSSProps(this.loginController.showLogin);

                // Set the properties on the element...
                this.element.css(props);
            }*/
        },

        /* Class Method: Indicate that we have an open session */
        openSession: function AS_openSession(data) {
            Sentrana.ApplicationShell.AppState.attr("sessionTimeOut", data.sessionTimeOutSeconds);
            Sentrana.ApplicationShell.AppState.attr("sessionOpen", true);
            // After this, we could execute application specific implementation
            this.constructor.initApp();
        },

        // Class Method: Indicate that we have a closed session
        closeSession: function AS_closeSession(reason) {
            // Give the reason first so that observers can check the reason when the sessionOpen property changes.
            Sentrana.ApplicationShell.AppState.attr("closeSessionReason", reason);
            Sentrana.ApplicationShell.AppState.attr("sessionOpen", false);
            Sentrana.ApplicationShell.AppState.attr("sessionTimeOut", null);
        },

        renewSession: function AS_renewSession() {
            Sentrana.ApplicationShell.AppState.attr("sessionRenewTime", +new Date());
        },

        updateSessionTimeOut: function AS_updateSessionTimeOut(timeOut) {
            Sentrana.ApplicationShell.AppState.attr("sessionTimeOut", timeOut);
        },

        // Class Method: To set the current notification. The application will observe the change and present the message properly.
        setCurrentNotification: function AS_setCurrentNotification(value) {
            Sentrana.ApplicationShell.AppState.attr("currentNotification", {
                msg: value,
                timestamp: +new Date()
            });
        }
    });

    // http://stackoverflow.com/questions/1802936/stop-all-active-ajax-requests-in-jquery
    $.ajaxManager = (function() {
        var id = 0, Q = {};

        $(document).ajaxSend(function(e, jqx) {
            jqx._id = id + 1;
            Q[jqx._id] = jqx;
        });
        $(document).ajaxComplete(function(e, jqx) {
            delete Q[jqx._id];
        });

        return {
            abortAll: function() {
                var r = [];
                $.each(Q, function(i, jqx) {
                    r.push(jqx._id);
                    jqx.abort();
                });
                return r;
            }
        };
    })();
});
