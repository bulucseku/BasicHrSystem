Sentrana.Models.ResultDataset("Sentrana.Models.PivotResultDataset", {
    init: function (data) {
        $.extend(this, data);
    },

    hasCurrencyMetric: function () {
        return this.data.pivotStructure.value.dataType === Sentrana.DataType.CURRENCY;
    },

    hasPercentageMetric: function () {
        return this.data.pivotStructure.value.dataType === Sentrana.DataType.PERCENTAGE;
    }
});

Sentrana.ChartDataAdapter("Sentrana.PivotChartDataAdapter", {
    
    init: function (data) {
        this.resultDataset = new Sentrana.Models.PivotResultDataset({
            data: data
        });
    },

    populateChartOptions: function (reportChartController) {
        var chartData = this.chartData = reportChartController.chartData;
        this.pivotData = reportChartController.options.pivotData;
    
        this.oldChartData = jQuery.extend(true, {}, chartData);

        this.chartOptions = reportChartController.getChartOptions();
        var chartOptions = this.chartOptions;
        
        chartOptions.chart.renderTo = reportChartController.options.chart.renderTo;
        chartOptions.chart.height = reportChartController.options.chart.height;
        chartOptions.chart.width = reportChartController.options.chart.width;

        chartOptions.xAxis.categories = this.pivotData.categories;
        chartOptions.series = this.pivotData.series;

        if (reportChartController.options.tooltip) {
            chartOptions.tooltip = reportChartController.options.tooltip;
        }

        chartOptions.setXAxisRotation(this.oldChartData.chartTextOptions.chartXLabelRotation || chartOptions.xAxis.labels.rotation);

        chartOptions.title.text = this.pivotData.pivotStructure.value.title + " by " + this.pivotData.pivotStructure.row.title + " and " + this.pivotData.pivotStructure.column.title;
        chartOptions.subtitle.text = "";
        chartOptions.xAxis.title.text = this.pivotData.pivotStructure.row.title;
        chartOptions.yAxis.title.text = this.pivotData.pivotStructure.value.title;
        
        delete chartOptions.reportChartController;

        return chartOptions;
    },

    supportChartType: function (chartType) {
        switch (chartType) {
            case Sentrana.CHART_TYPE_LINE:
            case Sentrana.CHART_TYPE_COLUMN:
            case Sentrana.CHART_TYPE_BAR:
            case Sentrana.CHART_TYPE_STACKED_COLUMN:
            case Sentrana.CHART_TYPE_STACKED_BAR:
                return true;
            default:
                return false;
        }
    },

    defaultChartType: function() {
        return Sentrana.CHART_TYPE_COLUMN;
    }
});