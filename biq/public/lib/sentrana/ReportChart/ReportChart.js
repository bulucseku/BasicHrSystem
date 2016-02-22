(function () {
    /**
    * Below describes the usage of all the properties inside this model.
    *
    * <ul>
    *  <li>reportData - Direct report data passed in so we can render the chart immediately. No need to wait for the model to be updated.</li>
    *  <li>needRedraw - This is a flag to indicate whether we need to redraw the whole chart after we update some of chartData properties. This could happen during the initialization of chartData.</li>
    *  <li>chartType - Type of chart that will be generated</li>
    *  <li>chartTextOptions.chartTitle - Title for chart</li>
    *  <li>chartTextOptions.chartSubtitle - Subtitle for chart</li>
    *  <li>chartTextOptions.chartXAxisLabel - X axis label</li>
    *  <li>chartTextOptions.chartYAxisLabel - Y axis label</li>
    *  <li>chartTextOptions.chartXLabelRotation - X Axis label rotation</li>
    *  <li>chartCollapseItemName - The descriptive value that will be shown for all the collapse items</li>
    *  <li>chartCollapseRowLimit - The number of rows we want to show before collapsing</li>
    *  <li>chartLegendAttrColumnName - The attribute column we use to create the legend. This is only applicable to scatter and bubble chart.</li>
    *  <li>chartCollapseTail - Flag indicates whether we will collapse all the items in the tail</li>
    *  <li>chartAutoSegmentation - Flag indicates whether we will create segmentation chart</li>
    *  <li>chartSegAttrColumnName - The attribute column used for chart segmentation</li>
    *  <li>chartSegMetricColumnName - The metric column used for chart segmentation</li>
    *  <li>chartAttrColumnNames - Used to populate the drop down list in the chart option dialog so the user could specify an attribute column as the segmentation column</li>
    *  <li>chartMetricColumnNames - Used to populate the drop down list in the chart option dialog so the user could specify a metric column as the metric for segementation</li>
    *  <li>startPos - Default row range start position</li>
    *  <li>endPos - Default row range end position</li>
    *  <li>chartOptionHeightOffset - Height offset we need to append in order to show chart option area and chart properly</li>
    *  <li>chartWarningHeightOffset - Height offset we need to append in order to show the warning message properly</li>
    *  <li>binCount - Approximate number of bins to display for histograms.</li>
    * </ul>
    */
    $.Observe.extend("Sentrana.Models.ChartData", {}, {
        init: function () {
            /* Define the skeleton data structure for our report options. */
            this._super({
                reportData: null,
                needRedraw: false,
                chartType: null,
                chartTextOptions: {
                    chartTitle: null,
                    chartSubtitle: null,
                    chartXAxisLabel: null,
                    chartYAxisLabel: null,
                    chartXLabelRotation: null
                },
                chartCollapseItemName: 'Other',
                chartCollapseRowLimit: 10,
                chartLegendAttrColumnName: null,
                chartCollapseTail: true,
                chartAutoSegmentation: false,
                chartSegAttrColumnName: null,
                chartSegMetricColumnName: null,
                chartAttrColumnNames: [],
                chartMetricColumnNames: [],
                startPos: 0,
                endPos: 9,
                chartHeight: 400,
                chartOptionHeightOffset: 25,
                chartWarningHeightOffset: 25,
                binCount: 25
            });
        }
    });

    // Main controller for report chart component.
    // It handles rendering of the chart options and actual chart area.
    $.Controller("Sentrana.Controllers.ReportChart", {
        reportChartID: 0,
        defaults: {
            basePath: "js/ReportChart/",
            chartOptionsTemplate: "templates/rc_chartOptions.tmpl",
            optionsDialogTemplate: "templates/rc_optionsDialog.tmpl",
            model: null,
            chartData: null,
            reportData: null,
            chartTextOptions: {
                chartTitle: null,
                chartSubtitle: null,
                chartXAxisLabel: null,
                chartYAxisLabel: null,
                chartXLabelRotation: null
            },
            chart: {
                renderTo: ".report-chart-cntr",
                chartType: null
            },
            chartExport: {
                url: '/BIQSvc/SqlGen.svc/ExportChart',
                exporting: {
                    enabled: true,
                    menuItems: [{}, {}, {}, null
                    // TODO no ppt download for now.
                    // ,{
                    // text: 'Download PPT document',
                    // onclick: function() {
                    // this.exportChart({type: 'application/pdf'}); // TODO PPT export not implemented yet, use PDF export for now.
                    // }
                    // }
					]// Please read Highcharts documentation for details about this implementation
                },
                print: {
                    enabled: true
                }
            },
            showOptions: false,
            showOptionsButton: true,
            showRestoreButton: false,
            optionDialogWidth: 400,
            rowRange: true,
            changeChartType: true,
            allowDrill: true,
            optionsDialogModal: false,
            optionsDialogResizable: true,
            invisibleSeries: [],
            preserveOptions: true, // For report builder page, this will be the default value true. But for saved report page, this will be false as we don't want to shared any information across different charts in different reports.
            showChartOptions: {
                chartTitle: true,
                chartSubtitle: true,
                chartXAxisLabel: true,
                chartYAxisLabel: true,
                chartXAxisLabelRotation: true,
                chartBinCount: true,
                chartLegendAttribute: true,
                chartCollapseTail: true,
                chartCollapseItemName: true,
                chartCollapseRowLimit: true,
                chartAutoSegmentation: true,
                chartAttrToSegment: true,
                chartMetricToSegment: true
            }
        }
    }, {

        // initialize widget
        init: function (el, options) {
            // Generate the unique ID for each report chart control on the page, starting from number 0.
            this.reportChartID = this.constructor.reportChartID;
            this.constructor.reportChartID = this.constructor.reportChartID + 1;
            // We need to populate chartData model.
            this.chartData = options.chartData;
            // We need to tranform the renderTo option value so that Highcharts will be able to find the correct element to render.
            this.options.chart.renderTo = $(this.options.chart.renderTo, this.element)[0];

            // If we directly pass in reportData object, we will render the chart immediately.
            // Otherwise we will wait for the model change and then start to render the chart.
            if (options.reportData) {
                this.staticUpdate(options);
            }
        },

        // Instance method: invoked on subsequent calls to the jQuery Helper object for this controller...
        update: function RC_update(options) {
            if (options.reportData) {
                this.staticUpdate(options);
                return;
            }
            this._super(options);
            this.chartData = options.chartData;
            this.options.chart.renderTo = $(this.options.chart.renderTo, this.element)[0];

            //this.updateView(true, true);

        },

        // This method will be called when we directly pass in report data to generate the chart.
        // It's different from the approach of listening to the model change.
        staticUpdate: function RC_staticUpdate(options) {
            // Get chart data.
            this.options.reportData = options.reportData;
            this.chartAdapter = new Sentrana.ChartDataAdapter(options.reportData);
            this.chartAdapter.chartType = options.chart.chartType || this.chartAdapter.defaultChartType();
            if (options.chartTextOptions) {
                this.options.chartTextOptions = options.chartTextOptions;
            }
            // Add needRedraw switch on and off in order to stop updating view because of model update event.
            this.chartData.attr("needRedraw", false);
            if (!options.donotInitChartData) {
                this.initChartData();
            }
            this.chartData.attr("needRedraw", true);

            this.updateView(true, true);
        },

        getData: function () {
            return this.options.reportData || (this.options.model && this.options.model.getData());
        },

        // Instance method: How we render the view...
        updateView: function RC_updateView(refreshChartOptions, refreshSlider) {
            if (this.chart && this.options.preserveOptions) {
                //preserving the visibility status of chart series.
                var invisibleSeries = [];
                if (this.chart.series) {
                    var series = $.grep(this.chart.series, function (e) { return e.visible === false; });
                    $.each(series, function (index, item) {
                        invisibleSeries.push(item.name);
                    });

                    this.options.invisibleSeries = invisibleSeries;
                    // Destroy the existing chart to save some system resource used.
                    this.chart.destroy();
                }
            }

            var data = this.getData();
            if (!data || !data.rows || !data.rows.length) {
                return;
            }

            // If it contains "<" or ">" character then replace those with "&lt;" and "&gt;" respectively
            $.each(data.rows, function (rowIndex, rowValue) {
                if (rowValue.cells) {
                    $.each(rowValue.cells, function (cellIndex, cellValue) {
                        if (cellValue.fmtValue) {
                            cellValue.fmtValue = cellValue.fmtValue.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        }
                    });
                }
            });

            if (this.isMissingElement()) {
                this.chart = null;
                // No need to proceed, just showing the warning message.
                this.showChartWarning("You must select at least one metric and one attribute in order to create a chart!");
                if (this.element) {
                    this.element.trigger("chart_failed");
                }
                return;
            }
            else if (!this.isSavedChartTypeNotSupported(this.chartAdapter.chartType)) {
                this.chart = null;
                // No need to proceed, just showing the warning message.
                this.showChartWarning("Your saved report chart type is no longer supported for your current report definition. Please change your report definition or switch to another chart type.", true);
                // The user is able to switch to other types of chart. No need to trigger chart failed message.
                return;
            }
            else {
                // Show chart and option div.
                $(this.options.chart.renderTo, this.element).show();
                $(".chart-option", this.element).show();
            }
            // hide the chart warning div if necessary
            if ($(".report-chart-warning", this.element).length) {
                $(".report-chart-warning", this.element).hide();
            }
            var that = this;
            // Create the Highcharts object and the options toolbar above the chart.

            // Create chart options that will be used to create highchart.
            this.chartOptions = this.chartAdapter.populateChartOptions(this);
            // Validate data and show warning message if there is any.
            var warningMsg = this.chartOptions.validateData();
            if (warningMsg != null) {
                this.chart = null;
                //Validate data and show related warning message.
                this.showChartWarning(warningMsg);
                if (this.element) {
                    this.element.trigger("chart_failed");
                }
                return;
            }

            //update the visibility status (false) of chart series.
            if (this.options.invisibleSeries.length > 0) {
                $.each(this.chartOptions.series, function (index, item) {
                    if (jQuery.inArray(item.name, that.options.invisibleSeries) !== -1) {
                        item.visible = false;
                    }
                });
            }

            // Create Highcharts component.
            try {
                this.chart = new Highcharts.Chart(this.chartOptions);
            }
            catch (err) {
                // Something is wrong when populating the chart. Show error message instead.
                this.chart = null;
                this.showChartWarning("There is something wrong while generating the chart! You may have selected too many attributes or metrics in the report. Please reduce the amount of attributes and metrics, then try again.");
                if (this.element) {
                    this.element.trigger("chart_failed");
                }
                return;
            }


            // For actions such as updating chart options and changing chart type, we don't need to refresh this portion.
            if (refreshChartOptions) {
                var chartTypeSupported = {
                    line: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_LINE),
                    pie: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_PIE),
                    column: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_COLUMN),
                    bar: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_BAR),
                    stackedColumn: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_STACKED_COLUMN),
                    stackedBar: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_STACKED_BAR),
                    scatter: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_SCATTER),
                    bubble: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_BUBBLE),
                    histogram: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_HISTOGRAM)
                };
                // Render the chart option area
                $(".chart-option", this.element).html(this.options.basePath + this.options.chartOptionsTemplate, {
                    chartTypeSupported: chartTypeSupported,
                    reportChartID: this.reportChartID
                }).show();
                if (!this.options.showOptions) {
                    $(".chart-option", this.element).hide();
                }
                if (this.options.showOptions && this.options.showOptionsButton) {
                    // Style the buttons
                    $(".btn-chart-option", this.element).button();
                } else {
                    $(".chart-option-button", this.element).hide();
                }
                // By default the restore button is hidden. It will show only when there are changes to the range.
                $(".chart-restore-button", this.element).hide();
                if (this.options.showOptions && this.options.showRestoreButton) {
                    // Style the buttons
                    $(".btn-chart-restore", this.element).button();
                }
                if (this.options.showOptions && this.options.changeChartType) {
                    // Set the default button
                    $("#" + this.chartAdapter.chartType.replace(' ', '-') + "-chart-button-" + this.reportChartID).attr('checked', true);
                    $(".chart-type", this.element).buttonset();
                } else {
                    $(".chart-type", this.element).hide();
                }
            }
            if (!(this.options.showOptions && this.options.rowRange)) {
                $(".chart-row-range", this.element).hide();
            }
            if (refreshSlider && this.options.rowRange) {
                // Then init the slider for the user to update the range.
                $(".slider-chart-row-range", this.element).slider({
                    range: true,
                    min: 1,
                    max: this.getData().rows.length,
                    values: [this.chartData.startPos + 1, this.chartData.endPos + 1],
                    slide: function (event, ui) {
                        $(".label-chart-row-range", that.element).val(ui.values[0] + " - " + ui.values[1]);
                    },
                    stop: function (event, ui) {
                        that.chartData.attr("startPos", ui.values[0] - 1);
                        // Force redraw of chart
                        that.chartData.attr("needRedraw", true);
                        that.chartData.attr("endPos", ui.values[1] - 1);
                    }
                });
                $(".label-chart-row-range", this.element).val($(".slider-chart-row-range", this.element).slider("values", 0) + " - " + $(".slider-chart-row-range", this.element).slider("values", 1));
            }
            this.fixHeight();
            // Initialize the tool tips.
            this.initTips();

            // Rebind the chart
            if (this.element) {
                this.element.trigger("chart_rebind");
            }
        },

        initTips: function () {
            if ($.fn.qtip) {
                $.fn.qtip.defaults.style.classes = "ui-tooltip-green ui-tooltip-shadow";
                $(".slider-desc", this.element).qtip({ content: "This will update the row range of the tabular result to be presented on chart." });
            }
        },

        fixHeight: function () {
            var chartHeight = this.options.chartHeight;
            if (chartHeight) {
                $(".report-chart-cntr", this.element).outerHeight(chartHeight);
            }
        },

        // This funciton is going to populate most of the fields in chartData model using information generated by chartAdapter,
        // which is stored in chartOptions object.
        initChartData: function () {
            // Synchronize chartData object.
            this.chartData.attr("chartType", this.chartAdapter.chartType);
            var chartTextOptions = {
                chartTitle: this.options.chartTextOptions.chartTitle || this.chartAdapter.getChartTitle(),
                chartSubtitle: this.options.chartTextOptions.chartSubtitle || this.chartAdapter.getChartSubtitle(),
                chartXAxisLabel: this.options.chartTextOptions.chartXAxisLabel || this.chartAdapter.getXAxisLabel(),
                chartYAxisLabel: this.options.chartTextOptions.chartYAxisLabel || this.chartAdapter.getYAxisLabel(),
                // Do format the value back to Number!!! Otherwise it will cause a lot of problems.
                chartXLabelRotation: this.options.chartTextOptions.chartXLabelRotation || Sentrana.CHART_DEFAULT_XAXIS_ROTATION
            };

            this.chartData.attr("chartTextOptions", chartTextOptions);

            // Init the start position back to 0
            this.chartData.attr("startPos", 0);
            this.chartData.attr("endPos", this.chartData.chartCollapseRowLimit - 1 < (this.getData().rows.length - 1) ? this.chartData.chartCollapseRowLimit - 1 : (this.getData().rows.length - 1));

            // Populate data needed in option dialog.
            // By default there should be no legend for scatter chart or bubble chart.
            this.chartData.attr("chartLegendAttrColumnName", 'None'); // this.chartData.attr("chartLegendAttrColumnName", this.chartAdapter.getDefaultSegAttrName());
            this.chartData.attr("chartAttrColumnNames", this.chartAdapter.resultDataset.getAttrColumnNames());
            this.chartData.attr("chartSegAttrColumnName", this.chartAdapter.getDefaultSegAttrName());
            this.chartData.attr("chartMetricColumnNames", this.chartAdapter.resultDataset.getMetricColumnNames());
            this.chartData.attr("chartSegMetricColumnName", this.chartAdapter.getDefaultSegMetricName());
        },

        // Get Chart settings object
        getChartData: function () {
            return this.chartData.serialize();
        },

        // This method was moved from ChartAdapter class into this controller class.
        getChartOptions: function () {
            var options = {
                controller: this
            };
            switch (this.chartAdapter.chartType) {
                case Sentrana.CHART_TYPE_LINE:
                    return new Sentrana.Models.LineChartOptions(options);
                case Sentrana.CHART_TYPE_PIE:
                    return new Sentrana.Models.PieChartOptions(options);
                case Sentrana.CHART_TYPE_COLUMN:
                    return new Sentrana.Models.ColumnChartOptions(options);
                case Sentrana.CHART_TYPE_BAR:
                    return new Sentrana.Models.BarChartOptions(options);
                case Sentrana.CHART_TYPE_STACKED_COLUMN:
                    return new Sentrana.Models.StackedColumnChartOptions(options);
                case Sentrana.CHART_TYPE_STACKED_BAR:
                    return new Sentrana.Models.StackedBarChartOptions(options);
                case Sentrana.CHART_TYPE_SCATTER:
                    return new Sentrana.Models.ScatterChartOptions(options);
                case Sentrana.CHART_TYPE_BUBBLE:
                    return new Sentrana.Models.BubbleChartOptions(options);
                case Sentrana.CHART_TYPE_HISTOGRAM:
                    return new Sentrana.Models.HistogramChartOptions(options);
                case Sentrana.CHART_TYPE_GAUGE:
                    return new Sentrana.Models.GaugeChartOptions(options);
                default:
                    return new Sentrana.Models.ChartOptions(options);
            }
        },

        isMissingElement: function () {
            return this.chartAdapter.metricIndexArray.length === 0 || this.chartAdapter.attributeIndexArray.length === 0;
        },

        isSavedChartTypeNotSupported: function (chartType) {
            return this.chartAdapter.supportChartType(chartType);
        },

        showChartWarning: function (msg, showOption) {
            // The place we should show the message.
            if (!$(".report-chart-warning", this.element).length) {
                $("<div></div>").attr('class', 'report-chart-warning').appendTo(this.element);
            }
            $(".report-chart-warning", this.element).html(msg);
            $(".report-chart-warning", this.element).show();
            //Empty the chart option area and chart area.
            $(this.options.chart.renderTo, this.element).hide();
            if (!showOption) {
                $(".chart-option", this.element).hide();
            }
        },

        showRestoreButton: function () {
            // Display the restore button
            if (this.options.showRestoreButton) {
                $('.chart-restore-button', this.element).show();
            }
        },

        showOptionDialog: function () {
            // Check whether there is an html element for the chart options dialog.
            // If there is no such div for dialog, create one with id of "chart-user-options-dialog".
            // If there is, just use that one.
            if (!$("#chart-user-options-dialog").length) {
                // Anyway jquery will move this div into the body so we just create it in the body.
                $("<div></div>").attr('id', 'chart-user-options-dialog').appendTo('body');
            }
            // Attach the options dialog controller to the dialog div.
            $("#chart-user-options-dialog").sentrana_chart_user_options_dialog({
                reportChartController: this,
                model: this.chartData,
                templateFile: this.options.basePath + this.options.optionsDialogTemplate,
                chartConfiguration: this.options,
                modal: this.options.optionsDialogModal,
                resizable: this.options.optionsDialogResizable
            });
        },

        chartTypeChangeHandler: function () {
            this.chartData.chartTextOptions.chartXAxisLabel = this.chartAdapter.getXAxisLabel();
            this.chartData.chartTextOptions.chartYAxisLabel = this.chartAdapter.getYAxisLabel();

            this.chartData.attr("needRedraw", false);
            if (this.chartAdapter.chartType === Sentrana.CHART_TYPE_SCATTER || this.chartAdapter.chartType === Sentrana.CHART_TYPE_BUBBLE) {
                if (this.chartData.startPos === 0 && this.chartData.endPos === 9) {
                    // For scatter and bubble chart, we want the default row range to be 1 - 50.
                    this.chartData.attr("endPos", this.getData().rows.length > 50 ? 50 - 1 : this.getData().rows.length - 1);
                    this.updateView(false, true);
                }
            }
            this.chartData.attr("needRedraw", true);
        },

        ".btn-chart-option click": function (el, ev) {
            this.showOptionDialog();
        },

        ".btn-chart-restore click": function () {
            // Restore the original state of the chart
            this.getChartOptions().setChart(0);
            $('.chart-restore-button', this.element).hide();
        },

        // Function to respond the chart type change.
        "input[event='chart-type-button'] change": function (el, ev) {

            var buttonID = el.attr("id");
            // Use the name convention to get the chart type.
            // The chartType change in chartData will trigger the chartType change in chartAdapter.
            this.chartData.attr("chartType", buttonID.substr(0, buttonID.indexOf('-chart')).replace('-', ' '));
        },

        ".label-chart-row-range keypress": function (el, ev) {
            if (ev.keyCode === 13) {
                this.handleRowRangeChangeEvent(el, ev);
            }
        },

        // Monitor slider input update
        ".label-chart-row-range change": function (el, ev) {
            this.handleRowRangeChangeEvent(el, ev);
        },

        handleRowRangeChangeEvent: function (el, ev) {
            var startPos, endPos;
            var separateChar;
            // Start to parse the input
            var $lableChartRowRange = $(".label-chart-row-range", this.element);
            var input = $lableChartRowRange.val();
            var alertMsg = "Please enter valid row range such as '1 - 10' or '1, 10'";
            if (input.indexOf("-") > 0) {
                separateChar = "-";
            } else if (input.indexOf(",") > 0) {
                separateChar = ",";
            } else {
                alert(alertMsg);
                $lableChartRowRange.val($lableChartRowRange.slider("values", 0) + " - " + $lableChartRowRange.slider("values", 1));
                return;
            }
            startPos = Number($.trim(input.split(separateChar)[0]));
            endPos = Number($.trim(input.split(separateChar)[1]));
            // Validate the input
            if (startPos === 0 || endPos === 0 || isNaN(startPos) || isNaN(endPos)) {
                alert(alertMsg);
                $lableChartRowRange.val($lableChartRowRange.slider("values", 0) + " - " + $lableChartRowRange.slider("values", 1));
                return;
            }
            // Update chartData based on input values
            $lableChartRowRange.val(startPos + " - " + endPos);
            this.chartData.attr("startPos", startPos - 1);
            // Force redraw of chart
            this.chartData.attr("needRedraw", true);
            this.chartData.attr("endPos", endPos - 1);

            if (ev.preventDefault) {
                ev.preventDefault();
            } else {
                ev.returnValue = false;
            }

            if (ev.stopPropagation) {
                ev.stopPropagation();
            }
        },

        "{chartData} change": function (chartOptions, ev, attr, how, newVal, oldVal) {
            this.element.trigger("chart_updated");
            // First check whether we need to update the chart.

            if (this.chartData.needRedraw) {

                switch (attr) {
                    case "chartTextOptions":
                        this.updateView(false);
                        break;
                    case "chartType":
                        this.chartAdapter.chartType = newVal;
                        this.chartTypeChangeHandler();
                        this.updateView(false);
                        break;
                    case "chartCollapseItemName":
                        this.updateView(false, true);
                        break;
                    case "chartCollapseRowLimit":
                        // update collapse row limit to value from chart options
                        this.chartData.attr("endPos", this.chartData.startPos + Number(newVal) - 1);
                        break;
                    case "chartLegendAttrColumnName":
                        this.updateView(false);
                        break;
                    case "chartCollapseTail":
                        this.updateView(false);
                        break;
                    case "chartAutoSegmentation":
                        this.updateView(false);
                        break;
                    case "chartSegAttrColumnName":
                        this.updateView(false);
                        break;
                    case "chartSegMetricColumnName":
                        this.updateView(false);
                        break;
                    case "startPos":
                        this.showRestoreButton();
                        // Only when we update the start position, we will need to update the view.
                        this.updateView(false, true);
                        break;
                    case "endPos":
                        this.showRestoreButton();
                        // Only when we update the start position, we will need to update the view.
                        this.updateView(false, true);
                        break;
                    case "binCount":
                        this.updateView(false);
                        break;
                    default:
                        this.updateView(false);
                        break;
                }
            }

        },

        // Synthetic Event: What to do when the model changes...
        "{model} change": function (model, ev, attr, how, newVal, oldVal) {
            // Are we being notified of a successful execution?
            if (attr === "executionStatus" && newVal === "SUCCESS") {

                //reset statid data if any
                this.options.reportData = undefined;

                // Update chartAdapter based on new data set.
                this.chartAdapter = new Sentrana.ChartDataAdapter(this.options.model.getData());
                // Set the chart type, using the original value before model is updated.
                // Or if the chartType has not been inited, use defaultChartType that can be retrived from chartAdapter.
                this.chartAdapter.chartType = this.options.chart.chartType || this.chartAdapter.defaultChartType();
                // this.chartAdapter.chartType = this.chartData.chartType !== null ? this.chartData.chartType : this.chartAdapter.defaultChartType();

                // Check if there is at least one metric and one attribute defined in the data
                if (!this.isMissingElement()) {
                    // If the chartData object is passed in by saved report, we don't need to initialize it.
                    if (!this.chartData.fromDB) {
                        // Force no redraw after the initialization of chartData object.
                        this.chartData.attr("needRedraw", false);
                        // Update the chartData model. We don't need this to happen if there is no need to refresh the whole chart.
                        this.initChartData();
                        // Switch it back.
                        this.chartData.attr("needRedraw", true);
                    } else {
                        // Need to set this value to true so that on the edit page, the chart option dialog will still work.
                        this.chartData.attr("needRedraw", true);
                    }
                }
                this.updateView(true, true);
            }
            if (attr === "showChart" && newVal === true) {
                // redraw the chart in order to make the size correct.
                this.updateView(false, false);
            }
            if (attr === "localDataChangeStatus" && newVal === "SUCCESS") {
                // Update chartAdapter based on new data set.
                this.chartAdapter = new Sentrana.ChartDataAdapter(this.options.model.getData());
                this.chartAdapter.chartType = this.chartData.chartType || this.chartAdapter.defaultChartType();
                // redraw the chart in order to reflect the local data change such as sorting grid.
                this.updateView(true, true);
            }
            if (attr === "colPosChanged") {
                this.updateView(true, true);
            }
        }
    });

    // Controller for the user chart options dialog.
    // It is responsible for handling the confirmation of the update of chart options.
    $.Controller("Sentrana.Controllers.ChartUserOptionsDialog", {
        defaults: {
            model: null,
            templateFile: null,
            chartConfiguration: null,
            modal: false,
            resizable: true
        }
    }, {
        // initialize widget
        init: function (el, options) {
            // Init the chart option dialog html component.
            this.updateView();
        },
        update: function (options) {
            // make sure you call super
            this._super(options);

            this.updateView();
        },
        updateView: function () {
            var that = this;
            // Init the chart option dialog html component.
            this.chartUserOptionsDialog = this.element.html(this.options.templateFile, { model: this.options.model, chartConfiguration: this.options.chartConfiguration }).dialog({
                autoOpen: false,
                modal: this.options.modal,
                resizable: this.options.resizable,
                title: 'Chart Options',
                width: this.options.chartConfiguration.optionDialogWidth,
                buttons: [
					{
					    text: "OK",
					    disabled: false,
					    click: function () {
					        var chartTextOptions = {
					            chartTitle: $(".input-chart-option-dial-title", that.element).val(),
					            chartSubtitle: $(".input-chart-option-dial-subtitle", that.element).val(),
					            chartXAxisLabel: $(".input-x-axis-label", that.element).val(),
					            chartYAxisLabel: $(".input-y-axis-label", that.element).val(),
					            // Do format the value back to Number!!! Otherwise it will cause a lot of problems.
					            chartXLabelRotation: Number($(".select-x-axis-label-rotation", that.element).val() || that.options.model.attr("chartTextOptions").chartXLabelRotation)
					        };
					        that.options.model.attr("chartTextOptions", chartTextOptions);

					        that.options.model.attr("chartCollapseItemName", $(".input-chart-collapse-item-name", that.element).val());

					        if ($(".input-chart-collapse-row-limit", that.element).length > 0) {
					            that.options.model.attr("chartCollapseRowLimit", Number($(".input-chart-collapse-row-limit", that.element).val()));
					        }

					        that.options.model.attr("chartLegendAttrColumnName", $(".select-legend-attribute", that.element).val());
					        that.options.model.attr("chartCollapseTail", $(".input-collapse-tail", that.element).attr('checked') ? true : false);
					        that.options.model.attr("chartAutoSegmentation", $(".input-auto-seg", that.element).attr('checked') ? true : false);
					        that.options.model.attr("chartSegAttrColumnName", $(".select-attr-to-segment", that.element).val());
					        that.options.model.attr("chartSegMetricColumnName", $(".select-metric-to-segment", that.element).val());
					        // We need to validate the existance of the bin-count select control, otherwise we could update the default value with invalid data.
					        if ($(".select-bin-count", that.element).length !== 0) {
					            that.options.model.attr("binCount", Number($(".select-bin-count", that.element).val()));
					        }
					        // Trigger ok event
					        that.options.reportChartController.element.trigger("chart_option_dialog_ok");

					        // Close dialog
					        $(this).dialog('close');
					    }
					},
					{
					    text: "CANCEL",
					    disabled: false,
					    click: function () {
					        // Close dialog
					        $(this).dialog('close');
					    }
					}
				]
            });
            // Update UI based on values we have for these options.
            this.toggleAttrColumnSeg($(".input-auto-seg", this.element));
            this.chartUserOptionsDialog.dialog('open');
            // Initialize tooltips for elements in the dialog.
            this.initTips();
        },

        // toggle the display of the attribute that will be used for segmentation.
        ".input-auto-seg change": function (el, ev) {
            this.toggleAttrColumnSeg(el, true);
        },

        toggleAttrColumnSeg: function (el, fade) {
            var $trAttrToSegment = $(".tr-attr-to-segment", this.element);
            var $trMetricToSegment = $(".tr-metric-to-segment", this.element);
            var $trCollapseTail = $(".tr-collapse-tail", this.element);
            if (el.attr('checked') === 'checked') {
                if (fade) {
                    $trAttrToSegment.fadeIn();
                    $trMetricToSegment.fadeIn();
                    $trCollapseTail.fadeOut();
                } else {
                    $trAttrToSegment.show();
                    $trMetricToSegment.show();
                    $trCollapseTail.hide();
                }
            } else {
                if (fade) {
                    $trAttrToSegment.fadeOut();
                    $trMetricToSegment.fadeOut();
                    $trCollapseTail.fadeIn();
                } else {
                    $trAttrToSegment.hide();
                    $trMetricToSegment.hide();
                    $trCollapseTail.show();
                }
            }
        },

        initTips: function () {
            if ($.fn.qtip) {
                $('.lbl-chart-title', this.element).qtip({ content: "You can change the title of the chart by changing the option value here." });
                $('.lbl-chart-subtitle', this.element).qtip({ content: "You can change the subtitle of the chart by changing the option value here." });
                $('.lbl-x-axis-label', this.element).qtip({ content: "You can change the X-Axis label of the chart by changing the option value here." });
                $('.lbl-y-axis-label', this.element).qtip({ content: "You can change the Y-Axis label of the chart by changing the option value here." });
                $('.lbl-x-axis-label-rotation', this.element).qtip({ content: "You can change the X-Axis label rotation of the chart by changing the option value here." });
                $('.lbl-chart-collapse-item-name', this.element).qtip({ content: "You can change collapsed item category name on the chart by changing the option value here." });
                $('.lbl-chart-collapse-row-limit', this.element).qtip({ content: "You can change the row limit before we collapse row records by changing the option value here." });
                $('.lbl-collapse-tail', this.element).qtip({ content: "By default this option is checked. All the rows after Chart Collapse Row Limit will be collapsed into one record. The category name for this one record will be named using value in option Chart Collapse Item Name.<br/>If Auto Segmentation is selected, this option will be invalid as collapsing and segmentation are not compatible." });
                $('.lbl-auto-segmentation', this.element).qtip({ content: "This option will be valid when you are creating a report containing one metric and more than one attribute. If this option is checked, the application will automatically create a segmented chart based on the report you have defined. The basic idea is pivoting on one of the attribute columns. For each of the distinct values under that attribute, a pivoted series will be created." });
                $('.lbl-attribute-to-segment', this.element).qtip({ content: "When Auto Segmentation option is selected, this drop down list will show up. You can change the attribute column to segment your chart." });
                $('.lbl-bin-count', this.element).qtip({ content: "You can change the approximate number of histogram bins here." });

            }
        }
    });
})();
