can.Control.extend("Sentrana.Controllers.Actions", {
    pluginName: 'sentrana_actions',
    defaults: {
        app: null
    }
}, {
    
    init: function () {
        this.updateView();
    },

    updateView: function () {
        var buttons = [
            { text: "Save", action: "save", cls: "" },
            { text: "Save As", action: "save-as", cls: "" },
            { text: "Refresh", action: "refresh", cls: "" },
            { text: "Publish", action: "publish", cls: "" }
        ];

        this.element.html(can.view('templates/action_content.ejs', { buttons: buttons }));
    },

    ".btn-action click": function (el, ev) {
        this.element.trigger("action-button-clicked", { action: $(el).attr("action") });
    }
});
