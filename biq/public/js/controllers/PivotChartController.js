can.Control.extend("Sentrana.Controllers.PivotChartControl", {
    pluginName: 'sentrana_pivot_chart_control',
    defaults: {
        app: null
    }
}, {
    init: function() {
        this.updateView();
    },

    updateView: function () {
        this.setInitialPivotChartStructure();
        this.setInitialSelectedRowCol();

        this.element.html(can.view('templates/pivot-chart-container.ejs'));
        this.$btnValues = this.element.find(".btn-select-pivot-value");
        this.$btnRows = this.element.find(".btn-select-pivot-row");
        this.$btnColumns = this.element.find(".btn-select-pivot-column");
        this.loadDropdownItems();
        this.showPivotChart();

        this.maximizeChartDlg = this.element.find("#maximize-pivot-chart-dlg").sentrana_dialogs_maximize_pivot_chart({
            app: this.options.app,
            dialogDimension: Sentrana.getMaxViewDialogDimension()
        }).control();
    },

    loadDropdownItems: function() {
        this.loadMetrics();
        this.loadRows();
        this.loadColumns();
    },

    loadMetrics: function () {
        this.$btnValues.find(".dropdown-menu").html(can.view('templates/pivot-chart-dropdown-items.ejs', { items: this.getColumns("METRIC"), selectedId: this.pivotChartStructure.value.oid, type: "value" }));
    },

    loadRows: function () {
        this.$btnRows.find(".dropdown-menu").html(can.view('templates/pivot-chart-dropdown-items.ejs', { items: this.getColumns("ATTRIBUTE"), selectedId: this.pivotChartStructure.row.oid, type: "row" }));
    },

    loadColumns: function () {
        this.$btnColumns.find(".dropdown-menu").html(can.view('templates/pivot-chart-dropdown-items.ejs', { items: this.getColumns("ATTRIBUTE"), selectedId: this.pivotChartStructure.column.oid, type: "column" }));
    },

    getColumns: function (colType ) {
        return $.grep(this.options.data.colInfos, function (col) {
            return col.colType === colType;
        });
    },

    ".pivot-chart-dropdown-item click": function (el) {
        var itemId = el.attr("itemId"), type = $.trim(el.attr("type"));

        if (itemId === this.pivotChartStructure[type].oid) {
            return;
        }

        switch (type) {
            case "row":
                if (this.pivotChartStructure.column.oid === itemId) {
                    this.pivotChartStructure.column = this.pivotChartStructure.row;
                }
                this.pivotChartStructure.row = this.getColumnByOid(itemId);
                break;

            case "column":
                if (this.pivotChartStructure.row.oid === itemId) {
                    this.pivotChartStructure.row = this.pivotChartStructure.column;
                }
                this.pivotChartStructure.column = this.getColumnByOid(itemId);
                break;

            default:
                this.pivotChartStructure.value = this.getColumnByOid(itemId);
                break;
        }

        this.updateDropdownButtonText();
        this.loadDropdownItems();
        this.updateRowColumn();
        if (type !== "value") {
            this.setInitialSelectedRowCol();
        }
        this.showPivotChart();
    },

    getColumnByOid: function (oid) {
         var items= $.grep(this.options.data.colInfos, function (col) {
            return col.oid === oid;
         });

        return items[0];
    },

    exportChart: function (type, size) {
        if (this.pivotChartController && this.pivotChartController.chart) {
            var height = size ? size.height : this.pivotChartController.chart.chartHeight,
            width = size ? size.width : this.pivotChartController.chart.chartWidth,
            exportType = type === 'pdf' ? "application/pdf" : "image/" + type;

            this.pivotChartController.chart.exportChart({
                type: exportType,
                sourceHeight: height,
                sourceWidth: width,
                filename: this.pivotChartController.chartOptions.title.text
            });
        }
    },

    maximizeChart: function () {
        if (!this.pivotChartController.chart) {
            return;
        }
        var chartType = this.pivotChartController.chartAdapter.chartType;
        this.maximizeChartDlg.open(this.getChartOptionsForMaximize(), chartType);
    },

    " export_all": function (el, ev, params) {
        this.exportChart(params.type, params.size);
    },

    getChartOptionsForMaximize: function () {
        var chartOptions = {
            chartData: $.extend(true, {}, this.pivotChartController.chartAdapter.chartData),
            chart: {
                renderTo: ".maximized-chart-cntr",
                chartType: this.pivotChartController.chartAdapter.chartType
            },
            rowRange: false,
            showOptions: false,
            allowClickEvent: false,
            optionDialogWidth: 400,
            allowDrill: false,
            donotInitChartData: true,
            chartTextOptions: {
                chartTitle: " "
            },
            chartExport: {
                exporting: {
                    enabled: false
                },
                print: {
                    enabled: false
                }
            },
            chartHeight: 900,
            startPos: 0,
            endPos: 12,
            showShortCategoryTitle: true
        };

        chartOptions.pivotData = this.pivotChartController.chartAdapter.pivotData;
        return chartOptions;
    },

    " restore-pivot-chart": function () {
        this.setInitialSelectedRowCol();
        this.showPivotChart();
    },

    showPivotChart: function() {
        var that= this, html = '<div class="loading" ><p class="small-waitingwheel"><img src="images/loader-white.gif"/>&nbsp;Loading pivot analysis...</p></div>';
        this.options.app.blockElement(this.element.parent(), html);
        setTimeout(function() {
            that.renderChart();
        }, 100);
    },

    renderChart: function () {
      var chartOptions = {
            chartData: new Sentrana.Models.ChartData(),
            chart: {
                renderTo: ".pivot-chart-cntr"
            },
            allowTypeSelectionOnFailure: true,
            showOptions: true,
            rowRange: false,
            changeChartType: true,
            preserveOptions: true,
            showOptionsButton: false,
            optionsDialogModal: true,
            optionsDialogResizable: false,
            parent: this,
            optionDialogWidth: 400,
            allowDrill: false,
            stopInitialRendering: false,
            chartTextOptions: {
                chartTitle: " "
            },
            chartExport: {
                url: Sentrana.Controllers.BIQController.generateUrl("ExportChart"),
                exporting: {
                    enabled: false
                },
                print: {
                    enabled: false
                }
            },
            chartHeight: 400,
            donotInitChartData: true,
            showShortCategoryTitle: true
        };
        
        chartOptions.pivotData = this.summarizeDataForPivot();

        this.$pivotChart = this.element.find(".pivot-chart");

        if (this.pivotChartController && !this.pivotChartController._destroyed) {
            var chartType = this.pivotChartController.chartAdapter.chartType;
            this.pivotChartController.destroy();
        }


        this.pivotChartController = this.$pivotChart.sentrana_pivot_chart(chartOptions).control();
        this.pivotChartController.staticUpdate(chartType);

        this.updateDropdownButtonText();

        this.addCheckboxForPivotItems(this.element.find(".pivot-chart-items-columns"), this.distinctColumns, this.selectedColumns);
        this.addCheckboxForPivotItems(this.element.find(".pivot-chart-items-rows"), this.distinctRows, this.selectedRows);

        this.options.app.unBlockElement(this.element.parent());
    },

    resizePivotControl: function () {
        if (this.pivotChartController) {
            this.pivotChartController.reFlowChartView();
        }
    },

    updateDropdownButtonText: function() {
        this.element.find(".btn-select-pivot-row").find(".pivot-chart-items-name").text(this.pivotChartStructure.row.title);
        this.element.find(".btn-select-pivot-column").find(".pivot-chart-items-name").text(this.pivotChartStructure.column.title);
        this.element.find(".btn-select-pivot-value").find(".pivot-chart-items-name").text(this.pivotChartStructure.value.title);
    },

    ".pivot-chart mouseenter": function () {
            this.element.find(".chart-option").find(".chart-type").show().css('visibility', 'visible');
            //var $selected = $("#" + this.reportChartController.chartAdapter.chartType.replace(' ', '-') + "-chart-button-" + this.reportChartController.reportChartID);
            //$selected.attr('checked', true);
            //$selected.parent().addClass('active');
    },

    ".pivot-chart  mouseleave": function () {
         this.element.find(".chart-option").find(".chart-type").css('visibility', 'hidden');
    },

    ".btn-select-pivot-element click": function (el) {
        var $pivotElement = $(el).find(".pivot-chart-items-body"),
            type = $pivotElement.attr("type");

        if (type === "row") {
            this.previousSelectedRows = this.selectedRows;
        } else {
            this.previousSelectedColumns = this.selectedColumns;
        }
        $pivotElement.find(".input-filter-search").val("");
        $pivotElement.fadeIn().focus();
    },

    ".btn-select-pivot-element mouseleave": function (el) {
        $(el).find(".pivot-chart-items-body").fadeOut();
    },

    ".pivot-chart-items-body mouseleave": function (el) {
        var type = $(el).attr("type"), previousItems = this.previousSelectedColumns;
        if (type === "row") {
            previousItems = this.previousSelectedRows;
        }
        var items = this.getCheckedItems(el);

        if (this.isSelectionUpdated(items, previousItems)) {
            this.updateSelectedItems(items, type);
            this.showPivotChart();
        }
    },

    isSelectionUpdated: function (items, previousItems) {
        if (items.length !== previousItems.length) {
            return true;
        }

        for (var i = 0; i < items.length; i++) {
            if (items[i].key !== previousItems[i].key) {
                return true;
            }
        }
        return false;
    },

    getCheckedItems: function (el) {
        var chekboxItems = $(el).find(".checkboxItem:checked");
        return $.map(chekboxItems, function (item) {
                var obj = { key: $(item).attr("key"), value: $(item).attr("value") }
                return obj;
            });
    },

    ".checkboxItem change": function (el) {
        var $pivotElement = $(el).closest(".pivot-chart-items-body"),
            type = $pivotElement.attr("type"),
            items = this.distinctColumns,
            chekboxItems = $pivotElement.find(".checkboxItem:checked");

           if (type === "row") {
            items = this.distinctRows;
           }

           if (chekboxItems.length === items.length) {
               $pivotElement.find(".checkboxAll").prop('checked', true);
           }
           else {
               $pivotElement.find(".checkboxAll").prop('checked', false);
           }
    },

    updateSelectedItems: function (checkedItems, type) {
        if (type === "column") {
            this.selectedColumns = checkedItems;
        } else {
            this.selectedRows = checkedItems;
        }
    },

    ".checkboxAll change": function (el) {
        var $pivotElement = $(el).closest(".pivot-chart-items-body"),
            isChecked = $pivotElement.find(".checkboxAll").is(':checked'),
            chekboxItems = $pivotElement.find(".checkboxItem");

        if (isChecked) {
           chekboxItems.prop('checked', true);
        }
        else {
            chekboxItems.prop('checked', false);
        }
    },

    addCheckboxForPivotItems: function (element, items, selectedItems) {
        element.html(can.view('templates/columnBaseFilterCheckList.ejs', {
            items: items
        }));

        this.updateCheckboxStatus(element, items, selectedItems);
    },

    updateCheckboxStatus: function (element, items, selectedItems) {
        var isAllselected = selectedItems.length === items.length;

        for (var i = 0; i < selectedItems.length; i++) {
            element.find('.checkboxItem[key="' + selectedItems[i].key + '"]').prop('checked', true);
        }

        if (isAllselected) {
            element.find(".checkboxAll").prop('checked', true);
        }
    },

    ".accordion-search-input keyup": function (el, ev) {
        this.searchColumnValue(el);
    },

    searchColumnValue: function (el) {
        var searchValue = $(el).val(),
            items = this.distinctColumns,
            checkBoxElement = this.element.find(".pivot-chart-items-columns"),
            selectedItems = this.selectedColumns,
            type = $(el).closest(".pivot-chart-items-body").attr("type");

        if (type === "row") {
            items = this.distinctRows;
            selectedItems = this.selectedRows,
            checkBoxElement = this.element.find(".pivot-chart-items-rows");
        }

        var searchedItems = $.grep(items, function (col, index) {
            return col.value.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
        });

        this.addCheckboxForPivotItems(checkBoxElement, searchedItems, selectedItems);
        
    },

    setInitialPivotChartStructure: function() {
        var row = this.getColumn("ATTRIBUTE", -1),
            col = this.getColumn("ATTRIBUTE", row.index),
            val = this.getColumn("METRIC", -1);

        this.pivotChartStructure = { row: row.col, column: col.col, value: val.col };
        this.updateRowColumn();
    },

    updateRowColumn: function() {
        var rowIndex = this.getColIndexForPivotChart(this.pivotChartStructure.row);
        var colIndex = this.getColIndexForPivotChart(this.pivotChartStructure.column);

        var rows = this.options.data.rows;
        this.distinctRows = this.getDistinctColumnValues(rows, rowIndex);
        this.distinctColumns = this.getDistinctColumnValues(rows, colIndex);
    },

    getColumn: function (colType, except) {
        var colInfos = this.options.data.colInfos;
        for (var i = 0; i < colInfos.length; i++) {
            if (colInfos[i].colType === colType && except != i) {
                return {
                    col: colInfos[i],
                    index: i
                };

            }
        }
    },

    summarizeDataForPivot: function() {

        var rowIndex = this.getColIndexForPivotChart(this.pivotChartStructure.row);
        var colIndex = this.getColIndexForPivotChart(this.pivotChartStructure.column);
        var vallIndex = this.getColIndexForPivotChart(this.pivotChartStructure.value);
        var rows = this.options.data.rows;
        var distinctRows = this.getDistinctColumnValues(rows, rowIndex);

        var summarizedData = {};

        for (var i = 0; i < distinctRows.length; i++) {
            var rowWiseData = $.grep(rows, function(row) {
                return row.cells[rowIndex].rawValue === distinctRows[i].key;
            });

            var distinctCols = this.getDistinctColumnValues(rowWiseData, colIndex);
            var colValue = {};
            for (var j = 0; j < distinctCols.length; j++) {
                var colWiseData = $.grep(rowWiseData, function(row) {
                    return row.cells[colIndex].rawValue === distinctCols[j].key;
                });
                var sum = 0;
                for (var k = 0; k < colWiseData.length; k++) {
                    sum += colWiseData[k].cells[vallIndex].rawValue * 1;
                }
                colValue[distinctCols[j].key] = sum;
            }
            summarizedData[distinctRows[i].value] = colValue;
        }

        var categories = this.getChartCategoryForPivot(summarizedData);
        var series = this.getChartSeriesForPivot(summarizedData);

        return { data: summarizedData, categories: categories, series: series, pivotStructure: this.pivotChartStructure };
    },

    getColIndexForPivotChart: function(col) {
        var colInfos = this.options.data.colInfos;
        for (var i = 0; i < colInfos.length; i++) {
            if (colInfos[i].oid === col.oid) {
                return i;
            }
        }
        return -1;
    },

    getChartSeriesForPivot: function(pivotData) {
        var series = [];

        for (var i = 0; i < this.selectedColumns.length; i++) {
            var ser = {};
            ser.name = this.selectedColumns[i].key;
            ser.data = [];

            for (var j = 0; j < this.selectedRows.length; j++) {
                var rowKey = this.selectedRows[j].key,
                    colKeys = this.selectedColumns[i].key,
                    val = pivotData[rowKey][colKeys];

                var data = [j, val];
                ser.data.push(data);
            }

            series.push(ser);
        }

        return series;
    },

    setInitialSelectedRowCol: function() {
        this.selectedRows = this.distinctRows.length < 5 ? this.distinctRows : this.distinctRows.slice(0, 5);
        this.selectedColumns = this.distinctColumns.length < 10 ? this.distinctColumns : this.distinctColumns.slice(0, 10);
    },

    getChartCategoryForPivot: function(pivotData) {
        var catgories = [];
        for (var row in pivotData) {
            catgories.push(row);
        }
        return catgories;
    },

    getDistinctColumnValues: function(rows, index) {
        var items = [],
            itemObjects = [];

        for (var i = 0; i < rows.length; i++) {
            var val = rows[i].cells[index].fmtValue,
                key = rows[i].cells[index].rawValue;
            if (!this.itemAdded(val, items)) {
                items.push(val);
                itemObjects.push({
                    'key': key,
                    'value': val.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                });
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

    itemAdded: function(val, items) {
        for (var i = 0; i < items.length; i++) {
            if (val === items[i]) {
                return true;
            }
        }
        return false;
    }
});
