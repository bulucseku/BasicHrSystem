can.Control.extend("Sentrana.Controllers.ReportFilterContainer", {
    pluginName: 'sentrana_report_filter_container',
    defaults: {
        app: null
    }
}, {
    init: function reportFilterContainerInit() {
        this.dwRepository = this.options.app.dwRepository;
        this.addFilterPanels();
        this.makeFilterDropable();
    },

    makeFilterDropable: function () {
        var that = this;
        this.element.find(".report-filter-drop-area").droppable({
            drop: function (event, ui) {
                var object = ui.draggable.find(".object-selector"),
                    type = $(event.target).attr("type");
                that.AddFilter(object.attr("hid"), type);
            }
        });
    },
    
    AddFilter: function (hid, type) {
        var object = this.options.app.dwRepository.objectMap[hid];
        if (!object.dimName) {
            return;
        }
        var filters = {}, element;
        switch (type) {
            case "report":
                filters = this.options.model.filters;
                element = this.$reportFilter;
                break;
            case "page":
                filters = this.options.model.pages[0].filters;
                element = this.$pageFilter;
                break;
            case "element":
                filters = this.options.model.pages[0].reportElements[0].filters;
                element = this.$elementFilter;
                break;
            default:
        }

        if (!filters[object.dimName]) {
            filters[object.dimName] = [];
        }

        if (!this.isFilterExists(filters[object.dimName], hid)) {
            filters[object.dimName].push(object);
            this.addFilterToUI(element, type, object, false);
        }
    },

    isFilterExists: function(filters, hid) {
        var items =$.grep(filters, function(filter) {
            return filter.hid === hid;
        });

        return items.length > 0;
    },

    addFilterPanels: function() {
        this.$reportFilter = this.getFilterPanel("attribute-elements-report-filter", "Report Filter", "report");
        this.$pageFilter = this.getFilterPanel("attribute-elements-page-filter", "Page Filter", "page");
        this.$elementFilter = this.getFilterPanel("attribute-elements-element-filter", "Element Filter", "element");
    },

    getFilterPanel: function (className, title, type) {
        var that = this;
        this.element.find(".attribute-elements").append('<div type="' + type + '" class="report-filter-drop-area  ' + className + '"></div>');
        var $filterElement= this.element.find("." + className).sentrana_side_bar_collapsible_container({
            title: title,
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            callBackFunctionOnExpand: function () {
                that.options.app.handleUserInteraction();
            },
            callBackFunctionOnCollapse: function () {
                that.options.app.handleUserInteraction();
            }
        }).control();

        return $filterElement.getContainerPanel();
    },
    
    loadFilters: function (element, type, attributes) {
        for (var i = 0; i < attributes.length; i++) {
            this.addFilterToUI(element, type, attributes[i], i === 0);
        }
    },

    addFilterToUI: function (element, tag, attr, firstFilter) {
        var that = this;
        var dimName = attr.dimName, dim = this.options.app.dwRepository.dimensions[dimName];
        if (dim) {

            if (attr.formMap[attr.defaultFormId].elements || attr.filterControl === 'Calendar') {
                var nameWithOutSpecialChar = attr.name.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
                var dimNameWithOutSpecialChar = dimName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');

                var filterClass = "filter-" + dimNameWithOutSpecialChar + nameWithOutSpecialChar;
                element.append('<div class="' + filterClass + ' filter-element-container" ></div>');
                var $filterElement = element.find('.' + filterClass);

                var filter = $filterElement.sentrana_only_when_collapsible_container({
                    title: attr.name + ' (' + attr.dimName + ')',
                    showHeader: true,
                    showBorder: true,
                    titleCssClass: 'child',
                    allowCollapsible: true,
                    initialCollapsed: !firstFilter,
                    callBackFunctionOnExpand: function(attrCopy, $filterElementCopy) {
                        return function() {
                            that.options.app.handleUserInteraction();
                            if (!$.trim($filterElementCopy.find(".onlywhen-element-filter").html()).length) {
                                that.initFilterControl(attrCopy, tag);
                            }
                        };
                    }(attr, $filterElement),
                    callBackFunctionOnCollapse: function() {
                        that.options.app.handleUserInteraction();
                    }
                }).control();

                filter.addButtonToBar({ "title": "Remove this filter", "cls": "fa fa-times", "eventType": "remove_filter", "dropdown": false });
                var $filterPanel = filter.getContainerPanel(),
                    $filterPanelContainer = $filterPanel.parent(),
                    $btn = $filterPanelContainer.find(".sideBarButtonBar");

                $filterPanelContainer.find(".sideBarCollapsibleContainerTitle").addClass("position-relative");
                $btn.addClass("btn-report-filter-remove").hide().attr("hid", attr.hid).attr("oid", attr.oid).attr("type", $(element).closest(".report-filter-drop-area").attr("type"));
                $btn.on("click", function(el) {
                    var param = { hid: $(this).attr("hid"), oid: $(this).attr("oid"), type: $(this).attr("type") };
                    if (that.removeFilter(param)) {
                        $(this).closest(".filter-element-container ").remove();
                    }
                    return false;
                });

                $filterPanelContainer.on("mouseover", function(el) {
                    $(this).find('.sideBarButtonBar').show();
                });

                $filterPanelContainer.on("mouseout", function(el) {
                    $(this).find('.sideBarButtonBar').hide();
                });


                $filterPanel.append(can.view('templates/elementHeaderOnlyWhen.ejs', {
                    attr: attr,
                    group: dimNameWithOutSpecialChar + nameWithOutSpecialChar + "-" + tag,
                    tag: tag
                }));

                if (firstFilter || attr.filterControl === 'Calendar') {
                    this.initFilterControl(attr, tag);
                }
            }
        }
    },
    
    initFilterControl: function (attr, tag) {
        var that = this, filterElementHids = "";//this.getFilterElementsId();

        var param = {
            dwRepository: that.dwRepository,
            dwSelection: [],
            attr: attr,
            form: null,
            filterentHids: filterElementHids,
            filters: []
        };

        $.each(attr.forms, function (index, form) {

            if (form.dataFilterOperator) {
                switch (form.dataFilterOperator.toUpperCase()) {
                    case "IN":
                        form.elements = $.grep(form.elements, function (obj) {
                            return obj.isFilteredByDataFilter === true;
                        });
                        break;
                    case "NOT IN":
                        form.elements = $.grep(form.elements, function (obj) {
                            return obj.isFilteredByDataFilter === false;
                        });
                        break;

                    default:
                        break;
                }
            }

            param.form = form;
            param.tag = tag;

            if (attr.filterControl === 'Button' || !attr.filterControl) {
                // Button is the default filter control
                $(".onlywhen-elements-" + attr.oid + "-" + form.oid + "-" + tag, this.element).sentrana_filter_control_checkbox_only_when(param);
            }
            if (attr.filterControl === 'Tree') {
                $(".onlywhen-elements-" + attr.oid + "-" + form.oid + "-" + tag, this.element).sentrana_filter_control_tree_only_when(param);
            }
            if (attr.filterControl === 'ListBox') {
                $(".onlywhen-elements-" + attr.oid + "-" + form.oid + "-" + tag, this.element).sentrana_filter_control_list_box_only_when(param);
            }

        });

        $('input[placeholder]').inputHints();

    },

    '.formsRadio input[type="radio"] click': function (el, ev) {
        var attrOid = el.attr("attrOID"),
            tag = el.attr("tag"),
            formOid = el.val();

        this.element.find(".onlywhen-formElements-" + attrOid).hide();
        this.element.find(".onlywhen-elements-" + attrOid + "-" + formOid + "-" + tag).show();
    },

    removeFilter: function (param) {
        var filters = {};
        switch (param.type) {
            case "report":
                filters = this.options.model.filters;
                
                break;
            case "page":
                filters = this.options.model.pages[0].filters;
                break;
            case "element":
                filters = this.options.model.pages[0].reportElements[0].filters;
                break;
            default:
        }

        var object = this.options.app.dwRepository.objectMap[param.hid],
            attributes = filters[object.dimName];
        
        var index = attributes.map(function (item) { return item.hid; }).indexOf(param.hid);

        if (index > -1) {
            attributes.splice(index, 1);
        }

        return true;
    }, 
    
    getFilterIndex: function(filters, hid) {
        for (var i = 0; i < filters.length; i++) {
            if (filters[i].hid === hid) {
                return i;
            }
        }
        return -1;
    }

    
});