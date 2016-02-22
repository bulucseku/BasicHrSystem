Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.InfoList", {
    //static properties
    pluginName: 'sentrana_info_list',
    defaults: {
        items:[]
    }
}, {
    //instance properties
    init: function () {
        this.render();
    },

    render: function () {
        var items = this.options.items;
        this.element.html(can.view('lib/sentrana/InfoList/templates/infoList.ejs', {items: items}));
    },

    update: function () {

    },

    show: function () {

    },

    hide: function () {

    },

    destroy: function () {

    },

    resize: function (width, height) {

    }
});

