/* Controller for description dialog */
Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.EditMetric", {
    defaults: {
        width: 440
    },
    model: null
}, {
    init: function () {
        // Call the base class to construct the buttons array...
        this._super(["OK", "CANCEL"], 50);
        this.metric = null;
        this.model = this.options.model;
        // Initialize our dialog...
        this.element.dialog(this.getDialogOptions());

        this.$name = $('input[name="name"]', this.element);
        this.$description = $('input[name="description"]', this.element);
        this.$datatype = $('input[name="datatype"]', this.element);
        this.$operation = $('input[name="operation"]', this.element);
        this.$formatstring = $('input[name="formatstring"]', this.element);

        // Hide the [x] in the upper right corner of the dialog...
        this.removeExInCorner();
    },

    dataTypeToString: function (dataType) {
        switch (parseInt(dataType, 10)) {
        case 0:
            return "Datetime";
        case 1:
            return "String";
        case 2:
            return "Currency";
        case 3:
            return "Number";
        case 4:
            return "Percentage";
        case 5:
            return "Boolean";
        default:
            return "Not a valid datatype (will default to String)";
        }
    },

    dataTypeToInt: function (dataType) {
        switch (dataType) {
        case "Datetime":
            return 0;
        case "String":
            return 1;
        case "Currency":
            return 2;
        case "Number":
            return 3;
        case "Percentage":
            return 4;
        case "Boolean":
            return 5;
        default:
            return 1;
        }
    },

    // Instance Method: Handle what to do when the user clicks the OK button
    handleOK: function () {
        var metric = this.metric;
        metric.name = this.$name.val();
        metric.description = this.$description.val();
        metric.dataType = this.dataTypeToInt(this.$datatype.val());
        metric.operation = this.$operation.val();
        metric.formatString = this.$formatstring.val();
        // Notify the controller to update the values
        this.model.attr("updatedMetric", (this.model.updatedMetric + 1) % 2);
        this.closeDialog();
    },

    handleCANCEL: function () {
        this.closeDialog();
    },

    // Open the dialog
    open: function (metric) {
        this.metric = metric;
        this.$name.val(metric.name);
        this.$description.val(metric.description);
        this.$datatype.val(this.dataTypeToString(metric.dataType));
        this.$operation.val(metric.operation);
        this.$formatstring.val(metric.formatString);
        this.openDialog();
    }
});
