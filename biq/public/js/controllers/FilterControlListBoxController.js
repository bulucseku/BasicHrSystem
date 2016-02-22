Sentrana.Controllers.FilterControl("Sentrana.Controllers.FilterControlListBox", {
    pluginName: "sentrana_filter_control_list_box",
    defaults: {
        listBoxWidth: 200
    }
}, {
    // Class constructor: Called only once for all invocations of the helper method...
    init: function FCLB_init() {
        this._super();
    },

    // Instance method: Build the user interface for the Attribute Elements...
    buildElementsUI: function () {
        var form = this.options.form;

        this.$filterControl.append('<select class="element-filter-listbox form-control" size="10" multiple="multiple"></select>');
        this.$filterControl.append('<select class="element-filter-listbox-source" size="10" style="display: none" multiple="multiple"></select>');
        for (var i = 0; i < form.elements.length; i++) {
            $(".element-filter-listbox", this.$filterControl).append(can.view('templates/filterListBoxOption.ejs', {
                name: form.elements[i].name,
                hid: form.elements[i].hid
            }));
            $(".element-filter-listbox-source", this.$filterControl).append(can.view('templates/filterListBoxOption.ejs', {
                name: form.elements[i].name,
                hid: form.elements[i].hid
            }));
        }

        //Add event handler
        this.addEventHandler();

        this.element.trigger("filter_rendered", this.options.attr.dimName);
    },

    // The method to display the elements that match the search criteria.
    // Implement the parent abstract method.
    searchElements: function (el, ev) {
        var that = this;
        var inputText = $(el).val();
        $(".element-filter-listbox", this.$filterControl).html("");
        $.each($(".element-filter-listbox-source option", this.$filterControl), function (index, option) {
            var buttonText = $(option).text();
            if (inputText === "" || buttonText.toLowerCase().indexOf(inputText.toLowerCase()) > -1) {
                $(".element-filter-listbox", that.$filterControl).append(can.view('templates/filterListBoxOption.ejs', {
                    name: $(option).val(),
                    hid: $(option).attr("hid")
                }));
            }
        });
    },

    addFilter: function () {
        var that = this;

        $.each($('.element-filter-listbox option:not(:selected)', this.$filterControl), function (index, option) {
            that.deSelectFilterElement($(option));
        });

        $.each($(".element-filter-listbox option:selected", this.$filterControl), function (index, option) {
            that.selectFilterElement($(option));
        });
    },

    addEventHandler: function () {
        var that = this;
        // Browser Event: What to do when a user clicks on an object in the list box...
        // mouseup event is going to capture all the changes made to the control.    
        $('.element-filter-listbox', this.$filterControl).on('change', function (el) {
            that.addFilter();
        });

    }
});
