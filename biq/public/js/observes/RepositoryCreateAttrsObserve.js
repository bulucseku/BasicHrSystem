/* Model for table attributes */
can.Observe.extend("Sentrana.Models.RepositoryCreateAttrs", {}, {
    // Constructor
    init: function () {
        this.setup({
            tableInfo: {},
            // mapping between formID and form (either attribute form or fact)
            forms: {},
            // newDimension serves to notify the controller of a change to a dimension
            dimensions: {
                allDimensions: [],
                // dimensionChildren is a mapping between dimensions and which attrIDs have them selected
                dimensionChildren: {},
                // dimensionParents is a mapping between dimensions and which attrID has most recently been selected as the parent
                dimensionParents: {}
            },
            // mapping between attrIDs and attributes
            attributes: {},
            // mapping between metrIDs and metrics
            metrics: {},
            // mapping between metric Groups and lists of their metrics
            metricGroups: {},
            // mapping between compIDs and composite metrics
            compMetrics: {},
            compNumber: 0,
            // mapping between tableIDs and table objects
            tables: {},
            baseTables: [],
            tableNumber: 0,
            conditions: {},
            joins: {},
            segments: {},
            data: {},
            repoCount: {},
            lastChangedID: null,
            newDimension: "",
            newMetricGroup: "",
            // a flag to inform the column controller when the datatypes have been adjusted
            updatedDataTypes: 0,
            updatedFormSelection: {
                formID: null,
                selections: null
            },
            // list of oldID newID pairs that need to be updated
            idUpdates: [],
            // a flag to inform the controller of a change to the forms
            updatedColTypes: 0,
            // a flag to inform the controller of an individual model change
            updatedMetric: 0,
            updatedAttribute: 0,
            // a flag to inform the compMetric controller of add/deletions to the list of metrics
            addDeleteMetric: 0,

            selectors: ["MaxElement"]
        });
    },

    clear: function () {
        this.forms = {};
        this.dimensions = {
            allDimensions: [],
            dimensionChildren: {},
            dimensionParents: {}
        };
        this.attributes = {};
        this.metrics = {};
        this.compMetrics = {};
        this.tables = {};
        this.baseTables = [];
        this.segments = {};
        this.data = {};
        this.repoCount = {};
    },

    // removes '_' and capitalizes
    makePrettyString: function (str) {
        return str.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    setNewForm: function (colID, name, dataType, formType, dimension, noChild, tableName, segment, datum) {
        var that = this;
        var result = {
            name: that.makePrettyString(name),
            id: "_" + colID,
            rid: colID,
            columnName: colID,
            dataType: dataType,
            formType: formType,
            isDefault: true,
            isLocal: true,
            attributes: [],
            metrics: [],
            description: "",
            inJoin: false,
            tableName: tableName,
            segment: segment,
            datum: datum
        };

        this.forms[result.id] = result;

        if (!noChild) {
            if (formType === 0 || formType === "0") { // attribute
                result.name = result.name;
                this.getNewAttr(colID, name, dataType, dimension, "Self", [result.rid], tableName);
            }
            else if (formType === 1 || formType === "1") { // metric
                result.name = result.name;
                this.getNewMetric(colID, name, dataType, [result.rid], tableName);
            }
        }

        return result;
    },

    getNewAttr: function (id, name, dataType, dimension, parent, attributeForms, tableName) {
        if (dimension && this.dimensions.allDimensions.indexOf(dimension) < 0) {
            this.dimensions.allDimensions.push(dimension);
        }
        var that = this;
        var result = {
            name: that.makePrettyString(name),
            id: id,
            rid: id,
            dataType: dataType,
            colType: 0,
            dimension: dimension,
            parent: parent,
            dynamicElements: {},
            attrValueType: "DiscreteSeries", // Probably shouldn't be hardcoded...
            description: "",
            attributeForms: [],
            tableName: tableName,
            filterControl: "None",
            isLocal: true // This has been added because JQueryMX likes to add it's own
            // objects to my datastructures
        };

        var i;
        for (i = 0; i < this.selectors.length; i++) {
            var dyn = this.selectors[i];
            result.dynamicElements[dyn] = {
                selected: false,
                value: ""
            };
        }

        this.addAttr(result);
        if (attributeForms) {
            for (i = 0; i < attributeForms.length; i++) {
                var formID = attributeForms[i];
                if (formID.substring(0, 1) != "_") {
                    formID = "_" + formID;
                }
                this.attachAttrForm(result.id, formID);
            }

            if (!dataType) {
                if (!attributeForms[0]) {
                    result.dataType = 6; // N/A
                }

                else {
                    result.dataType = this.forms["_" + attributeForms[0]].dataType;
                }
            }
        }
        result.parent = parent;

        return result;
    },

    getNewMetric: function (id, name, dataType, facts, tableName) {
        var that = this;
        var result = {
            name: that.makePrettyString(name),
            id: id,
            rid: id,
            dataType: dataType,
            colType: 1,
            description: "",
            operation: "Sum", // More hardcode
            formatString: "C0",
            facts: [],
            metricGroup: "",
            tableName: tableName,
            isLocal: true // This has been added because JQueryMX likes to add it's own
            // objects to my datastructures
        };

        this.addMetric(result);
        if (facts) {
            for (var i = 0, l = facts.length; i < l; i++) {
                var formID = facts[i];
                if (formID.substring(0, 1) != "_") {
                    formID = "_" + formID;
                }
                this.attachMetricFact(result.id, formID);
            }

            if (!dataType) {
                result.dataType = this.forms["_" + facts[0]].dataType;
            }
        }

        return result;
    },

    getNewCompMetric: function (id, name, type, metric1, metric2, dataType, tableName) {
        var result = {
            name: name,
            id: id,
            rid: id,
            dataType: dataType,
            compType: type,
            metric1Id: null,
            metric2Id: null,
            desc: "",
            metricGroup: "",
            formatString: "#,##0.0%;(#,##0.0%)",
            tableName: tableName,
            isLocal: true
        };

        if (metric1 && metric1.id) {
            result.metric1Id = metric1.id;
        }
        else {
            result.metric1Id = metric1;
        }

        if (metric2 && metric2.id) {
            result.metric2Id = metric2.id;
        }
        else {
            result.metric2Id = metric2;
        }
        this.addCompMetric(result);

        return result;
    },

    getNewTable: function (id, tableID, depth, parentTable) {
        var result = {
            id: id,
            tableID: tableID,
            databaseId: "",
            parentTable: parentTable,
            joins: [],
            columns: {
                segments: [],
                data: []
            },
            rootFilter: null,
            isLocal: true,
            depth: depth
        };
        this.addTable(result);

        return result;
    },

    getNewJoin: function (parentTable, joinTable) {
        var result = {
            parentTable: parentTable,
            id: joinTable.id,
            joinType: 0,
            conditions: [],
            table: joinTable
        };
        this.getNewCondition(result);
        parentTable.joins.push(result);
        this.addJoin(result);

        return result;
    },

    getNewRootFilter: function (table) {
        var result = {
            id: table.id + "_filter",
            parentTable: table,
            literal: true,
            comparisonOperator: 0,
            lvalue: "",
            rvalue: ""
        };
        table.rootFilter = result;

        return result;
    },

    getNewCondition: function (join, isRoot) {
        var condition = {
            id: "c-" + join.id + "_" + join.conditions.length,
            join: join,
            literal: false,
            comparisonOperator: 0,
            lvalue: "",
            rvalue: ""
        };
        join.conditions.push(condition);
        this.addCondition(condition);

        return condition;
    },

    getNewSegment: function (columnName, attributeForm) {
        var result = {
            databaseId: columnName,
            attributeForm: attributeForm
        };
        this.addSegment(result);

        return result;
    },

    getNewDatum: function (columnName, fact) {
        var result = {
            databaseId: columnName,
            fact: fact
        };
        this.addDatum(result);

        return result;
    },

    getValidTableChoices: function (table, tableList) {
        var tIndex = tableList.indexOf(table.tableID);
        if (tIndex > -1) {
            tableList.splice(tIndex, 1);
        }
        if (table.parentTable === null) {
            return tableList;
        }
        else {
            return this.getValidTableChoices(table.parentTable, tableList);
        }
    },

    metricToAttr: function (metric, facts) {
        this.deleteMetric(metric);
        var newAttr = this.getNewAttr(metric.id, metric.name, metric.dataType, "", "Self", facts, metric.tableName);
        return newAttr;
    },

    attrToMetric: function (attr, forms) {
        this.deleteAttr(attr);
        var newMetric = this.getNewMetric(attr.id, attr.name, attr.dataType, forms, attr.tableName);
        return newMetric;
    },

    segmentToDatum: function (segment) {
        var result = this.getNewDatum(segment.databaseId, segment.attributeForm);
        this.deleteSegment(segment);
        return result;
    },

    datumToSegment: function (datum) {
        var result = this.getNewSegment(datum.databaseId, datum.fact);
        this.deleteDatum(datum);
        return result;
    },

    getAttrOrMetr: function (colID) {
        if (this.metrics[colID]) {
            return this.metrics[colID];
        }

        else {
            return this.attributes[colID];
        }
    },

    propagateDataTypeChange: function (formID, newDataType) {
        var form = this.forms[formID];

        // The invariant I am assuming is that once a form datatype has been set, it's
        // children are correctly set too. Although the code structure does not 
        // directly reflect this, since the execution is concurrent, the data structures 
        // will reflect this invariant. (meaning so we don't recurse indefinitely, we
        // can return here safely)
        if (form.dataType == newDataType) {
            return;
        }
        form.dataType = newDataType;
        var i = 0,
            j = 0,
            l = 0,
            ll = 0;
        if (form.formType === 0 || form.formType === "0") {
            for (i = 0, l = form.attributes.length; i < l; i++) {
                var attrID = form.attributes[i];
                var attr = this.attributes[attrID];

                attr.dataType = newDataType;
                for (j = 0, ll = attr.attributeForms.length; j < ll; j++) {
                    this.propagateDataTypeChange(attr.attributeForms[j], newDataType);
                }
            }
        }
        else {
            for (i = 0, l = form.metrics.length; i < l; i++) {
                var metrID = form.metrics[i];
                var metric = this.metrics[metrID];

                metric.dataType = newDataType;
                for (j = 0, ll = metric.facts.length; j < ll; j++) {
                    this.propagateDataTypeChange(metric.facts[j], newDataType);
                }
            }
        }
    },

    propagateFormTypeChange: function (formID, newFormType) {
        var form = this.forms[formID];

        if (form.formType == newFormType) {
            return;
        }
        var j = 0,
            ll = 0,
            newID = "";
        if (form.formType === 0 || form.formType === "0") {
            form.formType = newFormType;

            while (form.attributes.length > 0) {
                var attrID = form.attributes[0];
                var attr = this.attributes[attrID];

                for (j = 0, ll = attr.attributeForms.length; j < ll; j++) {
                    this.propagateFormTypeChange(attr.attributeForms[j], newFormType);
                }
                newID = this.attrToMetric(attr, attr.attributeForms).id;
                this.idUpdates.push({
                    oldID: attrID,
                    newID: newID
                });
            }
            form.attributes = [];
            form.datum = this.segmentToDatum(form.segment);
        }
        else {
            form.formType = newFormType;

            while (form.metrics.length > 0) {
                var metrID = form.metrics[0];
                var metric = this.metrics[metrID];

                for (j = 0, ll = metric.facts.length; j < ll; j++) {
                    this.propagateFormTypeChange(metric.facts[j], newFormType);
                }
                newID = this.metricToAttr(metric, metric.facts).id;
                this.updateDimensionChildren(newID, "");
                this.idUpdates.push({
                    oldID: metrID,
                    newID: newID
                });
            }
            form.metrics = [];
            form.segment = this.datumToSegment(form.datum);
        }
    },

    updateAttrFormSelections: function () {
        var form = this.forms[this.updatedFormSelection.formID];
        var selections = this.updatedFormSelection.selections;
        var attrID = "";
        // add new elements
        for (var i = 0, l = selections.length; i < l; i++) {
            attrID = selections[i];
            // If it's not already in the set of attributes...
            if (this.attributes[attrID].attributeForms.indexOf(form.id) < 0) {
                this.attributes[attrID].attributeForms.push(form.id);
                form.attributes.push(attrID);
            }
        }

        i = 0;
        // Remove old unselected ones
        while (i < form.attributes.length) {
            attrID = form.attributes[i];

            // If it's not in the set of selections..
            if (selections.indexOf(attrID) < 0) {
                var index = this.attributes[attrID].attributeForms.indexOf(form.id);
                this.attributes[attrID].attributeForms.splice(index, 1);
                form.attributes.splice(i, 1);
            }
            else {
                i++;
            }
        }
    },

    updateMetricFormSelections: function () {
        var form = this.forms[this.updatedFormSelection.formID];
        var selections = this.updatedFormSelection.selections;
        var metrID = "";
        // add new elements
        for (var i = 0, l = selections.length; i < l; i++) {
            metrID = selections[i];
            // If it's not already in the set of metrics...
            if (this.metrics[metrID].facts.indexOf(form.id) < 0) {
                this.metrics[metrID].facts.push(form.id);
                form.metrics.push(metrID);
            }
        }

        i = 0;
        // Remove old unselected ones
        while (i < form.metrics.length) {
            metrID = form.metrics[i];

            // If it's not in the set of selections...
            if (selections.indexOf(metrID) < 0) {
                var index = this.metrics[metrID].facts.indexOf(form.id);
                this.metrics[metrID].facts.splice(index, 1);
                form.metrics.splice(i, 1);
            }
            else {
                i++;
            }
        }
    },

    attachToForm: function (ID, formID) {
        var elem = this.getAttrOrMetr(ID);
        if (elem.colType > 0) {
            this.attachMetricFact(ID, formID);
        }
        else {
            this.attachAttrForm(ID, formID);
        }
    },

    detachFromForm: function (ID, formID) {
        var elem = this.getAttrOrMetr(ID);
        if (elem.colType > 0) {
            this.detachMetricFact(ID, formID);
        }
        else {
            this.detachAttrForm(ID, formID);
        }
    },

    attachAttrForm: function (attrID, formID) {
        var form = this.forms[formID];
        if (form.attributes.indexOf(attrID) < 0) {
            form.attributes.push(attrID);
        }

        var attribute = this.attributes[attrID];
        if (attribute.attributeForms.indexOf(formID) < 0) {
            attribute.attributeForms.push(formID);
        }
    },

    detachAttrForm: function (attrID, formID) {
        var form = this.forms[formID];
        var attribute = this.attributes[attrID];

        var aIndex = form.attributes.indexOf(attrID);
        if (aIndex > -1) {
            form.attributes.splice(aIndex, 1);
        }

        var fIndex = attribute.attributeForms.indexOf(formID);
        if (fIndex > -1) {
            attribute.attributeForms.splice(fIndex, 1);
        }
    },

    attachMetricFact: function (metrID, formID) {
        var form = this.forms[formID];
        if (form.metrics.indexOf(metrID) < 0) {
            form.metrics.push(metrID);
        }

        var metric = this.metrics[metrID];
        if (metric.facts.indexOf(formID) < 0) {
            metric.facts.push(formID);
        }
    },

    detachMetricFact: function (metrID, formID) {
        var form = this.forms[formID];
        var metric = this.metrics[metrID];

        var aIndex = form.metrics.indexOf(metrID);
        if (aIndex > -1) {
            form.metrics.splice(aIndex, 1);
        }

        var fIndex = metric.facts.indexOf(formID);
        if (fIndex > -1) {
            metric.facts.splice(fIndex, 1);
        }
    },

    detachFromForms: function (colID) {
        var item = this.getAttrOrMetr(colID);
        if (item.colType == 1) {
            this.detachMetricFacts(item);
        }
        else {
            this.detachAttrForms(item);
        }
    },

    dimensionUpdated: function () {
        return (this.newDimension !== "" && this.dimensions.allDimensions.indexOf(this.newDimension) < 0);
    },

    addDimension: function () {
        if (this.dimensionUpdated()) {
            this.dimensions.allDimensions.push(this.newDimension);
        }
    },

    addAttr: function (attribute) {
        this.attributes[attribute.id] = attribute;
    },

    detachAttrForms: function (attr) {
        for (var i = 0, l = attr.attributeForms.length; i < l; i++) {
            var formID = attr.attributeForms[i];
            var attrForm = this.forms[formID];
            var ind = attrForm.attributes.indexOf(attr.id);
            if (ind > -1) {
                attrForm.attributes.splice(ind, 1);
            }
        }
    },

    deleteBaseTable: function (table) {
        for (var i = 0; i < this.baseTables.length; i++) {
            if (table.id == this.baseTables[i].id) {
                this.deleteTable(table);
                this.baseTables.splice(i, 1);
                return;
            }
        }
    },

    deleteAttr: function (attr) {
        this.detachAttrForms(attr);
        delete this.attributes[attr.id];
    },

    addMetric: function (metric) {
        this.metrics[metric.id] = metric;
    },

    detachMetricFacts: function (metric) {
        for (var i = 0, l = metric.facts.length; i < l; i++) {
            var formID = metric.facts[i];
            var fact = this.forms[formID];
            var ind = fact.metrics.indexOf(metric.id);
            if (ind > -1) {
                fact.metrics.splice(ind, 1);
            }
        }
    },

    deleteMetric: function (metric) {
        this.detachMetricFacts(metric);
        delete this.metrics[metric.id];
    },

    addCompMetric: function (compMetric) {
        this.compMetrics[compMetric.id] = compMetric;
    },

    deleteCompMetric: function (compMetric) {
        delete this.compMetrics[compMetric.id];
    },

    addTable: function (table) {
        this.tables[table.id] = table;
    },

    deleteTable: function (table) {
        delete this.tables[table.id];
    },

    addCondition: function (condition) {
        this.conditions[condition.id] = condition;
    },

    deleteCondition: function (condition) {
        delete this.conditions[condition.id];
    },

    addJoin: function (join) {
        this.joins[join.id] = join;
    },

    deleteJoin: function (join) {
        delete this.joins[join.id];
    },

    addSegment: function (segment) {
        this.segments[segment.databaseId] = segment;
    },

    deleteSegment: function (segment) {
        delete this.segments[segment.databaseId];
    },

    addDatum: function (datum) {
        this.data[datum.databaseId] = datum;
    },

    deleteDatum: function (datum) {
        delete this.data[datum.databaseId];
    },

    fullDeleteTable: function (table) {
        for (var i = 0; i < table.joins.length; i++) {
            var join = table.joins[i];
            for (var j = 0; j < join.conditions.length; j++) {
                this.deleteCondition(join.conditions[j]);
            }
            this.fullDeleteTable(join.table);
            this.deleteJoin(join);
        }
        this.deleteTable(table);
    },

    attachSegment: function (table, segment) {
        var sIndex = this.hasSegment(table, segment.databaseId);
        if (sIndex < 0) {
            table.columns.segments.push(segment);
        }
    },

    detachSegment: function (table, segment) {
        var sIndex = this.hasSegment(table, segment);
        if (sIndex > -1) {
            table.columns.segments.splice(sIndex, 1);
        }
    },

    attachDatum: function (table, datum) {
        var dIndex = this.hasDatum(table, datum.databaseId);
        if (dIndex < 0) {
            table.columns.data.push(datum);
        }
    },

    detachDatum: function (table, datum) {
        var dIndex = this.hasDatum(table, datum);
        if (dIndex > -1) {
            table.columns.data.splice(dIndex, 1);
        }
    },

    isFilter: function (rowID) {
        var dIndex = rowID.indexOf("_");
        return (rowID.substring(dIndex + 1) == "filter");
    },

    hasSegment: function (table, column) {
        for (var i = 0; i < table.columns.segments.length; i++) {
            if (table.columns.segments[i].databaseId == column) {
                return i;
            }
        }
        return -1;
    },

    hasDatum: function (table, column) {
        for (var i = 0; i < table.columns.data.length; i++) {
            if (table.columns.data[i].databaseId == column) {
                return i;
            }
        }
        return -1;
    },

    setMetricGroupChild: function (metrID, metricGroup) {
        if (metricGroup in this.metricGroups) {
            this.metricGroups[metricGroup].push(metrID);
        }

        else {
            this.metricGroups[metricGroup] = [metrID];
        }
    },

    deleteMetricGroupChild: function (metrID) {
        for (var metG in this.metricGroups) {
            if (!(this.metricGroups[metG] instanceof Array)) {
                continue;
            }

            var index = this.metricGroups[metG].indexOf(metrID);

            if (index > -1) {
                this.metricGroups[metG].splice(index, 1);
            }
        }
    },

    updateMetricGroupChildren: function (metrID, metricGroup) {
        this.deleteMetricGroupChild(metrID);
        this.setMetricGroupChild(metrID, metricGroup);
    },

    setDimensionChild: function (attrID, dimension) {
        if (dimension in this.dimensions.dimensionChildren) {
            this.dimensions.dimensionChildren[dimension].push(attrID);
        }
        else {
            this.dimensions.dimensionChildren[dimension] = [attrID];
        }
    },

    deleteDimensionChild: function (attrID) {
        for (var dim in this.dimensions.dimensionChildren) {
            if (!(this.dimensions.dimensionChildren[dim] instanceof Array)) {
                continue;
            }

            var index = this.dimensions.dimensionChildren[dim].indexOf(attrID);

            if (index > -1) {
                this.dimensions.dimensionChildren[dim].splice(index, 1);
            }
        }
    },

    updateDimensionChildren: function (attrID, dimension) {
        this.deleteDimensionChild(attrID);
        this.setDimensionChild(attrID, dimension);
    },

    updateDimensionSelections: function (attrID, newSelection) {
        this.attributes[attrID].dimension = newSelection;
        if (this.dimensions.allDimensions.indexOf(newSelection) == -1) {
            this.dimensions.allDimensions.push(newSelection);
        }

        this.updateDimensionChildren(attrID, newSelection);
    },

    detectParentCycle: function (startAttrID, parent) {
        // There exists a loop
        if (parent.id == startAttrID) {
            return true;
        }
        // We have reached the end of the parent hierachy
        else if (parent.parent === "Self") {
            return false;
        }

        var newParent = this.attributes[parent.parent];
        return this.detectParentCycle(startAttrID, newParent);
    },

    attrsOrMetrics: function (formType) {
        if (formType === 0 || formType === "0") { // attribute
            return this.attributes;
        }
        else if (formType === 1 || formType === "1") { // metric
            return this.metrics;
        }
        else {
            return null; // bad input
        }
    }
});
