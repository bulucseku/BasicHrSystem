can.Control.extend("Sentrana.Controllers.ReportBuilder", {
    pluginName: 'sentrana_report_builder',
    defaults: {
        app: null,
        sideBarWidth: 280
    }
}, {
    init: function reportBuilderInit() {
        this.loadInitialView();
        this.initDOMObjects();
        this.initModels();
        this.initControls();
        this.modifyDOMObjects();
        this.makeColumnDraggable();

        this.reportController = this.element.find(".analytic-report-elements").sentrana_report({ app: this.options.app, reportModel: new Sentrana.Models.ReportModel() }).control();

        var sidebars = [
            {
                id: 'dataSelection',
                title: "Data Selection",
                container:  this.$leftCol,
                headerIconClass: '',
                headerCssClass: '',
                position: 'left'
            },
            {
                id: 'filters',
                title: "Filters",
                container:  this.$rightCol,
                headerIconClass: '',
                headerCssClass: '',
                position: 'left'
            },
            {
                id: 'visualization',
                title: "Visualization",
                container:  this.$visualizationCol,
                headerIconClass: '',
                headerCssClass: '',
                position: 'left'
            },
            {
                id: 'dashboardList',
                title: "Dashboard List",
                container:  this.$dashboardListCol,
                headerIconClass: '',
                headerCssClass: '',
                position: 'left'
            }
        ];

        var that = this;

        this.dockableControl = $(".report-builder").sentrana_dockable_content(
            {
                sidebars: sidebars,
                marginTop: 46,
                marginBottom: 0,
                callBackFunctionOnLayoutChange: function(){
                    that.updateSize();
                }
            }).control();

    },

    loadDashboard: function(dashboard){
        if (dashboard && dashboard.pages) {

            var reportModel = new Sentrana.Models.ReportModel();
            for (var i = 0; i < dashboard.pages.length; i++) {
                var page = new Sentrana.Models.PageModel();
                page.id = dashboard.pages[i].Id;
                page.title = dashboard.pages[i].Name;
                page.layoutConfig = dashboard.pages[i].LayoutConfig;
                page.height = dashboard.pages[i].Height;
                reportModel.pages.push(page);
            }

            if (this.reportController) {
                this.reportController.destroy();
            }            

            this.reportController = this.element.find(".analytic-report-elements").sentrana_report({ app: this.options.app, reportModel: reportModel }).control();
        }
    },
    " dashboard-item-clicked": function (el, ev, dashboard) {
        this.loadDashboard(dashboard);
    },

    " action-button-clicked": function (el, ev, param) {
        switch (param.action) {
            case "save":
                alert('save clicked');
                break;
            case "save-as":
                break;
            case "refresh":
                break;
            case "publish":
                break;
            default:
        }
    },

    " visualization_element-selected": function (el, ev, param) {
        this.reportController.addReportElement(param.type, param.icon);
    },

    makeColumnDraggable: function() {
        this.$leftCol.find(".object-selector-wrapper").draggable({
            helper: "clone",
            appendTo: ".report-builder",
            stack: ".report-builder",
            cursor: "move",
            containment: ".report-builder"
        });
    },

    loadInitialView: function() {
        this.element.html(can.view('templates/report-builder.ejs', {}));
    },

    initDOMObjects: function () {
        this.$reoprtBuilder = this.element.find(".report-builder");
        this.$leftCol = this.$reoprtBuilder.find('.report-column');
        this.$rightCol = this.$reoprtBuilder.find('.report-filter');

        this.$actionButtonCol = this.$reoprtBuilder.find('.report-actionButton');
        this.$visualizationCol = this.$reoprtBuilder.find('.report-visualization');
        this.$dashboardListCol = this.$reoprtBuilder.find('.report-dashboardList');

        this.$contentCol = this.$reoprtBuilder.find('.contentcolumn');

        this.$dashboardList = this.$leftCol.find('.dashboardList');
    },

    modifyDOMObjects: function () {
        this.$leftCol.height(this.element.find(".dockablePanel-left").height() + "px");
    },

    showPopup: function(menuId){
        if (menuId === 'menu-columns') {
            this.dockableControl.showSideBar('dataSelection');
        }
        else if (menuId === 'menu-filters') {
            this.dockableControl.showSideBar('filters');
        }
        else if (menuId === 'menu-visualization') {
            this.dockableControl.showSideBar('visualization');

        }else if (menuId === 'menu-dashboard') {
            this.dockableControl.showSideBar('dashboardList');
        }
    },

    hidePopup: function(menuId){
        if (menuId === 'menu-columns') {
            this.dockableControl.hideSideBar('dataSelection');
        }
        else if (menuId === 'menu-filters') {
            this.dockableControl.hideSideBar('filters');
        }
        else if (menuId === 'menu-visualization') {
            this.dockableControl.hideSideBar('visualization');

        }else if (menuId === 'menu-dashboard') {
            this.dockableControl.hideSideBar('dashboardList');
        }
    },

    updateSize: function () {
        this.reportController.updateSize();
    },

    initModels: function () {
        var that = this;
        this.model = new Sentrana.Models.Report({
            app: this.options.app
        });

        this.reportDefnModel = new Sentrana.Models.ReportDefin({
            app: this.options.app
        });

        this.dwSelection = new Sentrana.Models.ObjectSelection().bind("change", function (ev, attr, how, newVal, oldVal) {
            // Is this an object being selected?
            if (how === "add") {
                that.updateReportElement(newVal, how);
            }
            else if (how === "remove") {
                that.updateReportElement(oldVal, how);
            }
        });

        this.reusableColumnModel = new Sentrana.Models.ReusableColumnInfo();

        this.resultDataModel = new Sentrana.Models.ResultDataModel({
            app: this.options.app
        });

        this.executionMonitorModel = new Sentrana.Models.ExecutionMonitor({
            app: this.options.app,
            reportDefinModel: this.reportDefnModel,
            resultDataModel: this.resultDataModel,
            resultOptions: []
        });
    },

    "input[type=checkbox] change": function (el, ev) {
        var that = this;
        var hid = $(el).attr('hid');
        var isChecked = $(el).is(':checked');

        var how = isChecked ? 'add' : 'remove';
        this.updateReportElement(hid, how);
    },

    initControls: function() {
        this.$leftCol.sentrana_report_columns({
            app: this.options.app,
            dwSelection: this.dwSelection
        });

        this.$rightCol.sentrana_report_filter_container({
            app: this.options.app,
            model: this.model,
            dwSelection: this.dwSelection
        });

        this.$actionButtonCol.sentrana_report_action_button({
            app: this.options.app,
            model: this.model,
            dwSelection: this.dwSelection
        });

        this.$visualizationCol.sentrana_report_visualization({
            app: this.options.app,
            model: this.model,
            dwSelection: this.dwSelection
        });

        this.populateDashboardList();
    },

    populateDashboardList: function(){
        this.$dashboardListCol.sentrana_report_dashboard_list({
            app: this.options.app,
            model: this.model,
            dwSelection: this.dwSelection
        });

    },

    updateReportElement: function (columnId, how) {
        this.reportController.updateReportElement(columnId, how);
    },

    " report_element_selected": function (el, ev, reportDefnModel) {
        var that = this;

        //unbind then selection event handlers
        // Create a Model instance that records the current objects selected from the DW Repository...
        this.dwSelection.unbind('change');

        //clear all the check box selection
        this.$leftCol.find("input:checkbox").prop('checked', false);

        //select the check boxes
        $.each( reportDefnModel.templateUnits, function( index, templateUnit ) {
            that.$leftCol.find('input:checkbox[hid="'+ templateUnit.hid+ '"]').prop('checked', true);
        });
    },

    " clear_report_selection": function(){
        this.dwSelection.unbind('change');

        //clear all the check box selection
        this.$leftCol.find("input:checkbox").prop('checked', false);
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
    },

    "{window} resize": function(){
        this.updateSize();
    }
});