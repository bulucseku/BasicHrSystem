can.Control.extend("Sentrana.Controllers.ReportSortUtil", {
    pluginName: 'sentrana_report_sort_util',
    defaults: {
        app: null
    }
}, {
    init: function () {
        this.initialize();
        this.updateView();
    },

    initialize: function () {
        this.currentSelection = [];
    },

    updateView: function () {
        var column = this.getColumn();
        var isHidden = this.options.resultDataModel.isColumnHidden(column.title);

        this.isHidden = isHidden;

        this.element.html(can.view('templates/report-sort-util.ejs', {
            pos: column.sortPos,
            sortOrder: column.sortOrder,
            isHidden: isHidden,
            oid: column.oid,
            name: column.title,
            colType: column.colType
        }));

        var width = this.element.find('.result-column-container').css('width');
        width = width.substring(0, width.length - 2) * 1;

        var panelBody = this.options.panelBody;
        $(this.element).css({
            left: ($(this.element).offset().left - width - panelBody.left)
        });

        //disable form submits
        this.element.find('form').submit(function (e) {
            e.preventDefault();
        });

        this.$chekboxList = this.element.find(".filter-items");
        if (isHidden) {
            this.element.find(".result-column-hide-icon").show();
        }

        this.sortPos = column.sortPos * 1;
        this.oldSortPos = column.sortPos * 1;

        this.sortOrder = column.sortOrder;
        this.oldSortOrder = column.sortOrder;

        this.checkSelectedOrder(column);
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

    updateHiddenStatus: function (isHidden) {
        if (isHidden) {
            this.element.find(".result-column-hide-icon").show();
        }
        else {
            this.element.find(".result-column-hide-icon").hide();
        }
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

        this.updateControllerSortPos(nextPos);
        return true;
    },

    updateControllerSortPos: function (sortPos) {
        this.sortPos = sortPos;
        this.updateSortPosView();
    },

    updateSortPosView: function () {
        this.element.find('.column-sorting-container .decimal-place-num').html(this.sortPos);
        this.element.find('.result-column-sort-pos-num').html(this.sortPos);
    },

    ".ord-column-sort-order click": function (el, ev) {
        var sortOrder = $(el).val();
        this.sortOrder = sortOrder;
        this.updateHeaderSortOrder(sortOrder);
    },

    updateHeaderSortOrder: function (sortOrder) {
        var icon = this.element.find('.result-column-sort-icon');
        icon.removeClass("fa-sort-alpha-asc").removeClass("fa-sort-alpha-desc");
        if (sortOrder.toUpperCase() === "A") {
            icon.addClass("fa-sort-alpha-asc");
        }
        else {
            icon.addClass("fa-sort-alpha-desc");
        }

    },

    updateDataModel: function () {
        var col = this.options.resultDataModel.getColumn(this.options.oid),
            currentIndex = this.options.resultDataModel.getColumnIndex(this.options.oid);

        this.options.resultDataModel.swapSortPosition(currentIndex, this.sortPos, col.sortOrder);

        col.sortPos = this.sortPos;
        col.sortOrder = this.sortOrder;
    },

    ".btn-apply-sort click": function () {
        this.hideThisController();

        this.options.resultDataModel.startDataChange();
        this.updateDataModel();

        this.options.resultDataModel.sortDataByMultipleColumn();
        this.options.resultDataModel.endDataChange();

    },

    ".btn-reset-sort click": function (el, ev) {
        this.hideThisController();
        this.element.trigger("reset_sort-options");
    },

    ".btn-hide-column click": function () {
        this.hideThisController();
        var col = this.options.resultDataModel.getColumn(this.options.oid);
        this.element.trigger("hide_grid_column", col.title);
    },

    ".btn-cancel-sort click": function () {
        this.hideThisController();
    },

    "{document} click": function (el, ev) {
        if (!this.element.has(ev.target).length) {
            this.element.hide();
        }
    },

    "{document} keyup": function (el, ev) {
        if (ev.keyCode === 27) { //Esc
            this.element.hide();
        }
    },

    hideThisController: function () {
        this.element.hide();
    }

});
