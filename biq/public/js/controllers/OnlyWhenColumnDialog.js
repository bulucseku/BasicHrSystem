steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.OnlyWhen", {
        pluginName: 'sentrana_dialogs_only_when',
        defaults: {
            title: "Conditional Metric Editor",
            autoOpen: false,
            buttons: [{
                label: "CANCEL",
                className: "btn-cancel btn-default"
            }, {
                label: "OK",
                className: "btn-ok btn-primary"
            }]
        }
    }, {
        init: function (el, options) {
            this.INVALID_CHARS = [',', '@'];
            this.tu = this.options.tu;
            this.reportDefnModel = this.options.reportDefnModel;
            this.loadForm();
            this.buildElementsUI();
            this._super(el, options);
            this.setColumnName();
            this.updateFilterWindow();
            this.enableDissableOKButton();
        },

        getFormula: function (object) {
            var RE_CONDITIONAL_METRIC_OID = /if\((.*?[^,]+)\,(.*?.+)\)/;
            var match = RE_CONDITIONAL_METRIC_OID.exec(object.oid);

            return match[0];
        },

        addToRepotDefinition: function (newColumn, isReusable) {

            var newTU = newColumn;

            if (this.options.addToreport) {
                var metricPosition = this.reportDefnModel.getTemplateUnitIndex(this.tu.hid);
                var sortPos = this.tu.sortPos !== undefined ? this.tu.sortPos : metricPosition;
                this.reportDefnModel.deselectObject(this.tu.hid, "update");
                if (isReusable) {
                    newTU = this.options.app.dwRepository.formateReusableColumn(newColumn);
                    this.reportDefnModel.addConditionalMetricToReportDefinition(newTU, metricPosition, sortPos, this.tu.sortOrder || "D");
                }
                else {
                    this.reportDefnModel.selectObject(newTU.hid, metricPosition, this.tu.sortPos);
                }
            }

            this.closeDialog();
        },

        isValidName: function () {
            var $name = this.element.find('.onlywhen-column-name');
            if ($.trim($name.val()).length === 0) {
                this.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.derived_column.validation.empty_column_name_msg), 'fail');
                return false;
            }

            if (this.isInvalidCharacterExistsInColumnName($name.val())) {
                this.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.derived_column.validation.column_cannot_contain_invalid_char,
                    this.getInvalidCharactersForColumnName()), 'fail');
                return false;
            }

            if (this.sameNameExists($.trim($name.val()))) {

                this.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.derived_column.validation.duplicate_column_name), 'fail');

                return false;
            }

            return true;
        },

        getInvalidCharactersForColumnName: function () {
            return this.INVALID_CHARS.join(' ');
        },

        isInvalidCharacterExistsInColumnName: function (columnName) {
            var invalidChars = this.INVALID_CHARS.join('\\');
            var pattern = new RegExp("[\\" + invalidChars + "]");
            return pattern.test(columnName);
        },

        sameNameExists: function (name) {

            if (this.sameColumnNameExists(name)) {
                return true;
            }

            if (this.sameMetricNameExists(name)) {
                return true;
            }

            if (this.sameReusableColumnNameExists(name)) {
                return true;
            }

            return false;
        },

        sameColumnNameExists: function (name) {
            var that = this;
            var cols = $.grep(this.options.builderController.reportDefnModel.templateUnits, function (col) {
                return col.name === name && col.oid !== that.tu.oid;
            });

            return cols.length > 0;
        },

        sameReusableColumnNameExists: function (name) {
            var that = this,
                reusableColumns = this.options.app.dwRepository.reusableColumns;

            var cols = $.grep(reusableColumns, function (col) {
                return col.name === name && col.oid !== that.tu.oid;
            });

            return cols.length > 0;
        },

        sameMetricNameExists: function (name) {
            var that = this,
                metrics = this.options.app.dwRepository.getAllMetrics();

            var cols = $.grep(metrics, function (col) {
                if (that.tu.formula) {
                    return col.name === name && col.oid !== that.tu.oid;
                }
                return col.name === name;
            });

            return cols.length > 0;
        },

        open: function () {
            if (this.tu.name !== this.options.conditionalMetric.name) {
                this.nameUpdatedManualy = true;
                this.element.find('.onlywhen-column-name').val(this.tu.name);
                this.element.find('.onlywhen-column-name').attr('title', this.tu.name);
            }
            this.openDialog();

        },

        enableDissableOKButton: function () {
            if (this.options.conditionalMetric.filters.length > 0) {
                this.enableButton("OK");
            }
            else {
                this.disableButton("OK");
            }
        },

        loadForm: function () {
            this.element.html("");
            this.element.append(can.view('templates/onlywhen-column-dialog.ejs', {}));
            this.element.find(".restore-default-name").button();
            this.$attributeElements = this.element.find(".onlywhen-column-filter");

            if (this.tu.id) {
                this.element.find('.chk-reusable-onlywhen-item').prop('checked', true);
                if (!this.options.addToreport) {
                    this.element.find('.chk-reusable-onlywhen-item').prop('disabled', true);
                }
            }
        },

        selectFilterElements: function () {
            var filterElements = this.options.conditionalMetric.filters;
            for (var i = 0; i < filterElements.length; i++) {
                this.selectFilterElement(filterElements[i].hid);
            }
        },

        removeSelectionfromControls: function () {
            var filterElements = this.options.conditionalMetric.filters;
            for (var i = 0; i < filterElements.length; i++) {
                this.removeSelectionfromControl(filterElements[i].hid);
            }
        },

        removeSelectionfromControl: function (htmlID) {

            var $div = $.merge($('.object-selector[hid="' + htmlID + '"]', ".onlywhen-column-filter"),
                $('.tree-node-selector[hid="' + htmlID + '"]', ".onlywhen-column-filter"));
            $div = $.merge($div, $('.element-filter-listbox-onlywhen option[hid="' + htmlID + '"]', ".onlywhen-column-filter"));
            var $element, $sel;

            if ($($div).is('input[type="checkbox"]')) {
                $div.removeClass("object-selected");
                if ($($div).is(':checked')) {
                    $element = $('.object-selector[hid="' + htmlID + '"]', ".onlywhen-column-filter");
                    $($element).prop('checked', false);
                }
            }
            else if ($($div).is('option')) {
                $sel = $($div).parent('select');
                $.each($sel.find(":selected"), function (index, value) {
                    if ($(value).attr('hid') === htmlID) {
                        $(value).removeAttr("selected");
                        $(value).removeClass("object-selected");
                    }
                });
            }
            else if ($($div).is('a')) {
                $div.removeClass("object-selected");
                $div.removeClass("tree-node-selected");
            }
        },

        setColumnName: function () {
            if (!this.nameUpdatedManualy) {
                this.element.find('.onlywhen-column-name').val(this.options.conditionalMetric.name);
                this.element.find('.onlywhen-column-name').attr('title', this.options.conditionalMetric.name);
            }
        },

        ".onlywhen-column-name keyup": function () {
            this.nameUpdatedManualy = true;
        },

        selectFilterElement: function (htmlID) {
            var $div = $.merge($('.object-selector[hid="' + htmlID + '"]', ".onlywhen-column-filter"),
                $('.tree-node-selector[hid="' + htmlID + '"]', ".onlywhen-column-filter"));
            $div = $.merge($div, $('.element-filter-listbox-onlywhen option[hid="' + htmlID + '"]', ".onlywhen-column-filter"));
            var $element, $sel;

            $div.addClass("object-selected");
            $element = $('.object-selector[hid="' + htmlID + '"]', ".onlywhen-column-filter");

            $($element).prop('checked', true);

            if ($div.is('option')) {
                $div.attr("selected", "selected");
            }
            if ($($div).is('a')) {
                $div.addClass("tree-node-selected");
            }
        },

        buildElementsUI: function DWAB_buildElementsUI() {
            var that = this;
            var firstFilter = true;
            // Clear the current contents...
            this.$attributeElements.html("");

            // Loop through each dimension...
            for (var i = 0, l = this.options.app.dwRepository.dimensionNames.length; i < l; i++) {
                // Get the ith dimension...
                var dimName = this.options.app.dwRepository.dimensionNames[i],
                    dim = this.options.app.dwRepository.dimensions[dimName];
                if (dim) {

                    // Loop through each attribute...
                    for (var j = 0, m = (dim.attributes || []).length; j < m; j++) {
                        var attr = dim.attributes[j];

                        // Do we have any elements?
                        // Some of the filters may not have elements pre-populated. 
                        // The filter element will be the user input by using certain kind of control such as Calendar.
                        // In this case, we don't need the attribute elements to populate the filter control.
                        if (attr.formMap[attr.defaultFormId].elements || attr.filterControl === 'Calendar') {
                            var nameWithOutSpecialChar = attr.name.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
                            var dimNameWithOutSpecialChar = dimName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');

                            var filterClass = "filter-" + dimNameWithOutSpecialChar + nameWithOutSpecialChar;
                            this.$attributeElements.append('<div class="' + filterClass + '"></div>');
                            var $filterElement = this.element.find('.' + filterClass);
                            // First element not to collapse
                            var filter = $filterElement.sentrana_only_when_collapsible_container({
                                title: attr.name + ' (' + attr.dimName + ')',
                                showHeader: true,
                                showBorder: true,
                                allowCollapsible: true,
                                initialCollapsed: !firstFilter,
                                callBackFunctionOnExpand: function (attrCopy, $filterElementCopy) {
                                    // The outside function provide a copy of two variables from the for loop outside.
                                    return function () {
                                        that.options.app.handleUserInteraction();
                                        // This is a way to check whether we have already rendered the filter control.
                                        if (!$.trim($filterElementCopy.find(".onlywhen-element-filter").html()).length) {
                                            that.initFilterControl(attrCopy);
                                            that.selectFilterElements();
                                        }
                                    };
                                }(attr, $filterElement),
                                callBackFunctionOnCollapse: function () {
                                    that.options.app.handleUserInteraction();
                                }
                            }).control().getContainerPanel();
                            // Only to show all the elements in the first filter control.
                            $(filter).append(can.view('templates/elementHeaderOnlyWhen.ejs', {
                                attr: attr,
                                group: dimNameWithOutSpecialChar + nameWithOutSpecialChar + "-onlywhen",
                                tag: "onlywhen"
                            }));
                            if (firstFilter || attr.filterControl === 'Calendar') {
                                // For the first filter and Calendar control, there is no lazy loading for them.
                                this.initFilterControl(attr);
                                firstFilter = false;
                                setTimeout(function () {
                                    that.selectFiltersOfFirstBox();
                                }, 500);

                            }
                        }
                    }
                }
            }
        },

        selectFiltersOfFirstBox: function () {
            var filterElementHids = this.getFilterElementsId();
            for (var i = 0; i < filterElementHids.length; i++) {
                this.selectFilterElement(filterElementHids[i].hid);
            }
        },

        getFilterElementsId: function () {
            var filterElements = this.options.conditionalMetric.filters.attr(),
                filterElementHids = [];
            for (var i = 0; i < filterElements.length; i++) {
                filterElementHids.push(filterElements[i].hid);
            }

            return filterElements;
        },

        getFiltes: function () {
            return this.options.conditionalMetric.filters.attr();
        },

        initFilterControl: function (attr) {
            var that = this,
                filterElementHids = this.getFilterElementsId();

            var param = {
                dwRepository: that.options.app.dwRepository,
                dwSelection: [],
                attr: attr,
                form: null,
                filterentHids: filterElementHids,
                filters: this.getFiltes()
            };

            $.each(attr.forms, function (index, form) {

                if (form.dataFilterOperator) {
                    switch (form.dataFilterOperator.toUpperCase()) {
                    case "IN":
                        form.elements = $.grep(form.elements, function (obj) {
                            return obj.isFilteredByDataFilter === true;
                        });
                        break;
                    case "NOT IN":
                        form.elements = $.grep(form.elements, function (obj) {
                            return obj.isFilteredByDataFilter === false;
                        });
                        break;

                    default:
                        break;
                    }
                }

                param.form = form;
                param.tag = "onlywhen";

                if (attr.filterControl === 'Button' || !attr.filterControl) {
                    // Button is the default filter control
                    $(".onlywhen-elements-" + attr.oid + "-" + form.oid + "-onlywhen", this.element).sentrana_filter_control_checkbox_only_when(param);
                }
                if (attr.filterControl === 'Tree') {
                    $(".onlywhen-elements-" + attr.oid + "-" + form.oid + "-onlywhen", this.element).sentrana_filter_control_tree_only_when(param);
                }
                if (attr.filterControl === 'ListBox') {
                    $(".onlywhen-elements-" + attr.oid + "-" + form.oid + "-onlywhen", this.element).sentrana_filter_control_list_box_only_when(param);
                }
                //            if (attr.filterControl === 'Calendar') {
                //                $(".onlywhen-elements-" + attr.oid + "-" + form.oid, this.element).sentrana_filter_control_calendar_only_when(param);
                //            }
            });

            $('input[placeholder]').inputHints();

        },

        '.restore-default-name click': function (el, ev) {
            this.nameUpdatedManualy = false;
            this.setColumnName();
        },

        '.formsRadio input[type="radio"] click': function (el, ev) {
            var attrOid = el.attr("attrOID"),
            tag = el.attr("tag"),
            formOid = el.val();

            this.element.find(".onlywhen-formElements-" + attrOid).hide();
            this.element.find(".onlywhen-elements-" + attrOid + "-" + formOid + "-" + tag).show();
        },

        ".fu-close-container click": function (el, ev) {
            var hid = $(el).parent().parent().attr('hid'),
                filterElement = this.options.app.dwRepository.objectMap[hid];
            var index = this.options.conditionalMetric.getIndexOfFilter(filterElement);

            if (index >= -1) {
                this.options.conditionalMetric.filters.splice(index, 1);
                this.removeSelectionfromControl(hid);
            }

        },

        " onlywhen-filter-selected": function (el, ev, param) {

            if (param.isListbox) {
                can.Observe.startBatch();
                var filterElement = this.options.app.dwRepository.objectMap[$(param.options[0]).attr("hid")];
                this.removeOtherValueOfThisAttribute(filterElement.attrHID);
                this.removeSelectionfromControls();
                for (var i = 0; i < param.options.length; i++) {
                    filterElement = this.options.app.dwRepository.objectMap[$(param.options[i]).attr("hid")];
                    this.options.conditionalMetric.filters.push(filterElement);
                }
                can.Observe.stopBatch();
            }
            else {
                this.removeSelectionfromControls();
                this.addRemoveFilter(param);
            }
        },

        removeOtherValueOfThisAttribute: function (attrHid) {
            var filters = this.getFiltersByAttr(attrHid);
            for (var i = 0; i < filters.length; i++) {
                var index = this.options.conditionalMetric.getIndexOfFilter(filters[i]);
                if (index > -1) {
                    this.options.conditionalMetric.filters.splice(index, 1);
                }
            }
        },

        getFiltersByAttr: function (attrHid) {
            return $.grep(this.options.conditionalMetric.filters, function (filter) {
                return filter.attrHID === attrHid;
            });
        },

        addRemoveFilter: function (param) {
            var filterElement = this.options.app.dwRepository.objectMap[$(param).attr("hid")];
            var index = this.options.conditionalMetric.getIndexOfFilter(filterElement);

            if (index < 0) {
                this.options.conditionalMetric.filters.push(filterElement);
            }
            else {
                this.options.conditionalMetric.filters.splice(index, 1);
            }
        },

        updateSlectionAndName: function () {
            if (this.tu) {
                this.selectFilterElements();
                this.options.conditionalMetric.attr('name', this.options.conditionalMetric.getMetricNameWithAggType(this.tu));
                this.enableDissableOKButton();
                this.updateFilterWindow();
            }
        },

        updateFilterWindow: function () {
            var that = this;
            var $filtrContainer = this.element.find('.conditionalmetric-filter-container');
            $filtrContainer.html("");

            var filters = this.options.conditionalMetric.filters;

            $.each(this.options.conditionalMetric.getFiltersGroupBy(), function (index, val) {
                var attr = that.options.app.dwRepository.objectMap[index];
                $filtrContainer.append(can.view('templates/onlywhen-column-filters.ejs', {
                    attr: attr.name + " (" + attr.dimName + ")",
                    filters: val
                }));
            });
        },

        "{conditionalMetric} change": function (conditionalMetric, ev, attr, how, newVal, oldVal) {

            switch (attr) {
            case "isReusable":

                break;
            case "name":
                this.setColumnName();
                break;
            default:
                this.updateSlectionAndName();
                break;
            }
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            if (this.options.conditionalMetric.filters.length <= 0) {
                return;
            }

            var colName = this.element.find('.onlywhen-column-name').val();
            if (!this.isValidName()) {
                return;
            }

            var isReusableChecked = this.element.find('.chk-reusable-onlywhen-item').is(":checked");

            var newTU = this.options.app.dwRepository.createFilteredMetric(this.tu, this.options.conditionalMetric.filters, colName);
            newTU.nameUpdatedManualy = this.nameUpdatedManualy;
            newTU.formula = newTU.oid;
            if (this.tu.id && !isReusableChecked) {
                newTU.hid = this.options.app.dwRepository.getHID(newTU);
            }
            this.options.app.dwRepository.objectMap[newTU.hid] = newTU;

            var derivedColumn = {
                "name": colName,
                "dataSource": this.options.app.dwRepository.id,
                "formula": this.getFormula(newTU),
                "outputType": newTU.dataType,
                "precision": 2,
                "id": this.tu.id
            };

            //if checkbox is check then save to database
            if (isReusableChecked) {

                this.updateStatus(true, "Saving conditional metrics...");

                var reusableColumn = new Sentrana.Models.ReusableColumnInfo({
                    "id": derivedColumn.id,
                    "name": derivedColumn.name,
                    "dataSource": derivedColumn.dataSource,
                    "formula": derivedColumn.formula,
                    "outputType": derivedColumn.outputType,
                    "precision": derivedColumn.precision,
                    "formulaType": "CM"
                });

                var that = this;

                reusableColumn.save().done(function (data) {
                    derivedColumn = data;
                    that.addToRepotDefinition(derivedColumn, true);
                }).fail(function (err) {
                    var errorCode = err.getResponseHeader("ErrorCode");
                    var errorMsg = err.getResponseHeader("ErrorMsg");

                    if (errorCode === Sentrana.Enums.ErrorCode.DERIVED_COLUMN_NAME_IN_USE) {
                        that.updateStatus(false, errorMsg, 'fail');
                    }
                    else {
                        that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.save_operation.failed), 'fail');
                    }
                });
            }
            else {
                this.addToRepotDefinition(newTU);
            }
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
