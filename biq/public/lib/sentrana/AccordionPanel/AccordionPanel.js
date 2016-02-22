can.Control.extend("Sentrana.Controllers.AccordionPanel", {
    pluginName: 'sentrana_accordion_panel',
    defaults: {
        basePath: "lib/sentrana/AccordionPanel", /* This is the relative path from the document root to the resources for this control. */
        templatesPath: "templates", /* This is the relative path from the basePath to the templates folder. */
        tmplAccordion: "accordion-main-panel.ejs",
        model: null
    }
},
{
    init: function AP_init() {
        this.headers = this.options.headers;
        this.controllSettings = this.options.controllSettings;
        this.callBack = this.options.callBack;
        this.accordionOptions = {};
        this.updateView();
    },
    update: function () {
        this._super();
        this.updateView();
    },

    updateView: function () {
        var that = this;

        //collect settings for accordion
        that.collectAccodionOptions(that);

        //load template to build accordion markup
        $(that.element).html(can.view(that.getTemplatePath(that.options.tmplAccordion), { headers: that.headers, pinHeaderText: that.accordionOptions.pinHeaderText }));

        //collapse the accordion on the left or the right based on configuration
        that.alignMarginDocPanel(that);

        //hide top panel if it is not requried
        that.hideTopPanel(that);

        //build the accordion control
        that.buildAccordionControl(that);

        //show or hide top panel with or without pin
        that.showHideTopPanelAndPin(that);

        //show or hide accordion panel/margin docPanel
        that.handleMarginDocPanelEvent(that);

        //dock the accordion when the header is clicked
        that.handleTopDocPanelEvent(that);
    },
    //Instance Method: collect accordion options locally...
    collectAccodionOptions: function (that) {
        that.accordionOptions = {
            showHeaderIcon: that.controllSettings.showHeaderIcon,   //header icons are required (true, false)
            showTopPanelWithPin: that.controllSettings.showTopPanelWithPin, //both top panel and pin option are required (true, false)
            showTopPanelWithoutPin: that.controllSettings.showTopPanelWithoutPin,   //top panel required but pin option is not required (true, false)
            hideTopPanel: that.controllSettings.hideTopPanel,   //no top panel required (true, false)
            pinHeaderText: that.controllSettings.pinHeaderText, //top panel text
            dockMarginPanelAt: that.controllSettings.dockMarginPanelAt, //direction of the dockable margin panel ("left", "right")
            icons: { "header": that.controllSettings.collapseIcon, "headerSelected": that.controllSettings.expandIcon },    //header icons
            activeIndex: that.controllSettings.activeIndex //default header
        };
    },
    //Instance Method: Build accordion control...
    buildAccordionControl: function (that) {
        $('.accordion-main', that.element).accordion({
            active: that.accordionOptions.activeIndex,
            heightStyle: "fill",
            create: function (event, ui) {
                if (that.accordionOptions.showHeaderIcon) {
                    //set the icon for inactive header(s)
                    $(".accordion-main .ui-accordion-header[aria-selected='false'] span", that.element).each(function () {
                        this.className = that.accordionOptions.icons.header;
                    });

                    //set the icon for active header
                    $(".accordion-main .ui-accordion-header[aria-selected='true'] span", that.element).each(function () {
                        this.className = that.accordionOptions.icons.headerSelected;
                    });
                } else {
                    //make the header icon invisible if the showIcon is false
                    $(".accordion-main .ui-accordion-header span", that.element).each(function () {
                        this.className = "";
                    });
                }
                that.callBack(that.headers[that.accordionOptions.activeIndex].headerId);
            },
            beforeActivate: function (event, ui) {
                if (that.accordionOptions.showHeaderIcon) {
                    //change icons when any header is made active or inactive
                    ui.oldHeader[0].children[0].className = that.accordionOptions.icons.header;
                    ui.newHeader[0].children[0].className = that.accordionOptions.icons.headerSelected;
                } else {
                    //make the header icon invisible if the showIcon is false
                    $(".accordion-main .ui-accordion-header span", that.element).each(function () {
                        this.className = "";
                    });
                }
                var activePanel = ui.newPanel[0].attributes.id.value;
                that.callBack(activePanel);
            }
        });
    },
    //Instance Method: align margin docPanel...
    alignMarginDocPanel: function (that) {
        if (that.accordionOptions.dockMarginPanelAt === "right") {
            $('.margin-dock-panel', that.element).removeClass('float-left').removeClass('float-right').addClass('float-right');
        } else {
            $('.margin-dock-panel', that.element).removeClass('float-left').removeClass('float-right').addClass('float-left');
        }
    },
    //Instance Method: hide top panel...
    hideTopPanel: function (that) {
        if (that.accordionOptions.hideTopPanel) {
            $('.top-dock-panel', that.element).hide();
        }
    },
    //Instance Method: show/hide top panel pin...
    showHideTopPanelAndPin: function (that) {
        if (that.accordionOptions.showTopPanelWithPin) { //show only margin dock panel if pin option is required
            $('.margin-dock-panel', that.element).show();
            $('.accordion-whole-panel', that.element).hide();
        } else if (that.accordionOptions.showTopPanelWithoutPin) {   //show top panel but without the pin button if top panel is required without pin option
            $('.margin-dock-panel', that.element).hide();
            $('.top-dock-panel', that.element).show().addClass('cursor-default');
            $('.button_wrapper', that.element).hide();
        } else if (that.accordionOptions.hideTopPanel) { //hide margin dock panel if neither pin option nor top panel is required
            $('.margin-dock-panel', that.element).hide();
        }
    },
    //Instance Method: show/hide margin docPanel/accordion panel...
    handleMarginDocPanelEvent: function (that) {
        //open the accordion when mouse is over margin-panel
        $('.margin-dock-panel', that.element).unbind('mouseover').bind('mouseover', function () {
            $('.top-dock-panel', that.element).removeClass('click-state-active').removeClass('click-state-inactive').addClass('click-state-inactive');
            $('.top-panel-image', that.element).removeClass('undock-image').removeClass('dock-image').addClass('dock-image');

            //hide the margin panel when mouse is over
            $(this).hide("fast", function () {
                //change the accordion slide direction according to margin panel alignment
                $('.accordion-whole-panel', that.element).show("slide", { direction: (that.accordionOptions.dockMarginPanelAt === "right") ? "right" : "left" }, "slow");
            });
        });

        //open the margin-panel when mouse has left accordion
        $('.accordion-panel', that.element).unbind('mouseleave').bind('mouseleave', function () {
            if (that.accordionOptions.showTopPanelWithPin && $('.top-dock-panel', that.element).hasClass('click-state-inactive')) {
                //change the accordion slide direction according to margin panel alignment
                $('.accordion-whole-panel', that.element).hide("slide", { direction: (that.accordionOptions.dockMarginPanelAt === "right") ? "right" : "left" }, "slow", function () {
                    $('.margin-dock-panel', that.element).show();
                });
            }
        });
    },
    //Instance Method: handle click event for top panel...
    handleTopDocPanelEvent: function (that) {
        $('.top-dock-panel', that.element).unbind('click').bind('click', function () {
            if ($(this).hasClass('click-state-inactive')) {
                //change the top panel pin icon when it is clicked and show the accordion panel
                $(this).removeClass('click-state-active').removeClass('click-state-inactive').addClass('click-state-active');
                $('.top-panel-image', that.element).removeClass('undock-image').removeClass('dock-image').addClass('undock-image');
                $('.accordion-whole-panel', that.element).show();
            } else if ($(this).hasClass('click-state-active')) {
                //change the top panel pin icon when it is clicked and hide the accordion panel
                $(this).removeClass('click-state-active').addClass('click-state-inactive').addClass('click-state-inactive');
                $('.top-panel-image', that.element).removeClass('undock-image').removeClass('dock-image').addClass('dock-image');

                //change the accordion slide direction according to margin panel alignment
                $('.accordion-whole-panel', that.element).hide("slide", { direction: (that.accordionOptions.dockMarginPanelAt === "right") ? "right" : "left" }, "slow", function () {
                    $('.margin-dock-panel', that.element).show();
                });
            }
        });
    },
    // Instance method: Get the path to a template file...
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