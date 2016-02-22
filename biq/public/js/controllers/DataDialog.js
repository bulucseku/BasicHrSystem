/* Controller for data selection dialog */
Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.Data", {
    defaults: {
        width: 440,
        model: null
    }
}, {
    init: function () {
        // Call the base class to construct the buttons array...
        this._super(["OK", "CANCEL", "ALL"], 50);
        this.model = this.options.model;
        var that = this;
        // Initialize our dialog...
        this.element.dialog(this.getDialogOptions());
    },

    insertData: function () {
        var $table = $('.form-data', this.element).empty();

        for (var i = 0; i < this.columns.length; i++) {
            var column = this.columns[i];
            // if it's a segment
            if (this.model.data[column] === undefined) {
                continue;
            }
            var $insert = $('<input></input>').val(column).attr('type', 'checkbox').addClass(column);
            if (this.model.hasDatum(this.table, column) > -1) {
                $insert.prop('checked', true);
            }
            $table.append($insert).append("&nbsp" + column + "<br>");
        }
    },

    collectSelections: function () {
        for (var i = 0; i < this.columns.length; i++) {
            var column = this.columns[i];

            if ($('.' + column, this.element).is(':checked')) {
                var datum = this.model.data[column];
                this.model.attachDatum(this.table, datum);
            }
            else {
                this.model.detachDatum(this.table, datum);
            }
        }
    },

    // Instance Method: Handle what to do when the user clicks the OK button
    handleOK: function () {
        this.collectSelections();
        this.closeDialog();
    },

    handleALL: function () {
        for (var i = 0; i < this.columns.length; i++) {
            var column = this.columns[i];

            $('.' + column, this.element).prop('checked', true);
        }
    },

    // Open the dialog
    open: function (table, columns) {
        this.table = table;
        this.columns = columns;
        this.insertData();
        this.openDialog();
    }
});
