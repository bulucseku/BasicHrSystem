can.Observe.extend("Sentrana.Models.ReportModel", {}, {
    init: function (options) {
        this.setup({
            pages: []
        });
    }
});

can.Observe.extend("Sentrana.Models.PageModel", {}, {
    init: function (options) {
        this.setup({
            reportElements: []
        });

        this.id = '';
        this.title = '';
    }
});
