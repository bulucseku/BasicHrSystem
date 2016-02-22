Sentrana.Controllers.FilterControlTree("Sentrana.Controllers.FilterControlTreeOnlyWhen", {
    pluginName: "sentrana_filter_control_tree_only_when",
    defaults: {}
}, {
    init: function FCT_init() {
        this.$onlywhenfilterControl = this.element.find(".onlywhen-element-filter");
        this._super();
    },

    // Instance method: Build the user interface for the Attribute Elements...
    // Initialize the tree control.
    // We are using jsTree.
    buildElementsUI: function () {
        var that = this;
        var init_nodes = [];
        var form = this.options.form;
        for (var i = 0; i < form.elements.length; i++) {
            init_nodes.push(that.genNodeHTML(true, form.elements[i].oid, form.elements[i].name));
        }
        // call `.jstree` with the options object
        this.$onlywhenfilterControl.jstree({
            // the `plugins` array allows you to configure the active plugins on this instance
            "plugins": ["themes", "html_data", "ui", "crrm", "hotkeys", "search"],
            "themes": {
                "theme": "apple",
                "icons": false
            },
            // it makes sense to configure a plugin only if overriding the defaults
            "core": {
                "themes": {
                    "icons": false
                },
                "data": function (obj, cb) {
                    if (obj.id == "#") {
                        cb.call(this,
                            init_nodes.join("\r\n"));
                    }
                    else {
                        if (obj.li_attr != "undefined") {
                            $.ajax({
                                "type": 'POST',
                                "url": Sentrana.Controllers.BIQController.generateUrl("GetChildElements"),
                                dataType: "json",
                                contentType: "application/json",
                                data: JSON.stringify({
                                    oid: obj.li_attr.oid
                                }),

                                "headers": {
                                    sessionID: Sentrana.Controllers.BIQController.sessionID,
                                    repositoryID: Sentrana.Controllers.BIQController.repositoryID
                                },
                                "success": function (new_data) {
                                    var tree_data = [];
                                    for (var i = 0; i < new_data.length; i++) {
                                        tree_data.push(that.genNodeHTML(new_data[i].hasChildren, new_data[i].oid, new_data[i].name));
                                    }
                                    that.element.trigger("filter_rendered", that.options.attr.dimName);

                                    //return tree_data.join("\r\n");
                                    cb.call(obj.id,
                                        tree_data.join("\r\n"));
                                }
                            })
                        }

                    }

                }
            },
            "search": {
                "case_insensitive": true,
                "show_only_matches": true,
                "ajax": {
                    "url": Sentrana.Controllers.BIQController.generateUrl("GetMatchingElementPaths") + '&form_id=' + form.oid
                }
            }
        });
    },

    // Generate tree node html
    genNodeHTML: function (hasChildren, oid, name) {
        var selectedClass = "";
        // Generate these tree element objects
        var treeElementObject = this.options.dwRepository.isTreeFilter(oid);

        if (this.isSelected(treeElementObject.oid)) {
            selectedClass = " object-selected tree-node-selected";
        }

        return '<li title="' + name + '" class="' + (hasChildren ? 'jstree-closed' : '') + '" id="' + treeElementObject.hid + '" + oid="' + oid.replace('"', '&quot') +
            '"><a hid="' + treeElementObject.hid + '" class="tree-node-selector' + selectedClass + '" href="#">' + name + '</a></li>';

    },

    isSelected: function (nodeId) {
        var RE_TREE_FILTER_OID = /^\(([^\+]+)(.*)\)(.+)$/,
            match = RE_TREE_FILTER_OID.exec(nodeId);
        if (match) {
            nodeId = match[3];
        }
        var selectednode = $.grep(this.options.filters, function (filter) {
            var oid = filter.oid;
            match = RE_TREE_FILTER_OID.exec(oid);
            if (match) {
                oid = match[3];
            }

            return oid === nodeId;
        });

        return selectednode.length > 0;
    },

    // The method to display the elements that match the search criteria.
    // Implement the parent abstract method.
    searchElements: function (el, ev) {
        if ($(el).val().length != 1) {
            if (ev.keyCode == 13) {
                // Only when the user clicks enter, we will start to do the ajax search and search all the elements in the tree.
                // The second boolean parameter is for skip_async.
                // http://www.jstree.com/documentation/search
                this.$onlywhenfilterControl.jstree("search", $(el).val(),false, true);
            }
            else {
                this.$onlywhenfilterControl.jstree("search", $(el).val(),true, true);
            }
        }
    },

    addTreeFilter: function (el) {
        var oid = $(el).parent().attr("oid");
        var object = this.options.dwRepository.getObjectByOID(oid, true);
        if (object) {
            this.options.filters.push(object);
            this.element.trigger(this.options.tag + "-filter-selected", el);
        }
    },

    // Browser Event: What to do when a user clicks on an object in the tree...
    '.tree-node-selector click': function (el, ev) {
        this.addTreeFilter(el);
    }
});
