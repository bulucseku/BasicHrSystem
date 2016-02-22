/**
 * @class DualTableChart
 * @module Sentrana
 * @namespace Sentrana.Controllers
 * @extends jQuery.Controller
 * @description DualTableChart is a jQueryMX Controller that presents a tabular grid with line chart for a report structured as a DatasetResult JSON object.
 */
can.Control.extend("Sentrana.Controllers.DualTableChart", {
    pluginName: 'sentrana_dual_table_chart',
    defaults: {
        basePath: "lib/sentrana/DualTableChart",  /* This is the relative path from the document root to the resources for this control. */
        templatesPath: "templates",      /* This is the relative path from the basePath to the templates folder. */
        tmplInit: "dualTableChart.ejs",  /* This is the template file that initializes a table before converting to a DataTables. */
        model: null, 			    	 /* This is expected to be a Sentrana.Models.ExecutionMonitor instance. */
        reportData: null        	     /* This is a pure JSON object (not an instance of a custom class) that contains a serialized from of a DatasetResult. */
    }
},
{
    init: function DT_init() {

        // Initialize property
        this.app = this.options.app;
        this.data = null;
        this.reportElementId = -1;
        this.chartColumnIndex = -1;
        this.chartType = 'line'; // Default chart type is line
        this.CHART_DATA_TYPE = 5;
        this.showRowRangeOption = false;
        this.bigChartData = null;

        // Using for maximized view size
        this.isActiveMaximizeView = false;
        this.MAX_VIEW_DIALOG_MIN_HEIGHT = 600;
        this.MAX_CHART_VIEW_GRID_HEIGHT = 300;
        this.MAX_VIEW_DIALOG_PADDING = 40;
        this.IPAD_PORTRAIT_MAX_VIEW_DIALOG_DIMENSION = { width: 700, height: 750 }; // value is based on iPad portrait view
        this.IPAD_LANDSCAP_MAX_VIEW_DIALOG_DIMENSION = { width: 900, height: 600 }; // value is based on iPad Landscap view
        this.maximizedDialogContainer = '';

        // Define our jQuery objects...
        this.dualTableCntr = $(".dual-table-chart-cntr", this.element);

        // Update our view...
        this.updateView();

        ////if dualtableSPLine has local filters: local filter either inside the report element or if there is layout that layout contains two layout ; one for parameter and one for dualtable.
        ////then also hasParameter = true;
        //var hasParameter = $('.sentrana_parameter_collapsible_container', this.element.parent().closest('.layout-container'));
        //if (hasParameter && hasParameter.length > 0) {
        //    this.element.parent().closest('.collapsibleContainer').css('border', 'none').css('box-shadow', 'none');

        //    //if chart has local filter then there will be no layout border. Removing layout border creates extra space between local filter layout and table.So remove extra 10 pixel padding
        //    this.element.find('.dualTableChartContainer').addClass('dualTableChartContainerNoPadding');
        //} else {
        //    this.element.find('.dualTableChartContainer').removeClass('dualTableChartContainerNoPadding');
        //}

    },

    // Instance method: How we render the view...
    updateView: function RG_updateView() {
        // Get our dataset...
        this.data = this.options.reportData || this.options.model && this.options.model.getData();

        // Is it missing or empty?
        if (!this.data || !this.data.rows || !this.data.rows.length) {
            return;
        }

        // Set report element id
        this.reportElementId = this.options.reportElementId;

        // Table headers
        var headerTitles = this.getTableHeaderTitles(this.data);

        // Chart column index
        if (this.data.colInfos) {
            for (var j = 0; j < this.data.colInfos.length; j++) {
                if (this.data.colInfos[j].dataType === this.CHART_DATA_TYPE) {
                    this.chartColumnIndex = j;
                    break;
                }
            }
        }

        // Populating the dual table
        this.$dualTable = this.dualTableCntr.html(this.getTemplatePath(this.options.tmplInit), { headerTitles: headerTitles, chartIndex: this.chartColumnIndex, reportElementId: this.reportElementId, data: this.data, rowCount: this.data.rows.length, colCount: this.data.colInfos.length });

        // Populating mini chart for each row
        if (this.chartColumnIndex > 0) {
            for (var i = 0; i < this.data.rows.length; i++) {
                var chartCellId = this.reportElementId + '_chart_' + i + '_' + this.chartColumnIndex;

                var miniChartData = this.data.rows[i].cells[this.chartColumnIndex].rawValue;
                this.drawMiniChart(chartCellId, miniChartData);
            }
        }

        // By default draw the big chart for 1st row
        var reportData = this.data.rows[0].cells[this.chartColumnIndex].rawValue;
        this.drawBigChart(reportData);

    },

    getTableHeaderTitles: function (data) {
        var headerTitles = [];
        for (var i = 0; i < data.colInfos.length; i++) {
            if (data.colInfos[i].display) {
                var title = data.colInfos[i].title;
                headerTitles.push(title);
            }
        }

        return headerTitles;
    },

    ".kpi-name click": function (el, ev) {

        var rowIndex = parseInt(el.attr('row'), 10);
        var colIndex = this.chartColumnIndex;
        var reportData = null;
        var isBreak = false;

        if (this.chartColumnIndex === -1) {
            return;
        }

        if (this.data && this.data.rows) {
            for (var i = 0; i < this.data.rows.length; i++) {

                var row = this.data.rows[i];
                for (var j = 0; j < row.cells.length; j++) {

                    var cell = row.cells[j];
                    if (i === rowIndex && j === colIndex) {
                        reportData = this.data.rows[i].cells[j].rawValue;
                        isBreak = true;
                        break;
                    }
                }

                if (isBreak) {
                    break;
                }
            }
        }

        // Call reportChart to draw the large chart view
        if (reportData) {
            this.drawBigChart(reportData);
        }
    },

    drawBigChart: function (reportData) {

        var that = this;
        this.bigChartData = reportData;
        var containerDiv = $('.kpi_zoom_graph', this.element);

        if (reportData === null) {
            return;
        }

        if (reportData.rows.length === 0) {
            $(containerDiv).html(can.view('templates/dataNotFound.ejs', { message: 'Chart data not found.' }));
            return;
        }

        /*if (!$(containerDiv).control()) {
        $(containerDiv).html(can.view('templates/chartContainer.ejs', {}));
        }*/

        // Populating the chart container
        if ($(containerDiv).control()) {
            $(containerDiv).control().destroy();
            $(containerDiv).html(can.view('templates/chartContainer.ejs', {}));
        }
        else {
            $(containerDiv).html(can.view('templates/chartContainer.ejs', {}));
        }

        // Call chart report controller
        this.reportChartController = $(containerDiv).sentrana_report_chart({
            chartData: new Sentrana.Models.ChartData(),
            reportData: reportData,
            chart: {
                renderTo: ".report-chart-cntr",
                chartType: this.chartType
            },
            chartExport: {
                exporting: {
                    enabled: false
                },
                print: {
                    enabled: false
                }
            },

            showOptions: true,
            showOptionsButton: false,
            showRestoreButton: false,
            rowRange: true,
            changeChartType: false,
            allowDrill: false,
            optionsDialogModal: true,
            optionsDialogResizable: false
        }).control();

        // Forcely hide the rowRange firstTime
        if (!this.showRowRangeOption) {
            $('.chart-row-range', this.element).hide();
        }

        // Adding chart option, print and export buttons
        var buttonContainer = $('.buttonBar', $(containerDiv));
        this.addButtonToBar(buttonContainer, { "cls": "fa-gear", "eventType": "show_chart_option", "toolTip": 'Show chart options', "eventArgs": this.reportChartController });
        //this.addButtonToBar(buttonContainer, { "cls": "print-icon", "eventType": "print_chart", "toolTip": "Print chart", "eventArgs": this.reportChartController });
        this.addButtonToBar(buttonContainer, { "cls": "fa-cloud-download", "eventType": "export_chart", "toolTip": "Export chart", "eventArgs": this.reportChartController,
            "cacheid": reportData.cacheid,
            "dropdown": true,
            "menuItems":
                    [{ id: "png", name: "Download PNG image" },
                    { id: "jpeg", name: "Download JPEG image" },
                    { id: "pdf", name: "Download PDF document" },
                    { id: "csv", name: "Download CSV document"}]
        });
        this.addButtonToBar(buttonContainer, { "cls": "fa-arrows-alt", "eventType": "show_maximize_window", "toolTip": 'Maximize Chart', "eventArgs": this.reportChartController });
    },

    drawMiniChart: function (containerId, reportData) {
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: containerId,
                type: this.chartType,
                margin: [3, 0, 0, 0]
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: this.setChartCategory(reportData)
            },
            yAxis: {
                title: {
                    text: ''
                },
                plotLines: [{
                    value: 0,
                    width: 0.2,
                    color: '#808080'
                }]
            },
            legend: {
                enabled: false
            },

            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },
            tooltip: {
                enabled: false
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    shadow: false,
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    marker: {
                        //enabled:false,
                        radius: 1,
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    }
                }
            },
            series: this.setChartSeries(reportData)
        });
    },

    setChartSeries: function (reportData) {
        var metricIndexArray = reportData.dataArray.metricArray;
        var seriesData = [];
        for (var i = 0; i < metricIndexArray.length; i++) {
            seriesData.push(metricIndexArray[i]);
        }

        var series = [{ data: seriesData}];

        return series;
    },

    setChartCategory: function (reportData) {
        var attributeIndexArray = reportData.dataArray.attributeArray;
        var category = [];
        if (attributeIndexArray.length > 0) {
            category = attributeIndexArray[0];
        }

        return category;
    },

    // Instance method: Get the path to a template file...
    getTemplatePath: function RG_getTemplatePath(templateFile) {
        var parts = [];

        // Do we have a basePath?
        if (this.options.basePath) {
            parts.push(this.options.basePath);

            // Did our path NOT end in a slash?
            if (!/\/$/.test(this.options.basePath)) {
                parts.push("/");
            }
        }

        // Do we have a templatesPath?
        if (this.options.templatesPath) {
            parts.push(this.options.templatesPath);

            // Did our path NOT end in a slash?
            if (!/\/$/.test(this.options.templatesPath)) {
                parts.push("/");
            }
        }

        // Add the template file...
        parts.push(templateFile);

        return parts.join("");
    },

    addButtonToBar: function (container, buttonInfo) {
        if (!buttonInfo || !buttonInfo.cls) {
            return;
        }

        if (buttonInfo.dropdown == null) {
            buttonInfo.dropdown = false;
        }

        var buttonSelector = "." + buttonInfo.cls,
            $button = $(buttonSelector, container).closest('.cc-button');

        // Is there already a button in the bar?
        if ($button.length) {
            $button.off("click");
        } else {
            $(container).append(can.view("templates/button.ejs", buttonInfo));
            $button = $(buttonSelector, container).closest('.cc-button');
        }

        // Register a handler for click events...
        var that = this;
        $button.on("click", function (event) {
            if (buttonInfo.dropdown) {
                var $dropDown = $(".menu-container", $button);

                // Update dropdown menu position
                var menuLeft = $button.position().left - $dropDown.width() + 26;
                var menuTop = $button.position().top + 24;

                $dropDown.css({ top: menuTop, left: menuLeft });
                $dropDown.show();

                $(".menu-item", $dropDown).on("click", function (event) {
                    that.performAction(buttonInfo, { type: $(this).attr('elementid') });
                    event.stopPropagation();
                    $dropDown.hide();
                });

                // Hide the menu if the mouse leaves the menu.
                $dropDown.on("mouseleave", function (event) {
                    $dropDown.hide();
                });

                // Hide the menu if the mouse leaves the button.
                $button.on("mouseleave", function (event) {
                    $dropDown.hide();
                });

            } else {
                that.performAction(buttonInfo);
            }
            return false;
        });
    },

    performAction: function (buttonInfo, exportType) {

        switch (buttonInfo.eventType) {
            case 'show_maximize_window':
                this.openMaximizeReportDialog(true);
                break;
            case 'show_chart_option':
                this.openChartOptions(buttonInfo);
                break;
            case 'print_chart':
                this.printChart(buttonInfo);
                break;
            case 'export_chart':
                this.exportChart(buttonInfo, exportType);
                break;

            default:
        }
    },

    openChartOptions: function (buttonInfo) {

        var reportChartController = buttonInfo.eventArgs;
        if (reportChartController) {
            // Show the dialog control
            reportChartController.options.optionsDialogModal = this.isActiveMaximizeView ? false : true; // modal based on maximized window open or not
            reportChartController.showOptionDialog();

            // Hide some unnecessary options from option dialog for dashboard
            $('.lbl-chart-title').parent().closest('tr').hide();
            $('.lbl-chart-subtitle').parent().closest('tr').hide();
            $('.lbl-x-axis-label').parent().closest('tr').hide();
            $('.lbl-y-axis-label').parent().closest('tr').hide();
            $('.lbl-auto-segmentation').parent().closest('tr').hide();
            $('.lbl-chart-collapse-item-name').parent().closest('tr').hide();

            // Add dashboard specific chart dialog options
            var dialogTable = $('.lbl-chart-title').parent().closest('table');
            var lastTr = $("tr:last", dialogTable);
            lastTr.after("templates/additionalChartDialogOptions.ejs", { showRowRange: this.showRowRangeOption, showDrilldown: false });

            // Add tooltip for dashboard specific options
            $(".lbl-chart-rowRange-slider").qtip({ content: "You can show or hide the row range option in the chart." });
            $('.lbl-collapse-tail').qtip({ content: "All the rows after Chart Collapse Row Limit will be collapsed into one record." });
            $(".lbl-chart-drillPath").parent().closest('tr').hide(); // Not applicable for dual chart

            // Disable window scrolling when maximize view is closed
            if (!this.isActiveMaximizeView) {
                this.disableWindowScroll();
            }
        }
    },

    printChart: function (buttonInfo) {
        var reportChartController = buttonInfo.eventArgs;
        if (reportChartController) {
            reportChartController.chart.print();
        }
    },

    exportChart: function (buttonInfo, exportType) {

        var reportChartController = buttonInfo.eventArgs;
        var cacheid = buttonInfo.cacheid;
        var type = exportType.type;
        var exportUrl = this.app.generateUrl("ExportChart", {});

        // Set the chart export url
        reportChartController.chart.options.exporting.url = exportUrl;
        var exportChartWidth = reportChartController.chart.chartWidth;
        var exportFileName = this.app.cleanSpecialChar(reportChartController.chart.title.textStr);
        if (this.isActiveMaximizeView) {
            exportChartWidth = this.MAXIMIZE_CHART_WIDTH;
        }

        if (type === 'pdf') {
            reportChartController.chart.exportChart({ type: "application/pdf", width: exportChartWidth, filename: exportFileName });
        }
        else if (type === 'jpeg') {
            reportChartController.chart.exportChart({ type: "image/jpeg", width: exportChartWidth, filename: exportFileName });
        }
        else if (type === 'png') {
            reportChartController.chart.exportChart({ type: "image/png", width: exportChartWidth, filename: exportFileName });
        }
        else if (type === 'csv') {
            this.app.exportToCSV(cacheid, exportFileName);
        }
        else {
            reportChartController.chart.exportChart({ type: "image/png", width: exportChartWidth, filename: exportFileName });
        }
    },

    " chart_option_dialog_ok": function (el, ev) {
        this.showRowRangeOption = $(".input-chart-rowRange-slider").prop('checked');

        // Show/hide rowRange
        this.showRowRange(this.showRowRangeOption);

        // Enable window scrolling when maximize view is closed
        if (!this.isActiveMaximizeView) {
            this.enableWindowScroll();
        }
        else {
            this.disableWindowScroll();
        }

        // Stop event bubling
        ev.stopPropagation();
    },

    " chart_option_dialog_cancel": function (el, ev) {

        // Enable window scrolling when maximize view is closed
        if (!this.isActiveMaximizeView) {
            this.enableWindowScroll();
        }
        else {
            this.disableWindowScroll();
        }

        // Stop event bubling
        ev.stopPropagation();
    },

    showRowRange: function (show) {
        var rowRangeContainer = ''; //$('.chart-row-range', this.element);

        if (this.isActiveMaximizeView) {
            rowRangeContainer = $('.chart-row-range', this.maximizedDialogContainer);
        }
        else {
            rowRangeContainer = $('.chart-row-range', this.element);
        }

        if (show) {
            rowRangeContainer.show();
        }
        else {
            rowRangeContainer.hide();
        }
    },

    isiPad: function () {
        return window.navigator.userAgent.match(/iPad/i) !== null;
    },

    isPortraitMode: function () {
        return (window.orientation === 0 || window.orientation === 180);
    },

    getMaxViewDialogDimension: function (hasChart) {

        var dimension;
        if (this.isiPad()) {

            if (this.isPortraitMode()) {
                dimension = this.IPAD_PORTRAIT_MAX_VIEW_DIALOG_DIMENSION;
            } else {
                dimension = this.IPAD_LANDSCAP_MAX_VIEW_DIALOG_DIMENSION;
            }
        } else {
            var dialogWidth = $(window).width() - this.MAX_VIEW_DIALOG_PADDING,
            dialogHeight = $(window).height() - this.MAX_VIEW_DIALOG_PADDING;

            // Set Minimum height for viewing chart in max dialog.
            if (hasChart && dialogHeight < this.MAX_VIEW_DIALOG_MIN_HEIGHT) {
                dialogHeight = this.MAX_VIEW_DIALOG_MIN_HEIGHT;
            }
            dimension = { width: dialogWidth, height: dialogHeight };
        }
        return dimension;
    },

    openMaximizeReportDialog: function (isChart) {
        var that = this;
        var currentScrollTop = $(window).scrollTop();
        //var containerParent = $('.chartContainer', this.element).parent();
        //var container = $('.chartContainer', this.element);
        var containerParent = this.element.parent().closest('.collapsibleContainer');
        var container = $(this.element).parent();

        var dummyElement = $(container).clone();
        var maximizeIcon = $('.fa-arrows-alt', container);
        var dialogDimension = this.getMaxViewDialogDimension(isChart);
        this.maximizedDialogContainer = container;
        var reportParameterContainer = $('.reportParameterContainer', container);

        // Set the maximized chart's height & width
        this.MAXIMIZE_CHART_WIDTH = dialogDimension.width - 25;
        this.MAXIMIZE_CHART_HEIGHT = dialogDimension.height - Sentrana.Dashboard.Settings.MAX_CHART_VIEW_GRID_HEIGHT - 50;// - $(reportParameterContainer).height();

        // Disable window scrolling when maximize view is closed
        that.disableWindowScroll();
        // Remove the maximize hover class
        $('.maximize-icon', containerParent).removeClass('maximize-icon-hover');

        $(container).dialog({
            autoOpen: false,
            modal: true,
            width: dialogDimension.width,
            height: dialogDimension.height,
            resizable: false,
            dialogClass: "ui-dialog-max-view",
            buttons: {},
            create: function () {
                // Its important to unfocus for iPad.
                if (Sentrana.isiPad()) {
                    $('.label-chart-row-range').hide();
                }
            },
            open: function () {

                // Add maximized view adjustment classes
                $('.dual-table-leftPart', that.element).addClass('hideElement');
                $('.dual-table-rightPart', that.element).addClass('maximize-right-section');
                $('.dualTable-Chart-Container', that.element).addClass('maximize-chart-container');

                // Adding close button
                $(container).prepend(can.view('templates/maximizeView-close-icon.ejs', {}));

                // When click outside of the maximized window then close it
                $('.ui-widget-overlay').on('click', function () {
                    if (Sentrana.isiPad()) {
                        // Unfocus pagelist dropdown. its important to unfocus for iPad.
                        $('select', container).blur();
                    }
                });

                // Close event
                $('.maximize-close-icon').on("click", function (event) {
                    that.closeMaximizeWindow(container);
                });

                // Activate maximize view
                that.isActiveMaximizeView = true;

                // Hide dialog titlebar
                $('.ui-dialog-titlebar', $(container).parent()).hide();

                // Rebind chart
                if (that.bigChartData !== null && that.bigChartData.rows.length > 0) {
                    that.reportChartController.updateView();
                }

                // Set report size in mazimize view
                that.reportChartController.chart.setSize(that.MAXIMIZE_CHART_WIDTH, that.MAXIMIZE_CHART_HEIGHT, false);

                // Adding datatable
                $(container).append(can.view('templates/maximizeView-grid-container.ejs', {}));
                that.renderDatatableInMaximizeWindow($('.maximizeGridContainer', container), that.bigChartData);

                // Hide the maximize icon
                $(maximizeIcon).parent().parent().hide();
                // Its important to unfocus for iPad.
                if (Sentrana.isiPad()) {
                    $('.label-chart-row-range').show();
                }

                // Add a dummy element
                //$('.collapsibleContainerTitle', containerParent).after(dummyElement);

                // Adjust the localize param section
                $('.sentrana_parameter_collapsible_container', $(container)).addClass('sentrana_parameter_collapsible_container_maximizedView');

                //Hide localize filters
                reportParameterContainer.hide();

            },
            close: function () {

                // Remove maximized view adjustment classes
                $('.dual-table-leftPart', that.element).removeClass('hideElement');
                $('.dual-table-rightPart', that.element).removeClass('maximize-right-section');
                $('.dualTable-Chart-Container', that.element).removeClass('maximize-chart-container');

                $(container).dialog("destroy");
                $(this).removeAttr("style");
                $(this).appendTo($(containerParent));

                // De activate maximize view
                that.isActiveMaximizeView = false;

                // Enable window scrolling when maximize view is closed
                that.enableWindowScroll();

                // Remove close icon
                $('.maximize-close-icon', $(container)).remove();

                // Show the maximize icon
                $(maximizeIcon).parent().parent().show();

                // Remove datatable container
                $('.maximizeGridContainer', container).remove();

                // Rebind chart
                if (that.bigChartData !== null && that.bigChartData.rows.length > 0) {
                    that.reportChartController.updateView();
                }

                // Close any open dialogs or export menu
                $(".ui-dialog-content").dialog("close");
                $(".menu-container").hide();

                // Remove dummy element
                //dummyElement.remove();

                Sentrana.AdjustGridColumnSizing(0);
                if ($('.simple-table', container).outerWidth() > $(".dataTables_scroll", container).outerWidth()) {
                    $(".dataTables_scroll", container).css('overflow', 'auto');
                }

                // Adjust the localize param section
                $('.sentrana_parameter_collapsible_container', $(container)).removeClass('sentrana_parameter_collapsible_container_maximizedView');

                //Hide localize filters
                reportParameterContainer.show();
                $(window).scrollTop(currentScrollTop);
            }
        });
        $(container).dialog("open");
    },

    closeMaximizeWindow: function (container) {
        var isDialogOpen = $(container).dialog("isOpen");
        if (isDialogOpen) {
            $(container).dialog("close");
        }
    },

    renderDatatableInMaximizeWindow: function (containerDiv, reportDataObj) {

        if (!$(containerDiv).control()) {
            $(containerDiv).html(can.view('templates/gridContainer.ejs', {}));
        }

        // If no data is found then hide the container
        if (reportDataObj === null || reportDataObj.rows.length === 0) {
            $(containerDiv).hide();
        }
        else {
            $(containerDiv).show();
        }

        // Render report element
        $(containerDiv).sentrana_report_grid({
            reportData: reportDataObj,
            showFilter: false,
            showPageSizeCombo: false,
            pageSize: 5,
            pageSizes: [5, 10, 20, 30, 50, 100],
            showGridButtons: false,
            showInfo: true,
            showPageSelector: true
        });

        // Clear the drill path for maximized report grid
        $('.drillPathBar', $(containerDiv)).html('');

        // Set default cursor on grid items for maximized view
        $('.simple-table', $(containerDiv)).addClass('simple-table-noCursor');

        // When cancel button is click from print window in chrome then column header width is distorted. Adding following class to resolve this.
        $('.dataTables_scrollHeadInner', $(containerDiv)).addClass('width-100percent');
    },

    enableWindowScroll: function () {
        $('body').removeClass('disable-window-scroll');
    },

    disableWindowScroll: function () {
        $('body').addClass('disable-window-scroll');
    },

    " chart_rebind": function (ev, el) {
        // Set report size in mazimize view
        if (this.isActiveMaximizeView) {
            this.reportChartController.chart.setSize(this.MAXIMIZE_CHART_WIDTH, this.MAXIMIZE_CHART_HEIGHT, false);
        }
    },

    "{document} touchmove": function (e) {

        // For iPad, disable window scrolling when dialog is open
        var hasDialogInWindow = $('.ui-dialog');
        if (hasDialogInWindow && hasDialogInWindow.is(":visible")) {
            return false;
        }
    },

    "{window} orientationchange": function (el, ev) {
        if (this.isActiveMaximizeView) {
            if (this.isiPad()) {
                if (this.isPortraitMode()) {
                    this.MAXIMIZE_CHART_WIDTH = 700 - 30;
                } else {
                    this.MAXIMIZE_CHART_WIDTH = 900 - 30;
                }

                this.reportChartController.chart.setSize(this.MAXIMIZE_CHART_WIDTH, this.MAXIMIZE_CHART_HEIGHT, false);
            }
        }
    }
});
