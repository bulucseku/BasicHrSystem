can.Control.extend("Sentrana.Controllers.CollapsibleContainer", {
        pluginName: 'sentrana_collapsible_container',
        defaults: {
            title: 'Untitled',
            titleIconClass: '',
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            initialCollapsed: false,
            titleCssClass: '',
            titleElements:[],
            callBackFunctionOnExpand: undefined,
            callBackFunctionOnCollapse: undefined,
            expandIcon: 'fa fa-plus-square',
            collapseIcon: 'fa fa-minus-square'
        }
    },
    {
        init: function () {
            this.panelTemplate = 'lib/sentrana/collapsible/templates/collapsibleContainer.ejs';
            this.containerButtonTemplate = 'lib/sentrana/collapsible/templates/collapsibleContainerActionButton.ejs';

            // Add the Collapsible panel to the container
            var content = this.element.html();
            var title = (this.options.title||this.element.attr('title'));
            this.element.html(can.view(this.panelTemplate, { panelTitle: title, allowCollapsible: this.options.allowCollapsible, iconClass : this.options.titleIconClass}));

            // Extract out key elements of the container...
            this.$indicator = this.element.find(".indicator");
            this.$content = this.element.find(".collapsibleContainerContent");
            this.$content.append(content);
            this.$buttonBar = this.element.find(".buttonBar");
            this.$title = this.element.find(".collapsibleContainerTitle");
            var that=this;
            this.options.titleElements.forEach(function(element) {
                that.$buttonBar.prepend(element);
            });
            // Construct the Panel UI
            this.buildCollapsiblePanelUI();
        },

        buildCollapsiblePanelUI: function () {
            this.UIState = { expanded: false };
            // Should we NOT show the header?
            if (!this.options.showHeader) {
                this.$title.hide();
            }

            // Should we NOT show the border?
            if (!this.options.showBorder) {
                this.$content.addClass("no-border");
            }

            // Are we Collapsible?
            if (this.options.allowCollapsible) {
                // Indicate the correct cursor...
                this.$title.css({ "cursor": "pointer" });
            }

            // Initial state
            if (!this.options.initialCollapsed) {
                this.$content.show();
                this.showExpandIcon(true);
            } else {
                this.showExpandIcon(false);
            }

            //add child css
            this.$title.addClass(this.options.titleCssClass);
        },

        removeButtonFromBar: function CC_removeButtonFromBar(buttonInfo) {
            // Sanity check
            if (!buttonInfo || !buttonInfo.cls) {
                return;
            }

            var buttonSelector = "." + buttonInfo.cls,
                $button = this.$buttonBar.find(buttonSelector).closest('.cc-button');

            // Is there already a button in the bar?
            if ($button.length) {
                // remove the button
                $button.remove();
            }
        },

        addButtonToBar: function CC_addButtonToBar(buttonInfo) {
            // Sanity check
            if (!buttonInfo || !buttonInfo.cls) {
                return;
            }

            if (!buttonInfo.btnStyle) {
                buttonInfo.btnStyle = "";
            }

            var buttonSelector = "." + buttonInfo.cls,
                $button = this.$buttonBar.find(buttonSelector).closest('.cc-button');

            // Is there already a button in the bar?
            if ($button.length) {
                // Unregister the existing handler...
                $button.off("click");
            } else {
                // Add the button to the bar...
                this.$buttonBar.append(this.containerButtonTemplate, buttonInfo);

                // Get the jQuery object...
                $button = this.$buttonBar.find(buttonSelector).closest('.cc-button');
            }

            // Register a handler for click events...
            var that = this;
            $button.on("click", function (event) {
                if (buttonInfo.dropdown) {
                    var $dropDown = $button.find(".container-drop-down");
                    // Update dropdown menu position
                    var pos = $(event.delegateTarget).position();
                    $dropDown.css({ top: pos.top + $(event.delegateTarget).height(), left: pos.left - $dropDown.width() + $(event.delegateTarget).width()});
                    $dropDown.show();

                    //Remove all previous events
                    $dropDown.find(".container-button-menu").off("click");

                    $dropDown.find(".container-button-menu").on("click", function (event) {
                        $dropDown.hide();
                        $(this).trigger(buttonInfo.eventType, { type: $(this).attr('elementid') });
                        // The click event stops at the current div.
                        event.stopPropagation();

                    });
                    // Hide the menu if the mouse leaves the menu.
                    $dropDown.on("mouseleave", function (event) {
                        $dropDown.hide();
                    });
                } else {
                    // Trigger the event
                    that.element.trigger(buttonInfo.eventType, buttonInfo.eventArgs);
                }
                return false;
            });
        },

        getContainerPanel: function () {
            return this.$content;
        },

        showExpandIcon: function CC_showExpandIcon(expand) {
            this.UIState.expanded = expand;
            if (expand) {
                this.$indicator.removeClass(this.options.expandIcon);
                this.$indicator.addClass(this.options.collapseIcon);
            } else {
                this.$indicator.removeClass(this.options.collapseIcon);
                this.$indicator.addClass(this.options.expandIcon);
            }
        },

        showHideCollapsibleContent: function () {
            var that = this;
            // Are we not allowed to collapse?
            if (this.options.allowCollapsible) {

                var isVisible = this.UIState.expanded;

                // Change the icon...
                this.showExpandIcon(!isVisible);

                // Toggle the container display
                this.$content.animate({
                    "height": "toggle",
                    "marginTop": "toggle",
                    "marginBottom": "toggle",
                    "paddingTop": "toggle",
                    "paddingBottom": "toggle"
                }, function(){
                    //Call the callback functions
                    if (isVisible) {
                        /* If the callback function is not empty then call it*/
                        if (that.options.callBackFunctionOnCollapse && typeof that.options.callBackFunctionOnCollapse === 'function') {
                            that.options.callBackFunctionOnCollapse();
                        }
                    } else {
                        /* If the callback function is not empty then call it*/
                        if (that.options.callBackFunctionOnExpand && typeof that.options.callBackFunctionOnExpand === 'function') {
                            that.options.callBackFunctionOnExpand();
                        }
                    }
                });
            }
        },

        ".collapsibleContainerTitle click": function (el, ev) {
            if (this.options.allowCollapsible) {
                this.showHideCollapsibleContent();
                // Stop the event from propagating up the DOM element chain...
                return false;
            }
        }
    });