can.Observe.extend("Sentrana.Models.RangeFilter", {}, {
    init: function (options) {
        this.app = options.app;

        var columnDetail = options.columnDetail;
        this.columnIndex = columnDetail.index;
        this.columnName = columnDetail.name;
        this.formatString = columnDetail.formatString;
        this.dataType = columnDetail.dataType;

        this.setup({
            "lowerBound": columnDetail.lowerBound !== undefined ? columnDetail.lowerBound * 1 : columnDetail.min * 1,
            "upperBound": columnDetail.upperBound !== undefined ? columnDetail.upperBound * 1 : columnDetail.max * 1,
            "min": columnDetail.min * 1,
            "max": columnDetail.max * 1
        });
    },

    setMinMax: function (min, max) {
        this.attr('min', min * 1);
        this.attr('max', max * 1);
    },

    getMinMax: function () {
        return {
            "min": this.min,
            "max": this.max
        };
    },

    getSelectedRanges: function () {
        return {
            "lowerBound": this.lowerBound,
            "upperBound": this.upperBound
        };
    }

});
