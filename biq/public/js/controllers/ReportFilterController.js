can.Control.extend("Sentrana.Controllers.ReportFilter", {
    pluginName: 'sentrana_report_filter',
    defaults: {
        app: null
    }
}, {
    init: function () {
        this.initialize();
        this.updateView();
    },

    initialize: function () {
        this.columnIndex = this.options.columnIndex;
        this.currentSelection = [];
    },

    updateView: function () {
        var column = this.getColumn();
        this.element.html(can.view('templates/report-filter.ejs', {
            oid: column.oid,
            name: column.title,
            colType: column.colType
        }));

        //disable form submits
        this.element.find('form').submit(function (e) {
            e.preventDefault();
        });

        this.$chekboxList = this.element.find(".filter-items");
        this.makeResultDefinitionCollapsible();

        if (column.colType == Sentrana.ColType.METRIC) {
            this.renderFilter();
        }
    },

    renderFilter: function () {
        if (this.isFilterRendered) {
            return;
        }

        var column = this.getColumn();
        if (column.colType == Sentrana.ColType.METRIC) {
            this.hideSearchBox();
            this.updateSlideriew(column);
        }
        else {
            var that = this;

            setTimeout(function () {

                var allItems = that.options.resultDataModel.getUniqueItemsFromColumnAll(that.options.columnIndex, true, true),
                    filteredItems = allItems;

                if (that.options.isFiltered) {
                    filteredItems = that.getFilteredItems(column.title);
                }

                that.options.items = allItems;
                that.options.filteredItems = filteredItems;

                if (!allItems) {
                    that.hideSearchBox();
                    that.$chekboxList.html('<span class="too-many-value">' + Sentrana.getMessageText(window.app_resources.app_msg.column_filter.too_many_unique_column) + '<span>');
                }
                else {
                    that.updateCheckListView(allItems);
                    that.uncheckFilterData(allItems, filteredItems);
                    that.isFilterRendered = true;
                }
            }, 400);

        }

        this.checkSelectedOrder(column);

    },

    getFilteredItems: function (columnTitle) {
        var filter = this.options.resultDataModel.getFilterByColumn(columnTitle);
        if (filter && filter.filterType === "COLUMN") {
            return this.getSelectedItemsArray(filter.selectedItems);
        }

        return null;
    },

    getSelectedItemsArray: function (selectedItems) {
        var items = [],
            keys = selectedItems.keys.split('|'),
            values = selectedItems.values.split('|');
        for (var i = 0; i < keys.length; i++) {
            items.push({
                key: keys[i],
                value: values[i]
            });
        }
        return items;
    },

    hideSearchBox: function () {
        this.element.find('.filter-items').addClass('no-top-border');
    },

    makeResultDefinitionCollapsible: function () {
        this.element.find(".report-filter-header").click({
            controller: this
        }, this.CollapsibleContainerTitleOnClick);
    },

    CollapsibleContainerTitleOnClick: function (event) {
        var thisController = event.data.controller,
            icon = $(this).find('.report-filter-header-updn-img');
        thisController.renderFilter();

        $(icon[0]).toggleClass("fa-rotate-90");
        var attrs = $(".filter-body-attribute");
        for (var j = 0; j < attrs.length; j++) {
            var maxZindex = 0,
                zindex = $(attrs[0]).css('z-index') * 1;
            if (zindex > maxZindex) {
                maxZindex = zindex;
            }
        }

        if (maxZindex) {
            thisController.element.find(".filter-body-attribute").css('z-index', maxZindex + 100);
        }

        thisController.element.find(".report-filter-body").slideToggle('normal');

        var column = thisController.getColumn();
        if (column.colType == Sentrana.ColType.METRIC) {
            var filterController = thisController.$chekboxList.control();
            if (filterController) {
                filterController.reDrawSlider();
            }
        }
    },

    " .report-filter-container  mouseleave": function (el) {
        var filterBody = $(el).find(".report-filter-body");

        if (filterBody.hasClass("filter-body-attribute") && filterBody.is(":visible")) {
            var i = $(el).find('.report-filter-header-updn-img');
            $(i[0]).toggleClass("fa-rotate-90");
            filterBody.slideToggle('normal');
        }
    },

    checkSelectedOrder: function (column) {
        if (column.sortOrder.toUpperCase() === 'A' || column.sortOrder.toUpperCase() === 'ASC') {
            this.element.find('.ord-column-sort-order[value="A"]').prop("checked", true);
        }
        else {
            this.element.find('.ord-column-sort-order[value="D"]').prop("checked", true);
        }
    },

    getColumn: function () {
        var options = this.options;
        var col = $.grep(options.resultDataModel.manipulatedData.colInfos, function (tu) {
            return tu.oid === options.oid;
        });

        return col[0];
    },

    uncheckFilterData: function () {
        for (var i = 0; i < this.options.items.length; i++) {
            if (this.isFiltered(this.options.items[i].key)) {
                $('.checkboxItem[key="' + this.options.items[i].key + '"]', this.element).prop('checked', false);
            }
        }

        var chekboxItems = this.element.find(".checkboxItem:checked");
        if (chekboxItems.length === this.options.items.length) {
            this.$chekboxAll.prop('checked', true);
        }
        else {
            this.$chekboxAll.prop('checked', false);
        }
    },

    isFiltered: function (key) {
        for (var i = 0; i < this.options.filteredItems.length; i++) {
            if (this.options.filteredItems[i].key.toString() === key.toString()) {
                return false;
            }
        }
        return true;
    },

    updateSlideriew: function (column) {
        var minMax = {},
            bounds = this.options.resultDataModel.getBoundsForSlider(this.options.columnIndex);
        if (bounds && bounds.minValue !== bounds.maxValue) {

            if (!this.options.isFiltered) {
                minMax.minValue = bounds.minValue;
                minMax.maxValue = bounds.maxValue;
            }
            else {
                var filter = this.options.resultDataModel.getFilterByColumn(column.title);
                if (filter.filterType === "COLUMN") {
                    var values = this.getMinMax(filter.selectedItems.keys.split('|'));
                    minMax.minValue = values.min;
                    minMax.maxValue = values.max;
                }
                else {
                    minMax.minValue = filter.min;
                    minMax.maxValue = filter.max;
                }
            }

            var clomDetail = {
                name: column.title,
                formatString: column.formatString,
                min: minMax.minValue,
                max: minMax.maxValue,
                lowerBound: bounds.minValue,
                upperBound: bounds.maxValue,
                dataType: column.dataType,
                index: this.options.columnIndex
            };
            var model = new Sentrana.Models.RangeFilter({
                app: this.app,
                columnDetail: clomDetail
            });

            if (this.rangefilterController && !this.rangefilterController._destroyed) {
                this.rangefilterController.destroy();
            }

            this.rangefilterController = this.$chekboxList.sentrana_range_filter({
                app: this.options.app,
                rangeFilterModel: model
            }).control();
        }
        else {
            this.$chekboxList.html('<span class="">' + Sentrana.getMessageText(window.app_resources.app_msg.column_filter.slider_not_possible) + '<span>');
        }
    },

    getMinMax: function (values) {
        var minValue = values[0] * 1,
            maxValue = [0] * 1;
        for (var i = 0; i < values.length; i++) {
            var val = values[i] * 1;
            if (val > maxValue) {
                maxValue = val;
            }
            if (val < minValue) {
                minValue = val;
            }
        }

        return {
            min: minValue,
            max: maxValue
        };
    },

    updateCheckListView: function (items) {
        this.$chekboxList.html(can.view('templates/columnBaseFilterCheckList.ejs', {
            items: items
        }));

        this.$chekboxAll = this.element.find(".checkboxAll");
        if (this.currentSelection.length > 0) {
            this.updateChekboxSelection(this.currentSelection.split('|'));
        }
        else {
            this.element.find(".checkboxItem").prop('checked', true);
            this.$chekboxAll.prop('checked', true);
        }
    },

    updateChekboxSelection: function (selectedItems) {
        for (var i = 0; i < selectedItems.length; i++) {
            this.element.find('.checkboxItem[key="' + selectedItems[i] + '"]').prop('checked', true);
        }

        for (i = 0; i < this.currentSelection.length; i++) {
            this.element.find('.checkboxItem[key="' + this.currentSelection[i] + '"]').prop('checked', true);
        }

        var checkctedItems = this.element.find(".checkboxItem:checked");
        if (checkctedItems.length === this.options.items.length) {
            this.$chekboxAll.prop('checked', true);
        }
    },

    ".accordion-search-input keyup": function (el, ev) {

        this.currentSelection = [];
        this.searchColumnValue(el);
    },

    searchColumnValue: function (el) {
        var searchValue = $(el).val();
        var items = $.grep(this.options.items, function (col, index) {
            return col.value.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
        });

        if (items.length > 0) {
            this.updateCheckListView(items);

            if (searchValue.length === 0) {
                this.uncheckFilterData();
            }

        }
        else {
            this.$chekboxList.html('<span class="too-many-value">' + Sentrana.getMessageText(window.app_resources.app_msg.column_filter.no_result) + '<span>');
        }
    },

    ".checkbox-label click": function (el, ev) {

        var checkbox = el.parent().find('input:checkbox');
        if (checkbox.prop('checked')) {
            checkbox.prop('checked', false);
        }
        else {
            checkbox.prop('checked', true);
        }
        if (checkbox.hasClass('checkboxAll')) {
            $('.checkboxAll').change();
        }

        this.updateStatusofAll();
    },

    ".checkboxAll change": function () {
        var isChecked = this.$chekboxAll.is(':checked');
        var chekboxItems = this.element.find(".checkboxItem");

        if (isChecked) {
            chekboxItems.prop('checked', true);
        }
        else {
            chekboxItems.prop('checked', false);
        }

    },

    ".checkboxItem change": function () {
        this.updateStatusofAll();
    },

    updateStatusofAll: function () {
        this.currentSelection = [];
        var chekboxItems = this.element.find(".checkboxItem:checked");
        if (chekboxItems.length === this.options.items.length) {
            this.$chekboxAll.prop('checked', true);
        }
        else {
            this.$chekboxAll.prop('checked', false);
        }
        var searchValue = $(".accordion-search-input").val();
        if (searchValue.length === 0) {
            for (var i = 0; i < chekboxItems.length; i++) {
                this.currentSelection.push($(chekboxItems[i]).val());
            }
        }
    },

    getFilterParam: function () {

        var chekboxItems = $(".checkboxItem:checked", this.element),
            selectedItemsValue = [],
            selectedItemsKey = [];
        var column = this.getColumn(),
            allItems = this.options.items;

        if (!this.isFilterRendered && this.options.isFiltered) {
            allItems = this.options.resultDataModel.getUniqueItemsFromColumnAll(this.options.columnIndex, true, true);
            var selection = this.getFilteredItems(column.title);
            for (var i = 0; i < selection.length; i++) {
                selectedItemsValue.push(selection[i].value);
                selectedItemsKey.push(selection[i].key);
            }

        }
        else {
            for (i = 0; i < chekboxItems.length; i++) {
                var value = $(chekboxItems[i]).val();
                var key = $(chekboxItems[i]).attr('key');
                selectedItemsValue.push(value);
                selectedItemsKey.push(key);
            }
        }

        if (this.isFilterRendered && selectedItemsKey.length < 1) {
            return false;
        }

        var selectedItems = {},
            allSelected;
        if (allItems) {
            allSelected = chekboxItems.length === (allItems.length || 0);
        }
        else {
            allSelected = true;
        }
        selectedItems.values = selectedItemsValue.join('|');
        selectedItems.keys = selectedItemsKey.join('|');

        return {
            columnIndex: this.columnIndex,
            columnName: column.title,
            selectedItems: selectedItems,
            isAllSelected: allSelected
        };
    },

    getRangeFilterParam: function () {
        if (this.rangefilterController) {
            return this.rangefilterController.getFilterParam();
        }
    },

    getRangeFilterChanges: function () {
        if (this.rangefilterController) {
            return this.rangefilterController.isDirty();
        }
    },

    getFilterChanges: function () {

        var chekboxItems = $(".checkboxItem:checked", this.element),
            selectedItemsKeyOld = [],
            selectedItemsKey = [];
        var column = this.getColumn(),
            allItems = this.options.items;

        if (!this.isFilterRendered) {
            return false;

        }
        else {
            if (this.options.isFiltered) {
                var selection = this.getFilteredItems(column.title);
                if (!selection) {
                    return false;
                }

                for (var i = 0; i < selection.length; i++) {
                    selectedItemsKeyOld.push(selection[i].key);
                }

                for (i = 0; i < chekboxItems.length; i++) {
                    var key = $(chekboxItems[i]).attr('key');
                    selectedItemsKey.push(key);
                }

                return selectedItemsKeyOld.join() !== selectedItemsKey.join();

            }
            else {
                if (!allItems) {
                    return false;
                }

                return chekboxItems.length !== allItems.length;
            }
        }
    },

    reDrawSlider: function () {
        var column = this.getColumn();

        if (column.colType == Sentrana.ColType.METRIC) {
            if (this.rangefilterController) {
                return this.rangefilterController.reDrawSlider();
            }
        }
    },

    getColumnChanges: function () {
        var column = this.getColumn(),
            filterColumn = {},
            hasChange = {};

        if (column.colType == Sentrana.ColType.METRIC) {
            hasChange = this.getRangeFilterChanges();
        }
        else {
            hasChange = this.getFilterChanges();
        }

        if (this.sortPos !== this.oldSortPos || this.sortOrder !== this.oldSortOrder) {
            hasChange = true;
        }

        return hasChange;
    },

    getColumnFilter: function () {
        var column = this.getColumn(),
            filterColumn = {},
            param = {};

        if (column.colType == Sentrana.ColType.METRIC) {
            param = this.getRangeFilterParam();
            if (!param) {
                var existingFilter = this.options.resultDataModel.getFilterByColumn(column.title);
                if (existingFilter) {
                    return existingFilter;
                }
                return false;
            }
            filterColumn = {
                filterType: Sentrana.Enums.FILTER_TYPE_RANGE,
                columnName: param.columnName,
                lowerBound: param.lowerBound,
                upperBound: param.upperBound,
                min: param.min,
                max: param.max,
                formattedMin: param.formattedMin,
                formattedMax: param.formattedMax,
                formatString: param.formatString,
                dataType: param.dataType
            };

        }
        else {
            param = this.getFilterParam();

            if (!param) {
                return {
                    error: true,
                    columnName: column.title
                };
            }

            filterColumn = {
                columnIndex: param.columnIndex,
                columnName: param.columnName,
                filterType: Sentrana.Enums.FILTER_TYPE_COLUMN,
                isAllSelected: param.isAllSelected,
                selectedItems: param.selectedItems
            };

        }

        return filterColumn;
    }

});
