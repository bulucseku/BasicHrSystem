can.Control.extend("Sentrana.Controllers.ResultDefinition", {
    pluginName: 'sentrana_result_definition',
    defaults: {
        app: null
    }
}, {
    init: function () {
        this.element.html('');
        this.element.append(can.view('templates/result-definition.ejs'));
        this.element.find(".button").button();
        this.$columns = this.element.find(".result-definition-columns");
        this.$columnUtilElement = this.element.find(".result-definition-util-element");

        this.updateColumnsView();

        this.$resultColumns = this.element.find(".result-definition-columns");
        this.makeResultColumnSortable();
    },

    updateColumnsView: function () {
        this.colInfos = $.extend([], this.getColumns());
        this.resultDataModel = this.options.resultDataModel.cloneThis();

        var columns = this.getColumns();
        this.$columns.html(can.view('templates/result-definition-columns.ejs', {
            columns: columns
        }));
        this.columnUtilControllers = [];
        for (var i = 0; i < columns.length; i++) {
            this.getColumnUtilController(columns[i].oid);
        }
    },

    ".result-column-header click": function (el, ev) {
        var $contentBody = el.parent().find('.result-column-body'),
            oid = $(el).closest(".column-util-element").attr("oid");

        var $scrollingParent = $(el).closest(".result-definition-container");
        $scrollingParent.animate({
            scrollTop: $(el).offset().top - $scrollingParent.offset().top + $scrollingParent.scrollTop()
        });

        if ($contentBody.is(":visible")) {
            $(el).closest('.result-column-container').toggleClass("disabled");
        }
        else {
            $(el).closest('.result-column-container').removeClass('disabled');
        }

        var that = this;

        setTimeout(function () {
            that.columnUtilControllers[oid].renderFilter();
        }, 400);
    },

    getColumns: function () {
        return this.options.resultDataModel.manipulatedData.colInfos;
    },

    getColumnUtilController: function (oid) {
        var $columnElement = this.$columns.find('.column-util-element[columnID="' + oid + '"]');
        var controller = this.$columnUtilElement.control();
        if (controller && !controller._destroyed) {
            controller.destroy();
        }

        var resultDataModel = this.resultDataModel,
            currentIndex = resultDataModel.getColumnIndex(oid),
            column = resultDataModel.getColumn(oid),
            isFiltered = resultDataModel.isColumnFiltered(column.title);

        this.columnUtilControllers[oid] = $columnElement.sentrana_result_data_util({
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

    " show_hide_column": function (el, ev, param) {
        var isHidden = this.resultDataModel.isColumnHidden(param.name);
        if (isHidden) {
            this.resultDataModel.showColumn(param.name);
        }
        else {
            this.resultDataModel.hideColumn(param.name);
        }

        this.columnUtilControllers[param.oid].updateHiddenStatus(!isHidden);
    },

    " update_result_column_sort_pos": function (el, ev, param) {
        var col = this.resultDataModel.getColumn(param.oid),
            currentIndex = this.resultDataModel.getColumnIndex(param.oid),
            nextcol = this.resultDataModel.getColumnBySortPos(param.sortPos);

        this.resultDataModel.swapSortPosition(currentIndex, param.sortPos, col.sortOrder);
        var nextcolumn = this.resultDataModel.getColumn(nextcol.oid);
        this.columnUtilControllers[nextcolumn.oid].updateControllerSortPos(nextcolumn.sortPos);
    },

    " update_result_column_sort_order": function (el, ev, param) {
        var col = this.resultDataModel.getColumn(param.oid);
        col.sortOrder = param.sortOrder;
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
        this.options.resultDataModel.sortDataByMultipleColumn();
    },

    resetDataModel: function () {
        this.options.resultDataModel.clearTransformation();

    },

    makeResultColumnSortable: function () {
        var that = this;

        this.$resultColumns.sortable({
            cancel: ".disabled",
            containment: this.element.find(".result-definition"),
            handle: '.result-column-header',
            opacity: 0.75,
            forcePlaceholderSize: true,
            helper: 'clone',
            placeholder: "result-column-placeholder",
            revert: 300,
            stop: function (event, data) {
                var oid = data.item.attr('columnid'),
                    columns = that.resultDataModel.manipulatedData.colInfos;

                for (var i = 0, l = columns.length; i < l; i++) {

                    if (columns[i].oid === oid) {
                        var UICols = $(".column-util-element", this);
                        for (var j = 0, m = UICols.length; j < m; j++) {
                            if ($(UICols[j]).attr('columnid') === oid) {
                                that.moveColumn(oid, i, j);
                                return;
                            }
                        }
                    }
                }
            }
        });

        this.$resultColumns.disableSelection();
    },

    moveColumn: function (oid, oldIndex, newIndex) {
        if (oldIndex === newIndex) {
            return;
        }

        this.resultDataModel.reorderColumnPos(oldIndex, newIndex);
        this.columnUtilControllers[oid].updateControllerIndex(newIndex);
        this.columnUtilControllers[oid].updateControllerIndex(newIndex);

        //alert(oldIndex + " ----- " + newIndex);
    }

});
