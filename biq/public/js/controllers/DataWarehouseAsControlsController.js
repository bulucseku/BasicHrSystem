can.Control.extend("Sentrana.Controllers.DataWarehouseAsControls", {

    pluginName: 'sentrana_data_warehouse_as_controls',

    // TODO Fill in template files, prefix...
    defaults: {
        dwRepository: null,
        dwSelection: null
    }
}, {
    // Class constructor: Called only once for all invocations of the helper method...
    init: function DWAB_init() {
        var that = this;

        if (this.hasMetrics()) {
            this.metricsContainerController = $('.metrics-panel').sentrana_collapsible_container({
                title: 'Metrics',
                showHeader: true,
                showBorder: true,
                allowCollapsible: true,
                callBackFunctionOnExpand: function () {
                    that.options.app.handleUserInteraction();
                },
                callBackFunctionOnCollapse: function () {
                    that.options.app.handleUserInteraction();
                }
            }).control();

            this.$metrics = this.metricsContainerController.getContainerPanel();
        }

        this.$dimention = $('.dimension').sentrana_collapsible_container({
            title: 'Attributes',
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            callBackFunctionOnExpand: function () {
                that.options.app.handleUserInteraction();
            },
            callBackFunctionOnCollapse: function () {
                that.options.app.handleUserInteraction();
            }
        }).control().getContainerPanel();
        this.$attributeElements = this.element.find(".attribute-elements");
        this.$reusablePopupDiv = $(".reusable-columns-list-popup");
        this.$savedFilterPopupDiv = $(".saved-filter-list-popup");

        // Setup the Delete Derived Column dialog...
        this.deleteReusableColumnDlg = $("#delete-reusable-column-dialog").sentrana_dialogs_delete_reusable_column({
            app: this.options.app
        }).control();

        this.deleteSavedFilterDlg = $("#delete-saved-filter-dialog").sentrana_dialogs_delete_saved_filter({
            app: this.options.app
        }).control();

        if (this.options.dwRepository) {
            // Create a Model for the formula validation
            this.formulaValidatorModel = new Sentrana.Models.FormulaValidator(this.options.dwRepository.getAllMetrics(), this.options.dwRepository.reusableColumns);
        }

        this.updateView();
    },

    hasMetrics: function () {
        var metricsCount = 0;

        if (this.options.dwRepository.metricGroups && this.options.dwRepository.metricGroups.length > 0) {
            for (var i = 0; i < this.options.dwRepository.metricGroups.length; i++) {
                if (this.options.dwRepository.metricGroups[i].metrics) {
                    metricsCount += this.options.dwRepository.metricGroups[i].metrics.length;
                }
            }
        }

        return metricsCount > 0;
    },

    // Instance method: Called each time the helper method is invoked...
    update: function DWAB_update(options) {
        this._super(options);
        this.updateView();
    },

    // Instance method: Render the UI
    updateView: function DWAB_updateView() {
        // Sanity check: do we have a model?
        if (!this.options.dwRepository) {
            return;
        }

        //if no metrics found then do not render the empty area
        if (this.hasMetrics()) {
            this.buildMetricsUI();
            this.buildReusableColumnsUI();
        }
        this.buildAttributesUI();
        this.buildSavedFiltersUI();
        this.buildElementsUI();
    },

    // Instance method: Build the user interface for the Metrics...
    buildMetricsUI: function DWAB_buildMetricsUI() {
        var title = "Performance Metrics";

        this.$metrics.append('<div class="performance-metrics-grp"></div>');
        var $performanceMetricsGroup = this.element.find('.performance-metrics-grp');
        var that = this;

        var performanceMetricsContainer = $performanceMetricsGroup.sentrana_side_bar_collapsible_container({
            title: title,
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            callBackFunctionOnExpand: function () {
                that.options.app.handleUserInteraction();
            },
            callBackFunctionOnCollapse: function () {
                that.options.app.handleUserInteraction();
            }
        }).control().getContainerPanel();

        if (this.isOnlyOneGroup()) {
            performanceMetricsContainer.append('<div class="performance-metrics-' + this.options.dwRepository.metricGroups[0].id + '" ></div>');
            $('.performance-metrics-' + this.options.dwRepository.metricGroups[0].id + '', this.element).append(can.view('templates/objectCheckBox.ejs', {
                prefix: 'pgbuilder',
                objects: this.options.dwRepository.metricGroups[0].metrics,
                totoalCount: this.options.dwRepository.metricGroups[0].metrics.length
            }));
        }
        else {
            for (var i = 0; i < this.options.dwRepository.metricGroups.length; i++) {
                if (this.options.dwRepository.metricGroups[i].metrics.length) {
                    performanceMetricsContainer.append('<div class="performance-metrics-' + this.options.dwRepository.metricGroups[i].id + '" ></div>');
                    var $performanceMetrics = this.element.find('.performance-metrics-' + this.options.dwRepository.metricGroups[i].id + '').sentrana_side_bar_collapsible_container({
                        title: this.options.dwRepository.metricGroups[i].name,
                        showHeader: true,
                        showBorder: true,
                        allowCollapsible: true,
                        titleCssClass: 'child',
                        callBackFunctionOnExpand: function () {
                            that.options.app.handleUserInteraction();
                        },
                        callBackFunctionOnCollapse: function () {
                            that.options.app.handleUserInteraction();
                        }
                    }).control().getContainerPanel();
                    $performanceMetrics.append(can.view('templates/objectCheckBox.ejs', {
                        prefix: 'pgbuilder',
                        objects: this.options.dwRepository.metricGroups[i].metrics,
                        totoalCount: this.options.dwRepository.metricGroups[i].metrics.length
                    }));
                }
            }
        }

    },

    // Instance method: Build the user interface for the Reusable Columns...
    buildReusableColumnsUI: function DWAB_buildReusableColumnsUI() {
        var that = this;
        var title = "Derived Metrics";
        var nameWithOutSpecialChar = title.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');

        this.$metrics.append('<div class="reusable-columns"></div>');
        var $reusableColumn = this.element.find('.reusable-columns');
        $reusableColumn.append('<div class="reusableColumns-' + nameWithOutSpecialChar + '"></div>');
        var reusableColumnController = this.element.find('.reusableColumns-' + nameWithOutSpecialChar).sentrana_side_bar_collapsible_container({
            title: title,
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            callBackFunctionOnExpand: function () {
                that.options.app.handleUserInteraction();
            },
            callBackFunctionOnCollapse: function () {
                that.options.app.handleUserInteraction();
            }
        }).control();
        reusableColumnController.addButtonToBar({
            "title": "Reusable Column",
            "cls": "fa-superscript",
            "eventType": "show_reusable_column_popup",
            "dropdown": false
        });
        this.reusableColumnContainer = reusableColumnController.getContainerPanel();

        this.populateReusableColumns();

        $reusableColumn.find('.cc-button').click(function (event) {
            that.options.app.handleUserInteraction();

            var $this = $(this);

            that.$reusablePopupDiv.css({
                position: "absolute",
                top: ($this.offset().top - 118) + 'px',
                left: ($this.offset().left - 6) + 'px'
            });

            that.$reusablePopupDiv.fadeIn("slow").show();
            return false;
        });
    },

    buildSavedFiltersUI: function DWAB_buildSavedFiltersUI() {
        var that = this;
        var filterClass = "filter-saved-filters";
        this.$attributeElements.append('<div class="' + filterClass + '"></div>');
        var $filterElement = this.element.find('.' + filterClass);

        var filter = $filterElement.sentrana_side_bar_collapsible_container({
            title: "Saved Filters",
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            initialCollapsed: true,
            callBackFunctionOnExpand: function () {
                that.options.app.handleUserInteraction();
            },
            callBackFunctionOnCollapse: function () {
                that.options.app.handleUserInteraction();
            }
        }).control();

        filter.addButtonToBar({ "title": "Saved Filters", "cls": "fa-filter", "eventType": "show_saved_filter_popup", "dropdown": false });

        this.savedFilterContainer = filter.getContainerPanel();

        this.populateSavedFilters();

        $filterElement.find('.cc-button').click(function (event) {
            that.options.app.handleUserInteraction();

            var $this = $(this);

            that.$savedFilterPopupDiv.css({
                position: "absolute",
                top: ($this.offset().top - 100) + 'px',
                left: ($this.offset().left - 300) + 'px'
            });

            that.$savedFilterPopupDiv.fadeIn("slow").show();
            return false;
        });
    },

    populateSavedFilters: function () {
        var that = this;
        var savedFilters = this.options.dwRepository.savedFilters || [];
        
        /*
         keep the previous selected checkboxes and after fill the checks
         Hacking: As all the elements are re renderd so keep the checkbox hids and later on make those check again
        */
        var hIds = [];
        $('input:checked', this.savedFilterContainer).each(function () {
                    hIds.push($(this).attr('hid'));
        });

        this.$savedFilterPopupDiv.html(can.view('templates/saved-filter-popup.ejs', { savedFilters: savedFilters }));
      
        var param = { dwRepository: that.options.dwRepository, dwSelection: that.options.dwSelection, savedFilters: savedFilters };

        if (this.filterGroupController) {
            this.filterGroupController.destroy();
            this.savedFilterContainer.html('');
        }
        this.savedFilterContainer.append('<div class="element-filter"></div>');
        this.filterGroupController = $('.element-filter', this.savedFilterContainer).sentrana_filter_group(param).control();

        $("input[type='checkbox']", this.savedFilterContainer).each(function() {
            var $chkItem = $(this);
            var hid = $chkItem.attr('hid');
            if ($.inArray(hid, hIds) > -1) {
                that.options.dwSelection["deselectObject"](hid);
                that.options.dwSelection["selectObject"](hid);
            }
        });
    },

    ".saved-filter-list-popup-item-remove-button click": function (el, ev) {
        var filterName = el.attr('filterName');
        var savedFilter = this.getSavedFilter(filterName);

        if (savedFilter) {
            this.$savedFilterPopupDiv.fadeOut("slow");
            this.deleteSavedFilterDlg.open(savedFilter);
        }
    },

    getSavedFilter: function (filterName) {
        var savedFilter = null, index = this.getSavedFilterIndex(filterName);
        if (index > -1) {
            savedFilter = this.options.dwRepository.savedFilters[index];
        }
        return savedFilter;
    },

    getSavedFilterIndex: function (filterName) {
        var savedFilters = this.options.dwRepository.savedFilters;
        for (var i = 0; i < savedFilters.length; i++) {
            if (savedFilters[i].name === filterName) {
                return i;
            }
        }
        return -1;
    },
    
    "{document} click": function (el, ev) {
        //Hide the Reusable popup div
        if (this.$reusablePopupDiv && !this.$reusablePopupDiv.has(ev.target).length) {
            this.$reusablePopupDiv.fadeOut("slow");
        }

        //Hide the save filter popup div
        if (this.$savedFilterPopupDiv && !this.$savedFilterPopupDiv.has(ev.target).length) {
            this.$savedFilterPopupDiv.fadeOut("slow");
        }
    },

    isOnlyOneGroup: function () {
        var groupCount = 0;
        for (var i = 0; i < this.options.dwRepository.metricGroups.length; i++) {
            if (this.options.dwRepository.metricGroups[i].metrics.length) {
                groupCount++;
            }
        }

        return groupCount === 1;
    },

    // Instance method: Build the user interface for the Attributes...
    buildAttributesUI: function DWAB_buildAttributesUI() {
        var that = this;
        // Loop through each dimension...
        for (var i = 0, l = this.options.dwRepository.dimensionNames.length; i < l; i++) {
            // Get the ith dimension...
            var dimName = this.options.dwRepository.dimensionNames[i],
                dim = this.options.dwRepository.dimensions[dimName];
            if (dim) {
                var nameWithOutSpecialChar = dimName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');

                this.$dimention.append('<div class="dimension-' + nameWithOutSpecialChar + '"></div>');
                var dimension = this.element.find('.dimension-' + nameWithOutSpecialChar).sentrana_side_bar_collapsible_container({
                    title: dimName,
                    showHeader: true,
                    showBorder: true,
                    allowCollapsible: true,
                    callBackFunctionOnExpand: function () {
                        that.options.app.handleUserInteraction();
                    },
                    callBackFunctionOnCollapse: function () {
                        that.options.app.handleUserInteraction();
                    }
                }).control().getContainerPanel();

                var segmentableAttributes = $.grep(dim.attributes, function (attribute, index) {
                    return (attribute.segmentable);
                });

                // Loop through the list of attributes...
                $(dimension).append(can.view('templates/objectCheckBox.ejs', { prefix: 'pgbuilder', objects: segmentableAttributes, totoalCount: segmentableAttributes.length }));
            }
        }
    },

    // Instance method: Build the user interface for the Attribute Elements...
    buildElementsUI: function DWAB_buildElementsUI() {
        var that = this;
        var firstFilter = true;
        // Clear the current contents...
        //this.$attributeElements.html("");

        // Loop through each dimension...
        for (var i = 0, l = this.options.dwRepository.dimensionNames.length; i < l; i++) {
            // Get the ith dimension...
            var dimName = this.options.dwRepository.dimensionNames[i],
                dim = this.options.dwRepository.dimensions[dimName];
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
                        var filter = $filterElement.sentrana_side_bar_collapsible_container({
                            title: attr.filterName + ' (' + attr.dimName + ')',
                            showHeader: true,
                            showBorder: true,
                            allowCollapsible: true,
                            initialCollapsed: !firstFilter,
                            callBackFunctionOnExpand: function (attrCopy, $filterElementCopy) {
                                // The outside function provide a copy of two variables from the for loop outside.
                                return function () {
                                    that.options.app.handleUserInteraction();
                                    // This is a way to check whether we have already rendered the filter control.
                                    if (!$.trim($filterElementCopy.find(".element-filter").html()).length) {
                                        that.initFilterControl(attrCopy);
                                    }
                                };
                            }(attr, $filterElement),
                            callBackFunctionOnCollapse: function () {
                                that.options.app.handleUserInteraction();
                            }
                        }).control().getContainerPanel();
                        // Only to show all the elements in the first filter control.
                        $(filter).append(can.view('templates/elementHeader.ejs', {
                            attr: attr,
                            group: dimNameWithOutSpecialChar + nameWithOutSpecialChar
                        }));
                        if (firstFilter || attr.filterControl === 'Calendar' || attr.filterControl == 'Tree') {
                            // For the first filter and Calendar control and Tree elements, there is no lazy loading for them.
                            this.initFilterControl(attr);
                            firstFilter = false;
                        }
                    }
                }
            } //if dim
        }
    },
   
    checkSelectedFilter: function (dimName) {
        var selectedFilters = this.options.builderController.executionMonitorModel.reportDefinModel.filterDims[dimName];
        for (var i = 0; i < selectedFilters.length; i++) {
            this.updateSelectClass(selectedFilters[i].hid, "add");
        }
    },

    initFilterControl: function (attr) {
        var that = this;
        var param = {
            dwRepository: that.options.dwRepository,
            dwSelection: that.options.dwSelection,
            attr: attr,
            form: null
        };
        $.each(attr.forms, function (index, form) {

            param.form = form;

            if (attr.filterControl === 'Button' || !attr.filterControl) {
                // Button is the default filter control
                $(".elements-" + attr.oid + "-" + form.oid).sentrana_filter_control_checkbox(param);
            }
            if (attr.filterControl === 'Tree') {
                $(".elements-" + attr.oid + "-" + form.oid).sentrana_filter_control_tree(param);
            }
            if (attr.filterControl === 'ListBox') {
                $(".elements-" + attr.oid + "-" + form.oid).sentrana_filter_control_list_box(param);
            }
            if (attr.filterControl === 'Calendar') {
                $(".elements-" + attr.oid + "-" + form.oid).sentrana_filter_control_calendar(param);
            }
        });

        $('input[placeholder]').inputHints();
    },

    " filter_rendered": function(el, ev, param) {
         this.checkSelectedFilter(param);
    },

    populateReusableColumns: function () {
        var that = this;
        var reusableColumns = this.options.dwRepository.reusableColumns;

        /*
         keep the previous selected checkboxes and after fill the checks
         Hacking: As all the elements are re renderd so keep the checkbox hids and later on make those check again
         */
        var hIds = [];
        $('input:checked', this.reusableColumnContainer).each(function () {
            hIds.push($(this).attr('hid'));
        });

        //        $(this.reusableColumnContainer).children().detach();

        for (var i = 0; i < reusableColumns.length; i++) {
            var desc = this.formulaValidatorModel.getFormulaWithNames(reusableColumns[i].formula) || reusableColumns[i].formula;

            if ($.browser.mozilla && desc && desc.length > 60) {
                desc = desc.substr(0, 60) + '...';
            }

            reusableColumns[i].desc = desc;
        }

        $(this.reusableColumnContainer).html(can.view('templates/objectCheckBox.ejs', {
            prefix: 'pgbuilder',
            objects: reusableColumns,
            totoalCount: reusableColumns.length
        }));
        this.$reusablePopupDiv.html(can.view('templates/reusable-formula-popup.ejs', {
            derivedColumns: reusableColumns
        }));

        $("input[type='checkbox']", this.reusableColumnContainer).each(function () {
            var $chkItem = $(this);
            var hid = $chkItem.attr('hid');
            if ($.inArray(hid, hIds) > -1) {
                var metricPosition = that.options.builderController.reportDefnModel.getTemplateUnitIndex(hid);

                that.options.dwSelection.deselectObject(hid);
                that.options.dwSelection.selectObject(hid);

                that.options.builderController.reportDefnModel.deselectObject(hid, "update");
                that.options.builderController.reportDefnModel.selectObject(hid, metricPosition);

                $chkItem.prop('checked', true);
            }
        });
    },

    // Browser Event: What to do when a user clicks on a object selector...
    '.object-selector change': function (el, ev) {
        var objectMap = this.options.dwRepository.objectMap;
        var filterElement = objectMap[$(el).attr("hid")];

        // Check whether same column name already added or not
        var isSameColumnNameAlreadyAdded = false;
        var templateUnits = this.options.builderController.reportDefnModel.templateUnits;

        // Check whether object with the same name already added or not
        for (var i = 0; i < templateUnits.length; i++) {
            var expression = this.options.app.dwRepository.isDerivedColumn(templateUnits[i].oid);
            if (expression) {
                if (expression.name === filterElement.name) {
                    isSameColumnNameAlreadyAdded = true;
                    break;
                }
            }
        }

        if (isSameColumnNameAlreadyAdded) {
            $('#' + filterElement.hid).prop('checked', false);
            Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.report_definition.column_name_conflict.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.report_definition.column_name_conflict.dialog_msg), null, true, false, this);
            return;
        }

        // This is only for metric and attribute buttons.
        if (filterElement.type !== "ELEMENT") {
            var htmlID = el.attr("hid"),
                isSelected = el.hasClass("object-selected");

            // Call either select or deselect Object...
            this.options.dwSelection[(isSelected) ? "deselectObject" : "selectObject"](htmlID);
        }
    },

    // Browser Event: What to do when a user clicks on an Attribute Forms radio button...
    '.formsRadio input[type="radio"] click': function (el, ev) {
        var attrOID = el.attr("attrOID"),
            formOID = el.val();

        // Hide all form divs...
        this.element.find(".formElements-" + attrOID).hide();

        // Show the selected form elements...
        $(".elements-" + attrOID + "-" + formOID).show();
    },

    ".saved-filter-list-popup-item-edit-button click": function(el, ev) {
        var filterName = el.attr('filterName');

        var savedFilter = this.getSavedFilter(filterName);

        if (savedFilter) {
            this.$savedFilterPopupDiv.fadeOut("slow");
            this.options.builderController.openSavedFilterDialog(savedFilter);
        }
    },
        
    ".saved-filter-list-popup-add-button click": function () {
        this.$savedFilterPopupDiv.fadeOut("slow");
        this.options.builderController.openSavedFilterDialog();
    },

    " link-saved-filters-clicked": function (el, ev, object) {
        this.options.builderController.openSavedFilterDialog(object);
    },
    
    "{Sentrana.Models.SavedFilterGroupInfo} updated": function (model, ev, item) {
        var savedFilter = this.options.dwRepository.getSavedFilterGroupModel(item);
        this.updatedSavedFilter("edit", savedFilter);
    },

    "{Sentrana.Models.SavedFilterGroupInfo} created": function (model, ev, item) {
        var savedFilter = this.options.dwRepository.getSavedFilterGroupModel(item);
        this.updatedSavedFilter("create", savedFilter);
    },

    "{Sentrana.Models.SavedFilterGroupInfo} destroyed": function (model, ev, item) {
        var savedFilter = this.options.dwRepository.getSavedFilterGroupModel(item);
        var index = this.getSavedFilterIndex(savedFilter.name);
        this.options.dwRepository.savedFilters.splice(index, 1);

        var isSelectedInReportDefinition = false;
        if( this.options.dwSelection[savedFilter.hid]){
            isSelectedInReportDefinition = true;
        }

        this.options.dwSelection["deselectObject"](savedFilter.hid);
        this.populateSavedFilters();

        if(isSelectedInReportDefinition){
            item.attr("id", undefined);
            var updatedsavedFilter = this.options.dwRepository.getSavedFilterGroupModel(item);
            this.options.dwRepository.objectMap[updatedsavedFilter.hid] = updatedsavedFilter;
            this.options.dwSelection["selectObject"](updatedsavedFilter.hid);
        }
    },

    updatedSavedFilter: function (mode, savedFilter) {
        switch (mode) {
            case "create":
                this.options.dwRepository.savedFilters.push(savedFilter);
                break;
            case "edit":
                var index = this.getSavedFilterIndex(savedFilter.name);
                this.options.dwRepository.savedFilters[index] = savedFilter;
                break;
            default:
                break;
        }

        this.options.dwRepository.objectMap[savedFilter.hid] = savedFilter;
        this.populateSavedFilters();
    },

    ".reusable-columns-list-popup-add-button click": function () {
        //this.openDerivdColumnDialog();
        this.$reusablePopupDiv.fadeOut("slow");
        this.options.builderController.openDerivdColumnDialog();
    },

    ".reusable-columns-list-popup-item-edit-button click": function (el, ev) {
        var columnId = el.attr('columnid');
        var reusableColumns = this.options.dwRepository.reusableColumns;

        var derivedColumn = null;
        for (var i = 0; i < reusableColumns.length; i++) {
            if (reusableColumns[i].id === columnId) {
                derivedColumn = reusableColumns[i];
                break;
            }
        }

        if (derivedColumn) {
            this.$reusablePopupDiv.fadeOut("slow");
            if (derivedColumn.formulaType === "DM") {
                this.options.builderController.openDerivdColumnDialog(null, derivedColumn);
            }
            else if (derivedColumn.formulaType === "CM") {
                this.options.builderController.openOnlyWhenColumnDialog(derivedColumn, false);
            }
        }
    },

    ".reusable-columns-list-popup-item-remove-button click": function (el, ev) {
        var columnId = el.attr('columnid');
        var reusableColumns = this.options.dwRepository.reusableColumns;

        var derivedColumn = null;
        for (var i = 0; i < reusableColumns.length; i++) {
            if (reusableColumns[i].id === columnId) {
                derivedColumn = reusableColumns[i];
                break;
            }
        }

        if (derivedColumn) {
            this.$reusablePopupDiv.fadeOut("slow");
            this.deleteReusableColumnDlg.open(derivedColumn);
        }
    },

    "{Sentrana.Models.ReusableColumnInfo} created": function (model, ev, newItem) {
        this.options.dwRepository.addReusableColumnToObjectMap(newItem);
        this.populateReusableColumns();
    },

    "{Sentrana.Models.ReusableColumnInfo} updated": function (model, ev, updatedItem) {
        this.options.dwRepository.updateReusableColumnInObjectMap(updatedItem);
        this.populateReusableColumns();
    },

    refreshReportsAfterReusableColumnDelete: function (pattern, oid) {
        //Update the reports
        if (this.options.app.reportDefnInfoList && this.options.app.reportDefnInfoList.savedReports) {
            var savedReports = this.options.app.reportDefnInfoList.savedReports;
            for (var i = 0; i < savedReports.length; i++) {
                //check if the deleted derived column exists in the report definition
                if (savedReports[i].definition) {
                    savedReports[i].definition.attr("template", savedReports[i].definition.template.replace(pattern, oid));
                }
            }
        }
    },

    refreshBookletsAfterReusableColumnDelete: function (pattern, oid) {
        //update the booklets
        if (this.options.app.booklets) {
            var booklets = this.options.app.booklets;
            if (booklets.savedBooklets) {
                for (var i = 0; i < booklets.savedBooklets.length; i++) {
                    if (booklets.savedBooklets[i].booklet.reports) {
                        for (var reportIndex = 0; reportIndex < booklets.savedBooklets[i].booklet.reports.length; reportIndex++) {
                            //check if the deleted derived column exists in the booklet report definition
                            if (booklets.savedBooklets[i].booklet.reports[reportIndex].definition) {
                                booklets.savedBooklets[i].booklet.reports[reportIndex].definition.attr("template", booklets.savedBooklets[i].booklet.reports[reportIndex].definition.template.replace(pattern, oid));
                            }
                        }
                    }
                }
            }
        }
    },

    refreshNestedReusableColumnsAfterReusableColumnDelete: function (pattern, destroyedItem) {
        //update reusable column list if nested column is used
        for (var i = 0; i < this.options.dwRepository.reusableColumns.length; i++) {
            this.options.dwRepository.reusableColumns[i].attr("formula", this.options.dwRepository.reusableColumns[i].formula.replace(pattern, destroyedItem.formula));
        }
    },

    refreshReportDefinAfterReusableColumnDelete: function (pattern, oid, triggerData) {
        if (this.options.builderController.reportDefnModel) {
            for (var i = 0; i < this.options.builderController.reportDefnModel.templateUnits.length; i++) {
                var templateUnit = this.options.builderController.reportDefnModel.templateUnits[i];
                //Check for existing report definition
                if (pattern.test(templateUnit.oid)) {
                    var derivedColumnObject = this.options.dwRepository.getObjectByOID(oid);
                    triggerData = {
                        derivedColumn: derivedColumnObject,
                        pos: i,
                        sortPosition: templateUnit.sortPosition,
                        sortOrder: templateUnit.sortOrder
                    };
                    break;
                }
            }
        }
        return triggerData;
    },

    "{Sentrana.Models.ReusableColumnInfo} destroyed": function (model, ev, destroyedItem) {

        var triggerData;
        var pattern = new RegExp("f\\(" + destroyedItem.id + "\\)", "gmi");
        var oid = this.options.dwRepository.createDerivedColumnOID(destroyedItem);

        this.refreshReportsAfterReusableColumnDelete(pattern, oid);
        this.refreshBookletsAfterReusableColumnDelete(pattern, oid);
        this.refreshNestedReusableColumnsAfterReusableColumnDelete(pattern, destroyedItem);
        triggerData = this.refreshReportDefinAfterReusableColumnDelete(pattern, oid, triggerData);

        //remove the object if selected
        this.options.dwSelection.deselectObject(destroyedItem.hid);
        //Remove from object map
        this.options.dwRepository.removeReusableColumnFromObjectMap(destroyedItem);
        //Re-populate the list
        this.populateReusableColumns();

        //if deleted derived column is selected in the report definition editor then replace it with expression
        this.element.trigger("update_definition_for_deleted_derived_column", triggerData);

    },

    // Synthetic Event: What to do when the model changes state...
    "{dwSelection} change": function (model, ev, attr, how, newVal, oldVal) {
        var htmlID = attr;
        this.updateSelectClass(htmlID, how);
    },

    updateSelectClass: function (htmlID, how) {
        var $div = $.merge($('.object-selector[hid="' + htmlID + '"]'), $('.tree-node-selector[hid="' + htmlID + '"]'));
        $div = $.merge($div, $('.element-filter-listbox option[hid="' + htmlID + '"]'));

        var $element, $sel;

        // Either add or remove the class indicating the button is selected...
        if ($div.length > 0) {
            if (how === "add") {
                $div.addClass("object-selected");
                $element = $('.object-selector[hid="' + htmlID + '"]');

                if (!$($element).is(':checked')) {
                    $($element).prop('checked', true);
                }
                if ($div.is('option')) {
                    $div.attr("selected", "selected");
                }
                if ($($div).is('a')) {
                    $div.addClass("tree-node-selected");
                }

            }
            else if (how === "remove") {
                //if attribute is removed from report definition then remove selection from columns/filters
                if ($($div).is('input[type="checkbox"]')) {
                    $div.removeClass("object-selected");
                    if ($($div).is(':checked')) {
                        $element = $('.object-selector[hid="' + htmlID + '"]');
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
            }
        }

    },

    ".global-column-search-input keyup": function (el, ev) {
        var searchText = $(el).val();

        //Show/hide checkboxes based on the search input text
        $('.object-selector-wrapper', '.metrics').children('label').each(function (index) {
            var $this = $(this);
            if ($this.text().toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                $this.parent().show();
            }
            else {
                $this.parent().hide();
            }
        });
    }
});
