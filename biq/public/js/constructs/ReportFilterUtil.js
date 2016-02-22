can.Construct("Sentrana.Models.ReportFilterUtil", {}, {
    init: function RFU_init(app, executionMonitorModel) {
        this.executionMonitorModel = executionMonitorModel;
        this.app = app;
        this.initValues();
    },

    initValues: function () {
        this.reportColumnsDefn = [];
        this.columsForFilter = [];
        this.changedColumnFilters = [];
        this.columnFilters = [];
    },

    processReportColumnDefinitions: function () {
        this.initValues();

        var that = this;

        if (this.executionMonitorModel.data) {
            var metricColumns = [],
                columns = this.executionMonitorModel.data.colInfos,
                minMaxValues = [],
                data = this.executionMonitorModel.data;

            if (!columns) {
                return;
            }

            for (var i = 0; i < columns.length; i++) {

                var col = {};
                col.index = i;
                col.name = columns[i].title;
                col.dataType = columns[i].dataType;
                col.formatString = columns[i].formatString;
                col.width = columns[i].width;
                col.colType = columns[i].colType;

                this.reportColumnsDefn.push(col);

                if (columns[i].colType === Sentrana.ColType.METRIC) {
                    metricColumns.push(col);
                    minMaxValues.push({
                        min: data.rows[0].cells[i].rawValue,
                        max: data.rows[0].cells[i].rawValue
                    });
                }

                this.columnFilters.push('');
                this.changedColumnFilters.push(false);
            }

            for (var j = 0; j < data.rows.length; j++) {
                var l = 0;
                for (var k = 0; k < data.rows[j].cells.length; k++) {
                    if (this.isMetricColumn(metricColumns, k)) {
                        var val = data.rows[j].cells[k].rawValue;
                        if (val > minMaxValues[l].max) {
                            minMaxValues[l].max = val;
                        }
                        if (val < minMaxValues[l].min) {
                            minMaxValues[l].min = val;
                        }
                        l++;
                    }
                }
            }

            this.columsForFilter = [];
            $.each(metricColumns, function (index, colmn) {
                var clomDetail = {
                    name: colmn.name,
                    formatString: colmn.formatString,
                    min: minMaxValues[index].min,
                    max: minMaxValues[index].max,
                    dataType: colmn.dataType,
                    index: colmn.index
                };
                var model = new Sentrana.Models.RangeFilter({
                    app: that.app,
                    columnDetail: clomDetail
                });
                if (clomDetail.min !== clomDetail.max) {
                    that.columsForFilter.push(model);
                }

            });
        }
    },

    isMetricColumn: function (metricColumns, index) {
        var selecteditem = $.grep(metricColumns, function (col) {
            return col.index === index;
        });
        return selecteditem.length > 0;
    },

    getUniqueItemsFromColumn: function (index, reportFilters) {
        var filteredData = this.getFilteredDataSet(reportFilters);
        var itemObjects = [];
        var rows = filteredData.rows;
        itemObjects = this.getDistinctColumnValues(rows, index);
        return itemObjects;
    },

    getUniqueItemsFromColumnAll: function (index, reportFilters) {
        var itemObjects = [];
        var filteredData = [];

        var columnDefn = $.grep(this.reportColumnsDefn, function (columnInfo) {
            return (columnInfo.index === index);
        });

        if (reportFilters && reportFilters.length > 0 && reportFilters[reportFilters.length - 1].columnName === columnDefn[0].name) {
            filteredData = this.getFilteredDataSet(reportFilters, columnDefn[0].name);
        }
        else {
            filteredData = this.getFilteredDataSet(reportFilters);
        }

        var rows = filteredData.rows;
        itemObjects = this.getDistinctColumnValues(rows, index);
        return itemObjects;
    },

    getDistinctColumnValues: function (rows, index) {
        var items = [],
            itemObjects = [];

        for (var i = 0; i < rows.length; i++) {
            var val = rows[i].cells[index].fmtValue,
                key = rows[i].cells[index].rawValue;
            if (!this.inArray(val, items)) {
                items.push(val);
                itemObjects.push({
                    'key': key,
                    'value': val
                });
            }

            //if unique items are more than 100 return(column is not applicable for filter)
            if (items.length > 100) {
                return undefined;
            }
        }

        itemObjects.sort(function compare(a, b) {
            if (a.key < b.key) {
                return -1;
            }

            if (a.key > b.key) {
                return 1;
            }

            return 0;
        });

        return itemObjects;
    },

    inArray: function (val, items) {
        for (var i = 0; i < items.length; i++) {
            if (val === items[i]) {
                return true;
            }
        }
        return false;
    },

    getFilteredDataSet: function (reportWiseFilters, columnToIgnore) {
        if (this.executionMonitorModel) {
            //get original dataset
            var data = $.extend(true, {}, this.executionMonitorModel.getData());
            //check if there are any filter
            if (!reportWiseFilters || reportWiseFilters.length === 0) {
                return data;
            }

            //loop through each filters of the report and get the filtered data
            for (var i = 0; i < reportWiseFilters.length; i++) {
                var currentFilter = reportWiseFilters[i];
                if (columnToIgnore && (columnToIgnore === currentFilter.columnName)) {
                    continue;
                }
                if (currentFilter.filterType === Sentrana.Enums.FILTER_TYPE_COLUMN) {
                    //do column filter
                    data = this.getColumnFilterdData(data, currentFilter);
                }
                else if (currentFilter.filterType === Sentrana.Enums.FILTER_TYPE_RANGE) {
                    // do range filter
                    data = this.getRangeFilterdData(data, currentFilter);
                }
            }
            return data;
        }
        return null;
    },

    getGridFilteredData: function (data, arrayOfDisplayIndexes) {
        if (!data || !arrayOfDisplayIndexes) {
            return data;
        }

        var filteredRows = [];
        for (var i = 0; i < arrayOfDisplayIndexes.length; i++) {
            filteredRows.push(data.rows[arrayOfDisplayIndexes[i]]);
        }

        var filteredData = $.extend(true, {}, data);
        filteredData.rows = filteredRows;
        return filteredData;
    },

    getColumnFilterdData: function (data, colFilter) {
        if (!data || !colFilter) {
            return data;
        }

        var arrayOfValues = colFilter.selectedItems.values.split('|');
        var filteredRows = [];
        for (var i = 0; i < data.rows.length; i++) {
            if ($.inArray(data.rows[i].cells[colFilter.columnIndex].fmtValue.toString(), arrayOfValues) > -1) {
                filteredRows.push(data.rows[i]);
            }
        }

        var filteredData = $.extend(true, {}, data);
        filteredData.rows = filteredRows;
        return filteredData;
    },

    getRangeFilterdData: function (data, rangeFilter) {
        if (!data || !rangeFilter) {
            return data;
        }

        var filteredRows = [];
        for (var i = 0; i < data.rows.length; i++) {
            var val = data.rows[i].cells[rangeFilter.columnIndex].rawValue,
                precision = this.getPrecision(data.colInfos[rangeFilter.columnIndex]);
            if (val) {
                val = val.toFixed(precision) * 1;
            }
            if (val >= rangeFilter.min * 1 && val <= rangeFilter.max * 1) {
                filteredRows.push(data.rows[i]);
            }
        }
        var filteredData = $.extend(true, {}, data);
        filteredData.rows = filteredRows;
        return filteredData;
    },

    getPrecision: function (colInfo) {
        if (colInfo.dataType === Sentrana.DataType.PERCENTAGE) {
            return 6;
        }
        return colInfo.formatString.replace(/^\D+/g, '') * 1;
    },

    getColumnValuesForRangeFiler: function (filtereddData, columnIndex) {

        var columnValues = this.getValuesForColumn(filtereddData, columnIndex);

        if (!columnValues.length || columnValues.length === 0) {
            return undefined;
        }

        var minValue = columnValues[0].rawValue * 1,
            maxValue = columnValues[0].rawValue * 1;

        for (var i = 1; i < columnValues.length; i++) {
            var val = columnValues[i].rawValue * 1;
            if (val > maxValue) {
                maxValue = val;
            }
            if (val < minValue) {
                minValue = val;
            }
        }
        return {
            "min": minValue,
            "max": maxValue
        };
    },

    getValuesForColumn: function (filtereddData, columnIndex) {
        var columnValues = [];

        //get values of that column
        for (var i = 0; i < filtereddData.rows.length; i++) {
            columnValues.push(filtereddData.rows[i].cells[columnIndex]);
        }

        return columnValues;
    },

    getColumnValuesForColumnFiler: function (filtereddData, columnIndex) {
        var columnValues = this.getValuesForColumn(filtereddData, columnIndex);

        var columnValuesJoined = '';
        for (var i = 1; i < columnValues.length; i++) {
            columnValuesJoined += ',' + columnValues[i].rawValue;
        }

        return columnValuesJoined;
    },

    findValuesForSliderFromColumnTypeFilter: function (filteredData, columnFilter) {
        //find lower/upper bound from filtered data
        var lowerUpperBounds = this.getColumnValuesForRangeFiler(filteredData, columnFilter.columnIndex);
        var selectedValues = columnFilter.selectedItems.keys.split('|');
        var minIndex = 0,
            maxIndex = 0;
        var minValue = selectedValues[0] * 1,
            maxValue = selectedValues[0] * 1;

        for (var i = 1; i < selectedValues.length; i++) {
            var val = selectedValues[i] * 1;
            if (val > maxValue) {
                maxValue = val;
                maxIndex = i;
            }
            if (val < minValue) {
                minValue = val;
                minIndex = i;
            }
        }

        var formattedValues = columnFilter.selectedItems.values.split('|');
        return {
            "min": minValue,
            "max": maxValue,
            "formattedMin": formattedValues[minIndex],
            "formattedMax": formattedValues[maxIndex],
            lowerBound: lowerUpperBounds.min,
            upperBound: lowerUpperBounds.max
        };
    },

    renderColumnFilters: function (app, container, $reportGrid, reportFilters) {
        //For Reference
        // http://live.datatables.net/ahuqus
        // https://datatables.net/forums/discussion/12513/adding-hide-column-image-in-each-column-header

        var that = this;
        $reportGrid.find('.dataTables_scrollHead .dataTable thead th .header-item-wrapper-div').append(can.view('templates/grid-column-filter.ejs', {
            "filtered": true
        })).children('.grid-column-filter').click(function () {

            app.handleUserInteraction();

            var $columnSortElement = container.element.find('.column-sort-element');

            var columnSortController = $columnSortElement.control();
            if (columnSortController && !columnSortController._destroyed) {
                columnSortController.hideThisController();
            }

            var columnIndex = $(this).parents('th').index() * 1,
                filteredItems = that.getUniqueItemsFromColumn(columnIndex, reportFilters),
                allItems = that.getUniqueItemsFromColumnAll(columnIndex, reportFilters);

            var $this = $(this),
                $columnFilterElement = container.element.find('.column-filter-element');

            $columnFilterElement.css({
                position: "absolute",
                top: ($this.offset().top) + 'px',
                left: ($this.offset().left + 8) + 'px'
            }).show();
            var controller = $columnFilterElement.control();
            if (controller && !controller._destroyed) {
                controller.destroy();
            }

            $columnFilterElement.sentrana_column_base_filter({
                items: allItems,
                columnIndex: columnIndex,
                selectedItems: that.columnFilters[columnIndex],
                filteredItems: filteredItems
            });
            return false;
        });
    },

    addFilter: function (reportFilters, filterColumn) {
        var columnDefn = $.grep(this.reportColumnsDefn, function (columnInfo) {
            return ((columnInfo.name === filterColumn.columnName) || (columnInfo.index === filterColumn.columnIndex));
        });

        if (columnDefn.length === 0) {
            return null;
        }

        //check if the filter is alreay added or not
        var reportWiseFilters = reportFilters || [];

        var filterColumnDefn = columnDefn[0];

        //Add column related info
        filterColumn.isMetrics = filterColumnDefn.colType === Sentrana.ColType.METRIC;
        filterColumn.columnName = filterColumnDefn.name;
        filterColumn.columnIndex = filterColumnDefn.index;

        //if with new filter no data found then remove the filter
        var tempFilters = [];
        var filterIndex = -1;

        for (var i = 0; i < reportWiseFilters.length; i++) {
            tempFilters.push(reportWiseFilters[i]);
            if (reportWiseFilters[i].columnName === filterColumnDefn.name) {
                filterIndex = i;
            }
        }

        //Check if the filter is reset or not
        var isFilterReset = false;
        if (filterColumn.filterType === Sentrana.Enums.FILTER_TYPE_RANGE) {
            var precision = this.getPrecision({
                formatString: filterColumn.formatString,
                dataType: filterColumn.dataType
            });
            var min = filterColumn.min.toFixed(precision) * 1,
                max = filterColumn.max.toFixed(precision) * 1,
                lbound = filterColumn.lowerBound.toFixed(precision) * 1,
                ubound = filterColumn.upperBound.toFixed(precision) * 1;

            if (min === lbound && max === ubound) {
                isFilterReset = true;
            }

        }
        else if (filterColumn.filterType === Sentrana.Enums.FILTER_TYPE_COLUMN) {
            isFilterReset = filterColumn.isAllSelected;
        }

        if (filterIndex > -1) {
            //we have the filter. So remove from current idex and push it to the last index
            reportWiseFilters.splice(filterIndex, 1);
        }

        if (!isFilterReset) {
            //add in last index
            reportWiseFilters.push(filterColumn);
        }

        return {
            "filter": reportWiseFilters,
            "tempFilter": tempFilters,
            "isFilterReset": isFilterReset
        };
    }
});
