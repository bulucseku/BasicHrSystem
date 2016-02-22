can.Control.extend("Sentrana.Controllers.ReportColumns", {
    pluginName: 'sentrana_report_columns',
    defaults: {
        app: null
    }
}, {
    init: function reportColumnsInit() {
        this.dwRepository= this.options.app.dwRepository;
        this.loadColumns();
    },

    loadColumns: function () {
        this.loadMetrics();
        this.loadDimensions();
    },

    loadMetrics: function() {
        var that = this;
        if (this.dwRepository.hasMetrics()) {
            this.metricsContainerController = this.element.find('.metrics-panel').sentrana_collapsible_container({
                title: 'Metrics',
                titleIconClass: 'fa fa-columns',
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

            this.$metrics = this.metricsContainerController.getContainerPanel();
            this.buildMetricsUI();
        }
    },

    buildMetricsUI: function () {
        var title = "Performance Metrics";

        this.$metrics.append('<div class="performance-metrics-grp"></div>');
        var $performanceMetricsGroup = this.element.find('.performance-metrics-grp');
        var that = this;

        var performanceMetricsContainer = $performanceMetricsGroup.sentrana_side_bar_collapsible_container({
            title: title,
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            callBackFunctionOnExpand: function() {
                that.options.app.handleUserInteraction();
            },
            callBackFunctionOnCollapse: function() {
                that.options.app.handleUserInteraction();
            }
        }).control().getContainerPanel();

        if (this.dwRepository.isOnlyOneGroup()) {
            performanceMetricsContainer.append('<div class="performance-metrics-' + this.dwRepository.metricGroups[0].id + '" ></div>');
            $('.performance-metrics-' + this.dwRepository.metricGroups[0].id + '', this.element).append(can.view('templates/objectCheckBox.ejs', {
                prefix: 'reportbuilder',
                objects: this.dwRepository.metricGroups[0].metrics,
                totoalCount: this.dwRepository.metricGroups[0].metrics.length
            }));
        } else {
            for (var i = 0; i < this.dwRepository.metricGroups.length; i++) {
                if (this.dwRepository.metricGroups[i].metrics.length) {
                    performanceMetricsContainer.append('<div class="performance-metrics-' + this.dwRepository.metricGroups[i].id + '" ></div>');
                    var $performanceMetrics = this.element.find('.performance-metrics-' + this.dwRepository.metricGroups[i].id + '').sentrana_side_bar_collapsible_container({
                        title: this.dwRepository.metricGroups[i].name,
                        showHeader: true,
                        showBorder: true,
                        allowCollapsible: true,
                        titleCssClass: 'child',
                        callBackFunctionOnExpand: function() {
                            that.options.app.handleUserInteraction();
                        },
                        callBackFunctionOnCollapse: function() {
                            that.options.app.handleUserInteraction();
                        }
                    }).control().getContainerPanel();
                    $performanceMetrics.append(can.view('templates/objectCheckBox.ejs', {
                        prefix: 'reportbuilder',
                        objects: this.dwRepository.metricGroups[i].metrics,
                        totoalCount: this.dwRepository.metricGroups[i].metrics.length
                    }));
                }
            }
        }

    },

    loadDimensions: function () {
        var that = this;
        this.$dimention = this.element.find('.dimension').sentrana_collapsible_container({
            title: 'Attributes',
            titleIconClass: 'fa fa-bars',
            showHeader: true,
            showBorder: true,
            allowCollapsible: true,
            callBackFunctionOnExpand: function () {
                that.options.app.handleUserInteraction();
            },
            callBackFunctionOnCollapse: function () {
                that.options.app.handleUserInteraction();
            }
        }).control().getContainerPanel();

        this.buildAttributesUI();
    },

    buildAttributesUI: function() {
        var that = this;
        for (var i = 0, l = this.dwRepository.dimensionNames.length; i < l; i++) {
            // Get the ith dimension...
            var dimName = this.dwRepository.dimensionNames[i],
                dim = this.dwRepository.dimensions[dimName];
            if (dim) {
                var nameWithOutSpecialChar = dimName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');

                this.$dimention.append('<div class="dimension-' + nameWithOutSpecialChar + '"></div>');
                var dimension = this.element.find('.dimension-' + nameWithOutSpecialChar).sentrana_side_bar_collapsible_container({
                    title: dimName,
                    showHeader: true,
                    showBorder: true,
                    allowCollapsible: true,
                    callBackFunctionOnExpand: function () {
                        that.options.app.handleUserInteraction();
                    },
                    callBackFunctionOnCollapse: function () {
                        that.options.app.handleUserInteraction();
                    }
                }).control().getContainerPanel();

                var segmentableAttributes = $.grep(dim.attributes, function (attribute, index) {
                    return (attribute.segmentable);
                });

                // Loop through the list of attributes...
                $(dimension).append(can.view('templates/objectCheckBox.ejs', { prefix: 'reportbuilder', objects: segmentableAttributes, totoalCount: segmentableAttributes.length }));
            }
        }
    },

    '.object-selector change': function (el, ev) {
        var objectMap = this.dwRepository.objectMap;
        var object = objectMap[$(el).attr("hid")];

        // This is only for metric and attribute.
        if (object.type !== "ELEMENT") {
            var htmlId = el.attr("hid"),
                isSelected = el.hasClass("object-selected");

            this.options.dwSelection[(isSelected) ? "deselectObject" : "selectObject"](htmlId);
        }
    },

    "{dwSelection} change": function (model, ev, attr, how, newVal, oldVal) {
        var htmlId = attr;
        this.updateSelectClass(htmlId, how);
    },

    updateSelectClass: function (htmlId, how) {
        var $div = $.merge(this.element.find('.object-selector[hid="' + htmlId + '"]'), this.element.find('.tree-node-selector[hid="' + htmlId + '"]'));
        $div = $.merge($div, this.element.find('.element-filter-listbox option[hid="' + htmlId + '"]'));

        var $element, $sel;
        
        if ($div.length > 0) {
            if (how === "add") {
                $div.addClass("object-selected");
                $element = $('.object-selector[hid="' + htmlId + '"]');

                if (!$($element).is(':checked')) {
                    $($element).prop('checked', true);
                }
                if ($div.is('option')) {
                    $div.attr("selected", "selected");
                }
                if ($($div).is('a')) {
                    $div.addClass("tree-node-selected");
                }

            }
            else if (how === "remove") {
               
                if ($($div).is('input[type="checkbox"]')) {
                    $div.removeClass("object-selected");
                    if ($($div).is(':checked')) {
                        $element = $('.object-selector[hid="' + htmlId + '"]');
                        $($element).prop('checked', false);
                    }
                }
                else if ($($div).is('option')) {
                    $sel = $($div).parent('select');
                    $.each($sel.find(":selected"), function (index, value) {
                        if ($(value).attr('hid') === htmlId) {
                            $(value).removeAttr("selected");
                            $(value).removeClass("object-selected");
                        }
                    });
                }
                else if ($($div).is('a')) {
                    $div.removeClass("object-selected");
                    $div.removeClass("tree-node-selected");
                }
            }
        }

    }


});