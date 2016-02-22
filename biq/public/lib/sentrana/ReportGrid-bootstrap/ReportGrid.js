/**
* @class ReportGrid
* @module Sentrana
* @namespace Sentrana.Controllers
* @extends jQuery.Controller
* @description ReportGrid is a jQueryMX Controller that presents a tabular grid for a report structured as a DatasetResult JSON object.
*/
can.Control.extend("Sentrana.Controllers.ReportGrid", {
    pluginName: 'sentrana_report_grid',

    /* Column Data Type Mapping from server-side date type to DataTables type.
    * See Dataset.cs: public enum DataType { DATETIME, STRING, CURRENCY, NUMBER, PERCENTAGE }; */
    dataTypeMap: ["numeric", "string", "numeric", "numeric", "numeric"],

    /* Default values */
    // jQueryMX does not do a deep copy of default values as such, if you have nested defaults, they are not applied if caller supplies some of them.
    // TODO Investigate. Is this intended behavior? Seems rather odd.
    defaults: {
        basePath: "lib/sentrana/ReportGrid-bootstrap", /* This is the relative path from the document root to the resources for this control. */
        templatesPath: "templates", /* This is the relative path from the basePath to the templates folder. */
        tmplInit: "initTable.ejs", /* This is the template file that initializes a table before converting to a DataTables. */
        tmplFooter: "tfoot.ejs", /* This is the template file that defines how a grand total row is added to the table's footer section. */
        model: null, 				/* This is expected to be a Sentrana.Models.ExecutionMonitor instance. */
        reportData: null, 		/* This is a pure JSON object (not an instance of a custom class) that contains a serialized from of a DatasetResult. */
        reportDefnModel: null, 	/* This is expected to be a Sentrana.Models.ReportDefin instance. */
        showFilter: true, 		/* Whether to show the filter: the text box that limits the number of rows shown. */
        showPageSizeCombo: true, /* Whether to show the pageSizeCombo: a combo box that allows the user to modify the number of rows to show at a time. */
        showPageSelector: true, 	/* Whether to show the pageSelector: a list of buttons that allow the user to select which page to show */
        showInfo: true, 			/* Whether to show the info section: a description of the number of rows being shown. */
        showGridButtons: true, 	/* Whether to show the grid buttons section or not. */
        pageSize: 20, 			/* The default number of rows per page */
        pageSizes: [10, 20, 30, 50, 100], /* The set of page sizes that are shown in the menu. */
        scrollX: "100%",        /* The default value to enable horizontal scrolling */
        allowDrill: true,
        autoHeight: false
    }
}, {
    /**
    * @constructor
    * @class ReportGrid
    */
    init: function RG_init() {
        // Define our jQuery objects...
        var $reportGridCntr = $(".report-grid-cntr", this.element);
        this.$exportButton = $(".export-button", this.element);

        // Hold a reference to the TABLE (all tables?) contained in the
        this.$reportGrid = $reportGridCntr.html(this.getTemplatePath(this.options.tmplInit), {}).find("table");
        this.$tfoot = $("tfoot", this.$reportGrid);

        // Initialize instance fields...
        this.dataTable = null;

        // Initialize our buttons...
        this.initializeButtons();

        // Update our view...
        this.updateView();

        // column-reorder is the event triggered by ColReorder plugin of datatable.
        // We use it to know which column has been moved to which place.
        // This listensTo event name needs to be whole word. Something like column_reorder will be working fine, but not column-reorder.
        // http://javascriptmvc.com/docs.html#!jQuery.Controller.static.listensTo
        var that = this;
        this.on("column-reorder", function (el, ev, reorderingResult) {
            // Do we have a report definition model?
            if (that.options.reportDefnModel && !that.options.donotUpdateModel) {
                that.options.reportDefnModel.moveColumn(reorderingResult.iFrom, reorderingResult.iTo);
                //change the column position in model (ExecutionMonitor model) so that it
                //reflects in the chart also.
                that.options.model.reorderColumnPos(reorderingResult.iFrom, reorderingResult.iTo);
            }
            can.trigger(that.element, 'grid_column_reordered', { from: reorderingResult.iFrom, to: reorderingResult.iTo });
        });


        // IE8 fires resize event even when any elements on the page is resized
        // which can be triggered by changes of many things such as height, style attributes, and so on.
        // So when any operation performs redraw actions, the resize event is fired again and again and again (infinite loop)!!
        // This function is therefore writen to overcome the above mentioned problem
        //-----------------------------------------------------------------------------//
        // Use $.support.opacity & $.support.leadingWhitespace to detect IE-8
        // "opacity" is false in IE & "leadingWhitespace" is false in IE 6-8
        // Details can be found on http://api.jquery.com/jQuery.support/
        if (!$.support.opacity && !$.support.leadingWhitespace) {

            var resizeListener = function (callback) {

                $(window).one("resize", function () { //unbinds itself every time it fires
                    //Execute our function
                    if (callback) {
                        callback();
                    }
                    window.setTimeout(resizeListener, 100); //rebinds itself after 100ms
                });
            };

            resizeListener(function () {
                that.resizeGrid(true);
            });
        }
    },

    // Instance method: Get the path to a template file...
    getTemplatePath: function RG_getTemplatePath(templateFile) {
        var parts = [];

        // Do we have a basePath?
        if (this.options.basePath) {
            parts.push(this.options.basePath);

            // Did our path NOT end in a slash?
            if (!/\/$/.test(this.options.basePath)) {
                parts.push("/");
            }
        }

        // Do we have a templatesPath?
        if (this.options.templatesPath) {
            parts.push(this.options.templatesPath);

            // Did our path NOT end in a slash?
            if (!/\/$/.test(this.options.templatesPath)) {
                parts.push("/");
            }
        }

        // Add the template file...
        parts.push(templateFile);

        return parts.join("");
    },

    // Instance method: invoked on subsequent calls to the jQuery Helper object for this controller...
    update: function RG_update(options) {
        // Call the base class implementation...
        this.setup(this.element, options);

        // Now update our visual representation...
        this.updateView();
    },

    // This method will be called when we directly pass in report data to populate the grid.
    staticUpdate: function RG_staticUpdate(data) {
        this.options.reportData = data;
        this.updateView();
    },

    // Instance method: Initialize our buttons...
    initializeButtons: function RG_initializeButtons() {
        // Make all of our jQuery buttons...
        this.$exportButton.button();
    },

    // Instance method: Create the sDom field used by DataTables to display what is shown...

	buildsDom: function RG_buildsDom() {

		var parts = [];

		// Add support for ColReorder...
		parts.push("R");

		// Show the page size combo?
		if (this.options.showPageSizeCombo || this.options.showFilter || this.options.showGridButtons) {
			parts.push("<'table-header clearfix'<'table-caption'><'DT-lf-right'");
			if (this.options.showPageSizeCombo) {
				parts.push("<'DT-per-page'l>");
			}

			// Show the filter?
			if (this.options.showFilter) {
				parts.push("<'DT-search'f>");
			}

			if (this.options.showGridButtons) {
				parts.push("<'buttonBar grid-button-bar'>");
			}

			// Show processing?
			// TODO Is this really necessary?
			parts.push(">r>");

		}

		// Show the table
		parts.push("t");

		// Put the info and pagination sections in a footer section...
		if (this.options.showInfo || this.options.showPageSelector) {
			parts.push("<'table-footer clearfix'");

			// Show the information section?
			if (this.options.showInfo) {
				parts.push("<'DT-label'i>");
			}

			// Show the pagination section?
			if (this.options.showPageSelector) {
				parts.push("<'DT-pagination'p>");
			}

			// Close up the footer section...
			parts.push(">");
		}
		return parts.join("");
	},

    // Instance method: How we render the view...
    updateView: function RG_updateView() {

        // Get our dataset...
        this.data = this.options.reportData || (this.options.model && this.options.model.getData());

        // Is it missing?
        if (!this.data || !this.data.rows ) {
            return;
        }

        // Make a copy of the original set of rows (to facilitate returning a sorted set of rows)
        this.origRows = this.data.rows.slice();

        // Do we have a previously created table?
        if (this.dataTable) {
            // Destroy the prior table (reverting the DOM to what it was before control initialization)
            this.dataTable.fnDestroy();

            // WORKAROUND BUG IN COLREORDER 1.0.8
            delete this.dataTable._oPluginColReorder;

            // Release the datatable (making it available for GC now)
            this.dataTable = null;

            // Empty the header, body and footer...
            $("thead", this.element).empty();
            $("tbody", this.element).empty();
            $("tfoot", this.element).empty();
        }

        // Construct the aaData array
        // How about a transformer class or static method?
        var aaData = [];
        var i, j, l, m;
        for (i = 0, l = this.data.rows.length; i < l; i++) {
            var row = this.data.rows[i],
				rowData = {};
            for (j = 0, m = row.cells.length; j < m; j++) {
                var cell = row.cells[j];
                rowData["c" + j + "_d"] = cell.rawValue;
                rowData["c" + j + "_f"] = cell.fmtValue;
            }

            // Add it to the table...
            aaData.push(rowData);
        }

        function binder(i, sType) {
            return function (source, type, val) {
                if (type === "display" || type === "filter" || sType === "string") {
                    return source["c" + i + "_f"];
                } else {
                    return source["c" + i + "_d"];
                }
            };
        }

        // Construct the aoColumns array
        var aoColumns = [],
            that = this;
        $.each(this.data.colInfos, function(i, colInfo) {
			var sType = that.constructor.dataTypeMap[colInfo.dataType];

            aoColumns.push({
                "sTitle": colInfo.title,
                "sClass": (colInfo.just === '1') ? "numeric" : "",
                "sType": sType,
                "mDataProp": binder(i, sType),
                "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                    if (sData === "Subtotal:") {
                        $(nTd).addClass("numeric");
                        $(nTd).parent().addClass("subtotal-row");
                    }
                }
            });
        });

        // Do we have a report definition model?
        var aaSorting = [], aSort;
        if (this.options.reportDefnModel) {
            // Construct the aaSorting array
            var tusAndMetrics = this.options.reportDefnModel.getTemplateUnitFormsAndMetrics();
            for (i = 0, l = tusAndMetrics.length; i < l; i++) {
                var tu = tusAndMetrics[i];
                aSort = [i, (tu.sortOrder === "A") ? "asc" : "desc", (tu.sortOrder === "A") ? 0 : 1, 0];

                // Do we already have an entry at this index?
                if (aaSorting[tu.sortPosition - 1]) {
                    // Increment the "duplicate" count
                    aaSorting[tu.sortPosition - 1][3]++;
                } else {
                    aaSorting[tu.sortPosition - 1] = aSort;
                }
            }

            // Expand out duplicate entries: one for each additional attribute form...
            for (i = 0, l = aaSorting.length; i < l; i++) {
                aSort = aaSorting[i];
                if (aSort[3]) {
                    for (j = 0; j < aSort[3]; j++) {
                        aaSorting.splice(i, 0, [aSort[0] + j + 1, aSort[1], aSort[2]]);
                    }
                    i += aSort[3];
                }
            }
        }

        // Render the data table...
        
        this.initializing = true;
        this.dataTable = this.$reportGrid.dataTable({
            "aaData": aaData,
            "aaSorting": aaSorting,
            "aLengthMenu": this.options.pageSizes,
            "aoColumns": aoColumns,
            //"asStripeClasses": ["odd-row", "even-row"],
            "autoWidth": true,
            "bDestroy": true,
            "bSort": this.options.allowSort === undefined ? true : this.options.allowSort,
            "stateSave": true,
			"bDeferRender": true,
			"bScrollCollapse":true,
            "footerCallback": function (nFoot, aData, iStart, iEnd, aiDisplay) {
                if (that.data.totals) {
                    that.$tfoot.html(that.getTemplatePath(that.options.tmplFooter), that.data);
                } else {
                    that.$tfoot.empty();
                }
            },
            "fnStateLoadParams": function (oSettings, oData) {
                oData.iStart = 0; /* Reset the initial row displayed to be the first one. */
                oData.aaSorting = oSettings.aaSorting; /* Use the sorting supplied, not the one saved. */
                oData.oSearch = oSettings.oSearch; /* Use the search options supplied, not the ones saved. */
                oData.ColReorder = []; /* Empty this saved column reordering */
            },
            "pageLength": this.options.pageSize,
            "displayStart": 0,
            "language": {
                "info": "Displaying rows _START_ to _END_ of _TOTAL_",
                "lengthMenu": "Show  _MENU_  rows at a time",
                "paginate": {
                    "first": "First",
                    "last": "Last",
                    "previous": "Prev",
                    "next": "Next"
                },
                "searchPlaceholder": "Search..."
            },
            "sDom": this.buildsDom(),
            "pagingType": "full_numbers",
            "sScrollX": this.options.scrollX,
            "drawCallback": function (o) {
                if(that.options.autoHeight){
                    that.adjustGridHeightToContainer();
                }
                that.removeTableInlineOverflowStyle();
                if (that.element != null) {
                    can.trigger(that.element, 'grid_drawn');
                }
            }
        });

        this.initializing = false;

        // Set the search box placeholder
        $('.dataTables_filter input', this.element).attr("placeholder", "Search");
        $('.dataTables_filter input', this.element).attr("type", "text");

        // Show or hide the grid buttons...
        $(".buttonBar", this.element)[(this.options.showGridButtons) ? "show" : "hide"]();

        if (this.element) {
            can.trigger(this.element, 'grid_rendered');
        }
    },

    adjustGridHeightToContainer: function(){
        var headerHeight = this.element.find('.table-header').outerHeight(true);
        var footerHeight = this.element.find('.table-footer').outerHeight(true);
        var totalHeight = headerHeight + footerHeight;
        this.element.find('.dataTables_scroll').css('height', 'calc(100% - ' + totalHeight + 'px)');
    },

    // Instance Method: Resize the grid (presumably because the window has resized)
    resizeGrid: function (reDraw) {
        if (this.dataTable) {
            this.dataTable.fnAdjustColumnSizing(reDraw);
            if(this.options.autoHeight){
                this.adjustGridHeightToContainer();
            }
        }
    },

    removeTableInlineOverflowStyle: function () {
        // if not chrome browser then overwrite the "overflow" css property
        if(!window.chrome) {
            $('.dataTables_scrollHead').css('overflow', '');
            $('.dataTables_scrollBody').css('overflow', '');
        }
    },

    // Instance Method: Export data from the DataTables instance back to the ExecutionMonitor model instance...
    updateDataModel: function RG_updateDataModel() {
        if (this.dataTable && this.options.model) {
            // Get the data for the entire table, sorted row indices...
            var dataTablesData = this.dataTable.fnGetData(),
				sortedRowIndicies = this.dataTable.fnSettings().aiDisplayMaster;

            // Get the data from ExecutionMonitor model...
            var dataRoot = this.options.model.getData(),
				origRows = this.origRows,
				newRows = [];

            // Indicate the start of a local change to the data model...
            this.options.model.startLocalDataChange();

            // Loop through each row...
            for (var i = 0, l = dataTablesData.length; i < l; i++) {
                // Get the ith row of the DataTables table...
                var dataTablesRow = dataTablesData[i],
					origRowIndex = sortedRowIndicies[i];

                // Add the original row to the new array of rows...
                newRows.push(origRows[origRowIndex]);
            }

            //NOTE: as it resets the original dataset so insted of updating the original data
            // created a new proprety "staticData" and set the data via setStaticData() then use
            // that data to update the chart.

            var staticData = $.extend(true, {}, dataRoot);
            staticData.rows = newRows;

            this.options.model.setStaticData(staticData);

            // Indicate the end of a local change to the data model...
            this.options.model.endLocalDataChange("SUCCESS");
        }
    },

    sortDataTable: function RG_updateDataModel(columnIndex, sortOrder) {
        if (this.dataTable) {
            this.dataTable.fnSort([[columnIndex, sortOrder]]);
        }
    },

    ".report-grid-cntr thead th click": function (el, ev) {
        can.trigger(this.element, 'grid_header_clicked', { column: el });
    },

    ".report-grid-cntr tbody tr mouseover": function (el, ev) {
        if (this.options.allowDrill && ((this.options.model && this.options.model.reportDefnStack.length > 1) || (this.data && this.data.drillable))) {

            $(el).removeClass("defaultCursor").addClass("pointerCursor");
        } else {
            $(el).removeClass("pointerCursor").addClass("defaultCursor");
        }
    },

    // Browser Event: What to do when a user clicks on a row in the report grid...
    ".report-grid-cntr tbody tr click": function (el, ev) {
        // If we don't have an ExecutionMonitor model instance...
        if (!this.options.model) {
            return;
        }
        // Get the list of selected elements...
        // TODO Consider replacing with this.element.fnGetData(el);
        var elems = [];
        $("td", el).each(function (index, el) {
            elems.push($(el).text());
        });

        // Get out if the first element indicates that no matching records were found...
        if (elems.length && elems[0] === "No matching records found") {
            return;
        }
        $("tbody tr", this.element).removeClass('highlight-row');
        if (this.options.allowDrill) {
            // Ask for a drill menu to be displayed for the elements specified on the row...
            this.options.model.requestDrillMenu(elems, ev);
        }
    },

    // Browser Event: What to do when the user wants to export the grid as CSV...
    ".export-button click": function (el, ev) {
        can.trigger(this.element, "export_report", this.data.cacheid);
    },

    // Synthetic Event: What to do when the model changes...
    "{model} change": function (model, ev, attr, how, newVal, oldVal) {
        // Are we being notified of a successful execution?
        if (attr === "executionStatus" && newVal === "SUCCESS") {
            //clear the static data if any
            this.options.reportData = undefined;
            if (!this.options.stopInitialRendering) {
                this.updateView();
            }
        }else if (attr === "localDataChangeStatus" && newVal === "SUCCESS") {
            this.updateView();
        }
    },

    // Synthetic Event: Raised by the DataTables control after a sort has been performed...
    " sort": function (el, ev, oSettings) {
        var defn = this.options.reportDefnModel;

        // Do we have a report definition model instance?
        if (defn && !this.initializing) {
            // Create an array of sort info objects...
            var sortSpec = [];

            // Loop through the sorting settings...
            for (var i = 0, l = oSettings.aaSorting.length; i < l; i++) {
                var aSort = oSettings.aaSorting[i];

                sortSpec.push({ columnIndex: aSort[0], sortOrder: (aSort[1] === "asc") ? "A" : "D" });
            }

            // Submit the sorting specification to the Report Definition model...
            defn.changeSortSpecification(sortSpec);

            // Update the data model...
            if (!this.options.donotUpdateModel) {
                this.updateDataModel();
            }
        }
    },

    // Window resize...
    "{window} resize": function (el, ev) {
        // Use $.support.opacity & $.support.leadingWhitespace to detect IE-8
        // "opacity" is false in IE & "leadingWhitespace" is false in IE 6-8
        // Details can be found on http://api.jquery.com/jQuery.support/
        if (!$.support.opacity && !$.support.leadingWhitespace) {
            return;
        } else {
            this.resizeGrid(true);
        }
    }
});
