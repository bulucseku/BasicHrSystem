Sentrana.Controllers.FilterControl("Sentrana.Controllers.FilterControlCheckboxOnlyWhen", {
    pluginName: "sentrana_filter_control_checkbox_only_when",
    defaults: {}
}, {

    init: function () {
        this.$onlywhenfilterControl = this.element.find(".onlywhen-element-filter");
        this._super();
    },

    buildElementsUI: function () {
        var form = this.options.form;
        var objects = $.extend([], form.elements);
        this.renderFilterCheckBoxes(objects);
    },

    searchElements: function (el, ev) {
        var inputText = $(el).val();

        var objects = $.extend([], this.options.form.elements);

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
        can.view('templates/filterCheckboxOnlyWhen.ejs', {
            objects: objects,
            totoalCount: objects.length,
            tag: this.options.tag
        }, function (frag) {
            that.$onlywhenfilterControl.append(frag);
        });
    },

    '.object-selector change': function (el, ev) {
        this.element.trigger(this.options.tag + "-filter-selected", el);
    }
});
