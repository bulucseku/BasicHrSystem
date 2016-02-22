can.Observe.extend("Sentrana.Models.LayoutElement", {}, {
    init: function (param) {
        this.app = param.app;
        this.setup({
            name: param.name || '',
            elementType: param.elementType,
            elementDefinition: param.elementDefinition
        });
    }
});