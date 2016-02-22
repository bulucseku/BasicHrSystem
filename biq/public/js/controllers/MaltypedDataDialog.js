/* Controller for new dimension dialog */
Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.MaltypedData", {
    defaults: {
        width: 440
    }
}, {
    init: function () {
        // Call the base class to construct the buttons array...
        this._super(["OK"], 50);
        // Initialize our dialog...
        this.element.dialog(this.getDialogOptions());
        // Hide the [x] in the upper right corner of the dialog...
        this.removeExInCorner();
    },

    // Instance Method: Handle what to do when the user clicks the OK button
    handleOK: function () {
        this.closeDialog();
    },

    // Open the dialog
    open: function () {
        this.openDialog();
    }
});
