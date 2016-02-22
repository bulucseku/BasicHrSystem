can.Control.extend("Sentrana.Controllers.FilterControl", {

    pluginName: 'sentrana_filter_control',
    defaults: {
        dwRepository: null,
        dwSelection: null,
        attr: null,
        form: null
    }
}, {
    // Class constructor: Called only once for all invocations of the helper method...
    init: function FC_init() {
        // Define our jQuery objects...
        this.$filterControl = this.element.find(".element-filter");

        var that = this;
        this.$filterControl.html(can.view('templates/loadingwheel.ejs', {
            message: "Loading...",
            hideImage: false
        }));
        this.options.dwRepository.checkLoadedForm(this.options.form, false).then(
            function () {
                that.updateView();
            },
            function () {
                that.$filterControl = that.element.find(".element-filter");
                that.$filterControl.html(Sentrana.getMessageText(window.app_resources.app_msg.column_filter.load_error));
            }
        );
    },

    // Instance method: Called each time the helper method is invoked...
    update: function FC_update(options) {
        this._super(options);

        this.updateView();
    },

    // Instance method: Render the UI
    updateView: function FC_updateView() {
        this.$filterControl = this.element.find(".element-filter");
        this.$filterControl.html("");
        if (!this.options.form.elements || this.options.form.elements.length <= 10) {
            $(".accordion-search", this.element).hide();
        }
        // Sanity check: do we have a model?
        if (!this.options.dwRepository && !this.options.attr) {
            return;
        }

        this.setUMDataFilter();

        // Build the attribute elements UI...
        this.buildElementsUI();
    },

    setUMDataFilter: function () {
        for (var i = 0; i < this.options.attr.forms.length; i++) {
            var form = this.options.attr.forms[i];
            form.dataFilterOperator = this.options.dwRepository.getDataFilterOperator(form.oid);
            for (var j = 0; j < form.elements.length; j++) {
                this.options.dwRepository.setUMDataFilterToElement(this.options.attr, form, form.elements[j]);
            }

            this.filterElementsByUMDataFilter(form);
        }
    },

    filterElementsByUMDataFilter: function (form) {
        if (form.dataFilterOperator) {
            switch (form.dataFilterOperator.toUpperCase()) {
            case "IN":
                form.elements = $.grep(form.elements, function (obj) {
                    return obj.isFilteredByDataFilter === true;
                });
                break;
            case "NOT IN":
                form.elements = $.grep(form.elements, function (obj) {
                    return obj.isFilteredByDataFilter === false;
                });
                break;
            default:
                break;
            }
        }
    },

    // Abstract method
    buildElementsUI: function () {

    },

    // Instance method. As long as the html element we passed in has hid, we will be able to locate the element in the data warehouse repository.
    // $(el).attr("hid") should return valid value.
    selectFilterElement: function (el) {
        var objectMap = this.options.dwRepository.objectMap;
        var filterElement = objectMap[$(el).attr("hid")];
        // If current mode is to create filtered metric, we don't need to change the button to selected style.
        if (this.createFilteredMetricMode && filterElement.type === "ELEMENT") {
            // If there is a metric open, we will apply the filter element to the metric and contruct a new filtered metric.
            var tuDivs = $(".tu");
            var targetTU;
            $.each(tuDivs, function (index, value) {
                //                if ($(".controls", $(value)).is(':visible') && $(".create-filtered-metric", $(value)).attr("filter")) {
                //                    targetTU = value;
                //                }

                if ($(".onlywhen-column", $(value)).attr("filter")) {
                    targetTU = value;
                }
            });

            if (targetTU) {
                var oldTU = objectMap[$(targetTU).attr("hid")];
                var newTU = this.options.dwRepository.createFilteredMetric(oldTU, filterElement);

                // Add new template unit into repository
                if (!objectMap[newTU.hid]) {
                    objectMap[newTU.hid] = newTU;
                }

                this.options.dwSelection.deselectObject(oldTU.hid);
                this.options.dwSelection.selectObject(newTU.hid);
                var $newTU = $(".tu[hid=" + newTU.hid + "]");
                $(".add-filter", $newTU).hide();
                $(".edit-filter", $newTU).show();
                //exit create filtered metric mode.
                Sentrana.FirstLook.createFilteredMetricMode(false);
                //remove selection
                delete this.options.dwSelection[newTU.hid];
                this.removeSelectionfromControll(newTU.elementHID);
            }
        }
        else {
            var htmlID = el.attr("hid");
            this.options.dwSelection.selectObject(htmlID);
        }
    },

    removeSelectionfromControll: function (htmlID) {

        var $div = $.merge($('.object-selector[hid="' + htmlID + '"]', ".onlywhen-column-filter"),
            $('.tree-node-selector[hid="' + htmlID + '"]', ".onlywhen-column-filter"));
        $div = $.merge($div, $('.element-filter-listbox-onlywhen option[hid="' + htmlID + '"]', ".onlywhen-column-filter"));
        var $element, $sel;

        if ($($div).is('input[type="checkbox"]')) {
            $div.removeClass("object-selected");
            if ($($div).is(':checked')) {
                $element = $('.object-selector[hid="' + htmlID + '"]', ".onlywhen-column-filter");
                $($element).removeAttr('checked');
            }
        }
        else if ($($div).is('option')) {
            $sel = $($div).parent('select');
            $.each($sel.find(":selected"), function (index, value) {
                if ($(value).attr('hid') === htmlID) {
                    $(value).removeAttr("selected");
                    $(value).removeClass("object-selected");
                }
            });
        }
        else if ($($div).is('a')) {
            $div.removeClass("object-selected");
            $div.removeClass("tree-node-selected");
        }
    },

    deSelectFilterElement: function (el) {
        // Deselect filter element
        this.options.dwSelection.deselectObject(el.attr("hid"));
    },

    // Start to search while the user is typing
    ".accordion-search-input keyup": function (el, ev) {
        this.searchElements(el, ev);
    },

    // Remove the tip text and clear the content in the search box.
    // Clear the search on tree control.
    ".accordion-search-input click": function (el, ev) {
        this.searchElements(el, ev);
    }
});
