can.Observe.extend("Sentrana.Models.ConditionalMetric", {}, {

    init: function (tu, filterElements, dwRepository) {
        this.dwRepository = dwRepository;
        this.setup({
            filters: [],
            name: '',
            isReusable: false
        });

        if (tu) {
            this.initializeProperties(tu, filterElements);
        }
    },

    initializeProperties: function (tu, filterElements) {
        if (filterElements) {
            for (var i = 0; i < filterElements.length; i++) {
                this.filters.push(filterElements[i]);
            }
        }

        this.attr('name', this.getMetricNameWithAggType(tu));
    },

    getIndexOfFilter: function (filter) {
        for (var i = 0; i < this.filters.length; i++) {
            if (this.filters[i].hid === filter.hid) {
                return i;
            }
        }
        return -1;
    },

    getMetricNameWithAggType: function (metric) {
        return this.dwRepository.getMetricNameWithAggType(metric, this.getFiltersGroupBy());
    },

    getMetricFormula: function (metric) {
        return 'if(' + this.dwRepository.creatFilterMetricFormula(this.getFiltersGroupBy()) + ',' + metric.originalOid + ")";
    },

    getFiltersGroupBy: function () {

        var items = {},
            key;
        $.each(this.filters, function (index, val) {
            key = val.attrHID;
            if (!items[key]) {
                items[key] = [];
            }
            items[key].push(val);
        });

        return items;
    }
});
