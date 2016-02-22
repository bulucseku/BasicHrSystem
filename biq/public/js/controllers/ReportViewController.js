steal("js/controllers/ExecutionMonitorController.js",
    "js/observes/ExecutionMonitorObserve.js",
    "js/constructs/ReportFilterUtil.js",
    "js/controllers/RangeFilterController.js", function () {

        Sentrana.Controllers.CollapsibleContainer("Sentrana.Controllers.ReportViewController", {
            pluginName: "sentrana_report_view",
            defaults: {
                showName: false,
                showColumns: false,
                showFilters: false,
                showExport: false,
                showPrint: false,
                showChartOptions: false,
                rowRange: true,
                changeChartType: false,
                showMaximize: true,
                allowDrillDown: false,
                displayMode: 'read',
                titleCls: 'report-definition-header-bar',
                callBackOnFail: undefined
            }
        }, {
            show: function () {
                this.element.show();
            },

            hide: function () {
                this.element.hide();
            },

            initDOMObjects: function () {
                // Add the collapsible panel to the container
                this.element.append(can.view('templates/' + this.panelTemplate, {
                    titleCls: this.options.titleCls,
                    reportNameWithOutSpecialChar: this.options.reportNameWithOutSpecialChar
                }));
                // Extract out key elements of the container...
                this.$indicator = this.element.find(".indicator");
                this.$content = this.element.find(".report-viewer-container");
                this.$buttonBar = this.element.find(".buttonBar");
                this.$title = this.element.find(".report-viewer-panel-title");

                // Construct the Panel UI
                this.buildCollapsiblePanelUI();

                //get the container
                this.$containerPanel = this.getContainerPanel();
                this.$containerPanel.html(can.view('templates/reportViewer.ejs', {
                    allowDrill: this.options.allowDrillDown
                }));

                // Locate specific elements...
                this.$summary = this.element.find(".summary");
                this.$executionMonitor = this.element.find(".execution-monitor");
                this.$reportGrid = this.element.find(".report-grid");
                this.$reportChart = this.element.find(".report-chart");
                this.$reportColumn = this.element.find(".report-column");
                this.$reportColumnContainer = this.element.find(".report-column-cntr");
                this.$reportFilter = this.element.find(".report-filter");
                this.$reportFilterContainer = this.element.find(".report-filter-cntr");
                this.$reportName = this.element.find(".report-name");
                this.$reportNameContainer = this.element.find('.report-name-cntr');
                this.$reportInfoContainer = this.element.find('.report-info-cntr');
                this.$reportInfoMsg = this.element.find('.report-info-loading-msg');
                this.$appliedRangeFilterContainer = this.element.find(".applied-range-filter-cntr");
                this.$appliedRangeFilter = this.element.find(".applied-range-filter");
                this.$drillMenu = this.element.find(".drill-menu");
                this.$showHideFilters = this.element.find(".show-hide-report-filters");
                this.$showHideFilters.hide();
            },

            manipulateDOMObjects: function () {
                this.$appliedRangeFilterContainer.hide();
                this.$reportColumnContainer.hide();
                this.$reportFilterContainer.hide();
                this.$reportInfoContainer.hide();
                this.$reportNameContainer.hide();
            },

            getResultOptions: function () {
                var resultOptions;
                if (this.options.resultOptions) {
                    return this.options.resultOptions;
                }

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

                if (this.options.executionMonitorModel) {
                    this.executionMonitorModel = this.options.executionMonitorModel;
                    this.executionMonitorModel.resultOptions = this.getResultOptions()
                    this.$executionMonitor.hide();
                }

                // Bind specific changes in the Execution Monitor Model to the Report Definition Model...
                this.executionMonitorModel.bind("change", function (ev, attr, how, newVal, oldVal) {
                    // Has the execution status changed?
                    if (attr === "executionStatusDrilldown" && newVal === "SUCCESS") {
                        setTimeout(function () {
                            that.filterSectionRendered = false;
                            that.initReportFiltersController();
                        }, 300);
                    }

                    if(attr === "localDataChangeStatus" && newVal === "SUCCESS"){
                        //that.resultDataModel = that.executionMonitorModel.resultDataModel;
                        that.updateDataView();
                    }

                    if (attr === "executionStatus") {
                        // Switch on the new value...
                        switch (newVal) {
                        case "STARTING":
                                break;
                        case "FAILURE":
                            if (that.options.callBackOnFail && typeof that.options.callBackOnFail === 'function') {
                                that.options.callBackOnFail();
                            }
                            break;
                        case "SUCCESS":
                            if (that.reportGridController && that.reportGridController.element) {
                                that.reportGridController.element.show();
                            }
                            if (that.reportChartController && that.reportChartController.element) {
                                that.reportChartController.element.show();
                            }
                            that.filterSectionRendered = false;
                            var oldModel;
                            if(that.executionMonitorModel.saveState){
                                oldModel = that.executionMonitorModel.resultDataModel;
                            }
                            that.resultDataModel.updateData(that.executionMonitorModel.data, that.getResultOptions(), oldModel);

                            that.executionMonitorModel.reportDefinModel.resultDataModel = that.resultDataModel;

                            that.showButtons();
                            that.updateDataView();
                            that.makeFilterContainerCollapsible();
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
                    allowTypeSelectionOnFailure: true,
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
                    chartHeight: 400,
                    donotInitChartData: true,
                    showShortCategoryTitle: true
                };

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

            makeFilterContainerCollapsible: function () {
                this.$showHideFilters.show();
                this.$showHideFilters.off("click");
                this.$showHideFilters.click({
                    controller: this
                }, this.ShowHideFiltersOnClick);
            },

            ShowHideFiltersOnClick: function (event) {
                var thisController = event.data.controller,
                    icon = $(this).find('.indicator-icon');
                var title = $(this).attr('Title');
                $(this).attr('Title', title === "Show filters" ? "Hide filters" : "Show filters");

                $(icon[0]).toggleClass("fa-minus-square");
                thisController.element.find(".report-filters-container").slideToggle('normal');
                thisController.initReportFiltersController();

            },

            initReportFiltersController: function () {
                if (this.filterSectionRendered) {
                    if (this.reportFiltersController) {
                        this.reportFiltersController.reDrawSliders();
                    }

                    return;
                }

                if (this.reportFiltersController && !this.reportFiltersController._destroyed) {
                    this.reportFiltersController.destroy();
                }

                this.reportFiltersController = this.element.find(".report-filters-container").sentrana_report_filters({
                    app: this.options.app,
                    resultDataModel: this.resultDataModel
                }).control();

                this.filterSectionRendered = true;

            },

            " reset_filtercontrol": function (el, ev, param) {
                this.filterSectionRendered = false;
                this.initReportFiltersController();
            },

            updateDataView: function () {
                //get the current scroll position
                var scrollPos = $(document).scrollTop();
                this.updateAppliedFilterView();
                //set back the scroll position
                $(document).scrollTop(scrollPos);
            },

            initDialogs: function () {
                $(".result-definition-element").html('');
                if (this.options.reportNameWithOutSpecialChar) {
                    $("#" + this.options.reportNameWithOutSpecialChar).html('');
                    $("#" + this.options.reportNameWithOutSpecialChar).append('<div class="result-definition-element"></div>');

                    this.resultDefDlg = $("#" + this.options.reportNameWithOutSpecialChar).sentrana_dialogs_result_definition({
                        app: this.options.app,
                        resultDataModel: this.resultDataModel
                    }).control();
                }
                else {
                    var domElement = this.element.find(".result-definition-dlg");
                    domElement.html('');

                    domElement.append('<div class="result-definition-element"></div>');
                    this.resultDefDlg = domElement.sentrana_dialogs_result_definition({
                        app: this.options.app,
                        resultDataModel: this.resultDataModel
                    }).control();
                }

                this.maximizeChartDlg = this.element.find("#maximize-chart-dlg").sentrana_dialogs_maximize_chart({
                    app: this.options.app,
                    dialogDimension: Sentrana.getMaxViewDialogDimension()
                }).control();

                this.printSetupDialog = this.element.find("#print-setup-dialog").sentrana_dialogs_setup_print_options({
                    app: this.options.app
                }).control();

            },

            getChartOptions: function () {
                return this.reportChartController.getChartData();
            },

            " grid_column_reordered": function (el, ev, param) {
                this.resultDataModel.reorderColumnPos(param.from, param.to);
                this.executionMonitorModel.reportDefinModel.resultDataModel.reorderColumnPos(param.from, param.to);               

                var that = this;
                setTimeout(function () {
                    that.filterSectionRendered = false;
                    that.initReportFiltersController();
                    that.updateReportChartForFilter(that.resultDataModel.getData());
                }, 50);

            },

            initReportControls: function (that) {
                // Create a Controller for the Execution Monitor...
                this.executionMonitorController = this.$executionMonitor.sentrana_execution_monitor({
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
                    allowSort: false
                });
                this.reportGridController = this.reportGrid.control();

                // Create a Report Chart Viewer...
                this.reportChartController = this.$reportChart.sentrana_report_chart(this.chartOptions).control();

                // Create a Drill Menu Controller...
                this.drillController = this.$drillMenu.sentrana_drill_menu({
                    executionMonitorModel: this.executionMonitorModel,
                    parent: this
                }).control();
            },

            // Constructor...
            init: function () {
                this.titleCls = this.options.titleCls;
                this.panelTemplate = 'report-view-panel.ejs';
                this.containerButtonTemplate = 'templates/collapsibleContainerButton.ejs';
                this.ExpandIcon = 'fa-minus-square';
                this.CollapseIcon = 'fa-plus-square';

                this.initDOMObjects();
                this.manipulateDOMObjects();
                //This is the dictionary for report wise all the filters
                this.reportWiseFilters = {};
                this.viewingReportColumnDefn = [];
                var that = this;
                // Instance fields...
                this.app = this.options.app;

                this.initReportModels(that);
                this.initReportControls(that);
                this.options.callBackFunctionOnExpand = function () {
                    that.updateView();
                };

                this.options.callBackFunctionOnCollapse = function () {
                    //that.updateView();
                };

                this.initDialogs();
            },

            showButtons: function () {

                this.addButtonToBar({
                    "title": "Report Options",
                    "cls": "fa-tasks",
                    "eventType": "report_options",
                    "dropdown": true,
                    "menuItems": [{
                        id: "dataFilters",
                        name: "Data Filters"
                    }, {
                        id: "chartOptions",
                        name: "Chart Options"
                    }, {
                        id: "exportTable",
                        name: "Download Table"
                    }, {
                        id: "exportChart",
                        name: "Download Chart",
                        submenuItems: [{
                            id: "exportChart_png",
                            name: "Download PNG"
                        }, {
                            id: "exportChart_jpeg",
                            name: "Download JPEG"
                        }, {
                            id: "exportChart_pdf",
                            name: "Download PDF"
                        }]
                    }, {
                        id: "maximizeChart",
                        name: "Maximize Chart"
                    }, {
                        id: "printChartandTable",
                        name: "Print Chart and Table",
                        submenuItems: [{
                            id: "printBoth",
                            name: "Print Chart and Table"
                        }, {
                            id: "printTable",
                            name: "Print Table"
                        }, {
                            id: "printChart",
                            name: "Print Chart"
                        }, {
                            id: "printSetup",
                            name: "Setup Print Options"
                        }]
                    }]
                });

            },

            " report_options": function (el, ev, params) {
                switch (params.type) {
                case "dataFilters":
                    this.showFilters();
                    break;
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
                this.printSetupDialog.open();
            },

            showFilters: function () {
                var elem = this.element.find(".show-hide-report-filters"),
                    icon = elem.find('.indicator-icon');
                elem.attr('Title', "Hide filters");
                $(icon[0]).addClass("fa-minus-square");
                this.element.find(".report-filters-container").fadeIn('normal');
                this.initReportFiltersController();
            },

            " .report-chart mouseenter": function () {
                if (this.options.changeChartType) {
                    this.element.find(".chart-option").find(".chart-type").show().css('visibility', 'visible');

                    var $selected = $("#" + this.reportChartController.chartAdapter.chartType.replace(' ', '-') + "-chart-button-" + this.reportChartController.reportChartID);
                    $selected.attr('checked', true);
                    $selected.parent().addClass('active');
                }
            },

            " .report-chart  mouseleave": function () {
                if (this.options.changeChartType) {
                    this.element.find(".chart-option").find(".chart-type").css('visibility', 'hidden');
                }
            },

            showLoadingInfo: function (msg) {
                this.$reportInfoContainer.show();
                this.$reportInfoMsg.html(msg);
            },

            hideLoadingInfo: function () {
                this.$reportInfoContainer.hide();
            },

            addActionButton: function (buttonObj) {
                this.addButtonToBar(buttonObj);
            },

            setTitle: function (titleHeader, titleDesc) {
                var title = '';

                if (titleHeader) {
                    title += "<strong>" + titleHeader + "</strong>";
                }

                if (titleDesc) {
                    title += titleDesc;
                }

                this.$title.html(title);
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

            updateGridView: function () {
                if (this.reportGridController && !this.reportGridController._destroyed) {
                    this.reportGridController.resizeGrid(false);
                    this.showColumnUtilIcon();
                }
            },

            viewReport: function (report) {

                this.viewingReport = report;
                this.hideLoadingInfo();

                if (this.options.showName) {
                    this.$reportNameContainer.show();
                    this.$reportName.html(report.name);
                }
                else {
                    this.$reportNameContainer.hide();
                }

                if (this.options.showColumns) {
                    // Set the report column...
                    this.$reportColumnContainer.show();
                    this.$reportColumn.html(report.formatColumns(false));
                }
                else {
                    this.$reportColumnContainer.hide();
                }

                if (this.options.showFilters) {
                    // Set the report filter...
                    this.$reportFilterContainer.show();
                    this.$reportFilter.html(report.formatFilter(false));
                }
                else {
                    this.$reportFilterContainer.hide();
                }

                //if name/filter/column is shown on top then show the border and add padding
                if (this.options.showName || this.options.showColumns || this.options.showFilters) {
                    this.$summary.addClass('report-viewer-panel-summary');
                }

                // Specify the report definition...
                this.reportDefnModel.setDefn(report.definition);

                //Drill is not allowed for view mode of saved report.
                this.reportGridController.options.allowDrill = this.options.allowDrillDown;

                if (report.chartOptions) {
                    this.chartOptions.chart.chartType = report.chartOptions.chartType;
                    this.chartOptions.chartData.attr(report.chartOptions.attr ? report.chartOptions.attr() : report.chartOptions);
                    this.chartOptions.chartData.fromDB = true;
                }

                if (this.reportChartController && !this.reportChartController._destroyed) {
                    this.reportChartController.destroy();
                }

                var hasMetrics = this.hasMetrics(report.definition.template.split('|'));
                this.executionMonitorController.options.hasMetrics = hasMetrics;

                // Specify whether to show chart or grid...
                this.executionMonitorModel.attr("showGrid", report.showGrid);
                this.executionMonitorModel.attr("showChart", hasMetrics);

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
                    this.$summary.show();
                }

                if (this.drillController) {
                    this.drillController.unCheckedOptions = {};
                }

                // Ask the Execution Monitor Model to execute the specified report...
                report.initializeFilters();
                this.executionMonitorModel.executeReportUsingDefnParams(report.definition.attr ? report.definition.attr() : report.definition, 'CLEAR');
            },

            hasMetrics: function (columns) {
                for (var i = 0; i < columns.length; i++) {
                    var column = this.options.app.getDWRepository().getObjectByOID(columns[i]);
                    if (column.type === "METRIC") {
                        return true;
                    }
                }
                return false;
            },

            getXAxisLabel: function (type, columns) {
                // generally the attributes, but for charts based on continuous X axis, the first metric
                if (type === Sentrana.CHART_TYPE_SCATTER ||
                    type === Sentrana.CHART_TYPE_BUBBLE ||
                    type === Sentrana.CHART_TYPE_HISTOGRAM) {
                    return columns.metrics[0].name;
                }
                else {
                    return this.getJoinedTitle(columns.attributes);
                }
            },

            getYAxisLabel: function (type, columns) {
                // generally the metrics, but for 2-D continuous charts, the 2nd metric, and for historgrams, the count
                if (type === Sentrana.CHART_TYPE_SCATTER ||
                    type === Sentrana.CHART_TYPE_BUBBLE) {
                    if (columns.metrics.count > 1) {
                        return columns.metrics[1].name;
                    }
                    return this.getJoinedTitle(columns.metrics);

                }
                else if (this.chartOptions.chartData.chartType === Sentrana.CHART_TYPE_HISTOGRAM) {
                    return "Count";
                }
                else {
                    return this.getJoinedTitle(columns.metrics);
                }
            },

            getColumns: function () {
                var columns = this.reportDefnModel.templateUnits,
                    attributes = [],
                    metrics = [];
                for (var i = 0; i < columns.length; i++) {
                    if (columns[i].type === 'ATTRIBUTE') {
                        attributes.push(columns[i]);
                    }
                    else {
                        metrics.push(columns[i]);
                    }
                }
                return {
                    attributes: attributes,
                    metrics: metrics
                };
            },

            getJoinedTitle: function (columns) {
                var titleArray = [];
                for (var i = 0; i < columns.length; i++) {
                    titleArray.push(columns[i].name);
                }
                return titleArray.join(', ');
            },

            exportReport: function () {

                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.DownloadTable,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report,
                    ElementId: this.viewingReport.id
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

            printChart: function () {
                if (!this.reportChartController.chart || !this.viewingReport.showChart) {
                    return;
                }

                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.PrintChart,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report,
                    ElementId: this.viewingReport.id
                };

                this.options.app.writeActionLog(actionLog);

                //this.reportChartController.chart.print();
                this.printChartSentranaFormat();
            },

            printChartSentranaFormat: function () {
                if (!this.reportChartController.chart || !this.viewingReport.showChart) {
                    return;
                }

                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.PrintChart,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report,
                    ElementId: this.viewingReport.id
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

            printGrid: function () {
                if (!this.viewingReport.showGrid) {
                    return;
                }

                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.PrintGrid,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report,
                    ElementId: this.viewingReport.id
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

            getChartOptionsForPrint: function () {

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

                if (!this.viewingReport.showChart || !this.chartOptions.chartData || !this.chartOptions.chartData.chartType) {
                    chartOptions = undefined;
                }

                return chartOptions;
            },

            printGridAndChart: function () {

                if (!this.viewingReport.showGrid && !this.viewingReport.showChart) {
                    return;
                }
                else if (!this.viewingReport.showGrid && this.viewingReport.showChart) {
                    //this.printChart();
                    this.printChartSentranaFormat();
                    return;
                }

                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.PrintReport,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report,
                    ElementId: this.viewingReport.id
                };

                this.options.app.writeActionLog(actionLog);

                var tableData = this.getTableData();
                var userInfo = this.options.app.retrieveUserInfo();

                var chartOptions = this.getChartOptionsForPrint();

                this.clientSidePrinting = new window.ClientSidePrinting({
                    tableData: tableData,
                    user: userInfo,
                    report: this.viewingReport,
                    chartOptions: chartOptions,
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

            ".report-viewer-title click": function (el, ev) {
                this.options.app.handleUserInteraction();

                this.showHideCollapsibleContent();

                // Stop the event from propagating up the DOM element chain...
                return false;
            },

            " print_all": function (el, ev, params) {
                this.printAll(params.type);
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
                else if (type === 'both') {
                    this.printGridAndChart();
                }
            },

            " export_all": function (el, ev, params) {
                this.exportAll(params.type, params.size);
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
                if (!this.viewingReport.showChart || !this.chartOptions.chartData || !this.chartOptions.chartData.chartType || !this.reportChartController.chart.options) {
                    return;
                }

                //action log
                var actionLog = {
                    ActionName: Sentrana.ActionLog.ActionNames.ExportChart + "-" + type,
                    Context: Sentrana.ActionLog.Contexts.SavedReport,
                    ElementType: Sentrana.ActionLog.ElementTypes.Report,
                    ElementId: this.viewingReport.id
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

            " show_chart_options": function (el, ev) {
                this.showOptionDialog();
            },

            " chart_failed": function () {
                this.element.find('.options-btn-container').remove();
                this.element.find('.maximize-btn-container').remove();
                if (this.reportChartController) {
                    this.reportChartController.hideSlider();
                }
            },

            ".options-btn-container .cc-button click": function () {
                this.showOptionDialog();
            },

            " .maximize-btn-container .cc-button click": function () {
                //show_chart_maximized
                this.openMaximizeReportDialog();
            },

            showOptionDialog: function () {
                this.options.app.handleUserInteraction();
                if (!this.reportChartController.chart) {
                    return;
                }
                this.reportChartController.showOptionDialog();
            },

            applyFilterToGridAndChart: function (filteredData) {
                if (filteredData) {
                    this.updateReportGridForFilter(filteredData);
                    this.updateReportChartForFilter(filteredData);
                }
            },

            updateReportGridForFilter: function (filteredData) {
                //Update report Grid
                this.reportGridController.staticUpdate(filteredData);
            },

            updateReportChartForFilter: function (filteredData) {
                //Update report Chart
                var chartOptions = $.extend(true, {}, this.chartOptions);
                if (this.reportChartController.chartAdapter) {
                    chartOptions.chart.chartType = this.reportChartController.chartAdapter.chartType;
                }
                chartOptions.reportData = filteredData;
                this.reportChartController.staticUpdate(chartOptions);

            },

            blockElement: function (el, html) {
                $(el).block({
                    message: html,
                    css: {
                        width: 'auto',
                        padding: 0,
                        border: 0,
                        backgroundColor: 'transparent',
                        cursor: 'default'
                    },
                    overlayCSS: {
                        backgroundColor: '#000',
                        opacity: 0.3,
                        cursor: 'default'
                    }
                });
            },

            unBlockElement: function (el) {
                $(el).unblock();
            },

            updateAppliedFilterView: function () {
                this.$appliedRangeFilterContainer.show();
                var html = '';

                var reportWiseFilters = this.resultDataModel.filters || [];

                if (reportWiseFilters.length > 0) {
                    for (var i = 0; i < reportWiseFilters.length; i++) {

                        var currentFilter = reportWiseFilters[i];

                        if (currentFilter.filterType === Sentrana.Enums.FILTER_TYPE_RANGE) {
                            if (html.length > 0) {
                                html += ', ';
                            }
                            html += currentFilter.columnName + ' [' + currentFilter.formattedMin + ' - ' + currentFilter.formattedMax + ']';
                        }
                        else if (currentFilter.filterType === Sentrana.Enums.FILTER_TYPE_COLUMN && currentFilter.isMetrics) {

                            var values = this.resultDataModel.findMinMaxValues(currentFilter);

                            if (html.length > 0) {
                                html += ', ';
                            }

                            html += currentFilter.columnName + ' [' + values.formattedMin + ' - ' + values.formattedMax + ']';
                        }
                    }
                }

                this.$appliedRangeFilter.html(html);
                var appledFilterCntr = this.element.find('.applied-range-filter-cntr');

                reportWiseFilters.length > 0 ? appledFilterCntr.show() : appledFilterCntr.hide();
                html.length > 0 ? appledFilterCntr.show() : appledFilterCntr.hide();
            },

            inArray: function (val, items) {
                for (var i = 0; i < items.length; i++) {
                    if (val === items[i]) {
                        return true;
                    }
                }
                return false;
            },

            " grid_rendered": function () {
                this.showColumnUtilIcon();
                this.renderShowHiddenColumnButton();
                this.showHideHiddedColumnIcon();
            },

            " grid_drawn": function () {
                this.showColumnUtilIcon();
            },

            " grid_header_clicked": function (el, ev, data) {
                var oid = $(data.column).find('.grid-column-util').attr("oid");
                var resultColumn = this.resultDataModel.getColumn(oid);
                var colIndex = this.resultDataModel.getColumnIndex(oid);

                this.resultDataModel.startDataChange();
                this.resultDataModel.swapSortPosition(colIndex, 1, resultColumn.sortOrder === "A" ? "D" : "A");
                this.resultDataModel.sortDataByMultipleColumn();
                this.resultDataModel.endDataChange();
            },

            renderShowHiddenColumnButton: function () {

                this.$reportGrid.find(".table-header .table-caption").html(can.view('templates/hidden-columns-container.ejs', {}));

                var that = this;

                this.$reportGrid.find('.hidden-column-util').click(function () {

                    that.options.app.handleUserInteraction();

                    var $this = $(this);

                    var panelBody = that.element.find('.report-view-panel-body').offset();
                    var $columnUtilElement = that.element.find('.hidden-column-element');

                    $columnUtilElement.css({
                        position: "absolute",
                        top: ($this.offset().top - panelBody.top + 50) + 'px',
                        left: ($this.offset().left - panelBody.left + 8) + 'px'
                    }).show();

                    var controller = $columnUtilElement.control();
                    if (controller && !controller._destroyed) {
                        controller.destroy();
                    }

                    $columnUtilElement.sentrana_grid_hidden_column({
                        app: that.options.app,
                        hiddenColumns: that.resultDataModel.hiddenColumns
                    });

                    return false;
                });

            },

            ".dataTable thead th mouseover": function (el, ev) {
                var $columnUtilicon = $(el).find('.grid-column-util');
                $columnUtilicon.removeClass('invisible visible').addClass('visible');
            },

            ".dataTable thead th mouseout": function (el, ev) {
                $(el).find('.grid-column-util').removeClass('invisible visible').addClass('invisible');
            },

            showColumnUtilIcon: function () {
                var columns = this.resultDataModel.manipulatedData.colInfos,
                    index = 0;
                if (!columns) {
                    return;
                }

                $(".result-definition-element").html('');
                this.removeGridUtilIcons();
                this.renderGridUtilIcons();
                for (var i = 0; i < columns.length; i++) {
                    if (!this.resultDataModel.isColumnHidden(columns[i].title)) {
                        index += 1;
                        var gridColumnHeader = this.$reportGrid.find('.dataTables_scrollHead .dataTable thead th:nth-child(' + (index) + ')');
                        gridColumnHeader.children('.grid-column-util').attr('oid', columns[i].oid);

                        gridColumnHeader.removeClass("sorting sorting_asc sorting_desc");
                        if (columns[i].sortOrder.toUpperCase() === "A") {
                            gridColumnHeader.addClass("sorting_desc");
                        }
                        else {
                            gridColumnHeader.addClass("sorting_asc");

                        }
                    }
                }
            },

            removeGridUtilIcons: function () {
                this.$reportGrid.find('.dataTables_scrollHead .dataTable thead th').find(".grid-column-util").remove();
                this.$reportGrid.find('.dataTables_scrollHead .dataTable thead th').find(".clear").remove();

                this.$reportGrid.find('.dataTables_scrollBody .dataTable thead th').find(".grid-column-util").remove();
                this.$reportGrid.find('.dataTables_scrollBody .dataTable thead th').find(".clear").remove();
            },

            renderGridUtilIcons: function () {
                //For Reference
                // http://live.datatables.net/ahuqus
                // https://datatables.net/forums/discussion/12513/adding-hide-column-image-in-each-column-header

                var that = this;
                this.$reportGrid.find('.dataTables_scrollHead .dataTable thead th').append(can.view('templates/grid-column-util.ejs', {})).children(
                    '.grid-column-util').click(function () {

                    that.options.app.handleUserInteraction();

                    var $this = $(this),
                        oid = $this.attr('oid');

                    var panelBody = that.element.find('.report-view-panel-body').offset();
                    var $columnUtilElement = that.element.find('.column-util-element');

                    $columnUtilElement.css({
                        position: "absolute",
                        top: ($this.offset().top - panelBody.top + 50) + 'px',
                        left: ($this.offset().left - panelBody.left + 8) + 'px'
                    }).show();

                    var controller = $columnUtilElement.control();
                    if (controller && !controller._destroyed) {
                        controller.destroy();
                    }

                    $columnUtilElement.sentrana_report_sort_util({
                        app: that.options.app,
                        oid: oid,
                        resultDataModel: that.resultDataModel,
                        panelBody: panelBody
                    });

                    return false;
                });
            },

            " hide_grid_column": function (el, ev, param) {
                this.resultDataModel.startDataChange();
                this.resultDataModel.hideColumn(param);
                this.resultDataModel.endDataChange();

                this.showHideHiddedColumnIcon();
            },

            " restore_column": function (el, ev, param) {
                this.resultDataModel.startDataChange();
                this.resultDataModel.showColumn(param);
                this.resultDataModel.endDataChange();
                this.showHideHiddedColumnIcon();

            },

            showHideHiddedColumnIcon: function () {
                if (this.resultDataModel.hiddenColumns.length > 0) {
                    this.$reportGrid.find('.hidden-column-util').show();
                }
                else {
                    this.$reportGrid.find('.hidden-column-util').hide();
                }

            },

            " reset_sort-options": function (el, ev, param) {
                this.resultDataModel.startDataChange();
                this.resultDataModel.resetSortOptions();
                this.resultDataModel.sortDataByMultipleColumn();
                this.resultDataModel.endDataChange();
            },

            " chart_row_slider_changed": function () {
                this.options.app.handleUserInteraction();
            },

            " chart_element_clicked": function () {
                this.options.app.handleUserInteraction();
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

            openMaximizeReportDialog: function () {
                this.maximizeChartDlg.open(this.getChartOptionsForMaximize());
            },

            closeMaximizeWindow: function () {
                var isDialogOpen = this.$chartArea.dialog("isOpen");
                if (isDialogOpen) {
                    this.$chartArea.dialog("close");
                }
            },

            " print_closed": function () {
                this.options.app.handleUserInteraction();
                this.initReportFiltersController();
                this.updateView();

                if (this.reportChartController) {
                    this.reportChartController.updateView(undefined, true);
                    if (this.isMaximizedDialogOpened) {
                        //focus to the dialog
                        if (this.origFocus) {
                            this.origFocus.focus();
                        }
                    }
                }
            },

            " chart_option_dialog_ok": function (el, ev, chartOptions) {
                this.chartOptions = $.extend({}, this.chartOptions, chartOptions);
            }

        });
    });
