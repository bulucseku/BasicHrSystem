can.Observe.extend("Sentrana.Models.ReportDefin", {}, {
    // Constructor...
    init: function RD_init(options) {
        /* This is a reference to the top-level Controller that holds a reference to the entire
         * Data Warehouse Repository.
         */
        this.app = options.app;

        /* Define the skeleton data structure for our report definition. */
        this.setup({
            templateUnits: [],
            filterDims: this.getDimensionArrayMap(),
            canView: true,
            canReset: true
        });

        /* This map records what objects are already part of the report definition. The HTML ID
         * of those objects are stored in this map.
         */
        this.objectMap = {};

        this.derivedColumnMap = {};

        this.isCleared = true;
    },

    // Instance method: Get the template unit object, given the HTML ID
    getTemplateUnit: function RD_getTemplateUnit(htmlid) {
        for (var i = 0, l = this.templateUnits.length; i < l; i++) {
            if (this.templateUnits[i].hid === htmlid) {
                return this.templateUnits[i];
            }
        }

        return undefined;
    },

    // Instance method: Move an existing template unit (and a specific index) to a new position (at a new index)...
    moveTemplateUnit: function RD_moveTemplateUnit(fromIndex, toIndex) {
        // Is the index the same? In which case, it is not moved?
        if (fromIndex === toIndex) {
            return;
        }

        // Take out the original object...
        var array = this.templateUnits.splice(fromIndex, 1);

        // Add it in at the new index...
        this.templateUnits.splice(toIndex, 0, array[0]);
    },

    // Instance method: Move a column (which may be a single form or metric) to a new position...
    moveColumn: function RD_moveColumn(fromIndex, toIndex) {
        // Get the array of template unit indices...
        var tuIndices = this.getTemplateUnitIndices();

        // Move the affected template units...		
        this.moveTemplateUnit(tuIndices[fromIndex], tuIndices[toIndex]);
    },

    // Instance method: Add a template unit to the report definition... 
    addTemplateUnit: function RD_addTemplateUnit(tu, pos) {
        // Create an object to represent the template unit model...
        var templateUnit = new can.Observe(tu);

        // Record that we have this object (as known by its HTML ID) in our report definition...				
        // This must appear BEFORE adding it to the observeable object otherwise, it will be added TWICE				
        this.objectMap[tu.hid] = tu.hid;

        // Add the template unit into our own model...
        this.templateUnits.splice(pos, 0, templateUnit);
    },

    getTemplateUnitIndex: function RD_getTemplateUnit(htmlid) {
        for (var i = 0, l = this.templateUnits.length; i < l; i++) {
            if (this.templateUnits[i].hid === htmlid) {
                return i;
            }
        }

        return -1;
    },
    // Instance method: Indicate that an object is being selected (added to the report definition)...
    selectObject: function RD_selectObject(htmlid, position, sortPosition) {

        var object = this.getObjectFromObjectMap(htmlid);

        // Check whether this object is already in the report definition...
        if (this.objectMap[htmlid] || !object) {
            return;
        }

        var tuInfo = {
            operation: object.operation,
            oid: object.oid,
            type: object.type,
            name: object.name,
            formula: object.formula,
            forms: object.forms,
            selectedForms: this.computeSelectedForms(object),
            aggType: object.aggType,
            dataType: object.dataType,
            subtype: object.subtype,
            originalName: object.originalName,
            originalHid: object.originalHid,
            filterOid: object.filterOid,
            elementHID: object.elementHID,
            segmentable: object.segmentable,
            hid: htmlid
        };

        // What type of object is it?
        switch (object.type) {
        case "METRIC":

            // Determine the position of the metric in the template...
            var metricPosition = this.templateUnits.length;
            var metricSortPosition = this.templateUnits.length + 1;
            if (position !== undefined) {
                metricPosition = position;
            }
            if (sortPosition !== undefined) {
                metricSortPosition = sortPosition;
            }

            tuInfo.sortPos = metricSortPosition;
            tuInfo.sortOrder = 'D';

            // Add a template unit...
            this.addTemplateUnit(tuInfo, metricPosition);

            //if it is a derived column then add to the map
            if (object.formula) {
                this.derivedColumnMap[htmlid] = object;
            }

            break;

        case "ATTRIBUTE":

            // Determine the position of the attribute in the template...
            var attributePosition = 0;
            var attributeSortPosition = this.templateUnits.length + 1;

            tuInfo.sortPos = attributeSortPosition;
            tuInfo.sortOrder = 'A';

            // Add a template unit...
            this.addTemplateUnit(tuInfo, attributePosition);

            break;
        case "ELEMENT":
            var attrHID = object.attrHID,
                attr = this.app.getDWRepository().objectMap[attrHID],
                dimName = object.dimName,
                dim = this.app.getDWRepository().dimensions[dimName];

            // Create a FilterUnit object...
            var filterUnit = {
                hid: htmlid
            };

            // Record that we have this object represented as a template unit...
            // This must appear BEFORE adding it to the observeable object otherwise, it will be added TWICE				
            this.objectMap[htmlid] = htmlid;

            // Record it in our array...
            this.filterDims[dimName].push(filterUnit);

            break;
        default:
            return;
            break;
        }
    },

    // Instance method: Indicate that an object is being deselected (removed from the report definition)...
    deselectObject: function RD_deselectObject(htmlid, action) {
        var object = this.getObjectFromObjectMap(htmlid);

        // Check whether this object is already missing from the report definition...
        if (!this.objectMap[htmlid] || !object) {
            return;
        }

        // What type of object is it?
        var index = -1;
        switch (object.type) {
        case "METRIC":
        case "ATTRIBUTE":
            // Find the position of the template unit 
            $.each(this.templateUnits, function (i, obj) {
                if (obj.hid === htmlid) {
                    index = i;
                    return false;
                }
            });

            // If not found, return now...
            if (index < 0) {
                return;
            }

            // Remove the template unit at the specified index...
            this.templateUnits.splice(index, 1);

            //if it is a derived column then remove from the map
            if (object.formula) {
                delete this.derivedColumnMap[htmlid];
            }

            if (action != "update") {
                // Normalize the sort positions...
                this.normalizeSortPositions();
            }

            break;
        case "ELEMENT":
            // Find the position of the filter unit (in its dimension array) 
            $.each(this.filterDims[object.dimName], function (i, obj) {
                if (obj.hid === htmlid) {
                    index = i;
                    return false;
                }
            });

            // If not found, return now...
            if (index < 0) {
                return;
            }

            // Remove the filter unit at the specified index...
            this.filterDims[object.dimName].splice(index, 1);

            break;
        default:
            break;
        }

        // Remove the ID from the object map...
        delete this.objectMap[htmlid];
    },

    // Instance method: Normalize the sort positions for all template units...	
    normalizeSortPositions: function RD_normalizeSortPositions(copy) {
        // Was a sorted template unit array missing?
        if (!copy) {
            // Create a copy of the template unit list...
            copy = this.templateUnits.serialize();

            // Sort the array by ascending sort position...
            copy.sort(function (a, b) {
                return a.sortPos - b.sortPos;
            });
        }

        // Create a map that holds the desired sort position for each template unit...
        var sortPositionMap = {};
        for (var i = 0, l = copy.length; i < l; i++) {
            sortPositionMap[copy[i].hid] = i + 1;
        }

        // Now walk through the actual template units list...
        for (i = 0, l = this.templateUnits.length; i < l; i++) {
            this.templateUnits[i].attr("sortPos", sortPositionMap[this.templateUnits[i].hid]);
        }
    },

    // Instance method: Try to change a unit's sort position
    changeSortPosition: function RD_changeSortPosition(htmlid, current, incrValue) {
        var desiredValue = current + incrValue,
            tus = this.templateUnits.serialize();

        // Check for global limits (1 <= desiredValue <= N)
        if (desiredValue < 1 || desiredValue > tus.length) {
            return;
        }

        // Sort the template units by increasing sort position...
        tus.sort(function (a, b) {
            return a.sortPos - b.sortPos;
        });

        // Loop through the sorted list...
        for (var i = 0, l = tus.length; i < l; i++) {
            var object = tus[i];

            // Is this object we want modify?
            if (object.hid === htmlid) {
                // Increment?
                if (incrValue === 1 && i < l - 1) {
                    // Swap with the object to the right...
                    tus[i] = tus[i + 1];
                    tus[i + 1] = object;
                }
                else if (incrValue === -1 && i > 0) {
                    // Swap with the object to the left...
                    tus[i] = tus[i - 1];
                    tus[i - 1] = object;
                }

                // Normalize the sort position...
                this.normalizeSortPositions(tus);

                return;
            }
        }
    },

    // Instance Method: Change the sort specification for the report
    changeSortSpecification: function RD_changeSortSpecification(sortSpec) {
        // Get the full, original list of columns, as they exist now...
        var origColumns = this.getTemplateUnitFormsAndMetrics();

        // Now, make a copy so that it can be sorted...
        var sortedColumns = origColumns.slice();

        // Add the column index to each (before sorting)...
        $.each(sortedColumns, function (index, col) {
            col.columnIndex = index;
        });
        sortedColumns.sort(function (a, b) {
            return a.sortPos - b.sortPos;
        });

        // Collect the array of supplied column indices...
        var suppliedIndices = $.map(sortSpec, function (col, index) {
            return col.columnIndex;
        });

        // Filter out columns already in the sort specification...
        sortedColumns = $.grep(sortedColumns, function (col, index) {
            return $.inArray(col.columnIndex, suppliedIndices) === -1;
        });

        // Add the remaining columns to the end of the list...
        $.each(sortedColumns, function (index, col) {
            sortSpec.push({
                columnIndex: col.columnIndex,
                sortOrder: col.sortOrder
            });
        });

        // Loop through each sort specification element...
        var tuMap = {},
            sortPosition = 1;
        for (var i = 0, l = (sortSpec || []).length; i < l; i++) {
            var oSort = sortSpec[i];

            // Get the template unit at a specific column index...
            if (!origColumns[oSort.columnIndex]) {
                // If report definition has been changed, we won't be able to find the original column.
                return;
            }
            var tu = origColumns[oSort.columnIndex].tu;

            // Do we a template unit? Have we not yet visited it?
            if (tu && !(tu.hid in tuMap)) {
                // Set the sort order and position...
                tu.attr("sortOrder", oSort.sortOrder);
                tu.attr("sortPos", sortPosition);

                // Record that we visited this template unit...
                tuMap[tu.hid] = 1;

                // Increment our sort position...
                sortPosition++;
            }
        }
    },

    // Instance Method: Return an object which is a map of dimension arrays...
    getDimensionArrayMap: function RD_getDimensionArrayMap() {
        // Loop through the list of dimension names...
        var filterDims = {};
        $.each(this.app.getDWRepository().getDimensionNames(), function (index, dimName) {
            filterDims[dimName] = [];
        });

        filterDims["GroupedFilter"] = [];

        return filterDims;
    },

    // Instance method: Is the filter empty?
    filterEmpty: function RD_filterEmpty() {
        var numFUs = 0,
            f = this.filterDims;

        // Loop through the list of dimensions...
        $.each(this.app.getDWRepository().getDimensionNames(), function (index, dimName) {
            numFUs += (f[dimName] || []).length;
        });

        return numFUs === 0;
    },

    // Instance method: Clear the report definition...
    clear: function RD_clear() {

        this.isCleared = true;
        // Reset our object map...
        this.objectMap = {};

        this.derivedColumnMap = {};

        // Reset our attributes...
        // TODO This seems necessary to create each of the empty dimension arrays, but there
        // seems to be some kind of bug in jQueryMX 3.2 that has the dimension array still 
        // present in the model in a "{model} change" event handler.
        this.attr({
            canReset: true,
            canView: true,
            canSave: false,
            templateUnits: [],
            filterDims: this.getDimensionArrayMap(),
            totalsOn: false
        }, true);
    },

    // Get an array of template units, expressed as the individual forms, and metrics...
    getTemplateUnitFormsAndMetrics: function RD_getTemplateUnitFormsAndMetrics() {
        var formsAndMetrics = [];
        for (var i = 0, l = this.templateUnits.length; i < l; i++) {
            var tu = this.templateUnits[i],
                object = this.getObjectFromObjectMap(tu.hid);

            if (!object) {
                object = this.app.getDWRepository().getObjectByOID(tu.oid, true);
            }

            var isAttr = object.type === "ATTRIBUTE",
                selectedForms = (isAttr) ? this.getSelectedForms(object, tu.selectedForms) : [object];

            // Add to the form and metrics array...
            for (var j = 0, m = selectedForms.length; j < m; j++) {
                formsAndMetrics.push({
                    tu: tu,
                    object: selectedForms[j],
                    sortOrder: tu.sortOrder,
                    sortPos: tu.sortPos
                });
            }
        }

        return formsAndMetrics;
    },

    // Get an array of template unit indices (with the same index used for each additional form)...
    // TODO Should this array always be available? Generated?
    getTemplateUnitIndices: function RD_getTemplateUnitIndices() {
        var tuIndices = [];
        for (var i = 0, l = this.templateUnits.length; i < l; i++) {
            var tu = this.templateUnits[i],
                object = this.getObjectFromObjectMap(tu.hid),
                isAttr = object.type === "ATTRIBUTE",
                selectedForms = (isAttr) ? this.getSelectedForms(object, tu.selectedForms) : [object];

            // Add to the form and metrics array...
            for (var j = 0, m = selectedForms.length; j < m; j++) {
                tuIndices.push(i);
            }
        }

        return tuIndices;
    },

    // Class method: Normalize an array of values to be all integer values...
    // Therefore: an array [ 3, 1.1, 1.3, 2] becomes [ 4, 1, 2, 3]
    // The first number is assumed to be 1.
    normalizeNumbers: function RD_normalizeNumbers(array, numProp) {
        // Create a copy of the original array...
        var copy = array.slice(0);

        // Sort it...
        copy.sort(function (a, b) {
            return a[numProp] - b[numProp];
        });

        var mapKeyCount = {};

        // Record the index of each of the sorted items...
        for (var map = {}, i = 0, l = copy.length; i < l; i++) {

            var keyOccurCount = mapKeyCount[copy[i][numProp]] ? mapKeyCount[copy[i][numProp]] + 1 : 1;
            mapKeyCount[copy[i][numProp]] = keyOccurCount;

            map["i" + copy[i][numProp] + "_" + keyOccurCount.toString()] = i;
        }

        mapKeyCount = {};

        // Loop through the original array...
        for (var newArray = [], j = 0, m = array.length; j < m; j++) {

            keyOccurCount = mapKeyCount[array[j][numProp]] ? mapKeyCount[array[j][numProp]] + 1 : 1;
            mapKeyCount[array[j][numProp]] = keyOccurCount;

            // Get the index of the copied object...
            var index = map["i" + array[j][numProp] + "_" + keyOccurCount.toString()],
                copiedObject = copy[index];

            // Update the index...
            copiedObject[numProp] = index + 1;

            // Add it to the new array...
            newArray.push(copiedObject);
        }

        return newArray;

    },

    // Instance method: Get the current sort order for the template...	
    getSort: function RD_getSort() {
        var formsAndMetrics = this.getTemplateUnitFormsAndMetrics(),
            sortPositions = [];
        for (var fam = 0, faml = formsAndMetrics.length; fam < faml; fam++) {
            var formAndMetric = formsAndMetrics[fam];

            // Is this an attribute form?
            if (formAndMetric.object.type === "ATTRIBUTE_FORM") {
                sortPositions.push({
                    sp: formAndMetric.sortPos + formAndMetric.object.sortOffset,
                    so: formAndMetric.sortOrder
                });

            }
            else if (formAndMetric.object.type === "METRIC") {
                sortPositions.push({
                    sp: formAndMetric.sortPos,
                    so: formAndMetric.sortOrder
                });
            }
        }

        // Get the normalized sort positions...
        var normSortPositions = this.normalizeNumbers(sortPositions, "sp");

        var sortParts = [];
        for (var i = 0, l = normSortPositions.length; i < l; i++) {
            var o = normSortPositions[i];
            sortParts.push(o.sp + o.so);
        }

        return sortParts.join("|");
    },

    getFileNameToExport: function () {
        var repository = this.app.retrieveRepositoryInfo(),
            fileName = $.trim(repository.repositoryName);
        fileName += '_';

        for (var i = 0, l = (this.templateUnits || []).length; i < l; i++) {
            var tu = this.templateUnits[i];
            fileName += tu.name + '_';
        }

        var currentdate = new Date();
        var datetime = currentdate.getFullYear() + '' + ('0' + (currentdate.getMonth() + 1)).slice(-2) + ('0' + currentdate.getDate()).slice(-2);

        //Consider that we may have a max file name of 128 characters
        var validFileNameLenght = 128;
        if ((fileName.length + datetime.length) > validFileNameLenght) {
            fileName = fileName.substr(0, (fileName.length - ((fileName.length + datetime.length) - validFileNameLenght)));
        }

        fileName += datetime;
        fileName = fileName.replace(/ /g, '-');

        return fileName;
    },

    // Instance method: Get the parameters that define the current report definition...
    getReportDefinitionParameters: function RD_getReportDefinitionParameters(withSavedFilter) {
        // Construct the template units...
        var objectMap = this.app.getDWRepository().objectMap,
            templateIds = [];
        for (var i = 0, l = (this.templateUnits || []).length; i < l; i++) {
            var tu = this.templateUnits[i];

            if (tu) {
                // Is this a metric?
                if (tu.type === "METRIC") {
                    templateIds.push(this.getCombinedOID(tu));
                }
                else if (tu.type === "ATTRIBUTE") {
                    for (var j = 0, m = tu.forms.length; j < m; j++) {
                        if (tu.selectedForms & (1 << j)) {
                            templateIds.push(tu.forms[j].oid);
                        }
                    }
                }
            }
        }

        // Construct the filter units...
        var filterIds = [],
            that = this;

        $.each(this.app.getDWRepository().getDimensionNames(), function (i, dimName) {
            if (dimName === "GroupedFilter") {
                for (var j = 0, dim = that.filterDims[dimName], m = dim.length; j < m; j++) {
                    var hid = dim[j].hid, savedFilter = that.getSavedFilter(hid), filterExpression = objectMap[dim[j].hid], isSaved="true";
                    if (!savedFilter) {
                        savedFilter = filterExpression;
                        isSaved = "false";
                        var value = savedFilter.filters.map(function(f) {
                            return f.oid;
                        }).join("&");
                    } else {
                        value = savedFilter.id;
                    }

                    if (withSavedFilter) {
                        for (var k = 0; k < savedFilter.filters.length; k++) {
                            filterIds.push(objectMap[savedFilter.filters[k].hid].oid);
                        }
                    } else {
                        filterIds.push("type@GroupedFilter, name@" + savedFilter.name + ", isSaved@" + isSaved + ", value@" + value);
                    }

                }
            } else {
                for (j = 0, dim = that.filterDims[dimName], m = dim.length; j < m; j++) {
                    filterIds.push(objectMap[dim[j].hid].oid);
                }
            }
        });

        // Generate the parameters for the call...
        return {
            template: templateIds.join("|"),
            filter: filterIds.join("|"),
            totals: !!this.totalsOn,
            sort: this.getSort()
        };
    },

    getSavedFilter: function (hid) {
        var savedFilters = this.app.getDWRepository().savedFilters;
        for (var i = 0; i < savedFilters.length; i++) {
            if (savedFilters[i].hid === hid) {
                return savedFilters[i];
            }
        }
    },

    getCombinedOID: function (object) {
        var oid = object.oid;
        if (!this.isFormulaColumn(object)) {
            if (object.aggType && object.aggType !== object.operation) {
                oid = object.aggType + "(" + oid + ")";
            }

            if (object.filterOid) {
                oid = "(" + oid + '@' + object.filterOid + ")";
            }
        }

        return oid;
    },

    isFormulaColumn: function (column) {
        return column.formula && column.formula.length > 0;
    },

    // Instance method: Get all filter objects...
    getFilterObjects: function RD_getFilterObjects() {
        var that = this,
            repo = this.app.getDWRepository(),
            filterElements = [];

        $.each(repo.getDimensionNames(), function (i, dimName) {
            for (var j = 0, dim = that.filterDims[dimName], l = dim.length; j < l; j++) {
                filterElements.push(repo.objectMap[dim[j].hid]);
            }
        });

        return filterElements;
    },

    // Instance method: Get all template unit objects of a certain type...
    getTemplateUnitObjectsByType: function RD_getTemplateUnitObjectsByType(type) {
        var objects = [];
        for (var i = 0, l = this.templateUnits.length; i < l; i++) {
            var tu = this.templateUnits[i],
                obj = this.getObjectFromObjectMap(tu.hid);

            if (obj.type === type) {
                objects.push(obj);
            }
        }

        return objects;
    },

    // Instance method: Get all metric objects (in the template)...
    getMetricObjects: function RD_getMetricObjects() {
        return this.getTemplateUnitObjectsByType("METRIC");
    },

    // Instance method: Get all attribute objects (in the template)...
    getAttributeObjects: function RD_getAttributeObjects() {
        return this.getTemplateUnitObjectsByType("ATTRIBUTE");
    },

    // Instance method: Is at least one element from each required attribute present?
    missingRequiredAttributes: function RD_missingRequiredAttributes() {
        var repo = this.app.getDWRepository(),
            that = this;

        // Collect all filter elements into a single array...
        var filterElements = this.getFilterObjects();

        // Sift the required attributes...
        var missingAttributes = $.grep(repo.requiredAttributes, function (reqAttr) {
            // Loop through each filter element...
            for (var i = 0, l = filterElements.length; i < l; i++) {
                var attr = repo.objectMap[filterElements[i].attrHID];

                // If this element matches the required attribute, omit the attribute...
                if (attr === reqAttr) {
                    return false;
                }
            }

            // No matching elements found; yield the attribute...
            return true;
        });

        return missingAttributes;
    },

    // Instance method: Filter the list of elements to only include ATTRIBUTES and those that are not subtotals...	
    filterElements: function RD_fiterElements(elemArray, chartControl) {
        var newElemArray = [];

        // Loop through the template units...
        for (var elemIndex = 0, i = 0, l = this.templateUnits.length; i < l; i++) {
            var tu = this.templateUnits[i],
                object = this.getObjectFromObjectMap(tu.hid);

            // Is this an attribute
            // TODO Fragile--can we get information on each TD which may include properties?
            if (object.type === "ATTRIBUTE" && elemArray[i] !== "Subtotal:" && elemArray[i] !== "") {
                var selectedForms = this.getSelectedForms(object, tu.selectedForms);

                // Loop through all of the forms...
                for (var j = 0, m = selectedForms.length; j < m; j++) {
                    // Get the jth form...
                    var form = selectedForms[j];
                    this.app.getDWRepository().checkLoadedForm(form);
                    var index = this.getColumnIndex(form.oid, chartControl);
                    // Add the element to the array...
                    newElemArray.push({
                        elemName: $.trim(elemArray[index]),
                        elemOID: form.oid + ":" + $.trim(elemArray[index]),
                        attrOID: object.oid
                    });

                    // Increment our element index...
                    elemIndex++;
                }
            }
            else {
                // Increment our element index...
                elemIndex++;
            }
        }

        return newElemArray;
    },

    getColumnIndex: function (oid, chartControl) {
        var cols = !chartControl ? this.resultDataModel.manipulatedData.colInfos : $.grep(this.resultDataModel.manipulatedData.colInfos, function (col) {
            return col.colType === "ATTRIBUTE";
        });
        for (var i = 0; i < cols.length; i++) {
            if (cols[i].oid === oid) {
                return i;
            }
        }
        return -1;
    },

    // Instance method: Set the totals either ON or OFF for this report definition...
    setTotals: function (totalsOn) {
        this.attr('totalsOn', totalsOn);
    },

    // Instance method: Indicate if this is an existing (saved) report 
    setSaved: function (saved) {
        this.attr('savedReport', saved);
    },

    // Instance method: Indicate whether we are allowed to save this report definition or not...
    canSave: function (save) {
        this.attr("canSave", save);
    },

    canView: function (canView) {
        this.attr("canView", canView);
    },

    // Instance method: Compute the selected forms (bitmask value) for the current object...
    computeSelectedForms: function RD_computeSelectedForms(object, formID) {
        // If this is something other than an ATTRIBUTE, get out now...
        if (object.type !== "ATTRIBUTE") {
            return 0;
        }

        // If the form ID is missing, use the default form ID...
        formID = formID || object.defaultFormId;

        // Loop through each form...
        for (var i = 0, l = object.forms.length; i < l; i++) {
            var form = object.forms[i];

            if (form.oid === formID) {
                return 1 << i;
            }
        }

        return 0;
    },

    // Get selected forms...
    getSelectedForms: function RD_getSelectedForms(attr, selectedForms) {
        // Loop through the attribute forms...
        var forms = [];
        for (var i = 0, l = (attr.forms || []).length; i < l; i++) {
            var form = attr.forms[i];

            if (selectedForms & (1 << i)) {
                forms.push(form);
            }
        }
        return forms;
    },

    // Instance method: Toggle the selected form
    toggleSelectedForm: function RD_toggleSelectedForm(htmlid, formOID) {
        var object = this.app.getDWRepository().objectMap[htmlid],
            tu = this.getTemplateUnit(htmlid);

        // Get out if we fail to find the object or template unit...
        if (!object || !tu) {
            return;
        }

        // Loop through each form...
        for (var i = 0, l = object.forms.length; i < l; i++) {
            var form = object.forms[i];

            // Is this the form that the user selected?
            if (form.oid === formOID) {
                var bitmask = 1 << i,
                    newVal;

                // Produce the new bitmask value...
                if (bitmask & tu.selectedForms) {
                    newVal = tu.selectedForms & ~bitmask;
                }
                else {
                    newVal = tu.selectedForms | bitmask;
                }

                // Set the new value on the selectedForms
                // It is up to the ViewController to consider whether a value of 0 (no forms selected) is acceptable or not...				
                tu.attr('selectedForms', newVal);

                return;
            }
        }
    },

    // Instance method: Whether the object is a form of the specified attribute...
    isFormOfAttribute: function RD_isFormOfAttribute(object, attr) {
        // Do we even have an object and an attribute?
        if (!object || !attr) {
            return undefined;
        }

        // Is this even an attribute form?
        if (object.type !== "ATTRIBUTE_FORM") {
            return false;
        }

        // Is this the same attribute?
        return object.attrHID === attr.hid;
    },
    
    // Instance method: Set the entire definition at once...
    setDefn: function RD_setDefn(report, eInfos) {
        // Process the input parameters...
        if (!report) {
            // alert("INTERNAL ERROR: Unable to render the report definition: null 'report'");
            Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.report_render.error.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.report_render.error.dialog_msg));
        }
        eInfos = eInfos || [];

        this.groupFilters = $.extend(true, {}, this.filterDims["GroupedFilter"]);

        // Ask the report definition to drop its current definition...
        this.clear();

        // Get the parts of the report definition object...
        var htmlId, object,
            totalsOn = report.totals,
            tuList = report.template.split("|"),
            sortList = report.sort.split("|"),
            fuSet = (report.filter) ? report.filter.split("|") : [];

        // Ask the DW Repository to add any new elements...
        this.app.getDWRepository().addElements(eInfos);

        // Loop through the filter units...
        for (var i = 0, l = fuSet.length; i < l; i++) {
            object = this.app.getDWRepository().getObjectByOID(fuSet[i], true);
            this.selectObject(object.hid);
        }

        // Loop through the template units (which are attribute FORMS and metrics)...
        var templateUnits = [];
        for (i = 0, l = tuList.length; i < l; i++) {
            // Get the object...
            object = this.app.getDWRepository().getObjectByOID(tuList[i]);

            var sortSpec = sortList[i],
                sortPos = parseInt(sortSpec, 10),
                sortOrder = sortSpec.substr(sortSpec.length - 1, 1);

            // Create a new template unit info object...
            var tuInfo = {
                operation: object.operation,
                oid: object.oid,
                sortPos: sortPos,
                type: object.type,
                formula: object.formula,
                sortOrder: sortOrder,
                selectedForms: 0
            };

            // What type of object is this?
            if (object.type === "ATTRIBUTE_FORM") {
                var attr = this.app.getDWRepository().objectMap[object.attrHID],
                    nextobj;
                tuInfo.hid = attr.hid;
                tuInfo.name = attr.name;
                tuInfo.selectedForms = this.computeSelectedForms(attr, object.oid);
                tuInfo.forms = attr.forms;
                tuInfo.type = attr.type;

                // Look for all forms from the same attribute...
                while (((i + 1) < l) && this.isFormOfAttribute(nextobj = this.app.getDWRepository().getObjectByOID(tuList[i + 1]), attr)) {
                    // Perform a bitwise OR of selected forms...
                    tuInfo.selectedForms = tuInfo.selectedForms | this.computeSelectedForms(attr, nextobj.oid);

                    // Increment our counter...
                    i++;
                }

                // Add the template unit to our collection...
                templateUnits.push(tuInfo);
            }
            else if (object.type === "METRIC") {
                tuInfo.aggType = object.aggType;
                tuInfo.dataType = object.dataType;
                tuInfo.subtype = object.subtype;
                tuInfo.name = object.name;
                tuInfo.originalName = object.originalName;
                tuInfo.originalHid = object.originalHid;
                tuInfo.filterOid = object.filterOid;
                tuInfo.elementHID = object.elementHID;
                tuInfo.segmentable = object.segmentable;
                tuInfo.hid = object.hid;

                templateUnits.push(tuInfo);

                if (object.formula && !object.id) {
                    this.derivedColumnMap[object.hid] = object;
                }
            }

        }

        // Loop through the real template units!
        for (i = 0, l = templateUnits.length; i < l; i++) {
            tuInfo = templateUnits[i];
            // Add the template unit...
            this.addTemplateUnit(tuInfo, i);
        }

        // Normalize the sort positions...
        this.normalizeSortPositions();

        // Set the totals...
        this.setTotals(totalsOn);

        this.isCleared = false;
    },

    // Instance Method: Produce a reasonable report name based on the report definition...
    computeReportName: function RD_computeReportName(charLimit) {
        var filterObjects = this.getFilterObjects(),
            metricElements = this.getMetricObjects(),
            attributeObjects = this.getAttributeObjects(),
            repo = this.app.getDWRepository(),
            reqdElemNames = [],
            elemNames = [],
            metricNameMap = {},
            metricNames = [],
            nameParts = [];

        // Loop through the attribute elements...
        for (var i = 0, l = filterObjects.length; i < l; i++) {
            var attr = repo.objectMap[filterObjects[i].attrHID],
                elemName = filterObjects[i].name;

            // Is this element name all numeric and the attribute is not a "year"?
            if (elemName.match(/^\d+$/) && !attr.name.match(/year/i)) {
                continue;
            }

            // Is this a required attribute?
            if (attr.required) {
                reqdElemNames.push(elemName);
            }
            else {
                elemNames.push(elemName);
            }
        }

        // The first part of the name is the list of required attributes...
        if (reqdElemNames.length) {
            nameParts.push(reqdElemNames.join(", "));
        }

        // Process each of the metric names...
        $.each(metricElements, function (index, me) {
            var metricName = me.name.replace(/\(.*$/, "").replace(/^\s+|\s+$/g, ""); /* Strip out characters that begin with left paren... */
            metricNameMap[metricName] = 1;
        });

        // Construct a metric names array from the map...
        metricNames = $.map(metricNameMap, function (value, key) {
            return key;
        });

        // If too many (> 2), use "Data"
        if (metricNames.length > 2) {
            nameParts.push("Data");
        }
        else if (metricNames.length > 0) {
            nameParts.push(metricNames.join(", "));
        }

        // If too many attributes (> 3), omit. Otherwise, use names...
        if (attributeObjects.length > 0 && attributeObjects.length <= 3) {
            nameParts.push("by");
            nameParts.push($.map(attributeObjects, function (ao, index) {
                return ao.name;
            }).join(", "));
        }

        // What is the report name so far?
        var fullName = nameParts.join(" ");

        // Do we have any more elements?
        if (elemNames.length > 0) {
            var filterPart = " for " + elemNames.join(", ");

            // Would the filter part fit into our limit?
            if (fullName.length + filterPart.length <= charLimit) {
                fullName = fullName + filterPart;
            }
        }

        // If concatenated name is too long (> 40 chars), use "New Report"
        if (fullName.length > 60) {
            fullName = "New Report";
        }

        return fullName;
    },
    /* Check whether report with same name exists.*/
    isReportExistsWithSameName: function (name) {
        if (!this.app.reportDefnInfoList || !this.app.reportDefnInfoList.savedReports) {
            return false;
        }
        var userInfo = this.app.retrieveUserInfo();

        var selecteditem = $.grep(this.app.reportDefnInfoList.savedReports, function (report) {
            return ($.trim(report.name) === $.trim(name) && report.createUserId * 1 === userInfo.userID * 1);

        });

        return selecteditem.length > 0;
    },

    getObjectFromObjectMap: function (htmlid) {
        var object = this.app.getDWRepository().objectMap[htmlid];
        //if not found in the DWRepository then check in the derived column map
        if (!object) {
            object = this.derivedColumnMap[htmlid];
        }

        return object;
    },

    addExpressionToReportDefinition: function (derivedColumnObject, position, sortPosition, sortOrder) {
        sortOrder = sortOrder || 'D';
        var tuInfo = this.getTuObject(derivedColumnObject, sortOrder, sortPosition);
        this.addTemplateUnit(tuInfo, position);
        this.derivedColumnMap[derivedColumnObject.hid] = derivedColumnObject;
    },

    updateExpressionOfReportDefinition: function (hid, derivedColumnObject, position, sortPosition, sortOrder) {
        this.deselectObject(hid, "update");
        this.addExpressionToReportDefinition(derivedColumnObject, position, sortPosition, sortOrder);
    },

    removeExpressionFromReportDefinition: function (hid) {
        this.deselectObject(hid);
    },

    addFormulaToReportDefinition: function (derivedColumnObject, position, sortPosition) {
        var tuInfo = this.getTuObject(derivedColumnObject, 'D', sortPosition);
        this.addTemplateUnit(tuInfo, position);
    },

    addConditionalMetricToReportDefinition: function (derivedColumnObject, position, sortPosition, sortOrder) {
        var tuInfo = this.getTuObject(derivedColumnObject, sortOrder, sortPosition);
        this.addTemplateUnit(tuInfo, position);
    },

    updateFormulaOfReportDefinition: function (hid, derivedColumnObject, position, sortPosition) {
        this.deselectObject(hid, "update");
        this.addFormulaToReportDefinition(derivedColumnObject, position, sortPosition);
    },

    removeFormulaFromReportDefinition: function (hid) {
        this.deselectObject(hid);
    },

    getTuObject: function (derivedColumnObject, sortOrder, sortPosition) {
        return {
            oid: derivedColumnObject.oid,
            type: derivedColumnObject.type,
            name: derivedColumnObject.name,
            formula: derivedColumnObject.formula,
            forms: derivedColumnObject.forms,
            selectedForms: this.computeSelectedForms({}),
            aggType: derivedColumnObject.aggType,
            dataType: derivedColumnObject.dataType,
            subtype: derivedColumnObject.subtype,
            originalName: derivedColumnObject.originalName,
            originalHid: derivedColumnObject.originalHid,
            filterOid: derivedColumnObject.filterOid,
            elementHID: derivedColumnObject.elementHID,
            segmentable: derivedColumnObject.segmentable,
            hid: derivedColumnObject.hid,
            sortPos: sortPosition,
            sortOrder: sortOrder
        };
    }
});
