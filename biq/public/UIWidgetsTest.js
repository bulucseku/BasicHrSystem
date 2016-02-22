steal("UIWidgetsTestLib.js", function () {
    $(document).ready(function () {
        //plain list sinple
        var items = [{
            iconClass: 'fa fa-cloud semi-green',
            text: 'Item 1',
            label: '56 GB'
        }, {
            iconClass: 'fa fa-table semi-red',
            text: 'Item 2',
            label: '128'
        }, {
            iconClass: 'fa fa-code-fork semi-blue',
            text: 'Item 3',
            label: '12'
        }];
        $('.panel-with-plain-list-single').sentrana_plain_list({items: items});

        //info list single
        var infoListItems = [{
            text: 'Created',
            description: '08/19/2015 @ 10:08am'
        }, {
            text: 'Modified',
            description: '08/20/2015 @ 01:45pm'
        }, {
            text: 'Description',
            description: 'This table is designed to test a long text'
        }, {
            text: 'Shared width',
            description: 'Daniel Gonzalez'
        }];

        $('.panel-with-info-list-single').sentrana_info_list({items: infoListItems});

        //Panel
        var singlePanel = $('.single-panel').sentrana_collapsible_container({
            title: 'Panel',
            titleIconClass: 'fa fa-dashboard white',
            showHeader: true,
            showBorder: true,
            allowCollapsible: false,
            titleCssClass: 'panelHeader',
            callBackFunctionOnExpand: function () {

            },
            callBackFunctionOnCollapse: function () {

            }
        }).control();

        var singlePanelContainer = singlePanel.getContainerPanel();
        singlePanelContainer.append('Put your content here');

        //Dropdown list
        $('.panel-with-dropdown-single').sentrana_dropdown_menu({});


        //Composite widgets

        //Panel with Plain list
        var panelWithPlainList = $('#panel-with-plain-list').sentrana_collapsible_container({
            title: 'Panel w/ Plain List',
            titleIconClass: 'fa fa-dashboard white',
            showHeader: true,
            showBorder: true,
            allowCollapsible: false,
            titleCssClass: 'panelHeader',
            callBackFunctionOnExpand: function () {

            },
            callBackFunctionOnCollapse: function () {

            }
        }).control();

        //var properties = new Sentrana.UI.Widgets.Properties.Model.PlainList();
       items = [{
            iconClass: 'fa fa-cloud semi-green',
            text: 'Item 1',
            label: '56 GB'
        }, {
            iconClass: 'fa fa-table semi-red',
            text: 'Item 2',
            label: '128'
        }, {
            iconClass: 'fa fa-code-fork semi-blue',
            text: 'Item 3',
            label: '12'
        }];

        var panelWithPlainListContainer = panelWithPlainList.getContainerPanel();
        panelWithPlainListContainer.sentrana_plain_list({items: items});

        // Panel with Tab and Drop down list
        var panelWithTabAndDropDownList = $('#panel-with-tab-and-drop-down-list').sentrana_collapsible_container({
            title: 'Panel w/ Tabs & Dropdown List',
            titleIconClass: 'fa fa-table white',
            showHeader: true,
            showBorder: true,
            allowCollapsible: false,
            titleCssClass: 'panelHeader',
            callBackFunctionOnExpand: function () {

            },
            callBackFunctionOnCollapse: function () {

            }
        }).control();

        var panelWithTabAndDropDownListContainer = panelWithTabAndDropDownList.getContainerPanel();

        // Page widget
        var pageControl = panelWithTabAndDropDownListContainer.sentrana_page_widget({
            app: this,
            reportModel: new Sentrana.Models.ReportModel(),
            pageTitle: 'Page Title',
            isEditMode: true
        }).control();

        var firstPageId = pageControl.getFirstPageId();
        if (firstPageId) {
            $('#' + firstPageId).sentrana_dropdown_menu({});
        }


        // Panel with Drop down list
        var panelWithDropDownList = $('#panel-with-drop-down-list').sentrana_collapsible_container({
            title: 'Panel w/ Dropdown List',
            titleIconClass: 'fa fa-table white',
            showHeader: true,
            showBorder: true,
            allowCollapsible: false,
            titleCssClass: 'panelHeader',
            callBackFunctionOnExpand: function () {

            },
            callBackFunctionOnCollapse: function () {

            }
        }).control();

        var panelWithDropDownListContainer = panelWithDropDownList.getContainerPanel();

        //var nodeItems = [
        //            { "id": "item-1", "parent": "#", "text": "Item-1" },
        //            { "id": "item-2", "parent": "#", "text": "Item-2" },
        //            { "id": "item-11", "parent": "item-1", "text": "Item-11" },
        //            { "id": "item-22", "parent": "item-1", "text": "Item-22" },
        //            { "id": "item-111", "parent": "item-2", "text": "Item-111" },
        //            { "id": "item-222", "parent": "item-2", "text": "Item-222" }                    
        //];
        //panelWithDropDownListContainer.sentrana_tree_widget({ nodeItems: nodeItems });
        //$(panelWithDropDownListContainer).on("nodeItemClicked", function (event, nodeValue) {
        //    alert('Selected node value: ' + nodeValue);
        //});

        panelWithDropDownListContainer.sentrana_dropdown_menu({});


        // Panel with tabs and clickable list
        var panelWithTabAndClickableList = $('#panel-with-tab-and-clickable-list').sentrana_collapsible_container({
            title: 'Panel w/ Tabs & Clickable List',
            titleIconClass: 'fa fa-code-fork white',
            showHeader: true,
            showBorder: true,
            allowCollapsible: false,
            titleCssClass: 'panelHeader',
            callBackFunctionOnExpand: function () {

            },
            callBackFunctionOnCollapse: function () {

            }
        }).control();


       var clickableItems = [{
            iconClass: 'fa fa-code-fork semi-blue',
            text: 'Item 1'
        }, {
            iconClass: 'fa fa-code-fork semi-blue',
            text: 'Item 2'
        }, {
            iconClass: 'fa fa-code-fork semi-blue',
            text: 'Item 3'
        }];

        var panelWithTabAndClickableListContainer = panelWithTabAndClickableList.getContainerPanel();
        panelWithTabAndClickableListContainer.sentrana_plain_list({items: clickableItems});

        // Panel with info list
        var panelWithInfoList = $('#panel-with-info-list').sentrana_collapsible_container({
            title: 'Panel w/ Info List',
            titleIconClass: 'fa fa-info white',
            showHeader: true,
            showBorder: true,
            allowCollapsible: false,
            titleCssClass: 'panelHeader',
            callBackFunctionOnExpand: function () {

            },
            callBackFunctionOnCollapse: function () {

            }
        }).control();

        var panelWithInfoListContainer = panelWithInfoList.getContainerPanel();


        var plainListItems = [{
            text: 'Created',
            description: '08/19/2015 @ 10:08am'
        }, {
            text: 'Modified',
            description: '08/20/2015 @ 01:45pm'
        }, {
            text: 'Description',
            description: 'This table is designed to test a long text'
        }, {
            text: 'Shared width',
            description: 'Daniel Gonzalez'
        }];

        panelWithInfoListContainer.sentrana_info_list({items: plainListItems});

    });
});

