steal("js/controllers/ReportUnitController.js", function () {

    Sentrana.Controllers.ReportUnit.extend("Sentrana.Controllers.TemplateUnit", {
        pluginName: 'sentrana_template_unit'
    }, {
        init: function () {
            // Find our jQuery objects...
            this.$sortPosition = this.element.find(".num");
            this.$sortOrderAsc = this.element.find(".asc");
            this.$sortOrderDsc = this.element.find(".desc");
            this.$controls = this.element.find(".controls");
            this.$forms = this.element.find(".forms");
            this.$header = this.element.find(".tu-header");
            this.incrementedWidth = false;
            // Indicate the sort order...
            ((this.options.ruModel.sortOrder === 'A') ? this.$sortOrderAsc : this.$sortOrderDsc).addClass("selected");

        },

        ".tu-header click": function (el, ev) {
            if (!this.options.isExpandableHeader) {
                return;
            }

            var that = this;
            this.$controls.slideToggle(200, function () {
                if (!that.$controls.is(":visible")) {
                    Sentrana.FirstLook.createFilteredMetricMode(false);
                }
            });
            this.toggleUpDnImage();
        },

        toggleUpDnImage: function () {
            var i = $('i', this.$header);
            $(i[0]).toggleClass("fa-rotate-90");
        },
        // Browser Event: Reduce the sort position value...
        ".less click": function (el, ev) {
            var tu = this.options.ruModel;

            this.options.rdModel.changeSortPosition(tu.hid, tu.sortPos, -1);
        },

        // Browser Event: Increment the sort position value...
        ".more click": function (el, ev) {
            var tu = this.options.ruModel;

            this.options.rdModel.changeSortPosition(tu.hid, tu.sortPos, 1);
        },

        // Browser Event: Select the sort ASCending button...
        ".asc click": function (el, ev) {
            this.options.ruModel.attr('sortOrder', 'A');
        },

        // Browser Event: Select the sort DESCending button...
        ".desc click": function (el, ev) {
            this.options.ruModel.attr('sortOrder', 'D');
        },

        // Browser Event: Toggle a form name...
        ".forms span click": function (el, ev) {
            // Get the OID of the form selected...
            var tu = this.options.ruModel,
                oid = el.attr("oid");

            // Inform our model...
            this.options.rdModel.toggleSelectedForm(tu.hid, oid);
            this.element.trigger("enable-view-button");
        },

        // Browser Event: Allow filtered Metric to be created...
        ".create-filtered-metric click": function (el, ev) {
            if ($(".edit-derived-metrics", el).is(':visible')) {
                // Allow derived column edit
                this.options.builderPageController.openDerivdColumnDialog(this.options.ruModel);
            }
            else {
                $(el).attr("filter", true);
                Sentrana.FirstLook.createFilteredMetricMode(true);
            }
        },

        ".transform-column click": function (el, ev) {
            this.options.builderPageController.openDerivdColumnDialog(this.options.ruModel);
        },

        ".onlywhen-column click": function (el, ev) {

            var tuElement = $(el).closest('.tu').attr('hid'),
                tuObject = this.options.rdModel.app.dwRepository.objectMap[tuElement];
            tuObject.sortOrder = this.options.ruModel.sortOrder;
            tuObject.sortPos = this.options.ruModel.sortPos;
            this.options.builderPageController.openOnlyWhenColumnDialog(tuObject, true);
        },

        ".aggregation-type-drop-down-select change": function (el, ev) {
            var aggType = $(el).val(),
                tuElement = $(el).closest('.tu').attr('hid'),
                tuObject = this.options.rdModel.app.dwRepository.objectMap[tuElement];

            if (!this.isSameMetricExist(aggType, tuObject)) {
                this.options.ruModel.attr("aggType", aggType);
            }
            else {
                var oldVal = this.options.ruModel.attr("aggType");
                Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.report_definition.validation.metrics.already_exists.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.report_definition.validation.metrics.already_exists.dialog_msg), function () {
                    $('option[value="' + oldVal + '"]', el).prop("selected", true);
                });
            }
        },

        isSameMetricExist: function (aggType, tuObject) {

            var metrics = $.grep(this.options.rdModel.templateUnits, function (tu) {
                return (tu.aggType === aggType && tu.oid === tuObject.oid && tu.subtype === tuObject.subtype && tu.filterOid === tuObject.filterOid);
            });

            return metrics.length > 0;
        },

        changeAggregationType: function (tu, aggType) {
            var objectMap = this.options.rdModel.app.dwRepository.objectMap;
            var oldTU = objectMap[tu.hid];
            var newTU;

            newTU = this.options.rdModel.app.dwRepository.createMetricWithAggregationType(oldTU, aggType);

            // Add new template unit into repository
            if (!objectMap[newTU.hid]) {
                objectMap[newTU.hid] = newTU;
            }

            var metricPosition = this.options.rdModel.getTemplateUnitIndex(oldTU.hid);
            var metricSortPosition = this.options.ruModel.attr("sortPos");

            this.options.rdModel.deselectObject(oldTU.hid, "update");
            this.options.rdModel.selectObject(newTU.hid, metricPosition, metricSortPosition);

        },

        "{ruModel} change": function (ruModel, ev, attr, how, newVal, oldVal) {
            switch (attr) {
            case "sortOrder":
                this.$sortOrderAsc[(newVal === 'A') ? "addClass" : "removeClass"]("selected");
                this.$sortOrderDsc[(newVal === 'D') ? "addClass" : "removeClass"]("selected");
                break;
            case "sortPos":
                this.$sortPosition.text(newVal);
                break;
            case "selectedForms":
                // Is the new value 0?
                var that = this;
                if (newVal === 0) {
                    Sentrana.AlertDialog(Sentrana.getMessageText(window.app_resources.app_msg.report_definition.validation.attribute.form.not_selected.dialog_title), Sentrana.getMessageText(window.app_resources.app_msg.report_definition.validation.attribute.form.not_selected.dialog_msg), function () {
                        that.options.ruModel.attr('selectedForms', oldVal);
                    });
                }
                else {
                    $("span", this.$forms).each(function (i, span) {
                        $(span)[(newVal & (1 << i)) ? "addClass" : "removeClass"]("selected");
                    });
                }
                break;
            case "aggType":
                this.changeAggregationType(ruModel, newVal);
                break;
            default:
                break;
            }
        }
    });

});
