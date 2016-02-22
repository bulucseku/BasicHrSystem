/* Controller for form data */
can.Control.extend("Sentrana.Controllers.FormMappingUI", {

    pluginName: 'sentrana_form_mapping_ui',
    defaults: {
        model: null,
        testing: null
    }
}, {
    update: function () {
        this.element.append(can.view('templates/pg-repoman-form-mapping.ejs', this.parseModel()));

        $('.button-submit-name', this.element).button();
        $('.button-select-data', this.element).button();

        this.setTableNames();
    },

    init: function () {
        this.model = this.options.model;
        this.testing = this.options.testing;
    },

    parseModel: function () {
        var result = [];
        for (var formID in this.model.forms) {
            var form = this.model.forms[formID];
            if (!form.isLocal) {
                continue;
            }
            result.push(form);
        }
        return {
            colInfos: result
        };
    },

    getFormIDFromElement: function (el) {
        return el.parent().parent().attr('class');
    },

    getFormID: function (title) {
        return "_" + title.replace(/\s/g, "").replace(/\(/g, "").replace(/\)/g, "");
    },

    getColInfo: function (colID) {
        for (var i = 0, l = this.data.colInfos.length; i < l; i++) {
            if (this.data.colInfos[i].title == colID) {
                return this.data.colInfos[i];
            }
        }
        return null;
    },

    updateAllDataTypes: function () {
        for (var formID in this.model.forms) {
            var form = this.model.forms[formID];
            if (!form.isLocal) {
                continue;
            }

            $('.select-data-type', $('.' + formID)).val(form.dataType);
        }
    },

    updateRowTypes: function () {
        for (var formID in this.model.forms) {
            var form = this.model.forms[formID];
            if (!form.isLocal) {
                continue;
            }

            $('.select-row-type', $('.' + formID)).val(form.formType);
            if (form.formType === 0 || form.formType === "0") {
                $('.select-default', $('.' + formID)).show();
            }
            else {
                $('.select-default', $('.' + formID)).hide();
            }
        }
    },

    updateAllNames: function () {
        for (var formID in this.model.forms) {
            var form = this.model.forms[formID];
            if (!form.isLocal) {
                continue;
            }

            $('.input-name', $('.' + formID)).val(form.name);
            $('.input-column-name', $('.' + formID)).val(form.columnName);
        }
    },

    setTableNames: function () {
        for (var formID in this.model.forms) {
            var form = this.model.forms[formID];
            if (!form.isLocal) {
                continue;
            }

            $('.table-name', $('.' + formID)).html("<strong>" + form.tableName + "</strong>");
        }
    },

    "{model} change": function (table, ev, attr, how, newVal, oldVal) {
        var that = this;

        switch (attr) {
        case "updatedFormSelection":
            /*
                if (this.model.forms[newVal.formID].formType === 0 || this.model.forms[newVal.formID].formType === "0") {
                this.model.updateAttrFormSelections();
                } else {
                this.model.updateMetricFormSelections();
                }
                break; */
        default:
            break;
        }
    },

    ".input-name change": function (el, ev) {
        var formID = this.getFormIDFromElement(el);
        this.model.forms[formID].name = $(el).val();
    },

    ".input-column-name change": function (el, ev) {
        var formID = this.getFormIDFromElement(el);
        this.model.forms[formID].columnName = $(el).val();
    },

    ".select-data-type change": function (el, ev) {
        var formID = this.getFormIDFromElement(el);
        var dataType = $(el).val();
        this.model.propagateDataTypeChange(formID, dataType);

        // inform the column controller
        this.model.attr("updatedDataTypes", (this.model.updatedDataTypes + 1) % 2);
        this.updateAllDataTypes();
    },

    ".select-row-type change": function (el, ev) {
        var formID = this.getFormIDFromElement(el);
        var formType = $(el).val();
        this.model.propagateFormTypeChange(formID, formType);
        // Notify the other controller
        this.model.attr("updatedColTypes", (this.model.updatedColTypes + 1) % 2);
        this.model.attr("addDeleteMetric", (this.model.addDeleteMetric + 1) % 2);
        this.updateRowTypes();
        this.updateAllNames();
    }
});
