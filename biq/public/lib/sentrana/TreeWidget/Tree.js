steal("lib/sentrana/WidgetsBase/WidgetsControlBase.js", function () {
    Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.TreeWidget", {
        pluginName: 'sentrana_tree_widget',
        defaults: {
            basePath: "lib/sentrana/TreeWidget",
            templatesPath: "templates",
            tmplInit: "tree-container.ejs",
            nodeItems: []
        }
    },
    {
        init: function () {
            this.updateView();
        },

        updateView: function () {
            
            this.element.html(can.view(this.getTemplatePath(this.options.tmplInit), {}));
            this.treeContainer = this.element.find(".tree-container");
            
            this.renderTree();
        },

        renderTree: function () {

            var that = this;            
            this.treeContainer.jstree({
                'core': {
                    'data': that.options.nodeItems
                }
            });

            // Fire the event when click on an item            
            this.treeContainer
              .on('changed.jstree', function (e, data) {
                  var i, j, r = [];
                  for (i = 0, j = data.selected.length; i < j; i++) {
                      r.push(data.instance.get_node(data.selected[i]).id);
                  }
                  
                  that.element.trigger("nodeItemClicked", r.join(','));
              })
              .jstree();
        },

        

        getTemplatePath: function RG_getTemplatePath(templateFile) {
            var parts = [];

            // Do we have a basePath?
            if (this.options.basePath) {
                parts.push(this.options.basePath);

                // Did our path NOT end in a slash?
                if (!/\/$/.test(this.options.basePath)) {
                    parts.push("/");
                }
            }

            // Do we have a templatesPath?
            if (this.options.templatesPath) {
                parts.push(this.options.templatesPath);

                // Did our path NOT end in a slash?
                if (!/\/$/.test(this.options.templatesPath)) {
                    parts.push("/");
                }
            }

            // Add the template file...
            parts.push(templateFile);

            return parts.join("");
        }

    });
});
