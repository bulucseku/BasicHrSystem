steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.FormulaColumn", {
        pluginName: 'sentrana_dialogs_formula_column',
        defaults: {
            dwRepository: null,
            derivedColumnId: null,
            title: "Transform",
            autoOpen: false,
            buttons: [{
                label: "CANCEL",
                className: "btn-cancel btn-default"
            }, {
                label: "CONTINUE",
                className: "btn-continue btn-primary"
            }, {
                label: "PREVIOUS",
                className: "btn-previous btn-default"
            }, {
                label: "OK",
                className: "btn-ok btn-primary"
            }]
        }
    }, {
        init: function (el, options) {
            /*
             Derived Column dialog can be opened up from a report definition
             or from the derived column list. if "reportDefnModel" is not defined
             then it means that it opens from the second option.
             */

            this.reportDefnModel = this.options.reportDefnModel;
            this.dwRepository = this.options.dwRepository;
            this.derivedColumn = undefined;
            this.ruModel = undefined;
            this.isPartOfAnyReport = this.options.isPartOfAnyReport;
            this.isFormulaValidated = false;
            this.userID = undefined;

            this.element.append(can.view('templates/formula-column-dialog.ejs', {}));

            this._super(el, options);

            this.$columnName = this.element.find('.derived-column-name');
            this.$formulaMatrixContainer = this.element.find('.formula-matrix-container');
            this.$decimalPlaceValue = this.element.find('.decimal-place-num');
            this.$textArea = this.element.find('.formula-bar');
            this.$outputTypeContainer = this.element.find('.output-type-chooser');
            this.textAreaSelection = new window.TextSelector(this.$textArea);
            this.$isReusableColumn = this.element.find('#chk-reusable-formula');
            this.$formulaEditorView = this.element.find('.formula-editor');
            this.$formulaOptionsView = this.element.find('.formula-options');
            this.$reusableColumnContainer = this.element.find('.reusable-column-container');

            this.$isReusableColumn.prop('checked', !this.isPartOfAnyReport);

            var that = this;

            if (this.dwRepository) {

                //get the metrices from group
                this.metrics = this.dwRepository.getAllMetrics();
                this.reusableColumns = this.dwRepository.reusableColumns;

                // Create a Model for the formula validation
                this.formulaValidatorModel = new Sentrana.Models.FormulaValidator(this.metrics, this.reusableColumns);

                // Bind specific changes in the formula validation Model
                this.formulaValidatorModel.bind("change", function (ev, attr, how, newVal, oldVal) {
                    if (attr === "validationStatus") {
                        switch (newVal) {
                        case "RUNNING":
                            that.updateStatus(true, Sentrana.getMessageText(window.app_resources.app_msg.derived_column.formula.validating_msg));
                            break;
                        default:
                            if (newVal) {
                                that.isFormulaValidated = true;
                                that.showFormulaValidMessage();
                                //move to the next view
                                that.showOptionsView();
                            }
                            else {
                                that.showFormulaInvalidMessage();
                            }
                            break;
                        }
                    }
                });
            }

            //hide the second part
            this.showEditorView();
            this.populateTreeView();
        },

        showOptionsView: function () {
            this.$formulaEditorView.hide();
            this.$formulaOptionsView.show();
            this.hideButton('CONTINUE');
            this.showButton('PREVIOUS');
            this.showButton('OK');
            this.updateStatus(false, '');
        },

        showEditorView: function () {
            this.$formulaOptionsView.hide();
            this.$formulaEditorView.show();
            this.showButton('CONTINUE');
            this.hideButton('PREVIOUS');
            this.hideButton('OK');
            this.updateStatus(false, '');
        },

        populateTreeView: function () {
            var jsonData = this.generateJsonObjectForTree();
            var that = this;

            $('.formula-builder-tree-container').jstree({
                "plugins": ["themes", "json_data", "ui", "crrm", "hotkeys", "search"],
                "core": {
                    "themes": {
                        "theme": "apple",
                        "icons": false
                    },
                    "data": jsonData
                }
            }).bind("select_node.jstree", function (e, data) {
                //var name = data.rslt.obj.data("name");
                var name = data.node.data;
                if (name !== "undefined") {
                    that.$textArea.insertAtCursor("[" + name + "]");
                    that.disableOrEnableValidateButton();
                }
            }).bind("loaded.jstree", function (event, data) {
                $(this).jstree("open_all");
            });
        },

        generateJsonObjectForMetricsForTree: function () {
            var metricsRootNode = {
                data: 'Metrics',
                text: 'Metrics'
            };

            var metricsChildren = [];
            var performanceMetricsNode = {
                data: 'Performance Metrics',
                text: 'Performance Metrics'
            };

            var performanceMetricsChildren = [];

            for (var i = 0; i < this.options.dwRepository.metricGroups.length; i++) {
                var node = {
                    data: this.options.dwRepository.metricGroups[i].name,
                    text: this.options.dwRepository.metricGroups[i].name
                };

                var children = [];
                var metrics = this.options.dwRepository.metricGroups[i].metrics;

                for (var nodes = 0; nodes < metrics.length; nodes++) {
                    var childNode = this.getLeafNodeObject(metrics[nodes]);
                    children.push(childNode);
                }

                node.children = children;
                performanceMetricsChildren.push(node);
            }

            performanceMetricsNode.children = performanceMetricsChildren;
            metricsChildren.push(performanceMetricsNode);
            metricsRootNode.children = metricsChildren;

            return metricsRootNode;
        },

        generateJsonObjectForFormulaColumnsForTree: function () {
            var formulaColumnRootNode = {
                data: 'Formula Column',
                text: 'Formula Column'
            };

            var formulaColumnChildren = [];
            var reusableColumns = this.options.dwRepository.reusableColumns;
            for (var i = 0; i < reusableColumns.length; i++) {
                var formulaChildNode = this.getLeafNodeObject(reusableColumns[i]);
                formulaColumnChildren.push(formulaChildNode);
            }

            formulaColumnRootNode.children = formulaColumnChildren;
            return formulaColumnRootNode;
        },

        getLeafNodeObject: function (object) {
            return {
                data: object.name,
                text: object.name,
                metadata: {
                    id: object.oid,
                    name: object.name
                },
                attr: {
                    id: object.oid
                }
            };
        },

        generateJsonObjectForTree: function () {
            var data = [];
            data.push(this.generateJsonObjectForMetricsForTree());
            data.push(this.generateJsonObjectForFormulaColumnsForTree());
            return data;
        },

        isValidEntry: function () {
            if ($.trim(this.$columnName.val()).length === 0) {
                this.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.derived_column.validation.empty_column_name_msg), 'fail');
                return false;
            }

            if (this.dwRepository.isInvalidCharacterExistsInColumnName(this.$columnName.val())) {
                this.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.derived_column.validation.column_cannot_contain_invalid_char, this.dwRepository.getInvalidCharactersForColumnName()), 'fail');
                return false;
            }

            if ($.trim(this.$textArea.val()).length === 0) {
                this.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.derived_column.validation.empty_formula_msg), 'fail');
                return false;
            }

            return true;
        },

        getDerivedColumnFromUI: function () {
            var formulaText = this.$textArea.val();
            var formulaTextWithIds = this.formulaValidatorModel.getFormulaWithIds(formulaText);
            var formulaTextWithoutSpaces = Sentrana.removeWhiteSpace(formulaTextWithIds);
            var outputType = this.element.find('input[name=derived-column-outputtype]:radio:checked').attr('outputType').toUpperCase();
            var precision = this.$decimalPlaceValue.text();

            return {
                "name": this.$columnName.val(),
                "dataSource": this.options.dwRepository.id,
                "formula": formulaTextWithoutSpaces,
                "outputType": outputType,
                "precision": precision,
                "formulaType": "DM"
            };
        },

        saveDerivedColumn: function () {

            var that = this;
            var derivedColumn = this.getDerivedColumnFromUI();

            var isReusableColumn = false;

            if (this.$isReusableColumn.is(":checked")) {
                isReusableColumn = true;
                derivedColumn.id = this.derivedColumn.id;
            }
            else {
                derivedColumn.id = undefined;
                derivedColumn.hid = this.derivedColumn.hid;
                this.isPartOfAnyReport = true;
            }

            //before add check if same name/oid already exists or not
            if (this.sameDerivedColumnNameExists(derivedColumn, isReusableColumn)) {
                this.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.derived_column.validation.duplicate_column_name), 'fail');
                return;
            }

            //if checkbox is check then save to database
            if (isReusableColumn) {
                that.updateStatus(true, "Saving derived column...");

                var reusableColumn = new Sentrana.Models.ReusableColumnInfo({
                    "id": derivedColumn.id,
                    "name": derivedColumn.name,
                    "dataSource": this.options.dwRepository.id,
                    "formula": derivedColumn.formula,
                    "outputType": derivedColumn.outputType,
                    "precision": derivedColumn.precision,
                    "formulaType": "DM"
                });

                reusableColumn.save().done(function (data) {
                    derivedColumn = data;
                    if (!that.isPartOfAnyReport) {
                        that.closeDialog();
                    }
                    else {
                        if (that.ruModel) {
                            //update the derived column
                            that.updateDerivedColumnInReportDefn(derivedColumn);
                        }
                        else {
                            //add derived column
                            that.addDerivedColumnToReportDefn(derivedColumn);
                        }
                    }
                }).fail(function (err) {

                    var errorCode = err.getResponseHeader("ErrorCode");
                    var errorMsg = err.getResponseHeader("ErrorMsg");

                    if (errorCode === Sentrana.Enums.ErrorCode.DERIVED_COLUMN_NAME_IN_USE) {
                        that.updateStatus(false, errorMsg, 'fail');
                    }
                    else {
                        that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.save_operation.failed), 'fail');
                    }

                }).always(function () {

                });
            }
            else {
                derivedColumn.id = undefined;
                if (this.isPartOfAnyReport) {
                    if (this.ruModel) {
                        //update the derived column
                        this.updateDerivedColumnInReportDefn(derivedColumn);
                    }
                    else {
                        //add derived column
                        this.addDerivedColumnToReportDefn(derivedColumn);
                    }
                }
            }
        },

        addDerivedColumnToReportDefn: function (derivedColumn) {
            // Determine the position of the metric in the template...
            var metricPosition = this.reportDefnModel.templateUnits.length;
            var metricSortPosition = this.reportDefnModel.templateUnits.length + 1;
            this.addReportUnitToReportDefinition(derivedColumn, metricPosition, metricSortPosition, "add");
        },

        updateDerivedColumnInReportDefn: function (derivedColumn) {
            //get the position
            var that = this;
            var pos = -1;
            $.each(this.reportDefnModel.templateUnits, function (index, obj) {
                if (obj.hid === that.ruModel.hid) {
                    pos = index;
                }
            });

            this.addReportUnitToReportDefinition(derivedColumn, pos, this.ruModel.sortPos, "update");
        },

        addReportUnitToReportDefinition: function (derivedColumn, metricPosition, metricSortPosition, action) {

            var oid = '';

            if (derivedColumn.id) {
                oid = derivedColumn.oid;
            }
            else {
                oid = this.dwRepository.createDerivedColumnOID(derivedColumn);
            }

            var derivedColumnObject = this.dwRepository.getObjectByOID(oid);

            if (derivedColumnObject) {
                if (action === "update") {
                    //as it is update operation then set the hid of original object
                    if (derivedColumnObject.id) {
                        this.reportDefnModel.updateFormulaOfReportDefinition(this.derivedColumn.hid, derivedColumnObject, metricPosition, metricSortPosition);
                    }
                    else {
                        this.reportDefnModel.updateExpressionOfReportDefinition(this.derivedColumn.hid, derivedColumnObject, metricPosition, metricSortPosition);
                    }
                }
                else {
                    if (derivedColumnObject.id) {
                        this.reportDefnModel.addFormulaToReportDefinition(derivedColumnObject, metricPosition, metricSortPosition);
                    }
                    else {
                        this.reportDefnModel.addExpressionToReportDefinition(derivedColumnObject, metricPosition, metricSortPosition);
                    }
                }

                this.closeDialog();
            }
        },

        sameDerivedColumnNameExists: function (dColumn, isReusableColumn) {
            var recordCount = 0;

            if (dColumn.name && dColumn.name.length > 0) {

                var deruvedColumnhid = this.ruModel ? this.ruModel.hid : dColumn.hid;

                //Check with Metrics
                var metrics = $.grep(this.metrics, function (obj) {
                    return $.trim(obj.name.toLowerCase()) === $.trim(dColumn.name.toLowerCase());
                });
                recordCount = recordCount + metrics.length;

                //Check with Derived Metrics
                var reusableColumns = $.grep(this.reusableColumns, function (obj) {
                    return $.trim(obj.name.toLowerCase()) === $.trim(dColumn.name.toLowerCase()) && obj.id !== dColumn.id;
                });
                recordCount = recordCount + reusableColumns.length;

                //Check with expressions
                if (this.reportDefnModel) {
                    $.each(this.reportDefnModel.derivedColumnMap, function (key, value) {
                        if ($.trim(value.name.toLowerCase()) === $.trim(dColumn.name.toLowerCase()) && value.hid !== deruvedColumnhid) {
                            recordCount = recordCount + 1;
                            return false;
                        }
                    });
                }

                //for reusable derived columns check in other reports
                if (isReusableColumn) {
                    //Check with all expressions in individual reports and booklet reports
                    if (this.checkSameColumnNameExistsInSingleReports(dColumn.name, deruvedColumnhid)) {
                        recordCount = recordCount + 1;
                    }

                    if (this.checkSameColumnNameExistsInBookletReportExpression(dColumn.name, deruvedColumnhid)) {
                        recordCount = recordCount + 1;
                    }
                }
            }

            if (recordCount <= 0) {
                return false;
            }
            else {
                return true;
            }
        },

        checkSameColumnNameExistsInSingleReports: function (columnName, colId) {
            var isSameNameExists = false;

            if (!this.options.app.reportDefnInfoList || !this.options.app.reportDefnInfoList.savedReports) {
                return false;
            }

            for (var i = 0; i < this.options.app.reportDefnInfoList.savedReports.length; i++) {

                if (this.options.app.reportDefnInfoList.savedReports[i].createUserId === this.userID) {
                    var report = this.options.app.reportDefnInfoList.savedReports[i];
                    isSameNameExists = this.checkSameColumnNameExistsInReportExpression(columnName, colId, report);
                }

                if (isSameNameExists) {
                    break;
                }
            }

            return isSameNameExists;
        },

        checkSameColumnNameExistsInReportExpression: function (columnName, colId, report) {
            var isSameNameExists = false;

            if (report.definition && this.options.reportId !== report.id) {
                var templates = report.definition.template.split('|');

                //loop through each template to check if it is an expression
                for (var t = 0; t < templates.length; t++) {
                    var expression = this.options.dwRepository.isDerivedColumn(templates[t]);
                    if (expression && $.trim(expression.name.toLowerCase()) === $.trim(columnName.toLowerCase())) {
                        isSameNameExists = true;
                        break;
                    }
                }
            }

            return isSameNameExists;
        },

        checkSameColumnNameExistsInBookletReportExpression: function (columnName, colId) {
            var isSameNameExists = false;

            if (!this.options.app.booklets || !this.options.app.booklets.savedBooklets) {
                return false;
            }

            var that = this;

            var userBooklets = $.grep(this.options.app.booklets.savedBooklets, function (data) {
                return data.booklet.createUserId === that.userID;
            });

            for (var i = 0; i < userBooklets.length; i++) {
                for (var r = 0; r < userBooklets[i].booklet.reports.length; r++) {
                    isSameNameExists = this.checkSameColumnNameExistsInReportExpression(columnName, colId, userBooklets[i].booklet.reports[r]);

                    if (isSameNameExists) {
                        break;
                    }
                }

                if (isSameNameExists) {
                    break;
                }
            }

            return isSameNameExists;
        },

        // Instance Method: Load the information from the model into the dialog...
        loadForm: function (derivedColumn) {

            this.$columnName.val(derivedColumn.name);
            this.$decimalPlaceValue.text(derivedColumn.precision);
            this.$textArea.val(derivedColumn.formula);
            this.loadOutputTypes(derivedColumn);
            this.disableOrEnableValidateButton();

            if (derivedColumn.id) {
                this.$isReusableColumn.prop('checked', true);
            }
        },

        loadOutputTypes: function (derivedColumn) {
            var outputTypes = [{
                id: 'NUMBER',
                name: 'Number'
            }, {
                id: 'CURRENCY',
                name: 'Currency'
            }, {
                id: 'PERCENTAGE',
                name: 'Percentage'
            }];

            this.$outputTypeContainer.empty();
            this.$outputTypeContainer.html(can.view('templates/derivedColumnOutputTypeSelection.ejs', {
                outputtypes: outputTypes,
                derivedColumn: derivedColumn
            }));
        },

        // Instance Method: Open the dialog with a report model
        open: function (ruModel, dColumn) {

            /*
             get the oid from the ruModel and then find the object
             if ruModel is null then use the derivedColumn
             */
            this.ruModel = ruModel;

            var derivedColumn;

            if (dColumn) {
                //this is a formula set from list
                this.derivedColumn = dColumn;
                derivedColumn = $.extend(true, {}, this.derivedColumn);
                derivedColumn.formula = this.formulaValidatorModel.getFormulaWithNames(dColumn.formula);
            }
            else if (ruModel) {
                //could be a Expression or Formula
                var hid = this.ruModel.attr('hid');
                this.derivedColumn = this.dwRepository.objectMap[hid] || this.reportDefnModel.derivedColumnMap[hid];
                derivedColumn = $.extend(true, {}, this.derivedColumn);

                if (!derivedColumn.formula) {
                    //if this is not a formula column then add formula property
                    derivedColumn.formula = this.formulaValidatorModel.getFormulaWithNames('[' + derivedColumn.oid + ']');
                }
                else {
                    derivedColumn.formula = this.formulaValidatorModel.getFormulaWithNames(derivedColumn.formula);
                }

                if (!derivedColumn.outputType) {
                    derivedColumn.outputType = this.derivedColumn.dataType;
                    derivedColumn.precision = 2;
                }
            }
            else {
                var nextColumnName = '';
                if (this.reportDefnModel) {
                    //from report definition
                    nextColumnName = 'Column' + (this.reportDefnModel.templateUnits.length + 1);
                }

                this.derivedColumn = {
                    "name": nextColumnName,
                    "formula": '',
                    "outputType": 'NUMBER',
                    "precision": 2
                };
                derivedColumn = $.extend(true, {}, this.derivedColumn);
            }

            //clear the previous content
            this.resetInputValues();

            // Load the form...
            this.loadForm(derivedColumn);

            // Open the dialog...
            this.openDialog();

            //set focus to the end
            this.$textArea.setCursorPosition(derivedColumn.formula.length);
        },

        resetInputValues: function () {
            this.$columnName.val('');
            this.$textArea.val('');
            this.$decimalPlaceValue.text('2');
            this.disableButton('CONTINUE');
        },

        /*
         Consider both Performance metrices and Resuable columns
         */
        isInvalidMetricsExists: function () {
            var that = this;
            var hasInvalidMetrics = false;
            var formulaText = this.$textArea.val();
            var matchedValues = formulaText.match(Sentrana.RegEx.RE_METRIC_IN_FORMULA);

            if (matchedValues && matchedValues.length > 0) {
                $.each(matchedValues, function (index, value) {
                    if (value !== "" && !hasInvalidMetrics) {
                        var metrics = $.grep(that.metrics, function (obj) {
                            return '[' + obj.name + ']' === value;
                        });

                        var reusableColumns = $.grep(that.reusableColumns, function (obj) {
                            return '[' + obj.name + ']' === value;
                        });

                        if ((!metrics || metrics.length === 0) && (!reusableColumns || reusableColumns.length === 0)) {
                            hasInvalidMetrics = true;
                        }
                    }
                });
            }

            return hasInvalidMetrics;
        },

        isValidSyntax: function () {
            //check if round brackets are correct format
            var formulaText = this.$textArea.val();

            var bracketDifference = 0;

            for (var i = 0; i < formulaText.length; i++) {
                if (formulaText[i] === '(') {
                    bracketDifference++;
                }
                else if (formulaText[i] === ')') {
                    bracketDifference--;
                }
            }

            if (bracketDifference !== 0) {
                return false;
            }

            return true;

            //TODO: need to hadle if expression
            //Remove all the '(' and ')' and check the syntax
            //var textWithoutRoundBracketAndSpaces = Sentrana.removeWhiteSpace(formulaText.replace(/(\(|\))/gim, ""));
            //return Sentrana.RegEx.RE_VALID_FORMULA.test(textWithoutRoundBracketAndSpaces);
        },

        showFormulaValidMessage: function () {
            this.updateStatus(false, 'Formula syntax validated');
        },

        showFormulaInvalidMessage: function () {
            this.updateStatus(false, 'Formula syntax invalid', 'fail');
        },

        validateFormula: function () {

            if (this.isFormulaValidated) {
                this.showFormulaValidMessage();
                this.showOptionsView();
                return;
            }

            /* validate:
             1. Check if all the given values within [] are in the metrics list
             2. Check the syntaxt
             2.1. No two adjacent operators(+,-,/,*)
             2.2. No invalid character exists
             */
            var isValid = true;
            this.updateStatus(true, 'Validating formula...');

            if (!this.isValidSyntax()) {
                isValid = false;
            }

            //Call serverside validation
            if (isValid) {
                //check if round brackets are correct format
                var formulaText = this.$textArea.val();
                this.formulaValidatorModel.validateFormula(formulaText);
            }
            else {
                this.showFormulaInvalidMessage();
            }
        },

        removeText: function (cursorStartPosition, cursorEndPosition) {
            /*
             if cursorStartPosition falls in some metrics then considert the cursor position from that
             metrics start index. Similarly if cursorEndPosition falls in some metrics then consider the
             cursor end position as the metrics end index.
             */
            var minPos = this.findMinIndex(cursorStartPosition);
            var maxPos = this.findMaxIndex(cursorEndPosition);

            this.textAreaSelection.select(minPos, maxPos);
            this.textAreaSelection.replace('');
            this.$textArea.setCursorPosition(minPos);

        },

        findMinIndex: function (cursorPosition) {
            var minPos = cursorPosition;
            var that = this;
            var formulaText = this.$textArea.val();
            var matchedValues = formulaText.match(Sentrana.RegEx.RE_METRIC_IN_FORMULA);

            if (matchedValues && matchedValues.length > 0) {
                $.each(matchedValues, function (index, value) {
                    if (value !== "") {
                        if (!that.isInvalidMetricsExists(value)) {
                            //metrics unit found and then check the cursor
                            var indexes = that.findIndexes(formulaText, value);
                            if (indexes.length > 0) {
                                for (var i = 0; i < indexes.length; i++) {
                                    if (indexes[i] <= cursorPosition && indexes[i] + value.length > cursorPosition) {
                                        minPos = indexes[i];
                                    }
                                }
                            }
                        }
                    }
                });
            }

            return minPos;
        },

        findMaxIndex: function (cursorPosition) {
            var maxPos = cursorPosition;
            var that = this;
            var formulaText = this.$textArea.val();
            var matchedValues = formulaText.match(Sentrana.RegEx.RE_METRIC_IN_FORMULA);

            if (matchedValues && matchedValues.length > 0) {
                $.each(matchedValues, function (index, value) {
                    if (value !== "") {
                        if (!that.isInvalidMetricsExists(value)) {
                            //metrics unit found and then check the cursor
                            var indexes = that.findIndexes(formulaText, value);
                            if (indexes.length > 0) {
                                for (var i = 0; i < indexes.length; i++) {
                                    if (indexes[i] < cursorPosition && indexes[i] + value.length >= cursorPosition) {
                                        maxPos = indexes[i] + value.length;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            return maxPos;
        },

        findIndexes: function (searchString, keyword) {
            var indexes = [];
            var index = searchString.indexOf(keyword);
            while (index >= 0) {
                indexes.push(index);
                index = searchString.indexOf(keyword, index + keyword.length);
            }

            return indexes;
        },

        disableOrEnableValidateButton: function () {
            if ($.trim(this.$textArea.val())) {
                this.enableButton('CONTINUE');
            }
            else {
                this.disableButton('CONTINUE');
            }

        },

        ".increase-value click": function () {
            this.$decimalPlaceValue.text(parseInt(this.$decimalPlaceValue.text(), 10) + 1);
        },

        ".decrease-value click": function () {
            if (this.$decimalPlaceValue.text() === "0") {
                return;
            }

            this.$decimalPlaceValue.text(parseInt(this.$decimalPlaceValue.text(), 10) - 1);
        },

        handleCONTINUE: function (el, ev) {
            //NOTE: for chrome only
            if ($(el).attr("disabled") === 'disabled') {
                return;
            }

            this.validateFormula();
        },

        ".formula-bar keydown": function (element, event) {
            if (event.keyCode === 8 || event.keyCode === 46) {
                event.preventDefault();
            }
        },

        ".formula-bar keyup": function (element, event) {
            var currentCursorPosition = this.$textArea.getCursorPosition();

            //handle backspace and delete
            if ((event.keyCode == 8 || event.keyCode == 46) && this.textAreaSelection.isSelected()) {
                this.removeText(this.textAreaSelection.get().start, this.textAreaSelection.get().end);
            }
            else if (event.keyCode == 8) {
                //Backspace
                this.removeText(currentCursorPosition - 1, currentCursorPosition);
            }
            else if (event.keyCode == 46) {
                //Delete
                this.removeText(currentCursorPosition, currentCursorPosition + 1);
            }
            else if (event.keyCode === 57 && event.shiftKey) {
                this.$textArea.insertAtCursor(")");
                this.$textArea.setCursorPosition(currentCursorPosition);
            }

            this.disableOrEnableValidateButton();
            this.isFormulaValidated = false;
        },

        ".formula-bar cut paste": function (element, event) {
            this.isFormulaValidated = false;
        },

        handlePREVIOUS: function () {
            this.showEditorView();
        },

        handleOK: function () {
            //clear the status bar first
            this.updateStatus(false, "");

            //Check for valid session
            var userInfo = this.options.app.retrieveUserInfo();

            if (!userInfo || !userInfo.userID) {
                Sentrana.FirstLook.closeSession("timeout");
                return;
            }

            this.userID = userInfo.userID;

            if (!this.isValidEntry()) {
                return;
            }

            if (this.isFormulaValidated) {
                this.saveDerivedColumn();
            }
            else {
                this.validateFormula();
            }
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
