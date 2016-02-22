/**
 * This is a base class for building jQuery-based Dialog Controllers in the First Look application.
 *
 * This class is expected to be subclassed. Some features of this base class:
 *
 * 1) Easier access to buttons. In the base constructor, the caller is expected to pass in
 *    a parameter that defines the buttons to expose for the dialog. The parameter is expected
 *    to be an array. The values of the array can be either a scalar (which is expected to be
 * 	  a string identifying the text label of the button) or an object which has a text field\
 *    as well as an optional disabled field (to initially disable a button).
 *
 *    If a click handler has not been supplied, one will be constructed using the proxy method
 *    and supplying a method name formed by the word "handle" + the button's text, as in
 *    "handleOK" or "handleCANCEL".
 *
 *    A default handler is provided for the "CANCEL" button which simply closes the dialog.
 *
 *    After the base constructor has been invoked, the subclass can access the instance field
 *    "buttons" to initialize the jQuery dialog.
 *
 *    To change the state of a button at runtime, you can use the enableButton method.
 *
 * 2) Automatic detection of FirstLook global state changes. If the session is closed on the
 *    global state, the class's closeDialog method is called, which allows subclasses to perform
 *    any other cleanup.
 *
 * 3) Display of a "status bar". When your dialog must make backend calls during execution (typically
 * 	  during a button click such as "OK"), your dialog can remain visible and updated to show a
 *    spinner and a message. If the message is long, it can be automatically truncated by this
 *    class (the caller must supply a maxStatusMessageLength parameter in the constructor). Use the
 *    updateStatusBar method to show/hide the spinner and show/hide a message.
 */
