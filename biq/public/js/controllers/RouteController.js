can.Control.extend('Sentrana.Controllers.RouterController', {
    pluginName: 'sentrana_router'
}, {

    init: function () {
        this.app = this.options.app;
        // this.app.start();
        this.resetRoute();
    },

    resetRoute: function () {
        can.route.ready(false);
        can.route(":page/:subpage", {
            "page": "",
            "subpage": ""
        });
        can.route(":page", {
            "page": ""
        });

        can.route.ready(true);
    },

    updateRoute: function (pageName) {
        if ($.isEmptyObject(can.route.attr())) {
            document.location.hash = can.route.url({
                "page": pageName
            });
            can.route.ready(true);
        }
        else {
            can.route.attr("page", pageName);
        }
    },

    "route": function () {
        // matches empty hash, #, or #!
        //this.updateRoute('login');
    },

    ":page route": function (routeData) {
        window.location.hash = can.route.url({
            "page": routeData.page
        });
        if (routeData.page && this.checkAuthentication(routeData.page)) {
            this.redirectToPage();
        }
    },

    ":page/:subpage route": function (routeData) {
        var self = this;
        if ((routeData.page || routeData.subpage) && this.checkAuthentication(routeData.page)) {
            this.redirectToPage();
        }
    },

    checkAuthentication: function (page) {
        if (page === "login") {
            return true;
        }

        var userInfo = this.app.retrieveUserInfo();

        if (userInfo && userInfo.userID) {
            return true;
        }

        //when session is out then go to the login page.
        Sentrana.FirstLook.closeSession("timeout");

        //        can.route.attr({
        //            page: 'login'
        //        }, true);

        return false;
    },

    redirectToPage: function () {
        var page = can.route.attr('page');
        var subpage = can.route.attr('subpage');
        if (page) {
            //this.app.navBar.options.selection.selectLevel1Button(page);
            this.app.topNavBarModel.selectPage(page);
        }
        if (subpage) {
            this.app.navBar.options.selection.selectLevel2Button(page, subpage);
        }
    }
});
