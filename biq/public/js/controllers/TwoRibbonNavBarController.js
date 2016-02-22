can.Control.extend("Sentrana.Controllers.TwoRibbonNavBar", {

    pluginName: 'sentrana_two_ribbon_nav_bar',
    defaults: {
        selection: null,
        templateFile: "trnb-main.ejs",
        templateFilePrefix: null,
        app: null
    }
}, {
    // One time constructor, invoked once and associated with a DOM element.
    init: function TRNBC_init() {
        this.updateView();
    },

    // What to do when subsequent attempts to render an already initialized controller.
    update: function (options) {
        this._super(options);

        this.updateView();
    },

    // This code processes the options and renders the two ribbon navigation bar...
    updateView: function () {
        // If the selection argument is not an object, get out now...
        if (!Sentrana.isObject(this.options.selection)) {
            return;
        }

        // Try to get the path to the template file...
        var templatePath = this.getTemplatePath();

        // If it is not a valid string, get out now...
        if (!templatePath) {
            return;
        }

        // Get the layout, filtered by the array of (level 1) button IDs supplied by the caller
        var filteredLayout = this.options.selection.getFilteredLayout();

        // Construct the HTML using our template...
        this.element.html(can.view(templatePath, {
            entries: filteredLayout
        }));

        // Ask the selection to select the defaults!
        this.options.selection.selectDefaults();
    },

    // Construct a path to the template file, using the template prefix and file name...
    getTemplatePath: function TRNBC_getTemplatePath() {
        // Define an array of file path parts
        var parts = [];

        // Do we have a prefix?
        if (this.options.templateFilePrefix) {
            var p = this.options.templateFilePrefix,
                l = p.length;

            // Does it end in a forward slash?
            if (p.substr(l - 1) === "/") {
                p = p.substr(0, l - 1);
            }

            // Add it to parts...
            parts.push(p);
        }

        // Do we have a file?
        if (this.options.templateFile) {
            parts.push(this.options.templateFile);
        }

        return parts.join("/");
    },

    // Get the jQuery object for a level 1 button...
    getjqoLevel1Button: function TRNBC_getjqoLevel1Button(l1btn) {
        return $('.nb-l1-btn[' + Sentrana.Enums.ATTR_LEVEL_ONE_BUTTON + '="' + l1btn + '"]');
    },

    // Get the jQuery object for a level 2 button...
    getjqoLevel2Button: function TRNBC_getjqoLevel2Button(l1btn, l2btn) {
        return $('.nb-l2-btn[' + Sentrana.Enums.ATTR_LEVEL_ONE_BUTTON + '="' + l1btn + '"][' + Sentrana.Enums.ATTR_LEVEL_TWO_BUTTON + '="' + l2btn + '"]');
    },

    // Get the jQuery object for a level 2 navigation bar...
    getjqoLevel2Bar: function TRNBC_getjqoLevel2Bar(l1btn) {
        return $('.nb-l2-bar[' + Sentrana.Enums.ATTR_LEVEL_ONE_BUTTON + '="' + l1btn + '"]');
    },

    // Get the jQuery object for a body (which holds the content of a first level button)...
    getjqoLevel1Body: function TRNBC_getjqoLevel1Body(l1btn) {
        return $('.nb-body[' + Sentrana.Enums.ATTR_LEVEL_ONE_BUTTON + '="' + l1btn + '"]');
    },

    // Get the jQuery object for a body (which holds the content of a second level button)...
    getjqoLevel2Body: function TRNBC_getjqoLevel2Body(l1btn, l2btn) {
        return $('.nb-body[' + Sentrana.Enums.ATTR_LEVEL_ONE_BUTTON + '="' + l1btn + '"][' + Sentrana.Enums.ATTR_LEVEL_TWO_BUTTON + '="' + l2btn + '"]');
    },

    // Select (or deselect) a first level button...
    selectLevel1Button: function TRNBC_selectLevel1Button(l1btn, select) {
        var icon = this.options.selection.layoutMap[l1btn].iconImage;
        var iconOn = this.options.selection.layoutMap[l1btn].iconImageOn;
        var img = $('img', this.getjqoLevel1Button(l1btn));

        if (select) {
            $(img[0]).attr("src", "images/" + iconOn);
            this.getjqoLevel1Button(l1btn).addClass(Sentrana.Enums.CLASS_SELECTED);
            this.getjqoLevel2Bar(l1btn).slideDown();
        }
        else {
            $(img[0]).attr("src", "images/" + icon);
            this.getjqoLevel1Button(l1btn).removeClass(Sentrana.Enums.CLASS_SELECTED);
            this.getjqoLevel2Bar(l1btn).slideUp();
        }
    },

    // Activate the page controller...
    activatePageController: function TRNBC_activatePageController(l1btn, l2btn, syntheticEvent, eventParams) {
        // Get the controller information associated with the level 1 or level 2 button...
        var controllerInfo = this.options.selection.getControllerInfo(l1btn, l2btn),
            jqoBody = (l2btn) ? this.getjqoLevel2Body(l1btn, l2btn) : this.getjqoLevel1Body(l1btn);

        // Do we have info?
        if (controllerInfo) {
            // Create an options object...
            var options = $.extend(true, {
                app: this.options.app
            }, controllerInfo.controlOptions);

            // Invoke the controller's helper method
            jqoBody[controllerInfo.controllerHelperName](options);
        }

        // Get the controller associated with this DOM element. Does it exist? If not, create a new instance...
        jqoBody.show();

        // Inform the controller that is being shown...
        jqoBody[controllerInfo.controllerHelperName]("show");

        // Is there a synthetic event associated with it?
        if (syntheticEvent) {
            // Pass it on...
            jqoBody.trigger(syntheticEvent, eventParams);
        }
    },

    // Activate a page...
    activatePage: function TRNBC_activatePage(aButtonIDs, syntheticEvent, eventParams) {

        window.location.hash = can.route.url({
            "page": aButtonIDs[0]
        });

        // Update the model to trigger the UI to change...
        this.options.selection.selectLevel2Button(aButtonIDs[0], aButtonIDs[1]);

        // Trigger the page...
        this.triggerPage(aButtonIDs, syntheticEvent, eventParams);
    },

    // Send an event to a page...
    triggerPage: function TRNBC_triggerPage(aButtonIDs, syntheticEvent, eventParams) {
        // Are we without an event to raise?
        if (!syntheticEvent) {
            return;
        }

        // Get the body for this page...
        var jqoBody = (aButtonIDs[1]) ? this.getjqoLevel2Body(aButtonIDs[0], aButtonIDs[1]) : this.getjqoLevel1Body(aButtonIDs[0]);

        // Send the event to it...
        jqoBody.trigger(syntheticEvent, eventParams);
    },

    // Select a second level button...
    selectLevel2Button: function TRNBC_selectLevel2Button(aButtonIDs, select) {
        var l1btn = aButtonIDs[0],
            l2btn = aButtonIDs[1];

        if (select) {
            if (l2btn) {
                this.getjqoLevel2Button(l1btn, l2btn).addClass(Sentrana.Enums.CLASS_SELECTED);
                can.route.attr({
                    route: l1btn + "/:subpage",
                    subpage: l2btn
                });
            }

            // Activate the page controller associated with this button...
            this.activatePageController(l1btn, l2btn);
        }
        else {
            if (l2btn) {
                this.getjqoLevel2Button(l1btn, l2btn).removeClass(Sentrana.Enums.CLASS_SELECTED);
                this.getjqoLevel2Body(l1btn, l2btn).hide();
            }
            else {
                this.getjqoLevel1Body(l1btn).hide();
            }
        }
    },

    // What to do when a user has clicked on a first level button...
    ".nb-l1-btn click": function (el, ev) {
        var l1btn = el.attr(Sentrana.Enums.ATTR_LEVEL_ONE_BUTTON);

        this.options.app.saveMenuInfo({
            "level1BtnId": l1btn
        });

        if (l1btn !== "saved") {
            $('.btn-add-booklet').css('display', 'none');
            $('.btn-show-hide-filmstrip').css('display', 'none');
        }

        window.location.hash = can.route.url({
            "page": l1btn
        });
    },

    // What to do when a user has clicked on a second level button...
    ".nb-l2-btn click": function (el, ev) {
        var l1btn = el.attr(Sentrana.Enums.ATTR_LEVEL_ONE_BUTTON),
            l2btn = el.attr(Sentrana.Enums.ATTR_LEVEL_TWO_BUTTON);

        this.options.app.saveMenuInfo({
            "level1BtnId": l1btn,
            "level2BtnId": l2btn
        });

        can.route.attr({
            route: l1btn + "/:subpage",
            subpage: l2btn
        });
    },

    ".btn-add-booklet click": function (el) {
        if ($(el).hasClass('ui-state-disabled')) {
            return;
        }

        if (this.options.app.bookletController) {
            this.options.app.bookletController.destroyThisController();
        }

        this.clearCenterPanelforBooklet();
        this.options.app.bookletController = $('.booklet-composition-panel-container').sentrana_booklet_composition({
            app: this.options.app,
            bookletDefinModel: this.options.app.bookletDefinModel
        }).control();

        if (this.options.app.filmstripController) {
            this.options.app.filmstripController.isRendered = false;
        }
    },

    clearCenterPanelforBooklet: function () {
        var jqoBody = this.getjqoLevel1Body('saved');
        jqoBody.trigger('clear_center_panel', true);

    },

    ".btn-show-hide-filmstrip click": function () {
        if ($(".filmstrip-container").is(":visible")) {
            $('.btn-show-hide-filmstrip-caption').text('Show Filmstrip');
            this.options.app.filmstripController.hide();
        }
        else {
            $('.btn-show-hide-filmstrip-caption').text('Hide Filmstrip');
            this.options.app.filmstripController.show();
        }
    },

    // What to do when the selection changes...
    "{selection} change": function (selectionModel, ev, attr, how, newVal, oldVal) {
        function splitCombinedButtonIDs(combinedBtnIDs) {
            return combinedBtnIDs.split("|");
        }

        if (attr === "level1ButtonSelected") {
            if (oldVal) {
                this.selectLevel1Button(oldVal, false);
            }
            if (newVal) {
                this.selectLevel1Button(newVal, true);
            }
        }
        else if (attr === "level2ButtonSelected") {
            if (oldVal) {
                this.selectLevel2Button(splitCombinedButtonIDs(oldVal), false);
            }
            if (newVal) {
                this.selectLevel2Button(splitCombinedButtonIDs(newVal), true);

                //update the range filters view
                var jqoBody = this.getjqoLevel1Body(newVal);
                jqoBody.trigger('print_closed', true);
            }
        }
    }
});
