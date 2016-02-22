steal("lib/sentrana/GoldenLayout/css/style.css", function() {
    can.Control.extend("Sentrana.Controllers.SentranaGoldenLayout", {
        pluginName: 'sentrana_golden_layout',
        defaults: {
            app: null,
            height: "700px",
            width: "100%",
            resizable: true,
            config: {
                settings: {
                    hasHeaders: true,
                    constrainDragToContainer: false,
                    reorderEnabled: true,
                    selectionEnabled: false,
                    popoutWholeStack: false,
                    blockedPopoutsThrowError: true,
                    closePopoutsOnUnload: true,
                    showPopoutIcon: false,
                    showMaximiseIcon: false,
                    showCloseIcon: true
                },
                dimensions: {
                    borderWidth: 5,
                    minItemHeight: 10,
                    minItemWidth: 10,
                    headerHeight: 20,
                    dragProxyWidth: 300,
                    dragProxyHeight: 200
                },
                labels: {
                    close: 'close',
                    maximise: 'maximise',
                    minimise: 'minimise',
                    popout: 'open in new window'
                },
                content: [{
                    type: 'row'
                }]
            }
        }
    }, {

        init: function () {
            this.reportElements = [];
            this.initializeGoldenLayout();
        },

        getLayoutObject: function () {
            return this.layout;
        },

        getContentElement: function (id) {
            var rootRow = this.getRootRow();
            var container = rootRow.getItemsById(id);
            return $(container[0].element).find(".lm_content");
        },

        updateSize: function () {
            this.layout.updateSize();
        },

        initializeGoldenLayout: function () {
            var that = this;
            var height = this.options.height, width = this.options.width;
            this.element.html('<div class="sentrana-golden-layout-root" style="height:' + height + '; width: ' + width + ';"></div>');
            this.layout = new GoldenLayout(this.options.config, this.element.find('.sentrana-golden-layout-root'));
            this.attachDefaultEvents();
            this.attachEvents();

            if (this.options.resizable) {
                // Add page resizer
                var resizer = document.createElement('div');
                resizer.className = 'layout-resizer';
                this.element.append(resizer);
                this.isResizing = false;

                this.pageContent = $('.sentrana-golden-layout-root', this.element);
                this.container = this.pageContent.parent();
                this.baseHeight = this.pageContent.parent().height();
            }
        },
        
        ".layout-resizer mousedown": function(){
            this.isResizing = true;
            return false;
        },

        "{document} mousemove": function (e) {

            if (!this.isResizing) {
                return;
            }            
        
            var offsetHeight = 0;
            var pageTopHeight = 80;
            
            if ($("body").height() > $(window).height()) {
                offsetHeight = event.clientY - pageTopHeight + ($("body").height() - $(window).height());
            }
            else {
                offsetHeight = event.clientY - pageTopHeight;
            }            
            
            // Change the page height
            this.pageContent.css('height', offsetHeight);
        
            // Change the page container height
            var ch = this.container.height();
            if(offsetHeight + 50 >= ch){
                this.container.css('height', ch + 1);
            }
            else if (ch > offsetHeight + 50) {
                if (ch > this.baseHeight) {                    
                    this.container.css('height', ch - 1);
                }
            }

            return false;
        },

        "{document} mouseup": function (e) {

            if (this.isResizing) {

                // Adjust the container height when finish resize
                if (this.container.height() > this.baseHeight) {
                    this.container.css('height', this.pageContent.height() + 50);
                }
                else {
                    this.container.css('height', this.baseHeight);
                }

                // Update the report's size
                this.isResizing = false;
                this.updateSize();
            }
        },        

        start: function(){
            this.layout.init();
        },

        registerComponent: function(componentName, callback){
            this.layout.registerComponent(componentName, callback);
        },

        attachDefaultEvents: function () {
            var that = this;
            this.attachDefaultEvent("stackCreated");

            this.layout.on('initialised', function () {
                setTimeout(function(){
                    that.element.trigger('gl_initialized');
                }, 300);

            });
        },

        attachDefaultEvent: function(name) {
            var that = this;
            this.layout.on(name, function (stack) {
                
                stack.header.controlsContainer.prepend('<div class="golden-layout-btn-container" style="float: left;"></div>');
                if (stack.config.content && stack.config.content.length > 0) {
                    var headerButtonInfo = stack.config.content[0].componentState.headerButtonInfo;
                    if (headerButtonInfo) {
                        var btnContainer = $(stack.header.controlsContainer).find(".golden-layout-btn-container");
                        that.options.addButtonToHeader(btnContainer, headerButtonInfo);
                    }
                }
                    
                
                var callback = that.getCallback(name);
                if (callback) {
                    callback(stack);
                }
            });            
        },

        getCallback: function(name) {
            var events = this.options.layoutOptions.events;
            for (var i = 0; i < events.length; i++) {
                if (events[i].name === name) {
                    return events[i].callback;
                }
            }
        },

        
        attachEvents: function () {
            var events = this.options.layoutOptions.events;
            for (var i = 0; i < events.length; i++) {
                this.attachEvent(events[i].name, events[i].callback);
            }
        },

        attachEvent: function (eventName, callbackMethod) {
            if (this.isDefaultEvent(eventName)) {
                return;
            }

            this.layout.on(eventName, function (el, ev) {
                callbackMethod(el, ev);
            });
        },

        isDefaultEvent: function(name) {
            if (name === "stackCreated") {
                return true;
            }

            return false;
        },

        getLayoutConfig: function () {
            return JSON.stringify(this.layout.toConfig());
        },

        addNewElement: function (newItem) {
            this.checkRootRow();
            var rootRow = this.getRootRow();
            rootRow.addChild(newItem);
        },

        checkRootRow: function() {
            if (this.layout.root.contentItems.length === 0) {
                this.layout.root.addChild({ type: 'row' });
            } else if (this.layout.root.contentItems.length === 1 && this.layout.root.contentItems[0].type !== "row") {
                var stack = this.layout.root.contentItems[0];
                this.layout.root.removeChild(stack, true);
                this.layout.root.addChild({ type: 'row' });
                this.addNewElement(stack);
            }
        },

        getRootRow: function () {        
            return this.layout.root.contentItems[0];
        }
    });
});
