can.Control.extend("Sentrana.Controllers.TopNav", {
    pluginName: 'sentrana_top_navigation',
    defaults: {
        app: null,
        navigationModel: null
    }
}, {
    // Class constructor: Called only once for all invocations of the helper method...
    init: function () {
        // Update the UI...
        this.updateView();
    },

    // Instance method: Called each time the helper method is invoked...
    update: function (options) {
        this._super(options);
        this.updateView();
    },

    selectPage: function (page, syntheticEvent, eventParams) {
        //select active class to the top link and render the page
        // Get the controller information associated with the level 1 or level 2 button...
        var controllerInfo = this.options.navigationModel.getControllerInfo(page);
        var containerDiv = $('#' + page).children('.page-content');

        window.location.hash = can.route.url({
            "page": page
        });

        //remove previous selected
        $('li.nav-page-link').removeClass('active');
        //make the tab active
        $('a[href="#!' + page + '"]').parent().addClass('active');

        //Hide others
        //$('.page-content').empty();
        $('.page-content-div').hide();

        // Do we have info?
        if (controllerInfo) {
            // Create an options object...
            var options = $.extend(true, {
                app: this.options.app
            }, controllerInfo.controlOptions);

            // Invoke the controller's helper method
            containerDiv[controllerInfo.controllerHelperName](options);
        }

        // Get the controller associated with this DOM element. Does it exist? If not, create a new instance...
        containerDiv.parent().show();

        // Inform the controller that is being shown...
        containerDiv[controllerInfo.controllerHelperName]("show");

        // Is there a synthetic event associated with it?
        if (syntheticEvent) {
            // Pass it on...
            containerDiv.trigger(syntheticEvent, eventParams);
        }
    },

    populateTopNavigation: function () {
        this.$menuItemContainer.append(can.view('templates/topNavMenuItem.ejs', {
            navItems: this.filteredLayout
        }));
    },

    populateUserOptionsMenu: function () {
        this.$menuItemContainer.append('<div class="top-nav-user-options"></div>');
        this.$menuItemContainer.find(".top-nav-user-options").sentrana_user_options({
            app: this.options.app
        });
    },

    populatePageContents: function () {
        this.$tabContainer.append(can.view('templates/pageContent.ejs', {
            navItems: this.filteredLayout
        }));
    },

    // Instance method: Render the UI
    updateView: function () {

        this.filteredLayout = this.options.navigationModel.getFilteredLayout();
        this.element.append(can.view('templates/topNavigation.ejs', {}));
        this.$tabContainer = $('#tabs');
        this.$menuItemContainer = $('#main-navbar-collapse');
        //Add menus
        this.populateTopNavigation();
        //add user options
        this.populateUserOptionsMenu();
        //add page contents
        this.populatePageContents();
    },

    // What to do when the selection changes...
    "{navigationModel} change": function (model, ev, attr, how, newVal, oldVal) {
        if (attr === "page") {
            if (newVal) {
                this.selectPage(newVal);
                this.options.app.saveMenuInfo({
                    "level1BtnId": newVal,
                    "level2BtnId": ""
                });
            }
        }
    }
});
