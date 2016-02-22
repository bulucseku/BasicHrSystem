steal("jquery", "funcunit", "./helper.js", function ($, S) {
    // Wait timeouts (ms) for opening the page and making
    // AJAX requests.
    var openPageTimeout = 50000,
        serviceCallTimeout = 100000;

    var validUsername = "rana",
        validPassword = "Pass@123",
        inValidUsername = "rana123",
        inValidPassword = "sentranaxyz";

    var invalidCredentialsMsg = "Unrecognized username and password. Please try again.",
        noUsernameMsg = "Please specify a user name";

    module("Login", {
        setup: function () {
            // Open the page
            S.open("default.htm", openPageTimeout);
        }
    });

    // Test a login with no credentials.
    test("Login attempt with no credential", function () {
        steal.dev.log("Logging attempt without credentials...");

        //        // Wait for login page to appear...
        //        S(".login").visible();

        //        // Attempt to log in to the application...
        //        S("input[name='username']").type("");

        //        S("input[name='pwd']").type("");

        //        S(".login-button").click();

        Sentrana.Testing.BIQ.login("","");

        //Wait for error message to appear
        S(".login .error").visible().text(noUsernameMsg, "Login failure. No user name given.");
    });

    // Test a login with invalid credentials.
    test("Login attempt with invalid credential", function () {
        steal.dev.log("Logging attempt with invalid credentials...");

//        // Wait for login page to appear...
//        S(".login").visible();

//        // Attempt to log in to the application...
//        S("input[name='username']").type(inValidUsername);

//        S("input[name='pwd']").type(inValidPassword);

        //        S(".login-button").click();

        Sentrana.Testing.BIQ.login(inValidUsername, inValidPassword);

        //Wait for loading message to appear and vanish
        S(".login .error").visible(50000).text(invalidCredentialsMsg, "Login failure. Invalid credential given.");
    });

    // Test a login with valid credentials.
    test("Login attempt with valid credential", function () {
        steal.dev.log("Logging in with valid credentials...");

//        // Wait for login page to appear...
//        S(".login").visible();

//        // Attempt to log in to the application...
//        S("input[name='username']").type(validUsername);

//        S("input[name='pwd']").type(validPassword);

        //        S(".login-button").click();

        Sentrana.Testing.BIQ.login(validUsername, validPassword);

        //Wait for loading message to appear and vanish
        S(".ahrc-action-msg").visible().invisible(serviceCallTimeout);

        // Wait for login page to be hidden...
        S(".login").invisible(function () {
            ok(true, "The login is successful.");
        });
    });

    module("Repository Load", {
        setup: function () {
            //if require we can open the page here.
            //We can check whether user is logged in
            //if not, then log in
            if (S(".login").is(":visible") === true) {

//                // Wait for login page to appear...
//                S(".login").visible();

//                // Attempt to log in to the application...
//                S("input[name='username']").type(validUsername);

//                S("input[name='pwd']").type(validPassword);

                //                S(".login-button").click();

                Sentrana.Testing.BIQ.login(validUsername, validPassword);
                //Wait for loading message to appear and vanish
                S(".ahrc-action-msg").visible().invisible(serviceCallTimeout);
            }
        }
    });

    // Test a login with valid credentials.
    test("Load repository list", function () {
        steal.dev.log("Loading repository list...");

        // Wait for repository selector to appear...
        S(".login-dw-selector-bar").visible(serviceCallTimeout);

        //Check Repository list
        var repositoryCount = S(".box3").exists().size();
        if (repositoryCount > 0) {
            ok(true, repositoryCount + " repositories loaded successfully.");
        }

    });

    // Test a login with valid credentials.
    test("Select repository", function () {
        steal.dev.log("Loading repository ...");

        // Wait for repository selector to appear...
        S(".login-dw-selector-bar").visible(serviceCallTimeout).click();
        var repositoryId = "CatMan";
        S("body").move(".login-dw-selector-dwlist div[elementid=" + repositoryId + "]");
        S(".login-dw-selector-dwlist div[elementid=" + repositoryId + "]").exists().click();

        S(".login-dw-selector-access-button").exists().visible().click();
        S(".nb-l1-bar").visible(serviceCallTimeout,
        // Wait for login page to be hidden...
        function () {
            ok(true, "The repository(Category Management) selected successfully.");
        });
    });



    module("Report Design", {
        setup: function () {
            if (!S('.nb-l1-btn[l1btn="bldr"]').hasClass("selected")) {
                S('.nb-l1-btn[l1btn="bldr"]').click();
            }
        }
    });

    test("Select Columns", function () {
        S('.nb-l1-btn[l1btn="bldr"]').visible(100000);
        
        if (S('.nb-l1-btn[l1btn="bldr"]').hasClass("selected")) {
            S(".metrics-panel").visible(120000);

            Sentrana.Testing.BIQ.selectColumn("hid_CaseCount", "Cases");
            Sentrana.Testing.BIQ.selectColumn("hid_Sales", "Sales");
            Sentrana.Testing.BIQ.selectColumn("hid_GpPercTotal", "Gp(% Ttl)");
            Sentrana.Testing.BIQ.selectColumn("hid_FiscalMonthATTR", "Fiscal Month");
            Sentrana.Testing.BIQ.selectColumn("hid_BrandATTR", "Brand");
        }

    });

    test("Select Filters", function () {

        if (S('.nb-l1-btn[l1btn="bldr"]').hasClass("selected")) {
            S(".attribute-elements").visible();
            Sentrana.Testing.BIQ.expandFiterPanel("filter-Product-DimensionCategory");
            Sentrana.Testing.BIQ.selectFilter("hid_CategoryNameBiscuit", "Biscuit");
            Sentrana.Testing.BIQ.expandFiterPanel("filter-Time-DimensionFiscal-Year");
            Sentrana.Testing.BIQ.selectFilter("hid_FiscalYear2012", "2012");
        }

    });

    test("De Select Filters", function () {

        if (S('.nb-l1-btn[l1btn="bldr"]').hasClass("selected")) {
            S(".attribute-elements").visible();
            Sentrana.Testing.BIQ.deSelectFilter("hid_FiscalYear2012", "2012");
        }

    });

    module("Log Off", {
        setup: function () {
            // 
        }
    });

    test("Log off the user", function () {
        steal.dev.log("Logging out...");
        Sentrana.Testing.BIQ.logout();   
        S(".login").visible(serviceCallTimeout, function () {
            ok(true, "The logout is successful.");
        });
    });

});