/* Controller for data selection dialog */
Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.Segments", {
    defaults: {
        width: 440,
        model: null
    }
}, {
    init: function () {
        // Call the base class to construct the buttons array...
        this._super(["OK", "CANCEL", "ALL"], 50);
        this.model = this.options.model;
        // Initialize our dialog...
        this.element.dialog(this.getDialogOptions());
    },

    insertData: function () {
        var $table = $('.form-data', this.element).empty();

        for (var i = 0; i < this.columns.length; i++) {
            var column = this.columns[i];
            // if it's a datum
            if (this.model.segments[column] === undefined) {
                continue;
            }
            var $insert = $('<input></input>').val(column).attr('type', 'checkbox').addClass(column);
            if (this.model.hasSegment(this.table, column) > -1) {
                $insert.prop('checked', true);
            }
            $table.append($insert).append("&nbsp" + column + "<br>");
        }
    },

    collectSelections: function () {
        for (var i = 0; i < this.columns.length; i++) {
            var column = this.columns[i];

            if ($('.' + column, this.element).is(':checked')) {
                var segment = this.model.segments[column];
                this.model.attachSegment(this.table, segment);
            }
            else {
                this.model.detachSegment(this.table, segment);
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
