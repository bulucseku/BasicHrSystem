can.Control.extend("Sentrana.Controllers.ColumnMappingUI", {
    pluginName: 'sentrana_column_mapping_ui',
    defaults: {
        model: null,
        testing: null
    }
}, {
    init: function () {
        this.model = this.options.model;
        this.testing = this.options.testing;
    },

    parseModel: function () {
        var result = [];
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (attribute.isLocal) {
                result.push(attribute);
            }
        }
        for (var metrID in this.model.metrics) {
            var metric = this.model.metrics[metrID];
            if (metric.isLocal) {
                result.push(metric);
            }
        }
        return {
            colInfos: result
        };
    },

    update: function () {
        // Detach serves to distinguish between user initiated UI changes, and changes made by javascript
        this.detach = true;
        this.element.append(can.view('templates/pg-repoman-column-mapping.ejs', this.parseModel()));

        this.newDimensionDlg = $(".dialog-new-dimension", this.element).sentrana_dialogs_new_dimension({}).control();
        this.editMetricDlg = $(".dialog-edit-metric", this.element).sentrana_dialogs_edit_metric({
            model: this.model
        }).control();
        this.editAttributeDlg = $(".dialog-edit-attribute", this.element).sentrana_dialogs_edit_attribute({
            model: this.model
        }).control();
        this.newMetricGroupDlg = $(".dialog-new-metric-group", this.element).sentrana_dialogs_new_metric_group({}).control();
        this.element.append(can.view('templates/pg-repoman-dynamic-elements-dialog.ejs', this.model));
        this.dynamicElementsDlg = $(".dialog-dynamic-elements", this.element).sentrana_dialogs_dynamic_elements({}).control();
        this.selectDataDlg = $('.dialog-selected-data', this.element).sentrana_dialogs_select_data({
            model: this.model
        }).control();

        $('.button-submit-name', this.element).button();
        $('.button-dynamic-elements', this.element).button();
        $('.button-attach-form-fact', this.element).button();
        $('.button-delete', this.element).button();

        this.updateAllColumns();
        this.populateDimensions();
    },

    validSelection: function (element) {
        return ('rgb(255, 0, 0)' != element.css('color'));
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

    changeElementClass: function (el, oldID, newID) {
        el.parent().parent().removeClass(oldID);
        el.parent().parent().addClass(newID);
    },

    changeColumnClass: function (colID, newID) {
        var $el = $('.' + colID);
        $el.removeClass(colID);
        $el.addClass(newID);
    },

    dataTypeToInt: function (dataType) {
        switch (dataType) {
        case "Datetime":
            return 0;
        case "String":
            return 1;
        case "Currency":
            return 2;
        case "Number":
            return 3;
        case "Percentage":
            return 4;
        case "Boolean":
            return 5;
        default:
            return "";
        }
    },

    updateAllColumns: function () {
        this.updateAllNames();
        this.updateAllParentAttributes();
        this.updateAllDimensions();
        this.updateDeleteButtons();
    },

    updateAllNames: function () {
        var $inputName = null;
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }
            $inputName = $('.input-name', $('.' + attrID));
            $inputName.val(attribute.name);
        }
        for (var metrID in this.model.metrics) {
            var metric = this.model.metrics[metrID];
            if (!metric.isLocal) {
                continue;
            }
            $inputName = $('.input-name', $('.' + metrID));
            $inputName.val(metric.name);
        }
    },

    updateAllDimensions: function () {
        if (!this.model.dimensionUpdated()) {
            return;
        }
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }

            this.addNewDimension(attrID);
        }

        // We also update these in case the user switches between metric and attribute
        for (var metrID in this.model.metrics) {
            var metric = this.model.metrics[metrID];
            if (!metric.isLocal) {
                continue;
            }

            this.addNewDimension(metrID);
        }
    },

    // Push all dimensions into every column 
    populateDimensions: function () {
        if (this.model.dimensions.allDimensions.length > 1) {
            for (var attrID in this.model.attributes) {
                var attribute = this.model.attributes[attrID];
                if (!attribute.isLocal) {
                    continue;
                }
                for (var i = 0; i < this.model.dimensions.allDimensions.length; i++) {
                    this.addNewDimension(attrID, this.model.dimensions.allDimensions[i]);
                }
                $('.select-dimension', $('.' + attrID)).val(attribute.dimension);

            }
            for (var metrID in this.model.metrics) {
                var metric = this.model.metrics[metrID];
                if (!metric.isLocal) {
                    continue;
                }
                for (var j = 0; j < this.model.dimensions.allDimensions.length; j++) {
                    this.addNewDimension(metrID, this.model.dimensions.allDimensions[j]);
                }
            }
        }
    },

    addNewDimension: function (colID, nDimension) {
        if (!nDimension) {
            nDimension = this.model.newDimension;
        }
        var $newSelect = $('.select-dimension [value=New]', $('.' + colID));
        var $newDimensionElement = $('<option></option>').val(nDimension).html(nDimension);

        $newSelect.before($newDimensionElement);
    },

    updateAllParentAttributes: function () {
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }

            var dimension = attribute.dimension;
            var $parentAttributeSelect = $('.select-parent-attribute', $('.' + attrID));
            var newParentAttributes = this.model.dimensions.dimensionChildren[dimension];
            if (!(newParentAttributes instanceof Array)) {
                newParentAttributes = [];
            }

            // Try to select the previous choice
            if (this.replaceParentAttributes(attrID, newParentAttributes)) {
                $parentAttributeSelect.val(this.model.attributes[attrID].parent);
            }
            else {
                $parentAttributeSelect.val("Self");
            }

            // Update the model with the choice
            this.model.attributes[attrID].parent = $parentAttributeSelect.val();
        }
    },

    /* replace the parent attributes for selected colID */
    replaceParentAttributes: function (attrID, newParentAttributes) {
        var $parentAttrSelect = $('.select-parent-attribute', $('.' + attrID)).empty();

        var oldSelection = false;
        for (var j = 0, pl = newParentAttributes.length; j < pl; j++) {
            var parentAttr = this.model.attributes[newParentAttributes[j]];
            if (!parentAttr || attrID == parentAttr.id) {
                continue;
            }
            var $newParentAttr = $($('<option></option>').val(parentAttr.id).html(parentAttr.name));
            if (this.model.detectParentCycle(attrID, parentAttr)) {
                $newParentAttr.css('color', 'red');
            }
            else if (parentAttr.id == this.model.attributes[attrID].parent) {
                oldSelection = true;
            }
            $parentAttrSelect.append($newParentAttr);
        }
        $parentAttrSelect.append($('<option></option>').val("Self").html("Self"));
        return oldSelection;
    },

    updateMetricGroups: function () {
        // We update attributes as well, so they have the full list of metric groups if they get 
        // changed to a metric by the user
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }

            this.addMetricGroup(attrID, this.model.newMetricGroup);
        }

        for (var metrID in this.model.metrics) {
            var metric = this.model.metrics[metrID];
            if (!metric.isLocal) {
                continue;
            }

            this.addMetricGroup(metrID, this.model.newMetricGroup);
        }
    },

    addMetricGroup: function (colID, nMetricGroup) {
        var $newSelect = $('.select-metric-group [value=New]', $('.' + colID));
        var $newMetricGroup = $('<option></option>').val(nMetricGroup).html(nMetricGroup);

        $newSelect.before($newMetricGroup);
    },

    updateAllDataTypes: function () {
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }

            $('.select-data-type', $('.' + attrID)).val("" + attribute.dataType);
        }
        for (var metrID in this.model.metrics) {
            var metric = this.model.metrics[metrID];
            if (!metric.isLocal) {
                continue;
            }

            $('.select-data-type', $('.' + metrID)).val("" + metric.dataType);
        }
    },

    setColumnDisplay: function (colID, newColType) {
        var $tableRow = $('.' + colID);
        $(".select-column-type", $tableRow).val(newColType);

        if (newColType == 1) {
            $(".select-parent-attribute", $tableRow).hide();
            $(".select-dimension", $tableRow).hide();
            $(".select-attr-value-type", $tableRow).hide();
            $(".select-metric-group", $tableRow).show();
            $(".select-filter-control", $tableRow).hide();
            $(".button-delete", $tableRow).show();
            $(".button-dynamic-elements", $tableRow).hide();
        }
        else {
            $(".select-parent-attribute", $tableRow).show();
            $(".select-dimension", $tableRow).show();
            $(".select-attr-value-type", $tableRow).show();
            $(".select-metric-group", $tableRow).hide();
            $(".select-filter-control", $tableRow).show();
            $(".button-dynamic-elements", $tableRow).hide();
        }
    },

    // Flips between metric and attribute
    flipColumnType: function (colID) {
        var $tableRow = $('.' + colID);
        var newID;
        this.setColumnDisplay(colID, (this.model.getAttrOrMetr(colID).colType + 1) % 2);
        if (this.model.getAttrOrMetr(colID).colType === 0 || this.model.getAttrOrMetr(colID).colType === "0") {
            newID = this.model.attrToMetric(this.model.attributes[colID]).id;
            this.model.deleteDimensionChild(colID);
            this.model.metrics[newID].metricGroup = $('select-metric-group', $tableRow).val();
        }
        else {
            newID = this.model.metricToAttr(this.model.metrics[colID]).id;
            this.model.updateDimensionChildren(newID, "");
        }

        this.changeColumnClass(colID, newID);
        this.updateAllColumns();
    },

    updateIDs: function () {
        for (var i = 0, l = this.model.idUpdates.length; i < l; i++) {
            var updatePair = this.model.idUpdates[i];
            this.changeColumnClass(updatePair.oldID, updatePair.newID);
            var newElem = this.model.getAttrOrMetr(updatePair.newID);

            this.setColumnDisplay(newElem.id, newElem.colType);
        }
        this.model.idUpdates = [];
    },

    updateDeleteButtons: function () {
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }

            var $deleteButton = $('.button-delete', $('.' + attrID));

            if (attribute.attributeForms.length > 0) {
                $deleteButton.hide();
            }
            else {
                $deleteButton.show();
            }
        }
    },

    /* Handle updates to the set of dimensions */
    "{model} change": function (table, ev, attr, how, newVal, oldVal) {
        var that = this;
        this.testing.runAllTests(attr + " changed from " + oldVal + "->" + newVal);
        switch (attr) {
        case "newDimension":
            if (!newVal) {
                return;
            }
            that.model.updateDimensionChildren(that.model.lastChangedID, newVal);
            that.model.attributes[that.model.lastChangedID].dimension = newVal;

            that.updateAllColumns();
            that.model.addDimension();
            that.model.dimensionUpdated();

            $('.select-dimension', $('.' + that.model.lastChangedID)).val(newVal);
            break;
        case "newMetricGroup":
            if (!newVal) {
                return;
            }
            that.model.updateMetricGroupChildren(that.model.lastChangedID, newVal);
            that.model.metrics[that.model.lastChangedID].metricGroup = newVal;
            that.updateMetricGroups();
            $('.select-metric-group', $('.' + that.model.lastChangedID)).val(newVal);
            break;
        case "updatedDataTypes":
            // Detach serves to distinguish between user initiated UI changes, and changes made by javascript
            this.detach = false;
            this.updateAllDataTypes();
            this.detach = true;
            break;
        case "updatedColTypes":
            this.detach = false;
            this.updateIDs();
            this.updateAllColumns();
            this.detach = true;
            break;
        case "updatedMetric":
            this.updateAllColumns();
            break;
        case "updatedAttribute":
            this.updateAllColumns();
            break;
        case "updatedFormSelection":
            this.updateDeleteButtons();
            break;
        default:
            break;
        }
    },

    ".select-attr-value-type change": function (el, ev) {
        var attrID = this.getColumnIDFromElement(el);
        var attribute = this.model.attributes[attrID];

        attribute.attrValueType = $(el).val();
    },

    ".select-filter-control change": function (el, ev) {
        var attrID = this.getColumnIDFromElement(el);
        var attribute = this.model.attributes[attrID];

        attribute.filterControl = $(el).val();
    },

    ".select-column-type change": function (el, ev) {
        // Detach serves to distinguish between user initiated UI changes, and changes made by javascript
        if (this.detach) {
            var colID = this.getColumnIDFromElement(el);
            this.flipColumnType(colID);
            this.model.attr("addDeleteMetric", (this.model.addDeleteMetric + 1) % 2);
        }
    },

    ".select-parent-attribute change": function (el, ev) {
        var attrID = this.getColumnIDFromElement(el);
        var attribute = this.model.attributes[attrID];
        var $selection = $('.select-parent-attribute [value=' + $(el).val() + ']', $('.' + attrID));
        if (!this.validSelection($selection)) {
            $(el).val(this.model.attributes[attrID].parent);
        }
        else {
            if ($(el).val() == "Self") {
                this.model.dimensions.dimensionParents[attribute.dimension] = attrID;
            }
            this.model.attributes[attrID].parent = $(el).val();
            this.updateAllColumns();
        }
    },

    ".select-dimension change": function (el, ev) {
        var attrID = this.getColumnIDFromElement(el);
        var newDimension = $(el).val();
        if (newDimension == "New") {
            this.model.lastChangedID = attrID;
            this.newDimensionDlg.open(this.model, attrID);
            $(el).val(this.model.attributes[attrID].dimension);
        }
        else {
            this.model.updateDimensionChildren(attrID, newDimension);
            this.model.attributes[attrID].dimension = $(el).val();
            this.updateAllColumns();
            $('.select-parent-attribute', $("." + attrID)).val(this.model.dimensions.dimensionParents[$(el).val()]);
            this.model.attributes[attrID].parent = $('.select-parent-attribute', $("." + attrID)).val();
        }
    },

    ".select-metric-group change": function (el, ev) {
        var metrID = this.getColumnIDFromElement(el);
        var newMetricGroup = $(el).val();
        if (newMetricGroup == "New") {
            this.model.lastChangedID = metrID;
            this.newMetricGroupDlg.open(this.model);
            $(el).val(this.model.metrics[metrID].metricGroup);
        }
        else {
            this.model.updateMetricGroupChildren(metrID, newMetricGroup);
            this.model.metrics[metrID].metricGroup = $(el).val();
        }
    },

    ".select-data-type change": function (el, ev) {
        var colID = this.getColumnIDFromElement(el);
        // Detach serves to distinguish between user initiated UI changes, and changes made by javascript
        if (this.detach) {
            this.model.detachFromForms(colID);
        }
        this.model.getAttrOrMetr(colID).dataType = $(el).val();
    },

    ".input-name change": function (el, ev) {
        var colID = this.getColumnIDFromElement(el);
        var obj = this.model.getAttrOrMetr(colID);
        obj.name = $(el).val();
        this.updateAllColumns();
    },

    ".button-dynamic-elements click": function (el, ev) {
        var attrID = this.getColumnIDFromElement(el);
        var attribute = this.model.attributes[attrID];
        this.dynamicElementsDlg.open(this.model, attribute);
    },

    ".button-edit-description click": function (el, ev) {
        var colID = this.getColumnIDFromElement(el);
        var elem = this.model.getAttrOrMetr(colID);
        if (elem.colType === 0 || elem.colType === "0") {
            this.editAttributeDlg.open(elem);
        }
        else {
            this.editMetricDlg.open(elem);
        }
    },

    ".button-attach-form-fact click": function (el, ev) {
        var colID = this.getColumnIDFromElement(el);
        this.selectDataDlg.open(colID);
    },

    ".button-delete click": function (el, ev) {
        var colID = this.getColumnIDFromElement(el);
        var elem = this.model.getAttrOrMetr(colID);
        if (elem.colType == 1) {
            this.model.deleteMetric(elem);
        }
        else {
            this.model.deleteAttr(elem);
        }
        $('.' + colID).remove();
    }
});
