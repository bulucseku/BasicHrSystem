/* Common chart options*/
Sentrana.Models.ChartOptions("Sentrana.Models.PivotChartOptions", {}, {
    addChart: function () {
        this.chart = {
            renderTo: {},
            type: Sentrana.CHART_TYPE_COLUMN,
            marginRight: 120
        };
    },

    addLegend: function () {
        this.legend = {
            backgroundColor: null,
            reversed: false,
            borderColor: null,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            width: 80,
            y: 60
        };
    },

    requestDrillMenu: function (elems, ev, reportChartController, drillPointTooltip) {
        //reportChartController.options.model.requestDrillMenu(elems, ev, drillPointTooltip);
    }
});

/* Options for idividual chart types*/
Sentrana.Models.PivotChartOptions("Sentrana.Models.PivotLineChartOptions", {
    init: function (options) {
        this._super(options);
        this.chart.type = Sentrana.CHART_TYPE_LINE;
        this.setPlotOptions();
    },
    setPlotOptions: function () {
        this.plotOptions = {
            line: this.getDrillablePointer()
        };
    }
});

Sentrana.Models.PivotChartOptions("Sentrana.Models.PivotColumnChartOptions", {
    init: function (options) {
        this._super(options);
        this.chart.type = 'column';
        this.setPlotOptions();
    },
    setPlotOptions: function () {
        this.plotOptions = {
            column: this.getDrillablePointer()
        };
    }
});
Sentrana.Models.PivotChartOptions("Sentrana.Models.PivotBarChartOptions", {
    init: function (options) {
        this._super(options);
        this.chart.type = 'bar';
        this.setPlotOptions();
    },
    setPlotOptions: function () {
        this.plotOptions = {
            bar: this.getDrillablePointer()
        };
    }
});
Sentrana.Models.PivotColumnChartOptions("Sentrana.Models.PivotStackedColumnChartOptions", {
    init: function (options) {
        this._super(options);
        this.addStackingPlotOptions();
    }
});

Sentrana.Models.PivotBarChartOptions("Sentrana.Models.PivotStackedBarChartOptions", {
    init: function (options) {
        this._super(options);
        this.addStackingPlotOptions();
    }
});