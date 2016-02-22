can.Control.extend("Sentrana.Controllers.UserOptions", {

    pluginName: 'sentrana_user_options',
    defaults: {
        app: null
    }
}, {
    init: function DWS_init() {},

    update: function (options) {
        this._super(options);
    },

    ".user-options-item click": function (el) {
        this.element.trigger("UserSelectionChanged", {
            action: el.attr("action")
        });
        return false;
    }
});
