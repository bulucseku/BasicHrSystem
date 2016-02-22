/* Controller for new dimension dialog */
Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.NewDimension", {
    defaults: {
        width: 555
    }
}, {
    init: function () {
        // Call the base class to construct the buttons array...
        this._super(["OK", "CANCEL"], 50);

        // Extract some jQuery objects...
        this.$name = $('.input-name', this.element);
        // Initialize our dialog...
        this.element.dialog(this.getDialogOptions());
        // Hide the [x] in the upper right corner of the dialog...
        this.removeExInCorner();
    },

    // Instance Method: Handle what to do when the user clicks the OK button
    handleOK: function () {
        var newDimension = this.$name.val();
        this.model.addDimension(newDimension);
        this.model.attr('newDimension', this.$name.val());
        this.model.dimensions.dimensionParents[newDimension] = this.attrID;
        this.closeDialog();
    },

    // Instace Method: Handle what to do when the user clicks the CANCEL button
    handleCANCEL: function () {
        this.closeDialog();
    },

    // Open the dialog
    open: function (model, attrID) {
        this.model = model;
        this.attrID = attrID;
        this.openDialog();
    },

    // Browser Event: What to do when the user types in the input box...
    'input[name="dimension-name"] keyup': function (el, ev) {
        var trimmedText = $.trim(el.val());
        // Enable (or disable) the OK button...
        this.enableButton("OK", trimmedText !== "");
    }
});
