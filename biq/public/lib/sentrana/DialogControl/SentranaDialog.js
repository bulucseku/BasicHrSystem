can.Control.extend("Sentrana.Controllers.Dialog", {
    pluginName: 'sentrana_dialog',
    defaults: {
        basePath: "lib/sentrana/DialogControl",
        templatesPath: "templates",
        tmplInit: "dialog.ejs",
        title: 'Modal Title',
        modal: true,
        closeOnEscape: true,
        buttons: [],
        autoCloseOnSessionTimeout: true,
        messageType: "",
        showCrossButton: true,
        autoOpen: true,
        messageIsHtml: false,
        tmplContent: null,
        contentData: {}
    }
},
{
    init: function() {
        this.updateView();

        if (this.options.autoOpen) {
            this.openDialog();
        }
    },

    update: function(){
        this.updateView();

        if (this.options.autoOpen) {
            this.openDialog();
        }
    },

    updateView: function () {
        var that = this;
        if(!this.options.messageIsHtml){
            this.options.message = can.esc(this.options.message);
        }
        var isModalDomExists = $('.modal-dialog', this.element);
        if (isModalDomExists.length === 0) {

        //Remove the elements contents, later this will be added under bootstrap modal
        //Copy Dialog body content with events
        
        var dialogBodyContent;

        if(this.options.tmplContent !== null){
            dialogBodyContent = can.view.render(this.options.tmplContent, this.options.contentData);
        }else{
            dialogBodyContent = $(this.element).children().detach();
        }

        // Bootstrap defined dialog format
        var dialogFormat = can.view(this.getTemplatePath(this.options.tmplInit), this.options);

        // Add bootstrap dom to the element
        $(this.element).html($(dialogFormat));

        // Dialog
        this.dialog = $('.sentrana-modal', this.element);

        // Add body content to the dialog
        if (dialogBodyContent.length) {
            $('.modal-body', this.element).html(dialogBodyContent);
        }

        // Bind button click handlers
            $('.modal-footer button', this.element).each(function(i, el) {
                var button = that.options.buttons[i],
                    handlerName = "handle" + button.label.toPascalCase(),
                    callback = (button.callback || that[handlerName] || that[handlerName.toUpperCase()]);
            if (typeof callback === 'function') {
                $(el).on("click", callback.bind(that));
            }
        });

        // Show the elements
        this.element.show();
        }
        else {
            this.dialog = $('.sentrana-modal', this.element).first();
        }

        // Reset the update status
        this.updateStatus(false, '');
    },

    openDialog: function (callback) {

        this.dialog.modal({
            keyboard: this.options.closeOnEscape,
            backdrop: this.options.modal ? 'static' : true
        });

        this.dialog.modal('show');
        //reset the status
        this.updateStatus(false, '');

        if (typeof callback === 'function') {
            this.dialog.one('shown.bs.modal', callback.bind(this));
        }

        if(this.options.showCrossButton === false){
            this.hideCrossButton();
        }
    },

    closeDialog: function(callback){

        this.dialog.modal('hide');

        if (typeof callback === 'function') {
            this.dialog.one('hidden.bs.modal', callback.bind(this));
        }
    },

    updateStatus: function (showLoader, message) {
        var loaderImage = $('.status-bar-loading', this.element);
        var messageElement = $('.status-bar-msg', this.element);

        // Show/hide loader image
        if (showLoader) {
            $(loaderImage).css("display", "inline-block");
        } else {
            $(loaderImage).hide();
        }

        // Show the message
        message = message ? message : '';
        messageElement.text(message);
    },

    // Instance method: Get the path to a template file...
    getTemplatePath: function getTemplatePath(templateFile) {
        var parts = [];

        // Do we have a basePath?
        if (this.options.basePath) {
            parts.push(this.options.basePath);

            // Did our path NOT end in a slash?
            if (!/\/$/.test(this.options.basePath)) {
                parts.push("/");
            }
        }

        // Do we have a templatesPath?
        if (this.options.templatesPath) {
            parts.push(this.options.templatesPath);

            // Did our path NOT end in a slash?
            if (!/\/$/.test(this.options.templatesPath)) {
                parts.push("/");
            }
        }

        // Add the template file...
        parts.push(templateFile);

        return parts.join("");
    },

    // Instance Method: Enable a dialog button
    enableButton: function (buttonText) {
        $('.modal-footer button', this.element).each(function (i, el) {
            if ($(el).text().trim() === buttonText) {
                $(el).removeClass('disabled');
                return false;
            }
        });
    },

    // Instance Method: Disable a dialog button
    disableButton: function (buttonText) {
        $('.modal-footer button', this.element).each(function (i, el) {
            if ($(el).text().trim() === buttonText) {
                $(el).addClass('disabled');
                return false;
            }
        });
    },

    // Instance Method: Hide a dialog button
    hideButton: function (buttonText) {
        $('.modal-footer button', this.element).each(function (i, el) {
            if ($(el).text().trim() === buttonText) {
                $(el).hide();
                return false;
            }
        });
    },

    // Instance Method: Show a dialog button
    showButton: function (buttonText) {
        $('.modal-footer button', this.element).each(function (i, el) {
            if ($(el).text().trim() === buttonText) {
                $(el).show();
                return false;
            }
        });
    },

    // Synthetic Event: What to do when the global application state changes...
    "{Sentrana.ApplicationShell.AppState} change": function (model, ev, attr, how, newVal, oldVal) {
        // Has the session been closed?
        if (attr === "sessionOpen" && !newVal && this.options.autoCloseOnSessionTimeout) {
            this.closeDialog("sessionClosed");
        }
    },

    // Hide Cross button at the top right corner
    hideCrossButton: function() {
        $(".close", this.element).hide();
    }
});
