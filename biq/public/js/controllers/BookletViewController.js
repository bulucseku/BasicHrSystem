can.Control.extend("Sentrana.Controllers.BookletView", {
    pluginName: 'sentrana_booklet_view',
    defaults: {
        app: null,
        bookletDefinModel: null,
        displayMode: 'read',
        titleCls: '',
        showEdit: false
    }
}, {
    init: function VB_init() {
        this.element.html(can.view('templates/booklet-view-panel.ejs', {}));
        this.$containerPane = this.element.find('.report-view');
        this.reportViewControllerMap = {};
        this.reportViewController = undefined;
        this.reloadReportId = 0;
        this.updateUI();
    },

    update: function VB_init() {
        this.updateUI();
    },

    updateUI: function VB_updateUI() {

        this.$containerPane.html('');

        if (this.options.bookletDefinModel.bookletModel) {
            if (this.options.reportsLoaded) {
                this.showReports();
            }
            else if (this.options.bookletDefinModel.bookletModel.reportsRefreshed) {
                this.showReports();
            }
            else {
                this.options.bookletDefinModel.getReports(this.options.bookletDefinModel.bookletModel.id);
            }
        }
        else {
            this.showReports();
        }

    },

    showReports: function () {
        this.reports = this.options.bookletDefinModel.getBookletReports();
        if (this.reports && this.reports.length > 0) {
            if (!this.isRendered) {
                if (this.options.bookletDefinModel.selectedReportPos == -1) {
                    this.currentReportIndex = 0;
                }
                else {
                    this.currentReportIndex = this.options.bookletDefinModel.selectedReportPos;
                }

                this.options.bookletDefinModel.setBookletReportSelected(-1);
                this.options.bookletDefinModel.setBookletReportSelected(this.currentReportIndex);
                this.isRendered = true;
            }
        }
    },

    showNavigationButtons: function () {
        if (this.reportViewController) {
            this.reportViewController.addActionButton({
                "cls": "fa-caret-left",
                "eventType": "move_prev",
                "title": "View previous report",
                "dropdown": false
            });
            this.reportViewController.addActionButton({
                "cls": "fa-caret-right",
                "eventType": "move_next",
                "title": "View next report",
                "dropdown": false
            });
        }
    },

    enableDisableNavigationButtons: function () {
        //if has only one report then disable both button.
        var btnNext = this.element.find(".fa-caret-right").closest('.btn'),
            btnPrev = this.element.find(".fa-caret-left").closest('.btn');
        if (!this.reports || this.reports.length <= 1) {
            btnPrev.addClass("disabled");
            btnNext.addClass("disabled");
        }
        else if (!this.currentReportIndex) {
            btnPrev.addClass("disabled");
            btnNext.removeClass("disabled");
        }
        else if (this.reports.length - 1 === this.currentReportIndex) {
            btnPrev.removeClass("disabled");
            btnNext.addClass("disabled");
        }
        else {
            btnPrev.removeClass("disabled");
            btnNext.removeClass("disabled");
        }
    },

    addEditButton: function () {
        this.reportViewController.addActionButton({
            "cls": "fa-edit",
            "eventType": "editselected_report",
            "title": "Edit report",
            "dropdown": false
        });
    },

    removeEditButton: function () {
        this.reportViewController.removeButtonFromBar({
            "cls": "fa-edit",
            "eventType": "editselected_report"
        });
    },

    blockElement: function (el, html) {
        this.isBlocked = true;
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
        this.isBlocked = false;
    },

    renderReport: function (report, nameWithOutSpecialChar, showName) {
        var that = this;
        var $reportContainer = $('<div id="report-view-' + nameWithOutSpecialChar + '"></div>');
        var reportViewController = $reportContainer.sentrana_report_view({
            app: this.options.app,
            titleCls: this.options.titleCls,
            "showName": showName,
            showFilters: true,
            showChartOptions: true,
            reportNameWithOutSpecialChar: nameWithOutSpecialChar,
            reportDefinitionInfoModel: report,
            callBackOnFail: function(){
                that.unBlockElement(that.element.find(".report-view"));
            }
        }).control();
        this.reportViewControllerMap[report.name] = reportViewController;
        this.reportViewController = reportViewController;

        //IE8 does not support Object.keys so do it another way
        var length = 0,
            prop;
        for (prop in this.reportViewControllerMap) {
            if (this.reportViewControllerMap.hasOwnProperty(prop)) {
                length++;
            }
        }
        if (length > 1) {
            this.reportViewController.hide();
        }

        if (this.options.displayMode === 'write') {
            this.reportViewController.setTitle('Preview Reports: ', report.name);
        }
        else if (this.options.displayMode === 'read') {
            this.reportViewController.setTitle('Viewing Booklet: ', this.options.bookletDefinModel.bookletModel.name + ' - by ' + this.options.bookletDefinModel.bookletModel.createUser);
        }

        this.$containerPane.append($reportContainer);
        this.reportViewController.viewReport(report);
        this.showNavigationButtons();
    },

    viewReport: function (report) {
        //action log
        var actionLog = {
            ActionName: Sentrana.ActionLog.ActionNames.ViewBookletReport,
            Context: Sentrana.ActionLog.Contexts.SavedBookLet,
            ElementType: Sentrana.ActionLog.ElementTypes.Report,
            ElementId: report.id
        };

        this.options.app.writeActionLog(actionLog);

        var that = this;
        var html = '<div class="loading"><p class="small-waitingwheel"><img src="images/loader-white.gif"/></p></div>';
        this.blockElement(this.element.find(".report-view"), html);

        this.viewingReport = report;
        var nameWithOutSpecialChar = report.name.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
        var showName = this.options.displayMode === 'read' ? true : false;
        this.reportViewController = this.reportViewControllerMap[report.name];

        //if for the report we do not have any container/controller then create it
        if (!this.reportViewController) {
            this.renderReport(report, nameWithOutSpecialChar, showName);
        }
        else {
            if (this.reloadReportId === report.id) {
                this.reloadReportId = 0;
                this.reportViewController.destroy();
                $('#report-view-' + nameWithOutSpecialChar).remove();
                this.renderReport(report, nameWithOutSpecialChar, showName);
            }
            else {
                this.unBlockElement(this.element.find(".report-view"));
                $('#report-view-' + nameWithOutSpecialChar).show();
                that.hideAllRreortsExceptViewingReport();
            }
        }

        if (report.bookletId) {
            if (this.options.showEdit) {
                this.addEditButton();
            }
        }
        else {
            this.removeEditButton();
        }

        this.enableDisableNavigationButtons();
    },

    updateGridChartView: function () {
        if (this.reportViewController) {
            this.reportViewController.updateView();
        }
    },

    " move_prev": function () {
        this.options.app.handleUserInteraction();

        if (this.element.find(".fa-caret-left").closest('.btn').hasClass("disabled")) {
            return;
        }

        this.currentReportIndex = this.currentReportIndex * 1;
        if (this.currentReportIndex === 0) {
            return;
        }

        this.currentReportIndex -= 1;
        this.options.bookletDefinModel.setBookletReportSelected(this.currentReportIndex);
    },

    " move_next": function () {
        this.options.app.handleUserInteraction();

        if (this.element.find(".fa-caret-right").closest('.btn').hasClass("disabled")) {
            return;
        }

        this.currentReportIndex = this.currentReportIndex * 1;
        if (this.currentReportIndex === this.options.bookletDefinModel.getBookletReports().length - 1) {
            return;
        }

        this.currentReportIndex += 1;
        this.options.bookletDefinModel.setBookletReportSelected(this.currentReportIndex);

    },

    " editselected_report": function (el, event, params) {
        this.options.app.handleUserInteraction();
        var report = this.options.bookletDefinModel.getSelectedBookletReport();
        this.element.trigger("edit_report", report);
    },

    "{bookletDefinModel} change": function (bookletDefinModel, ev, attr, how, newVal, oldVal) {
        if (attr === "selreportpos" && bookletDefinModel.count > 0) {
            newVal = newVal * 1;
            if (newVal < 0) {
                return;
            }

            this.currentReportIndex = bookletDefinModel.selectedReportPos * 1;
            this.reports = bookletDefinModel.getBookletReports();
            var report = this.reports[this.currentReportIndex];
            if (report) {
                this.viewReport(report);
            }
        }
        else if (attr === "count") {
            if (newVal >= 1) {
                this.showReports();
                this.enableDisableNavigationButtons();
            }
            else {
                this.$containerPane.hide();
            }
        }
    },

    hideAllRreortsExceptViewingReport: function () {
        //hide all other repots
        for (var i = 0; i < this.reports.length; i++) {
            if (this.viewingReport.name !== this.reports[i].name) {
                if (this.reportViewControllerMap[this.reports[i].name]) {
                    $('#report-view-' + this.reports[i].name.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-')).hide();
                }
            }
        }
    },

    updateReportView: function () {
        this.hideAllRreortsExceptViewingReport();
        this.unBlockElement(this.element.find(".report-view"));

        if (this.reportViewController) {
            this.reportViewController.show();
            //Note: do not call the updateView() or updateChartView() method of the report view controller. That will cause infinite loop
            //As the problem is for only grid so update the grid view.
            //TODO: We have to find a good solution for this
            this.reportViewController.updateGridView();
            //Resize the chart after redraw
            this.reportViewController.reFlowChartView();
        }
    },

    " chart_rebind": function () {
        //As this event create a circular calling chaing to check if it is already rendered or not
        if (this.isBlocked) {
            this.updateReportView();
        }
    },

    " chart_failed": function () {
        //As this event create a circular calling chaing to check if it is already rendered or not
        if (this.isBlocked) {
            this.updateReportView();
        }
    }
});
