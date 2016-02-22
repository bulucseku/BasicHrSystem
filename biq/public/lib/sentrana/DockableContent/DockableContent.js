steal("lib/sentrana/WidgetsBase/WidgetsControlBase.js", function () {
    Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.DockableContent", {
            //static properties
            pluginName: 'sentrana_dockable_content',
            defaults: {
                sidebars: [],
                sidebarWidth: 230,
                sidebarHeight: 800,
                sidebarDefaultDockPosition: 'left',
                callBackFunctionOnLayoutChange: undefined,
                marginTop: 0,
                marginBottom: 0,
                autoHeight: true
            }
        },
        {
            //instance properties
            init: function () {
                this.leftSideBarItems = [];
                this.rightSideBarItems = [];
                this.sidebarHeight = this.options.autoHeight ? $(window).height()- this.options.marginTop - this.options.marginBottom : this.options.sidebarHeight;
                this.sideBarControls = {};
                this.sideBarContents = {};

                this.render();
                this.initLayouts();
            },

            render : function(){
                var actualMarkup = this.element.children().detach();
                this.element.html(can.view('lib/sentrana/DockableContent/templates/dockable-content.ejs', {}));

                this.$dockLeft = this.element.find('.dock-left');
                this.$dockMiddle = this.element.find('.dock-middle');
                this.$dockRight = this.element.find('.dock-right');

                this.$dockMiddle.append(actualMarkup);

                this.$dockLeft.css('width', this.options.sidebarWidth + 'px');
                this.$dockLeft.css('height',this.sidebarHeight + 'px');

                this.$dockMiddle.css('margin','0px');

                this.$dockRight.css('width',this.options.sidebarWidth + 'px');
                this.$dockRight.css('height',this.sidebarHeight + 'px');

                this.renderSidebars();
            },

            initLayouts: function(){
                //if there is no item in the left/right sidebar list then hide that sidebar
                if(this.leftSideBarItems.length === 0){
                    this.$dockLeft.hide();
                    this.$dockMiddle.css('margin-left', '0px');
                }else{
                    this.$dockLeft.show();
                    this.$dockMiddle.css('margin-left', this.options.sidebarWidth + 'px');
                }

                if(this.rightSideBarItems.length === 0){
                    this.$dockRight.hide();
                    this.$dockMiddle.css('margin-right', '0px');
                }else{
                    this.$dockRight.show();
                    this.$dockMiddle.css('margin-right', this.options.sidebarWidth + 'px');
                }

                if (this.options.callBackFunctionOnLayoutChange && typeof this.options.callBackFunctionOnLayoutChange === 'function') {
                    this.options.callBackFunctionOnLayoutChange();
                }
            },

            renderSidebars: function(){
                var that = this;

                $.each(this.options.sidebars, function(index, sidebar){
                    var renderingOptions = {
                        id: sidebar.id,
                        title: sidebar.title,
                        headerIconClass: sidebar.headerIconClass,
                        height:  that.sidebarHeight,
                        width: that.options.sidebarWidth,
                        displayCloseIcon: false,
                        position: 'left'
                    };

                    sidebar.container.wrap('<div class="dockable-sidebar-item-wrapper-' + sidebar.id + '"></div>');
                    that.sideBarControls[sidebar.id] = $('.dockable-sidebar-item-wrapper-' + sidebar.id).sentrana_dockable_item(renderingOptions).control();
                    that.sideBarContents[sidebar.id] = that.sideBarControls[sidebar.id].element;
                });
            },

            getSideBar: function(id){
                var sidebar = $.grep(this.options.sidebars, function(sidebar, index){
                    return sidebar.id === id;
                });

                return sidebar.length === 0 ? undefined : sidebar[0];
            },

            showSideBar: function(id){
                var sidebar = this.getSideBar(id);
                if(!sidebar){
                    return;
                }

                if(sidebar.position.toLowerCase() === 'left'){
                    this.leftSideBarItems.push(sidebar);
                }else{
                    this.rightSideBarItems.push(sidebar);
                }

                this.addSidebarToDockablePanel(sidebar);
            },

            hideSideBar: function(id){
                var sidebar = this.getSideBar(id);
                if(!sidebar){
                    return;
                }

                if(sidebar.position.toLowerCase() === 'left'){
                    this.leftSideBarItems = $.grep(this.leftSideBarItems, function(item){
                        return item.id != id;
                    });
                }else{
                    this.rightSideBarItems = $.grep(this.rightSideBarItems, function(item){
                        return item.id != id;
                    });
                }

                this.removeSidebarFromDockablePanel(sidebar);
            },

            addSidebarToDockablePanel: function(addedSidebar){
                var that = this;
                if(addedSidebar.position.toLowerCase() === 'left'){
                    this.$dockLeft.append(this.sideBarContents[addedSidebar.id]);
                }else{
                    this.$dockRight.append(this.sideBarContents[addedSidebar.id]);
                }

                this.adjustSidebarsHeight(addedSidebar.position);
                this.sideBarControls[addedSidebar.id].show();
                this.initLayouts();
            },

            removeSidebarFromDockablePanel: function(removedSidebar){
                this.sideBarContents[removedSidebar.id]= $('.dockable-sidebar-item-wrapper-' + removedSidebar.id).detach();
                this.adjustSidebarsHeight(removedSidebar.position);
                this.sideBarControls[removedSidebar.id].hide();
                this.initLayouts();
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

            },

            " move_side_bar": function(el, ev, moveParam){
                this.hideSideBar(moveParam.id);
                this.updateSidebarPosition(moveParam);
                this.showSideBar(moveParam.id);
                this.initLayouts();
            },

            updateSidebarPosition: function(moveParam){
                for(var i=0;i<this.options.sidebars.length; i++){
                    if(this.options.sidebars[i].id === moveParam.id){
                        this.options.sidebars[i].position = moveParam.newPosition;
                        break;
                    }
                }
            },

            updateSidebarCollapseStatus: function(collapseParam){
                if(collapseParam.position === 'left'){
                    for(var i=0;i<this.leftSideBarItems.length; i++){
                        if(this.leftSideBarItems[i].id === collapseParam.id){
                            this.leftSideBarItems[i].isCollapsed = collapseParam.isCollapsed;
                            break;
                        }
                    }
                }else{
                    for(var i=0;i<this.rightSideBarItems.length; i++){
                        if(this.rightSideBarItems[i].id === collapseParam.id){
                            this.rightSideBarItems[i].isCollapsed = collapseParam.isCollapsed;
                            break;
                        }
                    }
                }
            },

            getCollapsedSidebars: function(position){
                var that = this;
                var collapsedItems;
                if(position === 'left'){
                    collapsedItems = $.grep(this.leftSideBarItems, function(item){
                        return item.isCollapsed;
                    });
                }else{
                    collapsedItems = $.grep(this.rightSideBarItems, function(item){
                        return item.isCollapsed;
                    });
                }

                return collapsedItems;
            },

            adjustSidebarsHeight: function(position){
                var that = this;
                var collapsedSidebars = that.getCollapsedSidebars(position);

                if(position === 'left'){
                    $.each(this.leftSideBarItems, function(index, sidebar){
                        var leftSidebarItemsCount = that.leftSideBarItems.length;
                        var deductedHeightForCollapsedSideBars = collapsedSidebars.length * 35;
                        var remainingHeight = that.sidebarHeight - deductedHeightForCollapsedSideBars;
                        var newHeight = remainingHeight/(leftSidebarItemsCount-collapsedSidebars.length);

                        if(!sidebar.isCollapsed){
                            that.sideBarControls[sidebar.id].resizeHeight(newHeight);
                        }
                    });
                }else{
                    $.each(this.rightSideBarItems, function(index, sidebar){
                        var rightSidebarItemsCount = that.rightSideBarItems.length;
                        var deductedHeightForCollapsedSideBars = collapsedSidebars.length * 35;
                        var remainingHeight = that.sidebarHeight - deductedHeightForCollapsedSideBars;
                        var newHeight = remainingHeight/(rightSidebarItemsCount-collapsedSidebars.length);

                        if(!sidebar.isCollapsed){
                            that.sideBarControls[sidebar.id].resizeHeight(newHeight);
                        }
                    });
                }
            },

            adjustAllSidebarsHeight: function(){
                this.adjustSidebarsHeight('left');
                this.adjustSidebarsHeight('right');
            },

            " dock_side_bar_content_toggle": function(el, ev, collapseParam){
                var that = this;
                this.updateSidebarCollapseStatus(collapseParam);
                this.adjustSidebarsHeight(collapseParam.position);
            },

            "{window} resize": function(){
                this.sidebarHeight = $(window).height()- this.options.marginTop - this.options.marginBottom;
                this.adjustAllSidebarsHeight();
            }
        });
});
