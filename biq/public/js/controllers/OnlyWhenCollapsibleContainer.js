Sentrana.Controllers.SideBarCollapsibleContainer("Sentrana.Controllers.OnlyWhenCollapsibleContainer", {
    pluginName: 'sentrana_only_when_collapsible_container',
    defaults: {}
}, {
    ".sideBarCollapsibleContainerTitle click": function (el, ev) {
        this.showHideCollapsibleContent();
        return false;
    }
});
