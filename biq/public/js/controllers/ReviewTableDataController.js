can.Control.extend("Sentrana.Controllers.ReviewTableData", {
    pluginName: 'sentrana_review_table_data',
    dataTypeMap: ["numeric", "string", "numeric", "numeric", "numeric"],

    defaults: {
        model: null,
        data: null,
        testing: null
    }
}, {
    init: function () {
        this.model = this.options.model;
        this.data = this.options.data;
        this.testing = this.options.testing;
    },

    update: function (data, selectedRepos) {
        this.data = data;
        this.selectedRepos = selectedRepos;
        if (!selectedRepos) {
            return;
        }

        this.element.append("Select Table: <select class=\"select-table-name\" />");
        for (var i = 0; i < selectedRepos.length; i++) {
            this.createReviewTable(i);
        }
        this.setTableNames();
        this.showReviewTable(0);
    },

    setTableNames: function () {
        var $tableSelect = $('.select-table-name', this.element);
        for (var i = 0; i < this.selectedRepos.length; i++) {
            var $tableOption = $('<option></option>').val(i).html(this.selectedRepos[i]);
            $tableSelect.append($tableOption);
        }
    },

    showReviewTable: function (tableIndex) {
        $('.dataTables_wrapper').hide();
        var $reviewTable = $("#table-content-review-tbl_" + tableIndex + "_wrapper", this.element);
        $reviewTable.show();
    },

    // Initialize the data table UI for reviewing data.
    createReviewTable: function (tableIndex) {
        var data = this.data[tableIndex];

        var that = this;
        //dataTable for items

        this.element.append("templates/pg-repoman-review-table.ejs", {
            id: tableIndex
        });
        var $reviewTable = $("#table-content-review-tbl_" + tableIndex, this.element);

        // Construct the aaData array
        // How about a transformer class or static method?
        var aaData = [];
        for (var i = 0, l = data.rows.length; i < l; i++) {
            var row = data.rows[i],
                rowData = [];
            for (var j = 0, m = row.cells.length; j < m; j++) {
                var cell = row.cells[j];
                rowData.push(cell.rawValue);
            }

            // Add it to the table...
            aaData.push(rowData);
        }
        // Construct the aoColumns array
        var aoColumns = [];
        for (i = 0, l = data.colInfos.length; i < l; i++) {
            var colInfo = data.colInfos[i],
                sType = this.constructor.dataTypeMap[colInfo.dataType];

            aoColumns.push({
                "sTitle": colInfo.title,
                "sClass": (colInfo.just == '1') ? "numeric" : "",
                "sType": sType
            });
        }
        // Render the data table...
        this.initializing = true;
        this.dataTable = $reviewTable.dataTable({
            "aaData": aaData,
            "aoColumns": aoColumns,
            "asStripeClasses": ["odd-row", "even-row"],
            "bAutoWidth": false,
            "bDestroy": true,
            "iDisplayLength": 10,
            "iDisplayStart": 0
            /*,
            "sDom": '<"H"Clr>t<"F"ip>',
            "sScrollX": "100%",
            "bScrollCollapse": true */
        });
    },

    ".select-table-name change": function (el, ev) {
        this.showReviewTable($(el).val());
    }
});
