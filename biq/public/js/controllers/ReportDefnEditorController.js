can.Control.extend("Sentrana.Controllers.ReportDefinEditor", {
    pluginName: 'sentrana_report_defin_editor'
}, {

    // Constructor...
    init: function RDE_init() {
        var that = this;

        // Instance fields...
        this.app = this.options.app;

        // Find our DOM Elements...
        this.$resetButton = this.element.find(".clear-button");
        this.$viewButton = this.element.find(".view-button");
        this.$saveButton = this.element.find(".save-button");
        this.$saveAsButton = this.element.find(".save-as-button");
        this.$shareButton = this.element.find(".share-button");
        this.$reportZone = this.element.find(".report-zone");
        this.$actionBar = this.element.find(".panel-footer");
        this.$actionButtonContainer = this.element.find(".actionButtonContainer");
        this.$pivotButton = this.element.find(".pivot-button");
        // Render specific elements as buttons...
        $("button", this.element).button();

        //Hide the totals
        $('.show-total').hide();
    },

    // Instance Method: Show or hide an element based on a supplied boolean property...
    showHideElement: function RDE_showHideElement(el, show) {
        el[(show) ? "show" : "hide"]();
    },

    // Instance method: Clean up the template units row...
    cleanTemplateUnitsRow: function RDE_cleanTemplateUnitsRow() {
        // Are there no template units?
        if (this.options.reportDefnModel.templateUnits.length === 0) {
            // Is the filter empty?
            if (this.options.reportDefnModel.filterEmpty()) {
                this.renderReportZone();
            }
            else {
                this.hideColumnDefn();
            }
        }
    },

    // Instance method: Clean up a specific filter dimension row...	
    cleanFilterDimRow: function RDE_cleanFilterDimRow(dimName) {
        // Are there other units in this dimension?
        if (this.options.reportDefnModel.filterDims[dimName].length > 0) {
            // There is nothing to do--the filter DIV must remain...
            return;
        }

        // Is the filter and the template empty?
        if (this.empty()) {
            // Clear the entire table...
            this.renderReportZone();
            return;
        }

        var $tr = this.$reportZone.find('.dim[dimname="' + dimName + '"]').parents("tr"),
            $td = $tr.find("td:nth-child(1)"),
            tdText = $td.text(),
            tdHtml = $td.html();

        // Remove the row that simply identifies the dimension...
        $tr.remove();

        // Was there nothing in the first cell of the deleted row?
        if (tdText === "" || this.options.reportDefnModel.filterEmpty()) {
            return;
        }

        // Find the row index...
        var trIndex = 3,
            $newTr = this.$reportZone.find("tr:nth-child(" + trIndex + ")");

        // Does the row exist?
        $newTr.find("td:nth-child(1)").html(tdHtml);
    },

    // Instance method: Is our report empty?
    empty: function RDE_empty() {
        return !this.options.reportDefnModel.templateUnits.length && this.options.reportDefnModel.filterEmpty();
    },

    // Instance method: render the empty table...
    renderReportZone: function RDE_renderReportZone() {
        // Construct the HTML...
        this.$reportZone.html(can.view('templates/reportZone.ejs', {
            showTotals: !!this.totalsOn
        }));
        this.$reportZone.show();
        this.ensureTemplateUnitsRow();
        this.hideColumnDefn();
    },

    // Instance method: Either disable (or remain enabled) the view and clear buttons...
    enableOrDisableButtons: function RDE_enableOrDisableButtons() {
        var empty = this.empty();
        // Hide or show the navbar and report zone...
        if (empty) {
            this.$actionBar.hide();
            this.renderReportZone();
        }
        else {
            this.$reportZone.fadeIn();
            this.$actionBar.show();
            this.showHideButtons();
        }
    },

    showHideButtons: function () {
        this.showAllButtons();
        if (this.options.parent.reportIsRunning) {
            this.showOnlyViewButtons();
        }
    },

    showAllButtons: function () {
        this.$actionButtonContainer.find("button").show();

        if (this.app.dwRepository.isAttributeOnlyRepositry()) {
            this.$pivotButton.hide();
        }

        if (!this.options.reportDefnModel.savedReport) {
            this.$saveAsButton.hide();
            this.$shareButton.hide();
        }
    },

    showOnlyViewButtons: function () {
        this.$actionButtonContainer.find("button").hide();
        this.$viewButton.show();
    },

    clearSaveConfirmationMessage: function RDE_clearSaveConfirmationMessage() {
        $('.save-execution-message').text('');
    },

    // Instance method: Ensure we have a top-level table to hold our report definition...
    ensureTable: function RDE_ensureTable() {
        if (this.$reportZone.find("table").length === 0) {
            this.renderReportZone();
        }
    },

    hideColumnDefn: function () {
        $('.formula-column-button').css('margin-bottom', '5px');
        this.$reportZone.find('.template-units').closest('tr').find('.label').hide();
        this.$reportZone.find('.hr-under-columns').hide();
    },

    showColumnDefn: function () {
        $('.formula-column-button').css('margin-bottom', '0px');
        this.$reportZone.find('.template-units').closest('tr').find('.label').show();
        this.$reportZone.find('.hr-under-columns').show();
    },

    // Instance method: Ensure that we have a template units row in the table...
    ensureTemplateUnitsRow: function RDE_ensureTemplateUnitsRow() {
        // Ensure that we have a table first...
        this.ensureTable();

        // Do we have a template units row?
        if (this.$reportZone.find(".template-units").length === 0) {
            // Insert this as the first ROW of the TBODY...
            this.$reportZone.find("tbody").prepend(can.view('templates/templateUnitsRow.ejs', {}));
            // Update our jQuery object...
            this.$templateUnits = this.$reportZone.find(".template-units");
            this.makeTemplateUnitSortable();
        }
    },

    // Instance method: Ensure we have a specific filter dimension row
    ensureFilterDimRow: function RDE_ensureFilterDimRow(dimName) {
        // Ensure that we have a table first...
        this.ensureTable();

        // Are we without the specified filter dimension row?
        if (this.$reportZone.find('.dim[dimname="' + dimName + '"]').length === 0) {
            // Do we have any filter dimension rows?
            var col1Text = (this.$reportZone.find(".dim").length === 0) ? "FILTER:" : "";

            // Add this to the end of the TBODY...
            this.$reportZone.find("tbody").append(can.view('templates/filterUnitsRow.ejs', {
                col1Text: col1Text,
                dimName: dimName
            }));
        }
    },

    makeTemplateUnitSortable: function () {
        var that = this;
        // Make the template units "sortable"
        this.$templateUnits.sortable({
            containment: ".report-zone",
            opacity: 0.75,
            forcePlaceholderSize: true,
            helper: 'clone',
            placeholder: "tu-placeholder",
            revert: 100,
            stop: function (event, data) {
                var htmlid = data.item.attr('hid'),
                    templateUnits = that.options.reportDefnModel.templateUnits;

                // Loop through the model's list of template units...
                for (var i = 0, l = templateUnits.length; i < l; i++) {
                    // Are we looking at the moved object?
                    if (templateUnits[i].hid === htmlid) {
                        // Find all rendered UI elements (in the now sorted order)...
                        var tus = $(".tu", this);
                        // Loop through them...
                        for (var j = 0, m = tus.length; j < m; j++) {
                            // Have we found the moved template unit in its new position?
                            if ($(tus[j]).attr('hid') === htmlid) {
                                // Ask the Model to move the template unit...
                                that.options.reportDefnModel.moveTemplateUnit(i, j);
                                
                                that.options.parent.updateResultDefinition();
                                
                                return;
                            }
                        }

                    }
                }
            }
        });
    },

    // Browser Event: What to do when the user clicks on the TOTALS button...
    ".show-totals click": function (el, ev) {
        var selected = el.hasClass("option-button-on");
        this.options.reportDefnModel.setTotals(!selected);
    },

    // Browser Event: What to do when the user clicks on the TOTALS button...
    "#chk-show-total change": function (el, ev) {
        this.options.reportDefnModel.setTotals($(el).is(':checked'));
    },

    ".pivot-button click": function (el, ev) {
        if (!this.options.parent.validatePivotData()) {
            Sentrana.AlertDialog("Not enough columns selected.", "Please select two or more attributes and at least one or more metric columns to see the pivot analysis.");
            return;
        }

        if (this.options.parent.reportDefinitionChanged) {
            this.options.parent.showPivotAnalysis = true;
            this.executeReport(el, ev);
        }
        else {
            this.element.trigger("show_pivot_analysis");
        }
    },

    // Browser Event: Handle the Clear button...
    ".clear-button click": function (el, ev) {

        if ($(".pivot-table-element").control()) {
            $(".pivot-table-element").control().destroy();
        }
        $(".pivot-table-element").html('');

        var that = this;
        if ($(el).text() === 'RESET') {
            that.options.reportDefnModel.clear();
            that.element.trigger("reset_report");
        }
        else {
            if (this.options.parent.isChangesMade()) {
                var userInfo = this.options.app.retrieveUserInfo();
                if (!userInfo || !userInfo.sessionId) {
                    return;
                }

                Sentrana.ConfirmDialogYNC(Sentrana.getMessageText(window.app_resources.app_msg.save_changes.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.save_changes.dialog_msg, this.options.parent.options.reportDefinitionInfoModel.name),
                    function callBackForYes() {
                        if (!that.options.parent.executionSuccessful) {
                            Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.report_definition.execution.required_dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.report_definition.execution.required_dialog_msg));
                            return;
                        }
                        that.element.trigger("save_report", {
                            resetPage: true
                        });
                    }, function callBackForNo() {
                        that.options.reportDefnModel.clear();
                        that.element.trigger("reset_report");
                    }, function callBack4Cancel() {
                        return;
                    }, true);
            }
            else {
                that.options.reportDefnModel.clear();
                that.element.trigger("reset_report");
            }
        }
    },

    // Browser Event: Handle the View button...
    ".view-button click": function (el, ev) {
        this.executeReport(el, ev);
    },

    executeReport: function (el, ev) {
        //action log
        var actionLog = {
            ActionName: Sentrana.ActionLog.ActionNames.ViewReport,
            Context: Sentrana.ActionLog.Contexts.BuilderPage,
            ElementType: Sentrana.ActionLog.ElementTypes.Report
        };

        this.options.app.writeActionLog(actionLog);

        //TODO: this seems to be a merge issue.  Button is default set to disabled?
        // Is the button disabled?
        //if (el.button("option", "disabled")) {
        //     return;
        // }

        var userInfo = this.options.app.retrieveUserInfo();
        if (!userInfo || !userInfo.sessionId) {
            return;
        }

        // Is the report definition (or template) empty?
        if (this.empty() || !this.options.reportDefnModel.templateUnits.length) {
            Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.report_definition.validation.column.required_dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.report_definition.validation.column.required_dialog_msg));
            return;
        }

        // Are elements from all required attributes selected?
        var missingAttributes = this.options.reportDefnModel.missingRequiredAttributes();
        if (missingAttributes.length !== 0) {
            var missingAttributeNames = $.map(missingAttributes, function (attr) {
                return attr.name;
            }).join("\n");
            Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.report_definition.validation.element.required_dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.report_definition.validation.element.required_dialog_msg, missingAttributeNames));
            ev.stopPropagation();
            return;
        }

        // Raise an event indicating that the user wants to execute 
        this.element.trigger("execute_report_by_defn", [this.options.reportDefnModel.getReportDefinitionParameters(true), "CLEAR", null]);
    },

    ".save-button click": function (el, ev) {
        this.element.trigger("save_report");
    },

    ".save-as-button click": function (el, ev) {
        this.element.trigger("save_as_report");
    },

    ".share-button click": function (el, ev) {
        this.options.parent.shareReport();
    },

    templateUnitAdded: function (reportDefnModel, parts, attr) {
        var tu, $divObject, object;
        // Get our template unit instance...
        tu = reportDefnModel.attr(attr);

        var index = parseInt(parts[1], 10);

        // Ensure that we have a template row to host a template unit!
        this.ensureTemplateUnitsRow();

        // First, determine the template unit that we are performing the operation against...
        var tuDivs = this.element.find(".tu"),
            div = (tuDivs.length === 0) ? this.$templateUnits : ((index < tuDivs.length) ? $(tuDivs[index]) : $(tuDivs[tuDivs.length - 1])),
            renderFn = (tuDivs.length === 0) ? "prepend" : ((index < tuDivs.length) ? "before" : "after");

        var aggTypes = this.app.getDWRepository().Aggregationtypes,
            param = {
                name: tu.name,
                type: tu.type,
                hid: tu.hid,
                pos: tu.sortPos,
                forms: tu.forms,
                selectedForms: tu.selectedForms,
                isDerivedColumn: false,
                aggTypes: aggTypes,
                oid: tu.oid,
                aggType: tu.aggType,
                operation: tu.operation,
                showOnlyWhen: true,
                showTransform: true,
                showAggregate: true
            };

        if (tu.type === "METRIC") {
            if (tu.formula) {
                param.isDerivedColumn = true;
                param.showAggregate = false;
                if (this.getFormulaType(tu) === "CM") {
                    param.showTransform = false;
                }
                else {
                    param.showOnlyWhen = false;
                }
            }
            else {

                if (tu.subtype === "FILTERED") {
                    param.showTransform = false;
                }

                if (tu.operation === 'Sum') {
                    param.showAggregate = true;
                }
            }
        }
        else {
            param.showTransform = false;
            param.showOnlyWhen = false;
            param.showAggregate = false;
        }

        param.isExpandableHeader = this.isExpandableHeader(tu);

        div[renderFn](can.view('templates/templateUnit.ejs', param));

        // Get the DIV that contains the unit..
        $divObject = this.element.find('.tu[hid="' + tu.hid + '"]');

        // Associate with a controller...
        $divObject.sentrana_template_unit({
            ruModel: tu,
            rdModel: reportDefnModel,
            builderPageController: this.options.parent,
            isExpandableHeader: param.isExpandableHeader
        });

        this.ExpandReportDefinitionArea();
    },

    ExpandReportDefinitionArea: function () {
        var element = this.options.parent.element;
        if (!element.find('.report-zone-collapsibleContainer').is(":visible")) {
            element.find('.indicator').toggleClass("fa-minus-square fa-plus-square");
            element.find(".report-zone-collapsibleContainer").slideToggle('normal');
        }
    },

    isExpandableHeader: function (tu) {
        if (tu.type === "ATTRIBUTE" && tu.forms.length === 1) {
            return false;
        }
        return true;
    },

    getFormulaType: function (tu) {
        if (tu.elementHID && tu.elementHID.length > 0) {
            return "CM";
        }

        return "DM";
    },

    templateUnitRemoved: function (oldVal) {
        var i, l = oldVal.length,
            tu;

        for (i = 0; i < l; i++) {
            tu = oldVal[i];

            // Remove the template unit from the UI...
            this.element.find('.tu[hid="' + tu.hid + '"]').remove();
        }

        // Clean up the table...
        this.cleanTemplateUnitsRow();
    },

    filterDimensionAdded: function (reportDefnModel, newVal, parts) {
        var $divObject, object, fu;
        // Get our filter unit instance...
        fu = newVal[0];
        object = this.app.getDWRepository().objectMap[fu.hid];

        var isFiltered = false;
        if (object.dataFilterOperator) {
            switch (object.dataFilterOperator.toUpperCase()) {
            case "IN":
                if (object.isFilteredByDataFilter === false) {
                    isFiltered = true;
                }
                break;
            case "NOT IN":
                if (object.isFilteredByDataFilter === true) {
                    isFiltered = true;
                }
                break;
            default:
                break;
            }
        }

        var dimName = parts[1];

        // Ensure that we have a row to store the filter unit...
        this.ensureFilterDimRow(dimName);
        var isFiterGroup = object.dimName === "GroupedFilter";
        // Show it in the filter...
        $('.dim[dimname="' + dimName + '"]').append(can.view('templates/filterUnit.ejs', {
            name: object.name,
            hid: fu.hid,
            dim: dimName,
            filtered: isFiltered,
            isFiterGroup: isFiterGroup
        }));

        // Get the DIV that contains the unit..
        $divObject = this.element.find('.fu[hid="' + fu.hid + '"]');

        // Associate with a controller...
        $divObject.sentrana_report_unit({
            ruModel: fu,
            rdModel: reportDefnModel,
            object: object
        });

        this.ExpandReportDefinitionArea();
    },

    filterDimensionRemoved: function (oldVal, parts) {
        var i, l = oldVal.length,
            fu;
        for (i = 0; i < l; i++) {
            fu = oldVal[i];
            // Remove the filter unit from the UI...
            this.element.find('.fu[hid="' + fu.hid + '"]').remove();
        }

        // Clean up the filter dimension row...
        this.cleanFilterDimRow(parts[1]);
    },

    // Synthetic Event: What to do when the model changes...	
    "{reportDefnModel} change": function (reportDefnModel, ev, attr, how, newVal, oldVal) {
        // Split the path to the attribute down into its parts...
        var parts = attr.split(".");
        this.clearSaveConfirmationMessage();

        // What is the highest level path element?
        switch (parts[0]) {
        case "canReset":
            if (how === "add" || how === "set") {
                this.$resetButton[!newVal ? "addClass" : "removeClass"]('disabled');
            }
            break;
        case "canView":
            if (how === "add" || how === "set") {
                this.$viewButton[!newVal ? "addClass" : "removeClass"]('disabled');
            }
            break;
        case "canSave":
            if (how === "add" || how === "set") {
                this.$saveButton[!newVal ? "addClass" : "removeClass"]('disabled');
                this.$saveAsButton[!newVal ? "addClass" : "removeClass"]('disabled');
                this.$shareButton[!newVal ? "addClass" : "removeClass"]('disabled');
            }
            break;
        case "savedReport":
            // We are only looking for add and set (not remove)
            if (how === "add" || how === "set") {
                this.$resetButton.text(newVal ? "CLOSE" : "CLEAR");
                (newVal) ? this.$saveAsButton.css('display', 'inline-block') : this.$saveAsButton.css('display', 'none');
                (newVal) ? this.$shareButton.css('display', 'inline-block') : this.$shareButton.css('display', 'none');
            }
            break;
        case "totalsOn":
            // We are only looking for add and set (not remove)
            if (how === "add" || how === "set") {
                $('#chk-show-total').prop('checked', newVal);
            }

            //Before saving make sure we can generate the report with total changes
            this.options.parent.executionSuccessful = false;
            break;
        case "templateUnits":
            var changedTu;
            if (how === "add" && parts.length === 2) {
                this.templateUnitAdded(reportDefnModel, parts, attr);
                changedTu = reportDefnModel.attr(attr);
                this.options.parent.updateResultDefinition();
            }
            else if (how === "remove") {
                this.templateUnitRemoved(oldVal);
                if (oldVal.length === 1) {
                    changedTu = oldVal[0];
                }
            }

            if (this.options.reportDefnModel.templateUnits.length > 0) {
                this.showColumnDefn();
            }
            else {
                this.hideColumnDefn();
            }

            this.options.parent.executionSuccessful = false;
            this.element.trigger("apply_mteric_dimension_mapping", {
                reportDefnModel: this.options.reportDefnModel,
                newTu: changedTu,
                changeType: how
            });
            break;
        case "filterDims":
            if (how === "add" && parts.length == 3) {
                this.filterDimensionAdded(reportDefnModel, newVal, parts);
            }
            else if (how === "remove") {
                this.filterDimensionRemoved(oldVal, parts);
            }

            if (this.options.reportDefnModel.filterEmpty()) {
                $('.hr-under-filter').css('display', 'none');
            }
            else {
                $('.hr-under-filter').css('display', 'block');
            }

            this.options.parent.executionSuccessful = false;

            break;
        default:
            break;
        }

        // Enable or disable buttons, hide/show the report zone...
        this.enableOrDisableButtons();
    }
});
