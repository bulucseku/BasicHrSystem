can.Observe.extend("Sentrana.Models.ResultDataModel", {}, {
    // Constructor...
    init: function (options) {
        this.setup({
            dataChangeStatus: null
        });

        // Define some instance fields...
        this.app = options.app;
        this.originalData = $.extend(true, {}, options.originalData);
        this.manipulatedData = $.extend(true, {}, options.originalData);
        this.filters = [];
        this.hiddenColumns = [];
        this.initRangeFilterModels();
        this.searchText = "";
        this.dataChanged = false;
        this.transformedData = undefined;
    },

    updateData: function (data, clientSideFilterDefinitions, oldModel) {
        this.originalData = $.extend(true, {}, data);
        this.manipulatedData = $.extend(true, {}, data);
        this.filters = oldModel ? oldModel.filters : [];
        this.hiddenColumns = oldModel ? oldModel.hiddenColumns : [];
        this.initRangeFilterModels();

        if (clientSideFilterDefinitions) {
            this.dataChanged = true;
            this.updateSavedFilters(clientSideFilterDefinitions);
            this.sortDataByMultipleColumn();
        }

        this.transformedData = this.getData();
    },

    updateSavedFilters: function (clientSideFilterDefinitions) {
        for (var i = 0; i < clientSideFilterDefinitions.length; i++) {
            var filterDef = clientSideFilterDefinitions[i];
            var column = this.getColumn(filterDef.columnId);
            if (!column) {
                continue;
            }
            var index = this.getColumnIndex(column.oid);
            column.sortOrder = filterDef.sortOrder;
            column.sortPos = filterDef.sortPosition;
            if (filterDef.isFiltered) {

                var filter = {};
                if (column.colType === Sentrana.ColType.METRIC) {
                    var minMax = filterDef.selectedKeys.split('|'),
                        bounds = this.getBoundsForSlider(index);

                    filter = {
                        filterType: Sentrana.Enums.FILTER_TYPE_RANGE,
                        columnName: column.title,
                        lowerBound: bounds.minValue * 1,
                        upperBound: bounds.maxValue * 1,
                        min: minMax[0] * 1,
                        max: minMax[1] * 1,
                        formattedMin: this.dotNetFormatter(minMax[0], column.formatString),
                        formattedMax: this.dotNetFormatter(minMax[1], column.formatString),
                        formatString: column.formatString,
                        dataType: column.dataType
                    };

                }
                else {

                    filter = {
                        columnIndex: filterDef.columnPosition,
                        columnName: column.title,
                        filterType: Sentrana.Enums.FILTER_TYPE_COLUMN,
                        isAllSelected: !filterDef.isFiltered,
                        selectedItems: {
                            values: filterDef.selectedKeys,
                            keys: filterDef.selectedKeys
                        }
                    };
                }

                this.addFilter(filter);
            }

            if (filterDef.isHidden) {
                this.hideColumn(column.title);
            }

            if (index > -1 && filterDef.columnPosition !== index) {
                this.reorderColumnPos(index, filterDef.columnPosition);
            }
        }
    },

    dotNetFormatter: function (x, formatString) {
        var result = formatString;
        if (formatString.indexOf("N") > -1 || formatString.indexOf("C") > -1) {
            if (formatString.indexOf("N") > -1) {
                result = "#,#";
            }
            if (formatString.indexOf("C") > -1) {
                result = "$#,#";
            }
            var decimalDigit = parseInt(formatString.substr(1, formatString.length - 1), 10);

            if (decimalDigit === 0) {
                x = Math.round(x);
            }
            else {
                for (var i = 0; i < decimalDigit; i++) {
                    if (i === 0) {
                        result += ".";
                    }
                    result += "0";
                }
            }
        }

        return String.format("{0:" + result + "}", x);
    },

    cloneThis: function () {
        var model = new Sentrana.Models.ResultDataModel({
            app: this.app
        });
        model.originalData = $.extend({}, this.originalData);
        model.manipulatedData = $.extend({}, this.manipulatedData);
        model.filters = $.extend([], this.filters);
        model.hiddenColumns = $.extend([], this.hiddenColumns);
        model.searchText = this.searchText;

        return model;
    },

    updateWithExternalData: function (dataModel) {
        this.dataChanged = true;
        this.originalData = $.extend(true, {}, dataModel.originalData);
        this.manipulatedData = $.extend(true, {}, dataModel.manipulatedData);
        this.filters = $.extend(true, [], dataModel.filters);
        this.hiddenColumns = $.extend(true, [], dataModel.hiddenColumns);
        this.searchText = dataModel.searchText;
    },

    resetSortOptions: function () {
        var manipulatedCols = this.manipulatedData.colInfos,
            originalCols = this.originalData.colInfos;
        for (var i = 0; i < manipulatedCols.length; i++) {
            var index = this.getOriginalColumnIndex(manipulatedCols[i].oid);
            manipulatedCols[i].sortOrder = originalCols[index].sortOrder;
            manipulatedCols[i].sortPos = originalCols[index].sortPos;
        }
    },

    getSelectedKeys: function (columnName) {
        var filter = this.getFilterByColumn(columnName);
        if (filter.isMetrics) {
            return filter.min + "|" + filter.max;
        }
        return filter.selectedItems.keys;
    },

    getResultOptions: function () {
        var columns = this.manipulatedData.colInfos,
            resultOptions = [];
        for (var i = 0; i < columns.length; i++) {
            var resultOption = {};
            resultOption.columnId = columns[i].oid;
            resultOption.isFiltered = this.isColumnFiltered(columns[i].title);
            resultOption.selectedKeys = resultOption.isFiltered ? this.getSelectedKeys(columns[i].title) : "";
            resultOption.sortOrder = columns[i].sortOrder;
            resultOption.sortPosition = columns[i].sortPos;
            resultOption.columnPosition = i;
            resultOption.isHidden = this.isColumnHidden(columns[i].title);

            resultOptions.push(resultOption);
        }

        return resultOptions;
    },

    initRangeFilterModels: function () {

        var that = this;

        if (this.manipulatedData) {
            var metricColumns = [],
                columns = this.manipulatedData.colInfos,
                minMaxValues = [],
                data = this.manipulatedData;

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

                if (columns[i].colType === Sentrana.ColType.METRIC) {
                    metricColumns.push(col);
                    minMaxValues.push({
                        min: data.rows[0].cells[i].rawValue,
                        max: data.rows[0].cells[i].rawValue
                    });
                }

            }

            for (var j = 0; j < data.rows.length; j++) {
                var l = 0;
                for (var k = 0; k < data.rows[j].cells.length; k++) {
                    if (this.isMetricColumn(k)) {
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

            this.rangeFilterModels = [];
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
                    that.rangeFilterModels.push(model);
                }

            });
        }
    },

    isMetricColumn: function (index) {
        return this.manipulatedData.colInfos[index].colType === Sentrana.ColType.METRIC;
    },

    isColumnHidden: function (name) {
        var columns = this.hiddenColumns;
        for (var i = 0; i < columns.length; i++) {
            if (columns[i] === name) {
                return true;
            }
        }
        return false;
    },

    isColumnFiltered: function (name) {
        for (var i = 0; i < this.filters.length; i++) {
            if (this.filters[i].columnName === name) {
                return true;
            }
        }
        return false;
    },

    swapSortPosition: function (currentColIndex, newSortPos, currentSortOrder) {
        var otherColSortPos = this.manipulatedData.colInfos[currentColIndex].sortPos,
            otherColumn = this.getColumnBySortPos(newSortPos),
            otherColumnIndex = this.getColumnIndexByName(otherColumn.title);

        this.updateColumnSortOrder(currentColIndex, otherColumnIndex, newSortPos, otherColSortPos, currentSortOrder);
    },

    updateColumnSortOrder: function (columnIndex, otherColumnIndex, columnPos, otherColPos, sortOrder) {
        this.manipulatedData.colInfos[columnIndex].sortPos = columnPos;
        this.manipulatedData.colInfos[otherColumnIndex].sortPos = otherColPos;
        this.manipulatedData.colInfos[columnIndex].sortOrder = sortOrder;
    },

    updateColumnFilter: function (columnName, filterType, filters) {
        this.filters[columnName] = {
            columnName: columnName,
            filterType: filterType,
            filters: filters
        };
    },

    clearTransformation: function () {
        this.manipulatedData = $.extend(true, {}, this.originalData);
        this.filters = [];
        this.hiddenColumns = [];
        this.initRangeFilterModels();
        this.searchText = "";
        this.dataChanged = false;
    },

    getColumnIndexByName: function (name) {
        var cols = this.manipulatedData.colInfos;
        for (var i = 0; i < cols.length; i++) {
            if (cols[i].title === name) {
                return i;
            }
        }
        return -1;
    },

    getCurrentColumnIndex: function (oid, includeHiddenColumn) {
        var cols = this.getData(undefined, includeHiddenColumn).colInfos;
        for (var i = 0; i < cols.length; i++) {
            if (cols[i].oid === oid) {
                return i;
            }
        }
        return -1;
    },

    getColumnIndex: function (oid) {
        var cols = this.manipulatedData.colInfos;
        for (var i = 0; i < cols.length; i++) {
            if (cols[i].oid === oid) {
                return i;
            }
        }
        return -1;
    },

    getOriginalColumnIndex: function (oid) {
        var cols = this.originalData.colInfos;
        for (var i = 0; i < cols.length; i++) {
            if (cols[i].oid === oid) {
                return i;
            }
        }
        return -1;
    },

    getColumnBySortPos: function (pos) {
        var cols = this.manipulatedData.colInfos;
        var col = $.grep(cols, function (tu) {
            return tu.sortPos === pos;
        });

        return col[0];
    },

    getColumn: function (oid) {
        var cols = this.manipulatedData.colInfos;
        var col = $.grep(cols, function (tu) {
            return tu.oid === oid;
        });

        return col[0];
    },

    getFilterByColumn: function (name) {
        var filter = $.grep(this.filters, function (f) {
            return f.columnName === name;
        });

        return filter[0];
    },

    getData: function (columnToIgnore, includeHiddenColumn) {
        //Consider filters and hidden fields and return data
        if (this.manipulatedData) {

            //check if there are any filter
            if ((!this.filters || this.filters.length === 0) && (this.searchText.length === 0) && (this.hiddenColumns.length === 0)) {
                return this.manipulatedData;
            }

            var data = $.extend(true, {}, this.manipulatedData);

            if (this.searchText.length > 0) {
                data = this.getSearchedData(data);
            }

            //loop through each filters of the report and get the filtered data
            for (var i = 0; i < this.filters.length; i++) {
                var currentFilter = this.filters[i];
                if (columnToIgnore && (columnToIgnore === currentFilter.columnName)) {
                    continue;
                }
                if (currentFilter.filterType === Sentrana.Enums.FILTER_TYPE_COLUMN) {
                    //do column filter
                    data = this.getColumnFilteredData(data, currentFilter);
                }
                else if (currentFilter.filterType === Sentrana.Enums.FILTER_TYPE_RANGE) {
                    // do range filter
                    data = this.getRangeFilteredData(data, currentFilter);
                }
            }

            if (!includeHiddenColumn) {
                //if we have any hidden column then remove those columns from data
                if (this.hiddenColumns.length > 0) {
                    data = this.getDataAfterColumnHide(data);
                }
            }

            return data;
        }
        return null;
    },

    getSortOrders: function () {
        var cols = $.extend([], this.manipulatedData.colInfos),
            orders = [];
        for (var j = 0; j < cols.length; j++) {
            cols[j].index = j;
        }

        cols.sort(function (a, b) {
            return a.sortPos - b.sortPos;
        });
        for (var i = 0; i < cols.length; i++) {
            orders.push([cols[i].index, cols[i].sortOrder === 'A' ? 'asc' : 'desc']);
        }

        return orders;
    },

    sortDataByMultipleColumn: function (sortOrders) {
        if (!sortOrders) {
            sortOrders = this.getSortOrders();
        }

        for (var i = sortOrders.length - 1; i >= 0; i--) {
            this.sortData(sortOrders[i][0], sortOrders[i][1]);
        }
    },

    sortData: function (index, order) {

        this.manipulatedData.rows.sort(function (a, b) {
            if (order.toLowerCase() === "a" || order.toLowerCase() === "asc") {
                if (a.cells[index].rawValue < b.cells[index].rawValue) {
                    return -1;
                }
                if (a.cells[index].rawValue > b.cells[index].rawValue) {
                    return 1;
                }
                return 0;
            }
            else {
                if (b.cells[index].rawValue < a.cells[index].rawValue) {
                    return -1;
                }
                if (b.cells[index].rawValue > a.cells[index].rawValue) {
                    return 1;
                }
                return 0;
            }
        });
    },

    updateSearchText: function (text) {
        this.searchText = $.trim(text);
    },

    getSearchedData: function (data) {

        var text = this.searchText,
            searchedData = $.extend(true, {}, data),
            searchedRows = $.grep(this.manipulatedData.rows, function (row, index) {
                var match = false;
                for (var i = 0; i < row.cells.length; i++) {
                    var val = row.cells[i].fmtValue;
                    if (val.toLowerCase().indexOf(text.toLowerCase()) > -1) {
                        match = true;
                    }
                }
                return match;
            });

        searchedData.rows = searchedRows;
        return searchedData;
    },

    getColumnFilteredData: function (data, colFilter) {
        if (!data || !colFilter) {
            return data;
        }

        var arrayOfKeys = colFilter.selectedItems.keys.split('|');
        var filteredRows = [];
        for (var i = 0; i < data.rows.length; i++) {
            var columnIndex = this.getColumnIndexByName(colFilter.columnName);
            if (columnIndex > -1 && $.inArray(data.rows[i].cells[columnIndex].rawValue.toString(), arrayOfKeys) > -1) {
                filteredRows.push(data.rows[i]);
            }
        }

        var filteredData = $.extend(true, {}, data);
        filteredData.rows = filteredRows;
        return filteredData;
    },

    getRangeFilteredData: function (data, rangeFilter) {
        if (!data || !rangeFilter) {
            return data;
        }

        var filteredRows = [];
        for (var i = 0; i < data.rows.length; i++) {
            var columnIndex = this.getColumnIndexByName(rangeFilter.columnName);
            if(columnIndex > -1) {
                var val = data.rows[i].cells[columnIndex].rawValue,
                    precision = this.getPrecision(data.colInfos[columnIndex]);

                if (val) {
                    val = val.toFixed(precision) * 1;
                }
                if (val >= rangeFilter.min * 1 && val <= rangeFilter.max * 1) {
                    filteredRows.push(data.rows[i]);
                }
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
        if (!colInfo.formatString) {
            colInfo.formatString = "";
        }
        return colInfo.formatString.replace(/^\D+/g, '') * 1;
    },

    getDataAfterColumnHide: function (data) {
        if (!data) {
            return data;
        }

        var tempData = $.extend(true, {}, data);

        for (var hc = 0; hc < this.hiddenColumns.length; hc++) {
            var columnIndex = -1;

            for (var c = 0; c < tempData.colInfos.length; c++) {
                if (tempData.colInfos[c].title === this.hiddenColumns[hc]) {
                    tempData.colInfos.splice(c, 1);
                    columnIndex = c;
                    break;
                }
            }

            for (var r = 0; r < tempData.rows.length; r++) {
                tempData.rows[r].cells.splice(columnIndex, 1);
            }
        }

        return tempData;
    },

    getFilters: function () {
        return this.filters;
    },

    getHiddenColumns: function () {
        return this.hiddenColumns;
    },

    hideColumn: function (columnName) {
        this.hiddenColumns.push(columnName);
    },

    showColumn: function (columnName) {
        this.hiddenColumns.splice($.inArray(columnName, this.hiddenColumns), 1);
    },

    addFilters: function (filters) {
        for (var i = 0; i < filters.length; i++) {
            this.addFilter(filters[i]);
        }
    },

    addFilter: function (filterColumn) {
        var columnDefn = $.grep(this.manipulatedData.colInfos, function (columnInfo) {
            return ((columnInfo.title === filterColumn.columnName));
        });

        if (columnDefn.length === 0) {
            return null;
        }

        var filterColumnDefn = columnDefn[0];

        //Add column related info
        filterColumn.isMetrics = filterColumnDefn.colType === Sentrana.ColType.METRIC;
        filterColumn.columnName = filterColumnDefn.title;
        filterColumn.columnIndex = this.getColumnIndexByName(filterColumnDefn.title);

        //if with new filter no data found then remove the filter
        var tempFilters = [];
        var filterIndex = -1;

        for (var i = 0; i < this.filters.length; i++) {
            tempFilters.push(this.filters[i]);
            if (this.filters[i].columnName === filterColumnDefn.title) {
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
            //we have the filter. So remove from current index and push it to the last index
            this.filters.splice(filterIndex, 1);
        }

        if (!isFilterReset) {
            //add in last index
            this.filters.push(filterColumn);
        }

        return true;
    },

    removeFilter: function (columnName) {
        this.filters.splice($.inArray(columnName, this.hiddenColumns), 1);
    },

    removeAllFilter: function () {
        this.filters = [];
    },

    //Instance method: If column position is reorderd then update result data
    reorderColumnPos: function (fromIndex, toIndex) {
        if (!this.manipulatedData) {
            return this.manipulatedData;
        }

        //reorder the columns
        var array = this.manipulatedData.colInfos.splice(fromIndex, 1);
        this.manipulatedData.colInfos.splice(toIndex, 0, array[0]);

        //reorder rows cells
        for (var i = 0; i < this.manipulatedData.rows.length; i++) {
            var cellArray = this.manipulatedData.rows[i].cells.splice(fromIndex, 1);
            this.manipulatedData.rows[i].cells.splice(toIndex, 0, cellArray[0]);
        }

        return undefined;
    },

    getResultData: function(){
        if(this.transformedData){
            return this.transformedData;
        }

        return this.getData();
    },

    startDataChange: function () {
        this.attr("dataChangeStatus", "STARTING");
    },

    endDataChange: function () {
        this.transformedData = this.getData();
        this.attr("dataChangeStatus", "SUCCESS");
    },

    getUniqueItemsFromColumn: function (index, includeHiddenColumn) {
        var rows = this.getData(undefined, includeHiddenColumn).rows;
        return this.getDistinctColumnValues(rows, index);
    },

    getUniqueItemsFromColumnAll: function (index, includeHiddenColumn, needAllData) {
        var data = [],
            currentColumn = this.getData(undefined, includeHiddenColumn).colInfos[index];
        if (needAllData) {
            data = this.manipulatedData;
        }
        else {
            if (this.filters.length > 0 && this.filters[this.filters.length - 1].columnName === currentColumn.title) {
                data = this.getData(currentColumn.title, includeHiddenColumn);
            }
            else {
                data = this.getData(undefined, includeHiddenColumn);
            }
        }

        return this.getDistinctColumnValues(data.rows, index);

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
            if (items.length > 500) {
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

    getBoundsForSlider: function (index) {
        var data = this.manipulatedData;
        if (data.rows.length < 2) {
            return false;
        }

        var minValue = data.rows[0].cells[index].rawValue,
            maxValue = data.rows[0].cells[index].rawValue;
        for (var i = 0; i < data.rows.length; i++) {
            var val = data.rows[i].cells[index].rawValue;
            if (val > maxValue) {
                maxValue = val;
            }
            if (val < minValue) {
                minValue = val;
            }
        }

        return {
            minValue: minValue,
            maxValue: maxValue
        };
    },

    getMinMaxValueForSlider: function (index) {
        var data = this.getData(undefined, true);

        if (data.rows.length <= 0) {
            return false;
        }

        var minValue = data.rows[0].cells[index].rawValue,
            maxValue = data.rows[0].cells[index].rawValue;
        for (var i = 0; i < data.rows.length; i++) {
            var val = data.rows[i].cells[index].rawValue;
            if (val > maxValue) {
                maxValue = val;
            }
            if (val < minValue) {
                minValue = val;
            }
        }

        return {
            minValue: minValue,
            maxValue: maxValue
        };
    },

    findMinMaxValues: function (columnFilter) {

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
            "formattedMax": formattedValues[maxIndex]
        };
    }
});
