can.Control.extend("Sentrana.Controller.CreateRepository", {
    pluginName: 'sentrana_create_repository',
    /* Column Data Type Mapping from server-side date type to DataTables type.
     * See Dataset.cs: public enum DataType { DATETIME, STRING, CURRENCY, NUMBER, PERCENTAGE }; */
    dataTypeMap: ["numeric", "string", "numeric", "numeric", "numeric"],

    defaults: {
        app: null,
        model: null
    }
}, {
    init: function CR_init() {
        var that = this;
        this.element.html(can.view("templates/pg-repoman-create.ejs", {}));
        this.xmlUpload = false;
        this.jsonUpload = false;

        // Initialize Wizard
        this.$wizard = $('#wizard');
        $('#wizard').smartWizard({
            onLeaveStep: this.leaveStepCallBack(this),
            keyNavigation: false
        });

        // Initialize buttons.
        $(".button-retrieve-table-list", this.element).button();
        $(".button-submit-table-list", this.element).button();
        $(".button-upload-data").button();
        $(".button-submit-table-list").button().hide();
        $(".button-create-xml-repository", this.element).button();
        $(".button-create-json-repository", this.element).button();
        $(".button-upload-repository", this.element).button();
        $(".button-create-new-repository").button();

        this.review = false;

        this.selectedRepos = [];

        this.repositoryConfig = new Sentrana.Models.RepositoryCreateAttrs();

        this.metaDataController = $('.table-metadata', this.element).sentrana_handle_metadata({
            data: this.data,
            model: this.repositoryConfig
        }).control();

        // Update the UI...
        this.updateView();
    },

    leaveStepCallBack: function (context) {
        var that = context;
        return (function (obj, otherthing) {
            if (obj.attr('rel') == 3) {
                if ($(".input-xml").prop("checked")) {
                    that.xmlUpload = true;
                    return that.createXMLRepository();
                }
                else {
                    that.jsonUpload = true;
                    return that.createJSONRepository();
                }
            }
            return true;
        });
    },

    updateView: function CR_updateView() {
        // Show first step and hide all the others
        $(".step1-1").hide();
        $(".step1-2").hide();
        $(".step1-3").hide();
    },

    showTableList: function () {
        $(".table-list").empty();
        $(".table-list").append(can.view('templates/pg-repoman-table-list.ejs', this.DBMetaData));
    },

    getColumnID: function (title) {
        return title.replace(/\s/g, "").replace(/\(/g, "").replace(/\)/g, "");
    },

    setUpMetaDataInfo: function () {
        $(".dw-config").html(can.view("templates/pg-repoman-repository-dw-config.ejs", {
            dataWarehouse: {
                connection: this.data[0].tableInfo.connectionInfo,
                tableInfo: this.data[0].tableInfo
            }
        }));
    },

    setUpColumnMappingUI: function () {
        var that = this;
        // Generate class name for each column
        $.each(this.data, function (index, value) {
            $.each(value.colInfos, function (index, value) {
                value.className = that.getColumnID(value.title);
            });
        });

        this.metaDataController.update(this.data, []);
    },

    generateColMappings: function () {
        var result = [];
        for (var attrID in this.repositoryConfig.attributes) {
            var attribute = this.repositoryConfig.attributes[attrID];
            if (!attribute.isLocal || !attribute.attributeForms || !this.repositoryConfig.forms[attribute.attributeForms[0]]) { // Skip over keys jQuery adds and unused attributes
                continue;
            }
            var colMapping = {
                title: null,
                attrDef: null,
                factDef: null,
                metricDef: null
            };
            var attrDef = null,
                factDef = null,
                metricDef = null,
                perMetricDef = null,
                percentTotalMetricDef = null;

            attrDef = this.getNewAttrDef();
            attrDef.dimension.name = attribute.dimension;
            attrDef.attribute.id = attribute.rid;
            attrDef.attribute.name = attribute.name;
            attrDef.attribute.desc = attribute.description;
            attrDef.attribute.filterControl = attribute.filterControl;
            attrDef.attribute.parentAttributeId = attribute.parent;

            var i;

            for (i = 0; i < attribute.attributeForms.length; i++) {
                var attrForm = this.getNewAttrFormDef();
                var formID = attribute.attributeForms[i];
                var form = this.repositoryConfig.forms[formID];
                attrForm.id = "af" + form.id;
                attrForm.name = form.name;
                attrForm.dataType = attribute.dataType;
                attrForm.inJoin = form.inJoin;
                attrDef.attributeForms.push(attrForm);
            }

            for (i = 0; i < this.repositoryConfig.selectors.length; i++) {
                var dyn = this.repositoryConfig.selectors[i];

                var dynamicElement = attribute.dynamicElements[dyn];
                if (!dynamicElement.selected) {
                    continue;
                }
                var dynamicElementDef = this.getNewDynamicElement();
                dynamicElementDef.selector = i;
                dynamicElementDef.value = dynamicElement.value;
                attrDef.dynamicElements.push(dynamicElementDef);
            }

            colMapping.title = attribute.name;
            colMapping.attrDef = attrDef;
            colMapping.factDef = factDef;
            colMapping.metricDef = metricDef;
            colMapping.perMetricDef = perMetricDef;
            colMapping.percentTotalMetricDef = percentTotalMetricDef;
            result.push(colMapping);
        }

        for (var metrID in this.repositoryConfig.metrics) {
            var metric = this.repositoryConfig.metrics[metrID];
            if (!metric.isLocal || !metric.facts || !this.repositoryConfig.forms[metric.facts[0]]) { // Skip over keys jQuery adds and unused metrics
                continue;
            }
            colMapping = {
                title: null,
                attrDef: null,
                factDef: null,
                metricDef: null
            };
            attrDef = null;
            factDef = null;
            metricDef = null;
            perMetricDef = null;
            percentTotalMetricDef = null;

            factDef = this.getNewFactDef();
            factDef.fact.id = "fact" + metric.facts[0]; // Old code uses name
            factDef.fact.name = this.repositoryConfig.forms[metric.facts[0]].name;

            metricDef = this.getNewMetricDef();
            metricDef.metric.id = metric.rid;
            metricDef.metric.name = metric.name;
            metricDef.metric.desc = metric.description;
            metricDef.metric.factId = "fact" + metric.facts[0];
            metricDef.metric.dataType = metric.dataType;
            metricDef.metric.operation = metric.operation;
            metricDef.metric.formatString = metric.formatString;
            metricDef.metric.metricGroup = this.getColumnID(metric.metricGroup);

            factDef.metric = metricDef.metric;

            colMapping.title = metric.name;
            colMapping.attrDef = attrDef;
            colMapping.factDef = factDef;
            colMapping.metricDef = metricDef;
            colMapping.perMetricDef = perMetricDef;
            colMapping.percentTotalMetricDef = percentTotalMetricDef;
            result.push(colMapping);
        }

        for (var compID in this.repositoryConfig.compMetrics) {
            var compMetric = this.repositoryConfig.compMetrics[compID];
            if (!compMetric.isLocal) {
                continue;
            }
            colMapping = {
                title: null,
                attrDef: null,
                factDef: null,
                metricDef: null
            };
            attrDef = null;
            factDef = null;
            metricDef = null;
            perMetricDef = null;
            percentTotalMetricDef = null;

            var compMetricDef = this.getNewCompMetricDef();
            compMetricDef.compMetric.id = compMetric.id;
            compMetricDef.compMetric.name = compMetric.name;
            compMetricDef.compMetric.desc = compMetric.description;
            compMetricDef.compMetric.metrics.push(compMetric.metric1Id);
            if (compMetric.metric2Id) {
                compMetricDef.compMetric.metrics.push(compMetric.metric2Id);
            }
            else {
                compMetricDef.compMetric.metrics.push("");
            }

            compMetricDef.compMetric.dataType = compMetric.dataType;
            compMetricDef.compMetric.formatString = compMetric.formatString;
            compMetricDef.compMetric.metricGroup = compMetric.metricGroup;
            if (compMetric.compType == 1) {
                perMetricDef = compMetricDef;
            }
            else {
                percentTotalMetricDef = compMetricDef;
            }

            colMapping.title = compMetricDef.name;
            colMapping.attrDef = attrDef;
            colMapping.factDef = factDef;
            colMapping.metricDef = metricDef;
            colMapping.perMetricDef = perMetricDef;
            colMapping.percentTotalMetricDef = percentTotalMetricDef;
            result.push(colMapping);
        }

        return result;
    },

    generateTable: function (table) {
        var tableDef = this.getNewTableDef();

        tableDef.id = table.id;
        tableDef.databaseId = table.tableID;
        for (var i = 0; i < table.columns.segments.length; i++) {
            var segment = table.columns.segments[i];
            if (!this.repositoryConfig.segments[segment.databaseId]) {
                continue;
            }
            tableDef.columns.segments.push({
                id: "af" + segment.attributeForm,
                databaseId: segment.databaseId
            });
        }
        for (var k = 0; k < table.columns.data.length; k++) {
            var datum = table.columns.data[k];
            if (!this.repositoryConfig.data[datum.databaseId]) {
                continue;
            }
            tableDef.columns.data.push({
                id: "fact" + datum.fact,
                databaseId: datum.databaseId
            });
        }
        if (table.rootFilter !== null) {
            i = 0;
            // implement root filter
        }

        for (var j = 0; j < table.joins.length; j++) {
            tableDef.joins.push(this.generateJoin(table.joins[j]));
        }

        return tableDef;
    },

    generateJoin: function (join) {
        var joinDef = this.getNewJoinDef();
        joinDef.joinType = join.joinType;

        for (var i = 0; i < join.conditions.length; i++) {
            var conditionDef = this.getNewConditionDef();
            var condition = join.conditions[i];

            conditionDef.comparisonOperator = condition.comparisonOperator;

            var comparisonDef = this.getNewComparisonDef();
            comparisonDef.lvalue = condition.lvalue;
            comparisonDef.rvalue = condition.rvalue;
            if (condition.literal) {
                conditionDef.literalComparison = comparisonDef;
            }
            else {
                conditionDef.variableComparison = comparisonDef;
            }
            joinDef.conditions.push(conditionDef);
        }

        joinDef.table = this.generateTable(join.table);
        return joinDef;
    },

    generateTables: function () {
        var result = [];

        for (var i = 0; i < this.repositoryConfig.baseTables.length; i++) {
            var table = this.repositoryConfig.baseTables[i];
            if (!table.id) {
                table = this.repositoryConfig.tables[this.repositoryConfig.baseTables[i]];
            }
            var tableDef = this.generateTable(table);

            result.push(tableDef);
        }

        return result;
    },

    getNewTableDef: function () {
        var result = {
            id: "",
            databaseId: "",
            columns: {
                segments: [],
                data: []
            },
            rootFilter: null,
            joins: []
        };

        return result;
    },

    getNewJoinDef: function () {
        var result = {
            joinType: 0,
            conditions: [],
            table: null
        };
        return result;
    },

    getNewConditionDef: function () {
        var result = {
            comparisonOperator: 0,
            literalComparison: null,
            variableComparison: null
        };
        return result;
    },

    getNewComparisonDef: function () {
        var result = {
            value1: "",
            value2: ""
        };
        return result;
    },

    getNewSegmentDef: function () {
        var result = {
            id: "",
            databaseId: ""
        };
        return result;
    },

    getNewAttrDef: function () {
        var result = {
            dimension: {
                name: "Product"
            },
            attribute: {
                id: "",
                name: "Product",
                desc: "",
                parentAttributeId: "",
                attrValueType: "DiscreteSeries",
                filterControl: ""
            },
            attributeForms: [],
            dynamicElements: []
        };
        return result;
    },

    getNewAttrFormDef: function () {
        var result = {
            id: "",
            name: "Product",
            dataType: "",
            hidden: false,
            isDefault: true,
            canonicalSort: true
        };
        return result;
    },

    getNewFactDef: function () {
        var result = {
            fact: {
                id: "",
                name: "Product",
                desc: ""
            }
        };
        return result;
    },

    getNewMetricDef: function () {
        var result = {
            metric: {
                id: "",
                name: "",
                desc: "",
                factId: "",
                dataType: "Currency",
                operation: "Sum",
                formatString: "C0",
                metricGroup: ""
            }
        };
        return result;
    },

    getNewCompMetricDef: function () {
        var result = {
            compMetric: {
                id: "",
                name: "",
                desc: "",
                metrics: [],
                dataType: "Currency",
                formatString: "C0",
                metricGroup: ""
            }
        };
        return result;
    },

    getNewDynamicElement: function () {
        var result = {
            selector: null,
            value: ""
        };
        return result;
    },

    getDataSourceConnectionInfo: function () {
        var $topDiv = $(".step1-1");
        return {
            dbType: $(".select-db-type", $topDiv).val(),
            ip: $(".db-server-ip input", $topDiv).val(),
            port: $(".db-server-port input", $topDiv).val(),
            instance: $(".db-instance-name input", $topDiv).val(),
            userName: $(".db-user-name input", $topDiv).val(),
            password: $(".db-password input", $topDiv).val()
        };
    },

    validateRepositoryDef: function () {
        this.colMappings = this.generateColMappings();
        var dimensions = {},
            hasAttr = false;
        for (var i = 0, l = this.colMappings.length; i < l; i++) {
            if (this.colMappings[i].attrDef) {
                hasAttr = true;
                if (!this.colMappings[i].attrDef.dimension.name) {
                    return "You must define all dimensions!";
                }
                else if (this.colMappings[i].attrDef.attribute.parentAttributeId == "Self") {
                    if (dimensions[this.colMappings[i].attrDef.dimension.name]) {
                        return "You may only have one \"Self\" parent attribute per dimension!";
                    }
                    else {
                        dimensions[this.colMappings[i].attrDef.dimension.name] = true;
                    }
                }
            }
        }
        if (hasAttr) {
            return null;
        }
        else {
            return "You must at least have one attribute defined!";
        }
    },

    setUpConfigure: function (response, tableList) {
        this.data = response;
        this.xmlUpload = false;
        this.jsonUpload = false;
        // Currently the only exptMsg corresponds to malformed data
        if (!tableList && this.data[0].exptMsg == "Maltyped elements in dataset") {
            this.element.append(can.view('templates/pg-repoman-maldata-dialog.ejs', this.data[0]));
            this.maltypedDataDialog = $("#maltyped-data-dialog").sentrana_dialogs_maltyped_data({}).control();
            this.maltypedDataDialog.open();
            return;
        }
        this.setUpMetaDataInfo();
        this.setUpColumnMappingUI();
        $(".buttonNext", this.$wizard).click();
    },

    collectRepositories: function (response) {
        this.multiData.push(response);
        if (this.multiData.length == this.selectedRepos.length) {
            this.setUpConfigure(this.multiData, true);
        }
    },

    repositoryConfigData: function () {
        var validateResult = this.validateRepositoryDef();
        if (validateResult) {
            $(".create-rep-status").text(validateResult);
            return false;
        }
        var that = this;
        this.tableInfo = this.data[0].tableInfo;
        this.colMappings = this.generateColMappings();
        this.tables = this.generateTables();

        var data = {
            repositoryId: $(".metadata .repository-id input").val(),
            repositoryName: $(".metadata .repository-name input").val(),
            columnMappings: this.colMappings,
            tables: this.tables,
            tableInfo: this.tableInfo
        };
        return data;
    },

    createJSONRepository: function () {
        var data = this.repositoryConfigData();
        if (!data) {
            return false;
        }
        this.repoDef = data;
        $(".repo-xml").val(JSON.stringify(data, undefined, 2));
        $(".upload-rep-path").val("http://localhost/BIQSvc/SqlGen.svc/CreateJSONRepository");
        return true;
    },

    createXMLRepository: function () {
        var that = this;
        var data = this.repositoryConfigData();
        if (!data) {
            return false;
        }
        $.ajax({
            type: "POST",
            url: "/BIQSvc/RepoMan.svc/CreateXMLRepository",
            dataType: "text",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (msg) {
                $(".repo-xml").val(msg);
                $(".upload-rep-path").val("http://localhost/BIQSvc/SqlGen.svc/UploadRepository");
                $(".step3-1").show();
                $(".step3-2").hide();
            },
            error: function (xhr, status, error, req) {
                $(".repo-xml").val(xhr.responseText);
                $(".repo-xml").val(error);
            }
        });
        return true;
    },

    ".db-table click": function (el, ev) {
        this.selectedRepos = [];
        $(".step1-1").show();
        $(".step1-2").hide();
        $(".step1-3").hide();
        $(".buttonNext", this.$wizard).click();
    },

    ".csv-file click": function (el, ev) {
        this.selectedRepos = [];
        var that = this;
        $(".browse-file").button();
        $(".upload-file").button();
        // Initialize file uploader
        $('.csv-uploader').ajaxfileupload({
            'action': '/BIQSvc/RepoMan.svc/UploadCSV',
            'valid_extensions': ['txt', 'csv'],
            'submit_button': $('.upload-file'),
            'onComplete': function (data) {
                that.setUpConfigure([data]);
            }
        });
        $(".step1-1").hide();
        $(".step1-2").show();
        $(".step1-3").hide();

        $(".buttonNext", this.$wizard).click();
    },

    ".csv-uploader change": function (el, ev) {
        $(".csv-path").val($(el).val());
    },

    ".paste-data click": function (el, ev) {
        this.selectedRepos = [];
        $(".step1-1").hide();
        $(".step1-2").hide();
        $(".step1-3").show();

        $(".buttonNext", this.$wizard).click();
    },

    ".button-retrieve-table-list click": function (el, ev) {
        $(".table-list", this.element).show();
        this.DataSourceConnectionInfo = this.getDataSourceConnectionInfo();
        var that = this;
        this.selectedRepos = [];
        this.options.app.blockUI('Retrieving table list, please wait...', this.options.app.ajaxCallStatus.PROGRESS, 'CANCEL',
            function () {
                $.ajaxManager.abortAll();
                $.unblockUI();
            });
        // Post data back to server and get JSON back
        $.ajax({
            type: "POST",
            url: "/BIQSvc/RepoMan.svc/GetTableList",
            contentType: "application/json",
            data: JSON.stringify(that.DataSourceConnectionInfo),
            success: function (data) {
                that.DBMetaData = data;
                that.showTableList();
                $.unblockUI();
            }
        });
    },

    ".checkbox-select-table change": function (el, ev) {
        var $checkbox = $(el);
        if ($checkbox.prop('checked')) {
            $checkbox.prop('checked', false);
        }
        else {
            $checkbox.prop('checked', true);
        }
    },

    ".table-list li click": function (el, ev) {
        var $checkbox = $('input:checkbox', $(el));
        if ($checkbox.prop('checked')) {
            $checkbox.prop('checked', false);
            this.selectedRepos.splice(this.selectedRepos.indexOf($checkbox.attr('id')), 1);
            if (this.selectedRepos.length < 1) {
                $('.button-submit-table-list').hide();
            }
        }
        else {
            $checkbox.prop('checked', true);
            this.selectedRepos.push($checkbox.attr('id'));
            $('.button-submit-table-list').show();
        }
    },

    // Pass back table selection and review data.
    ".button-submit-table-list click": function (el, ev) {
        this.multiData = [];
        var that = this;
        for (var i = 0; i < this.selectedRepos.length; i++) {
            var tableName = this.selectedRepos[i];
            var tableInfo = {
                connectionInfo: this.getDataSourceConnectionInfo(),
                tableName: tableName
            };
            this.options.app.blockUI('Reading database table, please wait...', this.options.app.ajaxCallStatus.PROGRESS, 'CANCEL',
                function () {
                    $.ajaxManager.abortAll();
                    $.unblockUI();
                });
            $.ajax({
                type: "POST",
                url: "/BIQSvc/RepoMan.svc/ReviewDBTableData",
                contentType: "application/json",
                data: JSON.stringify(tableInfo),
                success: function (data) {
                    that.collectRepositories(data);
                    $.unblockUI();
                }
            });
        }
    },

    ".button-upload-data click": function (el, ev) {
        var that = this;
        // Post data back to server and get JSON back
        $.ajax({
            type: "POST",
            url: "/BIQSvc/RepoMan.svc/ReviewCSVData",
            contentType: "application/csv",
            data: $(".csv-data-input").val(),
            success: function (data) {
                that.setUpConfigure([data]);
            }
        });
    },

    ".button-create-xml-repository click": function (el, ev) {
        this.createXMLRepository();
    },

    ".button-create-json-repository click": function (el, ev) {
        var that = this;
        var data = this.repositoryConfigData();
        if (!data) {
            return;
        }
        $.ajax({
            type: "POST",
            url: "/BIQSvc/RepoMan.svc/CreateJSONRepository",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data) {
                if (data.errorMsg) {
                    $(".create-rep-status").text(data.errorMsg);
                    return;
                }

                $(".buttonNext", that.$wizard).click();

                $(".step3-1").hide();
                $(".step3-2").show();
            },
            error: function (xhr, status, error, req) {
                $(".create-rep-status").val(xhr.responseText);
                $(".create-rep-status").val(error);
            }
        });
    },

    ".button-upload-repository click": function (el, ev) {
        var that = this;
        var uploadPath = $(".upload-rep-path").val();
        var data = $(".repo-xml").val();
        if (this.xmlUpload) {
            $.ajax({
                type: "POST",
                url: "/BIQSvc/SqlGen.svc/UploadRepository",
                dataType: "text",
                contentType: "application/xml",
                data: data,
                success: function (msg) {
                    $(".upload-rep-status").text("Your repository has been uploaded successfully!");
                    $(".buttonNext", that.$wizard).click();
                },
                error: function (xhr, status, error, req) {
                    $(".upload-rep-status").text(xhr.responseText);
                    $(".upload-rep-status").text(error);
                }
            });
        }
        else if (this.jsonUpload) {
            $.ajax({
                type: "POST",
                url: "/BIQSvc/RepoMan.svc/CreateJSONRepository",
                contentType: "application/json",
                data: data,
                success: function (data) {
                    if (data.errorMsg) {
                        $(".upload-rep-status").text(data.errorMsg);
                        return;
                    }
                    $(".upload-rep-status").text("Success!");
                },
                error: function (xhr, status, error, req) {
                    $(".upload-rep-status").val(xhr.responseText);
                    $(".upload-rep-status").val(error);
                }
            });
        }
    },

    ".button-create-new-repository click": function (el, ev) {
        $("#step-1", this.$wizard).click();
    }
});
