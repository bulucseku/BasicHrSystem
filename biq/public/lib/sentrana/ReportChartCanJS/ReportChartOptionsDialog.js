steal("lib/sentrana/DialogControl/SentranaDialog.js", function() {

    Sentrana.Controllers.Dialog.extend("Sentrana.Controllers.ChartUserOptionsDialog", {
        pluginName: 'sentrana_chart_user_options_dialog',
        defaults: {
            model: null,
            title: "Chart Options",
            autoOpen: false,
            onCancel: null,
            onOk: null,
            buttons: [{
                label: "CANCEL",
                className: "btn-cancel btn-default"
            }, {
                label: "OK",
                className: "btn-ok btn-primary"
            }]
        }
    }, {
        init: function(el, options) {
            this._super(el, options);
            // Update UI based on values we have for these options.
            this.toggleAttrColumnSeg($(".input-auto-seg", this.element));
            // Initialize tooltips for elements in the dialog.
            this.initTips();
        },

        // Instance Method: Open the dialog with a report model
        open: function () {
            // Open the dialog...
            this.openDialog();
        },

        // This method is added after we decided to show chart option dialog in saved report page.
        getOptionValue: function (el, origValue, isCheckBox) {
            // We need to evaluate the existence of the option element and decide what the returned value would be.
            var newValue;
            var $el = $("." + el, this.element);
            if (isCheckBox) {
                newValue = $el.prop('checked') ? true : false;
            } else {
                newValue = $el.val();
            }
            return $el.length !== 0 ? newValue : origValue;
        },

        // toggle the display of the attribute that will be used for segmentation.
        ".input-auto-seg change": function (el, ev) {
            this.toggleAttrColumnSeg(el, true);
        },

        /* Allow only numbers to type in chart collapse row limit input */
        ".input-chart-collapse-row-limit keypress": function (el, ev) {
            var charCode = (ev.which) ? ev.which : ev.keyCode;
            if (charCode < 48 || charCode > 57) {
                return false;
            }
            return true;
        },

        /*
         * Register click event for checkbox caption to check or uncheck by clicking
         * @param {dom} el Dom element
         */
        ".user-option-checkbox-text click": function (el) {

            var isiPad = window.navigator.userAgent.match(/iPad/i) !== null;
            if (!isiPad) {
                this.checkUncheckSiblingCheckbox(el);
            }
        },

        /*
         * Register click event for checkbox caption to check or uncheck by clicking
         * @param {dom} el Dom element
         */
        ".user-option-checkbox-text touchstart": function (el) {

            this.checkUncheckSiblingCheckbox(el);
        },

        /*
         * Checked or unchecked sibling checkbox of provided element
         * @param {dom} el Dom element
         */
        checkUncheckSiblingCheckbox: function (el) {

            var checkbox = $('input:checkbox', el.parent());
            if (checkbox.attr('disabled') !== 'disabled') {
                if (checkbox.prop('checked')) {
                    checkbox.prop('checked', false);
                } else {
                    checkbox.prop('checked', true);
                }
            }
        },

        toggleAttrColumnSeg: function (el, fade) {
            var $attrToSegment = $(".attr-to-segment-container", this.element);
            var $metricToSegment = $(".metric-to-segment-container", this.element);
            var $collapseTail = $(".collapse-tail-container", this.element);
            if (el.prop('checked')) {
                if (fade) {
                    $attrToSegment.fadeIn();
                    $metricToSegment.fadeIn();
                    $collapseTail.fadeOut();
                } else {
                    $attrToSegment.show();
                    $metricToSegment.show();
                    $collapseTail.hide();
                }
            } else {
                if (fade) {
                    $attrToSegment.fadeOut();
                    $metricToSegment.fadeOut();
                    $collapseTail.fadeIn();
                } else {
                    $attrToSegment.hide();
                    $metricToSegment.hide();
                    $collapseTail.show();
                }
            }
        },

        initTips: function () {
            if ($.fn.qtip) {
                $('.lbl-chart-title', this.element).qtip({ content: "You can change the title of the chart by changing the option value here." });
                $('.lbl-chart-subtitle', this.element).qtip({ content: "You can change the subtitle of the chart by changing the option value here." });
                $('.lbl-x-axis-label', this.element).qtip({ content: "You can change the X-Axis label of the chart by changing the option value here." });
                $('.lbl-y-axis-label', this.element).qtip({ content: "You can change the Y-Axis label of the chart by changing the option value here." });
                $('.lbl-x-axis-label-rotation', this.element).qtip({ content: "You can change the X-Axis label rotation of the chart by changing the option value here." });
                $('.lbl-chart-collapse-item-name', this.element).qtip({ content: "You can change collapsed item category name on the chart by changing the option value here." });
                $('.lbl-chart-collapse-row-limit', this.element).qtip({ content: "You can change the row limit before we collapse row records by changing the option value here." });
                $('.lbl-collapse-tail', this.element).qtip({ content: "By default this option is checked. All the rows after Chart Collapse Row Limit will be collapsed into one record. The category name for this one record will be named using value in option Chart Collapse Item Name.<br/>If Auto Segmentation is selected, this option will be invalid as collapsing and segmentation are not compatible." });
                $('.lbl-auto-segmentation', this.element).qtip({ content: "This option will be valid when you are creating a report containing one metric and more than one attribute. If this option is checked, the application will automatically create a segmented chart based on the report you have defined. The basic idea is pivoting on one of the attribute columns. For each of the distinct values under that attribute, a pivoted series will be created." });
                $('.lbl-attribute-to-segment', this.element).qtip({ content: "When Auto Segmentation option is selected, this drop down list will show up. You can change the attribute column to segment your chart." });
                $('.lbl-bin-count', this.element).qtip({ content: "You can change the approximate number of histogram bins here." });

            }
        },

        handleCANCEL: function() {
            // Trigger CANCEL event
            this.options.reportChartController.element.trigger("chart_option_dialog_cancel");
            this.closeDialog(this.options.onCancel);
        },

        handleOK: function() {
            var that = this;

            var model = that.options.model;
            var chartTextOptions = {
                chartTitle: that.getOptionValue("input-chart-option-dial-title", model.attr("chartTextOptions").chartTitle),
                chartSubtitle: that.getOptionValue("input-chart-option-dial-subtitle", model.attr("chartTextOptions").chartSubtitle),
                chartXAxisLabel: that.getOptionValue("input-x-axis-label", model.attr("chartTextOptions").chartXAxisLabel),
                chartYAxisLabel: that.getOptionValue("input-y-axis-label", model.attr("chartTextOptions").chartYAxisLabel),
                // Do format the value back to Number!!! Otherwise it will cause a lot of problems.
                chartXLabelRotation: Number(that.getOptionValue("select-x-axis-label-rotation", model.attr("chartTextOptions").chartXLabelRotation))
            };
            model.attr("chartTextOptions", chartTextOptions);

            model.attr("chartCollapseItemName", that.getOptionValue("input-chart-collapse-item-name", model.attr("chartCollapseItemName")));

            if ($(".input-chart-collapse-row-limit", that.element).length > 0) {
                model.attr("chartCollapseRowLimit", Number(that.getOptionValue("input-chart-collapse-row-limit", model.attr("chartCollapseRowLimit"))));
            }

            model.attr("chartLegendAttrColumnName", that.getOptionValue("select-legend-attribute", model.attr("chartLegendAttrColumnName")));
            model.attr("chartCollapseTail", that.getOptionValue("input-collapse-tail", model.attr("chartCollapseTail"), true));
            model.attr("chartAutoSegmentation", that.getOptionValue("input-auto-seg", model.attr("chartAutoSegmentation"), true));
            model.attr("chartSegAttrColumnName", that.getOptionValue("select-attr-to-segment", model.attr("chartSegAttrColumnName")));
            model.attr("chartSegMetricColumnName", that.getOptionValue("select-metric-to-segment", model.attr("chartSegMetricColumnName")));

            // We need to validate the existance of the bin-count select control, otherwise we could update the default value with invalid data.
            if ($(".select-bin-count", that.element).length !== 0) {
                model.attr("binCount", Number(that.getOptionValue("select-bin-count", model.attr("binCount"))));
            }
            // Trigger ok event
            that.options.reportChartController.element.trigger("chart_option_dialog_ok", model);

            this.closeDialog(this.options.onOk);
        },

        "button.close click": function(el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
