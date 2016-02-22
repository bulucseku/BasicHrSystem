can.Observe.extend("Sentrana.Models.Report", {}, {
    init: function (options) {
        this.app = options.app;
        this.filters = {};
        this.pages = [];
        this.setDefultValues();
    },

    setDefultValues: function () {
        var page = new Sentrana.Models.Page({
            app: this.app
        });
        this.pages.push(page);
    }
});

can.Observe.extend("Sentrana.Models.Page", {}, {
    init: function (options) {
        this.app = options.app;
        this.filters = {};
        this.reportElements = [];
        this.setDefultValues();
    },

    setDefultValues: function () {
        var element = new Sentrana.Models.ReportElement({
            app: this.app
        });
        this.reportElements.push(element);
    }
});

can.Observe.extend("Sentrana.Models.ReportElement", {}, {
    init: function (options) {
        this.app = options.app;
        this.filters = {};
        this.columns = [];
        this.visualizationType = "grid";
    }
});


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

can.Observe.extend("Sentrana.Models.ReportElementModel", {}, {
    init: function (options) {
        this.setup({
        });

        this.id = null;
        this.row = 1;
        this.col = 1;
        this.sizeX = 1;
        this.sizeY = 1;
        this.type = "";
    }
});