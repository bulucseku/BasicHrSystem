can.Control.extend('Sentrana.Controllers.RouterController', {
    pluginName: 'sentrana_router'
}, {
    init: function(params) {
        this.app = this.options.app;
        this.app.start();
        this.resetRoute();
    },

    resetRoute: function() {
        can.route.ready(false);
        can.route(":page/:id/:subpage", {
            "page": "",
            "id": "",
            "subpage": ""
        });
        can.route(":page", {
            "page": ""
        });

        can.route.ready(true);
    },

    updateRoute: function(pageName) {

        if ($.isEmptyObject(can.route.attr())) {
            document.location.hash = can.route.url({
                "page": pageName
            });
            can.route.ready(true);
        } else {
            can.route.attr("page", pageName);
        }
    },

    "route": function() {
        // matches empty hash, #, or #!
        this.updateRoute('login');
    },

    ":page route": function(routeData) {
        if (routeData.page) {
            this.displayPage();
        }
    },

    ":page/:id/:subpage route": function(routeData) {
        if (routeData.page || routeData.id || routeData.subpage) {
            this.displayPage();
        }
    },

    displayPage: function() {
        var newVal = can.route.attr('page');

        var hash = unescape(document.location.hash);
        var splitdUrl = hash.split("token=");
        if (splitdUrl.length === 2) {
            //clear the session
            this.app.clearApplicationInfo();
            this.app.showPasswordResetPage(splitdUrl[1]);
            return;
        }

        can.each($('.dialog').controls(), function(control) {
            if ($(control.element).dialog("isOpen") && $(control.element).attr('data-dialogType') !== 'Session') {
                if (can.isFunction(control.cancelAndClose)) {
                    control.cancelAndClose();
                } else if (can.isFunction(control.handleCANCEL)) {
                    control.handleCANCEL();
                } else if (can.isFunction(control.closeDialog)) {
                    control.closeDialog();
                } else {
                    $(control.element).dialog("close");
                }
            }
        });

        // Hid all the content pages.
        $('#main-content > div').each(function() {
            $(this).hide();
        });

        var userInfo = this.app.retrieveUserInfo();

        if (newVal !== "login") {
            this.app.loginController.hide();
            if (!userInfo) {
                can.route.attr('page', "login");
                return;
            }
        }

        // Following method will be implmeneted by each appliation.
        // The basic logic is to initialize or update the controller attached to this content div.
        this.app.updateScreen(newVal);

        // Force scroll to top of page
        $(document).scrollTop(0);

        // Adjust content margin to new header height
        var headerHeight = $(".fixed_header").height();
        $("#content").css("margin-top", headerHeight);
    },

    clearFocusFromInputElements: function() {
        // Get the active input element and remove the focus.
        $("input:focus").blur();
    }
});
