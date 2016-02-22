steal("lib/sentrana/WidgetsBase/WidgetsControlBase.js", function () {
    Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.PageWidget", {
        pluginName: 'sentrana_page_widget',
        defaults: {
            basePath: "lib/sentrana/PageWidget",
            templatesPath: "templates",
            tmplInit: "page-container.ejs",
            tmplPageContent: "page-content.ejs",
            tmplPageItem: "page-item.ejs",
            isEditMode: true,
            spreadLayout: false,
            pageTitle: 'Page Title'
        }
    },
    {
        init: function (element, options) {
            this.pageIdPrefix = this.getPageIdPrefix();
            this.updateView();
        },

        update: function(options) {
            this._super(options);
            this.pageIdPrefix = this.getPageIdPrefix();
            this.updateView();
        },

        getPageIdPrefix: function () {
            var pluginName = 'sentrana_page_widget';
            var count = $('.' + pluginName) ? $('.' + pluginName).length : 0;
            var pageIdPrefix = pluginName + "_" + count + "_page_";
            return pageIdPrefix;
        },

        updateView: function () {
            this.element.html(can.view(this.getTemplatePath(this.options.tmplInit), {}));
            this.pageItemContainer = this.element.find(".page-item");
            this.pageContentContainer = this.element.find(".page-content");

            // Initialize reoder pages
            this.reOrderPages();

            if (this.options.reportModel && this.options.reportModel.pages.length === 0) {
                this.addPage();
            } else {
                this.renderPages();
            }
        },

        reOrderPages: function () {
            var that = this;
            $("#tabs").tabs().find("ul").sortable({
                axis: "x",
                items: "li:not(.unsortable)",
                update: function (e, ui) {
                    var pageIdList = [];
                    $("#tabs > ul > li > a").each(function(i){
                        var pageId = $(this).parent().closest('.page-tab').attr('pageId');
                        if (pageId) {
                            pageIdList.push(pageId);
                        }                        
                    });                    

                    // Re-order the object list
                    that.setPageOrder(pageIdList);
                }
            });            
        },

        setPageOrder: function (pageIdList) {
            var pageList = [];
            for (var i = 0; i < pageIdList.length; i++) {
                var page = this.getPageById(pageIdList[i]);
                if (page) {
                    pageList.push(page);
                }
            }
            this.options.reportModel.pages = pageList;
        },

        sortNumber: function (a, b) {
            return a - b;
        },

        getPageId: function () {
            var pageId = 1;
            var pageIdList = [];

            for (var i = 0; i < this.options.reportModel.pages.length; i++) {
                var page = this.options.reportModel.pages[i];
                var pageCountIndex = page.id.lastIndexOf("_") + 1;
                var pageIndex = page.id.substr(pageCountIndex);

                pageIdList.push(parseInt(pageIndex, 10));
            }

            pageIdList.sort(this.sortNumber);

            if (pageIdList.length > 0) {
                var maxPageId = pageIdList[pageIdList.length - 1];
                pageId = maxPageId + 1;
            }

            return pageId;
        },

        getPageList: function(){            
            return this.options.reportModel.pages;            
        },

        getFirstPageId: function(){
            if (this.options.reportModel.pages.length > 0) {
                return this.options.reportModel.pages[0].id;
            }
                     
            return null;
        },

        addPage: function () {
            var that = this;
            var page = new Sentrana.Models.PageModel();
            var pageId = this.getPageId();
            page.id = this.pageIdPrefix + pageId;
            page.title = this.options.pageTitle + ' ' + pageId;
            page.reportElements = [];

            // Add page object to the object list
            this.options.reportModel.pages.push(page);
            
            // Render page item
            var pageCount = this.options.reportModel.pages.length;
            $(this.pageItemContainer).html(can.view(this.getTemplatePath(this.options.tmplPageItem), { pageList: this.options.reportModel.pages, isEditMode: this.options.isEditMode, pageCount: pageCount }));

            // Render page content
            $(this.pageContentContainer).append(can.view(this.getTemplatePath(this.options.tmplPageContent), { pageId: page.id }));

            // Active newly added page            
            setTimeout(function () {
                that.activePage(page.id);
            }, 1);            
        },

        renderPages: function () {

            var pages = this.options.reportModel.pages;
            if (pages && pages.length > 0) {

                // Render page item
                var pageCount = this.options.reportModel.pages.length;
                $(this.pageItemContainer).html(can.view(this.getTemplatePath(this.options.tmplPageItem), { pageList: this.options.reportModel.pages, isEditMode: this.options.isEditMode, pageCount: pageCount }));
                if(this.options.spreadLayut) {
                    $.each($(this.pageItemContainer).find("li"), function(index, value) {
                        value.style.width = "calc(100% / " + pages.length + ")";
                        $(value).find("a")[0].style.width = "100%";
                    });
                }

                // Render page content
                for (var i = 0; i < pages.length; i++) {
                    var page = pages[i];
                    $(this.pageContentContainer).append(can.view(this.getTemplatePath(this.options.tmplPageContent), { pageId: page.id }));
                }

                // Active newly added page
                var that = this;
                setTimeout(function () {
                    that.activePage(pages[0].id);
                }, 10);
            }
        },

        activePage: function (pageId) {
            $('.page-tab', this.pageItemContainer).removeClass('active');
            $('.tab-pane', this.pageContentContainer).removeClass('active');
            $('.page-item-' + pageId, this.pageItemContainer).addClass('active');
            $('#' + pageId, this.pageContentContainer).addClass('active');

            can.trigger(this.element, 'setReportPage');
        },

        getSelectedPageId: function () {
            return this.element.find(".page-tab.active").attr("pageId");
        },

        getPageById: function (pageId) {
            var pages = this.options.reportModel.pages;
            if (pages && pages.length > 0) {
                for (var i = 0; i < pages.length; i++) {
                    if (pages[i].id === pageId) {
                        return pages[i];
                    }
                }
            }
            return null;
        },

        //"{reportModel} change": function (dataObj, ev, attr, how, newVal, oldVal) {
        //    var that = this;
        //    switch (how) {
        //        case "add":

        //            // Render page item
        //            var pageCount = this.options.reportModel.pages.length;
        //            $(this.pageItemContainer).html(can.view(this.getTemplatePath(this.options.tmplPageItem), { pageList: this.options.reportModel.pages, isEditMode: this.options.isEditMode, pageCount: pageCount }));

        //            // Render page content
        //            var newPage = newVal[0];
        //            var newPageId = newVal[0].id;
        //            $(this.pageContentContainer).append(can.view(this.getTemplatePath(this.options.tmplPageContent), { pageId: newPageId }));

        //            // Active newly added page
        //            setTimeout(function () {
        //                that.activePage(newPageId);
        //            }, 1);

        //            break;
        //        case "remove":
        //            var removedPageId = oldVal[0].id;
        //            $('#' + removedPageId).remove();
        //            $('.page-item-' + removedPageId).remove();
                    
        //            // Active page
        //            var selectedPageId = this.getSelectedPageId();
        //            if (selectedPageId) {
        //                setTimeout(function () {
        //                    $('.page-item-' + selectedPageId).removeClass('active').addClass('active');
        //                    that.hideCloseButtonForSingleTab();
        //                }, 1);
        //            }
        //            else {                        
        //                setTimeout(function () {
        //                    that.activePage(that.getFirstPageId());
        //                    that.hideCloseButtonForSingleTab();
        //                }, 1);                        
        //            }


        //            break;
        //        default:
        //            break;
        //    }
        //},

        hideCloseButtonForSingleTab: function(){
            if (this.options.reportModel.pages.length === 1) {
                $('.closeTab', this.element).hide();
            }
        },

        titleEditMode: function (isEditMode) {
            if (this.selectedTabLabel && this.selectedTabInput) {
                if (isEditMode) {
                    this.selectedTabInput.show();
                    this.selectedTabLabel.hide();
                }
                else {
                    this.selectedTabInput.hide();
                    this.selectedTabLabel.show();
                }
            }
        },

        updatePageTitle: function (pageId, title) {
            for (var i = 0; i < this.options.reportModel.pages.length; i++) {
                if (this.options.reportModel.pages[i].id === pageId) {
                    this.options.reportModel.pages[i].title = title;
                    this.selectedTabLabel.html(title);
                    break;
                }
            }
        },

        ".page-property click": function (el, ev) {

            this.propertyModel = new PagePropertyModel();
            var propertyContainer = $(".page-property-container", this.element);

            if ($(propertyContainer).control()) {
                $(propertyContainer).control().destroy();
                $(propertyContainer).empty();
            }

            $(propertyContainer).page_property({ pageController: this, propertyModel: this.propertyModel });
        },

        ".add-page click": function (el, ev) {
            this.addPage();
        },

        ".page-tab dblclick": function (el, ev) {
            if (this.options.isEditMode) {
                var pageId = $(el).attr('pageId');
                this.selectedPageId = pageId;
                this.selectedTabInput = $('.titleInput', el);
                this.selectedTabLabel = $('.titleLabel', el);
                this.titleEditMode(true);
                this.selectedTabInput.focus();
            }            
        },

        ".page-tab click": function (el, ev) {

            // Hide all tab's title inputbox and show label
            $('.titleLabel', $('#tabs')).show();
            $('.titleInput', $('#tabs')).hide();

            var pageId = el.attr('pageid');
            can.trigger(this.element, 'setReportPageActive', pageId);
        },

        ".titleInput click": function (el, ev) {            
            ev.preventDefault();
            ev.stopPropagation();
        },

        ".titleInput blur": function (el, ev) {

            if (this.selectedTabInput.val()) {
                this.updatePageTitle(this.selectedPageId, this.selectedTabInput.val());
                this.titleEditMode(false);
            }            
        },

        ".closeTab click": function (el, ev) {

            var removePageId = '';

            //// Remove from Dom
            //var tabContentId = $(el).parent().attr("href");
            //$(el).parent().parent().remove(); //remove li of tab
            //$(tabContentId).remove(); //remove respective tab content

            // Remove from object
            var removePageIndex = 0;
            var pageId = $(el).parent().closest('.page-tab').attr('pageId');
            for (var i = 0; i < this.options.reportModel.pages.length; i++) {
                if (this.options.reportModel.pages[i].id === pageId) {
                    removePageIndex = i;
                    removePageId = pageId;
                    break;
                }
            }

            this.options.reportModel.pages = jQuery.grep(this.options.reportModel.pages, function (value) {
                return value.id != removePageId;
            });

            // Remove page tab and content
            $('#' + removePageId).remove();
            $('.page-item-' + removePageId).remove();

            // Active page
            var that = this;
            var selectedPageId = this.getSelectedPageId();
            if (selectedPageId) {
                setTimeout(function () {
                    $('.page-item-' + selectedPageId).removeClass('active').addClass('active');
                    $('#' + selectedPageId).removeClass('active').addClass('active');
                    that.hideCloseButtonForSingleTab();
                }, 1);
            }
            else {                        
                setTimeout(function () {
                    that.activePage(that.getFirstPageId());
                    that.hideCloseButtonForSingleTab();
                }, 1);                        
            }            
        },


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
        }
    });
});
