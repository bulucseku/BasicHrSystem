can.Control.extend("Sentrana.Controllers.AppSwitcher", {

    pluginName: 'sentrana_app_switcher',
    defaults: {
        template: "lib/sentrana/AppSwitcher/templates/appSwitcher.ejs"
    }
}, {
    init: function () {
        this.render();
    },

    update: function (options) {
        this._super(options);
        this.render();
    },

    render: function() {
        this.element.html(can.view(this.options.template, {applications: this.options.userApps, applicationId: this.options.applicationId}));
    }
});
