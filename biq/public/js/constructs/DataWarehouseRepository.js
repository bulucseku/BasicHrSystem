(function() {
    // Private helper method (static) that is not accessible to 
    // callers who have an instance of this class.
    function makeHtmlIdFromOid(oid) {
        return "hid_" + oid.replace(/[^a-zA-Z0-9]/g, "");
    }

    // Private Regular Expression used inside this module...
    var RE_FILTERED_METRIC_OID = /^\(([^@]*)@(.*)\)$/;
    var RE_RANGE_FILTER_OID = /^(.*):(.*)--(.*)$/;
    var RE_TREE_FILTER_OID = /^\(([^\+]+)(.*)\)(.+)$/;
    var RE_REUSABLE_COLUMN_OID = /^f\(\d+\)$/;
    var RE_AGGREGATE_COLUMN_OID = /^(.*?.+)\((.*?.+)\)$/;
    var RE_CONDITIONAL_METRIC_OID = /if\((.*?[^,]+)\,(.*?.+)\)/;

    // Consider that , : | [ ] > < { } ( ) $ ; # ^ ~ . \ characters are not allowed for the column name
    var INVALID_CHAR_FOR_COLUMN_NAME = [',', ':', '|', '[', ']', '<', '>', '{', '}', '(', ')', '$', ';', '#', '^', '~', '.', '\\', '\'', '"'];

    // Private helper method to construct the OID for a filtered metric...
    // This should be kept consistent with the regular expression to parse it...
    function createFilteredMetricOID(metricOid, filterOid) {
        return "(" + metricOid + "@" + filterOid + ")";
    }

    var rangeFilterIndex = 0;

    can.Construct("Sentrana.Models.DataWarehouseRepository", {}, {
        init: function DWR_init(repositoryObjects, app) {
            // Define our instance fields...

            this.app = app;

            /* The repositories id and name */
            this.id = null;
            this.name = null;
            this.supportedFeatures = null;
            this.loadedAttributeForms = [];

            /* Map of DW objects, keyed by the HTML ID. This ID can be used safely as a DOM ID, class name 
             * as well as a jQueryMX Model attribute. The fact that the OBJECT ID may contain spaces and
             * punctuation makes it unacceptable for these purposes. The conversion of OBJECT ID to
             * HTML ID should be strictly one-to-one and not allow two different OBJECT IDs to map to the
             * same HTML ID. */
            this.objectMap = {};

            /* Array of Metric group  */
            this.metricGroups = [];
            this.metricGroupNames = [];

            /* Map of Dimension objects, keyed by the dimension name. */
            this.dimensions = {};

            /* Array of dimension names */
            this.dimensionNames = [];

            /* Array of required attributes */
            this.requiredAttributes = [];

            this.reusableColumns = [];

            this.datafilters = repositoryObjects.datafilters;
            this.metricDimensionMapping = repositoryObjects.metricDimensionMapping || [];
            this.showDataDictionaryDefinition = repositoryObjects.showDataDictionaryDefinition;
            // Process all of the objects...
            this.processObjects(repositoryObjects);

            this.savedFilters = this.getSavedFilterGroup(repositoryObjects.savedFilterGroups);
        },

        getSavedFilterGroup: function (savedFilterGroups) {
            var filterGroups = [], that = this;
            for (var i = 0; i < savedFilterGroups.length; i++) {
                var savedFilterGroup = this.getSavedFilterGroupModel(savedFilterGroups[i]);
                that.addSavedFilterGroupToObjectMap(savedFilterGroup);
                filterGroups.push(savedFilterGroup);
            }

            return filterGroups;
        },

        getSavedFilterGroupModel: function (fg) {
            var that = this;
            var filterGroup = {
                id: fg.id,
                name: fg.name,
                dataSource: fg.dataSource,
                filters: $.map(fg.filterIds, function (id) {
                    var object = that.getObjectByOID(id, true);
                    return object;
                })
            };

            return new Sentrana.Models.SavedFilter({ app: that.app, dwRepository: that, id: filterGroup.id, dataSource: filterGroup.dataSource, name: filterGroup.name, filters: filterGroup.filters });
        },

        addSavedFilterGroupToObjectMap: function (filterGroup) {
            var hidInput = filterGroup.id || filterGroup.name;
            this.objectMap[this.makeHtmlIdForSavedFilterGroup(hidInput)] = filterGroup;
        },

        makeHtmlIdForSavedFilterGroup: function (hidInput) {
            if (hidInput) {
                return "hid_filtergroup_" + hidInput.replace(/[^a-zA-Z0-9]/g, "");
            }
        },

        hasMetrics: function () {
            var metricsCount = 0;

            if (this.metricGroups && this.metricGroups.length > 0) {
                for (var i = 0; i < this.metricGroups.length; i++) {
                    if (this.metricGroups[i].metrics) {
                        metricsCount += this.metricGroups[i].metrics.length;
                    }
                }
            }

            return metricsCount > 0;
        },

        isOnlyOneGroup: function () {
            var groupCount = 0;
            for (var i = 0; i < this.metricGroups.length; i++) {
                if (this.metricGroups[i].metrics.length) {
                    groupCount++;
                }
            }

            return groupCount === 1;
        },
        
        getSavedFilter: function (id) {
            var index = this.getSavedFilterIndex(id);
            if (index > -1) {
                return this.savedFilters[index];
            }
        },

        getSavedFilterIndex: function (id) {
            for (var i = 0; i < this.savedFilters.length; i++) {
                if (this.savedFilters[i].id === id) {
                    return i;
                }
            }
            return -1;
        },

        // Instance method: Give out the list of dimension names...
        getDimensionNames: function DWR_getDimensionNames() {
            if (!this.isDimensionNameExists("GroupedFilter")) {
                this.dimensionNames.push("GroupedFilter");
            }
            return this.dimensionNames;
        },

        isDimensionNameExists: function(dimName) {

            var items = $.grep(this.dimensionNames, function(dim) {
                return dim === dimName;
            });

            return items.length > 0;
        },

        // Instance method: Give out supported features...
        getSupportedFeatures: function DWR_getDimensionNames() {
            return this.supportedFeatures;
        },

        // Instance method: Process the DW Objects...
        processObjects: function DWR_processObjects(objects) {
            // Define our overall object map...
            this.objectMap = {};
            this.Aggregationtypes = objects.aggregateFunctions;
            this.dataFiltersDetail = {};
            // Process the id and name...
            this.id = objects.oid;
            this.name = objects.name;
            this.supportedFeatures = objects.supportedFeatures;

            // Process the metric groups...
            this.metricGroups = [];
            this.metricGroupNames = [];

            for (var i = 0, l = (objects.metricGroups || []).length; i < l; i++) {
                var mg = objects.metricGroups[i],
                    mgName = mg.name;

                // Add it to our map, keyed by the name of the metric group...
                this.metricGroups.push(mg);
                this.metricGroupNames.push(mgName);

                for (var j = 0, m = (mg.metrics || []).length; j < m; j++) {
                    var metricItem = mg.metrics[j];

                    // Assign an ID...
                    metricItem.hid = makeHtmlIdFromOid(metricItem.oid);

                    // Ensure it is segmentable...
                    metricItem.segmentable = true;

                    // Assign a type...
                    metricItem.type = 'METRIC';
                    //                    if (!metricItem.operation) {
                    //                        metricItem.operation = 'Sum';
                    //                    }
                    metricItem.aggType = metricItem.operation;
                    metricItem.originalName = metricItem.name;
                    metricItem.originalHid = metricItem.hid;
                    // Add to our map...
                    this.objectMap[metricItem.hid] = metricItem;
                }

            }

            // Process the dimensions...
            this.dimensions = {};
            this.dimensionNames = [];
            for (i = 0, l = (objects.dimensions || []).length; i < l; i++) {
                var dim = objects.dimensions[i],
                    dimName = dim.name;

                // Add it to our map, keyed by the name of the dimension...
                this.dimensions[dimName] = dim;
                this.dimensionNames.push(dimName);

                // Loop through the attributes...
                for (j = 0, m = (dim.attributes || []).length; j < m; j++) {
                    var attr = dim.attributes[j];

                    // Create an object ID for attribute...
                    attr.hid = makeHtmlIdFromOid(attr.oid);

                    // Add a type and a reference to the dimension...
                    attr.type = 'ATTRIBUTE';
                    attr.dimName = dimName;

                    // Create a map to look up forms by their ID...
                    attr.formMap = {};

                    // Add it our our object map...
                    this.objectMap[attr.hid] = attr;

                    // If this attribute is required, add it to the list...
                    if (attr.required) {
                        this.requiredAttributes.push(attr);
                    }

                    // Loop through the forms...
                    for (var f = 0, g = attr.forms.length; f < g; f++) {
                        var form = attr.forms[f];

                        // Add each form to map...	
                        attr.formMap[form.oid] = form;

                        // Let's make the form name uppercase!
                        form.formName = form.name.toUpperCase();

                        // Add a type...
                        form.type = 'ATTRIBUTE_FORM';

                        // Save the HID of the attribute...
                        form.attrHID = attr.hid;

                        // Give the form an HTML ID...
                        form.hid = makeHtmlIdFromOid(form.oid);

                        // Give the form a "sort offset"
                        // This assumes at most 10 forms for a single attribute... 
                        form.sortOffset = f / 10;

                        // Add the object to the repository...
                        this.objectMap[form.hid] = form;
                        form.dataFilterOperator = this.getDataFilterOperator(form.oid);

                        if (form.dataFilterOperator) {
                            var dataFileterDetail = {
                                attrName: attr.name + " (" + attr.dimName + ")"
                            };
                            if (attr.forms.length > 1) {
                                dataFileterDetail.formName = form.name;
                            }
                            this.dataFiltersDetail[form.oid] = dataFileterDetail;
                        }

                        // Loop through the elements...
                        for (var k = 0, n = (form.elements || []).length; k < n; k++) {
                            var elem = form.elements[k],
                                elemValue = elem.eval || elem.name;

                            // Skip if our element value is empty string!
                            if (!elemValue) {
                                continue;
                            }

                            // Create the element identifier which is formed from the form OID + element value...
                            // No need to build this oid on the client side. It will be passed down fron service.
                            // elem.oid = form.oid + ":" + elemValue;

                            // Create an object ID for the element...
                            elem.hid = makeHtmlIdFromOid(elem.oid);

                            // Add a type and a reference to the attribute...
                            elem.type = 'ELEMENT';
                            elem.attrHID = attr.hid;
                            elem.dimName = dimName;

                            this.setUMDataFilterToElement(attr, form, elem);
                            // Add it to our object map...
                            this.objectMap[elem.hid] = elem;
                        }
                    }
                }

                // Sort the attributes alphabetically...
                dim.attributes.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
            }

            // Process the metric groups...
            this.reusableColumns = [];
            for (i = 0, l = (objects.derivedColumns || []).length; i < l; i++) {
                this.addReusableColumnToObjectMap(objects.derivedColumns[i]);
            }

        },

        isAttributeOnlyRepositry: function() {
            var metricsCount = 0;

            if (this.metricGroups && this.metricGroups.length > 0) {
                for (var i = 0; i < this.metricGroups.length; i++) {
                    if (this.metricGroups[i].metrics) {
                        metricsCount += this.metricGroups[i].metrics.length;
                    }
                }
            }

            return metricsCount === 0;
        },
        setUMDataFilterToElement: function(attr, form, elem) {
            elem.dataFilterOperator = form.dataFilterOperator;
            if (form.dataFilterOperator) {
                elem.isFilteredByDataFilter = this.isFilteredByDataFilter(form.oid, elem.name);
            } else {
                elem.isFilteredByDataFilter = false;
            }
        },

        getDataFilterOperator: function(attr) {
            var filters = $.grep(this.datafilters, function(filter) {
                return filter.dataFilterId === attr;
            });

            if (filters.length > 0) {
                return filters[0].operator;
            }

            return undefined;
        },

        isFilteredByDataFilter: function(attr, filterItem) {
            var filters = $.grep(this.datafilters, function(filter) {
                return filter.dataFilterId === attr;
            });
            var value = [];

            if (filters.length > 0) {
                value = $.grep(filters[0].values, function(item) {
                    return item.toString().toUpperCase() === filterItem.toString().toUpperCase();
                });
            }

            return value.length > 0;
        },

        addReusableColumnToObjectMap: function(derivedColumn) {

            var reusableColumn = this.formateReusableColumn(derivedColumn);

            this.reusableColumns.push(reusableColumn);
            // Add to our map...
            this.objectMap[reusableColumn.hid] = reusableColumn;
        },

        formateReusableColumn: function(derivedColumn) {

            var elementHID = '',
                aggType,
                originalName = '',
                originalOid;
            if (derivedColumn.formulaType === "CM") {
                var formula = derivedColumn.formula,
                    match = RE_CONDITIONAL_METRIC_OID.exec(formula),
                    metricId = match[2];

                var metricObject = this.getObjectByOID(metricId);

                var condition = match[1].replace(/[\(\)]/g, ''),
                    conditionSplited = condition.split(' and '),
                    htmlIds = [];
                for (var i = 0; i < conditionSplited.length; i++) {
                    var innetConditions = conditionSplited[i].split(' or ');
                    for (var j = 0; j < innetConditions.length; j++) {
                        var innerCondition = innetConditions[j];
                        innerCondition = innerCondition.replace(/[\[\]]/g, '');
                        var elementIdSplited = innerCondition.split('='),

                            elementId = $.trim(elementIdSplited[0]) + ":" + $.trim(elementIdSplited[1]);
                        var elementObject = this.getObjectByOID(elementId, true);
                        htmlIds.push(elementObject.hid);
                    }
                }

                originalName = metricObject.name;
                aggType = metricObject.aggType;
                elementHID = htmlIds.join(',');
                originalOid = metricObject.oid;
            }

            var reusableColumn = new Sentrana.Models.ReusableColumnInfo({
                "id": derivedColumn.id,
                "originalOid": originalOid,
                "oid": derivedColumn.oid,
                "name": derivedColumn.name,
                "originalName": originalName,
                "dataSource": derivedColumn.dataSource,
                "formula": derivedColumn.formula,
                "formulaType": derivedColumn.formulaType,
                "outputType": derivedColumn.outputType,
                "dataType": derivedColumn.outputType,
                "precision": derivedColumn.precision,
                "type": 'METRIC',
                "hid": makeHtmlIdFromOid(derivedColumn.oid),
                "elementHID": elementHID,
                "operation": "Sum",
                "aggType": aggType
            });

            return reusableColumn;
        },

        updateReusableColumnInObjectMap: function(derivedColumn) {

            derivedColumn = this.formateReusableColumn(derivedColumn);

            var index = -1;
            //Remove the existing column 

            //Find the pos
            for (var i = 0; i < this.reusableColumns.length; i++) {
                if (this.reusableColumns[i].id === derivedColumn.id) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                // Assign an ID...
                derivedColumn.hid = makeHtmlIdFromOid(derivedColumn.oid);

                // Assign a type...
                derivedColumn.type = 'METRIC';

                //Update List
                this.reusableColumns.splice(index, 1, derivedColumn);

                //update ObjectMap
                this.objectMap[derivedColumn.hid] = derivedColumn;
            }
        },

        removeReusableColumnFromObjectMap: function(derivedColumn) {

            var index = -1;
            //Remove the existing column 

            //Find the pos
            for (var i = 0; i < this.reusableColumns.length; i++) {
                if (this.reusableColumns[i].id === derivedColumn.id) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                //Remove from List
                this.reusableColumns.splice(index, 1);

                //delete from ObjectMap
                delete this.objectMap[derivedColumn.hid];
            }
        },

        // Instance method: get all metrics from the group
        getAllMetrics: function DWR_getAllMetrics() {
            var metrics = [];
            for (var i = 0; i < this.metricGroups.length; i++) {
                for (var j = 0; j < this.metricGroups[i].metrics.length; j++) {
                    metrics.push(this.metricGroups[i].metrics[j]);
                }
            }

            return metrics;
        },

        // Instance method: Determine if an OID matches the format of a AggregateMetric metric
        isAggregateMetric: function DWR_isFilteredMetric(oid) {
            // Search for a match for isFiltered metric
            var matchFilter = RE_FILTERED_METRIC_OID.exec(oid),
                isFiltered = false;

            // If no match, get out now...
            if (matchFilter) {
                isFiltered = true;
                oid = matchFilter[1];
            }

            var match = RE_AGGREGATE_COLUMN_OID.exec(oid);
            if (!match) {
                return false;
            }

            if (!this.isAggregationType(match[1])) {
                return false;
            }

            // Try to find the metric...
            var metricObject = this.getObjectByOID(match[2]);
            if (!metricObject) {
                return false;
            }

            if (isFiltered) {
                var elementsOid = matchFilter[2].split(','),
                    elementObjects = [];
                for (var i = 0; i < elementsOid.length; i++) {
                    var elementObject = this.getObjectByOID(matchFilter[2], true);
                    if (elementObject) {
                        elementObjects.push(elementObject);
                    }
                }
                if (elementObjects.length === 0) {
                    return false;
                }
                // Create a new object to hold this information...
                return this.createMetricWithAggregationAndFilter(metricObject, elementObjects, match[1]);
            }

            // Create a new object to hold this information...
            return this.createMetricWithAggregationType(metricObject, match[1]);
        },

        isAggregationType: function(agg) {
            var aggType = $.grep(this.Aggregationtypes, function(type) {
                return type.Key.toUpperCase() === agg.toUpperCase();
            });

            return aggType.length > 0;
        },

        // Instance method: Determine if an OID matches the format of a filtered metric
        isFilteredMetric: function DWR_isFilteredMetric(oid) {
            // Search for a match...
            var match = RE_FILTERED_METRIC_OID.exec(oid),
                isConditionalMetric = false,
                metricObject;
            if (!match) {
                match = RE_CONDITIONAL_METRIC_OID.exec(oid);
                isConditionalMetric = true;
            } else {
                metricObject = this.getObjectByOID(match[1]);
                if (!metricObject) {
                    return false;
                }

                return this.createFilteredMetric(metricObject, [this.getObjectByOID(match[2], true)]);
            }

            // If no match, get out now...
            if (!match) {
                return false;
            }

            var metricId = match[2],
                colName,
                oIdParts = oid.split(':');

            if (oIdParts.length > 1) {
                colName = oIdParts[0];
            }

            // Try to find the metric...
            metricObject = this.getObjectByOID(metricId);
            if (!metricObject) {
                return false;
            }

            var condition = match[1].replace(/[\(\)]/g, ''),
                conditionSplited = condition.split(' and '),
                elements = [];
            for (var i = 0; i < conditionSplited.length; i++) {
                var innetConditions = conditionSplited[i].split(' or ');
                for (var j = 0; j < innetConditions.length; j++) {
                    var innerCondition = innetConditions[j];
                    innerCondition = innerCondition.replace(/[\[\]]/g, '');
                    var elementIdSplited = innerCondition.split('='),
                        elementId = $.trim(elementIdSplited[0]) + ":" + $.trim(elementIdSplited[1]);
                    var elementObject = this.getObjectByOID(elementId, true);
                    elements.push(elementObject);
                }
            }

            if (!elements.length === 0) {
                return false;
            }

            // Create a new object to hold this information...
            var newMetric = this.createFilteredMetric(metricObject, elements, colName);
            if (isConditionalMetric) {
                newMetric.formula = oid;
            }

            return newMetric;
        },

        // Instance method: Determine if an OID matches the format of a filtered metric
        isRangeFilter: function DWR_isRangeFilter(oid) {
            // Search for a match...
            var match = RE_RANGE_FILTER_OID.exec(oid);

            // If no match, get out now...
            if (!match) {
                return false;
            }

            // For range filter, we won't necessarily be able to find the element. So we will just find the attribute.
            var form = this.getObjectByOID(match[1], true);
            var attr = this.objectMap[form.attrHID];
            if (!attr) {
                return false;
            }
            // The hid of range filter is a little different than the other fitlers
            // There will be index number after hid key word.
            // match[1] + match[2] + match[3] is actually the oid.
            var hid = "hid_" + rangeFilterIndex + "_" + (match[1] + match[2] + match[3]).replace(/[^a-zA-Z0-9]/g, "");
            rangeFilterIndex = rangeFilterIndex + 1;

            // Create a new object to hold this information...
            return this.createRangeFilter(attr.hid, attr.dimName, match[1], hid, 0, match[2], match[3]);
        },

        // Instance method: Determine if an OID matches the format of a filtered metric
        isTreeFilter: function DWR_isTreeFilter(oid) {
            // Search for a match...
            var match = RE_TREE_FILTER_OID.exec(oid);

            // If no match, get out now...
            if (!match) {
                return false;
            }

            // Create a new object to hold this information...
            return this.addElement({
                eID: oid,
                eName: match[3].split(":")[1],
                formID: match[1]
            });
        },

        getFilterElementsProperty: function(elementObjects) {
            var elementsOid = [],
                elementsHid = [];
            for (var i = 0; i < elementObjects.length; i++) {
                var filterOid = elementObjects[i].oid;

                // Add some special handling for the tree control at the moment.
                var match = RE_TREE_FILTER_OID.exec(filterOid);
                if (match) {
                    filterOid = match[3];
                }

                elementsOid.push(filterOid);
                elementsHid.push(elementObjects[i].hid);
            }

            return {
                elementsOid: elementsOid.join(','),
                elementsHid: elementsHid.join(',')
            };
        },

        // Instance method: Create a filtered metric object...
        createFilteredMetric: function DWR_createFilteredMetric(metricObject, elementObjects, name) {
            // Verify that we have non-null element and metric objects...
            if (!metricObject || !elementObjects || elementObjects.length === 0) {
                return null;
            }

            var elementsProperty = this.getFilterElementsProperty(elementObjects);
            // Create a new object to hold this information...
            var newMetric = {
                operation: metricObject.operation,
                aggType: metricObject.aggType,
                dataType: metricObject.dataType,
                desc: metricObject.desc,
                segmentable: metricObject.segmentable,
                formula: metricObject.formula,
                type: metricObject.type,
                subtype: "FILTERED",
                originalName: metricObject.originalName,
                oid: metricObject.oid,
                originalOid: metricObject.originalOid || metricObject.oid,
                originalHid: metricObject.originalHid,
                metricHID: metricObject.hid,
                filterOid: elementsProperty.elementsOid,
                elementHID: elementsProperty.elementsHid
            };

            newMetric.hid = this.getHID(newMetric);
            newMetric.oid = this.getFilterMetridOid(newMetric, name);
            if (name && name.length > 0) {
                newMetric.name = name;
                var tempName = this.getMetricNameWithAggType(newMetric);
                if (tempName !== name) {
                    newMetric.nameUpdatedManualy = true;
                }

            } else {
                newMetric.name = this.getMetricNameWithAggType(newMetric);
            }

            return newMetric;
        },

        getFilterMetridOid: function(metric, name) {
            var oid = metric.originalOid;
            if (metric.aggType && metric.aggType !== metric.operation) {
                oid = metric.aggType + "(" + oid + ")";
            }
            var formula = this.createFormula(metric, oid);

            if (name && name.length > 0) {
                oid = name + ":" + formula + ",dataType:" + metric.dataType + ",precision:0,formulaType:CM";
            }

            return oid;
        },

        createFormula: function(metric, oid) {
            if (metric.subtype === "FILTERED" && metric.elementHID.length > 0) {
                var elementHids = metric.elementHID.split(','),
                    elements = [];
                for (var i = 0; i < elementHids.length; i++) {
                    var element = this.objectMap[elementHids[i]];
                    elements.push(element);
                }

                var elementOid = this.joinFilterMetricOid(this.getFiltersGroupBy(elements), metric);

                return "if(" + elementOid + "," + oid + ")";
            }

            return undefined;
        },

        joinFilterMetricOid: function(filterGroup) {
            var innerCondition = [],
                totalCondition = [],
                that = this;

            $.each(filterGroup, function(index, val) {

                var condition = "(";
                innerCondition = [];

                for (var i = 0; i < val.length; i++) {
                    var oid = val[i].oid;
                    // Add some special handling for the tree control at the moment.
                    var match = RE_TREE_FILTER_OID.exec(oid);
                    if (match) {
                        oid = match[3];
                    }
                    var attrAndValue = oid.split(':');
                    innerCondition.push(attrAndValue[0] + "=[" + attrAndValue[1] + "]");
                }
                condition += innerCondition.join(' or ');
                condition += ")";

                totalCondition.push(condition);
            });

            return totalCondition.join(' and ');
        },

        createMetricWithAggregationType: function(metricObject, aggType) {
            // Verify that we have non-null element and metric objects...
            if (!metricObject || !aggType) {
                return null;
            }

            if (aggType === metricObject.operation) {
                if (metricObject.subtype !== "FILTERED") {
                    return this.objectMap[metricObject.originalHid];
                }
            }

            // Create a new object to hold this information...
            var newMetric = {
                operation: metricObject.operation,
                aggType: aggType,
                dataType: metricObject.dataType,
                desc: metricObject.desc,
                segmentable: metricObject.segmentable,
                type: metricObject.type,
                subtype: metricObject.subtype,
                originalName: metricObject.originalName,
                oid: metricObject.oid,
                originalOid: metricObject.originalOid || metricObject.oid,
                originalHid: metricObject.originalHid,
                metricHID: metricObject.hid,
                filterOid: metricObject.filterOid,
                elementHID: metricObject.elementHID
            };

            newMetric.hid = this.getHID(newMetric);

            if (metricObject.nameUpdatedManualy) {
                newMetric.name = metricObject.name;
            } else {
                newMetric.name = this.getMetricNameWithAggType(newMetric);
            }

            if (metricObject.subtype === "FILTERED") {
                newMetric.oid = this.getFilterMetridOid(newMetric, newMetric.name);
            }

            return newMetric;
        },

        createMetricWithAggregationAndFilter: function(metricObject, elementObjects, aggType) {
            if (!metricObject || !elementObjects || elementObjects.length === 0 || !aggType) {
                return null;
            }

            var elementsProperty = this.getFilterElementsProperty(elementObjects);
            // Create a new object to hold this information...
            var newMetric = {
                operation: metricObject.operation,
                aggType: aggType,
                dataType: metricObject.dataType,
                desc: metricObject.desc,
                segmentable: metricObject.segmentable,
                type: metricObject.type,
                subtype: "FILTERED",
                originalName: metricObject.originalName,
                oid: metricObject.oid,
                originalOid: metricObject.originalOid || metricObject.oid,
                originalHid: metricObject.originalHid,
                metricHID: metricObject.hid,
                filterOid: elementsProperty.elementsOid,
                elementHID: elementsProperty.elementsHid
            };

            newMetric.hid = this.getHID(newMetric);
            newMetric.name = this.getMetricNameWithAggType(newMetric);
            return newMetric;
        },

        getHID: function(metric) {

            var oid = metric.oid;

            if (!this.isFomulaColumn(metric) && metric.filterOid) {
                oid += "@" + metric.filterOid;
            }

            if (metric.aggType && metric.aggType !== metric.operation) {
                oid += "_" + metric.aggType;
            }

            return makeHtmlIdFromOid(oid);
        },

        isFomulaColumn: function(metric) {
            return metric.formula && metric.formula.length > 0;
        },

        getMetricNameWithAggType: function(metric, filters) {
            var elementName = '',
                agg = '',
                suffix = '';
            if (filters) {
                elementName = this.creatFilterMetricName(filters, metric);
            } else {
                if (metric.subtype === "FILTERED" && metric.elementHID.length > 0) {
                    var elementHids = metric.elementHID.split(','),
                        elements = [];
                    for (var i = 0; i < elementHids.length; i++) {
                        var element = this.objectMap[elementHids[i]];
                        elements.push(element);
                    }

                    elementName = this.creatFilterMetricName(this.getFiltersGroupBy(elements), metric);
                }
            }

            if (metric.aggType && metric.aggType !== metric.operation) {
                agg = this.getAggregationValue(metric.aggType);
                if (elementName.length) {
                    agg += "()";
                }
            }

            if (agg.length) {
                suffix = agg;
            }

            if (elementName.length) {
                suffix += elementName;
            }

            if (suffix.length) {
                return metric.originalName + "(" + suffix + ")";
            }

            return metric.originalName;
        },

        creatFilterMetricName: function(filterGroup) {
            var elementName = [],
                namearr = [];

            $.each(filterGroup, function(index, val) {
                var name = "(";
                elementName = [];

                for (var i = 0; i < val.length; i++) {
                    elementName.push(val[i].name);
                }
                name += elementName.join(' OR ');
                name += ")";

                namearr.push(name);
            });

            return namearr.join(' AND ');
        },

        getFiltersGroupBy: function(filters) {

            var items = {},
                key;
            $.each(filters, function(index, val) {
                key = val.attrHID;
                if (!items[key]) {
                    items[key] = [];
                }
                items[key].push(val);
            });

            return items;
        },

        getAggregationValue: function(key) {
            var aggTypes = $.grep(this.Aggregationtypes, function(type) {
                return type.Key === key;
            });

            return aggTypes[0].Value;
        },
        // Instance method: Create a range filter object...
        createRangeFilter: function DWR_createRangeFilter(attrHID, dimName, formOid, hid, index, lowerBound, upperBound) {
            // Verify that we have non-null attributeForm and other objects.
            if (!attrHID || !dimName || !formOid || !hid || !lowerBound || !upperBound) {
                return null;
            }
            // Create a new object to hold this information...
            return {
                type: "ELEMENT",
                subtype: "RANGE",
                name: lowerBound + " - " + upperBound,
                hid: hid,
                oid: formOid + ":" + lowerBound + "--" + upperBound,
                attrHID: attrHID,
                dimName: dimName
            };
        },

        // Instance method: Determine if an OID matches the format of a derived column
        isDerivedColumn: function(oid) {

            // Search for a match...
            var invalidChars = INVALID_CHAR_FOR_COLUMN_NAME.join('\\');
            var pattern = new RegExp("^[^\\" + invalidChars + "]+\\:.*\\,dataType\\:\\w+\\,precision\\:\\d+(\\,formulaType:DM)?$");

            var match = pattern.exec(oid);

            // If no match, get out now...
            if (!match) {
                return false;
            }

            // Create a new object to hold this information...
            return this.createDerivedColumn(oid);
        },

        // Instance method: Create a derived column object...
        createDerivedColumn: function(oid) {
            // Verify that we have non-null element and metric objects...
            var splitedValues = oid.split(',');
            if (!splitedValues || splitedValues.length <= 0) {
                return false;
            }

            var nameFormulaPair = splitedValues[0].split(':');
            var name = nameFormulaPair[0];
            var formula = nameFormulaPair[1];
            var outputType = splitedValues[1].split(':')[1];
            var precision = splitedValues[2].split(':')[1];

            // Create the HTML and Object ID for this object...
            var hid = 'dcid_' + name;

            // Create a new object to hold this information...
            return {
                type: "METRIC",
                name: name,
                hid: hid,
                oid: oid,
                formula: formula,
                outputType: outputType,
                precision: precision,
                formulaType: "DM"
            };
        },

        createDerivedColumnOID: function(derivedColumn) {
            return derivedColumn.name + ':' + derivedColumn.formula + ',dataType:' + derivedColumn.outputType +
                ',precision:' + derivedColumn.precision + ",formulaType:" + derivedColumn.formulaType;
        },

        // Instance method: Try to create a new object from the OID supplied...
        createObjectFromOID: function DWR_createObjectFromOID(oid) {
            var parts = oid.split(":");

            // If we don't have at least two parts, get out now...
            if (parts.length < 2) {
                return null;
            }

            var attrFormOID = parts.shift(),
                eName = parts.join(":");

            // Can we get the object for the first part?
            var parentObject = this.getObjectByOID(attrFormOID);

            // If we can't get the parent object, get out now...
            if (!parentObject) {
                return null;
            }

            // Is this an ATTRIBUTE_FORM? If not, get out now...
            if (parentObject.type !== 'ATTRIBUTE_FORM') {
                return null;
            }

            return this.addElement({
                eID: oid,
                eName: eName,
                formID: attrFormOID
            });
        },

        isSavedFilterGroup: function (part) {
            var filterParts = part.split(',');
            if (filterParts.length < 2) {
                return false;
            }

            var keyValuePairs = [];
            for (var p = 0; p < filterParts.length; p++) {
                var keyValue = filterParts[p].split('@');
                keyValuePairs[$.trim(keyValue[0])] = keyValue[1];
            }
            
            if (keyValuePairs["type"] === "GroupedFilter") {
                if (keyValuePairs["isSaved"] === "true") {
                    var savedFilterGroup = this.getSavedFilter(keyValuePairs["value"]);
                } else {
                   var that = this;
                   var savedFilters = keyValuePairs["value"].split("&").map(function (s) {
                       return that.getObjectByOID($.trim(s), true);
                    });

                   savedFilterGroup = new Sentrana.Models.SavedFilter({ app: this.app, dwRepository: this, name: keyValuePairs["name"], filters: savedFilters });
                   this.addSavedFilterGroupToObjectMap(savedFilterGroup);
                }

                return savedFilterGroup;
            }

            return false;
        },


        // Instance method: Get an object by its server-side OID (Object ID)
        getObjectByOID: function DWR_getObjectByOID(oid, create) {
            // Convert create to an exact true/false value...
            create = create === true;

            // Is this a saved filter group element?
            var savedFilterGroup = this.isSavedFilterGroup(oid);
            if (savedFilterGroup) {
                return savedFilterGroup;
            }

            // Is this a tree filter element?
            var aggregateMetricObject = this.isAggregateMetric(oid);
            if (aggregateMetricObject) {
                if (!this.objectMap[aggregateMetricObject.hid]) {
                    this.objectMap[aggregateMetricObject.hid] = aggregateMetricObject;
                }
                return aggregateMetricObject;
            }

            // Is this a filtered metric?
            var filteredMetricObject = this.isFilteredMetric(oid);
            if (filteredMetricObject) {
                // Put it in our object map...
                this.objectMap[filteredMetricObject.hid] = filteredMetricObject;

                return filteredMetricObject;
            }

            // Is this a tree filter element?
            var treeElementObject = this.isTreeFilter(oid);
            if (treeElementObject) {
                return treeElementObject;
            }

            // Is this is Reusable Derived Column
            if (RE_REUSABLE_COLUMN_OID.test(oid)) {
                var reusableColumn = this.objectMap[makeHtmlIdFromOid(oid)];
                return reusableColumn;
            }

            // Try to get the object...
            var htmlId = makeHtmlIdFromOid(oid);
            var object = this.objectMap[htmlId];
            // Do we have an object?
            if (object) {
                return object;
            }

            // try to get a composite attribute
            var compositeAttribute = this.objectMap[makeHtmlIdFromOid(oid) + "XFRM"];
            // Do we have an object?
            if (compositeAttribute) {
                return compositeAttribute;
            }

            // Is this a range filter?
            var rangeFilterObject = this.isRangeFilter(oid);
            if (rangeFilterObject) {
                // Put it in our object map...
                this.objectMap[rangeFilterObject.hid] = rangeFilterObject;

                return rangeFilterObject;
            }

            // Is this a derived column?
            var derivedColumnObject = this.isDerivedColumn(oid);
            if (derivedColumnObject) {
                return derivedColumnObject;
            }

            // No object. Don't create a new one?
            if (!create) {
                return null;
            }

            // Try to create a new object from the information we have...
            object = this.createObjectFromOID(oid);

            return object;
        },

        // Retrieve information about the report from the URL...
        retrieveReportDefnFromUrl: function AHRC_retrieveReportDefnFromUrl(search) {
            var qmark = search.indexOf("?"),
                urlParamsStr = (qmark > -1) ? search.substr(qmark + 1) : search,
                nvPairs = urlParamsStr.split("&"),
                urlParams = null;

            // Loop through the name-value pairs...
            for (var i = 0, l = nvPairs.length; i < l; i++) {
                var nvPair = nvPairs[i],
                    nvPairParts = nvPair.split("=");

                // Are there exactly 2 parts to the name/value pair?
                if (nvPairParts.length === 2) {
                    // Are we without a map?
                    if (!urlParams) {
                        urlParams = {};
                    }

                    // Add the name and decoded value to the map...
                    urlParams[nvPairParts[0]] = decodeURIComponent(nvPairParts[1]);
                }
            }

            // Construct the element infos from the filter elements...
            var fuList = ((urlParams || {}).filter || "").split("|"),
                eInfos = [];
            for (i = 0, l = fuList.length; i < l; i++) {
                var fuSpec = fuList[i],
                    htmlId = makeHtmlIdFromOid(fuSpec),
                    object = this.objectMap[htmlId];

                // Are we unable to find this object?
                if (!object) {
                    var fuParts = fuSpec.split(":");

                    // Are there exactly two parts to the filter unit specification?
                    if (fuParts.length === 2) {
                        // Construct an eInfo object...
                        var eInfo = {
                            eName: fuParts[1],
                            eID: fuSpec,
                            formID: fuParts[0]
                        };

                        // Add it to our list...
                        eInfos.push(eInfo);
                    }
                }
            }

            // Refine the totals...
            urlParams.totals = urlParams.totals === "true";

            // Assign the eInfos to the returned object...
            urlParams.eInfos = eInfos;

            return urlParams;
        },

        // Instance Method: Add a new element to the DW Repository...
        addElement: function DWR_addElement(eInfo) {
            // Can we find the attribute form it refers to?
            var attrForm = this.getObjectByOID(eInfo.formID),
                attr = this.objectMap[attrForm.attrHID],
                htmlId = makeHtmlIdFromOid(eInfo.eID);

            if (attrForm) {
                // Create a new object...
                var object = {
                    name: eInfo.eName,
                    oid: eInfo.eID,
                    hid: htmlId,
                    type: 'ELEMENT',
                    attrHID: attr.hid,
                    dimName: attr.dimName
                };

                // Add it to our map...
                this.objectMap[object.hid] = object;

                return object;
            }

            return null;
        },

        // Instance Method: Add any new elements that might have come back from a drill operation...
        addElements: function DWR_addElements(eInfos) {
            for (var i = 0, l = (eInfos || []).length; i < l; i++) {
                var eInfo = eInfos[i],
                    object = this.getObjectByOID(eInfo.eID);

                // Is this element NOT already in our map?
                if (!object) {
                    this.addElement(eInfo);
                }
            }
        },

        checkLoadedForm: function (form, async) {
            var that = this;
            var checked = $.inArray(form.oid, this.loadedAttributeForms) !== -1;
            if ((!form.elements || form.elements.length == 0) && !checked) {
                this.loadedAttributeForms.push(form.oid);
                return $.ajax({
                    url: Sentrana.Controllers.BIQController.generateUrl("AttributeForm/" + form.oid),
                    dataType: "json",
                    async: async,
                    success: function (data) {
                        if (!data) {
                            return;
                        }
                        that.updateFormElements(data);
                    }
                });
            }

            return $.ajax({});
        },

        updateFormElements: function(newForm) {
            var form = this.objectMap[makeHtmlIdFromOid(newForm.oid)],
                attr = this.objectMap[form.attrHID];

            // Loop through the elements...
            for (var k = 0, n = (newForm.elements || []).length; k < n; k++) {
                var elem = newForm.elements[k],
                    elemValue = elem.eval || elem.name;

                // Skip if our element value is empty string!
                if (!elemValue) {
                    continue;
                }

                // Create the element identifier which is formed from the form OID + element value...
                // No need to build this oid on the client side. It will be passed down fron service.
                // elem.oid = form.oid + ":" + elemValue;

                // Create an object ID for the element...
                elem.hid = makeHtmlIdFromOid(elem.oid);

                // Add a type and a reference to the attribute...
                elem.type = 'ELEMENT';
                elem.attrHID = attr.hid;
                elem.dimName = attr.dimName;
                elem.dataFilterOperator = form.dataFilterOperator;
                if (form.dataFilterOperator) {
                    elem.isFilteredByDataFilter = this.isFilteredByDataFilter(form.oid, elem.name);
                    var dataFilterDetail = {
                        attrName: attr.name + " (" + attr.dimName + ")"
                    };
                    if (attr.forms.length > 1) {
                        dataFilterDetail.formName = form.name;
                    }
                    this.dataFiltersDetail[form.oid] = dataFilterDetail;
                } else {
                    elem.isFilteredByDataFilter = false;
                }

                // Add it to our object map...
                this.objectMap[elem.hid] = elem;
            }
            form.elements = newForm.elements;
        },

        isInvalidCharacterExistsInColumnName: function(columnName) {
            var invalidChars = INVALID_CHAR_FOR_COLUMN_NAME.join('\\');
            var pattern = new RegExp("[\\" + invalidChars + "]");
            return pattern.test(columnName);
        },

        getInvalidCharactersForColumnName: function() {
            return INVALID_CHAR_FOR_COLUMN_NAME.join(' ');
        }
    });
})();
