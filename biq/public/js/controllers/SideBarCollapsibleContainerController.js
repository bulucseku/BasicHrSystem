Sentrana.Controllers.CollapsibleContainer("Sentrana.Controllers.SideBarCollapsibleContainer", {
    pluginName: 'sentrana_side_bar_collapsible_container',
    defaults: {
        expandIcon: 'fa fa-angle-right',
        collapseIcon: 'fa fa-angle-down'
    }
}, {
    init: function () {
        this.panelTemplate = 'templates/sideBarCollapsiblePanel.ejs';
        this.containerButtonTemplate = 'lib/sentrana/collapsible/templates/collapsibleContainerActionButton.ejs';

        // Add the Collapsible panel to the container
        this.element.append(can.view(this.panelTemplate, {
            panelTitle: this.options.title
        }));

        // Extract out key elements of the container...
        this.$indicator = this.element.find(".sideBarIndicator");
        this.$content = this.element.find(".sideBarCollapsibleContainerContent");
        this.$buttonBar = this.element.find(".sideBarButtonBar");
        this.$title = this.element.find(".sideBarCollapsibleContainerTitle");

        // Construct the Panel UI
        this.buildCollapsiblePanelUI();
    },

    ".sideBarCollapsibleContainerTitle click": function (el, ev) {
        this.showHideCollapsibleContent();

        if (this.UIState.expanded) {
            //scroll to the selected container
            var $scrollingParent = this.$content.closest('.scrollable-panel');
            $scrollingParent.animate({
                scrollTop: this.$title.offset().top - $scrollingParent.offset().top + $scrollingParent.scrollTop()
            });
        }

        // Stop the event from propagating up the DOM element chain...
        return false;
    }
});
