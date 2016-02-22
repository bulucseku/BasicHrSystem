Sentrana.Controllers.FilterControl("Sentrana.Controllers.FilterControlCheckbox", {
    pluginName: "sentrana_filter_control_checkbox",
    defaults: {}
}, {
    // Class constructor: Called only once for all invocations of the helper method...
    init: function FCB_init() {
        this._super();
    },

    // Instance method: Build the user interface for the Attribute Elements...
    buildElementsUI: function () {
        var form = this.options.form;
        var objects = $.extend([], form.elements);
        this.renderFilterCheckBoxes(objects);
        this.element.trigger("filter_rendered", this.options.attr.dimName);
    },

    // The method to display the elements that match the search criteria.
    // Implement the parent abstract method.
    searchElements: function (el, ev) {
        var inputText = $(el).val();

        //Show/hide checkboxes based on the search input text
        this.element.find('.object-selector-wrapper').children('label').each(function (index) {
            var $this = $(this);
            if ($this.text().toLowerCase().indexOf(inputText.toLowerCase()) > -1) {
                $this.parent().show();
            }
            else {
                $this.parent().hide();
            }
        });
    },

    renderFilterCheckBoxes: function (objects) {
        var that = this;
        var frag = can.view('templates/filterCheckbox.ejs', {
            objects: objects,
            totalCount: objects.length
        });
        this.$filterControl.append(frag);
    },

    // Browser Event: What to do when a user clicks on a object selector...
    '.object-selector change': function (el, ev) {
        if ($(el).is(':checked')) {
            this.selectFilterElement(el);
        }
        else {
            this.deSelectFilterElement(el);
        }
    }
});
