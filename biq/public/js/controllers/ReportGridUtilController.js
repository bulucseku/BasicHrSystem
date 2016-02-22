can.Control.extend("Sentrana.Controllers.ReportGridUtil", {
    pluginName: 'sentrana_report_grid_util',
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
        this.element.html(can.view('templates/report-grid-util.ejs', {
            items: this.options.items,
            pos: column.sortPos
        }));
        this.$chekboxList = this.element.find(".filter-items");

        var width = this.element.find('.grid-util-container').css('width');
        width = width.substring(0, width.length - 2) * 1;

        var panelBody = this.options.panelBody;
        $(this.element).css({
            left: ($(this.element).offset().left - width - panelBody.left)
        });

        if (!this.options.items) {
            this.element.find(".column-search-container").hide();
            this.$chekboxList.html('<span class="too-many-value">' + Sentrana.getMessageText(window.app_resources.app_msg.column_filter.too_many_unique_column) + '<span>');
        }
        else {
            this.updateCheckListView(this.options.items);
            this.uncheckFilterData();
        }

        if (column.colType !== Sentrana.ColType.METRIC) {
            this.element.find('.column-util-hide-button').hide();
            this.element.find('.column-sorting-container').addClass('no-top-border');
        }

        this.sortPos = column.sortPos * 1;
        this.checkSelectedOrder(column);
    },

    checkSelectedOrder: function (column) {

        if (column.sortOrder === 'A') {
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

    ".decrease-value click": function (el, ev) {
        this.updateSortPos(false);
    },

    ".increase-value click": function (el, ev) {
        this.updateSortPos(true);
    },

    updateSortPos: function (isIncrement) {
        var pos = this.element.find('.column-sorting-container .decimal-place-num').text() * 1,
            nextPos;

        if (isIncrement) {
            var cols = this.options.resultDataModel.manipulatedData.colInfos;
            if (pos === cols.length) {
                return false;
            }
            nextPos = pos + 1;

        }
        else {
            if (pos === 1) {
                return false;
            }
            nextPos = pos - 1;
        }

        this.sortPos = nextPos;

        this.element.find('.column-sorting-container .decimal-place-num').html(this.sortPos);

        return true;
    },

    uncheckFilterData: function () {
        for (var i = 0; i < this.options.items.length; i++) {
            if (this.isFiltered(this.options.items[i].value)) {
                $('.checkboxItem[value="' + this.options.items[i].value + '"]', this.element).prop('checked', false);
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

    isFiltered: function (val) {
        for (var i = 0; i < this.options.filteredItems.length; i++) {
            if (this.options.filteredItems[i].value === val) {
                return false;
            }
        }
        return true;
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
            this.element.find('.checkboxItem[value="' + selectedItems[i] + '"]').prop('checked', true);
        }

        for (i = 0; i < this.currentSelection.length; i++) {
            this.element.find('.checkboxItem[value="' + this.currentSelection[i] + '"]').prop('checked', true);
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

            this.enableDisableOkButton();
        }
        else {
            this.$chekboxList.html('<span class="too-many-value">' + Sentrana.getMessageText(window.app_resources.app_msg.column_filter.no_result) + '<span>');
            this.enableDisableOkButton();
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
        this.enableDisableOkButton(checkbox);
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

        this.enableDisableOkButton();
    },

    ".checkboxItem change": function () {
        this.updateStatusofAll();
        this.enableDisableOkButton();
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

    enableDisableOkButton: function () {
        var chekboxItems = this.element.find(".checkboxItem:checked"),
            btnOk = this.element.find(".filter-submit-button-ok");
        if (chekboxItems.length > 0) {
            btnOk.removeAttr('disabled');
            btnOk.removeClass("ui-state-disabled");
        }
        else {
            btnOk.attr('disabled', 'disabled');
            btnOk.addClass("ui-state-disabled");
        }
    },

    ".filter-submit-button-ok click": function (el, ev) {
        if ($(el).hasClass('ui-state-disabled')) {
            return;
        }

        this.hideThisController();
        var params = this.getParams();
        this.element.trigger("grid_column_property_updated", params);
    },

    ".column-util-hide-button click": function () {
        this.hideThisController();
        var columnName = this.getColumn().title;
        this.element.trigger("hide_grid_column", columnName);
    },

    getParams: function () {
        var filterParam = this.getFilterParam(),
            sortParam = this.getSortParam();

        return {
            filterParam: filterParam,
            sortParam: sortParam
        };
    },

    getFilterParam: function () {
        if (this.options.items) {
            var chekboxItems = $(".checkboxItem:checked", this.element),
                selectedItemsValue = [],
                selectedItemsKey = [];
            for (var i = 0; i < chekboxItems.length; i++) {
                var value = $(chekboxItems[i]).val();
                var key = $(chekboxItems[i]).attr('key');
                selectedItemsValue.push(value);
                selectedItemsKey.push(key);
            }

            var selectedItems = {},
                allSelected = chekboxItems.length === this.options.items.length;
            selectedItems.values = selectedItemsValue.join('|');
            selectedItems.keys = selectedItemsKey.join('|');
            var column = this.getColumn();
            return {
                columnIndex: this.columnIndex,
                columnName: column.title,
                selectedItems: selectedItems,
                isAllSelected: allSelected
            };
        }

        return false;
    },

    getSortParam: function () {
        var column = this.getColumn(),
            pos = column.sortPos * 1,
            sortOrder = this.element.find('.ord-column-sort-order:checked').val();

        var isSortingRequired = pos !== this.sortPos || column.sortOrder !== sortOrder;

        if (isSortingRequired) {
            this.options.resultDataModel.swapSortPosition(this.options.columnIndex, this.sortPos, sortOrder);
            return {
                orders: this.getSortOrders()
            };
        }

        return false;
    },

    getSortOrders: function () {
        var cols = $.extend([], this.options.resultDataModel.manipulatedData.colInfos),
            orders = [];
        for (var j = 0; j < cols.length; j++) {
            cols[j].index = j;
        }

        cols.sort(function (a, b) {
            return a.sortPos - b.sortPos;
        });
        for (var i = 0; i < cols.length; i++) {
            orders.push([cols[i].index, cols[i].sortOrder === 'A' ? 'asc' : 'desc']);
        }

        return orders;
    },

    ".filter-submit-button-cancel click": function () {
        this.hideThisController();
    },

    "{document} click": function (el, ev) {
        if (!this.element.has(ev.target).length) {
            this.element.hide();
        }
    },

    hideThisController: function () {
        this.element.hide();
    }
});
