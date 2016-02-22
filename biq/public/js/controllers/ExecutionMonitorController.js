can.Control.extend("Sentrana.Controllers.ExecutionMonitor", {

    pluginName: 'sentrana_execution_monitor',
    // Default values for our options...
    defaults: {
        executionMonitorModel: null,
        /* {Object} Assumed to be an instance of Sentrana.Models.ExecutionMonitor */
        showHideGridFn: null,
        /* {Function} If supplied, it is called to show or hide the grid when execution finishes. If absent, no grid is ever shown. */
        showHideChartFn: null,
        /* {Function} If supplied, it is called to show or hide the chart when execution finishes. If absent, no chart is ever shown. */
        displayShowAsButtons: true
    },

    // The name of the class to use to indicate a Show-As button has been selected...
    CLS_SHOW_AS_BTN_SELECTED: "btn-dark-gray"
}, {
    // [override] Class constructor...
    init: function EMC_init() {
        // Define our jQuery objects...
        this.$spinner = this.element.find(".spinner");
        this.$executionMessage = this.element.find(".execution-message");
        this.$numRowsMessage = this.element.find(".num-rows");
        this.$numRowsDisplayBtns = this.element.find(".num-rows-display-btns");
        this.$showAs = this.element.find(".show-as");
        this.$showAsGrid = this.element.find('.butWrap[display-type="grid"]');
        this.$showAsChart = this.element.find('.butWrap[display-type="chart"]');

        this.$cancelBtn = this.element.find(".cancel-btn");
        this.$drillPath = this.element.find(".drill-path");
        this.$elapsedTime = this.element.find(".elapsed-time");
        this.$separators = this.element.find(".separator");

        // Update our view...
        this.updateView();
    },

    // [override] Instance method: Update the controller instance...
    update: function EMC_update(options) {
        this._super(options);

        // Update our view to reflect changes...
        this.updateView();
    },

    // Instance method: Update the view to reflect new options...
    updateView: function EMC_updateView() {
        // Update the visibility of the buttons based on the presence of the supplied functions...
        this.$showAsGrid[($.isFunction(this.options.showHideGridFn)) ? "show" : "hide"]();
        this.$showAsChart[($.isFunction(this.options.showHideChartFn)) ? "show" : "hide"]();

        // Update the selection state of the buttons, based on the model...
        this.updateShowAsButtonSelection(this.$showAsGrid, this.options.executionMonitorModel.attr('showGrid'));
        this.updateShowAsButtonSelection(this.$showAsChart, this.options.executionMonitorModel.attr('showChart'));

        // Are we missing both callbacks?
        this.$showAs[(!this.options.showHideGridFn && !this.options.showHideChartFn) ? "hide" : "show"]();

        // Replace missing callbacks with $.noop so that we don't need to check any longer!
        this.options.showHideGridFn = this.options.showHideGridFn || $.noop;
        this.options.showHideChartFn = this.options.showHideChartFn || $.noop;
    },

    // Instance method: Update the show-as button selection state to reflect the model...
    updateShowAsButtonSelection: function EMC_updateShowAsButtonSelection(el, show) {
        el[(show) ? "addClass" : "removeClass"](this.constructor.CLS_SHOW_AS_BTN_SELECTED);
    },

    // Instance method: Show or hide the viewers...
    showHideViewers: function EMC_showHideViewers(show) {
        // Is our controller visible? If not, don't show any of the viewers...
        //        if (!this.element.is(":visible")) {
        //                        return;
        //        }

        // Show Viewers
        if (show) {
            if (this.options.executionMonitorModel.attr('showGrid')) {
                this.options.showHideGridFn(show);
            }
            if (this.options.executionMonitorModel.attr('showChart')) {
                this.options.showHideChartFn(show);
            }
        }
        else {
            this.options.showHideGridFn(show);
            this.options.showHideChartFn(show);
        }
    },

    // Instance method: Update the UI to reflect the current execution status... 
    indicateStatus: function EMC_indicateStatus(status) {
        this.element.parent().removeClass("failed-status");
        this.element.parent().removeClass("success-status");
        this.element.parent().removeClass("starting-status");
        this.element.parent().addClass(status + "-status");
    },

    // Browser Event: What to do when a drill path element is selected...
    ".drill-path-elem click": function (el, ev) {
        ev.preventDefault();

        // Get the drill path index		
        var dpIndex = el.data("dpi");

        this.options.executionMonitorModel.chartType = this.options.parent.getChartType();

        var that = this;
        if (this.options.executionMonitorModel.isReportDefinitionChanged()) {
            Sentrana.ConfirmDialog("Confirm base report", window.app_resources.app_msg.drill_down.report_defintion_changed_confirm_back, function () {
                that.options.executionMonitorModel.executeDrillBaseReport(dpIndex);
            });
        }
        else {
            that.options.executionMonitorModel.executeDrillBaseReport(dpIndex);
        }
    },

    // Browser Event: What to do when a show-as button is clicked...

    ".butWrap click": function (el, ev) {
        var $el = $(el),
            type = $el.attr("display-type"),
            attr = (type === "grid" || type === "chart") ? "show" + type.substr(0, 1).toUpperCase() + type.substr(1) : undefined,
            selected = $el.hasClass(this.constructor.CLS_SHOW_AS_BTN_SELECTED);

        // Set the attribute...
        if (attr) {
            this.options.executionMonitorModel.attr(attr, !selected);
        }
    },

    // Browser Event: What to do when a user wants to cancel a report execution or drill request...
    ".cancel-btn click": function (el, ev) {
        // Ask the model to cancel our XHR call...
        this.options.executionMonitorModel.cancelExecutionDrillingCall();
    },

    // Synthetic Event: What to do when the model changes...
    "{executionMonitorModel} change": function (executionMonitorModel, ev, attr, how, newVal, oldVal) {
        // Get the full JSON data for the model. This contains all information necessary to 
        // render a grid or chart.
        var drillPath;

        // What has changed on the model?
        switch (attr) {
        case "executionStatus":
            switch (newVal) {
            case "STARTING":
                this.indicateStatus("starting");
                this.$executionMessage.text(Sentrana.getMessageText(window.app_resources.app_msg.report_execution.processing_msg));
                this.$drillPath.empty();
                this.showHideViewers(false);
                this.$spinner.show();
                this.$numRowsMessage.hide();
                this.$numRowsDisplayBtns.hide();
                this.$cancelBtn.show();
                this.$separators.hide();
                break;
            case "SUCCESS":
                this.indicateStatus("success");
                this.$executionMessage.text(executionMonitorModel.attr("executionMessage"));
                drillPath = this.options.executionMonitorModel.getDrillPath();
                if (drillPath && drillPath.length > 0) {
                    this.$drillPath.html(can.view('templates/drillPath.ejs', {
                        dpInfos: drillPath
                    }));
                }
                else {
                    this.$drillPath.empty();
                }
                this.showHideViewers(true);
                this.$spinner.hide();
                this.$numRowsMessage.text(executionMonitorModel.attr("numRowsMessage")).show();

                if (this.options.hasMetrics) {
                    this.$numRowsDisplayBtns[this.options.displayShowAsButtons ? "show" : "hide"]();
                }

                this.$cancelBtn.hide();

                if (this.options.parent && this.options.parent.executionSuccessful !== undefined) {
                    this.options.parent.executionSuccessful = true;
                }
                this.$separators.show();

                break;
            case "FAILURE":
                var data = executionMonitorModel.getData();
                this.$executionMessage.html(can.view('templates/reportException.ejs', data));

                drillPath = this.options.executionMonitorModel.getDrillPath();
                if (drillPath && drillPath.length > 0) {
                    this.$drillPath.html(can.view('templates/drillPath.ejs', {
                        dpInfos: drillPath
                    }));
                }
                else {
                    this.$drillPath.empty();
                }

                this.showHideViewers(false);
                this.$spinner.hide();
                this.$numRowsMessage.hide();
                this.$numRowsDisplayBtns.hide();
                this.$cancelBtn.hide();
                this.$separators.hide();
                this.$elapsedTime.hide();
                $('[data-toggle="tooltip"]').tooltip();

                break;
            default:
                break;
            }
            break;
        case "showGrid":
            this.updateShowAsButtonSelection(this.$showAsGrid, this.options.executionMonitorModel.attr('showGrid'));

            if (this.element.is(":visible")) {
                // Show (or hide) the grid...
                this.options.showHideGridFn(newVal);
            }
            break;
        case "showChart":
            this.updateShowAsButtonSelection(this.$showAsChart, this.options.executionMonitorModel.attr('showChart'));

            // Are we currently visible?
            if (this.element.is(":visible")) {
                // Show (or hide) the chart...
                this.options.showHideChartFn(newVal);
            }
            break;
        case "elapsedTimeStr":
            this.$elapsedTime.text("Time: " + newVal);
            break;
        default:
            break;
        }
    }
});
