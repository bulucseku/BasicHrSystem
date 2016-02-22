can.Control.extend("Sentrana.Controllers.GridHiddenColumn", {
    pluginName: 'sentrana_grid_hidden_column',
    defaults: {
        app: null
    }
}, {
    init: function GHC_init() {
        this.hiddenColumns = [];
        this.element.html('');
        this.element.hide();

        if (this.options.hiddenColumns.length) {
            this.hiddenColumns = this.options.hiddenColumns;
            this.renderHiddenColumns();
        }
    },

    hideColumn: function (columnName) {
        if ($.inArray(columnName, this.hiddenColumns) > -1) {
            return;
        }
        this.hiddenColumns.push(columnName);
        this.renderHiddenColumns();
    },

    showColumn: function (columnName) {
        this.hiddenColumns.splice($.inArray(columnName, this.hiddenColumns), 1);
        this.renderHiddenColumns();
    },

    updateHiddenColumnView: function (columns) {
        this.hiddenColumns = [];
        for (var i = 0; i < columns.length; i++) {
            this.hiddenColumns.push(columns[i]);
        }
        this.renderHiddenColumns();
    },

    renderHiddenColumns: function () {
        //initialize the properties
        this.element.html('');
        this.element.append(can.view('templates/grid-hidden-columns.ejs', {
            hiddenColumns: this.hiddenColumns
        }));
        var $hiddenColumnLabel = this.element.find('.hidden-column-label');

        if (this.hiddenColumns.length > 0) {
            this.element.show();
            $hiddenColumnLabel.html('Hidden Columns: ');
        }
        else {
            $hiddenColumnLabel.html('');
            this.element.hide();
        }
    },

    ".hidden-column-container  mouseleave": function () {
        this.element.hide();
    },

    ".tu-close-container click": function (el, ev) {
        this.element.hide();
        var columnName = $(el).closest('.tu').attr('columnName');
        this.element.trigger("restore_column", columnName);
    }

});
