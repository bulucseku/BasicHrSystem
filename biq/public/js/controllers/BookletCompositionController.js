can.Control.extend("Sentrana.Controllers.BookletComposition", {
    pluginName: 'sentrana_booklet_composition',
    defaults: {
        app: null,
        bookletModel: null,
        bookletDefinModel: null,
        showEdit: false
    }
}, {
    init: function BC_init() {
        this.initialize();
    },

    initialize: function BC_initialize() {
        this.updateUI();
        this.saveUpdateBookletDlg = $("#save-update-booklet-dialog").sentrana_dialogs_save_update_booklet({
            app: this.options.app,
            parent: this
        }).control();

        var that = this;
        $.when(this.element).done(function () {
            that.bookletDefinModel = that.options.bookletDefinModel;
            that.bookletDefinModel.setBookletDefinition(that.options.bookletModel);
        });
    },

    updateSavedReports: function () {
        var mySavedReports = this.getMySavedReports();
        if (!mySavedReports.length || mySavedReports.length <= 0) {
            $('.mover-box-left', this.element).html(can.view('templates/loadingwheel.ejs', {
                message: Sentrana.getMessageText(window.app_resources.app_msg.booklet_operation.create.no_report_error_msg),
                hideImage: true
            }));
        }
        else {
            this.updateSavedReportListView(mySavedReports);
        }
    },

    updateSavedReportListView: function (reports) {
        $('.mover-box-left', this.element).html(can.view('templates/savedReporsForBooklet.ejs', {
            myReports: reports
        }));
    },

    refreshReports: function (report) {
        this.bookletDefinModel.setBookletReportSelected(-1);
        var pos = this.bookletDefinModel.getReportPositionByName(report.name);
        this.bookletDefinModel.bookletReports[pos] = report;
        this.options.app.BookletViewController.reloadReportId = report.id;
        this.bookletDefinModel.setBookletReportSelected(pos);

        this.updateReportOfModel(report);
    },

    updateReportOfModel: function (report) {
        var reports = this.options.bookletModel.reports;
        for (var i = 0; i < reports.length; i++) {
            if (reports[i].id === report.id) {
                reports[i] = report;
                return;
            }
        }
    },

    updateUI: function BC_updateUI() {

        this.bookletStructure = [];
        var mySavedReports = this.getMySavedReports();
        this.element.html(can.view('templates/booklet-composition-panel.ejs', {
            myReports: mySavedReports
        }));

        if (mySavedReports === false) {
            $('.mover-box-left', this.element).html(can.view('templates/loadingwheel.ejs', {
                message: Sentrana.getMessageText(window.app_resources.app_msg.report_load.processing),
                hideImage: false
            }));
        }
        else if (!mySavedReports.length || mySavedReports.length <= 0) {
            //$('.mover-box-left', this.element).html(can.view('templates/loadingwheel.ejs', { message: Sentrana.getMessageText(window.app_resources.app_msg.report_load.processing), hideImage: true }));
            $('.mover-box-left', this.element).html(can.view('templates/loadingwheel.ejs', {
                message: Sentrana.getMessageText(window.app_resources.app_msg.booklet_operation.create.no_report_error_msg),
                hideImage: true
            }));
        }

        this.makeCompositionPanelCollapsible();
        this.element.find("button").button();
        this.$viewBtn = this.element.find(".booklet-view-button");
        this.$saveBtn = this.element.find(".booklet-save-button");
        this.$savAsBtn = this.element.find(".booklet-save-as-button");
        this.$shareBtn = this.element.find(".booklet-share-button");
        this.$moveBtn = this.element.find(".dual-list-move-button");
        this.$orderBtn = this.element.find(".order-button");

        this.$viewBtn.button({
            "disabled": true
        });
        this.$viewBtn.addClass('disabled');
        this.$saveBtn.button({
            "disabled": true
        });
        this.$saveBtn.addClass('disabled');
        this.$savAsBtn.button({
            "disabled": true
        }).hide();
        this.$shareBtn.button({
            "disabled": true
        }).hide();
        this.$savAsBtn.addClass('disabled');
        this.$shareBtn.addClass('disabled');
        this.$moveBtn.addClass("ui-state-disabled");
        this.$orderBtn.addClass("ui-state-disabled");
        if (this.options.bookletModel) {
            this.element.find(".booklet-composition-panel-header-title").text("Booklet Composition: " + this.options.bookletModel.name + " by " + this.options.bookletModel.createUser);
            this.$savAsBtn.show();
            this.$shareBtn.show();
        }

        this.$spinner = this.element.find(".spinner").hide();
        this.$executionMessage = this.element.find(".execution-message");
    },

    makeCompositionPanelCollapsible: function () {
        this.element.find(".booklet-composition-panel-header").click({
            controller: this
        }, this.CompositionPanelOnClick);
    },

    CompositionPanelOnClick: function (event) {
        $(this).find('.indicator').toggleClass("fa-minus-square fa-plus-square");
        event.data.controller.element.find(".booklet-composition-container").slideToggle('normal');
    },

    getMySavedReports: function () {

        if (!this.options.app.reportDefnInfoList || !this.options.app.reportDefnInfoList.savedReports) {
            return false;
        }

        var userInfo = this.options.app.retrieveUserInfo();

        var selecteditem = $.grep(this.options.app.reportDefnInfoList.savedReports, function (report) {
            return report.createUserId == userInfo.userID;
        });

        return selecteditem;
    },

    getOriginalReport: function (id) {

        if (!this.options.app.reportDefnInfoList || !this.options.app.reportDefnInfoList.savedReports) {
            return false;
        }
        var selecteditem = $.grep(this.options.app.reportDefnInfoList.savedReports, function (report) {
            return report.id === id;
        });

        return selecteditem[0];
    },

    ".mover-box-left .mover-box-item click": function (el, ev) {
        if ($(el).hasClass('mover-box-item-selected')) {
            $(el).removeClass('mover-box-item-selected');
        }
        else {
            if (!ev.ctrlKey) {
                this.element.find(".mover-box-left .mover-box-item").removeClass('mover-box-item-selected');
            }
            $(el).addClass('mover-box-item-selected');
        }

        this.enableDisableMoveButton();
    },

    enableDisableMoveButton: function () {
        var selectedItems = this.element.find('.mover-box-left').find('.mover-box-item.mover-box-item-selected');
        if (selectedItems.length > 0) {
            this.$moveBtn.removeClass("ui-state-disabled");
        }
        else {
            this.$moveBtn.addClass("ui-state-disabled");
        }
    },

    ".mover-box-right .mover-box-item click": function (el) {
        this.element.find(".mover-box-right .mover-box-item").removeClass('mover-box-item-selected');
        $(el).addClass('mover-box-item-selected');
        this.bookletDefinModel.setBookletReportSelected($(el).attr('id'));
    },

    enableDisableOrderButton: function () {
        var selectedItems = this.element.find('.mover-box-right').find('.mover-box-item.mover-box-item-selected');
        if (selectedItems.length > 0) {
            this.$orderBtn.removeClass("ui-state-disabled");
        }
        else {
            this.$orderBtn.addClass("ui-state-disabled");
        }
    },

    ".mover-box-left .mover-box-item dblclick": function (el) {
        var selectedReport = {
            'id': $(el).attr('id'),
            'name': $(el).attr('title')
        };
        this.addSingleReportTobooklet(selectedReport);
        this.element.find('.booklet-save-execution-message').text('');
    },

    addNewReport: function (report) {
        this.bookletDefinModel.addReportToBooklet(report);
        this.options.bookletModel.reports.push(report);
        $(".booklet-entry.booklet-entry-selected").find(".booklet-details-last-total-report").text(this.getBookletStructure().length);
    },

    isReportExistsWithSameName: function (name) {
        var reports = this.getBookletStructure();
        var selecteditem = $.grep(reports, function (report) {
            return ($.trim(report.name) === $.trim(name));
        });
        return selecteditem.length > 0;
    },

    addSingleReportTobooklet: function (report) {
        var that = this;
        if (that.isSameNameExist(report.name)) {
            Sentrana.ConfirmDialog(Sentrana.getMessageText(window.app_resources.app_msg.booklet.duplicate_report.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.booklet.duplicate_report.dialog_msg_for_single, report.name),
                function () {
                    that.bookletDefinModel.addReportToBooklet(that.createBookletReport(report.id));
                    if (that.options.bookletModel) {
                        that.options.bookletModel.attr("reportsRefreshed", false);
                    }
                    that.element.find(".mover-box-left .mover-box-item").removeClass('mover-box-item-selected');
                    that.enableDisableMoveButton();
                }, function () {
                    that.element.find(".mover-box-left .mover-box-item").removeClass('mover-box-item-selected');
                    that.enableDisableMoveButton();
                }, true);
        }
        else {
            that.bookletDefinModel.addReportToBooklet(that.createBookletReport(report.id));
            that.element.find(".mover-box-left .mover-box-item").removeClass('mover-box-item-selected');
            that.enableDisableMoveButton();
            if (that.options.bookletModel) {
                that.options.bookletModel.attr("reportsRefreshed", false);
            }

        }
    },

    ".dual-list-move-button click": function () {

        var that = this,
            selectedReports = this.getSelectedReports(),
            duplicateReports = [];

        if (selectedReports.length <= 0) {
            return;
        }

        this.element.find('.booklet-save-execution-message').text('');

        if (selectedReports.length === 1) {
            this.addSingleReportTobooklet(selectedReports[0]);
        }
        else {
            duplicateReports = this.getDuplicateReportInfo(selectedReports);
            var nonDuplicateReports = $.grep(selectedReports, function (el) {
                return $.inArray(el, duplicateReports.duplicateReports) === -1;
            });

            for (var i = 0; i < nonDuplicateReports.length; i++) {
                that.bookletDefinModel.addReportToBooklet(that.createBookletReport(nonDuplicateReports[i].id));
                that.element.find(".mover-box-left .mover-box-item").removeClass('mover-box-item-selected');
                this.enableDisableButtons();
                this.enableDisableMoveButton();
                if (that.options.bookletModel) {
                    that.options.bookletModel.attr("reportsRefreshed", false);
                }
            }
            if (duplicateReports.duplicateReports.length > 0) {
                Sentrana.ConfirmDialog(Sentrana.getMessageText(window.app_resources.app_msg.booklet.duplicate_report.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.booklet.duplicate_report.dialog_msg_for_multiple, duplicateReports.duplicateReportsName),
                    function () {
                        for (i = 0; i < duplicateReports.duplicateReports.length; i++) {
                            that.bookletDefinModel.addReportToBooklet(that.createBookletReport(duplicateReports.duplicateReports[i].id));
                        }
                        that.element.find(".mover-box-left .mover-box-item").removeClass('mover-box-item-selected');
                        that.enableDisableMoveButton();
                        if (that.options.bookletModel) {
                            that.options.bookletModel.attr("reportsRefreshed", false);
                        }
                    }, function () {

                    }, true);
            }
        }

    },

    createBookletReport: function (id) {
        var originalReport = this.getOriginalReport(id);

        var name = originalReport.name,
            increament = 0;

        while (this.isSameNameExist(name)) {
            increament++;
            name = originalReport.name + "_" + increament;
        }

        var newreport = jQuery.extend(true, {}, originalReport);
        newreport.name = name;

        return newreport;
    },

    getDuplicateReportInfo: function (selectedReports) {
        var duplicateReports = [],
            duplcatereportsName = '',
            increment = 0;

        for (var i = 0; i < selectedReports.length; i++) {
            if (this.isSameNameExist(selectedReports[i].name)) {
                duplicateReports.push(selectedReports[i]);
                if (duplcatereportsName.length > 0) {
                    duplcatereportsName += '<br/>';
                }
                increment++;
                duplcatereportsName += increment + "." + selectedReports[i].name;
            }
        }

        return {
            'duplicateReports': duplicateReports,
            'duplicateReportsName': duplcatereportsName
        };
    },

    enableDisableButtons: function () {
        var bookletStructure = this.getBookletStructure();
        if (bookletStructure.length > 0) {
            this.$viewBtn.button("option", {
                "disabled": false
            });
            this.$viewBtn.removeClass('disabled');
            this.$saveBtn.button("option", {
                "disabled": false
            });
            this.$saveBtn.removeClass('disabled');
            this.$savAsBtn.button("option", {
                "disabled": false
            });
            this.$savAsBtn.removeClass('disabled');
            this.$shareBtn.button("option", {
                "disabled": false
            });
            this.$shareBtn.removeClass('disabled');

        }
        else {
            this.$viewBtn.button("option", {
                "disabled": true
            });
            this.$viewBtn.addClass('disabled');
            this.$saveBtn.button("option", {
                "disabled": true
            });
            this.$saveBtn.addClass('disabled');
            this.$savAsBtn.button("option", {
                "disabled": true
            });
            this.$savAsBtn.addClass('disabled');
            this.$shareBtn.button("option", {
                "disabled": true
            });
            this.$shareBtn.addClass('disabled');
        }
    },

    isSameNameExist: function (name) {

        var bookletStructure = this.getBookletStructure();

        var reports = $.grep(bookletStructure, function (report) {
            return report.name === name;
        });

        return reports.length > 0;
    },

    getSelectedReports: function () {
        var selectedItems = this.element.find('.mover-box-left').find('.mover-box-item.mover-box-item-selected');
        var selectedReports = [];
        $.each(selectedItems, function (index, item) {
            selectedReports.push({
                'id': $(item).attr('id'),
                'name': $(item).attr('title')
            });
        });

        return selectedReports;
    },

    ".mover-box-right .moverbox-item-removebutton click": function (el, event) {
        this.options.app.handleUserInteraction();

        event.stopPropagation();
        var that = this,
            reportIndex = $(el).attr('id') * 1;
        that.bookletDefinModel.removeReportFromBooklet(reportIndex);
        if (that.options.bookletModel) {
            that.options.bookletModel.attr("reportsRefreshed", false);
        }
        this.element.find('.booklet-save-execution-message').text('');
    },

    ".order-button click": function (el) {
        var selectedItems = this.element.find('.mover-box-right').find('.mover-box-item.mover-box-item-selected');
        if (selectedItems.length < 1) {
            return;
        }

        this.element.find('.booklet-save-execution-message').text('');

        var buttonId = $(el).attr('id'),
            reportId = selectedItems[0].id;
        if (reportId) {
            var reportIndex = reportId * 1,
                newIndex = reportIndex * 1;
            var bookletStructure = this.getBookletStructure();
            switch (buttonId) {
            case "order-button-top":
                if (reportIndex > 0) {
                    newIndex = 0;
                }
                break;
            case "order-button-bottom":
                if (reportIndex < bookletStructure.length - 1) {
                    newIndex = bookletStructure.length - 1;
                }
                break;
            case "order-button-dn":
                if (reportIndex < bookletStructure.length - 1) {
                    newIndex = reportIndex + 1;
                }
                break;
            case "order-button-up":
                if (reportIndex > 0) {
                    newIndex = reportIndex - 1;
                }
                break;
            default:
                break;
            }

            if (reportIndex !== newIndex) {
                this.bookletDefinModel.changeReportPositionInBooklet(reportIndex, newIndex);
                this.bookletDefinModel.setBookletReportSelected(newIndex);
                if (this.options.bookletModel) {
                    this.options.bookletModel.attr("reportsRefreshed", false);
                }
            }

        }

    },

    getBookletStructure: function () {
        var bookletStructure = [];
        if (this.bookletDefinModel) {
            bookletStructure = this.bookletDefinModel.getBookletReports();
        }
        return bookletStructure;
    },

    updateBookletStructureUI: function () {
        var bookletStructure = this.getBookletStructure();

        this.element.find('.mover-box-right').html(can.view('templates/bookletStructure.ejs', {
            bookletReports: bookletStructure
        }));
        this.$orderBtn.addClass("ui-state-disabled");
        this.element.find('#' + this.bookletDefinModel.selectedReportPos + '.mover-box-item', '.mover-box-right').addClass('mover-box-item-selected');
    },

    setItemSelected: function (pos) {
        this.element.find('.mover-box-item', '.mover-box-right').removeClass('mover-box-item-selected');
        this.element.find('#' + pos + '.mover-box-item', '.mover-box-right').addClass('mover-box-item-selected');
        this.enableDisableOrderButton();
    },

    ".booklet-save-button click": function (el) {

        if (el.button("option", "disabled") === true) {
            return;
        }

        this.element.find('.booklet-save-execution-message').text('');

        var bookletReports = [];

        if (!this.options.bookletModel) {
            var booklet = new Sentrana.Models.Booklet();
            var bookletStructure = this.getBookletStructure();
            booklet.attr("reports", this.makeBookletReports(bookletStructure));
            this.saveUpdateBookletDlg.open(booklet);

        }
        else if (this.options.bookletModel.isNew()) {
            bookletReports = this.getBookletStructure();
            this.options.bookletModel.attr("reports", this.makeBookletReports(bookletReports));
            this.saveUpdateBookletDlg.open(this.options.bookletModel);

        }
        else {
            this.$spinner.show();
            this.$executionMessage.text("Saving...");

            var reports = this.getBookletStructure();
            this.options.bookletModel.attr("reports", this.makeBookletReports(reports));
            var that = this;

            this.options.bookletModel.save().done(function (data) {
                data.reports = $.map(data.reports, function (rdi, index) {
                    return new Sentrana.Models.ReportDefinitionInfo({
                        json: rdi.attr(),
                        app: that.options.app
                    });
                });
                that.updateObserverReports(data.reports);
                that.options.bookletModel.attr("reportsRefreshed", true);
                that.element.find('.booklet-save-execution-message').text(Sentrana.getMessageText(window.app_resources.app_msg.booklet_operation.update.success_msg)).css('color', 'green').fadeIn();

            }).fail(function (err) {

                that.options.bookletModel.attr("reports", that.getBookletStructure());
                var errorCode = err.getResponseHeader("ErrorCode");
                var errorMsg = err.getResponseHeader("ErrorMsg");

                if (errorCode === Sentrana.Enums.ErrorCode.BOOKLET_NAME_IN_USE) {
                    that.element.find('.booklet-save-execution-message').text(errorMsg).css('color', 'red').fadeIn();
                }
                else {
                    that.element.find('.booklet-save-execution-message').text(Sentrana.getMessageText(window.app_resources.app_msg.update_operation.failed)).css('color', 'red').fadeIn();
                }

            }).always(function () {
                that.$spinner.hide();
                that.$executionMessage.text("");
            });
        }
    },

    ".booklet-save-as-button click": function (el, ev) {

        if (el.button("option", "disabled") === true) {
            return;
        }

        if (!this.options.bookletModel) {
            return;
        }

        if (!this.options.bookletModel.isNew()) {
            this.bookletName = this.options.bookletModel.name;
        }

        var booklet = new Sentrana.Models.Booklet();
        var bookletStructure = this.getBookletStructure();
        booklet.attr("reports", this.makeBookletReports(bookletStructure));
        booklet.name = "Copy of " + this.bookletName;

        this.element.find('.booklet-save-execution-message').text('');

        this.saveUpdateBookletDlg.open(booklet);

    },

    ".booklet-share-button click": function (el, ev) {

        if (el.button("option", "disabled") === true) {
            return;
        }

        if (!this.options.bookletModel) {
            return;
        }

        this.element.trigger("share_booklet", this.options.bookletModel);
    },

    updateControllerModel: function (booklet) {
        this.update({
            app: this.options.app,
            bookletDefinModel: this.options.bookletDefinModel,
            bookletModel: booklet
        });
    },

    makeBookletReports: function (bookletStructure) {
        var reports = [];
        $.each(bookletStructure, function (index, report) {
            reports.push({
                "name": report.name,
                "id": report.id,
                "order": index
            });
        });

        return reports;
    },

    ".booklet-clear-button click": function (el) {
        if (el.button("option", "disabled") === true) {
            return;
        }
        this.element.trigger("clear_center_panel");
        $(".item[action='edit']").removeClass('item-selected');
    },

    destroyThisController: function () {

        if ($('.booklet-view-panel-container').control()) {
            $('.booklet-view-panel-container').control().destroy();
            $('.booklet-view-panel-container').html('');
        }

        if (this.options.app.bookletController && !this.options.app.bookletController._destroyed) {
            this.options.app.bookletController.destroy();
            this.options.app.bookletController = undefined;
            $('.booklet-composition-panel-container').html('');
        }

    },

    ".booklet-view-button click": function (el) {

        if (el.button("option", "disabled") === true) {
            return;
        }

        $('.booklet-save-execution-message').text('');

        var $bookletViewPanelContainer = $('.booklet-view-panel-container');

        if ($bookletViewPanelContainer.control()) {
            $bookletViewPanelContainer.control().destroy();
            $bookletViewPanelContainer.html('');
            this.options.app.BookletViewController = undefined;
        }

        this.options.app.BookletViewController = $bookletViewPanelContainer.sentrana_booklet_view({
            app: this.options.app,
            "bookletDefinModel": this.bookletDefinModel,
            "displayMode": 'write',
            "titleCls": 'booklet-view-panel-header',
            "showEdit": this.options.showEdit,
            "reportsLoaded": true
        }).control();
    },

    showWaitingWheel: function (status) {
        if (status) {
            $(".btn-add-booklet").addClass("ui-state-disabled");
            this.element.find('.mover-box-right').html(can.view('templates/loadingwheel.ejs', {
                message: Sentrana.getMessageText(window.app_resources.app_msg.booklet_load.report_loading_msg),
                hideImage: false
            }));
        }
        else {
            $(".btn-add-booklet").removeClass("ui-state-disabled");
        }
    },

    addEditbuttonToBookletView: function () {
        this.options.showEdit = true;
        this.element.trigger("addEditbutton_to_bookletView");
    },

    updateObserverReports: function (reports) {

        var that = this;
        this.bookletDefinModel.bookletReports = [];
        $.each(reports, function (index, rpt) {
            that.bookletDefinModel.bookletReports.push(rpt);
        });

        $(".booklet-entry[booklet-id=" + this.options.bookletModel.id + "]").addClass("booklet-entry-selected").find(".booklet-menu").show();

        //update the report view
        if (this.options.app.BookletViewController) {
            var report = reports[this.bookletDefinModel.selectedReportPos];
            if (report) {
                this.options.app.BookletViewController.viewReport(report);
            }
        }
    },

    getReportPosition: function () {
        return this.getBookletStructure().length;
    },

    // Start to search while the user is typing
    ".report-search-input-booklet keyup": function (el, ev) {
        this.searchSavedReports($(el).val());

    },

    searchSavedReports: function (searchValue) {
        var filteredReport = this.filterReportsForSearchText(searchValue);
        this.updateSavedReportListView(filteredReport);
    },

    filterReportsForSearchText: function (searchValue) {
        var mySavedReports = this.getMySavedReports();
        var serchedReports = $.grep(mySavedReports, function (reports, index) {
            return reports.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
        });

        return serchedReports;
    },

    "{bookletDefinModel} change": function (bookletDefinModel, ev, attr, how, newVal, oldVal) {

        switch (attr) {
        case "count":
        case "itempos":
            this.updateBookletStructureUI();
            this.enableDisableButtons();
            this.setItemSelected(bookletDefinModel.selectedReportPos);
            break;
        case "selreportpos":
            this.setItemSelected(bookletDefinModel.selectedReportPos);
            break;
        case "gettingServerdata":
            this.showWaitingWheel(newVal);
            break;

        default:
            break;
        }
    }
});
