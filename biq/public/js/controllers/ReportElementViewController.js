steal("js/controllers/ExecutionMonitorController.js",
    "js/observes/ExecutionMonitorObserve.js",
    "js/constructs/ReportFilterUtil.js",
    "js/controllers/RangeFilterController.js", function () {

        Sentrana.Controllers.LayoutElementViewBaseController("Sentrana.Controllers.ReportElementViewController", {
            pluginName: "sentrana_report_element_view",
            defaults: {
                callBackOnFail: undefined
            }
        }, {

            // Constructor...
            init: function () {
                this.showChart = false;
                this.showGrid=false;
                this.showText = false;
                this.app = this.options.app;
                this.elementType = this.options.elementType;
                this.icon = this.options.icon;
                this.initDOMObjects();
                this.initReportModels();
                this.initReportControls();
                this.hideReports();
                this.initDialogs();
                if(this.options.reportDefinitionInfoModel && this.options.reportDefinitionInfoModel.definition && this.options.reportDefinitionInfoModel.definition.template.length>0){
                     this.viewReport(this.options.reportDefinitionInfoModel);
                }
            },

            initDialogs: function () {
                this.maximizeChartDlg = this.element.find("#maximize-chart-dlg").sentrana_dialogs_maximize_chart({
                    app: this.options.app,
                    dialogDimension: Sentrana.getMaxViewDialogDimension()
                }).control();

                this.printSetupDialog = this.element.find("#print-setup-dialog").sentrana_dialogs_setup_print_options({
                    app: this.options.app
                }).control();

            },

            show: function () {
                this.element.show();
            },

            hide: function () {
                this.element.hide();
            },

            hideReports: function(){
                this.$summary.hide();
                this.$reportGrid.hide();
                this.$reportChart.hide();
                this.$textReport.hide();
                this.addBgImage();
            },

            showReportArea: function(){
                this.showChart = false;
                this.showGrid=false;
                this.showText = false;
                if(this.elementType === 'data-table'){
                    this.showGrid = true;
                    this.$reportGrid.show();
                    this.$reportChart.hide();
                    this.$textReport.hide();
                }else if(this.elementType === 'text'){
                    this.showText = true;
                    this.$reportGrid.hide();
                    this.$reportChart.hide();
                    this.$textReport.show();
                }else{
                    this.showChart = true;
                    this.$reportGrid.hide();
                    this.$reportChart.show();
                    this.$textReport.hide();
                }
            },

            initDOMObjects: function () {
                //get the container
                this.element.find('.view-report-container').remove();
                this.element.append(can.view('templates/reportElementViewer.ejs', {}));

                // Locate specific elements...
                this.$reportContainer =  this.element.find('.view-report-container');
                this.$summary = this.element.find(".summary");
                this.$executionMonitor = this.element.find(".execution-monitor");
                this.$reportGrid = this.element.find(".report-grid");
                this.$reportChart = this.element.find(".report-chart");
                this.$textReport = this.element.find(".text-report");
                this.addBgImage();
            },

            addBgImage: function(){
                if(this.icon){
                    this.$reportContainer.css('background-image','url('+this.icon+')');
                }
            },

            removeBgImage: function(){
                if(this.icon) {
                    this.$reportContainer.css('background-image', '');
                }
            },

            headerButtonClicked: function (eventType) {
                switch (eventType) {
                 case "chartOptions":
                        this.showOptionDialog();
                        break;
                    case "exportTable":
                        this.exportAll("grid");
                        break;
                    case "exportChart_png":
                        this.exportAll("png");
                        break;
                    case "exportChart_jpeg":
                        this.exportAll("jpeg");
                        break;
                    case "exportChart_pdf":
                        this.exportAll("pdf");
                        break;
                    case "maximizeChart":
                        this.openMaximizeReportDialog();
                        break;
                    case "printTable":
                        this.printAll("grid");
                        break;
                    case "printChart":
                        this.printAll("chart");
                        break;
                    case "printBoth":
                        this.printAll("both");
                        break;
                    case "printSetup":
                        this.openPrintSetupDialog();
                        break;

                    default:
                        break;
                }
            },

            " print-report-with-params": function (el, ev, param) {
                app_resources.print_config.columns_in_page = param.cols;
                app_resources.print_config.rows_in_page = param.rows;
                this.printAll(param.printItem);
            },

            openPrintSetupDialog: function () {
                this.printSetupDialog.open(true);
            },

            " print_all": function (el, ev, params) {
                this.printAll(params.type);
            },

            " export_all": function (el, ev, params) {
                this.exportAll(params.type, params.size);
            },

            openMaximizeReportDialog: function () {
                this.maximizeChartDlg.open(this.getChartOptionsForMaximize());
            },
            
            getChartOptionsForMaximize: function () {

                var filteredData = this.resultDataModel.getData();

                var chartOptions = {
                    model: $.extend(true, {}, this.chartOptions.model),
                    reportData: filteredData,
                    chartData: $.extend(true, {}, this.chartOptions.chartData),
                    chart: {
                        renderTo: ".maximized-chart-cntr",
                        chartType: this.chartOptions.chart.chartType
                    },
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
                    endPos: 1,
                    showShortCategoryTitle: true
                };

                return chartOptions;
            },

            showOptionDialog: function () {
                this.options.app.handleUserInteraction();
                if (!this.reportChartController.chart) {
                    return;
                }
                this.reportChartController.showOptionDialog();
            },
            
            exportAll: function (type, size) {
                this.options.app.handleUserInteraction();

                if (type !== 'grid' && !this.reportChartController.chart) {
                    return;
                }

                if (type === 'grid') {
                    this.exportReport();
                    return;
                }

                //if chart is not defined the return
                if (!this.chartOptions.chartData || !this.chartOptions.chartData.chartType || !this.reportChartController.chart.options) {
                    return;
                }

                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.ExportChart + "-" + type,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report
                };

                this.options.app.writeActionLog(actionLog);

                var fileName = this.reportDefnModel.getFileNameToExport();
                var height = size ? size.width : this.reportChartController.chart.chartHeight + 100,
                    width = size ? size.height : this.reportChartController.chart.chartWidth + 100;

                if (type === 'pdf') {
                    this.reportChartController.chart.exportChart({
                        type: "application/pdf",
                        sourceHeight: height,
                        sourceWidth: width,
                        filename: fileName
                    });
                }
                else if (type === 'jpeg') {
                    this.reportChartController.chart.exportChart({
                        type: "image/jpeg",
                        sourceHeight: height,
                        sourceWidth: width,
                        filename: fileName
                    });
                }
                else if (type === 'png') {
                    this.reportChartController.chart.exportChart({
                        type: "image/png",
                        sourceHeight: height,
                        sourceWidth: width,
                        filename: fileName
                    });
                }
            },

            exportReport: function () {

                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.DownloadTable,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report
                };

                this.options.app.writeActionLog(actionLog);

                var fileName = this.reportDefnModel.getFileNameToExport() + '.csv';
                fileName = encodeURIComponent(fileName);
                var params = this.reportDefnModel.getReportDefinitionParameters(true);
                params.template = params.template.replace(/\%/g, "%25").replace(/\+/g, "%2B");
                params.filter = params.filter.replace(/\+/g, "%2B");
                this.options.app.post(Sentrana.Controllers.BIQController.generateUrl("ExportToCsv"), {
                    templateUnits: params.template,
                    filterUnits: params.filter,
                    totalsOn: false,
                    sort: params.sort,
                    fileName: fileName
                });
            },

            printAll: function (type) {
                this.options.app.handleUserInteraction();
                if (type === 'chart' && !this.reportChartController.chart) {
                    return;
                }

                if (type === 'grid') {
                    this.printGrid();
                }
                else if (type === 'chart') {
                    this.printChartSentranaFormat();
                }
               
            },

            printChartSentranaFormat: function () {
                if (!this.reportChartController.chart) {
                    return;
                }

                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.PrintChart,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report
                };

                this.options.app.writeActionLog(actionLog);

                var tableData = null;
                var userInfo = this.options.app.retrieveUserInfo();
                var chartOptions = this.getChartOptionsForPrint();

                this.clientSidePrinting = new window.ClientSidePrinting({
                    tableData: tableData,
                    user: userInfo,
                    report: this.viewingReport,
                    chartOptions: chartOptions,
                    parent: this.element,
                    chartonly: true
                });
            },

            getChartOptionsForPrint: function () {

                if (!this.chartOptions.chartData) {
                    return undefined;
                }

                this.chartOptions.chartData.chartType = this.elementType;
                this.chartOptions.chart.chartType = this.elementType;

                var filteredData = this.resultDataModel.getData(); // this.getFilteredDataSet();
                var chartOptions = {
                    model: $.extend(true, {}, this.chartOptions.model),
                    reportData: filteredData,
                    chartData: $.extend(true, {}, this.chartOptions.chartData),
                    chart: {
                        renderTo: ".print-chart-ctr",
                        chartType: this.chartOptions.chartData.chartType
                    },
                    showOptions: false,
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
                    chartHeight: 400,
                    showShortCategoryTitle: true
                };

                
                return chartOptions;
            },

            printGrid: function () {
                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.PrintGrid,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report
                };

                this.options.app.writeActionLog(actionLog);
                
                var tableData = this.getTableData();
                var userInfo = this.options.app.retrieveUserInfo();
                this.clientSidePrinting = new window.ClientSidePrinting({
                    tableData: tableData,
                    user: userInfo,
                    report: this.viewingReport,
                    parent: this.element
                });
            },

            getTableData: function () {

                var tableIndex = this.reportGrid.dataTableSettings.length - 1,
                    tableSetings = this.reportGrid.dataTableSettings[tableIndex],
                    columns = tableSetings.aoColumns;

                var tablecolumns = [];
                $.each(columns, function (i, val) {
                    tablecolumns.push({
                        columValue: val.sTitle,
                        columnClass: val.sClass,
                        rows: []
                    });
                    tablecolumns.rows = [];
                });

                var currentRows = this.element.find('.table tbody tr');
                var tableRows = [];

                for (var di = 0; di < currentRows.length; di++) {
                    var dval = this.reportGridController.dataTable.fnGetData(currentRows[di]);
                    var cols = [];
                    $.each(tablecolumns, function (i, col) {
                        var key = 'c' + i + '_f';
                        var value = dval[key];
                        cols.push({
                            columValue: value,
                            columnClass: col.columnClass
                        });
                    });
                    var sclass = "odd-row";
                    if (di % 2 === 0) {
                        sclass = "even-row";
                    }
                    tableRows.push({
                        index: di,
                        trclass: sclass,
                        cols: cols
                    });
                }

                return {
                    tablecolumns: tablecolumns,
                    tableRows: tableRows
                };
            },

            getResultOptions: function(){
                var resultOptions;
                if (this.options.reportDefinitionInfoModel) {
                    resultOptions = this.options.reportDefinitionInfoModel.resultOptions;
                }

                return resultOptions;
            },

            initReportModels: function () {
                var that = this;
                // Construct a model instance to manage the chart settings.
                this.chartDataModel = new Sentrana.Models.ChartData();
                this.chartDataModel.attr('chartCollapseTail', false);
                this.chartDataModel.attr('chartType', this.options.elementType);

                // Construct a Model instance to manage the report definition. It is initially empty...
                this.reportDefnModel = new Sentrana.Models.ReportDefin({
                    app: this.options.app
                });

                this.resultDataModel = new Sentrana.Models.ResultDataModel({
                    app: this.options.app
                });

                this.resultDataModel.bind("change", function (ev, attr, how, newVal, oldVal) {
                    switch (newVal) {
                        case "SUCCESS":
                            that.options.app.unBlockElement(that.element.find(".report-viewer-container"));
                            that.executionMonitorModel.resultDataModel= that.resultDataModel;
                            that.executionMonitorModel.startLocalDataChange();
                            that.executionMonitorModel.setStaticData(undefined);
                            that.executionMonitorModel.endLocalDataChange("SUCCESS");
                            break;
                        case "STARTING":
                            var html = '<div class="loading"><p class="small-waitingwheel"><img src="images/loader-white.gif"/></p></div>';
                            that.options.app.blockElement(that.element.find(".report-viewer-container"), html);
                            break;
                        default:
                            break;
                    }
                });

                // Create a Model for the Execution Monitor...
                this.executionMonitorModel = new Sentrana.Models.ExecutionMonitor({
                    app: this.options.app,
                    reportDefinModel: this.reportDefnModel,
                    resultDataModel: this.resultDataModel,
                    resultOptions: this.getResultOptions()
                });

                // Bind specific changes in the Execution Monitor Model to the Report Definition Model...
                this.executionMonitorModel.bind("change", function (ev, attr, how, newVal, oldVal) {
                    if (attr === "executionStatus") {
                        // Switch on the new value...
                        switch (newVal) {
                            case "STARTING":
                                that.removeBgImage();
                                that.$summary.css('display', 'table');
                                break;
                            case "FAILURE":
                                if (that.options.callBackOnFail && typeof that.options.callBackOnFail === 'function') {
                                    that.options.callBackOnFail();
                                }
                                that.removeBgImage();
                                break;
                            case "SUCCESS":
                                that.$summary.hide();
                                that.showReportArea();
                                that.removeBgImage();
                                that.element.trigger("report_data_load_finished");
                                break;
                            default:
                                break;
                        }
                    }
                });

                // Create the default chart options...
                this.chartOptions = {
                    model: this.executionMonitorModel,
                    chartData: this.chartDataModel,
                    chart: {
                        renderTo: ".report-chart-cntr"
                    },
                    allowTypeSelectionOnFailure: false,
                    showOptions: this.options.showChartOptions,
                    rowRange: this.options.rowRange,
                    changeChartType: false,
                    preserveOptions: true,
                    showOptionsButton: false,
                    optionsDialogModal: true,
                    optionsDialogResizable: false,
                    parent: this,
                    optionDialogWidth: 400,
                    allowDrill: this.options.allowDrillDown,
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
                    chartHeight: this.options.contentInitialHeight,
                    donotInitChartData: true,
                    showShortCategoryTitle: true
                };

                this.chartOptions.chartData.fromDB = true;

                if (this.options.displayMode === 'read') {
                    this.chartOptions.showChartOptions = {
                        chartXAxisLabelRotation: true,
                        chartBinCount: true,
                        chartLegendAttribute: true,
                        chartCollapseTail: true,
                        chartCollapseItemName: true,
                        chartCollapseRowLimit: true,
                        chartAutoSegmentation: true,
                        chartAttrToSegment: true,
                        chartMetricToSegment: true
                    };
                }
            },

            getChartType: function () {
                return this.chartOptions.chartData.chartType;
            },

            getChartOptions: function () {
                return this.reportChartController.getChartData();
            },

            initReportControls: function (that) {
                // Create a Controller for the Execution Monitor...
                this.executionMonitorController = this.$executionMonitor.sentrana_report_element_execution_monitor({
                    executionMonitorModel: this.executionMonitorModel,
                    showHideGridFn: function (show) {
                        that.$reportGrid[(show) ? "show" : "hide"]();
                    },
                    showHideChartFn: function (show) {
                        that.$reportChart[(show) ? "show" : "hide"]();
                    },
                    parent: this
                }).control();

                // Create a Report Grid Viewer...
                this.reportGrid = this.$reportGrid.sentrana_report_grid({
                    model: this.executionMonitorModel,
                    reportDefnModel: this.reportDefnModel,
                    donotUpdateModel: true,
                    stopInitialRendering: false,
                    allowSort: false,
                    autoHeight: true
                });
                this.reportGridController = this.reportGrid.control();

                // Create a Report Chart Viewer...
                this.reportChartController = this.$reportChart.sentrana_report_chart(this.chartOptions).control();

                this.textReportController = this.$textReport.sentrana_text_report({
                    app: this.options.app,
                    model: this.executionMonitorModel
                }).control();
            },

            resize: function(width, height) {
                if(this.options.elementType === 'data-table'){
                    this.updateGridView();
                }else if(this.options.elementType === 'text'){
                    this.updateTextReportView(width, height);
                }else{
                    this.reSizeChartView(width, height);
                }
            },

            updateElementType: function(elementType, icon){
                this.icon = icon;
                this.elementType = elementType;
                var reportDefinition = this.reportDefnModel.getReportDefinitionParameters(true);
                if(reportDefinition && reportDefinition.template && reportDefinition.template.length > 0){
                    var reportDefinitionInfoModel = new Sentrana.Models.ReportDefinitionInfo({
                        "name": "",
                        "showChart": true,
                        "definition": reportDefinition,
                        "chartOptions": {
                            "chartType": elementType
                        }
                    });
                    this.viewReport(reportDefinitionInfoModel);
                    this.showReportArea();
                }else{
                    this.hideReports();
                }

            },

            " chart_option_dialog_ok": function (el, ev, chartOptions) {
                this.chartOptions = $.extend({}, this.chartOptions, chartOptions);
            },

            updateView: function () {
                this.reFlowChartView();
                this.updateGridView();
                this.initReportFiltersController();
            },

            updateChartView: function () {
                if (this.reportChartController && !this.reportChartController._destroyed) {
                    this.reportChartController.updateView(false);
                }
            },

            reFlowChartView: function () {
                if (this.reportChartController && !this.reportChartController._destroyed) {
                    this.reportChartController.reFlowChartView();
                    this.reportChartController.resizeRangeSlider();
                }
            },

            reSizeChartView: function (width, height) {
                if (this.reportChartController && !this.reportChartController._destroyed) {
                    this.reportChartController.reSizeChartView(width, height);
                }
            },

            updateGridView: function () {
                if (this.reportGridController && !this.reportGridController._destroyed) {
                    this.reportGridController.resizeGrid(false);
                }
            },

            updateTextReportView: function (width, height) {
                if (this.textReportController && !this.textReportController._destroyed) {
                    this.textReportController.updateTextSize(width, height);
                }
            },

            viewReport: function (report) {
                //if name/filter/column is shown on top then show the border and add padding
                if (this.options.showName || this.options.showColumns || this.options.showFilters) {
                    this.$summary.addClass('report-viewer-panel-summary');
                }

                // Specify the report definition...
                this.reportDefnModel.setDefn(report.definition);
                this.chartOptions.chart.chartType = this.elementType;
                //hide title and subtitle
                this.chartOptions.chartData.attr('chartTextOptions.chartTitle', '');
                this.chartOptions.chartData.attr('chartTextOptions.chartSubtitle', '');

                if (this.reportChartController && !this.reportChartController._destroyed) {
                    this.reportChartController.destroy();
                }

                // Specify whether to show chart or grid...
               this.executionMonitorModel.attr("showGrid", this.showGrid);
               this.executionMonitorModel.attr("showChart", this.showChart);

                // Update the Report Chart Viewer...
                this.reportChartController = this.$reportChart.sentrana_report_chart(this.chartOptions).control();

                if (this.options.displayMode === 'write') {
                    var columns = this.getColumns(),
                        type = this.chartOptions.chart.chartType,
                        title = this.getJoinedTitle(columns.metrics) + ' by ' + this.getJoinedTitle(columns.attributes),
                        xAxisLabel = this.getXAxisLabel(type, columns),
                        yAxisLabel = this.getYAxisLabel(type, columns);

                    this.chartOptions.chartTextOptions.chartTitle = title;
                    this.chartOptions.chartTextOptions.chartXAxisLabel = xAxisLabel;
                    this.chartOptions.chartTextOptions.chartYAxisLabel = yAxisLabel;
                }

                if (this.options.executionMonitorModel) {
                    this.$summary.hide();
                }
                else {
                    this.$summary.css('display', 'table');
                }

                // Ask the Execution Monitor Model to execute the specified report...
                report.initializeFilters();
                this.executionMonitorModel.executeReportUsingDefnParams(report.definition.attr ? report.definition.attr() : report.definition, 'CLEAR');
            }


        });
    });
