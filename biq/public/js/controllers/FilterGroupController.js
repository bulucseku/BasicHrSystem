Sentrana.Controllers.FilterControl("Sentrana.Controllers.FilterGroup", {
    pluginName: "sentrana_filter_group",
    defaults: {
    }
}, {
    // Class constructor: Called only once for all invocations of the helper method...
    init: function FG_init() {
        this.buildElementsUI();
    },

    // Instance method: Build the user interface for the Attribute Elements...
    buildElementsUI: function () {
        var objects = $.extend([], this.options.savedFilters);
        this.renderFilterCheckBoxes(objects);
    },

    renderFilterCheckBoxes: function (objects) {
        var that = this;
        can.view('templates/filterCheckbox.ejs', { objects: objects, totoalCount: objects.length }, function (frag) {
            that.element.append(frag);
        });
    },

    // Browser Event: What to do when a user clicks on a object selector...
    '.object-selector change': function (el, ev) {
        if ($(el).is(':checked')) {
            this.selectFilterElement(el);
        } else {
            this.deSelectFilterElement(el);
        }
    }
});
