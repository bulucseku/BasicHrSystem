/* Controller for data selection dialog */
Sentrana.Controllers.FirstLookDialog("Sentrana.Dialogs.SelectData", {
    defaults: {
        width: 440,
        model: null
    }
}, {
    init: function () {
        // Call the base class to construct the buttons array...
        this._super(["OK", "CANCEL"], 50);
        this.model = this.options.model;
        // Initialize our dialog...
        this.element.dialog(this.getDialogOptions());
    },

    insertData: function (assoc) {
        var $table = $('.form-data', this.element).empty();

        for (var formID in this.model.forms) {
            var form = this.model.forms[formID];
            if (!form.isLocal || form.formType != this.elem.colType) {
                continue;
            }

            var $insert = $('<input></input>').val(formID).attr('type', this.inputType).attr('name', 'selectdata').addClass(formID);
            if (assoc.indexOf(formID) > -1) {
                $insert.prop('checked', true);
            }
            else if (this.elem.dataType != form.dataType) {
                $insert.attr('disabled', 'disabled');
            }
            $table.append($insert).append("&nbsp" + form.name + "<br>");
        }
    },

    collectSelections: function () {
        var result = [];
        for (var formID in this.model.forms) {
            var form = this.model.forms[formID];
            if (!form.isLocal) {
                continue;
            }

            if ($('.' + formID).is(':checked')) {
                this.model.attachToForm(this.elem.id, formID);
            }
            else {
                this.model.detachFromForm(this.elem.id, formID);
            }
        }
        return result;
    },

    // Instance Method: Handle what to do when the user clicks the OK button
    handleOK: function () {
        this.collectSelections();
        this.model.attr('updatedFormSelection', (this.model.updatedFormSelection + 1) % 2);
        this.closeDialog();
    },

    // Open the dialog
    open: function (colID) {
        var elem = this.model.getAttrOrMetr(colID);
        var assoc;
        if (elem.colType > 0) {
            this.inputType = "radio";
            assoc = elem.facts;
        }
        else {
            this.inputType = "checkbox";
            assoc = elem.attributeForms;
        }

        this.elem = elem;
        this.insertData(assoc);
        this.openDialog();
    }
});
