steal("lib/sentrana/WidgetsBase/WidgetsControlBase.js", function () {
    Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.SideBar", {
            //static properties goes here
            pluginName: 'sentrana_side_bar',
            defaults: {
                title: 'untitled',
                position: 'left',
                dataContainerElement: undefined,
                width: 230,
                height: 600,
                callBackFunctionDefault: undefined,
                callBackFunctionOnShow: undefined,
                callBackFunctionOnHide: undefined,
                callBackFunctionOnPin: undefined,
                callBackFunctionOnUnPin: undefined,
                autoHeight: false,
                marginTop: 0,
                marginBottom: 0,
                headerIconClass: '',
                headerCssClass: '',
                draggable: true,
                containmentArea: 'window',
                displayCloseIcon:true
            }
        },
        {
            //instance properties goes here
            init: function () {
                this.state = 'pin';
                this.visible = false;
                this.parent = this.element.parent();
                var actualMarkup = this.element.children().detach();
                this.element.html(can.view('lib/sentrana/SideBar/templates/sidebar.ejs', {options: this.options}));
                this.$dockablePanel = this.element.find('.sidebar-dockablePanel');
                this.$containerPanel = this.element.find('.sidebar-scrollable-panel');
                this.$sidebarTitle = this.element.find('.sidebar-docPanelTitle');
                this.$pinIcon = this.element.find('.sidebar-pin-icon');
                this.$unpinIcon = this.element.find('.sidebar-unpin-icon');
                this.$closeIcon = this.element.find('.sidebar-close-icon');


                this.$containerPanel.append(actualMarkup);

                this.element.css('position', 'relative');
                this.$dockablePanel.addClass('sidebar-position-' + this.options.position);
                this.$dockablePanel.css('width', this.options.width + 'px');
                this.$sidebarTitle.addClass(this.options.headerCssClass);
                this.$containerPanel.css('height', this.getHeight());

                /* If the callback function is not empty then call it*/
                if (this.options.callBackFunctionDefault && typeof this.options.callBackFunctionDefault === 'function') {
                    this.options.callBackFunctionDefault();
                }

                if(this.options.draggable){
                    this.$dockablePanel.draggable({ containment: this.options.containmentArea });
                    this.$dockablePanel.draggable("disable");
                    this.$unpinIcon.show();
                    this.$pinIcon.hide();
                }
                if (!this.options.displayCloseIcon){
                    this.$closeIcon.hide();
                }
            },

            show: function () {
                this.visible = true;
                this.$dockablePanel.show('slide', {direction: this.options.position});

                if (this.options.dataContainerElement) {
                    $(this.options.dataContainerElement).css('margin-' + this.options.position, this.options.width + 'px');
                }

                /* If the callback function is not empty then call it*/
                if (this.options.callBackFunctionOnShow && typeof this.options.callBackFunctionOnShow === 'function') {
                    this.options.callBackFunctionOnShow();
                }
            },

            hide: function () {
                this.visible = false;
                if(this.options.draggable) {
                    this.showPinState();
                }

                this.$dockablePanel.hide('slide', {direction: this.options.position});
                if (this.options.dataContainerElement) {
                    $(this.options.dataContainerElement).css('margin-' + this.options.position, '0px');
                }

                /* If the callback function is not empty then call it*/
                if (this.options.callBackFunctionOnHide && typeof this.options.callBackFunctionOnHide === 'function') {
                    this.options.callBackFunctionOnHide();
                }
            },

            getHeight: function () {
                var sidebarHeight = this.options.height;
                if (this.options.autoHeight) {
                    var windowHeight = $(window).height();
                    sidebarHeight = windowHeight - this.options.marginTop - this.options.marginBottom - this.$sidebarTitle.outerHeight(true);
                    sidebarHeight = (sidebarHeight > 400) ? sidebarHeight : 400;
                }
                return sidebarHeight + 'px';
            },

            showPinState: function(){
                if(this.options.position === 'left'){
                    this.$dockablePanel.css({
                        'float':  'none',
                        'left': '0px',
                        'right': '',
                        'top': '0px'
                    });
                }else{
                    this.$dockablePanel.css({
                        'float':  'none',
                        'left': '',
                        'right': '0px',
                        'top': '0px'
                    });
                }


                this.$dockablePanel.draggable('disable');
                this.state = 'pin';

                this.$unpinIcon.show();
                this.$pinIcon.hide();
            },

            ".fa-times click": function () {
                if(this.options.draggable) {
                    this.state = 'unpin';
                }

                this.hide();
            },

            ".fa-link click": function () {
                if (this.options.dataContainerElement) {
                    $(this.options.dataContainerElement).css('margin-' + this.options.position, this.options.width + 'px');
                }

                this.showPinState();

                /* If the callback function is not empty then call it*/
                if (this.options.callBackFunctionOnPin && typeof this.options.callBackFunctionOnPin === 'function') {
                    this.options.callBackFunctionOnPin();
                }
            },

            ".fa-unlink click": function () {
                if (this.options.dataContainerElement) {
                    $(this.options.dataContainerElement).css('margin-' + this.options.position, '0px');
                }

                this.$dockablePanel.css('float', this.options.position);
                this.$dockablePanel.draggable('enable');

                this.state = 'unpin';

                this.$unpinIcon.hide();
                this.$pinIcon.show();

                /* If the callback function is not empty then call it*/
                if (this.options.callBackFunctionOnUnPin && typeof this.options.callBackFunctionOnUnPin === 'function') {
                    this.options.callBackFunctionOnUnPin();
                }
            },

            "{window} resize": function() {
                if (this.options.autoHeight) {
                    this.$containerPanel.css('max-height', this.getHeight());
                }
            }
        });
});
