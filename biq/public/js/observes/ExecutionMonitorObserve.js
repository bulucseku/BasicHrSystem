can.Observe.extend("Sentrana.Models.ExecutionMonitor", {}, {
    // Constructor...
    init: function EMM_init(options) {
        this.setup({
            executionStatus: null,
            executionMessage: null,
            drillOptionsStatus: null,
            drillOptionsMessage: null,
            drillErrorCode: null,
            droppingCache: null,
            showGrid: true,
            showChart: true,
            localDataChangeStatus: null
        });

        // Define some instance fields...
        this.app = options.app;
        this.reportDefinModel = options.reportDefinModel;
        this.resultDataModel = options.resultDataModel;
        this.resultOptions = options.resultOptions;
        this.data = null;
        this.drillOptions = null;
        this.reportDefnStack = [];
        this.cacheIDStack = [];
        this.elemsStack = [];
        this.staticData = [];
        this.lastviewedReportDefinitionInfoModel = {};
        this.reportDefinModel.resultDataModel = this.resultDataModel;

        this.showGrid = options.showGrid;
        this.showChart = options.showChart;

        this.saveState = false;

    },

    // Instance method: Clear any data we have...
    clear: function EMM_clear() {
        this.data = null;
        this.drillOptions = null;
        this.reportDefnStack = [];
        this.cacheIDStack = [];
        this.elemsStack = [];
        this.staticData = [];
        this.attr("executionStatus", "STARTING");
    },

    setStaticData: function EMM_setStaticData(staticData) {
        this.staticData = staticData;
    },

    // Instance method: Save the Report Dataset Result data...
    saveData: function EMM_saveData(data) {
        this.data = data;
        if(this.saveState){
            this.resultDataModel.updateData(data, this.resultOptions, this.resultDataModel);
        }else{
            this.resultDataModel.updateData(data, this.resultOptions);
        }

    },

    // Instance method: Get the Report Dataset Result data...
    getData: function EMM_getData() {
        var data = this.resultDataModel.getResultData();
        if(data && data !== {}){
            return data;
        }else{
            return this.data;
        }
    },

    //Instance method: If column position is reorderd then update result data
    reorderColumnPos: function (fromIndex, toIndex) {
        if (this.data) {
            //reorder the columns
            var array = this.data.colInfos.splice(fromIndex, 1);
            this.data.colInfos.splice(toIndex, 0, array[0]);

            //reorder rows cells
            for (var i = 0; i < this.data.rows.length; i++) {
                var cellArray = this.data.rows[i].cells.splice(fromIndex, 1);
                this.data.rows[i].cells.splice(toIndex, 0, cellArray[0]);
            }
        }

        //change the property value to trigger the event. This change event
        //will be listened by the ReportChart and update the chart
        this.attr("colPosChanged", !this.attr("colPosChanged"));
    },

    // Instance method: Indicate the start of a local change to the data...
    startLocalDataChange: function EMM_startLocalDataChange() {
        this.attr("localDataChangeStatus", "STARTING");
    },

    // Instance method: Indicate the end of a local change to the data...
    endLocalDataChange: function EMM_endLocalDataChange(endStatus) {
        this.attr("localDataChangeStatus", endStatus);
    },

    // Instance method: Save the drill options data...
    saveDrillOptions: function EMM_saveDrillOptions(drillOptions) {
        this.drillOptions = drillOptions;
    },

    // Instance method: Get the drill options data...
    getDrillOptions: function EMM_getDrillOptions() {
        return this.drillOptions;
    },

    // Instance method: Drop a report cache...
    dropCache: function (cacheid) {
        var that = this;

        // Indicate that we are going to be dropping a cache...
        this.attr('droppingCache', cacheid);

        $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("DropCache", {
                cacheid: cacheid
            }),
            dataType: "json",
            success: function (data) {
                if (!data || !data.success) {
                    that.attr('droppingCache', 'FAILURE');
                }
                else {
                    that.removeAttr('droppingCache');
                }
            }
        });
    },

    // Instance method: Store the report definition object and cache ID, as per the operation parameter...
    storeReportData: function EMM_storeReportData(reportDefn, cacheID, elems, rsOp, numPop) {
        switch (rsOp) {
        case 'CLEAR':
            this.reportDefnStack = [reportDefn];
            this.cacheIDStack = [cacheID];
            this.elemsStack = [{
                elems: elems
            }];
            break;
        case 'PUSH':
            this.reportDefnStack.push(reportDefn);
            this.cacheIDStack.push(cacheID);
            this.elemsStack.push({
                elems: elems
            });
            break;
        case 'POP':
            for (var i = 0; i < numPop; i++) {
                this.reportDefnStack.pop();
                this.cacheIDStack.pop();
                this.elemsStack.pop();
            }
            break;
        default:
            break;
        }
    },

    // Instance method: Return the top (last added) cache ID...
    peekCacheID: function EMM_peekCacheID() {
        return this.cacheIDStack[this.cacheIDStack.length - 1];
    },

    getDrillOptionsFromService: function (params, that, drillUp, sourceEvent) {
        // Make the Ajax call...
        $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("GetDrillOptions", params),
            asynch: true,
            dataType: "json",
            success: function (data) {
                // Are we without any data?
                if (!data) {
                    that.attr("drillOptionsMessage", Sentrana.getMessageText(window.app_resources.app_msg.drill_down.options.no_data_returned));
                    //No data returned
                    that.attr("drillErrorCode", Sentrana.Enums.ErrorCode.NO_DATA_RETURNED);
                    that.attr("drillOptionsStatus", "FAILURE");
                }
                else if (data.exptMsg) {
                    that.attr("drillOptionsMessage", data.exptMsg);
                    that.attr("drillErrorCode", data.errorCode);
                    that.attr("drillOptionsStatus", "FAILURE");
                }
                else if (!data.opts || data.opts.length === 0) {
                    // Save our drill options...
                    that.saveDrillOptions({
                        drillUp: drillUp,
                        sourceEvent: sourceEvent
                    });

                    // Indicate that we have successfully retrieved drill options...
                    that.attr("drillOptionsStatus", "SUCCESS");
                }
                else {
                    // Save our drill options...
                    that.saveDrillOptions({
                        drillUp: drillUp,
                        drillDown: data,
                        sourceEvent: sourceEvent
                    });

                    // Indicate that we have successfully retrieved drill options...
                    that.attr("drillOptionsStatus", "SUCCESS");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Dave our drill options...
                that.saveDrillOptions({
                    drillUp: drillUp,
                    sourceEvent: sourceEvent
                });

                // Indicate that we have failed to retrieve drill options...
                that.attr("drillOptionsStatus", "FAILURE");
                //Service Error
                that.attr("drillErrorCode", Sentrana.Enums.ErrorCode.SERVICE_ERROR_OCCURRED);
            }
        });
    },

    isDrillRollUpAllowed: function EMM_isDrillRollUpAllowed() {

        if ((this.lastviewedReportDefinitionInfoModel.totalsOn == undefined ? false : this.lastviewedReportDefinitionInfoModel.totalsOn) != (this.reportDefinModel.totalsOn == undefined ? false : this.reportDefinModel.totalsOn)) {
            return false;
        }
        else {
            return true;
        }
    },

    isReportDefinitionChanged: function () {
        // Fixed by Sheng 7/13/2015. _backupStore is now a method in CanJS 2.2.6.
        var old = this.lastviewedReportDefinitionInfoModel._backupStore(),
            oldDimensions = old.filterDims,
            oldTemplateUnit = old.templateUnits,
            newDimensions = this.lastviewedReportDefinitionInfoModel.filterDims.attr(),
            newTemplateUnit = this.lastviewedReportDefinitionInfoModel.templateUnits.attr();

        for (var dimension in oldDimensions) { // Dimesions are same for both old and new
            var oldFilter = oldDimensions[dimension],
                newFilter = newDimensions[dimension];
            if (!this.isTwoColumnSame(oldFilter, newFilter)) {
                return true;
            }
        }

        if (!this.isTwoColumnSame(oldTemplateUnit, newTemplateUnit)) {
            return true;
        }

        return false;
    },

    isTwoColumnSame: function (oldColumn, newColumn) {
        if (oldColumn.length !== newColumn.length) {
            return false;
        }

        for (var i = 0; i < oldColumn.length; i++) {
            if (oldColumn[i].hid !== newColumn[i].hid) {
                return false;
            }
        }

        return true;
    },

    requestDrillMenu: function EMM_requestDrillMenu(elems, sourceEvent, chartControl) {
        if (!this.isDrillable()) {
            return;
        }
        var that = this;
        if (this.isReportDefinitionChanged()) {
            Sentrana.ConfirmDialog("Confirm drill down", window.app_resources.app_msg.drill_down.report_defintion_changed_confirm_drill, function () {
                that.requestDrillOptions(elems, sourceEvent, chartControl);
            });
        }
        else {
            this.requestDrillOptions(elems, sourceEvent, chartControl);
        }
    },

    isDrillable: function () {
        if ((!this || this.reportDefnStack.length <= 1) && (!this.data || !this.data.drillable)) {
            return false;
        }

        return true;
    },

    // Instance method: Retrieve drill down information for the drill menu...
    requestDrillOptions: function EMM_requestDrillOptions(elems, sourceEvent, chartControl) {
        var that = this;

        if (!this.isDrillable()) {
            return;
        }

        if (!this.isDrillRollUpAllowed()) {
            return;
        }

        $(sourceEvent.currentTarget).addClass('highlight-row');

        // Indicate that we are starting to collect drill options...
        this.attr("drillOptionsStatus", "STARTING");

        // Ask the ReportDefinition model to filter these elements, add object IDs...
        elems = this.reportDefinModel.filterElements(elems, chartControl);

        // If there are no elements, no need to collect information from the server...
        var drillUp = this.reportDefnStack.length > 1;

        // Save our drill options...
        this.saveDrillOptions({
            drillUp: drillUp,
            sourceEvent: sourceEvent
        });

        if (elems.length === 0 || (drillUp && !this.data.drillable)) {
            // Inform the listeners that we have drill options ready...
            this.attr("drillOptionsStatus", "SUCCESS");
            return;
        }

        this.attr("drillOptionsStatus", "SHOWPOPUP");

        // Construct the list of selected elements...
        var selectedElements = [];
        for (var i = 0, l = elems.length; i < l; i++) {
            var elem = elems[i];
            selectedElements.push(elem.elemOID);
        }

        // Construct the list of parameters...
        var params = {
            cacheid: this.peekCacheID(),
            sElems: selectedElements.join("|")
        };

        this.getDrillOptionsFromService(params, that, drillUp, sourceEvent);
    },

    // Instance method: Render the specified report defintion and execute it!
    renderAndExecuteReport: function EMM_renderAndExecuteReport(report, eInfos, rsOp, numPop) {
        // Render the report definition...
        this.reportDefinModel.setDefn(this.checkSavedFilter(report), eInfos);

        // Execute the report...
        this.executeReportUsingDefnParams(report, rsOp, eInfos, numPop);
    },

    checkSavedFilter: function (report) {
        var filters = report.filter.split('|'), updatedFilters = [];
        var oldParams = this.reportDefinModel.getReportDefinitionParameters();
        var filterGroups = this.reportDefinModel.filterDims["GroupedFilter"];

        for (var i = 0; i < filterGroups.length; i++) {
            var filterGroup = this.app.dwRepository.objectMap[filterGroups[i].hid];
            var saveFilter = this.createSavedFilterDef(filterGroup)
            updatedFilters.push(saveFilter);

            for (var i = 0; i < filterGroup.filters.length; i++) {
                var index = this.getFilterIndex(filters, filterGroup.filters[i].oid);
                if (index > -1) {
                    filters.splice(index, 1);
                }
            }
        }

        for (var i = 0; i < filters.length; i++) {
            updatedFilters.push(filters[i]);
        }

        report.filter = updatedFilters.join("|");
        return report;
    },

    getFilterIndex: function (filters, filterId) {
        for (var i = 0; i < filters.length; i++) {
            if (filters[i] === filterId) {
                return i;
            }
        }

        return -1;
    },

    createSavedFilterDef: function (filterGroup) {
        var value = filterGroup.id, isSaved = "true";
        if (!value) {
            isSaved = "false"
            value = filterGroup.filters.map(function (f) {
                return f.oid;
            }).join("&");
        }

        return "type@GroupedFilter, name@" + filterGroup.name + ", isSaved@" + isSaved + ", value@" + value;
    },


    // Instance method: Drill up in the current drill path
    drillUp: function EMM_drillUp() {
        // Get the parent report definition on the report definition stack...
        var params = this.reportDefnStack[this.reportDefnStack.length - 2];

        // Render and execute the report...
        this.renderAndExecuteReport(params, undefined, 'POP', 1);
    },

    // Instance method: Drill down deeper in the drill path
    drillDown: function EMM_drillDown(params, eInfos) {
        // Render and execute the report...
        this.renderAndExecuteReport(params, eInfos, 'PUSH');
    },

    // Instance method: Re-execute a previous base report in the current drill path...
    executeDrillBaseReport: function EMM_executeDrillBaseReport(dpIndex) {

        if (!this.isDrillRollUpAllowed()) {
            return;
        }

        // Render and execute the report...
        var params = this.reportDefnStack[dpIndex],
            numPop = this.reportDefnStack.length - dpIndex - 1;

        this.renderAndExecuteReport(params, undefined, 'POP', numPop);
    },

    // Instance method: Get the current drill path...
    getDrillPath: function EMM_getDrillPath() {
        // Do we have an element stack greater than 1 (reflects a drill)?
        if (this.elemsStack && this.elemsStack.length > 1) {
            // Construct an initial array of drill path info objects...
            var dpInfos = [{
                elems: "Base",
                dpIndex: 0
            }];

            // Loop through the remaining element arrays in the stack...
            for (var i = 1, l = this.elemsStack.length; i < l; i++) {
                // Loop through the list of elements...
                var elemNames = [];
                for (var j = 0, m = this.elemsStack[i].elems.length; j < m; j++) {
                    // Get each element info...
                    var eInfo = this.elemsStack[i].elems[j];
                    // Construct a name which includes the attribute name...
                    elemNames.push(eInfo.actualName);
                }
                // Add to our drill path array...
                dpInfos.push({
                    elems: elemNames.join(', '),
                    dpIndex: i
                });
            }

            return dpInfos;
        }
    },

    // Instance method: Cancel the last XHR call made for report execution, drilling...
    cancelExecutionDrillingCall: function EMM_cancelExecutionDrillingCall() {
        if (this.lastExecuteDrillXhr) {
            this.lastExecuteDrillXhr.abort();
            this.lastExecuteDrillXhr = null;
        }
    },

    // Instance method: Update the elapsed execution time...
    updateElapsedTime: function EMM_updateElapsedTime() {
        // How many seconds have elapsed?
        var allMillis = new Date().valueOf() - this.startTimeMillis,
            allSeconds = Math.floor(allMillis / 1000),
            nmins = Math.floor(allSeconds / 60),
            nsecs = Math.floor(allSeconds - nmins * 60),
            zsecs = "0" + nsecs,
            nMillis = allMillis - nmins * 60000 - nsecs * 1000,
            zMillis = "00" + nMillis;

        this.attr("elapsedTimeStr", nmins + ":" + zsecs.substr(zsecs.length - 2) + "." + zMillis.substr(zMillis.length - 3));
    },

    handleExecReportSuccess: function (data, params, eInfos, rsOp, numPop) {
        // Save the data...
        this.saveData(data);

        // Interrogate the data returned...
        if (!data || !data.rows) {
            this.attr("executionMessage", Sentrana.getMessageText(window.app_resources.app_msg.report_execution.no_data_returned));
            this.attr("numRowsMessage", "");
            this.attr("executionStatus", "FAILURE");
        }
        else if (data.exptMsg) {
            this.attr("executionMessage", Sentrana.getMessageText(window.app_resources.app_msg.report_execution.report_error));
            this.attr("numRowsMessage", "");
            this.attr("executionStatus", "FAILURE");
        }
        else if (!data.rows.length) {

            this.storeReportData(params, data.cacheid, eInfos, rsOp, numPop);
            this.attr("executionMessage", Sentrana.getMessageText(window.app_resources.app_msg.report_execution.success_with_no_data));
            this.attr("numRowsMessage", "");
            this.attr("executionStatus", "FAILURE");
        }
        else {

            // Process the report data...
            this.storeReportData(params, data.cacheid, eInfos, rsOp, numPop);
            // Indicate status change...
            this.attr("executionMessage", Sentrana.getMessageText(window.app_resources.app_msg.report_execution.success));
            this.attr("numRowsMessage", "Rows: " + Sentrana.formatValue(data.rows.length, "number"));
            this.attr("executionStatus", "SUCCESS");
            if (rsOp !== "CLEAR") {
                this.attr("executionStatusDrilldown", "");
                this.attr("executionStatusDrilldown", "SUCCESS");
            }
        }
    },

    handleExecReportError: function (jqXHR, textStatus) {
        // Was it a likely JSON limit?
        var data = {},
            errorMsg = jqXHR.getResponseHeader("ErrorMsg");

        // TODO We need specific (numeric) error codes to handle this better...
        if (errorMsg) {
            data.exptMsg = errorMsg;
        }
        else if (textStatus === "abort") {
            data.exptMsg = Sentrana.getMessageText(window.app_resources.app_msg.report_execution.canceled_by_user);
        }
        else {
            data.exptMsg = Sentrana.getMessageText(window.app_resources.app_msg.report_execution.large_dataset);
        }

        // Save the data...
        this.saveData(data);

        // Indicate status change...
        this.attr("executionMessage", Sentrana.getMessageText(window.app_resources.app_msg.report_execution.failed));
        this.attr("numRowsMessage", "");
        this.attr("executionStatus", "FAILURE");
    },

    handleExecReportComplete: function () {
        this.reportDefinModel.attr("canReset", true);
        this.lastExecuteDrillXhr = null;
        window.clearInterval(this.intervalID);
        this.updateElapsedTime();
    },

    updateDefinitionForSavedFilter: function (reportParams) {
        var filters = reportParams.filter.split("|");
        for (var i = 0; i < filters.length; i++) {
            var savedFilters = [];
            var savedFilterGroup = this.app.dwRepository.isSavedFilterGroup(filters[i]);
            if (savedFilterGroup) {
                for (var j = 0; j < savedFilterGroup.filters.length; j++) {
                    savedFilters.push(savedFilterGroup.filters[j].oid);
                }
                filters[i] = savedFilters.join("|");
            }
            reportParams.filter = filters.join("|");
        }
        return reportParams;
    },
    
    // Instance method: Execute a report using the specified report parameters, selected elements...
    executeReportUsingDefnParams: function EMM_executeReportUsingDefnParams(params, rsOp, eInfos, numPop) {
        var that = this;
        params = this.updateDefinitionForSavedFilter(params);

        this.lastviewedReportDefinitionInfoModel = new can.Map({
            filterDims: this.reportDefinModel.attr("filterDims"),
            templateUnits: this.reportDefinModel.attr("templateUnits"),
            totalsOn: this.reportDefinModel.attr("totalsOn") == undefined ? false : this.reportDefinModel.attr("totalsOn")
        });
        this.loadTemplateAttributeForms(params.template);
        this.lastviewedReportDefinitionInfoModel.backup();

        // Disable the VIEW, RESET buttons...
        this.reportDefinModel.attr("canView", false);
        this.reportDefinModel.attr("canReset", false);

        // HACK?: Force report parameters to include the repository id.
        params.repositoryid = this.app.getDWRepository().id;

        if (params) {
            // Indicate that the execution is starting!
            this.attr("executionStatus", "STARTING");

            // Record the start time...
            this.startTimeMillis = new Date().valueOf();

            // Update the elapsed time to show 0:00.000
            this.attr("elapsedTimeStr", "0:00.000");

            // Start an interval timer to record elapsed time...
            this.intervalID = window.setInterval(this.proxy("updateElapsedTime"), 250);

            // Make the Ajax call...
            this.lastExecuteDrillXhr = $.ajax({
                type: "POST",
                url: Sentrana.Controllers.BIQController.generateUrl("Execute"),
                asynch: true,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({
                    template: params.template,
                    filter: params.filter,
                    totals: params.totals,
                    sort: params.sort
                }),
                headers: {
                    sessionID: params.sessionid,
                    repositoryID: params.repositoryid
                },
                success: function (data) {
                    that.handleExecReportSuccess(data, params, eInfos, rsOp, numPop);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    that.handleExecReportError(jqXHR, textStatus);
                },
                complete: function (jqXHR, textStatus) {
                    that.handleExecReportComplete();
                }
            });
        }
    },

    loadTemplateAttributeForms: function (templates) {
        var that = this;

        var dwRepository = this.app.dwRepository;
        var parts = templates.split("|");

        // Modify each part...
        $.map(parts, function (part, i) {
            var formHID = dwRepository.getObjectByOID(parts[0]).hid,
                form = dwRepository.objectMap[formHID];
            if (form.type && form.type == 'ATTRIBUTE_FORM')
                dwRepository.checkLoadedForm(form, function () {});
        });
    }

});
