can.Control.extend("Sentrana.Controllers.HandleMetadata", {
    pluginName: 'sentrana_handle_metadata',
    defaults: {
        data: null,
        model: null
    }
}, {
    init: function () {
        this.model = this.options.model;
        this.data = this.options.data;

        this.$testing = $('.testing');
        this.$reviewTable = $('.table-content-review');
        this.$formTable = $('.form-mapping-information');
        this.$columnTable = $('.column-mapping-information');
        this.$compMetrics = $('.composite-metrics');
        this.$joins = $('.tables');

        this.testing = this.$testing.sentrana_testing_repository_manager({
            model: this.model
        }).control();
        this.reviewTableController = this.$reviewTable.sentrana_review_table_data({
            model: this.model,
            data: this.data,
            testing: this.testing
        }).control();
        this.formController = this.$formTable.sentrana_form_mapping_ui({
            model: this.model,
            testing: this.testing
        }).control();
        this.columnController = this.$columnTable.sentrana_column_mapping_ui({
            model: this.model,
            testing: this.testing
        }).control();
        this.compMetricController = this.$compMetrics.sentrana_composite_metrics({
            model: this.model,
            testing: this.testing
        }).control();
        this.joinController = this.$joins.sentrana_tables({
            model: this.model,
            testing: this.testing
        }).control();
    },

    update: function (data, selectedRepos) {
        this.data = data;
        this.updateModel();
        this.$reviewTable.empty();
        this.$formTable.empty();
        this.$columnTable.empty();
        this.$compMetrics.empty();
        this.$joins.empty();
        this.reviewTableController.update(data, this.selectedRepos);
        this.formController.update();
        this.columnController.update();
        this.compMetricController.update();
        this.joinController.update(data, this.selectedRepos);
        this.testing.update(false, 1);
    },

    getColumnIDFromElement: function (el) {
        return el.parent().parent().attr('class');
    },

    getColumnID: function (title) {
        return title.replace(/\s/g, "").replace(/\(/g, "").replace(/\)/g, "");
    },

    getColInfo: function (colID) {
        for (var i = 0, l = this.data.colInfos.length; i < l; i++) {
            if (this.data.colInfos[i].title == colID) {
                return this.data.colInfos[i];
            }
        }
        return null;
    },

    updateModel: function () {
        if (!this.data) {
            return;
        }
        this.selectedRepos = [];
        var defaultDimension = "";
        this.model.clear();
        this.model.tableInfo = this.data[0].tableInfo;
        for (var j = 0; j < this.data.length; j++) {
            var datum = this.data[j];
            var tableName = this.data[j].tableInfo.tableName;
            this.selectedRepos.push(tableName);
            for (var i = 0; i < datum.colInfos.length; i++) {
                var colInfo = datum.colInfos[i];
                var colTitle = colInfo.title;
                var colID = this.getColumnID(colTitle);
                colInfo.colID = colID;

                var colType = colInfo.colType;
                var attrValType = colInfo.attrValueType; // currently unused
                var dataType = colInfo.dataType;
                var formDesc = colInfo.formDescription; // currently unused

                var newForm = this.model.setNewForm(colID, colTitle, dataType, colType, defaultDimension, false, tableName);

                if (colType === 0) { // attribute
                    this.model.updateDimensionChildren(newForm.attributes[0], defaultDimension);
                    newForm.segment = this.model.getNewSegment(colID, newForm.id);
                }
                else {
                    newForm.datum = this.model.getNewDatum(colID, newForm.id);
                }
            }
        }
        return;
    }
});
