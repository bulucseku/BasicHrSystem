steal("lib/sentrana/DialogControl/SentranaDialog.js", function() {

    Sentrana.Controllers.Dialog.extend("Sentrana.Controllers.ContentPluginDialog", {
        pluginName: 'sentrana_content_plugin_dialog',
        defaults: {
            contentPlugin: '',      // controller plugin for dialog content
            contentOptions: null    // controller options for dialog content
        }
    }, {
        init: function(el, options) {
            this._super(el, options);
        },

        update: function(options) {
            this._super(options);
        },

        updateView: function() {
            this._super();

            // Render dialog body content
            this.renderContent();
        },

        // If a controller plugin and options have been provided, initialize
        // the controller on the modal body.
        renderContent: function() {
            var contentPlugin  = this.options.contentPlugin,
                contentOptions = this.options.contentOptions;

            this.$modalBody = this.$modalBody || $('.modal-body', this.element);

            if (contentPlugin && $.fn[contentPlugin]) {
                this.pluginController = this.$modalBody[contentPlugin](contentOptions).control();
            }
        }
    });
});
