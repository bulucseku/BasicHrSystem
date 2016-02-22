steal("lib/sentrana/DialogControl/SentranaDialog.js","lib/sentrana/DialogControl/ConfirmDialog.js", function() {
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
    can.Observe.extend("Sentrana.Models.ChartData", {}, {
        init: function () {
            /* Define the skeleton data structure for our report options. */
            this.setup({
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
                chartCollapseRowLimit: 12,
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
    can.Control.extend("Sentrana.Controllers.ReportChart", {
        pluginName: 'sentrana_report_chart',
        reportChartID: 0,
        defaults: {
            basePath: "lib/sentrana/ReportChartCanJS/",
            chartOptionsTemplate: "templates/rc_chartOptions.ejs",
            optionsDialogTemplate: "templates/rc_optionsDialog.ejs",
            btnRestoreChartTemplate: "templates/rc_btnRestoreChart.ejs",
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
            allowTypeSelectionOnFailure: false,
            showOptionsButton: true,
            showRestoreButton: false,
            optionDialogWidth: 400,
            rowRange: true,
            allowClickEvent: true,
            changeChartType: true,
            allowDrill: true,
            optionsDialogModal: false,
            optionsDialogResizable: true,
            invisibleSeries: [],
            preserveOptions: true, // For report builder page, this will be the default value true. But for saved report page, this will be false as we don't want to shared any information across different charts in different reports.
            disableOtherDrilldown: false,
            showShortCategoryTitle: false,
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

            if (this.options.chart.chartType === Sentrana.CHART_TYPE_MAP) {
                var that = this;
                var mapKey = this.options.chart.mapKey;
                $.getScript('https://code.highcharts.com/mapdata/' + mapKey + '.js', function () {
                    var mapData = Highcharts.maps[mapKey];
                    that.options.chart.mapData = mapData;
                    that.staticUpdate(options);
                });
            }
            else {
                // If we directly pass in reportData object, we will render the chart immediately.
                // Otherwise we will wait for the model change and then start to render the chart.
                if (options.reportData) {
                    this.staticUpdate(options);
                }
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
            if (options.preserveOptions) {
                this.options.preserveOptions = options.preserveOptions;
            }

            this.chartAdapter = new Sentrana.ChartDataAdapter(options.reportData);
            this.chartAdapter.chartType = options.chart.chartType || this.chartAdapter.defaultChartType();
            if (options.chartTextOptions) {
                this.options.chartTextOptions = options.chartTextOptions;
            }

            if (options.chartSegAttrColumnName) {
                this.options.chartSegAttrColumnName = options.chartSegAttrColumnName;
            }

            if (options.chartSegMetricColumnName) {
                this.options.chartSegMetricColumnName = options.chartSegMetricColumnName;
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

        reFlowChartView: function(){
            if(this.options.chart && this.options.chart.renderTo){
                if($(this.options.chart.renderTo).highcharts()){
                    $(this.options.chart.renderTo).highcharts().reflow();
                }
            }
        },

        reSizeChartView: function(width, height){
            if(this.chart){
                $(".report-chart-cntr", this.element).css('height', 'auto');
                this.chart.setSize(width, height);
            }
        },

        isSeriesMadeVisible: function (item) {
            var series = $.grep(this.chart.series, function (e) { return e.visible && e.name === item; });
            return series.length > 0;
        },

        hasData: function() {
            var data = this.getData();
            if (!data || !data.rows) {
                return false;
            }
            return true;
        },

        updateInvalidData: function () {
            var data = this.getData();
            //// If it contains "<" or ">" character then replace those with "&lt;" and "&gt;" respectively
            $.each(data.rows, function (rowIndex, rowValue) {
                if (rowValue.cells) {
                    $.each(rowValue.cells, function (cellIndex, cellValue) {
                        if (cellValue.fmtValue) {
                            cellValue.fmtValue = cellValue.fmtValue.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        }
                    });
                }
            });
        },

        hasValidData: function () {
            if (this.isMissingElement()) {
                this.chart = null;
                // No need to proceed, just showing the warning message.
                this.showChartWarning("Select at least one metric and one attribute from Columns to create a chart");
                if (this.element) {
                    this.element.trigger("chart_failed");
                }
                return false;
            }
            else if (!this.isSavedChartTypeSupported(this.chartAdapter.chartType)) {
                this.chart = null;
                var warningMessage = "Failed to generate chart. Chart type is not compatible.";
                if (this.options.allowTypeSelectionOnFailure) {
                this.renderCharttypeButtons(refreshChartOptions);
                if (refreshSlider && this.options.rowRange) {
                    this.selectAndRefreshSlider(refreshSlider);
                }
                    warningMessage = "Select a chart type that is compatible with the new report definition. Current chart type is " + this.chartAdapter.chartType;
                } else {
                    this.element.trigger("chart_failed");
                }

                this.showChartWarning(warningMessage, true);
                return false;
            }

            return true;
        },

        // Instance method: How we render the view...
        updateView: function RC_updateView(refreshChartOptions, refreshSlider) {
            var that = this;
            if (this.chart) {
                if (this.options.preserveOptions) {
                    //preserving the visibility status of chart series.
                    var invisibleSeries = [];
                    if (this.chart.series) {
                        //adding already invisible series from "this.options.invisibleSeries" to "invisibleSeries" array if not made visible
                        for (var i = 0; i < this.options.invisibleSeries.length; i++) {
                            if (!this.isSeriesMadeVisible(this.options.invisibleSeries[i])) {
                                invisibleSeries.push(this.options.invisibleSeries[i]);
                            }
                        }

                        //adding new invisible series to "invisibleSeries" array
                        var series = $.grep(this.chart.series, function(e) { return e.visible === false; });
                        $.each(series, function(index, item) {
                            invisibleSeries.push(item.name);
                        });

                        //adding "invisibleSeries" array to this.options.invisibleSeries
                        this.options.invisibleSeries = invisibleSeries;
                    }
                }
                // Destroy the existing chart to save some system resource used.
                this.chart.destroy();
            }

            if (!this.options.preserveOptions) {
                this.options.invisibleSeries = [];
            }
            
            if (!this.hasData()) {
                return;
            }

            this.updateInvalidData();
            this.hasRangeSlider = false;

            if (!this.hasValidData()) {
                return;
            }
            else {
                // Show chart and option div.
                $(this.options.chart.renderTo, this.element).show();
                $(".chart-option", this.element).show();
                $(".chart-row-range", this.element).show();
            }

            // hide the chart warning div if necessary
            if ($(".report-chart-warning", this.element).length) {
                $(".report-chart-warning", this.element).hide();
            }

            // Create the Highcharts object and the options toolbar above the chart.

            // Create chart options that will be used to create highchart.
            this.chartOptions = this.chartAdapter.populateChartOptions(this);
            this.chartOptions.chart.events = {
                click: function (el, ev) {
                    if (that.element) {
                        can.trigger(that.element, "chart_clicked", [el, ev]);
                    }
                }
            };

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

            // Create Highcharts component.
            try {
                if (this.chartOptions.chart.type==='map') {
                    this.chart = new Highcharts.Map(this.chartOptions);
                } else {
                this.chart = new Highcharts.Chart(this.chartOptions);
            }
            }
            catch (err) {
                // Something is wrong when populating the chart. Show error message instead.
                this.chart = null;
                var showChartRestoreLink = that.allowRestoreChart(err),
                    errMessage = this.getUpdatedErrorMessage(err);

                this.showChartWarning(errMessage, false, showChartRestoreLink);

                if (this.element) {
                    this.element.trigger("chart_failed");
                }
                return;
            }
            
            $.each(this.chart.series, function (index, item) {
                //set format-string to series
                if (that.chartOptions.formatString) {
                    item.formatString = that.chartOptions.formatString[item.name];
                }
                //update the visibility status of chart series.
                if (jQuery.inArray(item.name, that.options.invisibleSeries) !== -1) {
                    item.hide();
                }

            });

            this.renderCharttypeButtons(refreshChartOptions);

            if (!(this.options.showOptions && this.options.rowRange)) {
                $(".chart-row-range", this.element).hide();
            }

            this.selectAndRefreshSlider(refreshSlider);

            this.fixHeight();
            // Initialize the tool tips.
            this.initTips();

            this.resizeRangeSlider();

            // Rebind the chart
            if (this.element) {
                this.element.trigger("chart_rebind");
            }
        },

        allowRestoreChart: function (errMessage) {
            return errMessage.indexOf("Highcharts error #19") > -1;
        },

        getUpdatedErrorMessage: function (errMessage) {
            var commonMessage = "Chart generation error. Reduce number of rows, attributes or metrics. ",
                message = commonMessage + errMessage;
            return errMessage.indexOf("Highcharts error #19") > -1 ? commonMessage : message;
        },

        selectAndRefreshSlider: function (refreshSlider) {
            if (refreshSlider && this.options.rowRange) {
                if (this.element.find(".slider-chart-row-range").rangeSlider) {
                    if (this.options.rangeSliderName && this.options.rangeSliderName === 'jQuerySlider') {
                        this.refreshSlider();
                    }
                    else { //jQRangeSlider
                        this.hasRangeSlider = true;
                        this.refreshRangeSlider();
                    }
                } else {
                    this.refreshSlider();
                }
            }
        },

        renderCharttypeButtons: function (refreshChartOptions) {
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
                    arearangeline: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_AREA_RANGE_LINE),
                    errorbar: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_ERROR_BAR),
                    histogram: this.chartAdapter.supportChartType(Sentrana.CHART_TYPE_HISTOGRAM)
                };
                // Render the chart option area
                $(".chart-option", this.element).html(can.view(this.options.basePath + this.options.chartOptionsTemplate, {
                    chartTypeSupported: chartTypeSupported,
                    reportChartID: this.reportChartID
                })).show();
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
                    var $selected = $("#" + this.chartAdapter.chartType.replace(' ', '-') + "-chart-button-" + this.reportChartID);
                    $selected.attr('checked', true);
                    $selected.parent().addClass('active');
                    $(".chart-type", this.element).buttonset();
                } else {
                    $(".chart-type", this.element).hide();
                }
            }
        },

        refreshSlider: function () {
            var that = this;
            var $sliderElement = this.element.find(".slider-chart-row-range");
            $sliderElement.slider({
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

                    if (that.element) {
                        that.element.trigger("chart_row_slider_changed");
                    }
                }
            });

            $(".label-chart-row-range", this.element).val($sliderElement.slider("values", 0) + " - " + $sliderElement.slider("values", 1));
        },

        hideSlider: function() {
            $(".chart-row-range", this.element).hide();
        },

        refreshRangeSlider: function () {
            //If data is less than 2, rangeslider cannot render properly.
            if (this.getData().rows.length < 2) {
                $(".slider-desc", this.element).hide();
                return;
            }

            var that = this;
            var $sliderElement = this.element.find(".slider-chart-row-range");
            var minVal = this.chartData.startPos * 1 + 1,
            maxVal = this.chartData.endPos * 1 + 1;

            $(".label-chart-row-range", this.element).val(minVal + " - " + maxVal);


            $sliderElement.rangeSlider({
                defaultValues: { min: minVal, max: maxVal },
                bounds: { min: 1, max: this.getData().rows.length },
                arrows:false
            });

            $sliderElement.bind("valuesChanged", function (e, data) {
                that.chartData.attr("startPos", data.values.min.toFixed(0) * 1 - 1);
                that.chartData.attr("needRedraw", true);
                that.chartData.attr("endPos", data.values.max.toFixed(0) * 1 - 1);
                if (that.element) {
                    that.element.trigger("chart_row_slider_changed");
                }
            });

            $sliderElement.bind("valuesChanging", function (e, data) {
                $(".label-chart-row-range", that.element).val(data.values.min.toFixed(0) + " - " + data.values.max.toFixed(0));
            });

        },

        resizeRangeSlider: function () {
            if (this.hasRangeSlider) {
                if (this.getData().rows.length < 2) {
                    return;
                }
                var $sliderElement = this.element.find(".slider-chart-row-range");
                if ($sliderElement) {
                    $sliderElement.rangeSlider('resize');
                }
            }
        },

        initTips: function () {
            if ($.fn.qtip) {
                $.fn.qtip.defaults.style.classes = "qtip-green ui-tooltip-shadow";
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
            this.chartData.attr("chartSegAttrColumnName", this.options.chartSegAttrColumnName || this.chartAdapter.getDefaultSegAttrName());
            this.chartData.attr("chartMetricColumnNames", this.chartAdapter.resultDataset.getMetricColumnNames());
            this.chartData.attr("chartSegMetricColumnName", this.options.chartSegMetricColumnName || this.chartAdapter.getDefaultSegMetricName());
        },

        // Get Chart settings object
        getChartData: function () {
            return this.chartData.serialize();
        },

        chart_element_clicked: function () {
            this.element.trigger("chart_element_clicked");
        },

        showSeries: function(columnName) {
            //find the series with the name and show it
            if (this.chart && this.chart.series) {
                var seriesItem = $.grep(this.chart.series, function (e) { return e.name === columnName; });

                if (seriesItem.length === 1) {
                    seriesItem[0].options.showInLegend = true;
                    this.chart.legend.renderItem(seriesItem[0]);
                    this.chart.legend.render();
                    seriesItem[0].show();
                }
            }
        },

        hideSeries: function(columnName) {
            //find the series with the name and hide it
            if (this.chart && this.chart.series) {
                var seriesItem = $.grep(this.chart.series, function (e) { return e.name === columnName; });

                if (seriesItem.length === 1) {
                    seriesItem[0].options.showInLegend = false;
                    seriesItem[0].legendItem = null;
                    this.chart.legend.destroyItem(seriesItem[0]);
                    this.chart.legend.render();
                    seriesItem[0].hide();
                }
            }
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
                case Sentrana.CHART_TYPE_AREA:
                	return new Sentrana.Models.AreaChartOptions(options);
                case Sentrana.CHART_TYPE_STACKED_AREA:
                	return new Sentrana.Models.StackedAreaChartOptions(options);
                case Sentrana.CHART_TYPE_SCATTER:
                    return new Sentrana.Models.ScatterChartOptions(options);
                case Sentrana.CHART_TYPE_BUBBLE:
                    return new Sentrana.Models.BubbleChartOptions(options);
                case Sentrana.CHART_TYPE_HISTOGRAM:
                    return new Sentrana.Models.HistogramChartOptions(options);
                case Sentrana.CHART_TYPE_GAUGE:
                    return new Sentrana.Models.GaugeChartOptions(options);
                case Sentrana.CHART_TYPE_AREA_RANGE_LINE:
                    return new Sentrana.Models.AreaRangeLine(options);
                case Sentrana.CHART_TYPE_ERROR_BAR:
                    return new Sentrana.Models.ErrorBar(options);
                case Sentrana.CHART_TYPE_MAP:
                    return new Sentrana.Models.UsMapChartOptions(options);
                default:
                    return new Sentrana.Models.ChartOptions(options);
            }
            return new Sentrana.Models.ChartOptions(options);
        },

        isMissingElement: function () {
            return this.chartAdapter.metricIndexArray.length === 0 || this.chartAdapter.attributeIndexArray.length === 0;
        },

        isSavedChartTypeSupported: function (chartType) {
            return this.chartAdapter.supportChartType(chartType);
        },

        showChartWarning: function (msg, showOption, showRestoreLink) {
            var $reportChartWarning = this.element.find(".report-chart-warning");
            // The place we should show the message.
            if (!$reportChartWarning.length) {
                $("<div></div>").attr('class', 'report-chart-warning').appendTo(this.element);
                $reportChartWarning = this.element.find(".report-chart-warning");
            }
            $reportChartWarning.html(msg);

            if (showRestoreLink) {
                $reportChartWarning.append(can.view(this.options.basePath + this.options.btnRestoreChartTemplate, {}));
            } else {
                $reportChartWarning.find('.restore-chart').remove();
            }

            $reportChartWarning.show();
            //Empty the chart option area and chart area.
            $(this.options.chart.renderTo, this.element).hide();
            if (!showOption) {
                $(".chart-option", this.element).hide();
            }
        },

        showChartAlert: function (title, message, callBack4Ok, isCloseOnEscape) {

            var htm = "<div id='sentrana_chart_modal_alert'></div>";

            $('body').append(htm);
            $('#sentrana_chart_modal_alert').sentrana_alert_dialog({
                title: title,
                message: message,
                onOk: function(){
                    if (callBack4Ok && typeof callBack4Ok === 'function') {
                        callBack4Ok();
                    }

                    $('body').find('#sentrana_chart_modal_alert').remove();
                },
                closeOnEscape: isCloseOnEscape !== undefined ? isCloseOnEscape : true
            });
        },

        showRestoreButton: function () {
            // Display the restore button
            if (this.options.showRestoreButton) {
                $('.chart-restore-button', this.element).show();
            }
        },

        showOptionDialog: function () {
            // Check whether there is an html element for the chart options dialog.
            // If there is no such div for dislog, create one with id of "chart-user-options-dialog".
            // If there is, just use that one.
            if (!$("#chart-user-options-dialog").length) {
                // Anyway jquery will move this div into the body so we just create it in the body.
                $("<div></div>").attr('id', 'chart-user-options-dialog').appendTo('body');
            }

            $("#chart-user-options-dialog").html(can.view(this.options.basePath + this.options.optionsDialogTemplate,{
                model: this.chartData,
                chartConfiguration: this.options,
                reportChartController: this
            }));

            // Attach the options dialog controller to the dialog div.
            $("#chart-user-options-dialog").sentrana_chart_user_options_dialog({
                reportChartController: this,
                model: this.chartData,
                chartConfiguration: this.options,
                autoOpen: true,
                onCancel: function(){
                    $('body').find('#chart-user-options-dialog').remove();
                },
                onOk: function(){
                    $('body').find('#chart-user-options-dialog').remove();
                }
            });
        },

        chartTypeChangeHandler: function () {
            this.chartData.attr("needRedraw", false);
            if (this.chartAdapter.chartType === Sentrana.CHART_TYPE_SCATTER || this.chartAdapter.chartType === Sentrana.CHART_TYPE_BUBBLE) {
                if (this.chartData.startPos === 0 && this.chartData.endPos === this.chartData.chartCollapseRowLimit - 1) {
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

        ".restore-chart click": function () {
            this.resetNumberOfRows();
        },

        resetNumberOfRows: function() {
            var endPos = this.chartData.chartCollapseRowLimit - 1 < (this.getData().rows.length - 1) ? this.chartData.chartCollapseRowLimit - 1 : (this.getData().rows.length - 1);
            this.chartData.attr("needRedraw", false);
            this.chartData.attr("startPos", 0);
            this.chartData.attr("endPos", endPos);
            this.chartData.attr("needRedraw", true);

            if (this.hasRangeSlider) {
                this.element.find(".slider-chart-row-range").rangeSlider("values", 1, 12);
            }
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
                ev.preventDefault();
            }
        },

        // Monitor slider input update
        ".label-chart-row-range change": function (el, ev) {
            this.handleRowRangeChangeEvent(el, ev);
        },

        handleRowRangeChangeEvent: function (el, ev) {
            var startPos, endPos;
            var separateChar;
            var sliderValues;
            // Start to parse the input
            var $lableChartRowRange = this.element.find(".label-chart-row-range");
            var $sliderElement = this.element.find(".slider-chart-row-range");
            if (this.hasRangeSlider) {
                sliderValues = $sliderElement.rangeSlider("values");
            }
            var input = $lableChartRowRange.val();
            var alertMsg = "Please enter valid row range such as '1 - 10' or '1, 10'";
            if (input.indexOf("-") > 0) {
                separateChar = "-";
            } else if (input.indexOf(",") > 0) {
                separateChar = ",";
            } else {
                this.showChartAlert('Error!', alertMsg, function () { $lableChartRowRange.focus(); });
                $lableChartRowRange.val($sliderElement.slider("values", 0) + " - " + $sliderElement.slider("values", 1));
                return;
            }
            startPos = Number($.trim(input.split(separateChar)[0]));
            endPos = Number($.trim(input.split(separateChar)[1]));
            // Validate the input
            if (startPos === 0 || endPos === 0 || isNaN(startPos) || isNaN(endPos)) {
                this.showChartAlert('Error!', alertMsg, function () { $lableChartRowRange.focus(); });
                if (this.hasRangeSlider) {
                    $lableChartRowRange.val(sliderValues.min.toFixed(0) + " - " + sliderValues.max.toFixed(0));
                } else {
                    $lableChartRowRange.val($sliderElement.slider("values", 0) + " - " + $sliderElement.slider("values", 1));
                }
                return;
            }
            // Update chartData based on input values
            $lableChartRowRange.val(startPos + " - " + endPos);
            if (this.hasRangeSlider) {
                $sliderElement.rangeSlider("values", startPos, endPos);
            } else {
                this.chartData.attr("startPos", startPos - 1);
                // Force redraw of chart
                this.chartData.attr("needRedraw", true);
                this.chartData.attr("endPos", endPos - 1);
            }

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
            if (!this.chartAdapter) {
                return;
            }

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
            var data;
            // Are we being notified of a successful execution?
            if (attr === "executionStatus" && newVal === "SUCCESS") {

                //reset static data if any
//                this.options.reportData = model.data;

                // Update chartAdapter based on new data set.
                this.chartAdapter = new Sentrana.ChartDataAdapter(this.getData());
                this.chartOptions = this.chartAdapter.populateChartOptions(this);
                // Set the chart type, using the original value before model is updated.
                // Or if the chartType has not been inited, use defaultChartType that can be retrived from chartAdapter.
                this.chartAdapter.chartType = this.options.model.chartType || this.options.chart.chartType || this.chartAdapter.defaultChartType();
                this.options.model.chartType = undefined;
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

                if (!this.options.stopInitialRendering) {
                    this.updateView(true, true);
               }

            } else if (attr === "showChart" && newVal === true) {
                // redraw the chart in order to make the size correct.
                this.updateView(false, false);
            } else if (attr === "localDataChangeStatus" && newVal === "SUCCESS") {
                data = [];

                if (this.options.model.staticData) {
                    data = this.options.model.staticData;
                } else {
                    data = this.options.model.getData();
                }

                // Update chartAdapter based on new data set.
                this.chartAdapter = new Sentrana.ChartDataAdapter(data);
                this.chartAdapter.chartType = this.chartData.chartType || this.chartAdapter.defaultChartType();
                // redraw the chart in order to reflect the local data change such as sorting grid.
                this.updateView(true, true);
            } else if (attr === "colPosChanged") {
                data = this.options.model.getData();
                // Update chartAdapter based on new data set.
                this.chartAdapter = new Sentrana.ChartDataAdapter(data);
                this.chartAdapter.chartType = this.chartData.chartType || this.chartAdapter.defaultChartType();
                // redraw the chart in order to reflect the column order change.
                this.updateView(true, true);
            } else if (attr === "drillOptionsStatus" && newVal === "SUCCESS") {
                this.options.reportData = undefined;
            }
        }
    });
});
