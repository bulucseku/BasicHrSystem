/*...................Sentrana.Controllers.BookletDefinitionInfo........................*/

can.Control.extend("Sentrana.Controllers.BookletDefinitionInfo", {

    pluginName: 'sentrana_booklet_definition_info',
    defaults: {
        app: null,
        bookletModel: null
    }
}, {

    init: function RDIC_init() {
        // Locate our jQuery objects...
        this.$name = this.element.find(".name");
        this.$lastMod = this.element.find(".booklet-details-last-mod");
        this.$totalReports = this.element.find(".booklet-details-last-total-report");
        this.$details = this.element.find(".booklet-details");

    },

    ".booklet-entry-table click": function (el, ev) {
        this.togglePreviousSelection(el);
        if (el.parent().hasClass('booklet-entry-selected')) {
            this.element.trigger("view_booklet", this.options.bookletModel);
        }
        else {
            this.element.trigger("hide_booklet", this.options.bookletModel);
        }
    },

    togglePreviousSelection: function (el) {
        this.element.trigger("clear_center_panel");
        this.element.trigger("show_comment_stream", null);

        var $menu = el.siblings(".booklet-entry-menus");
        var $bookletDetails = el.siblings('.booklet-details');
        var $bookletEntry = el.parent();

        //Remove report selection
        var $reportEntry = $('.report-entry');
        $reportEntry.removeClass('report-entry-selected');
        $reportEntry.find('.report-details').hide();

        //Remove booklet selection
        $('.booklet-entry').not(el.parent()).removeClass('booklet-entry-selected');
        $('.booklet-entry .booklet-entry-menus .booklet-entry-menu').not($menu.children('.booklet-entry-menu')).removeClass('item-selected');

        $('.booklet-entry .booklet-details').not($bookletDetails).hide();
        $bookletEntry.toggleClass('booklet-entry-selected');

        if (!$bookletEntry.hasClass('booklet-entry-selected')) {
            $bookletDetails.hide();
        }
    },

    ".booklet-entry-menus click": function (el, ev) {
        $(".booklet-entry-menus .dropdown-menu").hide();
        $(el).find(".dropdown-menu").show();
        return false;
    },

    ".booklet-entry-table mouseleave": function (el, ev) {
        el.find(".booklet-entry-menus").css('visibility', 'hidden');
        el.find(".dropdown-menu").hide();
        return false;
    },

    ".booklet-entry-table mouseenter": function (el, ev) {
        el.find(".booklet-entry-menus").css('visibility', 'visible');
        return false;
    },

    ".booklet-entry-menu click": function (el, ev) {

        var action = el.attr("action");

        switch (action) {
        case "details":
            this.$details.slideToggle();
            break;

        case "edit":
            if (this.options.app.bookletController) {
                this.options.app.bookletController.destroyThisController();
            }
            $(".item[action='view']").removeClass('item-selected');

            $(el).toggleClass('item-selected');
            $(el).prev().toggleClass('item-selected-prev');

            this.element.trigger("clear_center_panel");

            if ($(el).hasClass('item-selected')) {
                this.element.trigger("edit_booklet", this.options.bookletModel);
            }
            else {
                this.element.trigger("hide_booklet", this.options.bookletModel);
            }

            break;

        case "copy":
            this.element.trigger("copy_booklet", this.options.bookletModel);
            break;

        case "delete":
            this.element.trigger("delete_booklet", this.options.bookletModel);
            break;

        case "share":
            this.element.trigger("share_booklet", this.options.bookletModel);
            break;

        default:
            break;
        }

        setTimeout(function () {
            $(el).parent().hide();
        }, 10);

        return false;
    },

    "{bookletModel} destroyed": function (bookletModel, ev) {
        this.element.trigger("booklet:destroyed", bookletModel.id);
    },

    "{bookletModel} updated": function (bookletModel, ev) {
        this.$name.text(bookletModel.name);
        this.$lastMod.text(bookletModel.formatModified());
        this.$totalReports.text(bookletModel.numberOfReports);
    }
});
