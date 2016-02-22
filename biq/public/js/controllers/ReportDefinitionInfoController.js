/**
 * @class ReportDefinitionInfo
 * @module Sentrana
 * @namespace Sentrana.Controllers
 * @extends jQuery.Controller
 * @description This class is a controller which manages the display of a report and handles
 * events raised on it.
 */
can.Control.extend("Sentrana.Controllers.ReportDefinitionInfo", {

    pluginName: 'sentrana_report_definition_info',
    defaults: {
        app: null,
        reportDefinitionInfoModel: null
    }
}, {
    // Constructor...
    init: function RDIC_init() {
        // Locate our jQuery objects...
        this.$name = this.element.find(".name");
        this.$lastMod = this.element.find(".report-details-last-mod");
        this.$columns = this.element.find(".report-details-columns");
        this.$filter = this.element.find(".report-details-filter");
        this.$details = this.element.find(".report-details");
    },

    ".report-entry-table mouseleave": function (el, ev) {
        el.find(".report-entry-menus").css('visibility', 'hidden');
        el.find(".dropdown-menu").hide();
        return false;
    },

    ".report-entry-table mouseenter": function (el, ev) {
        el.find(".report-entry-menus").css('visibility', 'visible');
        return false;
    },

    // Browser Event: What to do when a user clicks on a report entry's name...
    ".report-entry-table click": function (el, ev) {
        this.togglePreviousSelection(el);
        if (el.parent().hasClass('report-entry-selected')) {
            this.element.trigger("view_report", this.options.reportDefinitionInfoModel);
        }
        else {
            this.element.trigger("hide_report", this.options.reportDefinitionInfoModel);
        }
    },

    togglePreviousSelection: function (el) {
        this.element.trigger("clear_center_panel");

        var $menu = el.siblings(".report-entry-menus");
        var $reportDetails = el.siblings('.report-details');
        var $reportEntry = el.parent();

        //remove selected booklet style
        var $bookletEntry = $('.booklet-entry');
        $bookletEntry.removeClass('booklet-entry-selected');
        $bookletEntry.find('.booklet-details').hide();

        $('.report-entry').not(el.parent()).removeClass('report-entry-selected');
        $('.report-entry .report-entry-menus .report-entry-menu').not($menu.children('.report-entry-menu')).removeClass('item-selected');
        $('.report-entry .report-details').not($reportDetails).hide();

        $reportEntry.toggleClass('report-entry-selected');

        if (!$reportEntry.hasClass('report-entry-selected')) {
            $reportDetails.hide();
            this.element.trigger("show_comment_stream", null);
        }
        else {
            this.element.trigger("show_comment_stream", this.options.reportDefinitionInfoModel);
        }
    },

    ".report-entry-menus click": function (el, ev) {
        $(".report-entry-menus .dropdown-menu").hide();
        $(el).find(".dropdown-menu").show();
        return false;
    },

    // Browser Event: What to do when an user clicks on a menu item...
    ".report-entry-menu click": function (el, ev) {

        var action = el.attr("action");

        // Switch on the action...
        switch (action) {
        case "details":
            this.$details.slideToggle();
            break;

        case "edit":
            // Send an event to indicate that a report should edited...
            this.element.trigger("edit_report", this.options.reportDefinitionInfoModel);
            break;

        case "copy":
            // Send an event to indicate that a report should be duplicated...
            this.element.trigger("duplicate_report", this.options.reportDefinitionInfoModel);
            break;

        case "delete":
            // Send an event indicating that a report should be deleted...
            this.element.trigger("delete_report", this.options.reportDefinitionInfoModel);
            break;

        case "share":
            this.element.trigger("share_report", this.options.reportDefinitionInfoModel);
            break;

        default:
            break;
        }

        setTimeout(function () {
            $(el).parent().hide();
        }, 10);

        return false;
    },

    closeBookletCompositionPanel: function () {
        if (this.options.app.bookletController) {
            this.options.app.bookletController.destroyThisController();
        }
    },

    // Synthetic Event: What to do when our model has changed...
    "{reportDefinitionInfoModel} updated": function (reportDefinitionInfoModel, ev) {
        // Update all fields...
        this.$name.text(reportDefinitionInfoModel.name);
        this.$lastMod.text(reportDefinitionInfoModel.formatModified());
        this.$columns.text(reportDefinitionInfoModel.formatColumns());
        this.$filter.text(reportDefinitionInfoModel.formatFilter());

        // Assume that the last modification date changed...
        this.element.trigger("reportDefinitionInfoModel:date_change");
    },

    // Synthetic Event: What to do when our model is destroyed...
    "{reportDefinitionInfoModel} destroyed": function (reportDefinitionInfoModel, ev) {
        // Diagnostics --gjb
        // console.log("In Sentrana.Controllers.ReportDefinitionInfo.{model} destroyed!");

        // Raise up an event to our container...
        this.element.trigger("reportDefinitionInfoModel:destroyed", reportDefinitionInfoModel.id);
    },

    // Synthetic Event: What to do when a local property changes...
    "{reportDefinitionInfoModel} viewing": function (reportDefinitionInfoModel, ev, newVal) {
        this.element[(newVal) ? "addClass" : "removeClass"]("saved-report-viewing");
    }
});
