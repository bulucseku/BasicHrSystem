
can.Control.extend("Sentrana.Controllers.ReportPageController",
{
    pluginName: 'sentrana_report_page',
    defaults: {
        pageModel: null        
    }
},
{
    init: function () {
        this.dimensionWidth = 200;
        this.dimensionHeight = 200;
        this.elementControlsMap = {};
        this.pageElementList = [];
        this.elementContainerList = [];
        this.initializeGoldenLayout();
    },
    
    showPreview: function () {
        var that = this;
        var dialogWidth = $(window).width() - 30,
            dialogHeight = $(window).height() - 60;

        if ($(document).height() <= $(window).height()) {
            // Disable window scrolling when maximize view is closed
            Sentrana.DisableWindowScroll();
        }


        var container = this.element;
        $(container).dialog({
            autoOpen: false,
            modal: true,
            width: dialogWidth,
            height: dialogHeight,
            resizable: false,
            dialogClass: "ui-dialog-max-view",
            buttons: {},
            create: function () {                
            },
            open: function () {

                // Adding close button
                $(container).prepend('<div class="maximize-close-icon"></div>');

                // Add a wrapper over the report area to make it read only
                $(container).prepend('<div class="report-wrapper"></div>');

                // Hide the header
                $('.lm_header', container).hide();
                $('.lm_goldenlayout', container).addClass('white-bg');

                // Resize the report
                that.updateSize();

                $('.tab-pane').addClass('open-preview');
                $('.ui-dialog').addClass('clearfix');
                
                if (!$.browser.chrome) {
                    $('.ui-dialog').addClass('adjust-preview-top');
                }
            },
            close: function () {

                // Enable window scrolling when maximize view is closed
                Sentrana.EnableWindowScroll();

                // Destroy the dialog
                $(container).dialog("destroy");

                // Place the container back to the position
                $(this).appendTo($(container).parent());

                // Remove close icon
                $('.maximize-close-icon', $(container)).remove();

                // Remove the wrapper
                $('.report-wrapper', $(container)).remove();

                // Show the header
                $('.lm_header', container).show();
                $('.lm_goldenlayout', container).removeClass('white-bg');
                
                // Resize the report
                that.updateSize();

                $('.tab-pane').removeClass('open-preview');
                $('.ui-dialog').removeClass('clearfix');

                if (!$.browser.chrome) {
                    $('.ui-dialog').removeClass('adjust-preview-top');
                }
            }
        });

        $(container).dialog("open");
    },    

    ".maximize-close-icon click": function (el, ev) {
        this.closeMaximizeWindow();
    },

    closeMaximizeWindow: function () {
        var container = this.element;
        var isDialogOpen = $(container).dialog("isOpen");
        if (isDialogOpen) {
            $(container).dialog("close");
        }
    },    

    getLayoutOptions: function() {
        var options = {}, that =this;
        options.events = [];
        var event= {
            name: "stateChanged",
            callback: function (ev) {
                if (ev.origin.contentItems && ev.origin.contentItems.length) {
                    var config = ev.origin.contentItems[0].config;
                    var headerButtonInfo = config.componentState? config.componentState.headerButtonInfo: null;
                    if (headerButtonInfo) {
                        that.updateHeaderbuttons(null, headerButtonInfo, ev.origin.element);
                    }
                }
                
                var reportElement = that.element.find(".sentrana-golden-layout-root .sentrana_layout_element_view");
                reportElement.each(function () {
                    var reportElementController = $(this).control();
                    if (reportElementController) {
                        reportElementController.resizeElementView($(this).width(), $(this).height());
                    }
                });
            }
        };

        options.events.push(event);

        event = {
            name: "stackCreated",
            callback: function (stack) {
                var originalGetArea = stack._$getArea;
                stack._$getArea = function () {
                    var area = originalGetArea.call(stack);
                    delete stack._contentAreaDimensions.header;
                    return area;
                };

                $(stack.element).addClass("sentrana_report_element_view_container");
            }
        };

        options.events.push(event);
        
        return options;
    },
        
    initializeGoldenLayout: function () {

        var defaultConfig = {
            settings: {
                hasHeaders: true,
                constrainDragToContainer: false,
                reorderEnabled: true,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: true
            },
            dimensions: {
                borderWidth: 5,
                minItemHeight: 10,
                minItemWidth: 10,
                headerHeight: 20,
                dragProxyWidth: 300,
                dragProxyHeight: 200
            },
            labels: {
                close: 'close',
                maximise: 'maximise',
                minimise: 'minimise',
                popout: 'open in new window'
            },
            content: [{
                type: 'row'
            }]
        };

        // Get the golden layout config from default or saved config
        var config = null;
        if (this.options.pageModel.layoutConfig) {
            config = $.parseJSON(this.options.pageModel.layoutConfig);
        }
        else {
            config = defaultConfig;
        }              

        var that = this;
        this.reportElementContainer = this.element.find(".report-element-container-layout").sentrana_golden_layout({
            app: this.options.app,
            height: $(document).height() - 110 + "px",
            width: "100%",
            layoutOptions: this.getLayoutOptions(),
            addButtonToHeader: this.addButtonToHeader,
            controllerName: 'sentrana_report_element_view',
            config: config,
            resizable: true
        }).control();

        if (this.options.pageHeight) {
            this.element.find('.sentrana-golden-layout-root').css('height', this.options.pageHeight + 'px');
        }
        
        this.reportElementContainer.registerComponent('report-element-component', function (container, state) {

            // Store the layout's container & state for each report element
            that.elementContainerList.push({ reId: container._config.id, container: container, state: state });

            var containerElement = container.getElement();
            var newElementId = container._config.id;
            $(containerElement).attr("report-element-id", newElementId);

            var elementController = $(containerElement).sentrana_layout_element_view({
                app: that.options.app,
                height: $(containerElement).height(),
                viewModel: state
            }).control();
            
            that.elementControlsMap[newElementId] = elementController;

            // Save report element to an array
            if(!that.isPageElementExists(newElementId)){
                that.pageElementList.push({ id: newElementId, definition: container._config.componentState });
            }

        });

        this.reportElementContainer.start();
    },

    " gl_initialized": function(){
        //this.reportElementContainer.getLayoutObject().updateSize(this.reportElementContainer.getLayoutObject().width, this.reportElementContainer.getLayoutObject().height);        
    },

    isPageElementExists: function(id){
        for(var i=0; i< this.pageElementList.length; i++){
            if(this.pageElementList[i].id === id){
                return true;
            }
        }
        return false;
    },

    getPageLayoutConfig: function(){
        return this.reportElementContainer.getLayoutConfig();
    },

    " report_element_options": function (el, ev, params) {
        var reportElementDiv = $(ev.target).closest(".lm_item").find(".sentrana_report_element_view");
        var reportElementController = reportElementDiv.control();
        var eventType = params.type;
        
        if (reportElementController && reportElementController.headerButtonClicked) {
            reportElementController.headerButtonClicked(eventType);
        }
        
    },

    updateSize: function () {
        this.reportElementContainer.updateSize();
    },

    updateView: function () {
        if (this.options.pageModel.reportElements.length > 0) {
            //this.renderReportElements();
        }
    },

    updateReportElement: function (columnId, how) {
        var reportElementController = this.getSelectedReportElementController();
        if (reportElementController) {
            reportElementController.updateReportDefinition(columnId, how);
            this.updateReportElementView(this.getSelectedElement());
        }
    },
   
    updateReportElementView: function (selectedElement) {
        var reportElementId = selectedElement.attr("report-element-id");
        var reportElementController = this.getReportElementController(reportElementId);
        var reportDefinition = reportElementController.getReportDefinition();
        // Update layout's component state
        this.updateComponentState(reportElementId, {definition : reportDefinition}, null);
    },

    replaceComponentState: function (reportElementId, reportDefinition) {
        for (var i = 0; i < this.elementContainerList.length; i++) {
            var container = this.elementContainerList[i];
            if (container.reId === reportElementId) {
                if (reportDefinition) {
                    container.container.setState(reportDefinition);
                    var headerButtonInfo = this.getHeaderButtonInfo(reportDefinition.elementType);
                    container.container.extendState({ headerButtonInfo: headerButtonInfo });
                    this.updateHeaderbuttons(container, headerButtonInfo);

                }
               
                break;
            }
        }
    },

    updateComponentState: function (reportElementId, reportDefinition, reportType) {
        for (var i = 0; i < this.elementContainerList.length; i++) {
            var container = this.elementContainerList[i];
            if (container.reId === reportElementId) {
                if (reportDefinition) {
                    container.container.extendState({
                        elementDefinition: reportDefinition
                    });
                }
                if (reportType) {
                    container.container.extendState({ elementType: reportType });
                    var headerButtonInfo = this.getHeaderButtonInfo(reportType);
                    container.container.extendState({ headerButtonInfo: headerButtonInfo });
                    this.updateHeaderbuttons(container, headerButtonInfo);
                }

                
                break;
            }
        }
    },

    updateHeaderbuttons: function (container, headerButtonInfo, reportElementContainer) {
        if (!reportElementContainer) {
            var containerElement = container.container.getElement();
            var $lmItems = $(containerElement).closest('.lm_items');
            var $reportElementContainer = $lmItems.closest('.sentrana_report_element_view_container ');
        } else {
            $reportElementContainer = reportElementContainer;
        }


        var $lmHeaderControlls = $reportElementContainer.find('.lm_header').find('.lm_controls');
            var $lmHeaderButtonContainer = $lmHeaderControlls.find('.golden-layout-btn-container');
            $lmHeaderButtonContainer.html('');

        if (headerButtonInfo) {
            this.addButtonToHeader($lmHeaderButtonContainer, headerButtonInfo);
        }

    },

    addButtonToHeader: function (btnContainer, buttonInfo) {
        var containerButtonTemplate = 'lib/sentrana/collapsible/templates/collapsibleContainerActionButton.ejs';

        if (!buttonInfo.btnStyle) {
            buttonInfo.btnStyle = "";
        }

        var buttonSelector = "." + buttonInfo.cls,
            $button = btnContainer.find(buttonSelector).closest('.cc-button');

        // Is there already a button in the bar?
        if ($button.length) {
            // Unregister the existing handler...
            $button.off("click");
        } else {
            // Add the button to the bar...
            btnContainer.append(containerButtonTemplate, buttonInfo);

            // Get the jQuery object...
            $button = btnContainer.find(buttonSelector).closest('.cc-button');
        }

        // Register a handler for click events...
        var that = this;
        $button.on("click", function (event) {
            if (buttonInfo.dropdown) {
                var $dropDown = $button.find(".container-drop-down");
                // Update dropdown menu position
                var pos = $(event.delegateTarget).position();
                $dropDown.css({ top: pos.top + $(event.delegateTarget).height(), left: pos.left - $dropDown.width() + $(event.delegateTarget).width() });
                $dropDown.show();

                //Remove all previous events
                $dropDown.find(".container-button-menu").off("click");

                $dropDown.find(".container-button-menu").on("click", function (event) {
                    $dropDown.hide();
                    $(this).trigger(buttonInfo.eventType, { type: $(this).attr('elementid') });
                    // The click event stops at the current div.
                    event.stopPropagation();

                });
                // Hide the menu if the mouse leaves the menu.
                $dropDown.on("mouseleave", function (event) {
                    $dropDown.hide();
                });
            } else {
                // Trigger the event
                that.element.trigger(buttonInfo.eventType, buttonInfo.eventArgs);
            }
            return false;
        });
    },

    getSelectedElement: function () {
        var selectedContainer = this.element.find(".sentrana_report_element_view_container.report-section-container-selected");
        return selectedContainer.find(".sentrana_layout_element_view.report-section-selected");
    },

    getSelectedReportElementController: function () {
        var selectedElement = this.getSelectedElement();
        var reportElementId = selectedElement.attr("report-element-id");

        return this.getReportElementController(reportElementId);
    },

    getReportElementController: function (reportElementId) {
        var reportElementController = this.elementControlsMap[reportElementId];
        if (reportElementController) {
            return reportElementController;
        }
    },

    addReportElement: function (elementType, icon) {
        var that = this;
        var selectedElement = this.getSelectedElement(), reportElement, reportDefinition, containerElement,
            newElementId = this.generateNewReId();

        if (selectedElement.length > 0) {
            containerElement = selectedElement;
            var reportElementId = selectedElement.attr("report-element-id");

            var selectedControl = $(selectedElement).control();

            if(Sentrana.isVisualizationOfSameGroup(selectedControl.elementType, elementType)){
                selectedControl.updateElementType(elementType, icon);
                this.updateComponentState(reportElementId, null, elementType);
            }else {
                Sentrana.ConfirmDialog("Confirm Update", "Changing the visualization type will reset your view. Are you sure to Update?",
                    function () {
                        //Get the new model to render
                        var layoutModel = that.getLayoutElementModel(elementType, reportElementId, icon);
                        selectedControl.replaceElementType(layoutModel.componentState);
                        that.replaceComponentState(reportElementId, layoutModel.componentState);
                    }, function () {
                        return false;
                    }, true);
            }

            this.elementControlsMap[reportElementId] =  $(selectedElement).control();
        } else {
            reportElement = Sentrana.Models.ReportElementModel();
            reportElement.id = newElementId;
            reportElement.row = this.getMaxRow();
            reportElement.col = 1;
            reportElement.sizeX = 1;
            reportElement.sizeY = 1;
            reportElement.type = elementType;
            this.options.pageModel.reportElements.push(reportElement);
            this.addLayoutElement(elementType, newElementId, icon);
            containerElement = this.reportElementContainer.getContentElement(newElementId);
            containerElement.attr("report-element-id", newElementId);
        }

        if (selectedElement.length === 0){
            this.addSelectedClass(containerElement);
        }
    },
    
    ".sentrana_report_element_view_container mouseover": function (el, ev) {
        $(el).find(".lm_header").addClass("sentrana_report_element_view_header");
    },

    ".sentrana_report_element_view_container mouseout": function (el, ev) {
        $(el).find(".lm_header").removeClass("sentrana_report_element_view_header");
    },

    getLayoutElementForImageUploader: function(id,icon){
        var viewModel = {
            title: " ",
            id: id,
            type: 'component',
            componentName: 'report-element-component',
            componentState: {
                id: id,
                elementType: 'image',
                icon: icon,
                elementDefinition: {
                    imageUrl: '',
                    name: '',
                    size: '',
                    type: ''
                }
            }
        };

        return viewModel;
    },

    getLayoutElementForInputText: function(id,icon){
        var viewModel = {
            title: " ",
            id: id,
            type: 'component',
            componentName: 'report-element-component',
            componentState: {
                id: id,
                elementType: 'input-text',
                icon: icon,
                elementDefinition: {message: ''}
            }
        };

        return viewModel;
    },

    getLayoutElementForReport: function(id,icon, chartType){
        var reportDefinition={
            filter: "",
            sort: "",
            template: "",
            totals: false
        };

        var viewModel = {
            title: " ",
            id: id,
            type: 'component',
            componentName: 'report-element-component',
            componentState: {
                id: id,
                elementType: chartType,
                icon: icon,
                elementDefinition: {
                    "name": "",
                    "definition": reportDefinition,
                    "chartOptions": {
                        "chartType": chartType
                    }
                },
                headerButtonInfo: this.getHeaderButtonInfo(chartType)
            }
        };

        return viewModel;
    },

    getHeaderButtonInfo: function (reportType) {
        var buttonInfo = {
            "title": "Report Options",
            "cls": "fa-tasks",
            "eventType": "report_element_options",
            "dropdown": true,
            "btnStyle": "",
            "menuItems": []
        };

        switch (reportType) {
        case "line":
        case "pie":
        case "column":
        case "bar":
        case "stacked column":
        case "stacked bar":
        case "scatter":
        case "bubble":
        case "histogram":
            buttonInfo.menuItems = [
                {
                    id: "chartOptions",
                    name: "Chart Options"
                },
                {
                    id: "maximizeChart",
                    name: "Maximize Chart"
                },
                {
                    id: "exportChart",
                    name: "Download Chart",
                    submenuItems: [
                        {
                            id: "exportChart_png",
                            name: "Download PNG"
                        }, {
                            id: "exportChart_jpeg",
                            name: "Download JPEG"
                        }, {
                            id: "exportChart_pdf",
                            name: "Download PDF"
                        }
                    ]
                },
                {
                    id: "printChart",
                    name: "Print Chart"
                }
            ];
            break;
        case "data-table":
            buttonInfo.menuItems = [
                {
                    id: "exportTable",
                    name: "Download Table"
                },
                {
                    id: "printTable",
                    name: "Print Table"
                },
                {
                    id: "printSetup",
                    name: "Setup Print Options"
                }
            ];
            break;
        default:
            return null;
        }

        return buttonInfo;
    },

    getLayoutElementModel: function(elementType, id, icon){
        var viewModel;
        var visualizationGroupName = Sentrana.getVisualizationGroupName(elementType);
        switch(visualizationGroupName){
            case 'Report':
                viewModel = this.getLayoutElementForReport(id, icon, elementType);
                break;
            case "PureText":
                viewModel = this.getLayoutElementForInputText(id, icon);
                break;
            case "Image":
                viewModel = this.getLayoutElementForImageUploader(id, icon);
                break;
            default:
                break;
        }

        return viewModel;
    },

    addLayoutElement: function (elementType, id, icon) {
        var viewModel = this.getLayoutElementModel(elementType, id, icon);
        this.reportElementContainer.addNewElement(viewModel);

    },

    getMaxRow: function () {
        var maxRow = 1;
        if (this.options.pageModel.reportElements.length > 0) {
            maxRow = Math.max.apply(null, this.options.pageModel.reportElements.map(function(r) { return r.row; }));
        }
        return maxRow;
    },

    "{pageModel} change": function (dataObj, ev, attr, how, newVal, oldVal) {
        switch (how) {
            case "add":
                break;
            default:
                break;
        }
    },

    setReportSelection: function(){
        var control = this.getSelectedReportElementController();
        if (control) {
            if (Sentrana.getVisualizationGroupName(control.elementType) === 'Report') {
                this.element.trigger("report_element_selected", control.elementViewController.reportDefnModel);
            } else {
                this.element.trigger("clear_report_selection");
            }
        }
        else {
            this.element.trigger("clear_report_selection");
        }
    },

    addSelectedClass: function (el) {
        var select = $(el).hasClass("report-section-selected");
        this.element.find(".sentrana-golden-layout-root .lm_content.sentrana_layout_element_view").removeClass("report-section-selected");
        this.element.find(".sentrana-golden-layout-root .lm_content.sentrana_layout_element_view").closest(".lm_stack").removeClass("report-section-container-selected");

        if (!select) {
            $(el).addClass("report-section-selected");
            $(el).closest(".lm_stack").addClass("report-section-container-selected");

            var control = this.getSelectedReportElementController();
            if(Sentrana.getVisualizationGroupName(control.elementType) === 'Report'){
                this.element.trigger("report_element_selected", control.elementViewController.reportDefnModel);
            }else{
                this.element.trigger("clear_report_selection");
            }
        }else{
            this.element.trigger("clear_report_selection");
        }
    },

    ".sentrana_report_element_view_header click": function (el, ev) {
        this.addSelectedClass($(el).closest(".lm_stack").find(".lm_content.sentrana_layout_element_view"));
    },

    generateNewReId: function () {
        var reCount = this.pageElementList.length === 0 ? 1 : this.pageElementList.length + 1;
        return this.options.pageModel.id + "-re-" + reCount;
    },

    " report_data_load_finished": function (el, ev) {
        this.updateSize();
    },

    " chart_rebind": function (ev, el) {
        this.updateSize();
    },

    " print_closed": function () {
        this.options.app.handleUserInteraction();
        this.updateSize();
    },

    " pure_text_updated": function(ev, el, content){
        var selectedElement = this.getSelectedElement();
        var reportElementId = selectedElement.attr("report-element-id");
        this.updateComponentState(reportElementId, {message: content}, null);
    },

    " image_changed": function(ev, el, fileData){
        var selectedElement = this.getSelectedElement();
        var reportElementId = selectedElement.attr("report-element-id");
        this.updateComponentState(reportElementId, fileData, null);
    }

});