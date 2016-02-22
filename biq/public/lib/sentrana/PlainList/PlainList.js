steal("lib/sentrana/WidgetsBase/WidgetsControlBase.js", function () {
    Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.PlainList", {
            //static properties
            pluginName: 'sentrana_plain_list',
            defaults: {
                items: []
            }
        },
        {
            //instance properties
            init: function () {
                this.render();
            },

            render : function(){
                var items = this.options.items;
                this.element.html(can.view('lib/sentrana/PlainList/templates/plainList.ejs', {items: items}));
            },

            update: function () {

            },

            show: function () {

            },

            hide: function () {

            },

            destroy: function(){

            },

            resize: function(width, height){

            }
        });
});
