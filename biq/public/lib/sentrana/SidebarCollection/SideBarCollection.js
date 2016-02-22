steal("lib/sentrana/SideBar/SideBar.js", function () {
    Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.SideBarCollection", {
            //static properties goes here
            pluginName: 'sentrana_side_bar_collection',
            defaults: {
                position: 'left',
                dataContainerElement: undefined,
                draggable: true,
                containmentArea: 'window',
                width: 230
            }
        },
        {
            //instance properties goes here
            init: function () {
                this.sideBarControls = [];
                this.renderView();
            },

            renderView: function(){
                var that = this;
                $.each(this.options.sidebars, function(index, sideBar ) {
                    var sideBarControl = sideBar.container.sentrana_side_bar({
                        title: sideBar.title,
                        position: that.options.position,
                        autoHeight: that.options.autoHeight,
                        marginTop: that.options.marginTop,
                        marginBottom: that.options.marginBottom,
                        headerIconClass: sideBar.headerIconClass,
                        headerCssClass: sideBar.headerCssClass,
                        draggable: that.options.draggable,
                        containmentArea: that.options.containmentArea,
                        displayCloseIcon : false,
                        callBackFunctionOnShow: function(){
                            if(that.hasAnyPinnedSidebar()) {
                                that.addMarginToContentArea();
                            }
                            that.options.callBackFunctionOnShow();

                        },
                        callBackFunctionOnHide: function(){
                            if(!that.hasAnyPinnedSidebar()){
                                that.removeMarginFromContentArea();
                            }
                            that.options.callBackFunctionOnHide();
                        },
                        callBackFunctionOnPin: function(){
                            if(that.hasAnyPinnedSidebar()){
                                that.addMarginToContentArea();
                            }
                            that.options.callBackFunctionOnPin();
                        },
                        callBackFunctionOnUnPin: function(){
                            if(!that.hasAnyPinnedSidebar()){
                                that.removeMarginFromContentArea();
                            }
                            that.options.callBackFunctionOnUnPin();
                        }
                    }).control();

                    that.sideBarControls.push(sideBarControl);

                });
            },

            showSideBar: function (index) {
                $.each(this.sideBarControls, function(key, sideBarControl ) {
                    if(sideBarControl.visible && sideBarControl.state === 'pin' && index !== key){
                        sideBarControl.element.css('z-index',0);
                    }
                });

                this.sideBarControls[index].element.css('z-index',1);
                this.sideBarControls[index].show();
            },

            hideSideBar: function (index) {
                this.sideBarControls[index].hide();
                this.sideBarControls[index].element.css('z-index', 0);
            },

            addMarginToContentArea: function(){
                if (this.options.dataContainerElement) {
                    $(this.options.dataContainerElement).css('margin-' + this.options.position, this.options.width + 'px');
                }
            },

            removeMarginFromContentArea: function(){
                if (this.options.dataContainerElement) {
                    $(this.options.dataContainerElement).css('margin-' + this.options.position, '0px');
                }
            },

            hasAnyPinnedSidebar: function(){
                var pinnedCount = 0;
                $.each(this.sideBarControls, function(index, sideBarControl ) {
                    if(sideBarControl.visible && sideBarControl.state === 'pin'){
                        pinnedCount++;
                    }
                });

                return pinnedCount > 0;
            }

        });
});
