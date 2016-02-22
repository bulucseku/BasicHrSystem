can.Control.extend("Sentrana.Controllers.BIQPage", {
    pluginName: 'sentrana_biq_page',
    defaults: {
        app: null
    }
}, {
    // Class constructor: Called only once for all invocations of the helper method...
    init: function () {
        // Update the UI...
        this.updateView();
    },

    // Instance method: Render the UI
    updateView: function () {
        this.$pageRootContainer = $('#tabs');
        this.$pageRootContainer.append(can.view('templates/pageContent.ejs', {}));
    }
});