can.Control.extend("Sentrana.Controllers.FirstLookDialog", {
    defaults: {
        autoOpen: false,
        width: 525,
        modal: true,
        minHeight: 0
    }
}, {

    pluginName: 'sentrana_first_look_dialog',
    // Constructor...
    init: function JQD_init(buttonArray, maxStatusMessageLength) {
        // Is the input parameter an array?
        buttonArray = ($.isArray(buttonArray)) ? buttonArray : [buttonArray];

        // Add click handlers for each button...
        var that = this;
        $.each(buttonArray, function (index, buttonInfo) {
            // Is the element not an object?
            if (!$.isPlainObject(buttonInfo)) {
                buttonInfo = {
                    text: buttonInfo
                };
                buttonArray.splice(index, 1, buttonInfo);
            }

            // Is the click property absent?
            if (!buttonInfo.click) {
                buttonInfo.click = that.proxy("handle" + buttonInfo.text);
            }
        });

        // Save our buttons for retrieval by the subclass...
        this.buttons = buttonArray;

        // Record the maximum length of a status bar message...
        this.maxStatusMessageLength = maxStatusMessageLength;
    },

    // Instance Method: Remove the [x] in the top right corner of the dialog...
    removeExInCorner: function JQD_removeExInCorner() {
        this.element.dialog("widget").find(".ui-dialog-titlebar-close").hide();
    },

    getDialogOptions: function () {
        return {
            autoOpen: false,
            width: this.options.width,
            minHeight: this.options.minHeight,
            modal: this.options.modal,
            closeOnEscape: false,
            resizable: false,
            buttons: this.buttons
        };
    },
    // Instance Method: Provide a default handler for the CANCEL button...
    handleCANCEL: function JQD_handleCANCEL() {
        this.closeDialog("userClick");
    },

    // Instance Method: Enable (or disable) a dialog button
    enableButton: function (buttonText, enabled) {
        var buttons = this.element.dialog("option", "buttons");

        // Loop through all buttons...
        var that = this;
        $.each(buttons, function (index, button) {
            // Is this the button we are looking for?
            if (button.text === buttonText) {
                // Change the disabled field...
                button.disabled = !enabled;

                // Save the buttons back on the dialog...
                that.element.dialog("option", "buttons", buttons);
                that.element.siblings('.ui-dialog-buttonpane').find('button').addClass('btn');
                $(that.element.siblings('.ui-dialog-buttonpane').find('button')[index]).removeClass('disabled');
                return false;
            }
        });
    },

    // Instance Method: Enable (or disable) a dialog button
    hideButton: function (buttonText) {
        var buttons = this.element.dialog("option", "buttons");

        // Loop through all buttons...
        var that = this;
        $.each(buttons, function (index, button) {
            // Is this the button we are looking for?
            if (button.text === buttonText) {
                // Change the disabled field...
                button.style = 'display:none;';

                // Save the buttons back on the dialog...
                that.element.dialog("option", "buttons", buttons);

                return false;
            }
        });
    },

    // Instance Method: Enable (or disable) a dialog button
    showButton: function (buttonText) {
        var buttons = this.element.dialog("option", "buttons");

        // Loop through all buttons...
        var that = this;
        $.each(buttons, function (index, button) {
            // Is this the button we are looking for?
            if (button.text === buttonText) {
                // Change the disabled field...
                button.style = '';

                // Save the buttons back on the dialog...
                that.element.dialog("option", "buttons", buttons);

                return false;
            }
        });
    },

    // Instance Method: Add a status bar to the dialog. This is shown in the button pane (to the left of the buttons).
    addStatusBar: function () {
        // Get the widget...
        var $widget = this.element.dialog("widget");

        // Was a status bar already added?
        if ($widget.find(".dialog-status-bar").length > 0) {
            return;
        }

        // Add some content in the button pane to indicate backend calls active, message...
        $widget.find(".ui-dialog-buttonpane").prepend("templates/dialog-status-bar.ejs", {});
    },

    // Instance Method: Remove the status bar from the dialog
    removeStatusBar: function () {
        // Remove the status bar from the DOM
        this.element.dialog("widget").find(".dialog-status-bar").remove();
    },

    // Instance Method: Update the status bar...
    updateStatusBar: function (showLoading, msgText, status) {

        // Add the status bar (if it was not already added)...
        this.addStatusBar();

        // Get the status bar jQuery objects...
        var $widget = this.element.dialog("widget"),
            sbInfo = {
                $container: $widget.find('.dialog-status-bar'),
                $statusBarLoading: $widget.find(".dialog-status-bar-loading"),
                //$statusBarMessageIcon: $widget.find(".fa-info"),
                $statusBarMessage: $widget.find(".dialog-status-bar-msg")
            };

        //sbInfo.$statusBarMessageIcon.hide();

        if (!msgText || msgText.length === 0) {
            sbInfo.$container.removeClass('dialog-status-msg-container');
            sbInfo.$container.hide();
        }
        else {
            sbInfo.$container.show();
            sbInfo.$container.addClass('dialog-status-msg-container');
        }

        // Are we showing the loading icon?
        if (showLoading) {
            sbInfo.$statusBarLoading.css("display", "inline-block");
        }
        else {
            sbInfo.$statusBarLoading.hide();
        }

        // Set the message...
        sbInfo.$statusBarMessage.text(msgText);

        if (status === "fail") {
            // sbInfo.$statusBarMessageIcon.css("display", "inline-block");
            sbInfo.$container.removeClass('alert-info');
            sbInfo.$container.addClass('alert-danger');
        }
        else {
            sbInfo.$container.removeClass('alert-danger');
            sbInfo.$container.addClass('alert-info');
        }

        //TODO: This is a temporary fix for the button format which should be corrected by moving to a more bootstrap friendly dialog control
        $('.ui-dialog-buttonset>button', this.element.parent()).addClass('btn').addClass('btn-default');
    },

    // Instance Method: Open the the dialog
    openDialog: function JQD_openDialog() {
        // Open the actual dialog...
        this.element.dialog("open");

        //TODO: This is a temporary fix for the button format which should be corrected by moving to a more bootstrap friendly dialog control
        $('.ui-dialog-buttonset>button', this.element.parent()).addClass('btn').addClass('btn-default');
        $('.ui-dialog-buttonpane', this.element.parent()).addClass('modal-footer');
        this.element.addClass('modal-body');
    },

    // Instance Method: Close up the dialog
    closeDialog: function JQD_closeDialog(why) {
        // Close the dialog...
        this.element.dialog("close");

        // Remove the status bar DOM elements...
        this.removeStatusBar();
    },

    // Synthetic Event: What to do when the global application state changes...
    "{Sentrana.FirstLook.AppState} change": function (appStateModel, ev, attr, how, newVal, oldVal) {
        // Has the session been closed?
        if (attr === "sessionOpen" && !newVal) {
            this.closeDialog("sessionClosed");
        }
    }
});
