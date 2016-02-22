can.Control.extend("Sentrana.Controllers.ReportElementExecutionMonitor", {

    pluginName: 'sentrana_report_element_execution_monitor',
    // Default values for our options...
    defaults: {
        executionMonitorModel: null
    }
}, {
    init: function EMC_init() {
        // Define our jQuery objects...
        this.$spinner = this.element.find(".spinner");
        this.$executionMessage = this.element.find(".execution-message");
        this.$cancelBtn = this.element.find(".cancel-btn");
        this.$elapsedTime = this.element.find(".elapsed-time");
    },

    update: function EMC_update(options) {
        this._super(options);
    },

    show: function(){
      this.element.show();
    },

    hide: function(){
      this.element.hide();
    },

    ".cancel-btn click": function (el, ev) {
        // Ask the model to cancel our XHR call...
        this.options.executionMonitorModel.cancelExecutionDrillingCall();
    },

    // Synthetic Event: What to do when the model changes...
    "{executionMonitorModel} change": function (executionMonitorModel, ev, attr, how, newVal, oldVal) {
        // Get the full JSON data for the model. This contains all information necessary to
        // render a grid or chart.
        var data = executionMonitorModel.getData();

        // What has changed on the model?
        switch (attr) {
            case "executionStatus":
                switch (newVal) {
                    case "STARTING":
                        this.$executionMessage.text(Sentrana.getMessageText(window.app_resources.app_msg.report_execution.processing_msg));
                        this.$spinner.css('display', 'table');
                        this.$cancelBtn.css('display', 'table');
                        break;
                    case "SUCCESS":
                        this.$executionMessage.text(executionMonitorModel.attr("executionMessage"));
                        this.$spinner.hide();
                        this.$cancelBtn.hide();
                        break;
                    case "FAILURE":
                        this.$executionMessage.html(can.view('templates/reportException.ejs', data));
                        this.$spinner.hide();
                        this.$cancelBtn.hide();
                        this.$elapsedTime.hide();
                        break;
                    default:
                        break;
                }
                break;
            case "elapsedTimeStr":
                this.$elapsedTime.text("Time: " + newVal);
                break;
            default:
                break;
        }
    }
});
