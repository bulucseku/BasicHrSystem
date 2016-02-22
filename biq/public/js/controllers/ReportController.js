can.Control.extend("Sentrana.Controllers.ReportController",
{
    pluginName: 'sentrana_report',
    defaults: {
    }
},
{
    init: function () {
        this.updateView();
    },

    update: function () {
        this.updateView();
    },

    updateView: function () {
        this.element.find('.analytic-page-container').remove();
        this.element.append('<div class="analytic-page-container"></div>');
        
        this.pageControl = this.element.find('.analytic-page-container').sentrana_page_widget({
            app: this.options.app,
            reportModel: this.options.reportModel,
            pageTitle: 'Page',
            isEditMode: true            
        }).control();
    },

    getPageLayoutConfig: function(pageId){

        if (this.options.reportModel && this.options.reportModel.pages.length > 0) {
            for (var i = 0; i < this.options.reportModel.pages.length; i++) {
                if (this.options.reportModel.pages[i].id === pageId)
                    return this.options.reportModel.pages[i].layoutConfig;
            }
        }

        return null
    },

    getPageList: function(){

        var pageList = [];
        var pageObjList = this.pageControl.getPageList();

        for (var i = 0; i < pageObjList.length; i++) {
            var page = {};
            page.id = pageObjList[i].id;
            page.name = pageObjList[i].title;            
            page.height = pageObjList[i].height;
            page.order = 0;

            var pageControl = $('#' + pageObjList[i].id).sentrana_report_page({ pageModel: new Sentrana.Models.PageModel().id = pageObjList[i].id, app: this.options.app, pageHeight: pageObjList[i].height }).control();
            if (pageControl) {
                var layoutConfig = pageControl.reportElementContainer.layout.toConfig();

                if (layoutConfig) {
                    page.layoutConfig = JSON.stringify(layoutConfig);
                }
            }

            pageList.push(page);
        }

        return pageList;
    },
    
    " setReportPage": function (ev, el) {        
        var selectedPageId = this.getSelectedPageId();
        var control = $('#' + selectedPageId).control();
        if (!control) {
            var pageObj = new Sentrana.Models.PageModel();
            pageObj.id = selectedPageId;
            pageObj.layoutConfig = this.getPageLayoutConfig(selectedPageId);
            this.reportPage = $('#' + selectedPageId).sentrana_report_page({ pageModel: pageObj, app: this.options.app, pageHeight: pageObj.height }).control();

            // Load all pages
            this.loadPageReport();

        } else {
            control.updateSize();
        }        
    },

    " setReportPageActive": function (ev, el, selectedPageId) {
        var control = $('#' + selectedPageId).control();
        var pageObj = new Sentrana.Models.PageModel();
        pageObj.id = selectedPageId;
        pageObj.layoutConfig = this.getPageLayoutConfig(selectedPageId);
        this.reportPage = $('#' + selectedPageId).sentrana_report_page({ pageModel: pageObj, app: this.options.app, pageHeight: pageObj.height }).control();
        this.pageControl.activePage(selectedPageId);

        // Select/deselect the metric/attribute based on selected report
        this.reportPage.setReportSelection();
    },

    loadPageReport: function(){
        var pageList = this.pageControl.getPageList();
        for (var i = 0; i < pageList.length; i++) {
            var pageId = pageList[i].id;
            
            var pageObj = new Sentrana.Models.PageModel();
            pageObj.id = pageId;
            pageObj.layoutConfig = this.getPageLayoutConfig(pageId);

            if (!$('#' + pageId).control()) {
                $('#' + pageId).sentrana_report_page({ pageModel: pageObj, app: this.options.app, pageHeight: pageObj.height }).control();
            }

            // Set the page height
            var pageHeight = pageList[i].height;
            $('.sentrana-golden-layout-root', $('#' + pageId)).css('height', pageHeight + 'px');
            $('.sentrana-golden-layout-root', $('#' + pageId)).parent().css('height', pageHeight + 50 + 'px');
        }
    },

    getSelectedPageId: function() {        
        return this.pageControl.getSelectedPageId();
    },

    updateSize: function () {
        var pageId = this.getSelectedPageId();
        if(pageId){
            $("#" + pageId).control().updateSize();
        }

    },

    updateReportElement: function(columnId, how){
        var pageId = this.getSelectedPageId();
        if(pageId){
            $("#" + pageId).control().updateReportElement(columnId, how);
        }

    },

    addReportElement: function (elementType, icon) {
        var pageId = this.getSelectedPageId();
        if(pageId){
            $("#" + pageId).control().addReportElement(elementType, icon);
        }
    }    

});