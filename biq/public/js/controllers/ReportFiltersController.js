can.Control.extend("Sentrana.Controllers.ReportFilters", {
    pluginName: 'sentrana_report_filters',
    defaults: {
        app: null
    }
}, {
    init: function () {
        this.element.html('');
        this.element.append(can.view('templates/report-filters.ejs'));
        this.$columns = this.element.find(".report-filters-columns");
        this.updateColumnsView();
    },

    updateColumnsView: function () {
        this.colInfos = $.extend([], this.getColumns());
        this.resultDataModel = this.options.resultDataModel.cloneThis();

        var columns = this.getColumns();
        this.$columns.html(can.view('templates/report-filters-columns.ejs', {
            columns: columns
        }));
        this.columnUtilControllers = [];
        for (var i = 0; i < columns.length; i++) {
            this.getColumnUtilController(columns[i].oid);
        }

        this.element.find(".button").button();
    },

    getColumns: function () {
        return this.options.resultDataModel.manipulatedData.colInfos;
    },

    getColumnUtilController: function (oid) {
        var $columnElement = this.element.find('.report-filter-element[columnID="' + oid + '"]');
        var controller = $columnElement.control();
        if (controller && !controller._destroyed) {
            controller.destroy();
        }

        var resultDataModel = this.resultDataModel,
            currentIndex = resultDataModel.getColumnIndex(oid),
            column = resultDataModel.getColumn(oid),
            isFiltered = resultDataModel.isColumnFiltered(column.title);

        this.columnUtilControllers[oid] = $columnElement.sentrana_report_filter({
            columnIndex: currentIndex,
            oid: oid,
            resultDataModel: resultDataModel,
            isFiltered: isFiltered
        }).control();

    },

    getSelectedItemsArray: function (selectedItems) {
        var items = [],
            keys = selectedItems.keys.split('|'),
            values = selectedItems.values.split('|');
        for (var i = 0; i < keys.length; i++) {
            items.push({
                key: keys[i],
                value: values[i]
            });
        }
        return items;
    },

    ".btn-apply-filters click": function (el, ev) {

        var changes = this.getChanges();
        if (!changes) {
            return;
        }

        var filters = this.getFilters(),
            that = this;

        if (filters.error) {
            Sentrana.AlertDialog("No item selected.", 'No item selected from column "' + filters.columnName + '".');
            return;
        }

        this.options.resultDataModel.startDataChange();
        setTimeout(function () {
            that.updateDataModel(filters);
            that.options.resultDataModel.endDataChange();
        }, 300);

    },

    ".btn-reset-filters click": function (el, ev) {

        if (this.options.resultDataModel.hiddenColumns.length > 0 || this.options.resultDataModel.filters.length > 0) {
            this.options.resultDataModel.dataChanged = true;
        }

        if (!this.options.resultDataModel.dataChanged) {
            return;
        }

        var that = this;
        this.options.resultDataModel.startDataChange();
        setTimeout(function () {
            that.resetDataModel();
            that.element.trigger("reset_filtercontrol");
            that.options.resultDataModel.endDataChange();
        }, 300);

    },

    reDrawSliders: function () {

        var columns = this.getColumns();
        for (var i = 0; i < columns.length; i++) {
            var controller = this.columnUtilControllers[columns[i].oid];
            controller.reDrawSlider();
        }

    },

    getChanges: function () {
        if (this.columnOrderChanged()) {
            return true;
        }

        var columns = this.getColumns();
        for (var i = 0; i < columns.length; i++) {
            var controller = this.columnUtilControllers[columns[i].oid],
                filter = controller.getColumnChanges();
            if (filter) {
                return filter;
            }
        }

        return false;
    },

    columnOrderChanged: function () {
        var newCols = this.colInfos,
            oldCols = this.getColumns();

        for (var i = 0; i < newCols.length; i++) {
            if (newCols[i].oid !== oldCols[i].oid) {
                return true;
            }
        }

        return false;

    },

    getFilters: function () {
        var filters = [],
            columns = this.getColumns();
        for (var i = 0; i < columns.length; i++) {
            var controller = this.columnUtilControllers[columns[i].oid],
                filter = controller.getColumnFilter();
            if (filter) {
                if (filter.error) {
                    return filter;
                }

                filters.push(filter);
            }

        }
        return filters;
    },

    updateDataModel: function (filters) {
        this.resultDataModel.removeAllFilter();
        this.resultDataModel.addFilters(filters);
        this.options.resultDataModel.updateWithExternalData(this.resultDataModel);
    },

    resetDataModel: function () {
        this.options.resultDataModel.startDataChange();
        this.options.resultDataModel.clearTransformation();
        this.options.resultDataModel.endDataChange();
    }
});
