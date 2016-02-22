/* Controller for description dialog */
Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.EditAttribute", {
    defaults: {
        width: 440
    },
    model: null
}, {
    init: function () {
        // Call the base class to construct the buttons array...
        this._super(["OK", "CANCEL"], 50);
        this.attr = null;
        this.model = this.options.model;
        // Initialize our dialog...
        this.element.dialog(this.getDialogOptions());

        this.$name = $('input[name="name"]', this.element);
        this.$description = $('input[name="description"]', this.element);
        // Hide the [x] in the upper right corner of the dialog...
        this.removeExInCorner();
    },

    // Instance Method: Handle what to do when the user clicks the OK button
    handleOK: function () {
        var attr = this.attr;
        attr.name = this.$name.val();
        attr.description = this.$description.val();
        // Notify the controller to update the values
        this.model.attr("updatedAttribute", (this.model.updatedAttribute + 1) % 2);
        this.closeDialog();
    },

    handleCANCEL: function () {
        this.closeDialog();
    },

    // Open the dialog
    open: function (attr) {
        this.attr = attr;
        this.$name.val(attr.name);
        this.$description.val(attr.description);
        this.openDialog();
    }
});
