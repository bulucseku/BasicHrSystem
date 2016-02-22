steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.DeleteSavedFilter", {
        pluginName: 'sentrana_dialogs_delete_saved_filter',
        defaults: {
            title: "Delete Saved Filter",
            autoOpen: false,
            buttons: [{
                label: "CANCEL",
                className: "btn-cancel btn-default"
            }, {
                label: "OK",
                className: "btn-ok btn-primary"
            }]
        }

}, {
    init: function (el, options) {
        this._super(el, options);
        this.$name = this.element.find('.delete-saved-filter-name');
    },

    handleCANCEL: function () {
        this.closeDialog();
    },

    handleOK: function () {

        this.updateStatus(true, "Deleting the saved filter...");

        var fg = new Sentrana.Models.SavedFilterGroupInfo({
            "id": this.savedFilter.id,
            "name": this.savedFilter.name,
            "dataSource": this.options.app.dwRepository.id,
            "filterIds": $.map(this.savedFilter.filters, function (filter) {
                return filter.oid;
            })
        });

        var promise = fg.destroy(), that = this;
        promise.done(function (data) {
            // Show status...
            that.updateStatus(false, "Saved filter deleted successfully");
            // Close the dialog...
            that.closeDialog();
        });
        promise.fail(function (err) {
            var errorCode = err.getResponseHeader("ErrorCode");
            var errorMsg = err.getResponseHeader("ErrorMsg");

            if (errorCode === Sentrana.Enums.ErrorCode.NO_SAVED_FILTER_GROUP_FOUND) {
                that.updateStatus(false, errorMsg, 'fail');
            }
            else {
                that.updateStatus(false, Sentrana.getMessageText(window.app_resources.app_msg.save_operation.failed), 'fail');
            }
        });
    },

    loadForm: function (savedFilter) {
        this.$name.text(savedFilter.name);
    },

    open: function (savedFilter) {
        this.loadForm(savedFilter);
        this.savedFilter = savedFilter;
        this.openDialog();
    }
});

});