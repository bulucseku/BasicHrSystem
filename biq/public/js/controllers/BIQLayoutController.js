can.Control.extend("Sentrana.Controllers.BIQLayout", {
    pluginName: 'sentrana_biq_layout',
    defaults: {
        app: null
    }
}, {
    // Class constructor: Called only once for all invocations of the helper method...
    init: function () {
        // Update the UI...
        this.updateView();
    },

    update: function () {
        // Update the UI...
        this.updateView();
    },

    // Instance method: Render the UI
    updateView: function () {
        var filteredLayout = this.options.app.topNavBarModel.getFilteredLayout();
        this.element.empty();
        this.element.sentrana_top_navigation({
            app: this.options.app,
            navigationModel: this.options.app.topNavBarModel
        });
    }
});
