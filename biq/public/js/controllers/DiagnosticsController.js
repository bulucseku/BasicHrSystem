can.Control.extend("Sentrana.Controllers.Diagnostics", {

    pluginName: 'sentrana_diagnostics',
    defaults: {
        executionMonitorModel: null /* Assumed to be an instance of Sentrana.Models.ExecutionMonitor */
    }
}, {
    init: function D_init() {
        // Define our jQuery objects...
        this.$timingInfo = this.element.find(".timing-info");
    },

    // Browser Event: What to do when a user wants to clear a cache...
    "a.drop-cache click": function (el, ev) {
        ev.preventDefault();
        this.options.executionMonitorModel.dropCache(el.attr('cid'));
    },

    // Browser Event: What to do when a user wants to show the SQL...
    "a.view-sql click": function (el, ev) {
        ev.preventDefault();
        this.$sql.toggle(250);
    },

    // Synthetic Event: What to do when the model changes...
    "{executionMonitorModel} change": function (executionMonitorModel, ev, attr, how, newVal, oldVal) {
        // What has changed on the model?
        switch (attr) {
        case "executionStatus":
            switch (newVal) {
            case "STARTING":
                this.$timingInfo.empty();
                break;
            case "FAILURE":
                break;
            case "SUCCESS":
                // Get the full JSON data for the model. This contains all information necessary to
                // render a grid or chart.
                var data = executionMonitorModel.getData();
                this.$timingInfo.html(can.view('templates/timingInfo.ejs', data));
                this.$sql = this.element.find(".sql");
                this.$dropCache = this.element.find(".drop-cache");
                break;
            default:
                break;
            }
            break;
        case "droppingCache":
            if (how === "remove") {
                this.$dropCache.parent("li").hide(150, function () {
                    $(this).remove();
                });
            }
            else if (how === "set" && newVal === "FAILURE") {
                alert("Drop of cache failed.");
            }
            break;
        default:
            break;
        }
    }
});
