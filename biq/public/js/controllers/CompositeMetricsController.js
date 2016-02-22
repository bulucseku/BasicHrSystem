can.Control.extend("Sentrana.Controllers.CompositeMetrics", {

    pluginName: 'sentrana_composite_metrics',
    defaults: {
        model: null,
        testing: null
    }
}, {
    init: function () {
        this.model = this.options.model;
        this.testing = this.options.testing;
    },

    update: function () {
        this.isEmpty = true;
        this.element.append(can.view('templates/pg-repoman-comp-metrics.ejs', this.parseModel()));
        this.editCompMetricDlg = $(".dialog-edit-comp-metric").sentrana_dialogs_edit_metric({
            model: this.model
        }).control();

        if (this.isEmpty) {
            $('.comp-metric-header', this.element).hide();
        }

        $('.button-add-new', this.element).button();
        $('.button-delete', this.element).button();
        this.updateAllMetrics();
    },

    parseModel: function () {
        var result = [];
        this.compMetricCount = 0;
        for (var compID in this.model.compMetrics) {
            var compMetric = this.model.compMetrics[compID];
            if (!compMetric.isLocal) {
                continue;
            }
            this.compMetricCount += 1;
            result.push({
                compMetric: compMetric
            });
        }
        if (result.length !== 0) {
            this.isEmpty = false;
        }
        return {
            compMetrics: result
        };
    },

    getColumnIDFromElement: function (el) {
        return el.parent().parent().attr('class');
    },

    updateAllNames: function () {
        for (var compID in this.model.compMetrics) {
            var compMetric = this.model.compMetrics[compID];
            if (!compMetric.isLocal) {
                continue;
            }
            this.updateCompName(compID);
        }
    },

    updateCompName: function (compID) {
        var compMetric = this.model.compMetrics[compID];
        $('.input-name', $('.' + compID)).val(compMetric.name);
    },

    updateAllMetrics: function () {
        for (var compID in this.model.compMetrics) {
            var compMetric = this.model.compMetrics[compID];
            if (!compMetric.isLocal) {
                continue;
            }
            this.resetMetrics(compID);
        }
    },

    // Refreshes the list of available metrics
    resetMetrics: function (compID) {
        var compMetric = this.model.compMetrics[compID];

        var $tableRow = $('.' + compID);
        var $metrics1 = $('.select-metric1', $tableRow).empty();
        var $metrics2 = $('.select-metric2', $tableRow).empty();
        var $eMetric = $('<option></option>').val(0).html("");
        $metrics1.append($eMetric);
        $eMetric = $('<option></option>').val(0).html("");
        $metrics2.append($eMetric);
        for (var metrID in this.model.metrics) {
            var metric = this.model.metrics[metrID];
            if (!metric.isLocal) {
                continue;
            }

            var $nMetric = $('<option>', {
                value: metric.id
            }).text(metric.name);
            if (compMetric.metric2Id != metric.id) {
                $metrics1.append($nMetric);
            }

            $nMetric = $('<option>', {
                value: metric.id
            }).text(metric.name);
            if (compMetric.metric1Id != metric.id) {
                $metrics2.append($nMetric);
            }
        }

        // Attempt to select the previous choice

        var metric1 = this.model.metrics[compMetric.metric1Id];
        var metric2 = this.model.metrics[compMetric.metric2Id];
        if (metric1 && this.model.metrics[metric1.id]) {
            $metrics1.val(metric1.id);
        }

        if (metric2 && this.model.metrics[metric2.id]) {
            $metrics2.val(metric2.id);
        }
        // Update the model incase the selections were unsuccessful
        compMetric.metric1Id = $metrics1.val();
        compMetric.metric2Id = $metrics2.val();
    },

    "{model} change": function (table, ev, attr, how, newVal, oldVal) {
        switch (attr) {
        case "addDeleteMetric":
            this.updateAllMetrics();
            break;
        default:
            break;
        }
    },

    ".button-add-new click": function (el, ev) {
        $('.comp-metric-header', this.element).show();
        var $table = $('.composite-metric-table');
        this.model.compNumber++;
        var compID = 'comp' + (this.model.compNumber);
        $table.append(can.view('templates/pg-repoman-single-comp-metric.ejs', {
            id: compID
        }));
        this.model.getNewCompMetric(compID, compID, 0, null, null, 4);
        this.resetMetrics(compID);
        this.updateCompName(compID);
        $('.button-delete', this.element).button();
        this.compMetricCount++;
    },

    ".select-comp-type change": function (el, ev) {
        var compID = this.getColumnIDFromElement(el);
        var compMetric = this.model.compMetrics[compID];
        if ($(el).val() == 1) {
            $('.select-metric2', $('.' + compID)).show();
        }
        else {
            $('.select-metric2', $('.' + compID)).hide();
        }
        compMetric.compType = $(el).val();
    },

    ".select-metric1 change": function (el, ev) {
        var compID = this.getColumnIDFromElement(el);
        var compMetric = this.model.compMetrics[compID];
        compMetric.metric1Id = $(el).val();
    },

    ".select-metric2 change": function (el, ev) {
        var compID = this.getColumnIDFromElement(el);
        var compMetric = this.model.compMetrics[compID];
        compMetric.metric2Id = $(el).val();
    },

    ".button-edit-description click": function (el, ev) {
        var compID = this.getColumnIDFromElement(el);
        var compMetric = this.model.compMetrics[compID];
        this.editCompMetricDlg.open(compMetric);
    },

    ".button-delete click": function (el, ev) {
        var compID = this.getColumnIDFromElement(el);
        var compMetric = this.model.compMetrics[compID];
        this.model.deleteCompMetric(compMetric);
        $("." + compID).remove();
        this.compMetricCount--;
        if (this.compMetricCount < 1) {
            $('.comp-metric-header', this.element).hide();
        }
    }
});
