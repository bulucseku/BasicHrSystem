can.Control.extend("Sentrana.Controllers.RangeFilter", {
    pluginName: "sentrana_range_filter",
    defaults: {
        app: null,
        rangeFilterModel: null
    }

}, {

    init: function () {
        this.app = this.options.app;
        this.rangeFilterModel = this.options.rangeFilterModel;
        this.rangeFilterModel.backup();
        this.element.html('templates/slider.ejs', {
            name: this.rangeFilterModel.columnName
        });
        this.minInput = this.element.find('.range-filter-custom-input-left');
        this.maxInput = this.element.find('.range-filter-custom-input-right');

        this.initControllerValue();
        this.batchNumber = undefined;
    },

    initControllerValue: function () {
        this.precision = this.getPrecision();

        var that = this;
        this.$sliderElement = this.element.find(".range-filter-slider-element");
        this.$sliderElement.editRangeSlider({
            defaultValues: {
                min: that.rangeFilterModel.min,
                max: that.rangeFilterModel.max
            },
            arrows: false,
            valueLabels: "hide",
            bounds: {
                min: that.rangeFilterModel.lowerBound,
                max: that.rangeFilterModel.upperBound
            },
            formatter: function (val) {
                return that.dotNetFormatter(val, that.rangeFilterModel.formatString);
            }
        });

        this.setInputValue(this.rangeFilterModel.attr('min'), this.rangeFilterModel.attr('max'));

        this.$sliderElement.bind("valuesChanged", function (e, data) {
            var precision = that.precision;
            if (that.rangeFilterModel.dataType === Sentrana.DataType.PERCENTAGE) {
                precision = 6;
            }
            var mMin = that.rangeFilterModel.min.toFixed(precision),
                mMax = that.rangeFilterModel.max.toFixed(precision),
                dMin = data.values.min.toFixed(precision),
                dMax = data.values.max.toFixed(precision);
            if (that.isNumber(dMin) && that.isNumber(dMin)) {
                if (that.isNumber(dMin) && that.isNumber(dMax)) {
                    if (mMin !== dMin || mMax !== dMax) {
                        can.Observe.startBatch();
                        that.rangeFilterModel.attr('min', dMin * 1);
                        that.rangeFilterModel.attr('max', dMax * 1);

                        var formattedMin = that.dotNetFormatter(data.values.min, that.rangeFilterModel.formatString);
                        var formattedMax = that.dotNetFormatter(data.values.max, that.rangeFilterModel.formatString);

                        that.rangeFilterModel.attr('formattedMin', formattedMin);
                        that.rangeFilterModel.attr('formattedMax', formattedMax);

                        that.setInputValue(data.values.min, data.values.max);

                        can.Observe.stopBatch();
                    }
                }

                setTimeout(function () {
                    that.setInputsWidth();
                }, 2);
            }
            else {
                that.element.hide();
            }
        });

        setTimeout(function () {
            that.setInputsWidth();
        }, 2);

    },

    setInputValue: function (min, max) {
        var formattedMin = this.dotNetFormatter(min, this.rangeFilterModel.formatString);
        var formattedMax = this.dotNetFormatter(max, this.rangeFilterModel.formatString);
        this.minInput.val(formattedMin);
        this.maxInput.val(formattedMax);
    },

    setInputsWidth: function () {
        var formattedMin = this.dotNetFormatter(this.rangeFilterModel.attr('min'), this.rangeFilterModel.formatString),
            formattedMax = this.dotNetFormatter(this.rangeFilterModel.attr('max'), this.rangeFilterModel.formatString);

        if (formattedMin && formattedMax) {
            var maxLengthValue = formattedMin.length > formattedMax.length ? formattedMin : formattedMax;
            var width = this.getInputWidth(maxLengthValue);

            this.minInput.css('width', width);
            this.maxInput.css('width', width);
        }
    },

    getInputWidth: function (val) {
        val = val.replace(/\,/g, '');
        val = val.replace('.', '');
        val = (val.length * 9) + 'px';
        return val;
    },

    destroyMe: function () {
        if (this.$sliderElement) {
            this.$sliderElement.editRangeSlider("destroy");
        }
    },

    reDrawSlider: function () {
        var that = this;

        if (this.$sliderElement) {
            this.$sliderElement.editRangeSlider("destroy");

            this.$sliderElement.editRangeSlider({
                defaultValues: {
                    min: that.rangeFilterModel.min,
                    max: that.rangeFilterModel.max
                },
                bounds: {
                    min: that.rangeFilterModel.lowerBound,
                    max: that.rangeFilterModel.upperBound
                },
                arrows: false,
                valueLabels: "hide",
                formatter: function (val) {
                    return that.dotNetFormatter(val, that.rangeFilterModel.formatString);
                }
            });

        }
    },

    getPrecision: function () {
        if (this.rangeFilterModel.dataType === Sentrana.DataType.PERCENTAGE) {
            return 1;
        }

        return this.rangeFilterModel.formatString.replace(/^\D+/g, '') * 1;
    },

    dotNetFormatter: function (x, formatString) {
        var result = formatString;
        if (formatString.indexOf("N") > -1 || formatString.indexOf("C") > -1) {
            if (formatString.indexOf("N") > -1) {
                result = "#,#";
            }
            if (formatString.indexOf("C") > -1) {
                result = "$#,#";
            }
            var decimalDigit = parseInt(formatString.substr(1, formatString.length - 1), 10);

            if (decimalDigit === 0) {
                x = Math.round(x);
            }
            else {
                for (var i = 0; i < decimalDigit; i++) {
                    if (i === 0) {
                        result += ".";
                    }
                    result += "0";
                }
            }
        }

        return String.format("{0:" + result + "}", x);
    },

    isNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    ".range-filter-custom-input-left keypress": function (el, ev) {
        if (ev.keyCode == 13) {
            var val = $(el).val();
            if (val.length === 0 || !this.isNumber(val)) {
                this.reSetSliderValues();
                return false;
            }

            val = val * 1;
            var editValues = this.$sliderElement.editRangeSlider("values"),
                min = editValues.min,
                max = editValues.max;
            min = val;

            this.$sliderElement.editRangeSlider("values", min, max);
            $(el).blur();
            return false;
        }

        if (!this.isNumberKey(el, ev)) {
            return false;
        }

        return true;
    },

    ".range-filter-custom-input-right keypress": function (el, ev) {
        if (ev.keyCode == 13) {
            var val = $(el).val();
            if (val.length === 0 || !this.isNumber(val)) {
                this.reSetSliderValues();
                return false;
            }

            val = val * 1;
            var editValues = this.$sliderElement.editRangeSlider("values"),
                min = editValues.min,
                max = editValues.max;
            max = val;

            this.$sliderElement.editRangeSlider("values", min, max);
            $(el).blur();
            return false;
        }

        if (!this.isNumberKey(el, ev)) {
            return false;
        }

        return true;
    },

    ".range-filter-custom-input-left focus": function (el, ev) {
        var val = this.getSliderValue('left');
        var widthPrv = $(el).width();
        $(el).css('width', '9em');
        var widthCur = $(el).width();
        if (widthPrv > widthCur) {
            $(el).css('width', widthPrv);
        }

        var zindex = ($(el).parent().parent().css('zIndex') * 1) + 1;
        $(el).parent().parent().css("z-index", zindex);

        setTimeout(function () {
            $(el).val(val);
            $(el).setCursorPosition(val.length);
        }, 10);
    },

    ".range-filter-custom-input-right focus": function (el, ev) {
        var val = this.getSliderValue('right');
        var widthPrv = $(el).width();
        $(el).css('width', '9em');
        var widthCur = $(el).width();
        if (widthPrv > widthCur) {
            $(el).css('width', widthPrv);
        }

        var zindex = ($(el).parent().parent().css('zIndex') * 1) + 1;
        $(el).parent().parent().css("z-index", zindex);

        setTimeout(function () {
            $(el).val(val);
            $(el).setCursorPosition(val.length);
        }, 10);
    },

    ".range-filter-custom-input-left blur": function (el, ev) {
        var val = this.getSliderValue('left');
        var fval = this.dotNetFormatter(val * 1, this.rangeFilterModel.formatString);
        this.setInputsWidth();

        $(el).parent().parent().css("z-index", 1);
        setTimeout(function () {
            $(el).val(fval);
        }, 100);
    },

    ".range-filter-custom-input-right blur": function (el, ev) {
        var val = this.getSliderValue('right');
        var fval = this.dotNetFormatter(val * 1, this.rangeFilterModel.formatString);
        this.setInputsWidth();

        $(el).parent().parent().css("z-index", 1);
        setTimeout(function () {
            $(el).val(fval);
        }, 100);
    },

    isNumberKey: function (el, evt) {
        var charCode = (evt.which) ? evt.which : event.keyCode;
        if (charCode === 45) { //minus sign
            var index = $(el).val().indexOf('-');
            if (index >= 0) {
                return false;
            }
            else {
                return $(el).getCursorPosition() === 0 ? true : false;
            }
        }
        else if (charCode === 46) { // decimal point
            if ($(el).val().indexOf('.') >= 0) {
                return false;
            }
            else {
                return true;
            }
        }
        else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }

        return true;
    },

    getSliderValue: function (handle) {
        var editValues = this.$sliderElement.editRangeSlider("values"),
            val = editValues.min;
        if (handle === "right") {
            val = editValues.max;
        }
        if (this.rangeFilterModel.dataType === Sentrana.DataType.PERCENTAGE) {
            return val.toFixed(6);
        }
        //return val.toFixed(this.precision);
        return this.precision === 0 ? Math.round(val) : val.toFixed(this.precision);
    },

    reSetSliderValues: function () {
        var editValues = this.$sliderElement.editRangeSlider("values");
        this.$sliderElement.editRangeSlider("values", editValues.min.toFixed(this.precision), editValues.max.toFixed(this.precision));
    },

    setMinMax: function (min, max) {
        if (min === max) {
            this.$sliderElement.editRangeSlider({
                enabled: false
            });
        }
        else {
            this.$sliderElement.editRangeSlider({
                enabled: true
            });
        }

        this.rangeFilterModel.unbind('change');

        this.rangeFilterModel.attr('min', min);
        this.rangeFilterModel.attr('max', max);
        this.rangeFilterModel.attr('lowerBound', min);
        this.rangeFilterModel.attr('upperBound', max);
        this.rangeFilterModel.attr('formattedMin', this.dotNetFormatter(min, this.rangeFilterModel.formatString));
        this.rangeFilterModel.attr('formattedMax', this.dotNetFormatter(max, this.rangeFilterModel.formatString));
        this.$sliderElement.editRangeSlider("bounds", min, max);
        this.$sliderElement.editRangeSlider("values", min, max);

        var that = this;

        this.rangeFilterModel.bind('change', function (ev, attr, how, newVal, oldVal) {
            if (attr === 'min' || attr === 'max') {
                that.element.trigger("range_filter_changed", ev.currentTarget);
            }
        });
    },

    setSliderValues: function (min, max, lowerBound, upperBound) {
        if (lowerBound === upperBound) {
            this.$sliderElement.editRangeSlider({
                enabled: false
            });
        }
        else {
            this.$sliderElement.editRangeSlider({
                enabled: true
            });
        }

        if (min <= lowerBound) {
            min = lowerBound;
        }

        if (max >= upperBound) {
            max = upperBound;
        }

        this.rangeFilterModel.unbind('change');

        this.rangeFilterModel.attr('min', min);
        this.rangeFilterModel.attr('max', max);
        this.rangeFilterModel.attr('lowerBound', lowerBound);
        this.rangeFilterModel.attr('upperBound', upperBound);
        this.rangeFilterModel.attr('formattedMin', this.dotNetFormatter(min, this.rangeFilterModel.formatString));
        this.rangeFilterModel.attr('formattedMax', this.dotNetFormatter(max, this.rangeFilterModel.formatString));
        this.$sliderElement.editRangeSlider("bounds", lowerBound, upperBound);
        this.$sliderElement.editRangeSlider("values", min, max);

        var that = this;

        this.rangeFilterModel.bind('change', function (ev, attr, how, newVal, oldVal) {
            //            if (attr === 'min' || attr === 'max') {
            //                that.element.trigger("range_filter_changed", ev.currentTarget);
            //            }
        });
    },

    "{rangeFilterModel} change": function (rangeFilterModel, ev, attr, how, newVal, oldVal) {
        //        if (attr === 'min' || attr === 'max') {
        //            if (!ev.batchNum || ev.batchNum !== this.batchNumber) {
        //                this.batchNumber = ev.batchNum;
        //                this.element.trigger("range_filter_changed", rangeFilterModel);
        //            }
        //        }
    },

    isDirty: function () {
        return this.rangeFilterModel.isDirty();
    },

    getFilterParam: function () {

        if (this.rangeFilterModel.min === undefined) {
            return false;
        }

        var param = {};
        param.columnName = this.rangeFilterModel.columnName;
        param.lowerBound = this.rangeFilterModel.lowerBound;
        param.upperBound = this.rangeFilterModel.upperBound;
        param.min = this.rangeFilterModel.min;
        param.max = this.rangeFilterModel.max;
        param.formattedMin = this.dotNetFormatter(this.rangeFilterModel.min, this.rangeFilterModel.formatString);
        param.formattedMax = this.dotNetFormatter(this.rangeFilterModel.max, this.rangeFilterModel.formatString);
        param.formatString = this.rangeFilterModel.formatString;
        param.dataType = this.rangeFilterModel.dataType;

        return param;
    }

});
