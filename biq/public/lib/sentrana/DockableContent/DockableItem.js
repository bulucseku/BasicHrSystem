steal("lib/sentrana/WidgetsBase/WidgetsControlBase.js", function () {
    Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.DockableItem", {
            //static properties goes here
            pluginName: 'sentrana_dockable_item',
            defaults: {
                title: 'untitled',
                headerIconClass: '',
                headerCssClass: '',
                displayCloseIcon:true,
                width: 230,
                height: 200,
                position: 'left'
            }
        },
        {
            //instance properties goes here
            init: function () {
                this.visible = false;
                this.isCollapsed = false;
                this.parent = this.element.parent();
                var actualMarkup = this.element.children().detach();
                this.element.html(can.view('lib/sentrana/DockableContent/templates/dockable-item.ejs', {options: this.options}));
                this.$dockablePanel = this.element.find('.dock-content-sidebar-dockablePanel');
                this.$containerPanel = this.element.find('.dock-content-sidebar-scrollable-panel');
                this.$sidebarTitle = this.element.find('.dock-content-sidebar-docPanelTitle');
                this.$closeIcon = this.element.find('.dock-content-sidebar-close-icon');
                this.$MoveIcon = this.element.find('.move-icon');
                this.$collapseIcon = this.element.find('.collapse-icon');

                this.$containerPanel.append(actualMarkup);
                this.$dockablePanel.css('width', this.options.width + 'px');
                this.$containerPanel.css('height',this.options.height + 'px');
                this.$sidebarTitle.addClass(this.options.headerCssClass);

                if (!this.options.displayCloseIcon){
                    this.$closeIcon.hide();
                }

                this.hide();
            },

            show: function () {
                this.visible = true;
                this.$dockablePanel.show();
            },

            hide: function () {
                this.visible = false;
                this.$dockablePanel.hide();
            },

            resizeHeight: function(height){
                //this.$dockablePanel.css('height', height + 'px');
                this.$containerPanel.css('height', (height - this.$sidebarTitle.outerHeight(true)) + 'px');
            },

            changeMoveIcon: function(position){
                switch(position){
                    case 'right':
                        this.$MoveIcon.removeClass();
                        this.$MoveIcon.addClass('fa fa-hand-o-left move-icon');
                        break;
                    case 'left':
                        this.$MoveIcon.removeClass();
                        this.$MoveIcon.addClass('fa fa-hand-o-right move-icon');
                        break;
                    default:
                        this.$MoveIcon.removeClass();
                        this.$MoveIcon.addClass('fa fa-hand-o-right move-icon');
                        break;
                }
            },

            ".fa-times click": function () {
                this.hide();
            },

            ".move-icon click": function (el,event) {
                event.stopPropagation();
                var newPosition;
                if(this.options.position === 'left'){
                    newPosition = 'right';
                    this.options.position = 'right';
                }else{
                    newPosition = 'left';
                    this.options.position = 'left';
                }

                this.changeMoveIcon(newPosition);
                this.element.trigger('move_side_bar', {id: this.options.id, newPosition: newPosition});
            },

            ".dock-content-sidebar-docPanelTitle click": function(){
                if(this.isCollapsed){
                    this.$containerPanel.show();
                    this.$collapseIcon.removeClass('fa-angle-right');
                    this.$collapseIcon.addClass('fa-angle-down');
                }else{
                    this.$containerPanel.hide();
                    this.$collapseIcon.removeClass('fa-angle-down');
                    this.$collapseIcon.addClass('fa-angle-right');
                }

                this.isCollapsed = !this.isCollapsed;
                this.element.trigger('dock_side_bar_content_toggle', {id: this.options.id, isCollapsed: this.isCollapsed, position: this.options.position});
            }

        });
});
