can.Control.extend("Sentrana.Controllers.ReportActionButton", {
    pluginName: 'sentrana_report_action_button',
    defaults: {
        app: null
    }
}, {
    init: function reportFilterContainerInit() {
        this.dwRepository = this.options.app.dwRepository;
        this.updateView();
    },

    updateView: function () {
        var buttons = [
            { text: "Save", action: "save", cls: "" },
            { text: "Save As", action: "save-as", cls: "" },
            { text: "Refresh", action: "refresh", cls: "" },
            { text: "Publish", action: "publish", cls: "" }
        ];

        this.element.find(".attribute-elements").html(can.view('templates/action_content.ejs', { buttons: buttons }));
    },

    ".btn-action click": function (el, ev) {
        this.element.trigger("action-button-clicked", { action: $(el).attr("action") });
    }

});