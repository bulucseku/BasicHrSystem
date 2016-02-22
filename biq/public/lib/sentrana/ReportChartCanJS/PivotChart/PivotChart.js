Sentrana.Controllers.ReportChart("Sentrana.Controllers.PivotChart", {
    pluginName: 'sentrana_pivot_chart'
}, {

    staticUpdate: function PC_staticUpdate(chartType) {
        this.chartAdapter = new Sentrana.PivotChartDataAdapter(this.options.pivotData);
        this.chartAdapter.chartType = chartType || this.chartAdapter.defaultChartType();
        this.chartData.attr("needRedraw", true);
        this.updateView(true, true);
    },

    hasData: function () {
        return this.options.pivotData !== undefined;
    },

    hasValidData: function () {
        if (!this.options.pivotData.categories || !this.options.pivotData.series || !this.options.pivotData.pivotStructure) {
            this.chart = null;
            this.showChartWarning("Invalid pivot data");
            if (this.element) {
                this.element.trigger("chart_failed");
            }
            return false;
        }
        
        return true;
    },

    updateInvalidData: function() {
        //this empty method is required
    },

    getChartOptions: function () {
        var options = {
            controller: this
        };
        switch (this.chartAdapter.chartType) {
            case Sentrana.CHART_TYPE_LINE:
                return new Sentrana.Models.PivotLineChartOptions(options);
            case Sentrana.CHART_TYPE_COLUMN:
                return new Sentrana.Models.PivotColumnChartOptions(options);
            case Sentrana.CHART_TYPE_BAR:
                return new Sentrana.Models.PivotBarChartOptions(options);
            case Sentrana.CHART_TYPE_STACKED_COLUMN:
                return new Sentrana.Models.PivotStackedColumnChartOptions(options);
            case Sentrana.CHART_TYPE_STACKED_BAR:
                return new Sentrana.Models.PivotStackedBarChartOptions(options);
            default:
                return new Sentrana.Models.PivotChartOptions(options);
        }
    },

    resetNumberOfRows: function () {
        this.element.trigger("restore-pivot-chart");
    }
});