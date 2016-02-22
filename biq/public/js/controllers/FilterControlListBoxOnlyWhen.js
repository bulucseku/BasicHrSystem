Sentrana.Controllers.FilterControlListBox("Sentrana.Controllers.FilterControlListBoxOnlyWhen", {
    pluginName: "sentrana_filter_control_list_box_only_when",
    defaults: {
        listBoxWidth: 150
    }
}, {

    init: function FCLB_init() {
        this.$onlywhenfilterControl = this.element.find(".onlywhen-element-filter");
        this._super();
    },

    buildElementsUI: function () {
        var form = this.options.form;

        this.$onlywhenfilterControl.append('<select class="element-filter-listbox-onlywhen form-control" size="10" multiple="multiple"></select>');
        this.$onlywhenfilterControl.append('<select class="element-filter-listbox-source-onlywhen" size="10" style="display: none" multiple="multiple"></select>');
        for (var i = 0; i < form.elements.length; i++) {
            $(".element-filter-listbox-onlywhen", this.$onlywhenfilterControl).append(can.view('templates/filterListBoxOption.ejs', {
                name: form.elements[i].name,
                hid: form.elements[i].hid
            }));
            $(".element-filter-listbox-source-onlywhen", this.$onlywhenfilterControl).append(can.view('templates/filterListBoxOption.ejs', {
                name: form.elements[i].name,
                hid: form.elements[i].hid
            }));
        }

        this.addEventHandler();
    },

    searchElements: function (el, ev) {
        var that = this;
        var inputText = $(el).val();
        $(".element-filter-listbox-onlywhen", this.$onlywhenfilterControl).html("");
        $.each($(".element-filter-listbox-source-onlywhen option", this.$onlywhenfilterControl), function (index, option) {
            var buttonText = $(option).text();
            if (inputText === "" || buttonText.toLowerCase().indexOf(inputText.toLowerCase()) > -1) {
                $(".element-filter-listbox-onlywhen", that.$onlywhenfilterControl).append(can.view('templates/filterListBoxOption.ejs', {
                    name: $(option).val(),
                    hid: $(option).attr("hid")
                }));
            }
        });
    },

    addFilter: function () {
        var that = this,
            options = [];

        $.each($(".element-filter-listbox-onlywhen option:selected", this.$onlywhenfilterControl), function (index, option) {
            options.push(option);
        });

        that.element.trigger(this.options.tag + "-filter-selected", {
            options: options,
            isListbox: true
        });
    },

    addEventHandler: function () {
        var that = this;

        $('.element-filter-listbox-onlywhen', this.$onlywhenfilterControl).on('change', function (el) {
            that.addFilter();
        });

    }
});
