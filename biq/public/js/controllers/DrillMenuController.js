can.Control.extend("Sentrana.Controllers.DrillMenu", {

    pluginName: 'sentrana_drill_menu',
    defaults: {
        executionMonitorModel: null
    }
}, {
    init: function DM_init() {
        // Define our jQuery Objects...
        this.$drillMenuSel = this.element.find(".selection");
        this.$drillUp = this.element.find(".drill-up");
        this.$drillDown = this.element.find(".drill-down");
        this.$drillDownTo = this.element.find(".drill-down-to");
        this.unCheckedOptions = {};
    },

    // Browser Event: What to do when the mouse leaves the pop-up drill menu...
    "mouseleave": function (el, ev) {
        var drillOptions = this.options.executionMonitorModel.getDrillOptions();
        $(drillOptions.sourceEvent.currentTarget).removeClass('highlight-row');
        $(el).hide();
    },

    // Browser Event: What to do when user wants to perform a drill up...
    ".drill-up click": function (el, ev) {
        // Is this operation "available"?
        if (!el.hasClass("available")) {
            return;
        }
        this.options.executionMonitorModel.chartType = this.options.parent.getChartType();
        // Ask the model to perform a drill up...
        this.options.executionMonitorModel.drillUp();

        // Hide the drill menu...
        this.element.hide();
    },

    ".drill-down-to input:checkbox click": function (el, ev) {
        var unCheckedDrillOptions = this.getUnCheckedDrillOptions(),
            totalCheckbox = this.element.find(".drill-down-to input:checkbox");

        if (unCheckedDrillOptions.length === totalCheckbox.length) {
            this.element.find('.drill-down-image').attr("src", "images/drill_dn_disable.png");
            this.$drillDown.removeClass("available");
            this.$drillDown.addClass("disabled");
        }
        else {
            this.$drillDown.addClass("available");
            this.$drillDown.removeClass("disabled");
            this.element.find('.drill-down-image').attr("src", "images/drill_dn.png");
        }

    },
    // Browser Event: What to do when user wants to perform a drill down...
    ".drill-down click": function (el, ev) {
        // Is this operation "available"?
        if (!el.hasClass("available")) {
            return;
        }
        this.options.executionMonitorModel.chartType = this.options.parent.getChartType();
        // Get the data back...
        var drillDownInfo = this.element.data('drillDownInfo');

        // Hide the drill menu...
        this.element.hide();

        // Get the report definition object...
        var report = drillDownInfo.opts[0].report,
            eInfos = drillDownInfo.opts[0].eInfos;

        var unCheckedDrillOptions = this.getUnCheckedDrillOptions();
        if (unCheckedDrillOptions.length <= 0) {
            this.options.executionMonitorModel.drillDown(report, eInfos);
        }
        else {
            this.FilterDrillOptionsAndDrillDown(unCheckedDrillOptions, drillDownInfo);
        }
    },

    getUnCheckedDrillOptions: function () {
        return $(".drill-down-to input:checkbox:not(:checked)");
    },

    FilterDrillOptionsAndDrillDown: function (unCheckedDrillOptions, drillDownInfo) {
        var drillDownInfoOpts = drillDownInfo.opts[0],
            report = drillDownInfoOpts.report,
            eInfos = drillDownInfoOpts.eInfos;
        var that = this,
            reportTemplate = report.template.split('|'),
            reportFilter = report.filter.split('|');

        $.each(unCheckedDrillOptions, function (index, checkBox) {
            var val = $(checkBox).val(),
                uncheckedElement;

            if (!that.unCheckedOptions[val]) {
                that.unCheckedOptions[val] = [];
                that.unCheckedOptions[val].currentLevel = that.drillLevelKey;
            }
            var targetElementindex = that.getTrgetElementsIndex(drillDownInfoOpts.tgtAttrForms, val);
            if (targetElementindex !== -1) {
                uncheckedElement = eInfos[targetElementindex];
                reportFilter = $.grep(reportFilter, function (filter) {
                    return filter !== uncheckedElement.eID;
                });
                var startIndex = 0;
                for (var i = 0; i < targetElementindex; i++) {
                    startIndex += drillDownInfoOpts.tgtAttrForms[i].formCount;
                }
                reportTemplate[startIndex] = uncheckedElement.formID;
                if (drillDownInfoOpts.tgtAttrForms[targetElementindex].formCount > 1) {
                    reportTemplate.splice(startIndex + 1, drillDownInfoOpts.tgtAttrForms[targetElementindex].formCount - 1);
                }
                if (!that.isunCheckedOptionsExist(that.unCheckedOptions[val], that.drillLevelKey)) {
                    that.unCheckedOptions[val].push(that.drillLevelKey);
                }
                eInfos.splice(targetElementindex, 1);
            }
        });

        report.template = reportTemplate.join('|');
        report.filter = reportFilter.join('|');
        this.options.executionMonitorModel.drillDown(report, eInfos);
    },

    getTrgetElementsIndex: function (tgtAttrForms, value) {
        var elementIndex = -1;
        for (var i = 0; i < tgtAttrForms.length; i++) {
            if (tgtAttrForms[i].formName === value) {
                return i;
            }
        }
        return elementIndex;
    },

    isunCheckedOptionsExist: function (uncheckedOptions, level) {
        var exists = false;
        for (var i = 0; i < uncheckedOptions.length; i++) {
            if (uncheckedOptions[i] === level) {
                exists = true;
            }
        }

        return exists;
    },

    drillReportUp: function (drillOptions) {
        // Set the buttons...
        var drillUpImageSrc = drillOptions.drillUp ? "images/roll_up.png" : "images/roll_up_disable.png";
        this.element.find('.drill-up-image').attr("src", drillUpImageSrc);
        this.$drillUp[drillOptions.drillUp ? "addClass" : "removeClass"]("available");
        this.$drillUp[drillOptions.drillUp ? "removeClass" : "addClass"]("disabled");
    },

    drillReportDown: function (drillOptions) {
        // Store this data with the menu...
        this.element.data('drillDownInfo', drillOptions.drillDown);

        // Do we the ability to drill down?
        if (drillOptions.drillDown) {
            var drillDownOpts = drillOptions.drillDown.opts[0];
            // Modify the menu...
            this.$drillMenuSel.html(can.view('templates/drillMenu.ejs', drillDownOpts));

            this.$drillDown.addClass("available");
            this.$drillDown.removeClass("disabled");
            this.element.find('.drill-down-image').attr("src", "images/drill_dn.png");
            var tgtAttrFormNames = [],
                tgtAttrCheckBoxess = [];

            for (var i = 0; i < drillDownOpts.tgtAttrForms.length; i++) {
                tgtAttrFormNames.push(drillDownOpts.tgtAttrForms[i].formName);
            }

            this.drillLevelKey = tgtAttrFormNames.join();

            for (var j = 0; j < drillDownOpts.tgtAttrForms.length; j++) {
                var formName = drillDownOpts.tgtAttrForms[j].formName;
                var isVisible = !this.isOptionUncheked(formName);
                var target = {
                    "targetValue": formName,
                    "targetId": formName.replace(/\s+/g, ''),
                    isVisible: isVisible
                };
                tgtAttrCheckBoxess.push(target);
            }

            var invisibelCheckboxes = $.grep(tgtAttrCheckBoxess, function (obj) {
                return obj.isVisible === false;
            });

            if (invisibelCheckboxes.length === tgtAttrCheckBoxess.length) {
                this.$drillMenuSel.html("<p>" + Sentrana.getMessageText(window.app_resources.app_msg.drill_down.cannot_go_deeper_hierarchy) + "</p>");
                this.$drillDownTo.html('');
                this.$drillDown.removeClass("available");
                this.$drillDown.addClass("disabled");
            }
            else {
                this.$drillDownTo.html(can.view('templates/drillDownTo.ejs', {
                    tgtAttrCheckBoxess: tgtAttrCheckBoxess
                }));
            }
        }
        else {
            // Clear the list of selected elements...
            this.$drillMenuSel.html("<p>" + Sentrana.getMessageText(window.app_resources.app_msg.drill_down.cannot_go_deeper_report) + "</p>");
            this.$drillDown.removeClass("available");
            this.$drillDown.addClass("disabled");
            this.element.find('.drill-down-image').attr("src", "images/drill_dn_disable.png");
            this.$drillDownTo.empty();
        }
    },

    // Browser Event: What to do when the model changes...
    "{executionMonitorModel} change": function (executionMonitorModel, ev, attr, how, newVal, oldVal) {

        // Determine if we can perform drill down, up
        var drillOptions = this.options.executionMonitorModel.getDrillOptions();
        var panelBody = this.element.closest('.panel-body').offset();
        if (attr === "drillOptionsStatus" && newVal === "SHOWPOPUP") {
            this.$drillMenuSel.html(can.view('templates/loadingwheel.ejs', {
                message: "Loading...",
                hideImage: false
            }));
            this.$drillDownTo.html('');
            this.element.css({
                top: drillOptions.sourceEvent.clientY - panelBody.top + 40 + $(window).scrollTop() + "px",
                left: drillOptions.sourceEvent.clientX - panelBody.left + "px"
            }).fadeIn(250);

        }

        if (attr === "drillOptionsStatus" && newVal === "SUCCESS") {
            // If we cannot drill, get out now...
            if (!drillOptions || (!drillOptions.drillUp && !drillOptions.drillDown)) {
                return;
            }

            this.drillReportUp(drillOptions);
            this.drillReportDown(drillOptions);
            if (!this.element.is(':visible')) {
                this.element.css({
                    top: drillOptions.sourceEvent.clientY - panelBody.top + 40 + $(window).scrollTop() + "px",
                    left: drillOptions.sourceEvent.clientX - panelBody.left + "px"
                }).fadeIn(250);
            }

        }
        else if (attr === "drillOptionsStatus" && newVal === "FAILURE") {
            if (drillOptions) {
                $(drillOptions.sourceEvent.currentTarget).removeClass('highlight-row');
            }

            var errorMsg;
            var errorCode = executionMonitorModel.attr("drillErrorCode");

            if (errorCode === Sentrana.Enums.ErrorCode.KEY_NOT_FOUND) {
                errorMsg = Sentrana.getMessageText(window.app_resources.app_msg.drill_down.key_not_found_msg);
            }
            else if (errorCode === Sentrana.Enums.ErrorCode.ELEMENT_NOT_FOUND) {
                errorMsg = Sentrana.getMessageText(window.app_resources.app_msg.drill_down.attribute_not_found_msg);
            }
            else if (errorCode === Sentrana.Enums.ErrorCode.UNABLE_TO_DRILL_DOWN) {
                errorMsg = Sentrana.getMessageText(window.app_resources.app_msg.drill_down.drill_down_unable_msg);
            }
            else {
                errorMsg = executionMonitorModel.attr("drillOptionsMessage");
            }
            Sentrana.AlertDialog("Error", errorMsg);
        }
    },

    isOptionUncheked: function (option) {
        var isUnChecked = false;
        var value = this.unCheckedOptions[option];

        if (value) {
            if (this.isCurrentLevel(this.unCheckedOptions[option].currentLevel)) {
                isUnChecked = false;
            }
            else {
                var splitedKey = this.drillLevelKey.split(',');
                for (var i = 0; i < splitedKey.length; i++) {
                    if (splitedKey[i] === option) {
                        isUnChecked = true;
                    }
                }
            }

        }
        else {
            isUnChecked = false;
        }

        return isUnChecked;
    },

    isCurrentLevel: function (value) {
        if (value === this.drillLevelKey) {
            return true;
        }
        return false;
    }
});
