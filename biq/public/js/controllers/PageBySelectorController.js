can.Control.extend("Sentrana.Controllers.PageBySelector", {
    pluginName: 'sentrana_page_by_selector',
    defaults: {
        executionMonitorModel: null /* This is an instance of a Sentrana.Models.ExecutionMonitor */
    }
}, {
    init: function () {},

    // Browser Event: What to do when the user modifies the page by selector...
    "select change": function (el, ev) {
        this.options.executionMonitorModel.changePageByElement(el.val());
    },

    // Synthetic Event: What to do when the model changes...
    "{executionMonitorModel} change": function (executionMonitorModel, ev, attr, how, newVal, oldVal) {
        // What has changed?
        if (attr === "slicingStatus" && newVal === "SUCCESS") {
            var pageByInfo = this.options.executionMonitorModel.getPageByInfo();

            // Do we have page by information?
            if (pageByInfo) {
                this.element.html(can.view("templates/pageBySelector.ejs", pageByInfo).parent().show());
            }
            else {
                this.element.parent().hide();
            }
        }
    }
});
