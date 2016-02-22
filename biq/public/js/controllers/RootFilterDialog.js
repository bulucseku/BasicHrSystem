/* Controller for description dialog */
Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.RootFilter", {
    defaults: {
        width: 700
    }
}, {
    init: function () {
        // Call the base class to construct the buttons array...
        this._super(["OK", "CANCEL", "DELETE"], 50);
        this.attr = null;
        this.model = this.options.model;
        this.$colname = $('.input-name', this.element);
        this.$comparison = $('.select-comp', this.element);
        this.$literal = $('.input-literal', this.element);
        this.$queryResult = $('.query-result', this.element);
        // Initialize our dialog...
        this.element.dialog(this.getDialogOptions());
    },

    // Instance Method: Handle what to do when the user clicks the OK button
    handleOK: function () {
        if (this.rootFilter === null) {
            this.model.getNewRootFilter(this.table);
        }

        this.table.rootFilter.lvalue = this.$colname.val();
        this.table.rootFilter.rvalue = this.$literal.val();
        this.table.rootFilter.comparisonOperator = this.$comparison.val();
        this.closeDialog();
    },

    handleCANCEL: function () {
        this.closeDialog();
    },

    handleDELETE: function () {
        this.table.rootFilter = null;
        this.closeDialog();
    },

    // Open the dialog
    open: function (table, tableInfo) {
        this.table = table;
        this.tableInfo = tableInfo;
        this.rootFilter = table.rootFilter;
        if (this.rootFilter !== null) {
            this.$colname.val(this.rootFilter.lvalue);
            this.$literal.val(this.rootFilter.rvalue);
            this.$comparison.val(this.rootFilter.comparisonOperator);
        }
        else {
            this.$colname.val("");
            this.$literal.val("");
            this.$comparison.val(0);
        }
        this.$queryResult.val("");

        this.openDialog();
    },

    displayQuery: function (data) {
        if (data.errorMsg) {
            this.$queryResult.html(data.errorMsg);
            this.$queryResult.css('color', 'red');
        }
        else {
            this.$queryResult.html(data.result);
        }
    },

    ".button-run-query click": function (el, ev) {
        var commandString = this.$literal.val();

        var that = this;
        $.ajax({
            type: "POST",
            url: "/BIQSvc/RepoMan.svc/RunTestQuery",
            contentType: "application/json",
            data: JSON.stringify({
                commandString: commandString,
                tableInfo: that.tableInfo
            }),
            success: function (data) {
                that.displayQuery(data);
            }
        });

    }
});
