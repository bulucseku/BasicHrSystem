/**
 * @class ReportDefinitionInfoList
 * @module Sentrana
 * @namespace Sentrana.Controllers
 * @extends jQuery.Controller
 * @description This class is a controller which manages the display of the full report list
 * which includes ways to change the sorting of the list.
 */
can.Control.extend("Sentrana.Controllers.ReportDefinitionInfoList", {

    pluginName: 'sentrana_report_definition_info_list',
    defaults: {
        app: null,
        reportDefnInfoListModel: null
    }
}, {
    // Constructor...
    init: function RDILC_init() {
        this.loadDomElement();
        this.options.reportDefnInfoListModel.getSavedReports();
    },

    getReport: function(id) {
        var reports = $.grep(this.options.reportDefnInfoListModel.getList(), function (rpt) {
            return rpt.id === id;
        });
        return reports[0];
    },

    filterReportsForSearchText: function (entries, that) {
        //if searchValue is not empty then filter the reports
        if (this.searchValue) {
            entries = $.grep(entries, function (reports, index) {
                return reports.name.toLowerCase().indexOf(that.searchValue.toLowerCase()) > -1 ||
                    reports.createUser.toLowerCase().indexOf(that.searchValue.toLowerCase()) > -1 ||
                    Sentrana.formatDateValue(new Date(reports.createDate), "MM/dd/yyyy").toLowerCase().indexOf(that.searchValue.toLowerCase()) > -1;
            });
        }
        return entries;
    },

    populateReportEntriesinSideBar: function (entries) {
        var groupName = "",
            that = this;
        var groupContainerDic = {};

        // Get the currently saved user info...
        var userInfo = that.options.app.retrieveUserInfo();

        //when session is out then go to the login page.
        if (!userInfo) {
            Sentrana.FirstLook.closeSession("timeout");
            return;
        }

        // Loop through each of the entries in our list...
        $.each(entries, function (index, rdi) {
            // Is this a new group?
            if (rdi.groupName != groupName) {
                // Record the new group name...
                groupName = rdi.groupName;

                // Add the report group...
                var nameWithOutSpecialChar = groupName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');

                that.$reportList.append('<div class="report-list-grp-' + nameWithOutSpecialChar + '"></div>');
                var groupContainer = $('.report-list-grp-' + nameWithOutSpecialChar).sentrana_side_bar_collapsible_container({
                    title: groupName,
                    showHeader: true,
                    showBorder: true,
                    allowCollapsible: true,
                    callBackFunctionOnExpand: function () {
                        that.options.app.handleUserInteraction();
                    },
                    callBackFunctionOnCollapse: function () {
                        that.options.app.handleUserInteraction();
                    }
                }).control().getContainerPanel();
                groupContainerDic[groupName] = groupContainer;
            }

            // Render the report entry...
            $(groupContainerDic[groupName]).append(can.view("templates/reportEntry.ejs", {
                reportInfo: rdi,
                userInfo: userInfo
            }));
            // Associate a Controller with the report entry...
            that.element.find('.report-entry[report-id="' + rdi.id + '"]').sentrana_report_definition_info({
                app: that.options.app,
                reportDefinitionInfoModel: rdi
            });
        });
    },

    // Instance Method: Update the full list, replacing the existing contents...
    updateReportList: function RDILC_updateReportList() {
        // Hide our loading message...
        this.$loading.hide();

        // Clear out the report list container...
        this.$reportList.empty();

        // Record the current group name...
        var entries = this.options.reportDefnInfoListModel.getList();
        entries = this.filterReportsForSearchText(entries, this);
        this.populateReportEntriesinSideBar(entries);

        // Show the appropriate section...
        if (entries.length) {
            this.$hasReports.show();
            this.$noReports.hide();
            // Resize our elements...
            this.resizeElements();
        }
        else {
            //if no report found after search then do not switch to the builder page.
            if (!this.searchValue) {
                this.$noReports.show();
                this.$hasReports.hide();
            }
        }

        //hide the center panel
        this.element.trigger("hide_report", this.options.reportDefnInfoListModel);
        this.element.trigger("report_list_updated");

        if ($('.nb-l1-btn.selected').attr('l1btn') === "saved") {
            $('.btn-add-booklet').css('display', 'block');
            this.options.app.resetFilmstrip();
        }
    },

    // Instance Method: Resize elements to reflect the current window...
    resizeElements: function resizeElements() {
        var offset = this.$reportList.offset(),
            windowHeight = $(window).height(),
            windowWidth = $(window).width(),
            $footer = $(".footer"),
            footerHeight = $footer.outerHeight(true);

        // Resize the report list to fill the window. Must account for scroll bar height...			
        //this.$reportList.height(windowHeight - offset.top - footerHeight);
    },

    searchReports: function (el) {
        this.searchValue = $(el).val();
        this.updateReportList();
    },

    initializeReportEntry: function () {
        var $menu = $(".report-entry .menu");
        var $reportDetails = $('.report-entry .report-details');
        var $reportEntry = $('.report-entry');

        $reportEntry.removeClass('report-entry-selected');
        $('.item', $menu).removeClass('item-selected');
        $menu.hide();
        $reportDetails.hide();
    },
    // What to do when the window resizes...
    "{window} resize": function (el, evl) {
        this.resizeElements();
    },

    // Browser Event: What to do when the user clicks on the sort field link...
    ".sort-field click": function (el, ev) {
        this.options.reportDefnInfoListModel.changeSortField(el.attr('id'));
        //set the selected item action
        //clear all active items first
        this.element.find('.sort-field').parent().removeClass('active');
        el.parent().addClass('active');
        this.element.trigger("show_comment_stream", null);
    },

    // Browser Event: What to do when the user clicks on the sort order link...
    ".sort-order click": function (el, ev) {
        ev.preventDefault();
        this.options.reportDefnInfoListModel.toggleSortOrder();
    },

    // Start to search while the user is typing
    ".accordion-search-input keyup": function (el, ev) {
        this.searchReports(el);
        this.element.trigger("show_comment_stream", null);
    },

    // Synthetic Event: What to do when the model changes...
    "{reportDefnInfoListModel} change": function (reportDefnInfoListModel, ev, attr, how, newVal, oldVal) {

        if (reportDefnInfoListModel.ignoreChange) {
            return;
        }
        // What has changed?
        switch (attr) {
        case "asc":
            this.updateReportList();
            break;
        case "field":
            this.updateReportList();
            break;
        case "count":
            // Do we have a positive count?
            if (newVal >= 0) {
                this.$reportCount.text(newVal);
                this.updateReportList();
                this.element.trigger("show_shared_report");
                this.element.trigger("update_booklet_reports");

            }
            else if (newVal === -2) {
                // Error!
                this.$loading.html("<p>" + Sentrana.getMessageText(window.app_resources.app_msg.report_load.failed) + "</p>");
            }
            break;
        default:
            break;
        }
    },

    loadDomElement: function () {

        this.element.html(can.view("templates/reportListLayout.ejs", {
            model: this.options.reportDefnInfoListModel
        }));

        this.$reportList = $(".report-list", this.element);
        this.$reportCount = $(".report-count", this.element);
        this.$noReports = $(".no-reports", this.element);
        this.$hasReports = $(".has-reports", this.element);
        this.$loading = $(".loading", this.element);

    },

    // Synthetic Event: An underlying report definition info object has a changed date...
    " reportDefinitionInfoModel:date_change": function (el, ev) {
        this.updateReportList();
        this.element.trigger("show_comment_stream", null);
    },

    // Synthetic Event: What to do when a report is destroyed...
    " reportDefinitionInfoModel:destroyed": function (el, ev, id) {
        // Diagnostics --gjb
        // console.log("In Sentrana.Controllers.ReportDefinitionInfoList.rdi:destroyed");

        // Ask our model to remove this object...
        this.options.reportDefnInfoListModel.removeReport(id);
        this.element.trigger("show_comment_stream", null);
    },

    // Synthetic Event: What to do when a new Sentrana.Models.ReportDefinitionInfo is created...
    "{Sentrana.Models.ReportDefinitionInfo} created": function (cls, ev, reportDefinitionInfoModel) {
        reportDefinitionInfoModel.app = this.options.app;
        if (reportDefinitionInfoModel.bookletId) {
            this.element.trigger("report_added_to_booklet", reportDefinitionInfoModel);
        }
        else {
            this.options.reportDefnInfoListModel.addReport(reportDefinitionInfoModel);
            this.element.trigger("show_comment_stream", null);
        }
    },

    "{Sentrana.Models.ReportDefinitionInfo} updated": function (cls, ev, reportDefinitionInfoModel) {
        reportDefinitionInfoModel.app = this.options.app;
        if (!reportDefinitionInfoModel.bookletId) {
            this.options.reportDefnInfoListModel.removeReport(reportDefinitionInfoModel.id);
            this.options.reportDefnInfoListModel.addReport(reportDefinitionInfoModel);
            this.element.trigger("show_comment_stream", null);
        }
    }
});
