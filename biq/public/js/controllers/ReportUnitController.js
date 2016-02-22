can.Control.extend("Sentrana.Controllers.ReportUnit", {

    pluginName: 'sentrana_report_unit',
    defaults: {
        ruModel: null,
        rdModel: null
    }
}, {

    ".tu-close-container click": function (el, ev) {
        this.options.rdModel.deselectObject(this.options.ruModel.hid);
    },

    ".fu-close-container click": function (el, ev) {
        this.options.rdModel.deselectObject(this.options.ruModel.hid);
    },

     ".fu-header click": function (el, ev) {
         if (!this.element || !this.isGroupFilter()) {
             return;
         }
         this.element.find(".link-saved-filters").slideToggle(200);
         this.toggleUpDnImage();
     },

    isGroupFilter: function() {
        return this.options.object.dimName === "GroupedFilter";  
    },

    toggleUpDnImage: function () {
        var $header = this.element.find(".fu-header");
        var i = $('i', $header);
        $(i[0]).toggleClass("fa-rotate-90");
    },

    ".link-saved-filters click": function(el, ev) {
        this.element.trigger("link-saved-filters-clicked", this.options.object);
    }
});
