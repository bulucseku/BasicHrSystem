can.Control.extend("Sentrana.Testing.RepositoryManager", {

    pluginName: 'sentrana_testing_repository_manager',
    model: null
}, {
    init: function () {
        this.model = this.options.model;

        this.tests = ["attrToFormLinking", "metricToFactLinking", "parentCycle", "dimensionLinking", "formWellDefined",
            "correctColumnClass"
        ];
    },

    update: function (debug, alertLevel) {
        // If debug is true, all tests will run
        this.debug = debug;
        // Specifies the type of alerts the testing structure should give on invariant failure
        this.alertLevel = alertLevel;
        // 0 : No alerts 
        // 1 : Display a console message
        // 2 : Raise an alert dialogue
        // 3 : Console message + alert dialogue
    },

    runAllTests: function (precipEvent) {
        if (!this.debug) {
            return;
        }

        this.precipEvent = precipEvent;

        for (var i = 0, l = this.tests.length; i < l; i++) {
            this[this.tests[i]]();
        }
    },

    sendAlert: function (alert) {
        switch (this.alertLevel % 2) {
        case (0):
            break;
        case (1):
            //         console.log(this.precipEvent + " has caused invariant: " + alert.invariant + " to fail due to " + alert.errorMsg);
            break;
        default:
            break;
        }

        switch ((this.alertLevel >> 1) % 2) {
        case (0):
            break;
        case (1):
            alert("Invariant: " + alert.invariant);
            break;
        default:
            break;
        }
    },

    // Invariant: All attributes' attribute forms should refer back to them
    attrToFormLinking: function () {
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }

            for (var i = 0, l = attribute.attributeForms.length; i < l; i++) {
                var attrForm = this.model.forms[attribute.attributeForms[i]];
                var ind = attrForm.attributes.indexOf(attrID);
                if (ind < 0) {
                    this.sendAlert({
                        invariant: "Attribute->Form Linking",
                        errorMsg: attrForm.id + " has no child " + attrID
                    });
                }
            }
        }
    },

    // Invariant: All metrics' facts should refer back to them
    metricToFactLinking: function () {
        for (var metrID in this.model.metrics) {
            var metric = this.model.metrics[metrID];
            if (!metric.isLocal) {
                continue;
            }

            for (var i = 0, l = metric.facts.length; i < l; i++) {
                var fact = this.model.forms[metric.facts[i]];
                var ind = fact.metrics.indexOf(metrID);
                if (ind < 0) {
                    this.sendAlert({
                        invariant: "Metric->Fact Linking",
                        errorMsg: fact.id + " has no child " + metrID
                    });
                }
            }
        }
    },

    // Invariant: No cycles should exist in the attributes' parent definitions.
    parentCycle: function () {
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }

            if (attribute.parent != "Self" && this.model.detectParentCycle(attrID, this.model.attributes[attribute.parent])) {
                this.sendAlert({
                    invariant: "Parent Cycle",
                    errorMsg: attrID + " has a parent cycle"
                });
            }
        }
    },

    // Invariant: Every attribute should exist only in one dimension
    dimensionLinking: function () {
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }

            for (var dim in this.model.dimensions.dimensionChildren) {
                var attrList = this.model.dimensions.dimensionChildren[dim];
                if (!$.isArray(attrList)) {
                    continue;
                }

                if (attrList.indexOf(attrID) > -1 && attribute.dimension != dim) {
                    this.sendAlert({
                        invariant: "Dimension Linking",
                        errorMsg: dim + " links to " + attrID + " links to " + attribute.dimension
                    });
                }
            }
        }
    },

    // Invariant: Every form should hold references to either metrics or attributes, and it's type should reflect that.
    formWellDefined: function () {
        for (var formID in this.model.forms) {
            var form = this.model.forms[formID];
            if (!form.isLocal) {
                continue;
            }

            if (form.metrics.length > 0 && form.attributes.length > 0) {
                this.sendAlert({
                    invariant: "formWellDefined",
                    errorMsg: formID + " has both " + form.attributes.length + " attributes, and " + form.metrics.length + " metrics"
                });
            }

            if (form.metrics.length > 0 && form.formType != 1) {
                this.sendAlert({
                    invariant: "formWellDefined",
                    errorMsg: formID + " has " + form.metrics.length + " metrics, has type " + form.formType
                });
            }

            if (form.attributes.length > 0 && form.formType !== 0) {
                this.sendAlert({
                    invariant: "formWellDefined",
                    errorMsg: formID + " has " + form.attributes.length + " attributes, has type " + form.formType
                });
            }

            for (var i = 0, ml = form.metrics.length; i < ml; i++) {
                if (form.metrics[i].colType != form.formType) {
                    this.sendAlert({
                        invariant: "formWellDefined",
                        errorMsg: formID + " ascribes a metric " + form.metrics[i] + " of type " + form.metrics[i].colType
                    });
                }
            }

            for (var j = 0, al = form.metrics.length; i < al; i++) {
                if (form.attributes[j].colType != form.formType) {
                    this.sendAlert({
                        invariant: "formWellDefined",
                        errorMsg: formID + " ascribes an attribute " + form.attributes[j] + " of type " + form.attributes[j].colType
                    });
                }
            }
        }
    },

    getColumnIDFromElement: function (el) {
        return el.parent().parent().attr('class');
    },

    // Invariant: Every column ID should match up with its css class
    correctColumnClass: function () {
        for (var attrID in this.model.attributes) {
            var attribute = this.model.attributes[attrID];
            if (!attribute.isLocal) {
                continue;
            }

            if (!$('.' + attrID)) {
                this.sendAlert({
                    invariant: "correctColumnClass",
                    errorMsg: attrID + " has no table row"
                });
            }
        }

        for (var metrID in this.model.metrics) {
            var metric = this.model.metrics[metrID];
            if (!metric.isLocal) {
                continue;
            }

            if (!$('.' + metrID)) {
                this.sendAlert({
                    invariant: "correctColumnClass",
                    errorMsg: metrID + " has no table row"
                });
            }

        }
        /*
        var children = $(".form-table", $(".column-mapping-information")).children();
        for (var i = 0, l = children.length; i < l; i++) {
        if (!this.model.getAttrOrMetr($(children[i]).attr('class'))) {
        this.sendAlert({ invariant: "correctColumnClass", errorMsg: children[i].attr('class') + " has no corresponding model entry" });
        }
        } */
    }
});
