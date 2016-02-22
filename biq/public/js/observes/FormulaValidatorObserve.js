can.Observe.extend("Sentrana.Models.FormulaValidator", {}, {
    // Constructor...
    init: function (metrics, reusableColumns) {
        this.setup({
            validationStatus: null
        });

        // Define some instance fields...
        this.metrics = metrics;
        this.reusableColumns = reusableColumns || [];
    },

    // Instance method: Drop a report cache...
    validateFormula: function (formulaText) {
        var that = this;

        // Indicate that we are going to be dropping a cache...
        this.attr('validationStatus', 'RUNNING');

        //check if round brackets are correct format
        var formulaTextWithIds = this.getFormulaWithIds(formulaText);
        if (formulaTextWithIds) {
            //remove whitespaces other than inside the []
            var formulaTextWithoutSpaces = Sentrana.removeWhiteSpace(formulaTextWithIds);

            $.ajax({
                url: Sentrana.Controllers.BIQController.generateUrl("ValidateFormula"),
                type: "POST",
                dataType: "json",
                contentType: "text/json",
                data: JSON.stringify({
                    formula: formulaTextWithoutSpaces
                }),
                success: function (data) {
                    that.attr('validationStatus', data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    that.attr('validationStatus', false);
                }
            });
        }
        else {
            that.attr('validationStatus', false);
        }
    },

    getFormulaWithIds: function (formulaText) {
        var that = this;
        var hasInvalidInput = false;
        var matchedValues = formulaText.match(Sentrana.RegEx.RE_METRIC_IN_FORMULA);

        if (matchedValues && matchedValues.length > 0) {
            $.each(matchedValues, function (index, value) {
                if (value !== "") {
                    //Check for metrics
                    var metrics = $.grep(that.metrics, function (obj) {
                        return '[' + obj.name + ']' === value;
                    });

                    //check for reusable columns
                    var reusableColumns = $.grep(that.reusableColumns, function (obj) {
                        return '[' + obj.name + ']' === value;
                    });

                    if (metrics.length + reusableColumns.length === 1) {
                        if (metrics[0]) {
                            formulaText = formulaText.replace('[' + metrics[0].name + ']', '[' + metrics[0].oid + ']');
                        }
                        else if (reusableColumns[0]) {
                            formulaText = formulaText.replace('[' + reusableColumns[0].name + ']', reusableColumns[0].oid);
                        }
                    }
                    else {
                        hasInvalidInput = true;
                    }
                }
            });
        }

        if (hasInvalidInput) {
            return undefined;
        }
        return formulaText;
    },

    getFormulaWithNames: function (formulaText) {
        var that = this;
        var hasInvalidInput = false;
        var matchedValues = formulaText.match(Sentrana.RegEx.RE_METRIC_IN_FORMULA);

        if (matchedValues && matchedValues.length > 0) {
            $.each(matchedValues, function (index, value) {
                if (value !== "") {
                    //Check for metrics
                    var metrics = $.grep(that.metrics, function (obj) {
                        return '[' + obj.oid + ']' === value;
                    });

                    //Check for reusable columns
                    var reusableColumns = $.grep(that.reusableColumns, function (obj) {
                        return obj.oid === value;
                    });

                    if (metrics.length + reusableColumns.length === 1) {
                        if (metrics[0]) {
                            formulaText = formulaText.replace('[' + metrics[0].oid + ']', '[' + metrics[0].name + ']');
                        }
                        else if (reusableColumns[0]) {
                            formulaText = formulaText.replace(reusableColumns[0].oid, '[' + reusableColumns[0].name + ']');
                        }
                    }
                    else {
                        hasInvalidInput = true;
                    }
                }
            });
        }

        if (hasInvalidInput) {
            return undefined;
        }

        return formulaText;
    }
});
