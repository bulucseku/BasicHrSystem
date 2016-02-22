(function () {
    // Module variables. Some of them could be updated later by user configuration.
    var CONCATENATE_STRING = ', ';

    // Add extended function to Array object.
    Array.prototype.unique = function () {
        var hash = {}, result = [];
        for (var i = 0, l = this.length; i < l; ++i) {
            if (!hash.hasOwnProperty(this[i])) {//it works with objects! in FF, at least
                hash[this[i]] = true;
                result.push(this[i]);
            }
        }
        return result;
    };
    // Return a new array that is a replicate of input array but with specific item removed.
    Array.prototype.removeValue = function (value) {
        return jQuery.grep(this, function (elem, index) {
            return elem !== value;
        });
    };

    $.Class("Sentrana.ChartDataAdapter", {
        // initialize widget
        init: function (data) {
            this.resultDataset = new Sentrana.Models.ResultDataset({
                data: data
            });
            // 0 for attribute
            this.attributeIndexArray = this.resultDataset.getIndexArray(Sentrana.ColType.ATTRIBUTE);
            // 1 for metric
            this.metricIndexArray = this.resultDataset.getIndexArray(Sentrana.ColType.METRIC);
        },

        populateChartOptions: function (reportChartController) {
            var chartData = this.chartData = reportChartController.chartData;
            var chartConfiguration = reportChartController.options;

            // Record existing chart options if there is any.
            this.oldChartData = jQuery.extend(true, {}, chartData);

            // Get the chartOptions instance, each chart type has its own instance.
            this.chartOptions = reportChartController.getChartOptions();
            var chartOptions = this.chartOptions;

            // Set global options. These options won't change when the chart type changes.
            chartOptions.chart.renderTo = chartConfiguration.chart.renderTo;
            chartOptions.chart.height = chartConfiguration.chart.height;
            chartOptions.chart.width = chartConfiguration.chart.width;

            // Following is the universal setting for chart categories.
            // Differenct charts will set this differently inside the method setChartSeries.
            // categories/ticks are set different ways for different charts
            if (chartOptions.chart.type !== Sentrana.CHART_TYPE_SCATTER &&
                chartOptions.chart.type !== Sentrana.CHART_TYPE_BUBBLE &&
                this.chartType !== Sentrana.CHART_TYPE_HISTOGRAM) {
                chartOptions.xAxis.categories = this.getArraySubset(this.resultDataset.getVerticalArrayFromDataSet(this.attributeIndexArray, 'join'), Sentrana.ColType.ATTRIBUTE, chartData.startPos, chartData.endPos, chartData.chartCollapseTail);
            }

            // Set the data series.
            chartOptions.setChartSeries(chartData.startPos, chartData.endPos, chartData.chartCollapseTail);

            // for certain charts, aggregate or otherwise restructure the data
            this.createSyntheticSeries();

            // Restore option values that user has specified.
            chartOptions.title.text = this.oldChartData.chartTextOptions.chartTitle !== null ? this.oldChartData.chartTextOptions.chartTitle : chartOptions.title.text;
            // If this.oldChartData.chartTextOptions.chartSubtitle === ''
            // this.oldChartData.chartTextOptions.chartSubtitle !== null will be true
            // That's why we don't use || here.
            chartOptions.subtitle.text = this.oldChartData.chartTextOptions.chartSubtitle !== null ? this.oldChartData.chartTextOptions.chartSubtitle : chartOptions.subtitle.text;
            chartOptions.setXAxisRotation(this.oldChartData.chartTextOptions.chartXLabelRotation || chartOptions.xAxis.labels.rotation);
            chartOptions.xAxis.title.text = this.oldChartData.chartTextOptions.chartXAxisLabel || this.getXAxisLabel();
            chartOptions.yAxis.title.text = this.oldChartData.chartTextOptions.chartYAxisLabel || this.getYAxisLabel();

            // Remove the reference to reportChartController as it is going to create problems in Highcharts merge method after v3.0.
            delete chartOptions.reportChartController;

            return chartOptions;
        },

        getChartTitle: function () {
            return this.getJoinedTitle(this.metricIndexArray) + ' by ' + this.getJoinedTitle(this.attributeIndexArray);
        },

        getChartSubtitle: function () {
            return '';
        },

        // Determine the supported chart type based on attributes and metrics combination.
        supportChartType: function (chartType) {
            var attributeCount = this.attributeIndexArray.length;
            var metricCount = this.metricIndexArray.length;
            switch (chartType) {
                case Sentrana.CHART_TYPE_PIE:
                    return attributeCount === 1 && metricCount === 1;
                case Sentrana.CHART_TYPE_COLUMN:
                    return metricCount >= 1;
                case Sentrana.CHART_TYPE_BAR:
                    return metricCount >= 1;
                case Sentrana.CHART_TYPE_STACKED_COLUMN:
                    return metricCount > 1 || (attributeCount > 1 && metricCount === 1);
                case Sentrana.CHART_TYPE_STACKED_BAR:
                    return metricCount > 1 || (attributeCount > 1 && metricCount === 1);
                case Sentrana.CHART_TYPE_SCATTER:
                    return attributeCount >= 1 && metricCount === 2;
                case Sentrana.CHART_TYPE_BUBBLE:
                    return metricCount >= 3;
                case Sentrana.CHART_TYPE_HISTOGRAM:
                    return metricCount === 1;
                default:
                    return true;
            }
        },
        // Determine the default chart type based on attributes and metrics combination.
        defaultChartType: function () {
            // Please refer to
            // http://10.46.33.126:8090/display/MMCAT/Data+Visualizations+and+Interactivity#DataVisualizationsandInteractivity-DataSetInformationDecomposition
            var A = this.attributeIndexArray.length;
            var M = this.metricIndexArray.length;
            if (A === 1 && M === 1) {
                if (this.resultDataset.hasTimeSeriesAttr()) {
                    return Sentrana.CHART_TYPE_LINE;
                } else {
                    return Sentrana.CHART_TYPE_COLUMN;
                }
            }
            if (A === 1 && M > 1) {
                if (this.resultDataset.hasTimeSeriesAttr()) {
                    return Sentrana.CHART_TYPE_LINE;
                } else {
                    return Sentrana.CHART_TYPE_COLUMN;
                }
            }
            if (A >= 2 && M === 1) {
                return Sentrana.CHART_TYPE_STACKED_COLUMN;
            }
            if (A > 1 && M > 1) {
                return Sentrana.CHART_TYPE_COLUMN;
            }
            if (A === 0 && M === 1) {
                return Sentrana.CHART_TYPE_HISTOGRAM;
            }
            if (A >= 1 && M >= 2) {
                return Sentrana.CHART_TYPE_SCATTER;
            }
            if (M >= 3) {
                return Sentrana.CHART_TYPE_BUBBLE;
            }
            return Sentrana.CHART_TYPE_LINE;
        },

        // Get array subset, limit the total number of items in the array from startPos to endPos.
        // Indicator isCollapse will decide whether we will show the rest of the items as a collapsed item.
        // @param seriesArray Input of array.
        // @param colType Column type indicator, 0 means attribute column and 1 means metric column.
        // @param startPos start position of chart data row.
        // @param endPos end position of chart data row.
        // @param isCollapse collapsing indicator.
        getArraySubset: function (seriesArray, colType, startPos, endPos, isCollapse) {
            // The collapse could start at any ending position, which will be passed in,
            // so that we will be able to do drilling on these other items.
            var result = [];
            // Make sure the endPos won't exeed current array length.
            endPos = endPos > (seriesArray.length - 1) ? (seriesArray.length - 1) : endPos;
            var i, j;
            var collapsedElements;

            // Start the loop in order to get the subset of the series array.
            result = seriesArray.slice(startPos, endPos + 1);
            // The condition that we need to collapse
            if (isCollapse && endPos < seriesArray.length - 1) {
                // Collapse the rest of the items
                if (colType === Sentrana.ColType.METRIC) {
                    // Collapse metrics
                    collapsedElements = 0;
                    for (j = endPos + 1; j < seriesArray.length; j++) {
                        collapsedElements += seriesArray[j];
                    }
                    //result.push(collapsedElements);
                    result.push({
                        y: collapsedElements,
                        drilldown: {
                            startPos: endPos + 1
                        }
                    });
                } else if (colType === Sentrana.ColType.ATTRIBUTE) {
                    // Collapse attributes
                    result.push(this.chartData.chartCollapseItemName);
                } else if (colType === 2) {
                    // Special case for pie chart
                    collapsedElements = 0;
                    // Collapse both attributes and metrics. seriesArray[j] is an array
                    for (j = endPos + 1; j < seriesArray.length; j++) {
                        collapsedElements += seriesArray[j][1];
                    }
                    result.push({
                        name: this.chartData.chartCollapseItemName,
                        y: collapsedElements,
                        drilldown: {
                            startPos: endPos + 1
                        }
                    });
                }
            }
            return result;
        },

        // Get the column name for the default column that will be used for segmentation.
        getDefaultSegAttrName: function () {
            return this.resultDataset.getColTitle(this.attributeIndexArray[this.attributeIndexArray.length - 1]);
        },

        getDefaultSegMetricName: function () {
            return this.resultDataset.getColTitle(this.metricIndexArray[0]);
        },

        getJoinedTitle: function (indexArray) {
            var titleArray = [];
            for (var i = 0; i < indexArray.length; i++) {
                titleArray.push(this.resultDataset.getColTitle(indexArray[i]));
            }
            return titleArray.join(CONCATENATE_STRING);
        },

        getXAxisLabel: function () {
            // generally the attributes, but for charts based on continuous X axis, the first metric
            if (this.chartType === Sentrana.CHART_TYPE_SCATTER ||
                this.chartType === Sentrana.CHART_TYPE_BUBBLE ||
                this.chartType === Sentrana.CHART_TYPE_HISTOGRAM) {
                return this.resultDataset.getColTitle(this.metricIndexArray[0]);
            } else {
                return this.getJoinedTitle(this.attributeIndexArray);
            }
        },

        getYAxisLabel: function () {
            // generally the metrics, but for 2-D continuous charts, the 2nd metric, and for historgrams, the count
            if (this.chartType === Sentrana.CHART_TYPE_SCATTER ||
                this.chartType === Sentrana.CHART_TYPE_BUBBLE) {
                return this.resultDataset.getColTitle(this.metricIndexArray[1]);
            } else if (this.chartType === Sentrana.CHART_TYPE_HISTOGRAM) {
                return "Count";
            } else {
                return this.getJoinedTitle(this.metricIndexArray);
            }
        },

        createSyntheticSegmentedSeries: function () {
            var startPos = this.chartData.startPos;
            var endPos = this.chartData.endPos;
            var chartOptions = this.chartOptions;

            // set default chart type first. Stacked column is the best for this kind of segementation chart.
            chartOptions.chartType = Sentrana.CHART_TYPE_STACKED_COLUMN; // does this do anything?!
            this.autoSeg = true;
            var segsArray = [], distSegs = [];
            var attrArray = [], distAttr = [];
            var segAttrIndex = this.resultDataset.getColumnIndexByName(this.chartData.chartSegAttrColumnName);
            var metricColumnIndex = this.resultDataset.getColumnIndexByName(this.chartData.chartSegMetricColumnName);
            var otherAttrIndexes = this.attributeIndexArray.removeValue(segAttrIndex);

            segsArray = this.getArraySubset(this.resultDataset.getVerticalArrayFromDataSet([segAttrIndex], 'join'), Sentrana.ColType.ATTRIBUTE, startPos, endPos, false);
            distSegs = segsArray.unique();

            attrArray = this.getArraySubset(this.resultDataset.getVerticalArrayFromDataSet(otherAttrIndexes, 'join'), Sentrana.ColType.ATTRIBUTE, startPos, endPos, false);
            distAttr = attrArray.unique();

            // start to formulate the series matrix.
            // init the matrix, set all values to 0.
            var dataMatrix = [];
            var i, j;
            for (i = 0; i < distSegs.length; i++) {
                var seriesData = [];
                for (j = 0; j < distAttr.length; j++) {
                    seriesData.push(0);
                }
                dataMatrix.push(seriesData);
            }

            var that = this;
            // start to fill in the metric values.
            for (i = startPos; i <= endPos; i++) {
                var row = this.resultDataset.getRows()[i];
                var otherAttrValues = [];
                for (j = 0; j < row.cells.length; j++) {
                    var value = row.cells[j];
                    if (jQuery.inArray(j, otherAttrIndexes) !== -1) {
                        otherAttrValues.push(that.resultDataset.getCellValue(value, j));
                    }
                }
                // otherAttrValues.join(CONCATENATE_STRING) will give the concatenated values, which are the element inside array attrArray.
                var x;
                if (otherAttrValues.length === 1) {
                    // we may need to compare number to number, use the orginal value instead of joined value.
                    x = jQuery.inArray(otherAttrValues[0], distAttr);
                } else {
                    x = jQuery.inArray(otherAttrValues.join(CONCATENATE_STRING), distAttr);
                }
                var y = jQuery.inArray(this.resultDataset.getCellValue(row.cells[segAttrIndex], segAttrIndex), distSegs);

                dataMatrix[y][x] = row.cells[metricColumnIndex].rawValue;
            }
            // Based on the length of distSegs, we will create the same number of series.
            for (i = 0; i < distSegs.length; i++) {
                chartOptions.series[i] = {
                    name: distSegs[i],
                    data: dataMatrix[i]
                };
            }
            // Last thing is to fix category values, update title and series name
            chartOptions.xAxis.categories = distAttr;
            var segChartTitle = this.getJoinedTitle([segAttrIndex]) + ' ' + this.getJoinedTitle(this.metricIndexArray) + ' by ' + this.getJoinedTitle(otherAttrIndexes);
            this.oldChartData.chartTextOptions.chartTitle = this.oldChartData.chartTextOptions.chartTitle || segChartTitle;
            this.oldChartData.chartTextOptions.chartXAxisLabel = this.oldChartData.chartTextOptions.chartXAxisLabel || this.getJoinedTitle(otherAttrIndexes);
        },

        roundToSignifDigits: function(x, n) {
            if(x === 0) {
                return 0;
            }
            var d = Math.ceil(Math.log(Math.abs(x))/Math.LN10);
            var power = n - d;

            var magnitude = Math.pow(10, power);
            var shifted = Math.round(x*magnitude);
            return shifted/magnitude;
        },
        computeBinEdges: function(rows, colidx, numbins, startPos, endPos) {
            var bin_edges = [];

            var minval = Infinity;
            var maxval = -Infinity;
            for (var i = startPos; i <= endPos; i++) {
                var value = rows[i].cells[colidx].rawValue;
                if (value < minval) {
                    minval = value;
                }
                if (value > maxval) {
                    maxval = value;
                }
            }
            var range = maxval - minval;

            if (range === 0) {   // if we can't compute a bin size, just create one big bin
                bin_edges[0] = Infinity;
                return(bin_edges);
            }

            // algorithm: Compute a bin size. Round to a round number. The bin edges are the
            // multiples of the rounded bin size that fall within the range, plus one more.
            // First edge is: ceil(minval / binsize) * binsize. Then increment by binsize until overshot.
            var binsize = range / numbins;
            var fineness = 1; // should be a power of 2, to prevent ugliness
            var binsize_rd = this.roundToSignifDigits(binsize*fineness,1)/fineness;
                // adapted from the internets

            // console.log("original binsize = " + binsize + "; rounded binsize = " + binsize_rd);


            bin_edges[0] = Math.ceil(minval / binsize_rd) * binsize_rd;
            for (i = 1; ; i++) {
                bin_edges[i] = bin_edges[i-1] + binsize_rd;
                if (bin_edges[i] > maxval) {
                    break;
                }
            }
            return bin_edges;
        },
        getBinIndexByValue: function(edges, value) {
            // TODO: use binary search for speed!
            for (var e = 0; e < edges.length; e++) {
                if (edges[e] > value) {
                    return e; // and, implictly, edges[e-1] <= value
                }
            }
            return edges.length;
        },
        createSyntheticBinnedSeries: function () {
            // goal is to update chartOptions.series with a single series, replacing what's there. The "name" field
            // is the top of each bin (make that an option eventually?), and the data field is the count in each bin.

            // get some info about the data
            var startPos = this.chartData.startPos;
            var endPos = this.chartData.endPos;
            var chartOptions = this.chartOptions;
            var metricColumnIndex = this.resultDataset.getColumnIndexByName(this.chartData.chartSegMetricColumnName);
            // TODO: assert that the above is a single value?
            var numbins = this.chartData.binCount;

            // compute the bin edges
            var rows = this.resultDataset.getRows();
            var bin_edges = this.computeBinEdges(rows, metricColumnIndex, numbins, startPos, endPos);
            numbins = bin_edges.length; // user request was only approximate -- this now matches the actual edges

            // initialize bin count and cumulative count
            var bin_counts = [];
            for (var i = 0; i < numbins; i++) {
                bin_counts[i] = 0;
            }

            // iterate over the data (again :( ) to compute the bin counts
            for (i = startPos; i <= endPos; i++) {
                var value = rows[i].cells[metricColumnIndex].rawValue;
                var bin_idx = this.getBinIndexByValue(bin_edges, value);
                bin_counts[bin_idx]++;
            }

            // want to display the following as a tooltip, for each bar:
            //  bin interval, count, bin proportion, cumul. proportion
            // so, iterate over the counts to get cumulative counts, which can be used to generate those
            var bin_cumul_counts = [];
            bin_cumul_counts[0] = bin_counts[0];
            for (i = 1; i < bin_counts.length; i++) {
                bin_cumul_counts[i] = bin_cumul_counts[i-1] + bin_counts[i];
            }

            // store the X tick labels in xAxis.categories, and the Y values and tooltip strings in
            // chartOptions.series[].data and .name.
            if (bin_edges.length > 1) {
                chartOptions.xAxis.categories = jQuery.map(bin_edges, function(x) { return("<" + Highcharts.numberFormat(x)); });
            } else {
                chartOptions.xAxis.categories = [ rows[0].cells[metricColumnIndex].rawValue ];
            }
            var tooltips = [];
            var total_counts = bin_cumul_counts[bin_cumul_counts.length-1];
            for (i = 0; i < bin_edges.length; i++) {
                var tt = "<b>";
                tt += (i > 0) ? Highcharts.numberFormat(bin_edges[i-1]) : "-Inf";
                tt += " - " + (isFinite(bin_edges[i]) ? Highcharts.numberFormat(bin_edges[i]) : "Inf") + "</b><br>";
                tt += "this : " + Highcharts.numberFormat(bin_counts[i], 0) + " ; " + Highcharts.numberFormat(100 * bin_counts[i] / total_counts, 1) + "%<br>";
                tt += "cumul: " + Highcharts.numberFormat(bin_cumul_counts[i], 0) + " ; " + Highcharts.numberFormat(100 * bin_cumul_counts[i] / total_counts, 1) + "%";
                tooltips[i] = tt;
            }
            // need to unroll this to get tooltips to work, annoyingly. could collapse these loops if need be.
            chartOptions.series[0].data = [];
            for (i = 0; i < bin_edges.length; i++) {
                chartOptions.series[0].data[i] = {
                    name: tooltips[i],
                    y: bin_counts[i]
                };
            }
        },

        // turnIntoHistogram: function() {
        //     this.chartOptions.charthis.oldChartData.chartTextOptions.chartXAxisLabel = this.chartOptions.yAxis.title.text;
        //     this.chartOptions.yAxis.title.text = "Count";
        //     this.chartOptions.xAxis.categories = this.chartOptions.series[0].name;
        //     this.type = "column";
        //     console.log(this.chartOptions);
        // },

        // Segmentation on the attribute user selected. synthetic series will be constructed here.
        createSyntheticSeries: function () {
            // console.log("checking to see if we need to create a synthetic series")
            // Set the data series.
            if (this.chartData.chartAutoSegmentation &&
                this.chartOptions.chart.type !== Sentrana.CHART_TYPE_PIE &&
                this.chartOptions.chart.type !== Sentrana.CHART_TYPE_GAUGE &&
                this.chartType !== Sentrana.CHART_TYPE_HISTOGRAM &&
                this.attributeIndexArray.length > 1 &&
                this.metricIndexArray.length >= 1) {
                this.createSyntheticSegmentedSeries();
            } else if (this.chartType === Sentrana.CHART_TYPE_HISTOGRAM && // NOTE! Not this.chartOptions.chart.type!
                this.metricIndexArray.length === 1) {
                // console.log("binning data for histogram");
                this.createSyntheticBinnedSeries();
                //this.turnIntoHistogram();
            }
        }
    });

    // Class that will wrap JSON object returned from server service, add extended functions to manipulate the result set.
    $.Class("Sentrana.Models.ResultDataset", {}, {
        init: function (options) {
            $.extend(this, options.data);
            // 0 for attribute
            this.attributeIndexArray = this.getIndexArray(Sentrana.ColType.ATTRIBUTE);
            // 1 for metric
            this.metricIndexArray = this.getIndexArray(Sentrana.ColType.METRIC);
        },
        getRows: function () {
            return this.rows;
        },
        getColInfos: function () {
            return this.colInfos;
        },

        getColTitle: function (index) {
           if(this.isNumber(index)) {
                return this.colInfos[index].title;
            }
        },

       isNumber: function (n) {
           return !isNaN(parseFloat(n)) && isFinite(n);
       },
        // Get column index by input of column name.
        getColumnIndexByName: function (name) {
            var index = Number.NaN;
            $.each(this.colInfos, function (i, value) {
                if (value.title === name) {
                    index = i;
                    return false;
                }
                return true;
            });
            return index;
        },

        // Get an array of all the attribute column names
        getAttrColumnNames: function () {
            var attrColumnNames = [];
            var that = this;
            $.each(this.attributeIndexArray, function (i, value) {
                attrColumnNames.push(that.colInfos[value].title);
            });
            return attrColumnNames;
        },

        // Get an array of all the metric column names
        getMetricColumnNames: function () {
            var metricColumnNames = [];
            var that = this;
            $.each(this.metricIndexArray, function (i, value) {
                metricColumnNames.push(that.colInfos[value].title);
            });
            return metricColumnNames;
        },

        // Determine whether current metrics contain metric with currency data type only.
        hasCurrencyMetric: function () {
            var result = true;
            var that = this;
            $.each(this.metricIndexArray, function (i, value) {
                result = result && that.colInfos[value].dataType === Sentrana.DataType.CURRENCY;
            });
            return result;
        },

        // Determine whether current metrics contain metric with percentage data type only.
        hasPercentageMetric: function () {
            var result = true;
            var that = this;
            $.each(this.metricIndexArray, function (i, value) {
                result = result && that.colInfos[value].dataType === Sentrana.DataType.PERCENTAGE;
            });
            return result;
        },

        // Determine whether current attributes contain attribute with time series value type.
        hasTimeSeriesAttr: function () {
            var result = false;
            var that = this;
            $.each(this.attributeIndexArray, function (i, value) {
                result = that.colInfos[value].attrValueType === Sentrana.AttrValueType.TIMESERIES;
                return false;
            });
            return result;
        },

        // Instance method.
        // Get vertical array from a matrix dataset.
        // @param colIndex This could be a single column index or an array of indexes.
        // @param concatType Concatenating type could be join or array.
        getVerticalArrayFromDataSet: function (colIndex, concatType) {
            var verticalArray = [];
            var rows = this.getRows();
            var len = rows.length;
            for (var i = 0; i < len; i++) {
                var row = rows[i];
                // The colIndex passed in could be an array containing only one index and could be an array containing multiple indexes.
                // We need different ways to handle the content in the series array.
                if (colIndex.length === 1) {
                    verticalArray.push(this.getCellValue(row.cells[colIndex[0]], colIndex[0]));
                } else {
                    var concatenatedValue = {};
                    var concatenatedValueArray = [];
                    for (var j = 0; j < colIndex.length; j++) {
                       concatenatedValueArray.push(this.getCellValue(row.cells[colIndex[j]], colIndex[j]));
                    }
                    if (concatType === 'join') {
                        concatenatedValue = concatenatedValueArray.join(CONCATENATE_STRING);
                    } else if (concatType === 'array') {
                        concatenatedValue = concatenatedValueArray;
                    } else {
                        concatenatedValue = concatenatedValueArray;
                    }
                    verticalArray.push(concatenatedValue);
                }
            }
            return verticalArray;
        },

        // Based on the data type of the column, choose the formatted value or raw value to be used in chart.
        getCellValue: function (cell, colIndex) {
            if (this.colInfos[colIndex].attrValueType !== Sentrana.AttrValueType.TIMESERIES &&
                this.colInfos[colIndex].dataType !== Sentrana.DataType.DATETIME) {
                return cell.rawValue;
            } else {
                // For timeseries and not numeric attribute, we need to use the formatted value. This is for correct display of date value.
                return cell.fmtValue;
            }
        },

        // How many attributes or metrics in the report definition
        getIndexArray: function (colType) {
            var indexArray = [];
            for (var i = 0; i < this.colInfos.length; i++) {
                if (this.colInfos[i].colType === colType) {
                    indexArray.push(i);
                }
            }
            return indexArray;
        },

        getRowAttributeValues: function(row, indexArray, excludeIndex) {
            var nameArray = [];
            for (var i = 0; i < indexArray.length; i++) {
                if(i !== excludeIndex){
                    nameArray.push(row.cells[indexArray[i]].rawValue);
                }
            }
            return nameArray.join(', ');
        }
    });

    // Generic chart options class
    $.Class("Sentrana.Models.ChartOptions", {}, {
        init: function (options) {
            // Initialize ChartOptions object
            this.addChart();
            this.setDefaultColor();
            this.setCredits();
            this.setTitle();
            this.setSubtitle();
            this.addYAxis();
            this.addLegend();
            this.addTooltip();
            this.addDefaultSeries();
            this.setDefaultNavigation();
            this.addXAxis();

            this.reportChartController = options.controller;
            var chartAdapter = this.reportChartController.chartAdapter;
            if (chartAdapter.resultDataset.hasCurrencyMetric()) {
                // Add currency format
                this.addCurrencyFormat();
            } else if (chartAdapter.resultDataset.hasPercentageMetric()) {
                // Add percentage format
                this.addPercentageFormat();
            } else {
                // Else add default format
                this.addDefaultFormat();
            }
            this.setExportMenus();
        },
        addChart: function () {
            this.chart = {
                renderTo: {},
                type: Sentrana.CHART_TYPE_LINE,
                marginRight : 10
                // marginBottom : 25
            };
        },
        setDefaultColor: function () {
            this.colors = [
                '#4572A7',
                '#AA4643',
                '#89A54E',
                '#80699B',
                '#3D96AE',
                '#DB843D',
                '#92A8CD',
                '#A47D7C',
                '#B5CA92'
            ];
        },
        setCredits: function () {
            this.credits = {
                enabled: false
            };
        },
        setTitle: function () {
            this.title = {
                text: 'default title'
            };
        },
        setSubtitle: function () {
            this.subtitle = {
                text: 'default subtitle'
            };
        },
        addYAxis: function () {
            this.yAxis = {
                //min : 0,
                allowDecimals: true,
                labels: {
                    formatter: null
                },
                title: {
                    text: ''
                }
            };
        },
        addLegend: function () {
            this.legend = {
                backgroundColor: '#FFFFFF',
                reversed: true
                // layout: 'vertical',
                // align: 'right',
                // verticalAlign: 'top',
                // x: -10,
                // y: 100
            };
        },
        removeLegend: function () {
            this.legend.enabled = false;
        },
        addTooltip: function () {
            this.tooltip = {
                formatter: function () {
                    return '' + this.series.name + ': ' + this.y + '';
                }
            };
        },
        removeTooltip: function () {
            this.tooltip.formatter = null;
        },
        addDefaultSeries: function () {
            this.series = [{
                name: '',
                type: '',
                data: null
            }];
        },
        setDefaultNavigation: function () {
            this.navigation = {
                buttonOptions: {
                    enabled: false
                }
            };
        },

        // Export options
        setExportMenus: function (elems, ev) {
            var buttons = {
                exportButton: {
                    enabled: this.reportChartController.options.chartExport.exporting.enabled,
                    // Overwrite existing menu items
                    menuItems: this.reportChartController.options.chartExport.exporting.menuItems
                },
                printButton: {
                    enabled: this.reportChartController.options.chartExport.print.enabled
                }
            };
            if (this.reportChartController.options.chartExport.exporting.symbol) {
                buttons.exportButton.symbol = this.reportChartController.options.chartExport.exporting.symbol;
                buttons.exportButton.borderWidth = 0;
                buttons.exportButton.backgroundColor = "white";
                buttons.exportButton.x = -18;
                buttons.exportButton.symbolX = 6;
				buttons.exportButton.symbolY = 4;
            }
            if (this.reportChartController.options.chartExport.print.symbol) {
                buttons.printButton.symbol = this.reportChartController.options.chartExport.print.symbol;
                buttons.printButton.borderWidth = 0;
                buttons.printButton.backgroundColor = "white";
                buttons.printButton.x = -45;
                buttons.printButton.symbolX = 6;
                buttons.printButton.symbolY = 4;
            }
            this.exporting = {
                buttons: buttons,
                url: this.reportChartController.options.chartExport.url
            };
        },

        // Chart interaction functions
        requestDrillMenu: function (elems, ev, reportChartController) {
            reportChartController.options.model.requestDrillMenu(elems, ev);
        },
        setChart: function (startPos, reportChartController) {
            // Force no redraw after the initialization of startPos.
            reportChartController.chartData.attr("needRedraw", false);
            reportChartController.chartData.attr("startPos", startPos);

            // Force redraw of chart
            reportChartController.chartData.attr("needRedraw", true);
            reportChartController.chartData.attr("endPos", startPos + reportChartController.chartAdapter.chartData.chartCollapseRowLimit - 1);
        },

        // Auxiliary functions
        // Add X Axis
        addXAxis: function () {
            this.xAxis = {
                categories: [],
                labels: {
                    rotation: Sentrana.CHART_DEFAULT_XAXIS_ROTATION,
                    align: 'center'
                },
                title: {
                    text: ''
                }
            };
        },
        setXAxisRotation: function (rotation) {
            var align;
            // Set the best alignment based on the rotation angle.
            if (this.chart.type === 'bar') {
                // Bar chart is special case as the x axis and y axis are in reversed position.
                align = 'right';
            } else {
                if (rotation > 0) {
                    align = 'left';
                } else if (rotation === 0) {
                    align = 'center';
                } else {
                    align = 'right';
                }
            }
            if (this.xAxis.labels !== null) {
                this.xAxis.labels.rotation = rotation;
                this.xAxis.labels.align = align;
            } else {
                this.addXAxis();
                this.setXAxisRotation(rotation);
            }
        },
        // Set stacking chart options
        addStackingPlotOptions: function () {
            this.plotOptions.series = {
                stacking: 'normal'
            };
        },
        // get drillable pointer option object.
        getDrillablePointer: function () {
            var that = this;
            var CHART_TYPE_PIE = Sentrana.CHART_TYPE_PIE;
            var CHART_TYPE_STACKED_COLUMN = Sentrana.CHART_TYPE_STACKED_COLUMN;

            return {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (ev) {
                            // This selector assumes that the name of our report chart class is sentrana_report_chart.
                            // This is a way to access report chart controller inside Highcharts element event.
                            // ev.target is not working for safari browser so we use window.event.target.
                            var reportChartController = $(ev.target).parents('div[class*="sentrana_report_chart"]').controller() || $(window.event.target).parents('div[class*="sentrana_report_chart"]').controller();
                            var elems = [];
                            if (that.chart.type === CHART_TYPE_PIE) {
                                // Get the first selected element.
                                elems.push(this.name);
                            } else {
                                // Get the list of selected elements...
                                // Category could be concatenated value.
                                $.each((this.category + '').split(","), function (index, el) {
                                    elems.push($.trim(el));
                                });
                            }
                            if (reportChartController.chartAdapter.autoSeg) {
                                elems.push(this.series.name);
                            }
                            elems.push(this.y);
                            // Ask for a drill menu to be displayed for the elements specified on the row...
                            if (elems[0] === reportChartController.chartAdapter.chartData.chartCollapseItemName) {
                                var drilldown = this.drilldown;
                                if (drilldown) {// drill down
                                    that.setChart(drilldown.startPos, reportChartController);
                                } else {// restore, start from the first row
                                    that.setChart(0, reportChartController);
                                }
                            } else {
                                that.requestDrillMenu(elems, ev, reportChartController);
                            }
                        }
                    }
                },
                events: {
                    legendItemClick: function () {
                        // Verify the metrics on chart again to determine whether we are going to change the format
                        // TODO
                    }
                }
            };
        },

        // Add currency format
        addCurrencyFormat: function () {
            this.addNumberFormat('$');
        },
        // Add percentage format
        addPercentageFormat: function () {
            this.yAxis.labels.formatter = function () {
                return Highcharts.numberFormat(this.value * 100, 2) + ' %';
            };
            this.tooltip.formatter = function () {
                return '' + this.series.name + ': ' + Highcharts.numberFormat(this.y * 100, 2) + ' %';
            };
        },
        // Add default format
        addDefaultFormat: function () {
            this.addNumberFormat('');
        },
        addNumberFormat: function (formatPrefix) {
        	var that = this;
            this.yAxis.labels.formatter = function () {
                if (this.value >= 1000000 || this.value <= -1000000) {
                    return formatPrefix + Highcharts.numberFormat(this.value / 1000000, 1) + 'M ';
                } else if (this.value >= 1000 || this.value <= -1000) {
                    return formatPrefix + Highcharts.numberFormat(this.value / 1000, 0) + 'K ';
                } else if (this.value === 0) {
                    return formatPrefix + Highcharts.numberFormat(this.value, 0);
                } else if (this.value < 1 || this.value > -1) {
                    return formatPrefix + Highcharts.numberFormat(this.value, 2);
                } else {
                    return formatPrefix + Highcharts.numberFormat(this.value, 0);
                }
            };
            this.tooltip.formatter = function () {
                var decimalCount = that.getDecimalCount(this.y, '.');
                // The maximum number of decimal digits on the chart will be two.
                var formatString = that.formatString[this.series.name];
                if(formatString) {
                    return '' + this.series.name + ': ' + that.dotNetFormatter(this.y, formatString);
                }
                return '' + this.series.name + ': ' + formatPrefix + Highcharts.numberFormat(this.y, 2 > decimalCount ? decimalCount : 2);
            };
        },
        addIntegerFormat: function() {
            this.yAxis.labels.formatter = null;
            this.yAxis.labels.format = "{value:,.0f}";
            this.yAxis.allowDecimals = false;
            this.yAxis.minTickInterval = 1;
        },
        // Later on we may need to add more sophisticated support for the format string.
        dotNetFormatter: function(x, formatString){
            var result = formatString;
            if(formatString.indexOf("N") > -1 || formatString.indexOf("C") > -1){
                if(formatString.indexOf("N") > -1) {
                    result = "#,#";
                }
                if(formatString.indexOf("C") > -1) {
                    result = "$#,#";
                }
                var decimalDigit = parseInt(formatString.substr(1, formatString.length - 1), 10);
                for(var i = 0; i < decimalDigit; i++) {
                    if(i === 0){
                        result += ".";
                    }
                    result += "0";
                }
            }

            return String.format("{0:" + result + "}", x);
        },
        setChartSeries: function (startPos, endPos, isCollapsed) {
            var chartAdapter = this.reportChartController.chartAdapter;
            // Set the data series.
            this.series = [];
            this.formatString = [];

            var that = this;
            $.each(chartAdapter.metricIndexArray, function(i, metricIndex) {
                that.series[i] = {
                //name : chartAdapter.resultDataset.getColTitle(chartAdapter.attributeIndexArray.length + i) + ' by ' + chartAdapter.getJoinedTitle(chartAdapter.attributeIndexArray),
                    name: chartAdapter.resultDataset.getColTitle(metricIndex),
                    data: chartAdapter.getArraySubset(chartAdapter.resultDataset.getVerticalArrayFromDataSet([metricIndex], 'array'), Sentrana.ColType.METRIC, startPos, endPos, isCollapsed)
                };
                var seriesName=that.series[i].name,colinfo = $.grep(chartAdapter.resultDataset.colInfos, function(col) {
                    return col.title === seriesName;
                });
                that.formatString[seriesName] = colinfo[0].formatString;
            });

        },
        validateData: function() {
            return null;
        },
        getDecimalCount: function(x, dec_sep)
		{
    		var tmp = x + '';
    		if (tmp.indexOf(dec_sep) > -1) {
        		return tmp.length - tmp.indexOf(dec_sep) - 1;
            } else {
        		return 0;
            }
		}
    });

    Sentrana.Models.ChartOptions("Sentrana.Models.LineChartOptions", {
        init: function (options) {
            this._super(options);
            this.chart.type = Sentrana.CHART_TYPE_LINE;
            this.setPlotOptions();
        },
        setPlotOptions: function () {
            this.plotOptions = {
                line: this.getDrillablePointer()
            };
        }
    });

    Sentrana.Models.ChartOptions("Sentrana.Models.PieChartOptions", {
        init: function (options) {
            this._super(options);
            this.chart.type = Sentrana.CHART_TYPE_PIE;
            this.setPlotOptions();
            this.tooltip = this.getPieToolTip();
        },
        setPlotOptions: function () {
            this.plotOptions = {
                pie: this.getDrillablePointer()
            };
        },
        getPieToolTip: function () {
            var tooltip = {
                formatter: function () {
                    return '<b>' + this.point.name + '</b>: ' + Highcharts.numberFormat(this.percentage, 2) + ' %';
                }
            };
            return tooltip;
        },
        // Overwrite setChartSeries method as PIE chart will have only one series.
        // Pie chart is the exception, the series of pie chart is initialized when the chart option object is created.
        setChartSeries: function (startPos, endPos, isCollapsed) {
            var chartAdapter = this.reportChartController.chartAdapter;
            // chartAdapter.metricIndexArray[0] will give us the index of the first metric.
            this.series[0].name = chartAdapter.resultDataset.getColTitle(chartAdapter.metricIndexArray[0]);
            this.series[0].data = chartAdapter.getArraySubset(chartAdapter.resultDataset.getVerticalArrayFromDataSet([chartAdapter.attributeIndexArray[0], chartAdapter.metricIndexArray[0]], 'array'), 2, startPos, endPos, isCollapsed);
        },
        containNegativeValue: function(data)
        {
            var result = false;
            $.each(data, function (i, value) {
                // value[1] is the value for metrics.
                // value.y could be the metrics value for collapsed rows.
                if (value[1] < 0 || value.y < 0) {
                    result = true;
                    return false;
                }
                return true;
            });
            return result;
        },
        validateData: function() {
            // Need to check all the numeric values for the series. If there are is negative numeric value, we won't show the chart.
            // Instead we show warning message.
            if(this.containNegativeValue(this.series[0].data)) {
                return 'Your data set contains metrics with negative values. Please try sorting the data in descending order and limiting the data range.';
            }
            return null;
        }
    });

    Sentrana.Models.ChartOptions("Sentrana.Models.HistogramChartOptions", {
        init: function (options) {
            this._super(options);
            this.chart.type = 'column';
            this.addIntegerFormat();
            this.removeLegend();
            this.setHistogramTooltip();
            this.setPlotOptions();
            this.plotOptions.column.pointPadding = 0;
            this.plotOptions.column.groupPadding = 0;
            this.plotOptions.column.borderWidth = 0;
            this.xAxis.labels.rotation = 45;
        },
        setHistogramTooltip: function () {
            this.tooltip = {
                formatter: function () {
                    return this.point.name;
                }
            };
        },
        setPlotOptions: function () {
            this.plotOptions = {
                column: this.getDrillablePointer()
            };
        }
    });

    Sentrana.Models.ChartOptions("Sentrana.Models.ColumnChartOptions", {
        init: function (options) {
            this._super(options);
            this.chart.type = 'column';
            this.setPlotOptions();
        },
        setPlotOptions: function () {
            this.plotOptions = {
                column: this.getDrillablePointer()
            };
        }
    });

    Sentrana.Models.ChartOptions("Sentrana.Models.BarChartOptions", {
        init: function (options) {
            this._super(options);
            this.chart.type = 'bar';
            this.setPlotOptions();
        },
        setPlotOptions: function () {
            this.plotOptions = {
                bar: this.getDrillablePointer()
            };
        }
    });

    Sentrana.Models.ColumnChartOptions("Sentrana.Models.StackedColumnChartOptions", {
        init: function (options) {
            this._super(options);
            // Overwritten attributes
            this.addStackingPlotOptions();
        }
    });

    Sentrana.Models.BarChartOptions("Sentrana.Models.StackedBarChartOptions", {
        init: function (options) {
            this._super(options);
            // Overwritten attributes
            this.addStackingPlotOptions();
        }
    });

    Sentrana.Models.ChartOptions("Sentrana.Models.ScatterChartOptions", {
        init: function (options) {
            this._super(options);
            this.chart.type = 'scatter';
            this.chart.marginRight = 30;
            this.chart.zoomType = 'xy';
            this.addXAxis();
            this.setPlotOptions();
            this.setScatterToolTip();
        },
        setChartSeries: function (startPos, endPos, isCollapsed) {
            var defaultSeriesName = "";
            var chartAdapter = this.reportChartController.chartAdapter;

            var segAttrIndex = chartAdapter.resultDataset.getColumnIndexByName(chartAdapter.chartData.chartLegendAttrColumnName);
            var firstMetricIndex = chartAdapter.attributeIndexArray.length;
            var secondMetricIndex = chartAdapter.attributeIndexArray.length + 1;

            // We need to scan all the values in the attribute column.
            // For each of the values we will need to create one series.
            var segsArray = [];
            if(isNaN(segAttrIndex)) {
                segsArray = [defaultSeriesName];
            } else {
                segsArray = chartAdapter.getArraySubset(chartAdapter.resultDataset.getVerticalArrayFromDataSet([segAttrIndex], 'join'), Sentrana.ColType.ATTRIBUTE, startPos, endPos, false);
            }
            var distSegs = segsArray.unique();

            // start to initialize the series array.
            var dataSeriesArray = [];
            for (var i = 0; i < distSegs.length; i++) {
                var seriesData = [];
                dataSeriesArray.push(seriesData);
            }

            // Set the format by looking at the column information
            this.xFormatString = chartAdapter.resultDataset.colInfos[firstMetricIndex].formatString;
            this.yFormatString = chartAdapter.resultDataset.colInfos[secondMetricIndex].formatString;

            // start to fill in the metric values.
            for (i = startPos; i <= endPos; i++) {
                var row = chartAdapter.resultDataset.getRows()[i];

                var seriesIndex = 0;
                if(!isNaN(segAttrIndex)) {
                    seriesIndex = jQuery.inArray(chartAdapter.resultDataset.getCellValue(row.cells[segAttrIndex], segAttrIndex), distSegs);
                }
                // this.attributeIndexArray.length is the index for metric column.
                dataSeriesArray[seriesIndex].push({name:chartAdapter.resultDataset.getRowAttributeValues(row, chartAdapter.attributeIndexArray, segAttrIndex), x:row.cells[firstMetricIndex].rawValue, y:row.cells[secondMetricIndex].rawValue});
            }

            // Set the data series.
            this.series = [];

            for (i = 0; i < distSegs.length; i++) {
                this.series[i] = {
                    showInLegend: distSegs[i] === '' ? false : true,
                    name: distSegs[i],
                    data: dataSeriesArray[i]
                };
            }

            // Set XAxis and YAxis labels.
            this.xAxis.title.text = chartAdapter.resultDataset.getColTitle(firstMetricIndex); // First Metric
            this.yAxis.title.text = chartAdapter.resultDataset.getColTitle(secondMetricIndex); // Second Metric
        },

        // There are some special configuration for scatter chart.
        // startOnTick: true,
        // endOnTick: true,
        // showLastLabel: true
        addXAxis: function () {
            this.xAxis = {
                title: {
                    enabled: true,
                    text: ''
                },
                labels: {
                    rotation: Sentrana.CHART_DEFAULT_XAXIS_ROTATION,
                    align: 'center'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            };
        },

        setPlotOptions: function () {
            this.plotOptions = {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    }
                }
            };
        },

        setScatterToolTip: function () {
            var that = this;
            this.tooltip = {
                formatter: function () {
                    var seriesName = this.series.options.showInLegend ? '<b>' + this.series.name + '</b><br>' : '';
                    var pointName = this.point.name === '' ? '' : this.point.name + '<br>';
                    return seriesName + pointName + that.dotNetFormatter(this.point.x, that.xFormatString) + ', ' + that.dotNetFormatter(this.point.y, that.yFormatString);
                }
            };
        }
    });

	Sentrana.Models.ChartOptions("Sentrana.Models.BubbleChartOptions", {
        init: function (options) {
            this._super(options);
            this.chart.type = 'bubble';
            this.chart.zoomType = 'xy';
            this.removeCategories();
            this.setBubbleToolTip();
        },
        setChartSeries: function (startPos, endPos, isCollapsed) {
            var defaultSeriesName = "";
            var chartAdapter = this.reportChartController.chartAdapter;

            var segAttrIndex = chartAdapter.resultDataset.getColumnIndexByName(chartAdapter.chartData.chartLegendAttrColumnName);
            var firstMetricIndex = chartAdapter.attributeIndexArray.length;
            var secondMetricIndex = chartAdapter.attributeIndexArray.length + 1;
            var thirdMetricIndex = chartAdapter.attributeIndexArray.length + 2;

            // We need to scan all the values in the attribute column.
            // For each of the values we will need to create one series.
            var segsArray = [];
            if(isNaN(segAttrIndex)) {
                segsArray = [defaultSeriesName];
            } else {
                segsArray = chartAdapter.getArraySubset(chartAdapter.resultDataset.getVerticalArrayFromDataSet([segAttrIndex], 'join'), Sentrana.ColType.ATTRIBUTE, startPos, endPos, false);
            }
            var distSegs = segsArray.unique();

            // start to initialize the series array.
            var dataSeriesArray = [];
            for (var i = 0; i < distSegs.length; i++) {
                var seriesData = [];
                dataSeriesArray.push(seriesData);
            }

            // Set the format by looking at the column information
            this.xFormatString = chartAdapter.resultDataset.colInfos[firstMetricIndex].formatString;
            this.yFormatString = chartAdapter.resultDataset.colInfos[secondMetricIndex].formatString;
            this.zFormatString = chartAdapter.resultDataset.colInfos[thirdMetricIndex].formatString;

            // start to fill in the metric values.
            for (i = startPos; i <= endPos; i++) {
                var row = chartAdapter.resultDataset.getRows()[i];

                var seriesIndex = 0;
                if(!isNaN(segAttrIndex)) {
                    seriesIndex = jQuery.inArray(chartAdapter.resultDataset.getCellValue(row.cells[segAttrIndex], segAttrIndex), distSegs);
                }
                // this.attributeIndexArray.length is the index for metric column.
                dataSeriesArray[seriesIndex].push({name:chartAdapter.resultDataset.getRowAttributeValues(row, chartAdapter.attributeIndexArray, segAttrIndex), x:row.cells[firstMetricIndex].rawValue, y:row.cells[secondMetricIndex].rawValue, z:row.cells[thirdMetricIndex].rawValue});
            }

            // Set the data series.
            this.series = [];

            for (i = 0; i < distSegs.length; i++) {
                this.series[i] = {
                    showInLegend: distSegs[i] === '' ? false : true,
                    name: distSegs[i],
                    data: dataSeriesArray[i]
                };
            }

            // Set XAxis and YAxis labels.
            this.xAxis.title.text = chartAdapter.resultDataset.getColTitle(firstMetricIndex); // First Metric
            this.yAxis.title.text = chartAdapter.resultDataset.getColTitle(secondMetricIndex); // Second Metric
        },
        // It seems we need to remove the categories property otherwise we won't get the bubble chart rendered.
        removeCategories: function() {
            delete this.xAxis.categories;
        },

        setBubbleToolTip: function () {
            var that = this;
            this.tooltip = {
                formatter: function () {
                    var seriesName = this.series.options.showInLegend ? '<b>' + this.series.name + '</b><br>' : '';
                    var pointName = this.point.name === '' ? '' : this.point.name + '<br>';
                    return seriesName  + pointName + '(' + that.dotNetFormatter(this.point.x, that.xFormatString) + ', ' + that.dotNetFormatter(this.point.y, that.yFormatString) + '), Size: ' + that.dotNetFormatter(this.point.z, that.zFormatString);
                }
            };
        }
    });

    Sentrana.Models.ChartOptions("Sentrana.Models.GaugeChartOptions", {
        init: function (options) {
            this._super(options);
            this.chart.type = 'gauge';

            var chartAdapter = this.reportChartController.chartAdapter;
            this.minData = parseInt(chartAdapter.resultDataset.rows[0].cells[1].rawValue, 10);
            this.maxData = parseInt(chartAdapter.resultDataset.rows[0].cells[2].rawValue, 10);
            this.data = chartAdapter.resultDataset.rows[0].cells[3].rawValue;
            this.dataLabel = chartAdapter.resultDataset.colInfos[3].title;

        },
        pane: {
            startAngle: -150,
            endAngle: 150
        },

        // Set the yaxis
        yAxis:
                {
                    labels: {
                        formatter: null,
                        step: 2,
                        rotation: 'auto'
                    },
                    title: {
                        text: ''
                    }
                },

        setChartSeries: function (startPos, endPos, isCollapsed) {

            // Set the yaxis
            this.yAxis =
                    {
                        min: this.minData,
                        max: this.maxData,
                        allowDecimals: true,
                        minorTickInterval: 'auto',
                        minorTickWidth: 1,
                        minorTickLength: 2,
                        minorTickPosition: 'inside',
                        minorTickColor: '#666',
                        tickPixelInterval: 30,
                        tickWidth: 2,
                        tickPosition: 'inside',
                        tickLength: 10,
                        tickColor: '#666',
                        labels: {
                            formatter: null,
                            step: 2,
                            rotation: 'auto'
                        },
                        title: {
                            text: ''
                        }
                    };

            // Set the data series.
            this.series = [{
                name: this.dataLabel,
                data: [this.data],
                tooltip: {
                    valueSuffix: ''
                }
            }];
        }
    });
})();
