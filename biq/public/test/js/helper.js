steal("jquery", "funcunit", function ($, S) {

    // Create a namespace for testing utilities.
    Sentrana = {};
    Sentrana.Testing = {};
    Sentrana.Testing.BIQ = {};

    Sentrana.Testing.BIQ.login = function (username, password) {
        steal.dev.log("Logging in...");

        // Wait for login page to appear...
        S(".login").visible();

        // Attempt to log in to the application...
        S("input[name='username']").type(username);

        S("input[name='pwd']").type(password);

        S(".login-button").click();
    };

    Sentrana.Testing.BIQ.logout = function () {
        steal.dev.log("Logging out...");
//        S(".welcome-greetings").visible(10000);
        S("body").move(".user-options-header");
        //3rd item is the logout action
        S('.user-options-item')[2].click();
    };

    Sentrana.Testing.BIQ.selectColumn = function (columnId, columnName) {
        var hid = columnId;
        S("body").move(".metrics .object-selector[hid=" + hid + "]");
        S(".metrics .object-selector[hid=" + hid + "]").exists().click();


        S(".template-units div[hid=" + hid + "]").visible(2000, function () {
            ok(true, 'Column "' + columnName + '" is slected successfully.');
        });
    };

    Sentrana.Testing.BIQ.selectFilter = function (filterId, filterName) {

        var hid = filterId;
        S("body").move(".element-filter .object-selector-wrapper input[hid=" + hid + "]");

        if (!S(".element-filter .object-selector-wrapper input[hid=" + hid + "]").hasClass('object-selected')) {

            S(".element-filter .object-selector-wrapper input[hid=" + hid + "]").exists().click();

            S(".dim div[hid=" + hid + "]").visible(2000, function () {
                ok(true, 'Filter "' + filterName + '" is selected successfully.');
            });
        }
    };

    Sentrana.Testing.BIQ.expandFiterPanel = function (panelClass) {
        S("body").move('.attribute-elements .' + panelClass + '');
        if (S('.attribute-elements .' + panelClass + ' .sideBarCollapsibleContainerContent').invisible()) {
            S('.attribute-elements .' + panelClass + ' .sideBarCollapsibleContainerTitle').exists().click();
        }
    };

    Sentrana.Testing.BIQ.collapseFiterPanel = function (panelClass) {
        S("body").move('.attribute-elements .' + panelClass + '');

        if (S('.attribute-elements .' + panelClass + ' .sideBarCollapsibleContainerContent').visible()) {
            S('.attribute-elements .' + panelClass + ' .sideBarCollapsibleContainerTitle').exists().click();
        }
    };

    Sentrana.Testing.BIQ.deSelectFilter = function (filterId, filterName) {
        var hid = filterId;
        S("body").move(".element-filter .object-selector-wrapper input[hid=" + hid + "]");

        if (S(".element-filter .object-selector-wrapper input[hid=" + hid + "]").hasClass('object-selected')) {

            S(".element-filter .object-selector-wrapper input[hid=" + hid + "]").exists().click();

            S(".dim div[hid=" + hid + "]").invisible(2000, function () {
                ok(true, 'Filter "' + filterName + '" is de selected successfully.');
            });
        }
    };
});