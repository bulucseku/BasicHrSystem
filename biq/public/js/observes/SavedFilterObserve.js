can.Observe.extend("Sentrana.Models.SavedFilter", {}, {

    init: function (param) {
        this.app = param.app;
        var dwRepository = param.dwRepository || param.app.dwRepository;
        var hidInput = param.id || param.name;
        this.setup({
            filters: param.filters || [],
            name: param.name || '',
            hid: dwRepository.makeHtmlIdForSavedFilterGroup(hidInput),
            attrHID: dwRepository.makeHtmlIdForSavedFilterGroup(hidInput),
            type: 'ELEMENT',
            dimName: 'GroupedFilter',
            dataSource: param.dataSource, 
            id: param.id 
        });
    },

    getIndexOfFilter: function (filter) {
        for (var i = 0; i < this.filters.length; i++) {
            if (this.filters[i].hid === filter.hid) {
                return i;
            }
        }
        return -1;
    },

    getFiltersGroupBy: function () {

        var items = {}, key;
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