can.Control.extend("Sentrana.Controllers.PageLayoutDemo", {
    pluginName: 'sentrana_page_layout_demo',
    defaults: {
        app: null
    }
}, {

    init: function () {
        this.element.html(can.view('templates/page-layout-demo.ejs'));        
        this.updateView();
    },

    updateView: function () {
        var menus = this.getMenu();
        this.pageLayoutControl = this.element.find(".demo-element").sentrana_layout_widget({
            app: this.options.app,
            leftMenus: menus
        }).control();

        var contentPanel = this.pageLayoutControl.getContentPanel();

        this.builderControl = contentPanel.sentrana_report_builder({
            app: this.options.app
        }).control();

    },

    " sidebar-collapsed": function () {
        //this.pageLayoutControl.deselectMenu();
    },

    saveDashboard: function(name){
        var that = this;
        var pageConfigList = this.builderControl.reportController.getPageList();
        
        // Set the height in each page object
        for (var i = 0; i < pageConfigList.length; i++) {
            var page = pageConfigList[i];
            var pageHeight = $('.sentrana-golden-layout-root', $('#' + page.id)).height();
            //var pageContainerHeight = $('.sentrana-golden-layout-root', $('#' + page.id)).parent().height();

            pageConfigList[i].height = pageHeight;
        }
        
        var dashBoard = {
            name: name,            
            pages: pageConfigList
        };

        var dashboardModel = new Sentrana.Models.Dashboard();
        dashboardModel.create(dashBoard,
            function success() {
                that.builderControl.populateDashboardList();
            },
            function error(xhr) {
                Sentrana.AlertDialog('Dashboard Exists!', xhr.responseText);
            });
    },

    " layout-page-main-menu-selected": function (el, ev, param) {
        switch (param.menuId) {
            case "menu-columns":
                if ($('#'+param.menuId).hasClass('active')) {
                    this.builderControl.showPopup(param.menuId);
                    this.pageLayoutControl.selectMenu(param.menuId);
                }
                else {
                    this.builderControl.hidePopup(param.menuId);
                    this.pageLayoutControl.deactivateMenu(param.menuId);
                }

                break;
            case "menu-filters":
                if ($('#'+param.menuId).hasClass('active')) {
                    this.builderControl.showPopup(param.menuId);
                    this.pageLayoutControl.selectMenu(param.menuId);
                }
                else {
                    this.builderControl.hidePopup(param.menuId);
                    this.pageLayoutControl.deactivateMenu(param.menuId);
                }
                break;
            case "menu-visualization":
                if ($('#'+param.menuId).hasClass('active')) {
                    this.builderControl.showPopup(param.menuId);
                    this.pageLayoutControl.selectMenu(param.menuId);
                }
                else {
                    this.builderControl.hidePopup(param.menuId);
                    this.pageLayoutControl.deactivateMenu(param.menuId);
                }

                break;
            case "menu-dashboard":
                if ($('#'+param.menuId).hasClass('active')) {
                    this.builderControl.showPopup(param.menuId);
                    this.pageLayoutControl.selectMenu(param.menuId);
                }
                else {
                    this.builderControl.hidePopup(param.menuId);
                    this.pageLayoutControl.deactivateMenu(param.menuId);
                }

                break;
            case "menu_save":
                var that = this;
                if ($("#save-dashboard").length) {
                    $("#save-dashboard").remove();
                }

                $("<div></div>").attr('id', 'save-dashboard').appendTo('body');
                $("#save-dashboard").html(can.view('templates/saveDashboard.ejs'));                

                var buttons = [                    
                    {
                        id: "btnClose",
                        label: "Close",
                        className: "btn-default",
                        callback: function () {
                            dialogControl.closeDialog();
                        }
                    },
                    {
                        id: "btnSave",
                        label: "Save",
                        className: "btn-primary",
                        callback: function () {
                            var dashboardName = $('#dashboardName').val();
                            that.saveDashboard(dashboardName);
                            dialogControl.closeDialog();
                        }
                    }
                ];

                var dialogControl = $("#save-dashboard").sentrana_dialog({
                    app: this,
                    title: 'New Dashboard',
                    buttons: buttons,
                    closeOnEscape: true,
                    modal: true,
                    autoOpen: true
                }).control();

                setTimeout(function () {
                    $('#dashboardName').focus();
                }, 500);                

                break;

            case "menu_refresh":
                $.ajax({
                    url: Sentrana.Controllers.BIQController.generateUrl("Dashboards"),
                    type: "GET",
                    dataType: "json",
                    headers: {
                        sessionID: Sentrana.Controllers.BIQController.sessionID,
                        repositoryID: Sentrana.Controllers.BIQController.repositoryID
                    },
                    success: function(data){
                        console.log('Success');
                        console.log(data.length)
                    },
                    error: function(){
                        console.log('Failed');
                    }
                });

                break;
            case "menu_preview":

                var reportPageController = this.builderControl.reportController.reportPage;
                if (reportPageController && reportPageController.pageElementList.length > 0) {
                    reportPageController.showPreview();
                } else {
                    Sentrana.AlertDialog('Preview', 'Report element is not available for preview!');
                }

                break;            
        }

    },

    " layout-page-main-menu-toggled": function (el, ev, param) {
        //var that = this;
        //setTimeout(function() {
        //    that.golden.updateSize();
        //}, 500);
    },

    getMenu: function () {
        var menus = [];
        var menuColumns = {
            id: "menu-columns",
            text: "Data Selection",
            title: "Click to open Columns",
            cssClass: "fa-columns"
        };

        var menuFilters = {
            id: "menu-filters",
            text: "Filters",
            title: "Click to open filters",
            cssClass: "fa-filter"
        };

        var menuVisualization = {
            id: "menu-visualization",
            text: "Visualization",
            title: "Click to open visualization",
            cssClass: "fa-line-chart"
        };

        var menuDashboard = {
            id: "menu-dashboard",
            text: "Dashboard List",
            title: "Click to open dashboard list",
            cssClass: "fa-dashboard"
        };

        var menuActions = {
            id: "menu-actions",
            text: "Actions",
            title: "Click to open action buttons",
            cssClass: "fa-toggle-right",
            menus: [
                {
                    id: "menu_save",
                    text: "Save",
                    title: "Save",
                    cssClass: "fa-save"
                },
                {
                    id: "menu_saveall",
                    text: "Save All",
                    title: "Save All",
                    cssClass: "fa-copy"
                },
                {
                    id: "menu_refresh",
                    text: "Refresh",
                    title: "Refresh",
                    cssClass: "fa-refresh"
                },
                {
                    id: "menu_publish",
                    text: "Publish",
                    title: "Publish",
                    cssClass: "fa-send-o"
                },
                {
                    id: "menu_preview",
                    text: "Preview",
                    title: "Preview",
                    cssClass: "fa-eye"
                }
            ]
        };

        menus.push(menuVisualization);
        menus.push(menuColumns);
        menus.push(menuFilters);
        menus.push(menuActions);
        menus.push(menuDashboard);

        return menus;
    }
});



