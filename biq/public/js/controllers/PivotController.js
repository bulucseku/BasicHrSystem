can.Control.extend("Sentrana.Controllers.PivotControl", {
    pluginName: 'sentrana_pivot_control',
    defaults: {
        app: null,
        structure: {},
        pivotData: [],
        pivotElement: "",
        pivotContainer: "",
        pivotId: "",
        height: 500,
        width: "auto",
        columnInfo: []
    }
}, {

    init: function () {
        this.resetParameters();
        this.updateView(this.options.structure, this.getDataForCurrentPage(this.options.structure));
    },

    resetParameters: function(){
        this.nextItemIndex = 0;
        this.pageSize = 10;
        this.pageWiseItems = {};
        this.currentPageIndex = 0;
        var decidingRow = this.options.structure.rows[0];
        //sort the data
        this.sortData(this.options.pivotData, decidingRow);
    },

    enableDisableNavigationButtons: function () {
        //if has only one report then disable both button.
        var btnNext = this.element.parent().find(".fa-caret-right").closest('.btn'),
            btnPrev = this.element.parent().find(".fa-caret-left").closest('.btn');

        if (this.options.pivotData.length == this.pageWiseItems[this.currentPageIndex].length) {
            btnPrev.addClass("disabled");
            btnNext.addClass("disabled");
        }
        else if (this.currentPageIndex === 0 && this.currentPageIndex < Object.keys(this.pageWiseItems).length){
            btnPrev.addClass("disabled");
            btnNext.removeClass("disabled");
        }
        else if (this.nextItemIndex === this.options.pivotData.length) {
            btnPrev.removeClass("disabled");
            btnNext.addClass("disabled");
        } else  {
            btnPrev.removeClass("disabled");
            btnNext.removeClass("disabled");
        }
    },

    getDataForCurrentPage: function(structure){
        var data = this.pageWiseItems[this.currentPageIndex];

        if(data){
            return data;
        }

        //before render we need to split the data for better performance.
        var decidingRow = structure.rows[0];

        data = [];
        var count = 0;
        while(count < this.pageSize && this.nextItemIndex< this.options.pivotData.length){
            data.push(this.options.pivotData[this.nextItemIndex]);
            if((this.nextItemIndex === this.options.pivotData.length-1) || (this.options.pivotData.length <= this.pageSize) || (data[data.length -1][decidingRow] !== this.options.pivotData[this.nextItemIndex + 1][decidingRow])){
                count++;
            }

            this.nextItemIndex++;
        }

        this.pageWiseItems[this.currentPageIndex] = data;
        return data;
    },

    updateView: function (structure, pageData) {
        this.renderTable(structure, pageData);
        this.enableDisableNavigationButtons();
    },

    showNextItems: function() {
        if (this.element.parent().find(".fa-caret-right").closest('.btn').hasClass("disabled")) {
            return;
        }

        var data = this.pageWiseItems[this.currentPageIndex + 1];

        if(data){
            this.nextItemIndex += data.length;
        }

        this.currentPageIndex += 1;
        this.updateView(this.options.structure, this.getDataForCurrentPage(this.options.structure));
    },

    showPreviousItems: function(){
        if (this.element.parent().find(".fa-caret-left").closest('.btn').hasClass("disabled")) {
            return;
        }
        var data = this.pageWiseItems[this.currentPageIndex];

        if(data){
            this.nextItemIndex -= data.length;
        }
        this.currentPageIndex -= 1;
        this.updateView(this.options.structure, this.getDataForCurrentPage(this.options.structure));
    },

    sortData: function(data,row){
        data.sort(function(a, b){
            var a1= a[row].toLowerCase(), b1= b[row].toLowerCase();
            if(a1== b1) return 0;
            return a1> b1? 1: -1;
        });
    },

    configurePivot: function () {
        $$(this.options.pivotId).configure();
    },

    exportToExcel: function () {
        $$(this.options.pivotId).toExcel(Sentrana.Controllers.BIQController.generateUrl(Sentrana.Enums.PIVOT_EXPORT_URL));
    },

    getStructure: function () {
        return $$(this.options.pivotId).getStructure();
    },

    renderTable: function (structure, data) {

        this.element.find(this.options.pivotElement).html('');

        var that = this,
            html = '<div class="loading" ><p class="small-waitingwheel"><img src="images/loader-white.gif"/>&nbsp;Loading pivot analysis...</p></div>';
        this.options.app.blockElement(this.element.find(this.options.pivotElement), html);

        webix.i18n.pivot = {
            apply: "OK",
            cancel: "CANCEL",
            columns: "Columns",
            count: "count",
            fields: "Fields",
            filters: "Filters",
            max: "max",
            min: "min",
            operationNotDefined: "Operation is not defined",
            pivotMessage: '<div class="btn btn-sm btn-collapse-expand-all" state="1"><span class="fa fa-minus-square"></span> Collapse All</div>',
            rows: "Rows",
            select: "select",
            sum: "sum",
            text: "text",
            values: "Values",
            windowTitle: "Pivot Configuration",
            windowMessage: ""
        };

        setTimeout(function () {
            webix.ui({
                datatable: {
                    css: "pivotrows",
                    select: false,
                    select: false,
                    resizeColumn: false,
                    resizeRow: false,
                    on: {
                        'onBeforeRender': function () {
                            that.adjustTableColumnWidth();
                        }
                    }
                },
                popup: {
                    position: "center",
                    head: {
                        view: "toolbar",
                        cols: [{
                            view: "button",
                            label: "Apply",
                            width: 80,
                            click: function () {
                                var configWindow = $$(that.options.pivotId).getConfigWindow();
                                var structure = configWindow.getStructure();

                                //put some validation
                                if(structure.rows.length === 0){
                                    Sentrana.AlertDialog("Not enough rows selected.", "Please select at least one row for analysis.");
                                    return;
                                }

                                //if column is of number type then set format and alignment
                                $.each(structure.values, function(index, value){
                                    value.format = function(value){
                                        return value||'0.00';
                                    }
                                });

                                that.options.structure = structure;
                                that.resetParameters();
                                that.updateView(structure, that.getDataForCurrentPage(structure));
                                configWindow.hide();
                            }
                        },
                            {
                                view: "button",
                                label: "Cancel",
                                width: 80,
                                click: function () {
                                    $$(that.options.pivotId).getConfigWindow().hide();
                                }
                            }
                        ]
                    },
                    on: {
                        'onShow': function () {
                            $($(".webix_el_button button:contains('Cancel')")).removeClass("webixtype_base").addClass("btn btn-default");
                            $($(".webix_el_button button:contains('Apply')")).removeClass("webixtype_base").addClass("btn btn-primary");
                        }
                    }
                },
                view: "pivot",
                container: that.options.pivotContainer,
                id: that.options.pivotId,
                height: that.options.height,
                width: that.options.width,
                total: true,
                data: data,
                structure: structure,
                on:{
                    onHeaderInit: function(header){
                        for(var i =1; i < header.length; i++){
                            header[i].template = function(obj, type, value){
                                return value||'0.00';
                            }
                        }
                    }
                },
                ready: function () {

                    //Make all columns alignment to right (assuming all are metrics)
                    //TODO: may be we need to find a way to consider non metrics columns
                    var grid = this.$$("data");
                    var columns = grid.config.columns;
                    for (var i=1; i<columns.length; i++){
                        columns[i].cssFormat = function(value){return "text-right"; };
                    }
                    grid.refresh();

                    that.disableBuiltInDialog();
                    that.options.app.unBlockElement(that.element.find(that.options.pivotElement));
                    $$(that.options.pivotId).$$("data").attachEvent("onAfterRender", function () {
                        that.disableBuiltInDialog();
                        that.showHideCollapseExpandButton();
                    });

                    $$(that.options.pivotId).$$("data").attachEvent("onColumnResize", function () {
                        that.disableBuiltInDialog();
                        that.showHideCollapseExpandButton();
                    });

                    that.showHideCollapseExpandButton();
                }
            });

        }, 450);
    },

    adjustTableColumnWidth: function () {
        var columnCount = $$(this.options.pivotId).$$("data").config.columns.length;
        $$(this.options.pivotId).$$("data").config.columns[columnCount - 1].fillspace = true;
    },

    showHideCollapseExpandButton: function () {
        if ($$(this.options.pivotId).getFields().rows.length > 1) {
            this.element.find(".btn-collapse-expand-all").show();
        }
        else {
            this.element.find(".btn-collapse-expand-all").hide();
        }
    },

    disableBuiltInDialog: function () {
        this.element.find(".btn-collapse-expand-all").closest("tr").removeAttr("section");
        this.element.find(".btn-collapse-expand-all").parent().css("cursor", "default");
    },

    ".webix_el_select select change": function(el){
        var hasFilter = false;
        $(".webix_el_select select").each(function() {
           if($(this).val() !== ""){
               hasFilter = true;
           }
        });

        if(hasFilter) {
            //if has only one report then disable both button.
            var btnNext = this.element.parent().find(".fa-caret-right").closest('.btn'),
                btnPrev = this.element.parent().find(".fa-caret-left").closest('.btn');

            btnPrev.addClass("disabled");
            btnNext.addClass("disabled");
        }else{
            this.enableDisableNavigationButtons();
        }
    },

    ".btn-collapse-expand-all click": function (el) {
        var newState = $(el).attr('state') ^ 1,
            icon = newState ? "minus" : "plus",
            text = newState ? "Collapse" : "Expand";

        if ($(el).attr('state') === "0") {
            $$(this.options.pivotId).$$("data").openAll();
        }
        else {
            $$(this.options.pivotId).$$("data").closeAll();
        }

        var cssClass = "fa fa-" + icon + "-square";

        $(el).html("<span class=\"" + cssClass + "\"></span> " + text + " All");
        $(el).attr('state', newState);
    }
});
