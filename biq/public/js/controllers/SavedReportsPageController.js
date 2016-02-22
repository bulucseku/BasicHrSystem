/**
 * @class SavedReports
 * @module Sentrana
 * @namespace Sentrana.Controllers
 * @extends jQuery.Controller
 * @description This class is a controller which manages the display of the entire "Saved Reports"
 * page.
 */
can.Control.extend("Sentrana.Controllers.SavedReports", {
    pluginName: 'sentrana_saved_reports',
    defaults: {
        sortAsc: false,
        sortField: "lastModDate"
    }
}, {

    initDOMObjects: function () {
        // Render the page...
        this.element.html(can.view("templates/pg-savedreports.ejs", {}));

        // Locate specific elements...
        this.$leftBar = this.element.find(".left");
        this.$centerContainer = this.element.find(".center");
        this.$rightBar = this.element.find(".right");
        this.$commentStream = this.element.find(".comment-stream");
        this.$savedReports = this.$leftBar.find(".saved-reports-list");
        this.$savedBooklets = this.$leftBar.find(".saved-booklets-list");
        this.$filmstripContainer = this.element.find(".filmstrip-container");
        this.$bookletCompositionContainer = this.element.find('.booklet-compose-and-view');
        this.$bookletViewContainer = this.element.find('.booklet-view-container');
        this.$bookletView = this.element.find('.booklet-view');
        this.$savedReportViewerContainer = this.element.find('.saved-report-viewer-container');
    },
    
    reloadReportsAndBooklets: function () {
        this.reportDefnInfoList.getSavedReports();
        this.booklets.getSavedBooklets();
    },

    initDialogs: function () {

        this.shareBookletDlg = $("#share-booklet-dialog").sentrana_dialogs_share_booklet({
            app: this.options.app,
            parent: this
        }).control();

        this.duplicateRptDlg = $("#duplicate-report-dialog").sentrana_dialogs_duplicate_report({
            app: this.options.app
        }).control();

        this.copyBookletDlg = $("#copy-booklet-dialog").sentrana_dialogs_copy_booklet({
            app: this.options.app,
            parent: this
        }).control();

        this.deleteRptDlg = $("#delete-report-dialog").sentrana_dialogs_delete_report({
            app: this.options.app
        }).control();

        this.deleteBookletDlg = $("#delete-booklet-dialog").sentrana_dialogs_delete_booklet({
            app: this.options.app
        }).control();
    },

    //TODO: move this to an appropriate place
    " add_new_booklet": function (el, ev) {
        if ($(el).hasClass('ui-state-disabled')) {
            return;
        }

        if (this.options.app.bookletController) {
            this.options.app.bookletController.destroyThisController();
        }

        this.clearCenterPanelforBooklet();
        this.options.app.bookletController = $('.booklet-composition-panel-container').sentrana_booklet_composition({
            app: this.options.app,
            bookletDefinModel: this.options.app.bookletDefinModel
        }).control();

    },

    initLeftSideBar: function (sideBarWidth, that) {
        var leftSideBar = $(".saved-reports .leftcolumn").smartsidebar({
            title: "Reports and Booklets",
            position: "left",
            sidebarWidth: sideBarWidth,
            callBackFunctionDefault: function () {
                $('.contentcolumn', '.saved-reports').addClass('contentcolumn-default-margin-left').addClass('contentcolumn-default-margin-right').addClass('contentcolumn-default-margin-top').addClass('contentcolumn-default-margin-bottom');
                $('.leftcolumn', '.saved-reports').addClass('sidebar-default-width');
                $('.rightcolumn', '.saved-reports').addClass('sidebar-default-width').addClass('sidebar-right-default-margin-left');
            },
            callBackFunctionOnShow: function () {
                $('.contentcolumn', '.saved-reports').removeClass('contentcolumn-default-margin-left').addClass('contentcolumn-margin-left-on-left-sidebar-show');
                $('.leftcolumn', '.saved-reports').removeClass('sidebar-default-width').addClass('sidebar-width-on-show');
                that.updatePageView();
            },
            callBackFunctionOnHide: function () {
                $('.contentcolumn', '.saved-reports').removeClass('contentcolumn-margin-left-on-left-sidebar-show').addClass('contentcolumn-default-margin-left');
                $('.leftcolumn', '.saved-reports').removeClass('sidebar-width-on-show').addClass('sidebar-default-width');
                that.updatePageView();
            },
            autoHeight: true,
            autoHeightMargin: $('#main-navbar').outerHeight(true)
        });
        var $savedBookletList = $('.saved-booklets-list', leftSideBar);
        $savedBookletList.control().addButtonToBar({
            "title": "Add Booklet",
            "cls": "fa-edit",
            "eventType": "add_new_booklet",
            "dropdown": false
        });

        return leftSideBar;
    },

    initRightSideBar: function (sideBarWidth, that) {
        var rightSideBar = $(".saved-reports .rightcolumn").smartsidebar({
            title: "Comment Stream",
            position: "right",
            sidebarWidth: sideBarWidth,
            callBackFunctionDefault: function () {
                $('.contentcolumn', '.saved-reports').addClass('contentcolumn-default-margin-left').addClass('contentcolumn-default-margin-right').addClass('contentcolumn-default-margin-top').addClass('contentcolumn-default-margin-bottom');
                $('.leftcolumn', '.saved-reports').addClass('sidebar-default-width');
                $('.rightcolumn', '.saved-reports').addClass('sidebar-default-width').addClass('sidebar-right-default-margin-left');
            },
            callBackFunctionOnShow: function () {
                $('.contentcolumn', '.saved-reports').removeClass('contentcolumn-default-margin-right').addClass('contentcolumn-margin-right-on-right-sidebar-show');
                $('.rightcolumn', '.saved-reports').removeClass('sidebar-default-width').removeClass('sidebar-right-default-margin-left').addClass('sidebar-width-on-show').addClass('sidebar-right-margin-left-on-show');
                that.updatePageView();
            },
            callBackFunctionOnHide: function () {
                $('.contentcolumn', '.saved-reports').removeClass('contentcolumn-margin-right-on-right-sidebar-show').addClass('contentcolumn-default-margin-right');
                $('.rightcolumn', '.saved-reports').removeClass('sidebar-width-on-show').removeClass('sidebar-right-margin-left-on-show').addClass('sidebar-default-width').addClass('sidebar-right-default-margin-left');
                that.updatePageView();
            },
            autoHeight: true,
            autoHeightMargin: $('#main-navbar').outerHeight(true)
        });
        return rightSideBar;
    },

    hideRightSideBar: function () {
        //contentcolumn-default-margin-right  
        $('.contentcolumn', '.saved-reports').removeClass('contentcolumn-default-margin-right').addClass('contentcolumn-margin-right-on-empty-right-sidebar');
        $('.rightcolumn', '.saved-reports').hide();
    },

    showRightSideBar: function () {
        //contentcolumn-default-margin-right  
        $('.contentcolumn', '.saved-reports').addClass('contentcolumn-default-margin-right').removeClass('contentcolumn-margin-right-on-empty-right-sidebar');
        $('.rightcolumn', '.saved-reports').show();
    },

    manipulateDOMObjects: function () {
        // Render all buttons...
        this.element.find("button").button();
        this.element.find(".comment-text").hint('Add your comments here');
        this.$centerContainer.hide();
        this.$bookletViewContainer.hide();
    },

    initReportAndBookletModels: function () {
        // Create the Report definition information list...
        this.reportDefnInfoList = new Sentrana.Models.ReportDefinitionInfoList({
            asc: this.options.sortAsc,
            field: this.options.sortField
        }, this.options.app);

        // Create the Booklet information list...
        this.booklets = new Sentrana.Models.Booklets({
            attrs: {
                asc: this.options.sortAsc,
                field: this.options.sortField
            },
            app: this.options.app
        });
        //initiate the filmstripModel
        this.options.app.bookletDefinModel = new Sentrana.Models.BookletDefin({
            app: this.options.app
        });
        this.options.app.BookletViewController = undefined;
        this.savedReportViewController = undefined;
        this.options.app.booklets = this.booklets;
        this.options.app.reportDefnInfoList = this.reportDefnInfoList;
    },

    initReportAndBookletControllers: function () {
        if (this.$filmstripContainer.control()) {
            this.$filmstripContainer.sentrana_filmstrip('destroy');
        }
        this.options.app.filmstripController = this.$filmstripContainer.sentrana_filmstrip({
            app: this.options.app
        }).control();

        var that = this;
        // Create a Report Definition Info List in the first column...
        var savedReportsCollapsibleController = this.$savedReports.sentrana_collapsible_container({
            title: 'Saved Reports',
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            callBackFunctionOnExpand: function () {
                that.options.app.handleUserInteraction();
            },
            callBackFunctionOnCollapse: function () {
                that.options.app.handleUserInteraction();
            }
        }).control();
        var savedReportsContainer = savedReportsCollapsibleController.getContainerPanel();
        this.savedReportsController = $(savedReportsContainer).sentrana_report_definition_info_list({
            app: this.options.app,
            reportDefnInfoListModel: this.reportDefnInfoList
        }).control();

        var savedBookletsCollapsibleController = this.$savedBooklets.sentrana_collapsible_container({
            title: 'Saved Booklets',
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            callBackFunctionOnExpand: function () {
                that.options.app.handleUserInteraction();
            },
            callBackFunctionOnCollapse: function () {
                that.options.app.handleUserInteraction();
            }
        }).control();
        var savedBookletsContainer = savedBookletsCollapsibleController.getContainerPanel();
        this.savedBookletsController = $(savedBookletsContainer).sentrana_booklet_definition_info_list({
            app: this.options.app,
            bookletsModel: this.booklets
        }).control();
        this.options.app.savedReportsController = this.savedReportsController;
    },

    initReportAndBookletComponents: function () {
        this.initReportAndBookletModels();
        this.initReportAndBookletControllers();
    },

    // Constructor...
    init: function () {
        var that = this;
        this.needToUpdateView = false;
        this.initDOMObjects();
        this.initReportAndBookletComponents();
        this.initDialogs();
        this.manipulateDOMObjects();
        var sideBarWidth = 280;
        var leftSideBar = this.initLeftSideBar(sideBarWidth, that);
        var rightSideBar = this.initRightSideBar(sideBarWidth, that);
        leftSideBar.show();
        rightSideBar.show();
        this.options.app.unBlockMain();
        this.startGetSharingUpdate();
    },

    " show_shared_report": function () {
        if (!this.options.app.sharedInfo || this.options.app.sharedInfo.type !== "report") {
            return;
        }
        var reportelement = this.element.find(".report-entry[report-id = '" + this.options.app.sharedInfo.id + "']");
        this.clearExternalLinkInfo();
        setTimeout(function () {
            reportelement.find(".report-entry-table").click();
        }, 500);
        
    },

    " show_shared_booklet": function () {
        if (!this.options.app.sharedInfo || this.options.app.sharedInfo.type !== "booklet") {
            return;
        }
        var reportelement = this.element.find(".booklet-entry[booklet-id = '" + this.options.app.sharedInfo.id + "']");
        this.clearExternalLinkInfo();
        setTimeout(function() {
            reportelement.find(".booklet-entry-table").click();
        },500);
        
    },

    clearExternalLinkInfo: function () {
        this.options.app.sharedInfo = null;
        this.options.app.externalLink = null;
    },

    startGetSharingUpdate: function (timeOut) {
        var that = this;
        that.options.app.clearSharingUpdateTimer();
        that.options.app.sharingUpdate = window.setInterval(that.proxy(that.initPeriodicServerCall), window.app_resources.UPDATE_SHARING_INFORMATION_IN_SECONDS * 1000);
    },

    initPeriodicServerCall: function () {
        if (this.sharedReportBookletListUpdating) {
            return;
        }
        var that = this,
            userInfo = this.options.app.retrieveUserInfo();
        if (userInfo) {
            $.ajax({
                url: Sentrana.Controllers.BIQController.generateUrl("GetSharingUpdate/" + userInfo.userID),
                type: "GET",
                dataType: "json",
                headers: {
                    sessionID: Sentrana.Controllers.BIQController.sessionID,
                    repositoryID: Sentrana.Controllers.BIQController.repositoryID
                }
            }).done(function (response) {
                that.updateReportBookletList(response);
            }).error(function (err) {});
        }
    },

    updateReportBookletList: function (sharingInfo) {
        if (sharingInfo.length > 0) {
            this.sharedReportBookletListUpdating = true;
            this.reportBookletSharingInfo = sharingInfo;
            this.reportSharingInfo = this.getUpdatedSharedItem(sharingInfo, "REPORT");
            this.bookletSharingInfo = this.getUpdatedSharedItem(sharingInfo, "BOOKLET");

            var message = "";

            for (var i = 0; i < this.reportSharingInfo.length; i++) {
                message += this.reportSharingInfo[i].senderFullName + ' has shared a report with you' + '</br>';
            }

            for (var i = 0; i < this.bookletSharingInfo.length; i++) {
                message += this.bookletSharingInfo[i].senderFullName + ' has shared a booklet with you' + '</br>';
            }

            if (this.element) {
                var notificationBox = this.element.find('.notification-sharing-updates');
                notificationBox.fadeIn().find('.notification').html(message);
            }
        }
    },

    getUpdatedSharedItem: function (sharingInfo, objectType) {
        return $.grep(sharingInfo, function (item) {
            return item.objectType === objectType;
        });
    },

    ".notification-sharing-updates .link-shared-report-booklet click": function () {
        this.element.find('.notification-sharing-updates').fadeOut();

        if (this.reportSharingInfo.length > 0) {
            var html = '<div class="loading"><p class="small-waitingwheel"><img src="images/loader-white.gif"/></p></div>';
            this.options.app.blockElement(this.element.find(".saved-reports-list"), html);
        }

        if (this.bookletSharingInfo.length > 0) {
            html = '<div class="loading"><p class="small-waitingwheel"><img src="images/loader-white.gif"/></p></div>';
            this.options.app.blockElement(this.element.find(".saved-booklets-list"), html);
        }

        this.updateReportList();
        this.updateBookletList();

        this.clearSharingInfoCache();
        this.clearCenterPanelforBooklet();

    },

    clearSharingInfoCache: function () {
        var that = this,
            userInfo = this.options.app.retrieveUserInfo();
        if (userInfo) {
            $.ajax({
                url: Sentrana.Controllers.BIQController.generateUrl("ClearSharingInfoCache/" + userInfo.userID),
                type: "GET",
                dataType: "json",
                headers: {
                    sessionID: Sentrana.Controllers.BIQController.sessionID,
                    repositoryID: Sentrana.Controllers.BIQController.repositoryID
                }
            }).done(function () {
                that.sharedReportBookletListUpdating = false;
            }).error(function (err) {

            });
        }
    },

    updateReportList: function () {
        this.reportDefnInfoList.getSavedReports();
    },

    updateBookletList: function () {
        this.booklets.getSavedBooklets();
    },

    " report_list_updated": function (el, ev) {
        this.options.app.unBlockElement(this.element.find(".saved-reports-list"));
        this.reportListUpdated = true;
    },

    " booklet_list_updated": function (el, ev) {
        this.options.app.unBlockElement(this.element.find(".saved-booklets-list"));
        this.bookletListUpdated = true;
    },

    redirectToBuilderPage: function () {
        if (!this.reportDefnInfoList.count && !this.booklets.count) {
            this.options.app.routeControl.updateRoute('bldr');
        }
    },

    update: function (options) {
        this._super(options);
        if(this.needToUpdateView){
            this.updatePageView();
            this.needToUpdateView = false;
        }
    },

    updatePageView: function () {
        this.updateFilmstripView();

        if (this.options.app.BookletViewController) {
            this.options.app.BookletViewController.updateGridChartView();
        }

        if (this.savedReportViewController) {
            this.savedReportViewController.updateView();
        }
    },

    " refresh_booklet_report": function (el, ev, report) {

        if (this.options.app.bookletController) {
            this.options.app.bookletController.refreshReports(report);
        }
    },

    " update_booklet_reports": function (el, ev) {

        if (this.options.app.bookletController) {
            this.options.app.bookletController.updateSavedReports();
        }
    },

    " report_added_to_booklet": function (el, ev, report) {
        if (this.options.app.bookletController) {
            this.options.app.bookletController.addNewReport(report);
        }
    },

    " addEditbutton_to_bookletView": function (el, ev, params) {
        if (this.options.app.BookletViewController) {
            if (this.options.app.BookletViewController.options) {
                this.options.app.BookletViewController.options.showEdit = true;
            }
            this.options.app.BookletViewController.addEditButton();
        }
    },

    " copy_booklet": function (el, ev, booklet) {
        this.copyBookletDlg.open(booklet);
    },

    " share_booklet": function (el, ev, booklet) {
        this.shareBookletDlg.open(booklet);
    },

    bookletCopied: function (booklet) {
        if (this.savedBookletsController) {
            this.savedBookletsController.options.bookletsModel.addBooklet(booklet);
            this.clearCenterPanelforBooklet();
        }
    },

    updateFilmstripView: function () {
        if (this.options.app.filmstripController) {
            this.options.app.filmstripController.showHideNextPrevNavigator();
        }
    },

    " chart_failed": function () {
        return false;
    },

    changeReportIcon: function (report) {
        var reportEntry = this.element.find(".report-entry[report-id='" + report.id + "']"),
            reportIcon = reportEntry.find('.report-entry-icon'),
            reportIconImage = reportIcon.find('img.icon-file'),
            userInfo = this.options.app.retrieveUserInfo();

        if (!report.shared) {
            $(reportIconImage).attr('src', 'images/report_base.png');
        }
        else if (report.createUser === userInfo.fullName) {
            $(reportIconImage).attr('src', 'images/report_shared.png');
        }
        else if (report.createUser !== userInfo.fullName) {
            $(reportIconImage).attr('src', 'images/report_received.png');
        }
    },

    changeBookletIcon: function (booklet) {

        var bookletEntry = this.element.find(".booklet-entry[booklet-id='" + booklet.id + "']"),
            bookletIcon = bookletEntry.find('.booklet-entry-icon'),
            bookletIconImage = bookletIcon.find('img.icon-file'),
            userInfo = this.options.app.retrieveUserInfo();

        if (!booklet.shared) {
            $(bookletIconImage).attr('src', 'images/booklet_base.png');
        }
        else if (booklet.createUser === userInfo.fullName) {
            $(bookletIconImage).attr('src', 'images/booklet_shared.png');
        }
        else if (booklet.createUser !== userInfo.fullName) {
            $(bookletIconImage).attr('src', 'images/booklet_received.png');
        }
    },

    " edit_booklet": function (el, ev, booklet) {
        if (this.options.app.BookletViewController && !this.options.app.BookletViewController._destroyed) {
            this.options.app.BookletViewController.destroy();
            this.options.app.BookletViewController = undefined;
        }
        if (this.$bookletView.control()) {
            this.$bookletView.control().destroy();
            this.$bookletView.html('');
        }

        this.options.app.bookletController = $('.booklet-composition-panel-container').sentrana_booklet_composition({
            app: this.options.app,
            bookletDefinModel: this.options.app.bookletDefinModel,
            bookletModel: booklet,
            "showEdit": true
        }).control();
    },

    " clear_center_panel": function (el, ev, keepBookletMenu) {
        this.clearCenterPanelforBooklet(keepBookletMenu);
    },

    clearCenterPanelforBooklet: function (clearMenu) {
        if (this.viewingReport) {
            this.viewingReport.isViewing(false);
        }

        if (this.$centerContainer) {
            this.$centerContainer.hide();
            this.$bookletViewContainer.hide();
        }

        this.$bookletCompositionContainer.show();

        if (this.$commentStream.control()) {
            this.$commentStream.sentrana_comment_stream('destroy');
        }

        this.$commentStream.hide();

        if (this.options.app.bookletController) {
            this.options.app.bookletController.destroyThisController();
        }

        if (this.options.app.BookletViewController) {
            this.options.app.BookletViewController.destroy();
        }

        this.options.app.resetFilmstrip();
        this.hideRightSideBar();

        if (clearMenu) {
            //clear report menu
            var $reportEntry = this.element.find('.report-entry');
            $reportEntry.removeClass('report-entry-selected');
            $reportEntry.find('.menu .item').removeClass('item-selected');
            $reportEntry.find('.menu').hide();
            $reportEntry.find('.report-details').hide();

            //clear booklet menu
            var $bookletEntry = this.element.find('.booklet-entry');
            $bookletEntry.removeClass('booklet-entry-selected');
            $bookletEntry.find('.booklet-menu .item').removeClass('item-selected');
            $bookletEntry.find('.booklet-menu').hide();
            $bookletEntry.find('.booklet-details').hide();
        }
    },

    " hide_report": function () {
        if (this.viewingReport) {
            this.viewingReport.isViewing(false);
        }

        //if any controller is associated with it then destroy it first
        if (this.$savedReportViewerContainer.control()) {
            this.$savedReportViewerContainer.sentrana_report_view('destroy');
            this.$savedReportViewerContainer.empty();
        }

        // Hide the second column...
        if (this.$centerContainer) {
            this.$centerContainer.hide();
        }

        this.savedReportViewController = undefined;
    },

    // Synthetic Event: View a report...
    " view_report": function (el, ev, report) {

        //action log
        var actionLog = {
            ActionName: Sentrana.ActionLog.ActionNames.ViewReport,
            Context: Sentrana.ActionLog.Contexts.SavedReport,
            ElementType: Sentrana.ActionLog.ElementTypes.Report,
            ElementId: report.id
        };

        var userInfo = this.options.app.retrieveUserInfo();
        if (userInfo && userInfo.userID !== report.createUserId) {
            actionLog.Context = Sentrana.ActionLog.Contexts.SharedReport;
        }

        this.options.app.writeActionLog(actionLog);

        // Were we already looking at a report?
        if (this.viewingReport) {
            this.viewingReport.isViewing(false);
        }
        // Record the report we are viewing...
        this.viewingReport = report;

        // Indicate that this report is being viewed...
        this.viewingReport.isViewing(true);

        // Show the second column...
        this.$centerContainer.show();
        this.$bookletViewContainer.hide();
        this.options.app.resetFilmstrip();

        //if any controller is associated with it then destroy it first
        if (this.$savedReportViewerContainer.control()) {
            this.$savedReportViewerContainer.sentrana_report_view('destroy');
            this.$savedReportViewerContainer.empty();
        }

        this.savedReportViewController = this.$savedReportViewerContainer.sentrana_report_view({
            app: this.options.app,
            showFilters: true,
            showExport: true,
            showPrint: true,
            showChartOptions: true,
            reportDefinitionInfoModel: report
        }).control();
        this.savedReportViewController.setTitle('Report Title: ', report.name + ' - by ' + report.createUser);
        this.savedReportViewController.viewReport(report);

        // Show the third column!		
        this.$rightBar.show();
    },

    " show_comment_stream": function (el, ev, report) {
        if (report === null || !report) {
            this.hideRightSideBar();
        }
        else {
            this.showRightSideBar();
        }

        //if any controller is associated with it then destroy it first
        if (this.$commentStream.control()) {
            this.$commentStream.sentrana_comment_stream('destroy');
        }

        if (report) {
            this.$rightBar.show();
            this.$commentStream.show();
            this.$commentStream.sentrana_comment_stream({
                app: this.options.app,
                commentStreamModel: report.getCommentStream()
            });
        }
        else {
            this.$commentStream.hide();
        }

    },

    // Synthetic Event: Edit a report...
    " edit_report": function (el, ev, report) {
        // Are we currently viewing this report?
        if (this.viewingReport && this.viewingReport.id === report.id) {

            this.element.trigger("hide_report", report);

            //remove the selected status of view button
            this.element.find('.report-entry[report-id="' + report.id + '"]').children('.menu').children('span[action="view"]').removeClass('item-selected');
        }

        // Select the Builder page and send the edit_report event to it...
        this.options.app.switchToPage("bldr", "edit_report", report);
    },

    " duplicate_report": function (el, ev, report) {
        this.duplicateRptDlg.open(report);
    },

    " delete_report": function (el, ev, report) {
        this.deleteRptDlg.open(report);
    },

    " delete_booklet": function (el, ev, booklet) {
        this.deleteBookletDlg.open(booklet);
    },

    " rdi:destroyed": function (el, ev, id) {
        if (this.viewingReport && this.viewingReport.id === id) {
            this.viewingReport = null;

            this.$centerContainer.hide();
            this.$rightBar.hide();
        }
    },

    " booklet:destroyed": function (el, ev, id) {
        this.clearCenterPanelforBooklet();
    },

    " hide_booklet": function (el, ev, booklet) {
        this.$bookletViewContainer.hide();
        this.options.app.resetFilmstrip();
        this.options.app.BookletViewController = undefined;
    },

    // Synthetic Event: View a booklet...
    " view_booklet": function (el, ev, booklet) {

        var that = this;
        var html = '<div class="loading"><p class="small-waitingwheel"><img src="images/loader-white.gif"/></p></div>';
        this.options.app.blockElement(this.$bookletView, html);

        //action log
        var actionLog = {
            ActionName: Sentrana.ActionLog.ActionNames.ViewBooklet,
            Context: Sentrana.ActionLog.Contexts.SavedBookLet,
            ElementType: Sentrana.ActionLog.ElementTypes.Booklet,
            ElementId: booklet.id
        };

        var userInfo = this.options.app.retrieveUserInfo();
        if (userInfo && userInfo.userID !== booklet.createUserId) {
            actionLog.Context = Sentrana.ActionLog.Contexts.SharedBooklet;
        }

        this.options.app.writeActionLog(actionLog);

        // Show the second column...
        this.$centerContainer.hide();
        this.$bookletCompositionContainer.hide();
        this.$bookletViewContainer.show();

        if (this.$bookletView.control()) {
            this.$bookletView.control().destroy();
            this.$bookletView.html('');
        }

        if (this.options.app.BookletViewController && !this.options.app.BookletViewController._destroyed) {
            this.options.app.BookletViewController.destroy();
            this.options.app.BookletViewController = undefined;
        }

        this.options.app.bookletDefinModel.setBookletDefinition(booklet);

        this.options.app.BookletViewController = this.$bookletView.sentrana_booklet_view({
            app: this.options.app,
            bookletDefinModel: this.options.app.bookletDefinModel,
            "titleCls": 'report-definition-header-bar'
        }).control();

        // Show the third column!		
        this.$rightBar.show();
    },

    "{window} resize": function () {
        //this.updatePageView();
    },

    " print_closed": function () {
        if ($('#bldr').control()) {
            $('#bldr').control().needToUpdateView = true;
        }
    }
});
