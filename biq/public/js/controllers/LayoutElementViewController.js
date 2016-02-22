can.Control.extend("Sentrana.Controllers.LayoutElementViewController", {
    pluginName: "sentrana_layout_element_view",
    defaults: {
        app: undefined,
        height: 200,
        width: 200,
        viewModel: undefined
    }
}, {
    // Constructor...
    init: function () {
        this.initDOMElements();

        this.icon = this.options.viewModel.icon;
        this.elementType = this.options.viewModel.elementType;

        this.elementViewModel = Sentrana.Models.LayoutElement({
            app: this.options.app,
            name: this.options.viewModel.name,
            elementType: this.options.viewModel.elementType,
            elementDefinition: this.options.viewModel.elementDefinition
        });

        var _self = this;

        this.elementViewModel.bind("change", function (ev, attr, how, newVal, oldVal) {
            switch (attr) {
                case "elementType":
                    //Need to change the view type
                    break;
                case "elementDefinition":
                    //Need to re-render/update the view
                    break;
                default:
                    break;
            }
        });

        this.addViewElement(this.options.viewModel);
    },

    initDOMElements: function(){
        this.element.append(can.view('templates/layoutElementContainer.ejs', {}));
        this.$layoutViewContainer = this.element.find('.layout-view-container');
    },

    addViewElement: function(viewModel){
        var visualizationGroupName = Sentrana.getVisualizationGroupName(viewModel.elementType);

        switch(visualizationGroupName){
            case 'Report':
                var reportDefinitionInfoModel = new Sentrana.Models.ReportDefinitionInfo({
                    "name": "Hello",
                    "showChart": true,
                    "definition": viewModel.elementDefinition.definition,
                    "chartOptions": viewModel.elementDefinition.chartOptions
                });
                this.elementViewController = this.$layoutViewContainer.sentrana_report_element_view({
                    app: this.options.app,
                    elementType: this.elementType,
                    icon: this.icon,
                    contentInitialHeight: this.options.height,
                    reportDefinitionInfoModel: reportDefinitionInfoModel
                }).control();
                break;
            case "PureText":
                this.elementViewController = this.$layoutViewContainer.sentrana_pure_text({
                    app: this.options.app,
                    message: viewModel.elementDefinition.message
                }).control();
                break;
            case "Image":
                this.elementViewController = this.$layoutViewContainer.sentrana_image_uploader({
                    fileData: viewModel.elementDefinition,
                    mode: 'edit'
                }).control();
                break;
            default:
                break;
        }
    },

    replaceElementType: function(viewModel){
        this.element.empty();
        this.initDOMElements();

        this.icon = viewModel.icon;
        this.elementType = viewModel.elementType;

        if( this.elementViewController){
            this.elementViewController.destroy();
            this.$layoutViewContainer.empty();
        }

        this.addViewElement(viewModel);
    },

    updateElementType: function(elementType, icon){
        this.icon = icon;
        this.elementType = elementType;
        this.elementViewController.updateElementType(elementType, icon);
    },

    updateReportDefinition: function(columnId, how){
        if (how === "add") {
            this.elementViewController.reportDefnModel.selectObject(columnId);
        }
        else if (how === "remove") {
            this.elementViewController.reportDefnModel.deselectObject(columnId);
        }

        this.elementViewController.updateElementType(this.elementType, this.icon);
    },

    getReportDefinition: function(){
      return this.elementViewController.reportDefnModel.getReportDefinitionParameters(true);
    },

    resizeElementView: function (width, height) {
        this.elementViewController.resize(width, height);
    }

});

