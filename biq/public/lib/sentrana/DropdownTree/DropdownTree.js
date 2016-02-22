can.Control.extend("Sentrana.Controllers.DropdownTree", {
    pluginName: 'sentrana_dropdown_tree',
    defaults: {
        basePath: "lib/sentrana/DropdownTree",
        templatesPath: "templates",
        tmplInit: "DropdownTree.ejs"
    }
},
{
    init: function () {

        // Define container
        this.$container = this.element;

        // Initialize variables
        this.$treeElement = '';
        this.$maxTextLength = 25;
        this.$clickedNodeCascadeId = null;
        this.$displaySelectedItems = [];
        this.$displayText = '';
        this.selectedItems = [];

        // Update the view
        this.updateView();

        // Initialize a hidden field to track any change
        this.$hiddenText = $('.lookupLocal', this.element);
    },

    updateView: function () {
        this.$container.html(can.view(this.getTemplatePath(this.options.tmplInit), { }));
        this.$treeElement = $('.treeContainer', this.$container);
    },

    hasChildParam: function(param){
        var currParam = param || this.options.rootParam;
        if (currParam.CascadeIds) {
            return true;
        }
        else {
            return false;
        }
    },

    getNodeParam: function(param){
        var currParam = param || this.options.rootParam;
        return currParam;
    },

    getParamObject: function(paramId){

        for (var i = 0; i < this.options.allParams.length; i++) {
            var param = this.options.allParams[i];
            if(param.Id === paramId){
                return param;
            }
        }

        return null;
    },

    buildTreeUI: function (items) {
        var that = this;
        var init_nodes = [];
        var hasChild = this.hasChildParam();
        var currParam = this.getNodeParam();

        that.$clickedNodeCascadeId = currParam.CascadeIds;

        for (var i = 0; i < items.length; i++) {
            init_nodes.push(that.genNodeHTML(hasChild, currParam.Id, currParam.CascadeIds, items[i].key, items[i].value));
        }

        // call '.jstree' with the options object
        this.$treeElement.jstree({

            "checkbox": {
                real_checkboxes: true,
                real_checkboxes_names: function (n) {
                    var nid = 0;
                    $(n).each(function (data) {
                        nid = $(this).attr("nodeid");
                    });
                    return (["check_" + nid, nid]);
                },
                two_state: true
            },
            "plugins" : [ "themes", "html_data", "checkbox", "sort", "ui" ],
            "themes": {
                "theme": "default",
                "url": false,
                "icons": false
            },
            // it makes sense to configure a plugin only if overriding the defaults
            "html_data": {
                "data": init_nodes.join("\r\n"),
                "ajax": {
                    "type": 'POST',
                    "url": this.options.app.generateUrl("GetLookupData", { dashboardId: this.options.app.getDashboardId() }),
                    dataType: "json",
                    contentType: "application/json",
                    data: function (node) {
                        var paramId = node.attr('paramId');
                        var value = node.attr('key');
                        that.$clickedNodeCascadeId = node.attr('cascadeId');

                        return JSON.stringify({
                            Parameters: [{ Id: paramId, Operator: 'IN', Value: value, LookupId: that.$clickedNodeCascadeId }]
                        });
                    },
                    "headers": {
                        sessionID: that.options.app.getDashboardId()
                    },
                    "success": function (data) {
                        var tree_data = [];

                        var lookupData = data.LookupItems;
                        var paramObj = that.getParamObject(that.$clickedNodeCascadeId);
                        var hasChild = that.hasChildParam(paramObj);
                        that.$clickedNodeCascadeId = paramObj.CascadeIds;

                        for (var i = 0; i < lookupData.length; i++) {
                            tree_data.push(that.genNodeHTML(hasChild, paramObj.Id, paramObj.CascadeIds, lookupData[i].key, lookupData[i].value));
                        }
                        return tree_data.join("\r\n");
                    }
                }
            },
            "search": {
                "case_insensitive": true,
                "show_only_matches": true,
                "ajax": {
                    "url": ''
                }
            }
        }).bind("loaded.jstree", function (event, data) {
            // you get two params - event & data - check the core docs for a detailed description
        }).bind("search.jstree", function (event, data) {
            // something for search.
        })
        .bind('open_node.jstree', function (e, data) {
            $('#jstree').jstree('check_node', 'li[selected=selected]');
        })
        .bind('check_node.jstree', function (e, data) { //check all parent nodes

            // Check all parent nodes if check any child node
            var allParents = data.rslt.obj.parents("li");
            for (var i = 0; i < allParents.length; i++) {
                var parent = allParents[i];
                if ($(parent).hasClass('jstree-unchecked') && $(parent).attr("cascadeId")) {
                    $(parent).removeClass('jstree-unchecked');
                    $(parent).addClass('jstree-checked');

                    // Update the check/unchecked object
                    that.check_UnCheck_Items(true, $(parent));
                }
            }

            that.check_UnCheck_Items(true, $(data.rslt.obj));
        })
        .bind('uncheck_node.jstree', function (e, data) {//uncheck all child nodes

            // UnCheck all child nodes if uncheck parent node
            var allChildren = data.rslt.obj.find('li');
            for (var i = 0; i < allChildren.length; i++) {
                var child = allChildren[i];
                if ($(child).hasClass('jstree-checked')) {
                    $(child).removeClass('jstree-checked');
                    $(child).addClass('jstree-unchecked');

                    // Update the check/unchecked object
                    that.check_UnCheck_Items(false, $(child));
                }
            }

            that.check_UnCheck_Items(false, $(data.rslt.obj));
        })
        .delegate("a", "click", function (event, data) { $(event.target).find('.jstree-checkbox').click(); })
        ;
    },

    check_UnCheck_Items: function(isCheck, data){

        var paramId = data.attr("paramId"),
            value = data.attr("key"),
            operator = 'IN',
            paramObj;

        if (isCheck) {

            paramObj = $.grep(this.selectedItems, function (o, e) { return o.Id === paramId; });

            if (paramObj && paramObj.length === 1) {
                paramObj[0].Value = paramObj[0].Value + ',' + value;
            }
            else {
                this.selectedItems.push({ Id: paramId, Value: value, Operator: operator });
            }
        }
        else {
            paramObj = $.grep(this.selectedItems, function (o, e) { return o.Id === paramId; });

            if (paramObj && paramObj.length === 1) {

                var values = paramObj[0].Value.split(',');
                if(values.length > 1){
                    paramObj[0].Value = paramObj[0].Value.replace(',' + value, '').replace(value + ',', '');
                }
                else {
                    this.selectedItems = $.grep(this.selectedItems, function (o, i) {return o.Id === paramId && o.Value === value;}, true);
                }
            }

        }

        this.showHideButtons();
        this.setDisplayText();
        this.$hiddenText.val('').change(); // Change the hidden text value to notify that somethings is changed

        /*
        console.clear();
        console.log('Start:-----------------------------------------');
        for (var i = 0; i < this.selectedItems.length; i++) {
            console.log(this.selectedItems[i].Id + '--' + this.selectedItems[i].Value);
        }
        console.log('End:-------------------------------------------');
        */
    },

    showHideButtons: function(){

        if (this.selectedItems.length > 0) {
            $('.button', this.element).show();
        }
        else {
            $('.button', this.element).hide();
        }
    },

    setDisplayText: function () {

        this.$displayText = '';

        for (var i = 0; i < this.selectedItems.length; i++) {
            var item = this.selectedItems[i];

            var data = item.Value.split(',');

            if (data.length > 0) {
                for (var j = 0; j < data.length; j++) {

                    var dataItem = data[j].split('#');
                    if (dataItem.length >= 1) {
                        this.$displayText += dataItem[0] + ',';
                    }
                }
            }
        }

        // Remove last character (,)
        this.$displayText = this.$displayText.slice(0, -1);

        // Set the display text
        var dropdownHeader = $('.dropdownTreeHeader span', this.element).html('');
        dropdownHeader.html(this.$displayText);

        var textLength = dropdownHeader.html().length;
        if (textLength > this.$maxTextLength) {
            dropdownHeader.html(dropdownHeader.html().substring(0, this.$maxTextLength) + '...');
        }
    },

    ".tree-clear-icon click": function(el, ev) {
        var contentText = "Are you sure you want to clear all selected items?";
        $('#clear-dropdown-tree-filter').remove();
        $('body').append("<div><span id='clear-dropdown-tree-filter'></span></div>");

        var that = this;
        $('#clear-dropdown-tree-filter').sentrana_confirm_dialog({
            title: "Clear Dropdown Tree",
            message: contentText,
            onOk: function () {
                that.clearSelectedItems();
            }
        });
    },

    /**
    * Clear all selected items of drop down tree control with hiding extra buttons
    */
    clearSelectedItems: function () {
        // Clear selected items
        this.selectedItems = [];
        this.showHideButtons();

        // Collapse all nodes
        this.$treeElement.jstree('close_all');

        // Clear the header text
        $('.dropdownTreeHeader span', this.element).html('');

        $('.jstree-open', this.element).removeClass('jstree-checked');
        $('.jstree-open', this.element).addClass('jstree-unchecked');

        $('.jstree-closed', this.element).removeClass('jstree-checked');
        $('.jstree-closed', this.element).addClass('jstree-unchecked');

        $('.jstree-leaf', this.element).removeClass('jstree-checked');
        $('.jstree-leaf', this.element).addClass('jstree-unchecked');

        // Change the hidden text value to notify that somethings is changed
        this.$hiddenText.val('').change();
    },

    ".dropdownTree mouseleave": function (el, ev) {

        if (Sentrana.isiPad()) {
            $('.treeContainer', this.element).hide();
        } else {
            var that = this;
            this.filterTimer = setTimeout(function () {
                $('.treeContainer', that.element).hide();
            }, (Sentrana.Common.Settings.DROPDOWN_HIDE_DELAY_TIME || 500));
        }
    },

    // Generate tree node html
    genNodeHTML: function (hasChildren, paramId, cascadeId, key, value) {

        var displayText = '';
        if (value.indexOf("#") >= 0) {
            displayText = value.substring(0, value.lastIndexOf('#'));
        }
        else {
            displayText = value;
        }

        return '<li class="' + (hasChildren ? 'jstree-closed' : '') + '" paramId="' + paramId + '" cascadeId="' + cascadeId + '" key="' + key + '">' + '<a>' + displayText + '</a>' + '</li>';
    },

    // Instance method: Get the path to a template file...
    getTemplatePath: function getTemplatePath(templateFile) {
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
    },

    ".dropdownTreeHeader click": function (el, ev) {

        var treeContainer = $('.treeContainer', this.element);

        var isVisible = $(treeContainer).is(":visible");
        if (isVisible) {
            $(treeContainer).hide();
        }
        else {
            $(treeContainer).show();
        }
    },

    ".tree-current-selection-icon click": function(el, ev){

        // Show checked items
        this.showCheckedItems();

        // Show and position the checked item view container
        $('.checked-item-display-container', this.element).css('left', $(el).position().left).css('top', $(el).position().top).show();
    },

    ".checked-item-display-container mouseleave": function(el, ev){
        $(el).hide();
    },

    showCheckedItems: function () {
        var i;

        // Initialize the variable to empty
        this.$displaySelectedItems = [];

        // Get the root parameter/top parent
        var rootParam = null;
        if (this.selectedItems.length > 0) {
            for (i = 0; i < this.selectedItems.length; i++) {
                var item = this.selectedItems[i];

                if (item.Value.indexOf("#") === -1) {
                    rootParam = item;
                    break;
                }
            }
        }

        if (rootParam) {
            var values = rootParam.Value.split(',');
            for (i = 0; i < values.length; i++) {

                this.$displaySelectedItems.push({ value: values[i], level: 0 });

                // Populate checked items into a list with hirarchical parameter level
                this.populateCheckedItems(values[i], 1);
            }
        }

        // Render checked items to a container to show
        $('.checked-item-display-container', this.element).html('');
        for (var j = 0; j < this.$displaySelectedItems.length; j++) {
            var displayItem = this.$displaySelectedItems[j];
            $('.checked-item-display-container', this.element).append("<div class='checked-value' style='padding-left:" + displayItem.level * 10 + "px;'>" + displayItem.value + "</div>");
        }
    },

    populateCheckedItems: function(value, levelCount){

        var childValues = this.getChildValue(value, levelCount);

        if (childValues.length > 0) {

            for (var i = 0; i < childValues.length; i++) {

                this.$displaySelectedItems.push({ value: childValues[i].value, level: childValues[i].level });

                var newLevel = parseInt(childValues[i].level, 10) + 1;

                // Recursively call
                this.populateCheckedItems(childValues[i].value, newLevel);
            }
        }

    },

    getChildValue: function(value, level){

        var childValues = [];

        for (var i = 0; i < this.selectedItems.length; i++) {
            var item = this.selectedItems[i];

            var data = item.Value.split(',');

            for (var j = 0; j < data.length; j++) {

                var dataItem = data[j].split('#');
                if(dataItem.length === 2){
                    if (dataItem[1] === value) {
                        childValues.push({ value: dataItem[0], level: level });
                    }
                }
            }
        }

        return childValues;
    },

    getValue: function () {
        return this.selectedItems;
    }
});
