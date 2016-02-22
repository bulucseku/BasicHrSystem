can.Control.extend("Sentrana.Controller.EditRepository", {
    pluginName: 'sentrana_edit_repository',
    defaults: {
        app: null,
        model: null
    }
}, {
    init: function ER_init() {
        var that = this;

        this.element.html(can.view("templates/pg-repoman-edit.ejs", {
            choices: this.options.app.dwChoicesModel.choices,
            jsonchoices: this.options.app.dwChoicesModel.jsonChoices
        }));

        // Initialize buttons.
        $(".button-save-changes", this.element).button();
        $(".button-delete-repository", this.element).button();

        this.repositoryConfig = new Sentrana.Models.RepositoryCreateAttrs();
        this.metaDataController = $('.table-metadata', this.element).sentrana_handle_metadata({
            data: null,
            model: this.repositoryConfig
        }).control();
        this.updateView();

        this.comparisons = ["=", ">", ">=", "<", "<=", "Contains", "NotContain"];
        this.joins = ["Inner", "Left", "Right", "Full"];
    },

    updateView: function ER_updateView() {

    },

    parseJSONData: function (data) {
        var i;
        var model = this.repositoryConfig;
        model.clear();
    },

    parseXMLData: function (data) {
        var i;
        var model = this.repositoryConfig;
        var metadata = data.metadata;
        var dataWarehouse = data.dataWarehouse;
        model.clear();

        for (i = 0; i < metadata.attributeForms.length; i++) {
            var attributeForm = metadata.attributeForms[i];
            model.setNewForm(attributeForm.id, attributeForm.name, attributeForm.dataType, 0, null, true);
        }

        for (i = 0; i < metadata.attributes.length; i++) {
            var attribute = metadata.attributes[i];
            var parent = "Self";
            if (attribute.parentAttributeId) {
                parent = attribute.parentAttributeId;
            }
            var newAttr = model.getNewAttr(attribute.id, attribute.name, null, attribute.dimension.name, parent, attribute.attributeFormIds);
            model.setDimensionChild(newAttr.id, newAttr.dimension);
        }

        for (i = 0; i < metadata.attributes.length; i++) {
            attribute = metadata.attributes[i];
            if (!attribute.parentAttributeId) {
                continue;
            }
            for (var j = 0; j < attribute.parentAttributeId.length; j++) {
                var child = attribute.parentAttributeId[j];
                if (child == attribute.id) {
                    continue;
                }
                if (model[child]) {
                    model[child].parent = attribute.id;
                }
            }
        }

        for (i = 0; i < metadata.facts.length; i++) {
            var fact = metadata.facts[i];
            model.setNewForm(fact.id, fact.name, fact.dataType, 1, null, true);
        }

        for (i = 0; i < metadata.metrics.simpleMetrics.length; i++) {
            var metric = metadata.metrics.simpleMetrics[i];
            model.getNewMetric(metric.id, metric.name, null, [metric.factId]);
        }

        for (i = 0; i < metadata.metrics.compositeMetrics.length; i++) {
            var compMetric = metadata.metrics.compositeMetrics[i];
            var type = 0;
            if (compMetric.metricType == "Sentrana.BIQ.Conceptual.PerMetric") {
                type = 1;
            }
            model.getNewCompMetric(compMetric.id, compMetric.name, type, compMetric.metricIds[0], compMetric.metricIds[1], compMetric.dataType);
        }

        this.selectedRepos = [];
        this.selectedRepoIds = [];
        this.connectionInfo = dataWarehouse.connection;

        for (i = 0; i < dataWarehouse.tables.length; i++) {
            var table = dataWarehouse.tables[i];

            model.baseTables.push(this.parseTable(table, null).id);
        }
    },

    parseTable: function (table, parentTable) {
        var model = this.repositoryConfig;

        if (this.selectedRepos.indexOf(table.id) < 0) {
            this.selectedRepos.push(table.id);
            this.selectedRepoIds.push(table.databaseId);
        }
        if (model.repoCount[table.id] === undefined) {
            model.repoCount[table.id] = 0;
        }
        else {
            model.repoCount[table.id] += 1;
        }

        var nTable = model.getNewTable(table.id + "_" + model.repoCount[table.id], table.id, 0, parentTable);
        this.parseRootFilter(table, nTable);
        for (var i = 0; i < table.columns.length; i++) {
            var column = table.columns[i];
            if (column.datum === null) {
                nTable.columns.segments.push(model.getNewSegment(column.segment.databaseId, column.segment.attributeId));
            }
            else {
                nTable.columns.data.push(model.getNewDatum(column.datum.databaseId, column.datum.factId));
            }
        }

        for (i = 0; i < table.joins.length; i++) {
            this.parseJoin(nTable, table.joins[i]);
        }
        return nTable;
    },

    parseJoin: function (table, join) {
        var nTable = this.parseTable(join.table, table);
        var nJoin = this.repositoryConfig.getNewJoin(table, nTable);
        nJoin.joinType = join.joinOperator;
        nJoin.conditions = [];
        for (var i = 0; i < join.condition.length; i++) {
            this.parseCondition(join.condition[i], nJoin);
        }
    },

    parseCondition: function (condition, join) {
        var model = this.repositoryConfig;
        var nCondition = model.getNewCondition(join);
        nCondition.lvalue = condition.columnId1;
        nCondition.rvalue = condition.columnId2;
        if (condition.literal !== null) {
            nCondition.literal = true;
            nCondition.rvalue = condition.literal;
        }
    },

    parseRootFilter: function (table, nTable) {
        if (table.rootFilter === null) {
            return;
        }

        var model = this.repositoryConfig;
        var nRootFilter = model.getNewRootFilter(nTable);
        nRootFilter.lvalue = table.rootFilter.columnId1;
        nRootFilter.rvalue = table.rootFilter.literal;
        nRootFilter.comparisonOperator = this.parseComparisonOperator(table.rootFilter.operator);
    },

    parseComparisonOperator: function (comparisonOperator) {
        this.comparisons.indexOf(comparisonOperator);
    },

    getMultiData: function () {
        this.multiData = [];
        var that = this;
        for (var i = 0; i < this.selectedRepoIds.length; i++) {
            var tableName = this.selectedRepoIds[i];
            var tableInfo = {
                connectionInfo: this.connectionInfo,
                tableName: tableName
            };
            $.ajax({
                type: "POST",
                url: "/BIQSvc/RepoMan.svc/ReviewDBTableData",
                contentType: "application/json",
                data: JSON.stringify(tableInfo),
                success: function (data) {
                    that.collectRepositories(data);
                }
            });
        }
    },

    collectRepositories: function (response) {
        this.multiData.push(response);
        if (this.multiData.length == this.selectedRepos.length) {
            this.metaDataController.update(this.multiData, this.selectedRepos, true);
        }
    },

    // Pass back table selection and review data.
    ".xmlrepository-list li click": function (el, ev) {
        var that = this;

        $(".repository-edit li").removeClass("viewing");
        $(el).addClass("viewing");

        var repoId = $(el).attr("class").replace("viewing", "").replace(" ", "");
        this.selectedRepo = repoId;

        // Load repository definition
        $.ajax({
            type: "GET",
            url: "/BIQSvc/RepoMan.svc/Repository/" + that.selectedRepo,
            contentType: "application/json",
            dataType: "JSON",
            success: function (data) {
                $(".repository-edit .metadata").empty();
                that.parseXMLData(data);
                //$(".repository-edit .metadata").append("templates/pg-repoman-metadata.tmpl", data);
                that.getMultiData();
            }
        });
    },

    // Pass back table selection and review data.
    ".jsonrepository-list li click": function (el, ev) {
        var that = this;

        $(".repository-edit li").removeClass("viewing");
        $(el).addClass("viewing");

        var repoId = $(el).attr("class").replace("viewing", "").replace(" ", "");
        this.selectedRepo = repoId;

        // Load repository definition
        $.ajax({
            type: "GET",
            url: "/BIQSvc/RepoMan.svc/JSONRepository/" + that.selectedRepo,
            contentType: "application/json",
            dataType: "JSON",
            success: function (data) {
                $(".repository-edit .metadata").empty();
                that.parseJSONData(data);
                //$(".repository-edit .metadata").append(can.view("templates/pg-repoman-metadata.tmpl", data));
                that.getMultiData();
            }
        });
    },

    ".button-delete-repository click": function (el, ev) {
        var that = this;
        // remove repository
        $.ajax({
            type: "DELETE",
            url: "/BIQSvc/RepoMan.svc/Repository/" + that.selectedRepo,
            contentType: "application/json",
            dataType: "JSON",
            success: function (data) {
                $(".repository-list ." + that.selectedRepo).remove();
                alert("Repository Removed");
            }
        });
    }
});
