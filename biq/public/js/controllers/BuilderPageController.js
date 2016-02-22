can.Control.extend("Sentrana.Controllers.BuilderPage", {
    pluginName: 'sentrana_builder_page',
    defaults: {
        app: null,
        reportDefinitionInfoModel: undefined
    }
}, {
    initDOMObjects: function () {
        // Locate our jQuery Objects...
        this.$columns = this.element.find(".builder-page");
        this.$reportDefn = this.element.find(".report-definition");
        this.$reportTitle = this.element.find('.report-definition-title');
        this.$summary = this.element.find(".summary");
        this.$executionMonitor = this.element.find(".execution-monitor");
        this.$reportInfo = this.element.find(".report-info");
        this.$reportName = this.$reportInfo.find(".report-info-name");
        this.$dataWareHouseName = this.$reportInfo.find(".warehouse-info-name");
        this.$diagnostics = this.element.find(".diagnostics");
        this.$fsDiagnostics = this.element.find(".fs-diagnostics");
        this.$saveAsButton = this.element.find(".save-as-button");
        this.$shareButton = this.element.find(".share-button");
        this.$saveExecutionMessage = this.element.find('.save-execution-message');
        this.$spinner = this.element.find(".spinner");
        this.$executionMessage = this.element.find(".execution-message");
        this.$Totals = this.element.find(".show-total");
        this.$builderReportViewerContainer = this.element.find('#builderPageReportViewContainer');
        this.$actionBar = this.element.find('.actionbar');
        this.$pivotButton = this.element.find(".pivot-button");
        this.$pivotContainer = this.element.find(".pivot-table-element");
    },

    manipulateDOMObjects: function () {
        if (this.options.app.dwRepository && !this.options.app.dwRepository.supportedFeatures.totals) {
            this.$Totals.hide();
        }
        this.element.find(".report-info-selector-btn").button();
        this.$dataWareHouseName.text(this.options.app.dwRepository.name);
    },

    " enable-view-button": function () {
        this.reportDefnModel.canSave(false);
        this.reportDefnModel.canView(true);
    },

    " column-removed": function(el, ev, element){
        if(this.resultDataModel){
            this.resultDataModel.removeFilter(element.name);
        }

        if(this.executionMonitorModel &&  this.executionMonitorModel.resultDataModel){
            this.executionMonitorModel.resultDataModel.removeFilter(element.name);
        }
    },

    initReportModels: function (that) {
        // Construct a Model instance to manage the report definition. It is initially empty...
        this.reportDefnModel = new Sentrana.Models.ReportDefin({
            app: this.options.app
        });

        // Create a Model instance that records the current objects selected from the DW Repository...
        this.dwSelection = new Sentrana.Models.ObjectSelection().bind("change", function (ev, attr, how, newVal, oldVal) {
            that.reportDefinitionChanged = true;
            that.reportDefnModel.canSave(false);
            that.reportDefnModel.canView(true);

            // Is this an object being selected?
            if (how === "add") {
                that.reportDefnModel.selectObject(newVal);
            }
            else if (how === "remove") {
                that.reportDefnModel.deselectObject(oldVal);
            }
        });

        // Bind changes in Report Defn back to the DW Selection model...
        this.reportDefnModel.bind("change", function (ev, attr, how, newVal, oldVal) {
            var parts = attr.split("."),
                i, l;
            var hasChanged = false;

            if (parts[0] === "templateUnits" || parts[0] === "filterDims") {
                if (how === "add") {
                    for (i = 0, l = newVal.length; i < l; i++) {
                        that.dwSelection.selectObject(newVal[i].hid);
                    }
                }
                else if (how === "remove") {
                    // Loop through the removed units...
                    for (i = 0, l = oldVal.length; i < l; i++) {
                        that.dwSelection.deselectObject(oldVal[i].hid);
                    }
                }

                hasChanged = true;
            }
            else if (parts[0] === "totalsOn") {
                hasChanged = true;
            }

            if (hasChanged && that.options.reportDefinitionInfoModel) {
                if (!that.reportDefnModel.isCleared) {
                    that.options.reportDefinitionInfoModel.attr('definition', that.reportDefnModel.getReportDefinitionParameters());
                }
            }
        });

        this.reusableColumnModel = new Sentrana.Models.ReusableColumnInfo();
        this.initResultDataModel();

        // Create a Model for the Execution Monitor...
        this.executionMonitorModel = new Sentrana.Models.ExecutionMonitor({
            app: this.options.app,
            reportDefinModel: this.reportDefnModel,
            resultDataModel: this.resultDataModel,
            resultOptions: this.getResultOptions()
        });

        this.bindExecutionMonitorEventHandler();

        this.reportGridUtil = new Sentrana.Models.ReportGridUtil(this.options.app, this.executionMonitorModel);
    },

    getResultOptions: function(){
        var resultOptions;
        if(this.options.reportDefinitionInfoModel){
            resultOptions = this.options.reportDefinitionInfoModel.attr('resultOptions');
        }
        return resultOptions;
    },

    bindExecutionMonitorEventHandler: function () {
        var that = this;
        // Bind specific changes in the Execution Monitor Model to the Report Definition Model...
        this.executionMonitorModel.bind("change", function (ev, attr, how, newVal, oldVal) {
            // Has the execution status changed?
            if (attr === "executionStatus") {
                // Switch on the new value...
                switch (newVal) {
                case "STARTING":
                    that.hideReportViewRequired = false;
                    that.$pivotContainer.hide();
                    that.reportDefinitionChanged = false;
                    that.reportIsRunning = true;
                    that.$actionBar.hide();
                    that.$executionMonitor.show();
                    that.hideReportView();
                    $(".metric-attribute-map-toggle").addClass("disabled-icon");
                    break;
                case "FAILURE":
                    // Can't save while we are starting an execution or when it fails--need to see it finish successfully!
                    that.reportIsRunning = false;
                    that.reportDefnModel.canSave(false);
                    that.reportDefnModel.canView(true);
                    that.hideReportView();
                    that.$actionBar.show();
                    $(".metric-attribute-map-toggle").removeClass("disabled-icon");
                    break;
                    case "SUCCESS":

                    if (!this.app.dwRepository.isAttributeOnlyRepositry()) {
                        that.$pivotButton.show();
                    }

                    that.reportIsRunning = false;
                    that.reportDefnModel.canSave(!that.reportDefinitionChanged);
                    that.reportDefnModel.canView(that.reportDefinitionChanged);
                    that.$actionBar.show();
                    $(".metric-attribute-map-toggle").removeClass("disabled-icon");
                    if (that.showPivotAnalysis) {
                        that.hideReportViewRequired = true;
                        that.showPivotAnalysisControl();
                    }
                    else {
                        that.showReportView();
                    }
                    break;
                default:
                    break;
                }
            }
            else if (attr === 'showGrid' || attr === 'showChart') {
                if (that.options.reportDefinitionInfoModel) {
                    that.options.reportDefinitionInfoModel.attr(attr, newVal);
                }
            }
        });
    },

    " show_pivot_analysis": function () {
        this.showPivotAnalysisControl();
    },

    " grid_drawn": function () {
        if (this.hideReportViewRequired) {
            this.hideReportViewRequired = false;
            this.hideGridAndChart();
        }
    },

    showPivotAnalysisControl: function () {
        this.showPivotAnalysis = false;
        this.destroyPivotView();
        var that = this;
        this.hideGridAndChart();
        setTimeout(function () {
            var $element = $(".pivot-table-element");
            $element.sentrana_pivot_analysis({
                app: that.options.app,
                data: that.executionMonitorModel.data
            });

            that.reportDefnModel.canView(true);
        }, 10);

    },

    destroyPivotView: function() {
        var $element = $(".pivot-table-element");
        if ($element.control()) {
            $element.control().destroy();
            $element.html('');
        }
    },

    validatePivotData: function () {

        var colInfos = this.reportDefnModel.templateUnits;
        var attrs = $.grep(colInfos, function (col) {
            return col.type === "ATTRIBUTE";
        });

        if (attrs.length < 2) {
            return false;
        }

        var metrics = $.grep(colInfos, function (col) {
            return col.type === "METRIC";
        });

        return metrics.length > 0;
    },

    resizePivotControl: function () {
        if ($(".pivot-table-element").control()) {
            $(".pivot-table-element").control().resizePivotControl();
        }
    },

    showReportView: function () {
        this.$builderReportViewerContainer.show();
    },

    hideReportView: function () {
        this.$builderReportViewerContainer.hide();
    },

    hideGridAndChart: function () {
        this.$pivotContainer.show();
        this.builderReportViewController.hide();
    },

    initResultDataModel: function () {
        var that = this;
        this.resultDataModel = new Sentrana.Models.ResultDataModel({
            app: this.options.app
        });
        this.resultDataModel.bind("change", function (ev, attr, how, newVal, oldVal) {
            switch (newVal) {
            case "SUCCESS":
                //that.options.app.unBlockElement(that.element.find(".center"));
                break;
            case "STARTING":
                var html = '<div class="loading"><p class="small-waitingwheel"><img src="images/loader.gif"/></p></div>';
                that.options.app.blockElement(that.element.find(".center"), html);
                break;
            default:
                break;
            }
        });
    },

    initReportControls: function (that) {
        // Create a Controller for the DW Repository that supports selection...
        this.$columns.sentrana_data_warehouse_as_controls({
            app: this.options.app,
            dwRepository: this.options.app.getDWRepository(),
            dwSelection: this.dwSelection,
            reusableColumnModel: this.reusableColumnModel,
            builderController: this
        });

        // Create a Controller for the Report Definition
        this.$reportDefn.sentrana_report_defin_editor({
            reportDefnModel: this.reportDefnModel,
            app: this.options.app,
            parent: this
        });
        this.initExecutionMonitorDependencies();
    },

    initExecutionMonitorDependencies: function () {
        // Create a Controller for the Execution Monitor...
        this.executionMonitorController = this.$executionMonitor.sentrana_execution_monitor({
            executionMonitorModel: this.executionMonitorModel,
            showHideGridFn: function (show) {},
            showHideChartFn: function (show) {},
            parent: this,
            displayShowAsButtons: false
        }).control();

        // Create a Controller for the Diagnostics
        this.$diagnostics.sentrana_diagnostics({
            executionMonitorModel: this.executionMonitorModel
        });
    },

    initReportComponents: function (that) {
        this.initReportModels(that);
        this.initReportControls(that);
    },

    initDialogs: function () {
        // Setup the Save/Update Report Dialog...
        this.saveUpdateRptDlg = $("#save-update-report-dialog").sentrana_dialogs_save_update_report({
            app: this.options.app,
            reportDefnModel: this.reportDefnModel
        }).control();

        // Setup the Save/Update Report Dialog...
        this.saveUpdateAsRptDlg = $("#save-update-as-report-dialog").sentrana_dialogs_save_update_as_report({
            app: this.options.app,
            reportDefnModel: this.reportDefnModel
        }).control();
        $(".result-definition-element").html('');
        this.resultDefDlg = $("#result-definition-dialog").sentrana_dialogs_result_definition({
            app: this.options.app,
            resultDataModel: this.resultDataModel
        }).control();
    },

    updatePageView: function () {
        if (this.builderReportViewController) {
            this.builderReportViewController.updateView();
        }
        this.resizePivotControl();
    },

    initLeftSideBar: function (sideBarWidth, that) {
        //Add smart sidebar for columns and Filters
        var leftSideBar = $(".builder-page .leftcolumn").smartsidebar({
            title: "Columns",
            position: "left",
            sidebarWidth: sideBarWidth,
            callBackFunctionDefault: function () {
                $('.contentcolumn', '.builder-page').addClass('contentcolumn-default-margin-left').addClass('contentcolumn-default-margin-right').addClass('contentcolumn-default-margin-top').addClass('contentcolumn-default-margin-bottom');
                $('.leftcolumn', '.builder-page').addClass('sidebar-default-width');
                $('.rightcolumn', '.builder-page').addClass('sidebar-default-width').addClass('sidebar-right-default-margin-left');
            },
            callBackFunctionOnShow: function () {
                $('.contentcolumn', '.builder-page').removeClass('contentcolumn-default-margin-left').addClass('contentcolumn-margin-left-on-left-sidebar-show');
                $('.leftcolumn', '.builder-page').removeClass('sidebar-default-width').addClass('sidebar-width-on-show');
                that.updatePageView();
            },
            callBackFunctionOnHide: function () {
                $('.contentcolumn', '.builder-page').removeClass('contentcolumn-margin-left-on-left-sidebar-show').addClass('contentcolumn-default-margin-left');
                $('.leftcolumn', '.builder-page').removeClass('sidebar-width-on-show').addClass('sidebar-default-width');
                that.updatePageView();
            },
            autoHeight: true,
            autoHeightMargin: $('#main-navbar').outerHeight(true)
        });
        return leftSideBar;
    },

    initRightSideBar: function (sideBarWidth, that) {
        var rightSideBar = $(".builder-page .rightcolumn").smartsidebar({
            title: "Filters",
            position: "right",
            sidebarWidth: sideBarWidth,
            callBackFunctionDefault: function () {
                $('.contentcolumn', '.builder-page').addClass('contentcolumn-default-margin-left').addClass('contentcolumn-default-margin-right').addClass('contentcolumn-default-margin-top').addClass('contentcolumn-default-margin-bottom');
                $('.leftcolumn', '.builder-page').addClass('sidebar-default-width');
                $('.rightcolumn', '.builder-page').addClass('sidebar-default-width').addClass('sidebar-right-default-margin-left');
            },
            callBackFunctionOnShow: function () {
                $('.contentcolumn', '.builder-page').removeClass('contentcolumn-default-margin-right').addClass('contentcolumn-margin-right-on-right-sidebar-show');
                $('.rightcolumn', '.builder-page').removeClass('sidebar-default-width').removeClass('sidebar-right-default-margin-left').addClass('sidebar-width-on-show').addClass('sidebar-right-margin-left-on-show');
                that.updatePageView();
            },
            callBackFunctionOnHide: function () {
                $('.contentcolumn', '.builder-page').removeClass('contentcolumn-margin-right-on-right-sidebar-show').addClass('contentcolumn-default-margin-right');
                $('.rightcolumn', '.builder-page').removeClass('sidebar-width-on-show').removeClass('sidebar-right-margin-left-on-show').addClass('sidebar-default-width').addClass('sidebar-right-default-margin-left');
                that.updatePageView();
            },
            autoHeight: true,
            autoHeightMargin: $('#main-navbar').outerHeight(true)
        });

        return rightSideBar;
    },

    update: function(options){
        this._super(options);
        if(this.needToUpdateView) {
            this.updatePageView();
            this.needToUpdateView = false;
        }
    },

    init: function BP_init() {
        var that = this;
        this.executionSuccessful = false;
        this.isRendered = false;
        this.callBackFunctionOnInit = [];
        this.isColumnDefinitionChanged = false;
        this.needToUpdateView = false;

        $('.nb-body').hide();

        if (!this.options.app.isMainBlocked) {
            this.options.app.blockMain();
        }

        
            if (that.element) {
                that.element.html(can.view('templates/pg-builder.ejs', {}));
            }

            that.initDOMObjects();
            that.manipulateDOMObjects();
            that.initReportComponents(that);

            // Do we have any URL parameters?
            var urlParams;
            if (window.location.search) {
                // Try to retrieve the report definition from the URL...
                urlParams = that.dwRepository.retrieveReportDefnFromUrl(window.location.search);
                // Ask the ExecutionModel to render the report and execute it...
                that.executionMonitorModel.renderAndExecuteReport(urlParams, urlParams.eInfos, 'CLEAR');
            }
            that.initDialogs();
            // Indicate that the ReportDefintion model cannot be saved (yet)...
            that.reportDefnModel.canSave(false);

            // Indicate the default display options for the report...
            that.executionMonitorModel.attr("showGrid", true);
            that.executionMonitorModel.attr("showChart", true);

            var sideBarWidth = 280;
            var leftSideBar = that.initLeftSideBar(sideBarWidth, that);
            var rightSideBar = that.initRightSideBar(sideBarWidth, that);

            if (Sentrana.Enums.ENABLE_METRIC_ATTRIBUTE_MAPPING_TOGGLE) {
                leftSideBar.find(".button_wrapper").prepend('<i class="fa fa-toggle-on metric-attribute-map-toggle"><i/>');
                leftSideBar.find(".metric-attribute-map-toggle").off("click");
                leftSideBar.find(".metric-attribute-map-toggle").on("click", function () {
                    that.toggleRestictButtonIcon();
                    return false;
                });

                setTimeout(function () {
                    that.setMetricAtrributeMappingButtonAttr();
                }, 450);

            }
            that.makeReportZoneCollapsible();

            leftSideBar.show();
            rightSideBar.show();
            that.options.app.unBlockMain();

            that.isRendered = true;

            if (that.callBackFunctionOnInit.length > 0) {
                for (var i = 0; i < that.callBackFunctionOnInit.length; i++) {
                    var callBackFunction = that.callBackFunctionOnInit[i];
                    if (callBackFunction && typeof callBackFunction === 'function') {
                        callBackFunction();
                    }
                }
            }
        
    },

    toggleRestictButtonIcon: function () {
        if ($(".metric-attribute-map-toggle").hasClass("disabled-icon")) {
            return;
        }

        this.options.app.toggleMetricAtrributeMappingStatus();
        this.setMetricAtrributeMappingButtonAttr();

        if (!this.options.app.metricAtrributeMappingStatus) {
            this.enableAllCheckobxes();
        }
        else {
            this.applyMappingToAll();
        }
    },

    setMetricAtrributeMappingButtonAttr: function () {
        var button = $(".metric-attribute-map-toggle");
        if (this.options.app.metricAtrributeMappingStatus) {
            $(button).attr('title', 'Turn off metric attribute mapping restriction');
            $(button).removeClass("fa-toggle-on");
            $(button).addClass("fa-toggle-off");
        }
        else {
            $(button).attr('title', 'Turn on metric attribute mapping restriction');
            $(button).addClass("fa-toggle-on");
            $(button).removeClass("fa-toggle-off");
        }

    },

    makeReportZoneCollapsible: function () {
        this.element.find(".report-definition-header-bar").click({
            controller: this
        }, this.CollapsibleContainerTitleOnClick);
    },

    CollapsibleContainerTitleOnClick: function (event) {
        $(this).find('.indicator').toggleClass("fa-minus-square fa-plus-square");
        event.data.controller.element.find(".report-zone-collapsibleContainer").slideToggle('normal');
    },

    // Instance Method: Indicate that we are now linked to a report definition instance...
    linkToReport: function BP_linkToReport(report) {
        if (this.options.reportDefinitionInfoModel) {
            this.options.reportDefinitionInfoModel.backup();
        }
        this.isColumnDefinitionChanged = false;
        this.preserveTheCloneModel(report);

        this.$reportTitle.html(can.view('templates/editReportTitle.ejs', {
            mode: "edit",
            report: report
        }));

        // Show the Report Info section...
        this.$reportInfo.show();

        //if user cookie found for hiding the report info then hide it
        var reportInfoCookieValue = this.options.app.retrieveBuilderPageReportInfo();
        if (reportInfoCookieValue === "false") {
            this.$reportInfo.hide();
        }

        // Update our report name...
        this.$reportName.text(report.name);

        // Tell the report definition it is a saved report...
        this.reportDefnModel.setSaved(true);
    },

    preserveTheCloneModel: function (clonedReport) {
        this.cloneReportDefinitionInfoModel = clonedReport.attr();
    },

    // Instance Method: Indicate that we are not unlinking the report from the page...
    unlinkReport: function BP_unlinkReport(report) {
        // Clear the model instance instance associated with our controller...\
        this.originalReport = undefined;
        this.update({
            reportDefinitionInfoModel: undefined,
            originalReportModel: undefined
        });
        this.cloneReportDefinitionInfoModel = undefined;
        this.isColumnDefinitionChanged = false;
        // Hide the report info section...
        this.$reportInfo.hide();

        // Clear the name...
        this.$reportName.text("");

        // Tell the report definition model that we are not in the mode of saving...
        this.reportDefnModel.setSaved(false);
    },

    " reset_report": function (el, ev) {
        this.resetBuilderPage();
    },

    resetBuilderPage: function () {
        this.resultOptions = undefined;
        this.executionMonitorModel.resultOptions = undefined;

        if(this.builderReportViewController && this.builderReportViewController.resultDataModel){
            this.builderReportViewController.resultDataModel.clearTransformation();
        }

        this.initResultDataModel();
        this.executionMonitorModel.resultDataModel = this.resultDataModel;

        if (this.options.reportDefinitionInfoModel && this.options.reportDefinitionInfoModel.bookletId) {
            this.options.app.switchToPage("saved", "refresh_booklet_report", this.options.reportDefinitionInfoModel);
        }

        if (this.options.reportDefinitionInfoModel) {
            this.unlinkReport(this.options.reportDefinitionInfoModel);
        }

        //reset models
        this.options.reportDefinitionInfoModel = undefined;
        this.isColumnDefinitionChanged = false;
        // Indicate that the ReportDefintion model cannot be saved (yet)...
        this.reportDefnModel.canSave(false);

        // Indicate the default display options for the report...
        this.executionMonitorModel.attr("showGrid", true);
        this.executionMonitorModel.attr("showChart", true);

        if (this.pageRefreshed) {
            this.$actionBar.hide();
        }
        this.$executionMonitor.hide();
        if (this.executionMonitorController) {
            this.executionMonitorController.indicateStatus("success");
        }
        this.$fsDiagnostics.hide();
        this.$reportTitle.html('Report Definition');
        this.pageRefreshed = true;
        this.$builderReportViewerContainer.hide();
        this.destroyPivotView();
    },

    isChangesMade: function () {
        if (!this.options.reportDefinitionInfoModel) {
            return false;
        }
        return this.options.reportDefinitionInfoModel.isDirty(true);
    },

    // Synthetic Event: What to do if the user wants to save the report...
    " save_report": function (el, ev, param) {
        var actionLog = {
            ActionName: Sentrana.ActionLog.ActionNames.SaveReport,
            Context: Sentrana.ActionLog.Contexts.BuilderPage,
            ElementType: Sentrana.ActionLog.ElementTypes.Report
        };

        this.options.app.writeActionLog(actionLog);

        var that = this;

        // Compute a reasonable name for the report...
        var reportName = this.reportDefnModel.computeReportName(60);

        // Is the grid being shown right now?
        var showGrid = this.executionMonitorModel.attr('showGrid');

        // Is the chart being shown right now?
        var showChart = this.executionMonitorModel.attr('showChart');

        // Make the default to show grid if neither is selected...
        if (!showGrid && !showChart) {
            showGrid = true;
        }

        // What are the chart settings?
        var chartOptions = this.builderReportViewController.getChartOptions();

        var resultOptions = this.builderReportViewController.resultDataModel.getResultOptions();
        // Are we saving a new report?
        if (!this.options.reportDefinitionInfoModel) {
            // Create a new model instance...
            this.update({
                reportDefinitionInfoModel: new Sentrana.Models.ReportDefinitionInfo({
                    "name": reportName,
                    "showGrid": showGrid,
                    "showChart": showChart,
                    "chartOptions": chartOptions,
                    "resultOptions": resultOptions
                }, this.options.app),
                originalReportModel: undefined
            });

            this.saveUpdateRptDlg.open(this.options.reportDefinitionInfoModel);

        }
        else if (this.options.reportDefinitionInfoModel.isNew()) {
            this.options.reportDefinitionInfoModel.attr({
                "name": reportName,
                "showGrid": showGrid,
                "showChart": showChart,
                "chartOptions": chartOptions,
                "resultOptions": resultOptions
            }, false);

            this.saveUpdateRptDlg.open(this.options.reportDefinitionInfoModel);

        }
        else {

            this.$spinner.show();
            this.$executionMessage.text("Saving...");
            this.$saveExecutionMessage.text('');

            this.options.reportDefinitionInfoModel.attr("resultOptions", []);

            this.options.reportDefinitionInfoModel.attr({
                "showGrid": showGrid,
                "showChart": showChart,
                "chartOptions": chartOptions,
                "definition": this.reportDefnModel.getReportDefinitionParameters(),
                "resultOptions": resultOptions
            }, false);

            this.options.reportDefinitionInfoModel.save().done(function () {
                if (param && param.resetPage) {
                    that.reportDefnModel.clear();
                    that.resetBuilderPage();
                }
                else {
                    //                    that.setChartOption(true);
                    $('.save-execution-message').text(Sentrana.getMessageText(window.app_resources.app_msg.report_operation.update.success_msg)).css('color', 'green').fadeIn();
                    $(".save-button", this.element).button({
                        "disabled": true
                    });

                    //backup the report again
                    if (that.options.reportDefinitionInfoModel) {
                        that.options.reportDefinitionInfoModel.backup();
                    }
                }
            }).fail(function (err) {
                $('.save-execution-message').text(Sentrana.getMessageText(window.app_resources.app_msg.update_operation.failed)).css('color', 'red').fadeIn();
            }).always(function () {
                that.$spinner.hide();
                that.$executionMessage.text("");
            });
        }

    },

    openDerivdColumnDialog: function (ruModel, derivedColumn) {
        var $fomulaDialogContainer = $(".formula-column-dialog");

        //if any controller is associated with it then destroy it first
        var controller = $fomulaDialogContainer.control();
        if (controller && !controller._destroyed) {
            controller.destroy();
        }

        $fomulaDialogContainer.html("");

        if (!ruModel && derivedColumn) {
            var index = this.getIndexByHid(derivedColumn.hid);
            if (index > -1) {
                ruModel = this.reportDefnModel.templateUnits[index];
            }
        }

        // Setup the Derived Column dialog...
        var derivedColumnDlg = $fomulaDialogContainer.sentrana_dialogs_formula_column({
            app: this.options.app,
            reportDefnModel: this.reportDefnModel,
            dwRepository: this.options.app.dwRepository,
            isPartOfAnyReport: ruModel ? true : false,
            reportId: this.options.reportDefinitionInfoModel ? this.options.reportDefinitionInfoModel.id : undefined
        }).control();

        derivedColumnDlg.open(ruModel, derivedColumn);
    },

    getIndexByHid: function (hid) {
        if (!this.reportDefnModel) {
            return -1;
        }
        for (var i = 0; i < this.reportDefnModel.templateUnits.length; i++) {
            if (this.reportDefnModel.templateUnits[i].hid === hid) {
                return i;
            }
        }

        return -1;
    },

    openOnlyWhenColumnDialog: function (tu, addToreport) {
        var $onlyWhenDialogContainer = $(".onlywhen-column-dialog");

        var controller = $onlyWhenDialogContainer.control();
        if (controller && !controller._destroyed) {
            controller.destroy();
        }

        var filterElements = [];
        if (tu.elementHID) {
            var elementHIds = tu.elementHID.split(',');
            for (var i = 0; i < elementHIds.length; i++) {
                var element = this.options.app.dwRepository.objectMap[elementHIds[i]];
                if (element) {
                    filterElements.push(element);
                }
            }
        }

        var tuAttr = tu.id ? tu.attr() : tu;
        var conditonalMetric = new Sentrana.Models.ConditionalMetric(tuAttr, filterElements, this.options.app.dwRepository);

        var index = this.getIndexByHid(conditonalMetric.hid);
        if (index > -1) {
            addToreport = true;
        }

        var onlyWhenColumnDlg = $onlyWhenDialogContainer.sentrana_dialogs_only_when({
            app: this.options.app,
            width: 700,
            conditionalMetric: conditonalMetric,
            addToreport: addToreport,
            position: ['center', 60],
            builderController: this,
            tu: tu,
            reportDefnModel: this.reportDefnModel
        }).control();

        onlyWhenColumnDlg.open();
    },

    openSavedFilterDialog: function (filter) {

        var $savedFiltersDialogContainer = $(".saved-filters-dialog");

        var controller = $savedFiltersDialogContainer.control();
        if (controller && !controller._destroyed) {
            controller.destroy();
        }

        $savedFiltersDialogContainer.html('');

        var mode = "edit";
        if (!filter) {
            filter = new Sentrana.Models.SavedFilter({ app: this.options.app });
            mode = "create";
        } else {
            var filters = [];
            for (var i = 0; i < filter.filters.length; i++) {
                var object = this.options.app.dwRepository.getObjectByOID(filter.filters[i].oid, true);
                filters.push(object);
            }

            filter = new Sentrana.Models.SavedFilter({ app: this.options.app, id: filter.id, dataSource: filter.dataSource, name: filter.name, filters: filters });
        }

        var savedFiltersDlg = $savedFiltersDialogContainer.sentrana_dialogs_saved_filters({
            app: this.options.app,
            width: 570,
            savedFilter: filter,
            reportDefnModel: this.reportDefnModel,
            mode: mode
        }).control();

        savedFiltersDlg.open();

    },

    ".formula-column-button click": function () {
        this.openDerivdColumnDialog();
    },

    ".report-info-selector-btn click": function () {
        if ($('.report-info-selector').is(":checked")) {
            this.options.app.saveBuilderPageReportInfo("false");
        }

        this.$reportInfo.hide();
    },

    " chart_updated": function (el, ev) {
        $(".save-button", this.element).button({
            "disabled": false
        });
    },

    // Synthetic Event: What to do if the user wants to save the report as new one...
    " save_as_report": function (el, ev) {

        if (!this.options.reportDefinitionInfoModel) {
            return;
        }
        if (this.options.reportDefinitionInfoModel.bookletId) {
            var bookletId = this.options.reportDefinitionInfoModel.bookletId,
                order = this.options.app.bookletController.getReportPosition();
        }

        // Is the grid being shown right now?
        var showGrid = this.executionMonitorModel.showGrid;

        // Is the chart being shown right now?
        var showChart = this.executionMonitorModel.showChart;

        // Make the default to show grid if neither is selected...
        if (!showGrid && !showChart) {
            showGrid = true;
        }

        // What are the chart settings?
        var chartOptions = this.builderReportViewController.getChartOptions();

        var resultOptions = this.builderReportViewController.resultDataModel.getResultOptions();
        // Open the dialog...
        this.saveUpdateAsRptDlg.open('Copy of ' + this.options.reportDefinitionInfoModel.name, showGrid, showChart, chartOptions, this.options.app, bookletId, order, resultOptions);

    },

    shareReport: function () {
        if (!this.options.reportDefinitionInfoModel) {
            return;
        }
        this.element.trigger("share_report", this.options.reportDefinitionInfoModel);
    },

    // Synthetic Event: The user wants to execute the report specified by the current definition...
    " execute_report_by_defn": function (el, ev, params, operation, elems) {
        if (this.reportIsRunning) {
            this.executionMonitorModel.cancelExecutionDrillingCall();
            this.reportIsRunning = true;
            this.reportDefinitionChanged = false;
        }

        // Show the Summary div...
        this.$summary.show();
        $('.report-chart.sentrana_collapsible_container .buttonBar').css('display', 'inline-block');
        var userInfo = this.options.app.retrieveUserInfo();
        // Is the logged on user a developer?
        if (userInfo && userInfo.isDeveloper) {
            this.$fsDiagnostics.show();
        }

        this.reportDefnModel.canSave(false);
        this.pageRefreshed = false;
        // Ask the Execution Monitor Model to execute the specified report...
        //this.executionMonitorModel.executeReportUsingDefnParams(params, operation, elems);

        // Define the new report definition JSON...
        var json = {
            "name": "Untitled",
            "definition": params,
            "showChart": true,
            "showGrid": true
        };

        if (this.options.reportDefinitionInfoModel && this.options.reportDefinitionInfoModel.chartOptions) {
            json.chartOptions = this.options.reportDefinitionInfoModel.chartOptions;
        }

        if (this.originalReport) {
            json.name = this.originalReport.name;
            json.createDate = this.originalReport.createDate;
        }
        else {
            json.createDate = Sentrana.formatCommentDate(new Date());
        }

        // Create a new ReportDefinitionInfo object...
        var report = new Sentrana.Models.ReportDefinitionInfo({
            json: json,
            app: this.options.app
        });

        //For the report view controller
        //if any controller is associated with it then destroy it first
        if (this.$builderReportViewerContainer.control()) {
            this.executionMonitorModel.unbind("change");
            this.$builderReportViewerContainer.sentrana_report_view('destroy');
            this.$builderReportViewerContainer.empty();
        }

        this.bindExecutionMonitorEventHandler();
        this.initExecutionMonitorDependencies();

        this.executionMonitorModel.resultOptions = this.resultOptions;
        this.executionMonitorModel.saveState = true;

        this.builderReportViewController = this.$builderReportViewerContainer.sentrana_report_view({
            app: this.options.app,
            executionMonitorModel: this.executionMonitorModel,
            showExport: true,
            showPrint: true,
            showChartOptions: true,
            changeChartType: true,
            allowDrillDown: true,
            displayMode: 'write',
            reportDefinitionInfoModel: this.options.reportDefinitionInfoModel,
            resultOptions: this.resultOptions 
        }).control();
        this.builderReportViewController.setTitle(undefined, "Report results");
        this.builderReportViewController.viewReport(report);
    },

    updateResultDefinition: function (fromIndex, toIndex) {
        if (!this.resultOptions) {
            return;
        }        
 
        for (var i = 0; i < this.resultOptions.length; i++) {
            var columnPos = this.getColumnIndex(this.resultOptions[i].columnId)
            this.resultOptions[i].columnPosition = columnPos;
        }        
        
    },

    getResultDataByColumnId: function(columnId){
        for (var i = 0; i < this.resultOptions.length; i++) {
            if (this.resultOptions[i].columnId === columnId) {
                return this.resultOptions[i];
            }
        }
    },

    getColumnIndex: function (columnId) {
        for (var i = 0; i < this.reportDefnModel.templateUnits.length; i++) {
            if (this.reportDefnModel.templateUnits[i].oid === columnId) {
                return i;
            }
        }

        return -1;
    },

    getYAxisLabel: function (type, columns) {
        // generally the metrics, but for 2-D continuous charts, the 2nd metric, and for historgrams, the count
        if (type == Sentrana.CHART_TYPE_SCATTER ||
            type == Sentrana.CHART_TYPE_BUBBLE) {
            if (columns.metrics.count > 1) {
                return columns.metrics[1].name;
            }
            return this.getJoinedTitle(columns.metrics);

        }
        else if (this.chartType == Sentrana.CHART_TYPE_HISTOGRAM) {
            return "Count";
        }
        else {
            return this.getJoinedTitle(columns.metrics);
        }
    },

    getJoinedTitle: function (columns) {
        var titleArray = [];
        for (var i = 0; i < columns.length; i++) {
            titleArray.push(columns[i].name);
        }
        return titleArray.join(', ');
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

    isNewTitleRequired: function () {
        return (this.isReportColumnChanged());
    },

    getChartType: function () {
        return this.builderReportViewController.getChartType();
    },

    isReportColumnChanged: function () {
        if (this.isColumnDefinitionChanged) {
            return true;
        }
        var model = this.cloneReportDefinitionInfoModel;

        if (!model) {
            return false;
        }

        var changesMade = false;
        var reportDefinition = this.reportDefnModel.getReportDefinitionParameters();
        if (model.definition.template !== reportDefinition.template) {
            changesMade = true;
            this.isColumnDefinitionChanged = true;
        }

        return changesMade;
    },

    hideTableDialogs: function () {
        this.hideTableDialog('.column-sort-element');
        this.hideTableDialog('.column-filter-element');
    },

    hideTableDialog: function (className) {
        var $element = this.element.find(className);

        var controller = $element.control();
        if (controller && !controller._destroyed) {
            controller.hideThisController();
        }
    },

    // Synthetic Event: The user wants to edit the report...
    " edit_report": function (el, ev, report) {
        this.resetBuilderPage();
        var that = this;
        report.initializeFilters(
            function(form) {
                var attr = that.options.app.dwRepository.objectMap[form.attrHID];
                that.$columns.control().initFilterControl(attr);
            }
        );
        setTimeout(function() {
            if (that.isRendered) {
                that.editReport(report);
            }
            else {
                that.callBackFunctionOnInit.push(function () {
                    that.editReport(report);
                    that.$columns.control().checkFirstSelectedFilter();
                });
            }
        }, 100);
    },

    editReport: function (report) {

        this.resultOptions = report.resultOptions ? report.resultOptions.attr() : {};
        //Clone the report
        this.originalReport = report;
        var clonedReport = new Sentrana.Models.ReportDefinitionInfo({
            json: report.attr(),
            app: this.options.app
        });
        this.pageRefreshed = false;
        // Need to reset range filter area
        $('.date-range-list').empty();
        // Remember our model instance...
        this.update({
            reportDefinitionInfoModel: clonedReport,
            originalReportModel: report
        });

        // Set the report definition and indicate that we cannot save (yet)...
        this.reportDefnModel.setDefn(clonedReport.definition);
        this.reportDefnModel.canSave(false);
        // Link to the report...
        this.linkToReport(clonedReport);

        // Hide various controllers...
        this.$executionMonitor.hide();
        this.$fsDiagnostics.hide();

        // Set properties on the Execution Monitor model...
        this.executionMonitorModel.attr("showGrid", true);
        this.executionMonitorModel.attr("showChart", true);

        this.executionMonitorModel.attr('resultOptions', this.getResultOptions());

        $(".save-button", this.element).button({
            "disabled": true
        });
        this.$saveAsButton.button({
            "disabled": true
        }).show();
        this.$shareButton.button({
            "disabled": true
        }).show();
        //hide the view container
        this.$builderReportViewerContainer.html('');
    },

    " update_definition_for_deleted_derived_column": function (el, ev, agrs) {
        if (agrs) {
            this.reportDefnModel.addExpressionToReportDefinition(agrs.derivedColumn, agrs.pos, agrs.sortPosition, agrs.sortOrder);
        }

        if (this.options.app.savedReportsController) {
            //check if already the saved report page is rendered
            this.options.app.savedReportsController.updateReportList();
        }
    },

    " apply_mteric_dimension_mapping": function (el, ev, arg) {

        if (!this.options.app.metricAtrributeMappingStatus) {
            this.enableAllCheckobxes();
            return;
        }

        var reportDefnModel = arg.reportDefnModel,
            newTu = arg.newTu,
            changeType = arg.changeType;

        if (this.options.app.dwRepository.metricDimensionMapping.length <= 0) {
            return;
        }

        if (reportDefnModel.templateUnits.length <= 0) {
            this.enableAllCheckobxes();
            return;
        }

        if (!newTu) {
            return;
        }

        var selectedGrupAndDimensions = this.getSelectedMetricGroupAndDimensions(reportDefnModel.templateUnits);
        if (!newTu.formula) { // check if not a derived column
            if (newTu.type === "METRIC") {
                if (changeType === "remove" && selectedGrupAndDimensions.groupIds.length <= 0) {
                    this.enableAllDimensions();
                }
                else {
                    var relatedDimensions = this.getRelatedDimensions(selectedGrupAndDimensions.groupIds);
                    var unRrelatedDimensions = this.getUnrelatedDimensions(relatedDimensions);
                    this.disableUnrelatedDimensions(unRrelatedDimensions);
                    this.handleIncludeExcludeAttr(relatedDimensions, selectedGrupAndDimensions.groupIds);
                }

            }
            else {
                if (changeType === "remove" && selectedGrupAndDimensions.dimNames.length <= 0) {
                    this.enableAllMetricGroups();
                }
                else {
                    var relatedGroups = this.getRelatedMetricGroups(selectedGrupAndDimensions.dimNames);
                    var unRrelatedGroups = this.getUnrelatedMetricGroups(relatedGroups);
                    this.disableUnrelatedMetricGroups(unRrelatedGroups);
                }

            }
        }
    },

    applyMappingToAll: function () {

        if (this.options.app.dwRepository.metricDimensionMapping.length <= 0) {
            return;
        }

        var selectedGrupAndDimensions = this.getSelectedMetricGroupAndDimensions(this.reportDefnModel.templateUnits);
        if (selectedGrupAndDimensions.dimNames.length > 0) {
            var relatedGroups = this.getRelatedMetricGroups(selectedGrupAndDimensions.dimNames);
            var unRrelatedGroups = this.getUnrelatedMetricGroups(relatedGroups);
            this.disableUnrelatedMetricGroups(unRrelatedGroups);
        }

        if (selectedGrupAndDimensions.groupIds.length > 0) {
            var relatedDimensions = this.getRelatedDimensions(selectedGrupAndDimensions.groupIds);
            var unRrelatedDimensions = this.getUnrelatedDimensions(relatedDimensions);
            this.disableUnrelatedDimensions(unRrelatedDimensions);
            this.handleIncludeExcludeAttr(relatedDimensions, selectedGrupAndDimensions.groupIds);
        }

    },

    mergeTwoArray: function (firstArray, secondArray) {
        for (var i = 0; i < secondArray.length; i++) {
            if ($.inArray(secondArray[i], firstArray) <= -1) {
                firstArray.push(secondArray[i]);
            }
        }

        return firstArray;
    },

    getSelectedMetricGroupAndDimensions: function (templateUnits) {
        var groupIds = [],
            dimNames = [];
        for (var i = 0; i < templateUnits.length; i++) {
            var tu = templateUnits[i];
            if (tu.type === "METRIC") {
                var groupId = this.getMetricGroupByMetric(tu.oid);
                if (groupId) {
                    groupIds.push($.trim(groupId));
                }
            }
            else {
                var attr = this.options.app.dwRepository.objectMap[tu.hid];
                if (attr) {
                    dimNames.push($.trim(attr.dimName));
                }
            }
        }

        return {
            groupIds: groupIds,
            dimNames: dimNames
        };
    },

    getMetricGroupByMetric: function (metricOid) {
        var metricGroups = this.options.app.dwRepository.metricGroups;
        for (var i = 0; i < metricGroups.length; i++) {
            for (var j = 0; j < metricGroups[i].metrics.length; j++) {
                var metric = metricGroups[i].metrics[j];
                if (metric.oid === metricOid) {
                    return metricGroups[i].id;
                }
            }
        }
        return false;
    },

    getRelatedDimensions: function (groupIds) {
        var dimNames = [];
        var mappings = this.options.app.dwRepository.metricDimensionMapping;

        var selectedmappings = $.grep(mappings, function (map) {
            return $.inArray(map.groupId, groupIds) > -1;
        });

        for (var i = 0; i < selectedmappings.length; i++) {
            for (var j = 0; j < selectedmappings[i].dimensions.length; j++) {
                var dimName = selectedmappings[i].dimensions[j].name;
                if (this.isDimensionExistsForAllGroup(dimName, selectedmappings)) {
                    dimNames.push($.trim(dimName));
                }
            }

        }

        return dimNames;
    },

    isDimensionExistsForAllGroup: function (dimName, mappings) {
        var exists = 0;
        for (var i = 0; i < mappings.length; i++) {
            for (var j = 0; j < mappings[i].dimensions.length; j++) {
                var dimNameLocal = mappings[i].dimensions[j].name;
                if ($.trim(dimName) === $.trim(dimNameLocal)) {
                    exists++;
                    break;
                }
            }
        }

        return mappings.length === exists;
    },

    getRelatedMetricGroups: function (dimNames) {
        var groupIds = [];
        var selectedmappings = this.getSelectedMappingsByDimName(dimNames);
        for (var j = 0; j < selectedmappings.length; j++) {
            if (this.isGroupContainsAllDimensions(selectedmappings[j], dimNames)) {
                if ($.inArray($.trim(selectedmappings[j].groupId), groupIds) <= -1) {
                    groupIds.push($.trim(selectedmappings[j].groupId));
                }
            }
        }

        return groupIds;
    },

    getSelectedMappingsByDimName: function (dimNames) {
        var mappings = this.options.app.dwRepository.metricDimensionMapping;
        return $.grep(mappings, function (map) {
            var exists = false;
            for (var i = 0; i < map.dimensions.length; i++) {
                exists = $.inArray($.trim(map.dimensions[i].name), dimNames) > -1;
                if (exists) {
                    break;
                }
            }
            return exists;
        });
    },

    isGroupContainsAllDimensions: function (metricGroup, dimNames) {
        var exists = 0;
        for (var i = 0; i < dimNames.length; i++) {
            for (var j = 0; j < metricGroup.dimensions.length; j++) {
                if ($.trim(dimNames[i]) === $.trim(metricGroup.dimensions[j].name)) {
                    exists++;
                    break;
                }
            }
        }

        return dimNames.length === exists;
    },

    getUnrelatedDimensions: function (relatedDimNames) {
        var dimensionNames = this.options.app.dwRepository.dimensionNames,
            unRelatedDimNames = [];

        for (var i = 0; i < dimensionNames.length; i++) {
            if ($.inArray($.trim(dimensionNames[i]), relatedDimNames) <= -1) {
                unRelatedDimNames.push($.trim(dimensionNames[i]));
            }
        }

        return unRelatedDimNames;
    },

    getUnrelatedMetricGroups: function (relatedGroups) {
        var metricGroups = this.options.app.dwRepository.metricGroups,
            unRelatedGroups = [];

        for (var i = 0; i < metricGroups.length; i++) {
            if ($.inArray(metricGroups[i].id, relatedGroups) <= -1) {
                unRelatedGroups.push(metricGroups[i].id);
            }
        }
        return unRelatedGroups;
    },

    enableAllCheckobxes: function () {
        $("input.object-selector").prop("disabled", false);
    },

    enableAllDimensions: function () {
        $(".dimension input.object-selector").prop("disabled", false);
    },

    enableAllMetricGroups: function () {
        $(".metrics-panel input.object-selector").prop("disabled", false);
    },

    disableUnrelatedDimensions: function (unRrelatedDimensions) {
        this.enableAllDimensions();
        for (var i = 0; i < unRrelatedDimensions.length; i++) {
            var attributes = this.getAttributesByDimension(unRrelatedDimensions[i]);
            if (attributes) {
                for (var j = 0; j < attributes.length; j++) {
                    this.disableCheckboxbyId(attributes[j].hid);
                }
            }
        }
    },

    handleIncludeExcludeAttr: function (dimNames, groupIds) {

        var dimensions = this.getIncludeExcludeAttr(groupIds);

        for (var i = 0; i < dimNames.length; i++) {
            var attrs = dimensions[dimNames[i]];
            if (attrs && attrs.length) {

                var attributes = this.getAttributesByDimension(dimNames[i]);
                var includes = $.grep(attrs, function (attr) {
                    return attr.operation === "include";
                });

                if (includes.length) {
                    for (var j = 0; j < attributes.length; j++) {
                        var attrId = attributes[j].oid.substring(0, attributes[j].oid.length - 5);
                        if (!this.isInList(attrId, includes)) {
                            this.disableCheckboxbyId(attributes[j].hid);
                        }
                    }
                }
                var excludes = $.grep(attrs, function (attr) {
                    return attr.operation === "exclude";
                });

                if (excludes.length) {
                    for (j = 0; j < attributes.length; j++) {
                        attrId = attributes[j].oid.substring(0, attributes[j].oid.length - 5);
                        if (this.isInList(attrId, excludes)) {
                            this.disableCheckboxbyId(attributes[j].hid);
                        }
                    }
                }

            }
        }
    },

    isInList: function (attrId, includes) {
        for (var i = 0; i < includes.length; i++) {
            if (includes[i].id === attrId) {
                return true;
            }
        }

        return false;
    },

    getSelectedMappingsByGroupeID: function (groupIds) {
        var selectedMappings = [],
            mappings = this.options.app.dwRepository.metricDimensionMapping;
        for (var i = 0; i < groupIds.length; i++) {
            for (var j = 0; j < mappings.length; j++) {
                if (mappings[j].groupId === groupIds[i]) {
                    selectedMappings.push(mappings[j]);
                }
            }
        }

        return selectedMappings;
    },

    getIncludeExcludeAttr: function (groupIds) {
        var selectedmappings = this.getSelectedMappingsByGroupeID(groupIds),
            dimensions = {};
        for (var i = 0; i < selectedmappings.length; i++) {
            for (var j = 0; j < selectedmappings[i].dimensions.length; j++) {
                var dim = selectedmappings[i].dimensions[j];
                dim.name = $.trim(dim.name);
                if (!dimensions[dim.name]) {
                    dimensions[dim.name] = [];
                }

                if (dim.attributes && dim.attributes.length) {
                    for (var k = 0; k < dim.attributes.length; k++) {
                        if (!this.isAttributeAlreadyAdded(dimensions[dim.name], dim.attributes[k])) {
                            dimensions[dim.name].push(dim.attributes[k]);
                        }
                    }
                }
            }
        }

        return dimensions;
    },

    isAttributeAlreadyAdded: function (dim, attr) {
        for (var i = 0; i < dim.length; i++) {
            if (dim[i].id === attr.id && dim[i].operation === attr.operation) {
                return true;
            }
        }
        return false;
    },

    disableUnrelatedMetricGroups: function (unRrelatedGroups) {
        this.enableAllMetricGroups();
        for (var i = 0; i < unRrelatedGroups.length; i++) {
            var metrics = this.getMetricsByGroup(unRrelatedGroups[i]);
            if (metrics) {
                for (var j = 0; j < metrics.length; j++) {
                    this.disableCheckboxbyId(metrics[j].hid);
                }
            }
        }
    },

    disableUnrelatedColumns: function (unRrelatedDimensions, unRrelatedGroups) {
        this.enableAllCheckobxes();
        for (var i = 0; i < unRrelatedGroups.length; i++) {
            var metrics = this.getMetricsByGroup(unRrelatedGroups[i]);
            if (metrics) {
                for (var j = 0; j < metrics.length; j++) {
                    this.disableCheckboxbyId(metrics[j].hid);
                }
            }
        }

        for (i = 0; i < unRrelatedDimensions.length; i++) {
            var attributes = this.getAttributesByDimension(unRrelatedDimensions[i]);
            if (attributes) {
                for (j = 0; j < attributes.length; j++) {
                    this.disableCheckboxbyId(attributes[j].hid);
                }
            }
        }
    },

    getMetricsByGroup: function (groupId) {
        var metricGroups = this.options.app.dwRepository.metricGroups;
        for (var i = 0; i < metricGroups.length; i++) {
            if (metricGroups[i].id === groupId) {
                return metricGroups[i].metrics;
            }
        }
        return false;
    },

    getAttributesByDimension: function (dimName) {
        var dimension = this.options.app.dwRepository.dimensions[dimName];
        if (dimension) {
            return dimension.attributes;
        }
        return false;
    },

    enableCheckboxbyId: function (id) {
        $("input#" + id + ".object-selector").prop("disabled", false);
    },

    disableCheckboxbyId: function (id) {
        $("input#" + id + ".object-selector").prop("disabled", true);
    },

    // Synthetic Event: Our ReportDefinitionInfo model instance has changed...
    "{reportDefinitionInfoModel} updated": function (reportDefinitionInfoModel, ev) {
        // Update our name...
        this.$reportName.text(reportDefinitionInfoModel.name);

        //Update the original report
        if (this.originalReport) {
            this.originalReport.attr('showGrid', reportDefinitionInfoModel.attr('showGrid'));
            this.originalReport.attr('showChart', reportDefinitionInfoModel.attr('showChart'));
            this.originalReport.attr('definition', reportDefinitionInfoModel.attr('definition'));
            this.originalReport.attr('chartOptions', reportDefinitionInfoModel.attr('chartOptions'));
        }

        if (this.reportDefnModel) {
            this.reportDefnModel.isCleared = false;
        }

        this.pageRefreshed = false;
        var clonedReport = new Sentrana.Models.ReportDefinitionInfo(reportDefinitionInfoModel.attr());
        this.preserveTheCloneModel(clonedReport);
        this.isColumnDefinitionChanged = false;
    },

    // Synthetic Event: Our ReportDefinitionInfo model instance was just created...
    "{reportDefinitionInfoModel} created": function (reportDefinitionInfoModel, ev) {
        this.originalReport = reportDefinitionInfoModel;
        var clonedReport = new Sentrana.Models.ReportDefinitionInfo(reportDefinitionInfoModel.attr());

        // Link to the report...
        this.linkToReport(clonedReport);

        if (this.reportDefnModel) {
            this.reportDefnModel.isCleared = false;
        }
        this.pageRefreshed = false;
        // Tell the other page that a new report has been created...
        /* TODO: Removing this call given that the two-level nav is no longer in use.  this is causing a console error and no update is taking place.
         * Need to determine whether or not this is still needed.
         */
        // this.options.app.triggerNavBarPage("reporting", "saved", "new_report", [reportDefinitionInfoModel]);
    },

    // Synthetic Event: Our ReportDefinitionInfo model instance was just deleted...
    "{reportDefinitionInfoModel} destroyed": function (reportDefinitionInfoModel, ev) {
        this.resetBuilderPage();

    },

    // Synthetic Event: Our originalReportModel model instance was just deleted...
    "{originalReportModel} destroyed": function (originalReportModel, ev) {
        if (!this.pageRefreshed) {
            this.pageRefreshed = false;
            this.resetBuilderPage();
        }
    },

    inArray: function (val, items) {
        for (var i = 0; i < items.length; i++) {
            if (val === items[i]) {
                return true;
            }
        }
        return false;
    },

    "{window} resize": function (el, ev) {
        this.resizePivotControl();
    },

    " print_closed": function () {
        if ($('#saved').control()) {
            $('#saved').control().needToUpdateView = true;
        }
    }

});
