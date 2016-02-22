can.Control.extend("Sentrana.Controllers.PivotAnalysis", {
    pluginName: 'sentrana_pivot_analysis',
    defaults: {
        app: null
    }
}, {

    init: function () {
        this.updateView();
        this.updateChartView();
    },

    updateChartView: function () {
        this.currentView = "chart";
        this.$pivotChart.show();
        this.$pivotTable.hide();
        if (this.$pivotChart.control()) {
            this.$pivotChart.control().destroy();
        }
        this.$pivotChart.sentrana_pivot_chart_control({
            app: this.options.app,
            data: this.options.data
        });
        
        this.showHideMenu(this.$configurePivotMenu, false);
        this.showHideMenu(this.$exportChartMenu, true);
        this.showHideMenu(this.$exportTableMenu, false);
        this.$nextButton.hide();
        this.$prevButton.hide();
    },

    showHideMenu: function(menu, visible) {
        if (menu) {
            if (visible) {
                menu.show();
            } else {
                menu.hide();
            }
        }
    },

    updateView: function () {
        this.element.html(can.view('templates/pivot-table-container.ejs'));
        this.element.find("button").button();
        this.pivotTableColupsible = this.element.find(".pivot-table-container-header").sentrana_collapsible_container({
            title: "Pivot Analysis",
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            callBackFunctionOnExpand: this.resizePivotControl
        }).control();

        this.pivotTableColupsible.addButtonToBar({
            "title": "Show table view",
            "cls": "fa-table",
            "eventType": "change_pivot_view",
            "dropdown": false
        });

        this.pivotTableColupsible.addButtonToBar({
            "title": "Pivot options",
            "cls": "fa-tasks",
            "eventType": "pivot_options",
            "dropdown": true,
            "menuItems": [{
                id: "configure_pivot",
                name: "Configure Pivot Analysis"
            }, {
                id: "maximize_pivot",
                name: "Maximize Pivot Analysis"
            },
            {
                 id: "export_pivot_table",
                 name: "Download pivot table"
            }, {
                id: "export_pivot_chart",
                name: "Download pivot chart",
                submenuItems: [{
                    id: "exportChart_png",
                    name: "Download PNG"
                }, {
                    id: "exportChart_jpeg",
                    name: "Download JPEG"
                }, {
                    id: "exportChart_pdf",
                    name: "Download PDF"
                }]
            }]
        });

        this.pivotTableColupsible.addButtonToBar({
            "title": "Previous",
            "cls": "fa-caret-left",
            "eventType": "move_prev",
            "dropdown": false
        });

        this.pivotTableColupsible.addButtonToBar({
            "title": "Next",
            "cls": "fa-caret-right",
            "eventType": "move_next",
            "dropdown": false
        });
        
        this.$pivotChart= this.element.find(".pivot-chart");
        this.$pivotTable = this.element.find("#pivot-table");
        this.$configurePivotMenu = $('.container-button-menu[elementid="configure_pivot"]');
        this.$exportChartMenu = $('.container-button-menu[elementid="exportChart_png"]').closest(".dropdown-submenu");
        this.$exportTableMenu = $('.container-button-menu[elementid="export_pivot_table"]');
        this.$nextButton = this.element.find('.fa-caret-right').closest('.cc-button');
        this.$prevButton = this.element.find('.fa-caret-left').closest('.cc-button');
    },

    updateTableView: function () {
        this.currentView = "table";
        this.$pivotChart.hide();
        this.$pivotTable.show();

        this.pivotData = this.getPivotData();
        this.maximizePivotDlg = this.element.find("#maximize-pivot-dlg").sentrana_dialogs_maximize_pivot({
            app: this.options.app,
            dialogDimension: Sentrana.getMaxViewDialogDimension(),
            pivotData: this.getPivotData()
        }).control();

        if (this.pivotControl && !this.pivotControl._destroyed) {
            this.pivotControl.destroy();
        }

        this.pivotControl = this.element.find(".pivot-table-renderer").sentrana_pivot_control({
            app: this.options.app,
            structure: this.getInitialStructure(),
            pivotData: this.getPivotData(),
            pivotElement: '#pivot-table',
            pivotContainer: "pivot-table",
            pivotId: "pivot"
        }).control();

        this.showHideMenu(this.$configurePivotMenu, true);
        this.showHideMenu(this.$exportChartMenu, false);
        this.showHideMenu(this.$exportTableMenu, true);
        this.$nextButton.show();
        this.$prevButton.show();
    },

    resizePivotControl: function () {
        if (this.currentView === "table") {
            $$("pivot").resize();
        } else{
            if (this.$pivotChart && this.$pivotChart.control()) {
                this.$pivotChart.control().resizePivotControl();
            }
        }
    },

    " change_pivot_view": function (el, ev, params) {
        var title, icon, updatedTitle;
        switch (this.currentView) {
            case "chart":
                this.updateTableView();
                title = "Show table view";
                updatedTitle = "Show chart view";
                icon = "fa-bar-chart-o";
                break;
            default:
                this.updateChartView();
                title = "Show chart view";
                updatedTitle = "Show table view";
                icon = "fa-table";
                break;
        }
        
        var $ccButton = $(el).find(".cc-button[title='" + title + "']");
        var $icon = $ccButton.find(".fa");
        $icon.removeClass("fa-bar-chart-o fa-table");
        $icon.addClass(icon);
        $ccButton.attr("title", updatedTitle);

    },

    

    " pivot_options": function (el, ev, params) {
        switch (params.type) {
        case "configure_pivot":
            this.pivotControl.configurePivot();
            break;
        case "maximize_pivot":
            if (this.currentView === "table") {
                this.maximizePivotDlg.open(this.pivotControl.getStructure());
            } else {
                this.maximizeChart();
            }
            break;
        case "export_pivot_table":
            this.pivotControl.exportToExcel();
            break;
        case "exportChart_png":
            this.exportPivotChart("png");
            break;
        case "exportChart_jpeg":
            this.exportPivotChart("jpeg");
            break;
        case "exportChart_pdf":
            this.exportPivotChart("pdf");
            break;

        default:
            break;
        }
    },

    " move_prev": function () {
        this.options.app.handleUserInteraction();
        this.pivotControl.showPreviousItems();

    },

    " move_next": function () {
        this.options.app.handleUserInteraction();
        this.pivotControl.showNextItems();
    },

    maximizeChart: function () {
        if (!this.$pivotChart || !this.$pivotChart.control()) {
            return;
        }

        this.$pivotChart.control().maximizeChart();
    },

    exportPivotChart: function (type) {
        this.options.app.handleUserInteraction();
        
        if (!this.$pivotChart || !this.$pivotChart.control()) {
            return;
        }
        
        this.$pivotChart.control().exportChart(type);
    },

    getPivotData: function () {
        var colInfos = this.options.data.colInfos,
            rows = this.options.data.rows,
            item, pivotData = [];

        for (var i = 0; i < rows.length; i++) {
            item = {};
            for (var j = 0; j < colInfos.length; j++) {
                if (colInfos[j].colType === "METRIC") {
                    item[colInfos[j].title] = rows[i].cells[j].rawValue;
                }
                else {
                    item[colInfos[j].title] = rows[i].cells[j].fmtValue;
                }

            }
            pivotData.push(item);
        }

        return pivotData;
    },

    getColumn: function (colType, except) {
        var colInfos = this.options.data.colInfos;
        for (var i = 0; i < colInfos.length; i++) {
            if (colInfos[i].colType === colType && except != i) {
                return {
                    col: colInfos[i],
                    index: i
                };

            }
        }
    },

    getInitialStructure: function () {
        var row = this.getColumn("ATTRIBUTE", -1),
            rows = [row.col.title],
            col = this.getColumn("ATTRIBUTE", row.index),
            cols = [col.col.title],
            val = this.getColumn("METRIC", -1),
            vals = [{
                name: val.col.title,
                operation: "sum",
                format: webix.Number.format
            }];

        return {
            rows: rows,
            columns: cols,
            values: vals,
            filters: []
        };
    }

});
