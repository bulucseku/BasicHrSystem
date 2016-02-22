steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.SavedFilters", {
        pluginName: 'sentrana_dialogs_saved_filters',
        defaults: {
            title: "Saved Filters",
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
        this.loadForm();
        this.buildElementsUI();
        this._super(el, options);
        this.setColumnName();
        this.updateFilterWindow();
        this.enableDissableOKButton();
    },

    handleCANCEL: function () {
        this.closeDialog();
    },

    handleOK: function () {
        if (this.options.savedFilter.filters.length <= 0) {
            this.updateStatus(false, "Please select at least one filter!", 'fail');
            return;
        }

        if (!this.isValidName()) {
            return;
        }
        var name = this.element.find('.saved-filter-editor-filter-name').val();

        if (this.isFilterExistsWithSameName(name)) {
            this.updateStatus(false, "Saved filter name already in use!", 'fail');
            return;
        }

        this.updateProperties(name);

        var isReusableChecked = this.$reusableCheckbox.is(":checked");

        if (isReusableChecked) {

            this.updateStatus(true, "Saving filter group...");
            var fgModel = new Sentrana.Models.SavedFilterGroupInfo({
                "id": this.options.savedFilter.id,
                "name": this.options.savedFilter.name,
                "dataSource": this.options.app.dwRepository.id,
                "filterIds": $.map(this.options.savedFilter.filters, function(filter) {
                    return filter.oid;
                })
            });

            var that = this;

            fgModel.save().done(function (data) {
                var savedFilter = that.options.app.dwRepository.getSavedFilterGroupModel(data);
                that.addToRepotDefinition(savedFilter);
            }).fail(function(err) {
                var errorCode = err.getResponseHeader("ErrorCode");
                var errorMsg = err.getResponseHeader("ErrorMsg");

                if (errorCode === Sentrana.Enums.ErrorCode.SAVED_FILTER_GROUP_NAME_IN_USE) {
                    that.updateStatus(false, errorMsg, 'fail');
                } else {
                    that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.save_operation.failed), 'fail');
                }
            });
        } else {
            this.options.app.dwRepository.objectMap[this.options.savedFilter.hid] = this.options.savedFilter;
            this.addToRepotDefinition(this.options.savedFilter);
        }
    },

    addToRepotDefinition: function (filterGroup) {
        this.options.reportDefnModel.deselectObject(this.oldHid);
        this.options.reportDefnModel.deselectObject(filterGroup.hid, "update");
        this.options.reportDefnModel.selectObject(filterGroup.hid);
        this.closeDialog();
    },

    isFilterExistsWithSameName: function (name) {
        var isReusableChecked = this.$reusableCheckbox.is(":checked");
        if (isReusableChecked && this.isFilterExistsInRepository(name)) {
            return true;
        }

        if (this.options.mode === "create" && this.isFilterExistsInReportDefinition(name)) {
            return true;
        }

        return false;
    },

    isFilterExistsInRepository: function (name) {
        var savedFilters = this.options.app.dwRepository.savedFilters;
        var selecteditem = $.grep(savedFilters, function (filter) {
            return ($.trim(filter.name.toUpperCase()) === $.trim(name.toUpperCase()));
        });

        if (!this.options.savedFilter.attr('id')) {
            return selecteditem.length > 0;
        }

        if (selecteditem.length === 1) {
            return selecteditem[0].id !== this.options.savedFilter.attr('id');
        }

        return selecteditem.length > 0;
    },

    isFilterExistsInReportDefinition: function (name) {
        var filterGroups = this.options.reportDefnModel.filterDims.GroupedFilter;
        for (var i = 0; i < filterGroups.length; i++) {
            if (filterGroups[i].hid === this.options.app.dwRepository.makeHtmlIdForSavedFilterGroup(name)) {
                return true;
            }
        }

        return false;
    },


    updateProperties: function (name) {
        this.options.savedFilter.attr('name', name);
        this.options.savedFilter.attr('desc', name);
        this.options.savedFilter.attr('oldHid', this.options.savedFilter.attr('hid'));
        this.options.savedFilter.attr('hid', this.options.app.dwRepository.makeHtmlIdForSavedFilterGroup(name));
        this.options.savedFilter.attr('attrHID', this.options.app.dwRepository.makeHtmlIdForSavedFilterGroup(name));
        this.options.savedFilter.attr('type', 'ELEMENT');
        this.options.savedFilter.attr('dimName', "GroupedFilter");
    },

    isValidName: function () {
        var $name = this.element.find('.saved-filter-editor-filter-name');
        if ($.trim($name.val()).length === 0) {
            $name.focus();
            this.updateStatus(false, Sentrana.getMessageText("Saved filter name can not be empty."), 'fail');
            return false;
        }

        return true;
    },


    open: function () {
        this.oldHid = this.options.savedFilter.hid;
        if (this.options.mode !== "create" && this.options.savedFilter.attr('id')) {
            this.element.find('.saved-filter-editor-filter-name').prop("readonly", true);
        }
        if (this.options.savedFilter.attr('id')) {
            this.$reusableCheckbox.prop('checked', true);
            this.$reusableCheckbox.prop('disabled', true);
        }
        this.openDialog();

    },


    setColumnName: function () {
        this.element.find('.saved-filter-editor-filter-name').val(this.options.savedFilter.name).attr('title', this.options.savedFilter.name);
    },

    loadForm: function () {
        this.element.html("");
        this.element.append(can.view('templates/saved-filters-dialog.ejs', {}));
        this.$attributeElements = this.element.find(".saved-filter-editor-filters");
        this.$reusableCheckboxContainer = this.element.find(".reusable-checkbox-container");
        this.$reusableCheckbox = this.element.find("#chk-reusable-saved-filter");
    },

    buildElementsUI: function DWAB_buildElementsUI() {
        var that = this;
        var firstFilter = true;
        this.$attributeElements.html("");
        for (var i = 0, l = this.options.app.dwRepository.dimensionNames.length; i < l; i++) {

            var dimName = this.options.app.dwRepository.dimensionNames[i],
                dim = this.options.app.dwRepository.dimensions[dimName];
            if (dim) {
                for (var j = 0, m = (dim.attributes || []).length; j < m; j++) {
                    var attr = dim.attributes[j];

                    if (attr.formMap[attr.defaultFormId].elements || attr.filterControl === 'Calendar') {
                        var nameWithOutSpecialChar = attr.name.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
                        var dimNameWithOutSpecialChar = dimName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');

                        var filterClass = "filter-" + dimNameWithOutSpecialChar + nameWithOutSpecialChar;
                        this.$attributeElements.append('<div class="' + filterClass + '"></div>');
                        var $filterElement = this.element.find('.' + filterClass);

                        var filter = $filterElement.sentrana_only_when_collapsible_container({
                            title: attr.name + ' (' + attr.dimName + ')',
                            showHeader: true,
                            showBorder: true,
                            allowCollapsible: true,
                            initialCollapsed: !firstFilter,
                            callBackFunctionOnExpand: function (attrCopy, $filterElementCopy) {
                                return function () {
                                    that.options.app.handleUserInteraction();

                                    if (!$.trim($filterElementCopy.find(".onlywhen-element-filter").html()).length) {
                                        that.initFilterControl(attrCopy);
                                        setTimeout(function() {
                                            that.selectFilterElements();
                                        }, 500);
                                    } else {
                                        setTimeout(function () {
                                            that.selectFilterElements();
                                        }, 500);
                                    }
                                };
                            }(attr, $filterElement),
                            callBackFunctionOnCollapse: function () {
                                that.options.app.handleUserInteraction();
                            }
                        }).control().getContainerPanel();


                        $(filter).append(can.view('templates/elementHeaderOnlyWhen.ejs', {
                            attr: attr, group:
                                dimNameWithOutSpecialChar + nameWithOutSpecialChar + "-savedfilter", tag: "savedfilter"
                        }));

                        if (firstFilter || attr.filterControl === 'Calendar') {

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
        var filterElements = this.options.savedFilter.filters.attr(), filterElementHids = [];
        for (var i = 0; i < filterElements.length; i++) {
            filterElementHids.push(filterElements[i].hid);
        }

        return filterElements;
    },


    initFilterControl: function (attr) {
        var that = this, filterElementHids = "";//this.getFilterElementsId();

        var param = {
            dwRepository: that.options.app.dwRepository,
            dwSelection: [],
            attr: attr,
            form: null,
            filterentHids: filterElementHids,
            filters: []
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
            param.tag = "savedfilter";

            if (attr.filterControl === 'Button' || !attr.filterControl) {
                // Button is the default filter control
                $(".onlywhen-elements-" + attr.oid + "-" + form.oid + "-savedfilter", this.element).sentrana_filter_control_checkbox_only_when(param);
            }
            if (attr.filterControl === 'Tree') {
                $(".onlywhen-elements-" + attr.oid + "-" + form.oid + "-savedfilter", this.element).sentrana_filter_control_tree_only_when(param);
            }
            if (attr.filterControl === 'ListBox') {
                $(".onlywhen-elements-" + attr.oid + "-" + form.oid + "-savedfilter", this.element).sentrana_filter_control_list_box_only_when(param);
            }

        });

        $('input[placeholder]').inputHints();

    },

    '.formsRadio input[type="radio"] click': function (el, ev) {
        var attrOid = el.attr("attrOID"),
            tag = el.attr("tag"),
            formOid = el.val();

        this.element.find(".onlywhen-formElements-" + attrOid).hide();
        this.element.find(".onlywhen-elements-" + attrOid + "-" + formOid + "-" + tag).show();
    },

    " savedfilter-filter-selected": function (el, ev, param) {

        if (param.isListbox) {
            can.Observe.startBatch();
            var filterElement = this.options.app.dwRepository.objectMap[$(param.options[0]).attr("hid")];
            this.removeOtherValueOfThisAttribute(filterElement.attrHID);
            this.removeSelectionfromControls();
            for (var i = 0; i < param.options.length; i++) {
                filterElement = this.options.app.dwRepository.objectMap[$(param.options[i]).attr("hid")];
                this.options.savedFilter.filters.push(filterElement);
            }
            can.Observe.stopBatch();

        } else {
            this.removeSelectionfromControls();
            this.addRemoveFilter(param);

        }
    },

    addRemoveFilter: function (param) {
        var filterElement = this.options.app.dwRepository.objectMap[$(param).attr("hid")];
        var index = this.options.savedFilter.getIndexOfFilter(filterElement);

        if (index < 0) {
            this.options.savedFilter.filters.push(filterElement);
        } else {
            this.options.savedFilter.filters.splice(index, 1);
        }
    },

    removeOtherValueOfThisAttribute: function (attrHid) {
        var filters = this.getFiltersByAttr(attrHid);
        for (var i = 0; i < filters.length; i++) {
            var index = this.options.savedFilter.getIndexOfFilter(filters[i]);
            if (index > -1) {
                this.options.savedFilter.filters.splice(index, 1);
            }
        }
    },

    getFiltersByAttr: function (attrHid) {
        return $.grep(this.options.savedFilter.filters, function (filter) {
            return filter.attrHID === attrHid;
        });
    },

    removeSelectionfromControls: function () {
        var filterElements = this.options.savedFilter.filters;
        for (var i = 0; i < filterElements.length; i++) {
            this.removeSelectionfromControl(filterElements[i].hid);
        }
    },

    removeSelectionfromControl: function (htmlID) {

        var $div = $.merge($('.object-selector[hid="' + htmlID + '"]', ".saved-filter-editor-filters"),
            $('.tree-node-selector[hid="' + htmlID + '"]', ".saved-filter-editor-filters"));
        $div = $.merge($div, $('.element-filter-listbox-onlywhen option[hid="' + htmlID + '"]', ".saved-filter-editor-filters"));
        var $element, $sel;

        if ($($div).is('input[type="checkbox"]')) {
            $div.removeClass("object-selected");
            if ($($div).is(':checked')) {
                $element = $('.object-selector[hid="' + htmlID + '"]', ".saved-filter-editor-filters");
                $($element).prop('checked', false);
            }
        } else if ($($div).is('option')) {
            $sel = $($div).parent('select');
            $.each($sel.find(":selected"), function (index, value) {
                if ($(value).attr('hid') === htmlID) {
                    $(value).removeAttr("selected");
                    $(value).removeClass("object-selected");
                }
            });
        } else if ($($div).is('a')) {
            $div.removeClass("object-selected");
            $div.removeClass("tree-node-selected");
        }
    },


    updateSlectionAndName: function () {
        this.selectFilterElements();
        this.enableDissableOKButton();
        this.updateFilterWindow();
    },

    selectFilterElements: function () {
        var filterElements = this.options.savedFilter.filters;
        for (var i = 0; i < filterElements.length; i++) {
            this.selectFilterElement(filterElements[i].hid);
        }
    },

    selectFilterElement: function (htmlID) {
        var $div = $.merge($('.object-selector[hid="' + htmlID + '"]', ".saved-filter-editor-filters"),
            $('.tree-node-selector[hid="' + htmlID + '"]', ".saved-filter-editor-filters"));
        $div = $.merge($div, $('.element-filter-listbox-onlywhen option[hid="' + htmlID + '"]', ".saved-filter-editor-filters"));
        var $element, $sel;

        $div.addClass("object-selected");
        $element = $('.object-selector[hid="' + htmlID + '"]', ".saved-filter-editor-filters");

        $($element).prop('checked', true);

        if ($div.is('option')) {
            $div.attr("selected", "selected");
        }
        if ($($div).is('a')) {
            $div.addClass("tree-node-selected");
        }
    },

    updateFilterWindow: function () {
        var that = this;
        var $filtrContainer = this.element.find('.saved-filter-editor-filter-container');
        $filtrContainer.html("");


        $.each(this.options.savedFilter.getFiltersGroupBy(), function (index, val) {
            var attr = that.options.app.dwRepository.objectMap[index];
            $filtrContainer.append(can.view('templates/onlywhen-column-filters.ejs', { attr: attr.name + " (" + attr.dimName + ")", filters: val }));
        });
    },

    enableDissableOKButton: function () {
        this.enableButton("OK", this.options.savedFilter.filters.length > 0);
    },

    ".fu-close-container click": function (el, ev) {
        var hid = $(el).parent().parent().attr('hid'), filterElement = this.options.app.dwRepository.objectMap[hid];
        var index = this.options.savedFilter.getIndexOfFilter(filterElement);

        if (index >= -1) {
            this.options.savedFilter.filters.splice(index, 1);
            this.removeSelectionfromControl(hid);
        }

    },

    "{savedFilter} change": function (savedFilter, ev, attr, how, newVal, oldVal) {
        switch (attr) {
            case "isReusable":
                break;
            case "name":
                break;
            default:
                this.updateSlectionAndName();
                break;
        }
    }


});

});