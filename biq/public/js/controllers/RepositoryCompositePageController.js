can.Control.extend("Sentrana.Controller.CompositeRepository", {

    pluginName: 'sentrana_composite_repository',
    defaults: {
        app: null,
        model: null
    }
}, {
    init: function CR_init() {
        var that = this;
        this.element.html(can.view("templates/pg-repoman-composite.ejs", {}));
    }
});
