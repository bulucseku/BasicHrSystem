can.Control.extend("Sentrana.Controllers.Tables", {
    pluginName: 'sentrana_tables',
    defaults: {
        model: null,
        testing: null
    }
}, {
    init: function () {
        this.model = this.options.model;
        this.testing = this.options.testing;
        this.comparisons = ["=", ">", ">=", "<", "<=", "Contains", "NotContain"];
        this.joins = ["Inner", "Left", "Right", "Full"];
    },

    update: function (data, selectedRepos) {
        if (selectedRepos === undefined) {
            return;
        }

        this.element.empty();
        this.data = data;
        this.selectedRepos = selectedRepos;

        if (this.model.baseTables.length > 0) {
            this.populate();
        }
        else {
            this.freshPopulate();
        }

        this.segmentsDlg = $(".dialog-segments", this.element).sentrana_dialogs_segments({
            model: this.model
        }).control();
        this.dataDlg = $(".dialog-datum", this.element).sentrana_dialogs_data({
            model: this.model
        }).control();
        this.rootFilterDlg = $(".dialog-root-filter", this.element).sentrana_dialogs_root_filter({
            model: this.model
        }).control();
    },

    populate: function () {
        var multipleTables = (this.selectedRepos.length > 1);
        this.element.append(can.view('templates/pg-repoman-join.ejs', {
            selectedRepos: this.selectedRepos,
            comparisonOperators: this.comparisons,
            id: this.model.baseTables[0]
        }));
        if (multipleTables) {
            $(".button-add-table", this.element).button();
            $(".button-add-join", this.element).button();
        }
        else {
            $(".button-add-table", this.element).hide();
            $(".button-add-join", this.element).hide();
        }

        $(".button-add-segments", this.element).button();
        $(".button-add-data", this.element).button();
        $(".button-add-filter", this.element).button();
        $(".button-run-query", this.element).button();
        this.populateJoins(this.model.baseTables[0]);
        for (var i = 1; i < this.model.baseTables.length; i++) {
            var tableID = this.model.baseTables[i];
            this.addBaseTable(tableID);
            $('select-table', $('.' + tableID)).val(tableID);
            this.populateJoins(tableID);
        }
    },

    addJoinElement: function ($nJoin, id, tables, lcolumns, rcolumns) {
        $nJoin.append(can.view('templates/pg-repoman-single-table.ejs', {
            id: id,
            tables: tables,
            joins: this.joins,
            lcolumns: lcolumns,
            rcolumns: rcolumns,
            compares: this.comparisons
        }));
        $('.button-add-segments', $('.' + id)).button();
        $('.button-add-filter', $('.' + id)).button();
        $('.button-add-comparison', $('.' + id)).button();
        $('.button-delete', $('.' + id)).button();
        if (tables.length > 1) {
            $('.button-add-join', $('.' + id)).button();
        }
        else {
            $('.button-add-join', $('.' + id)).hide();
        }
    },

    deleteJoinElement: function (table) {
        $('.' + table.id).remove();
        $('.' + table.id + "_padding").remove();
    },

    addConditionElement: function ($nComp, id, lcolumns, rcolumns) {
        $nComp.append('templates/pg-repoman-single-comparison-operator.ejs', {
            id: id,
            lcolumns: lcolumns,
            rcolumns: rcolumns,
            compares: this.comparisons
        });
    },

    populateJoin: function (join) {
        var parentTable = join.parentTable;
        var table = join.table;
        var id = join.id;
        var tableChoices = this.model.getValidTableChoices(parentTable, this.selectedRepos.slice(0));
        var lcolumns = this.getColumns(table.tableID);
        var rcolumns = this.getAllColumns(parentTable, []);
        var $nJoin = $('.' + parentTable.id + "_joinchild");
        this.addJoinElement($nJoin, id, tableChoices, lcolumns, rcolumns);
        var $joinElem = $('.' + id);
        $('.select-dtable', $joinElem).val(table.tableID);
        $('.select-join-type', $joinElem).val(join.joinType);
        $('.select-lcompare', $joinElem).val(join.conditions[0].lvalue);
        $('.select-rcompare', $joinElem).val(join.conditions[0].rvalue);
        $('.select-compare', $joinElem).val(join.conditions[0].comparisonOperator);
        this.populateJoins(table.id);
    },

    populateConditions: function (join) {
        for (var i = 1; i < join.conditions.length; i++) {
            var condition = join.conditions[i];
            var joinID = join.id;
            var $nComp = $('.' + joinID + "_compchild");
            var parentTable = join.parentTable;
            var table = join.table;
            var lcolumns = this.getColumns(table.tableID);
            var rcolumns = this.getAllColumns(parentTable, []);
            this.addConditionElement($nComp, condition.id, lcolumns, rcolumns);
            var $conditionElem = $('.' + condition.id);
            $('.select-lcompare', $conditionElem).val(condition.lvalue);
            $('.select-rcompare', $conditionElem).val(condition.lvalue);
            $('.select-compare', $conditionElem).val(condition.comparisonOperator);
        }
    },

    populateJoins: function (tableID) {
        var table = this.model.tables[tableID];
        for (var i = 0; i < table.joins.length; i++) {
            var join = table.joins[i];
            this.populateJoin(join);
            this.populateConditions(join);
        }
    },

    freshPopulate: function () {
        if (this.selectedRepos.length > 0) {
            this.element.html(can.view('templates/pg-repoman-join.ejs', {
                selectedRepos: this.selectedRepos,
                comparisonOperators: this.comparisons,
                id: "primaryTable_1"
            }));
            $(".button-add-table", this.element).button();
            $(".button-add-join", this.element).button();
        }
        else {
            this.selectedRepos.push(this.model.tableInfo.tableName);
            this.element.html(can.view('templates/pg-repoman-join.ejs', {
                selectedRepos: this.selectedRepos,
                comparisonOperators: this.comparisons,
                id: "primaryTable_1"
            }));
            $(".button-add-table", this.element).hide();
            $(".button-add-join", this.element).hide();
        }

        this.model.repoCount = {};
        for (var i = 0; i < this.selectedRepos.length; i++) {
            this.model.repoCount[this.selectedRepos[i]] = 0;
        }

        $(".button-add-segments", this.element).button();
        $(".button-add-data", this.element).button();
        $(".button-add-filter", this.element).button();
        $(".button-run-query", this.element).button();

        var nTable = this.model.getNewTable("primaryTable_1", this.selectedRepos[0], 0, null);

        this.model.baseTables.push(nTable);
    },

    addComparison: function (join) {
        var $tableRow = $('.' + join.id);
        if (join.filter !== null) {
            $tableRow = $('.' + join.filter.id);
        }

        var id = this.model.getNewCondition(join).id;
        $tableRow.after('templates/pg-repoman-single-comparison-operator', {
            id: id,
            name: "Comparison Operator"
        });
    },

    getColumnIDFromElement: function (el) {
        return el.parent().parent().attr('class');
    },

    getTableIDFromButton: function (el) {
        return el.parent().attr('class');
    },

    getColumns: function (tableID) {
        var data = this.data[this.selectedRepos.indexOf(tableID)];
        var result = [];
        for (var i = 0; i < data.colInfos.length; i++) {
            result.push(data.colInfos[i].colID);
        }

        return result;
    },

    getAllColumns: function (table, columnList) {
        if (table === null) {
            return columnList;
        }

        var tableID = table.tableID;
        columnList = columnList.concat(this.getColumns(tableID));
        return this.getAllColumns(table.parentTable, columnList);
    },

    getCondition: function (ID) {
        if (ID.substring(0, 2) != 'c-') {
            return this.model.conditions['c-' + ID + "_0"];
        }
        else {
            return this.model.conditions[ID];
        }
    },

    repopulateTableNames: function ($selector, nTables) {
        $selector.empty();
        for (var i = 0; i < nTables.length; i++) {
            this.addTableName($selector, nTables[i]);
        }
    },

    addTableName: function ($selector, nTableName) {
        var $newTable = $('<option></option>').val(nTableName).html(nTableName);

        $selector.append($newTable);
    },

    addBaseTable: function (id) {
        if (this.selectedRepos.length > 0) {
            this.element.append(can.view('templates/pg-repoman-single-basetable.ejs', {
                selectedRepos: this.selectedRepos,
                multipleTables: true,
                id: id
            }));
            $(".button-add-table", this.element).button();
            $(".button-add-join", this.element).button();
        }
        else {
            this.element.append(can.view('templates/pg-repoman-single-basetable.ejs', {
                selectedRepos: this.selectedRepos,
                multipleTables: false,
                id: id
            }));
            $(".button-add-table", this.element).hide();
            $(".button-add-join", this.element).hide();
        }

        $(".button-add-segments", this.element).button();
        $(".button-add-data", this.element).button();
        $(".button-add-filter", this.element).button();
        $(".button-delete-basetable", this.element).button();
    },

    ".button-add-table click": function (el, ev) {
        var id = "primaryTable_" + (this.model.baseTables.length + 1);
        this.addBaseTable(id);
        this.model.baseTables.push(this.model.getNewTable(id, this.selectedRepos[0], 0, null).id);
    },

    ".button-add-join click": function (el, ev) {
        var tableID = this.getTableIDFromButton(el);
        var table = this.model.tables[tableID];
        var tableChoices = this.model.getValidTableChoices(table, this.selectedRepos.slice(0));
        var id = tableChoices[0] + "_" + (this.model.repoCount[tableChoices[0]] += 1);
        var depth = table.depth + 1;
        var nTable = this.model.getNewTable(id, tableChoices[0], depth, table);
        var nJoin = this.model.getNewJoin(table, nTable);
        var lcolumns = this.getColumns(tableChoices[0]);
        var rcolumns = this.getAllColumns(table, []);
        nJoin.conditions[0].lvalue = lcolumns[0];
        nJoin.conditions[0].rvalue = rcolumns[0];
        nJoin.comparisonOperator = 0;
        nJoin.joinType = 0;
        var $nJoin = $('.' + tableID + "_joinchild");
        this.addJoinElement($nJoin, id, tableChoices, lcolumns, rcolumns);
    },

    ".button-add-comparison click": function (el, ev) {
        var joinID = this.getTableIDFromButton(el);
        var join = this.model.joins[joinID];
        var parentTable = join.parentTable;
        var table = join.table;
        var lcolumns = this.getColumns(table.tableID);
        var rcolumns = this.getAllColumns(parentTable, []);
        var $nComp = $('.' + joinID + "_compchild");
        var nComp = this.model.getNewCondition(join);
        nComp.lvalue = lcolumns[0];
        nComp.rvalue = rcolumns[0];
        nComp.comparisonOperator = 0;
        this.addConditionElement($nComp, nComp.id, lcolumns, rcolumns);
    },

    ".select-table change": function (el, ev) {
        var tableID = this.getTableIDFromButton(el);
        var table = this.model.tables[tableID];

        table.tableID = $(el).val();
    },

    ".select-dtable change": function (el, ev) {
        var joinID = this.getTableIDFromButton(el);
        var join = this.model.joins[joinID];

        join.table.tableID = $(el).val();
        var nTables = this.getColumns(join.table.tableID);
        this.repopulateTableNames($('.select-lcompare', $('.' + joinID)), nTables);
    },

    ".select-join-type change": function (el, ev) {
        var joinID = this.getTableIDFromButton(el);
        var join = this.model.joins[joinID];

        join.joinType = $(el).val();
    },

    ".select-lcompare change": function (el, ev) {
        var ID = this.getTableIDFromButton(el);
        var condition = this.getCondition(ID);

        condition.lvalue = $(el).val();
    },

    ".select-rcompare change": function (el, ev) {
        var ID = this.getTableIDFromButton(el);
        var condition = this.getCondition(ID);

        condition.rvalue = $(el).val();
    },

    ".select-compare change": function (el, ev) {
        var ID = this.getTableIDFromButton(el);
        var condition = this.getCondition(ID);

        condition.comparisonOperator = $(el).val();
    },

    ".checkbox-literal change": function (el, ev) {
        var rowID = this.getColumnIDFromElement(el);
        var JC = this.getJoinCondition(rowID);
        if (this.model.isFilter(rowID)) {
            $(el).prop('checked', true);
        }
        else {
            JC.condition.literal = ($(el).prop('checked') !== false);
        }
    },

    ".select-comparison-type change": function (el, ev) {
        var rowID = this.getColumnIDFromElement(el);
        var JC = this.getJoinCondition(rowID);
        var comparisonType = $(el).val();
        if (comparisonType == "New") {
            this.addComparison(JC.join);
            $(el).val(JC.condition.comparisonOperator);
        }
        else {
            if (this.model.isFilter(rowID)) {
                JC.filter.comparisonOperator = $(el).val();
            }
            else {
                JC.condition.comparisonOperator = $(el).val();
            }
        }
    },

    ".input-database1 change": function (el, ev) {
        var rowID = this.getColumnIDFromElement(el);
        var JC = this.getJoinCondition(rowID);
        if (this.model.isFilter(rowID)) {
            JC.filter.value1 = $(el).val();
        }
        else {
            JC.condition.value1 = $(el).val();
        }
    },

    ".input-database2 change": function (el, ev) {
        var rowID = this.getColumnIDFromElement(el);
        var JC = this.getJoinCondition(rowID);
        if (this.model.isFilter(rowID)) {
            JC.filter.value2 = $(el).val();
        }
        else {
            JC.condition.value2 = $(el).val();
        }
    },

    ".button-add-segments click": function (el, ev) {
        var tableID = this.getTableIDFromButton(el);
        var table = this.model.tables[tableID];
        this.segmentsDlg.open(table, this.getColumns(table.tableID));
    },

    ".button-add-data click": function (el, ev) {
        var tableID = this.getTableIDFromButton(el);
        var table = this.model.tables[tableID];
        this.dataDlg.open(table, this.getColumns(table.tableID));
    },

    ".button-delete click": function (el, ev) {
        var tableID = this.getTableIDFromButton(el);
        var table = this.model.tables[tableID];
        this.deleteJoinElement(table);
        this.model.fullDeleteTable(table);
    },

    ".button-delete-basetable click": function (el, ev) {
        var tableID = this.getTableIDFromButton(el);
        var table = this.model.tables[tableID];
        this.deleteJoinElement(table);
        this.model.deleteBaseTable(table);
    },

    ".button-add-filter click": function (el, ev) {
        var tableID = this.getTableIDFromButton(el);
        var table = this.model.tables[tableID];

        this.rootFilterDlg.open(table, this.data[this.selectedRepos.indexOf(table.tableID)].tableInfo);
    },

    ".button-run-query click": function (el, ev) {
        var filterID = this.getColumnIDFromElement(el);
    }
});
