steal ("lib/sentrana/AppSwitcher/StealAppSwitcher.js", function(){
    can.Control.extend("Sentrana.Controllers.NavigationController", {
        defaults: {
            template: {
                navigationTemplate: 'lib/sentrana/Navigation/templates/navigationHeader.ejs'
            }
        },
        pluginName: 'sentrana_navigation_header'
    },{
        init: function() {
            var that = this;
            var user = this.options.user;
            this.isPlugin = typeof window.Sentrana_IsPlugin === 'undefined' ? false : window.Sentrana_IsPlugin;
            if (this.isPlugin) {
                this.options.template.navigationTemplate = 'lib/sentrana/Navigation/templates/navigationHeaderPlugin.ejs';
            }
            this.updateView();
            this.render();
        },

        update: function(options) {
            this._super(options);

            this.updateView();
            this.render();
        },

        updateView: function(){
            var that = this;
            var user = this.options.user;

            if(!this.options.navBarModel) {
                //set default value
                this.options.navBarModel = {
                    logo: {
                        position: 'left',
                        visible: true
                    },
                    tabs: {
                        position: 'left',
                        visible: true
                    },
                    userOptions: {
                        position: 'right',
                        visible: true
                    }
                };
            }

            this.element.html(can.view(that.options.template.navigationTemplate, {navBarModel: this.options.navBarModel, mainMenuItems: this.options.menuModel.mainMenuItems, userName: that.options.user.fullName, orgName: user.orgName }));

            $("#nav-page-list").append(can.view("lib/sentrana/Navigation/templates/moreTabsDropdown.ejs", {}));
            $('.more-tabs-dropdown', this.element).hide(); //hide until content is added
        },

        render:function() {
            var that = this;
            var allowedApplications = JSON.parse(this.options.user.applications);
            if(allowedApplications.length > 1) {
                $('.app-switcher', this.element).sentrana_app_switcher({
                    userApps: allowedApplications,
                    applicationId: this.options.user.applicationId
                });
            }
            
            //Render user actions if any
            if(this.options.userActions){
                var rightNavBar = this.element.find('.right-navbar-nav');

                //remove all user actions
                $(".right-navbar-nav li:gt(0)").remove();

                $.each(this.options.userActions, function(index, obj){
                    rightNavBar.append(can.view(obj.templatePath, obj.templateOptions));
                    //add controller
                    if(obj.selector && obj.controllerName){
                        that.element.find(obj.selector)[obj.controllerName](obj.controllerOptions);
                    }
                });
            }
            this.highlightMenuItems();
            if (!this.isPlugin) {
                this.generateNavDropdown();
            }
        },

        highlightMenuItems: function() {
            $("#nav-page-list > li").removeClass('active');
            var that = this;
            $("#nav-page-list > li").each(function() {
                if (that.isPathToCurrentPage($(this))) {
                    $(this).addClass('active');
                }
            });
        },

        generateNavDropdown: function () {
            var appSwitcher = $('.app-switcher', this.element);
            var pageNav = $('#nav-page-list', this.element);
            var navOption = $('#nav-option-list', this.element);
            var navHeader = $('.navbar-header', this.element);
            var navHeaderWidth = navHeader.innerWidth();
            var navOptionWidth = navOption.innerWidth();
            var navWidth = pageNav.innerWidth();
            var windowWidth = window.innerWidth;
            var appSwitcherWidth = appSwitcher.innerWidth();
            var diff = (windowWidth - navOptionWidth) - navWidth;
            var minDiff = navHeaderWidth + appSwitcherWidth;

            if ($('.navbar-toggle').css('display') === 'block') {
                return;
            }
            if (diff < minDiff && navWidth > 0) {
                $('.more-tabs-dropdown', this.element).show();

                while (diff < minDiff) {
                    var children = pageNav.children('li:not(:last-child)');
                    var count = children.size();
                    $(children[count - 1]).prependTo('#more-tab-page-list', this.element);
                    navWidth = pageNav.innerWidth();
                    diff = (windowWidth - navWidth) - navOptionWidth;
                }
            } else {
                while (diff > minDiff && navWidth > 0) {
                    var collapsed = $('#more-tab-page-list', this.element).children('li');
                    var collapsedCount = collapsed.size();
                    var clone = $(collapsed[0]).clone().css("visibility","hidden")
                        .insertBefore(pageNav.children('li:last-child'));
                    var newChildWidth = clone.innerWidth();
                    clone.remove();
                    if (diff - newChildWidth > minDiff) {
                        $(collapsed[0]).insertBefore(pageNav.children('li:last-child'));
                        navWidth = pageNav.innerWidth();
                        diff = (windowWidth - navWidth) - navOptionWidth;
                    } else {
                        break;
                    }
                    if (collapsedCount <= 1) {
                        $('.more-tabs-dropdown', this.element).hide();
                        break;
                    }
                }
            }
        },

        "{window} resize": function () {
            if(!this.isPlugin) {
                this.generateNavDropdown();
                if ($('.navbar-toggle').css('display') === 'block') {
                    this.generateNavPages();
                }
            }
        },

        ".navbar-toggle click": function () {
            this.generateNavPages();
        },

        generateNavPages: function () {
            var pageNav = $('#nav-page-list', this.element);
            var collapsed = $('#more-tab-page-list', this.element).children('li');
            var collapsedCount = collapsed.size();

            for (var i = 0; i < collapsedCount; i++) {
                $(collapsed[i]).insertBefore(pageNav.children('li:last-child'));
            }

            $('.more-tabs-dropdown', this.element).hide();
        },

        isPathToCurrentPage: function(menuItem) {
            var currentPage = can.route.attr('page');
            var userSubNavigationMenus = this.options.menuModel.subNavigationMenus;
            var parentSelectedMenu = userSubNavigationMenus[currentPage] ? userSubNavigationMenus[currentPage].parentSelectedMenu : "";
            var that = this;

            if (menuItem.children('a').attr('id') === 'menu-'+currentPage || menuItem.children('a').attr('id') === 'menu-'+parentSelectedMenu) {
                return true;
            }

            var isValidPath = false;
            menuItem.children('#nav-page-list ul').each(function() {
                var childMenu = $(this);
                childMenu.children('li').each(function() {
                    $(this).removeClass('active');
                    if (that.isPathToCurrentPage($(this))) {
                        isValidPath = true;
                        $(this).addClass('active');
                    }
                });
            });

            return isValidPath;
        },

        ".navbar-nav a click": function(elem) {
            // Collapses bootstrap navbar on click if not a dropdown
            if ($('.navbar-toggle').is(':visible') && !$(elem).hasClass('dropdown-toggle')) {$('.navbar-collapse').collapse('toggle');}
            this.highlightMenuItems();
            //For IE and FF we need to remove the focus
            $(elem).blur();
        }
    });
});
