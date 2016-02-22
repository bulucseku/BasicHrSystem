//steal("lib/sentrana/WidgetsBase/Model/WidgetsPropertiesModelBase.js", function () {
//    sentrana.ui.widgets.properties.model.extend("Sentrana.UI.Widgets.PagePropertyModel", {
//    }, {

//        init: function (options) {
//            this.setup({
//                foreColor: null
//            });

//            this.foreColor = null;
//        }

//    });
//});

var PagePropertyModel = can.Map.extend({

    init: function (options) {
        this.setup({
            propertyChange: null
        });

        this.foreColor = null;
        this.backColor = null;
        this.isEditMode = null;
    },

    setProperty: function (foreColor, backColor, isEditMode) {

        this.foreColor = foreColor;
        this.backColor = backColor;
        this.isEditMode = isEditMode;

        this.attr('propertyChange', 'change');
    }



});
