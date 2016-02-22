Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.DynamicElements", {
    defaults: {
        width: 440
    }
}, {
    init: function () {
        // Call the base class to construct the buttons array...
        this._super(["OK", "CANCEL"], 50);
        // Initialize our dialog...
        this.element.dialog(this.getDialogOptions());
    },

    // Instance Method: Handle what to do when the user clicks the OK button
    handleOK: function () {
        var attribute = this.attribute;
        var model = this.model;

        for (var i = 0; i < model.selectors.length; i++) {
            var dyn = model.selectors[i];
            attribute.dynamicElements[dyn].selected = $('.input-selected', $('.' + dyn)).prop('checked');
            attribute.dynamicElements[dyn].value = $('.input-value', $('.' + dyn)).val();
        }
        this.closeDialog();
    },

    // Open the dialog
    open: function (model, attribute) {
        this.model = model;
        this.attribute = attribute;

        for (var i = 0; i < model.selectors.length; i++) {
            var dyn = model.selectors[i];
            $('.input-selected', $('.' + dyn)).prop('checked', attribute.dynamicElements[dyn].selected);
            $('.input-value', $('.' + dyn)).val(attribute.dynamicElements[dyn].value);
        }
        this.openDialog();
    }
});
