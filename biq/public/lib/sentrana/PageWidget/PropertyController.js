can.Control.extend("Sentrana.Controllers.PageProperty", {
    pluginName: 'page_property',
    defaults: {
        
    }
}, {
    // One time constructor, invoked once and associated with a DOM element.
    init: function () {
        this.updateView();
    },

    update: function () {
        this.updateView();
    },

    updateView: function () {

        this.fillPropertyValue();
        $(this.element).append(can.view(this.options.pageController.getTemplatePath('property-window.ejs'), { model: this.options.propertyModel }));


        var that = this;

        // Define the dialog buttons
        var buttons = [
            {
                id: "btnOk",
                label: "Ok",
                className: "btn-primary",
                callback: function () {

                    var foreColor = $('#page-item-foreColor').val();
                    var backColor = $('#page-item-backColor').val();
                    var isEditMode = $('#editMode').is(':checked');

                    that.options.propertyModel.setProperty(foreColor, backColor, isEditMode);

                    dialogControl.closeDialog();                    
                }
            },
            {
                id: "btnCancel",
                label: "Cancel",
                className: "btn-default",
                callback: function () {
                    dialogControl.closeDialog();                    
                }
            }
        ];

        var dialogControl = this.element.sentrana_dialog({
            app: this,
            title: 'Property Window',
            buttons: buttons,
            closeOnEscape: true,
            modal: true,
            autoOpen: true
        }).control();
    },

    "{propertyModel} change": function (dataObj, ev, attr, how, newVal, oldVal) {
        switch (attr) {
            case "propertyChange":
                switch (newVal) {
                    case 'change':
                        
                        this.options.pageController.options.isEditMode = this.options.propertyModel.isEditMode;
                        this.options.pageController.renderPages();

                        $('.nav-tabs li.active > a').css('color', this.options.propertyModel.foreColor);
                        $('.page-tab > a').css('background', this.options.propertyModel.backColor);


                        this.options.propertyModel.attr('propertyChange', '');
                        
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    },

    setPropertyValue: function () {

    },

    fillPropertyValue: function () {
        this.options.propertyModel.foreColor = this.options.propertyModel.foreColor ? this.options.propertyModel.foreColor : '#fff'; //$('.nav-tabs li.active > a').attr('color');
        this.options.propertyModel.backColor = $('.page-tab > a').attr('background');
        this.options.propertyModel.isEditMode = true;
    }

});
