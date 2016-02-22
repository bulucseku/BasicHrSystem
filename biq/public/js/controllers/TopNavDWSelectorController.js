can.Control.extend("Sentrana.Controllers.TopNavDWSelector", {

    pluginName: 'sentrana_top_nav_dw_selector',
    defaults: {
        app: null
    }
}, {
    init: function DWS_init() {},

    update: function (options) {
        this._super(options);
    },

    ".repository-options-item click": function (el) {
        var repositoryId = el.attr("repositoryid");
        var repositoryName = el.text();

        if (repositoryId === this.options.app.dwChoicesModel.attr('selectedID')) {
            return;
        }

        var params = {
            oid: repositoryId,
            name: repositoryName
        };

        //this.options.app.dwChoicesModel.attr("selectedID", repositoryId);
        this.element.trigger("DWSelectionChanged", params);
    }
});
