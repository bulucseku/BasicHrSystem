steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.MaximizeChart", {
        pluginName: 'sentrana_dialogs_maximize_chart',
        defaults: {
            title: "Maximize chart",
            autoOpen: false
        }
    }, {
        init: function (el, options) {
            this._super(el, options);
            this.$chartContainer = this.element.find('.maximized-chart-container');
            this.$buttonContainer = this.element.find('.maximized-chart-dialogs-buttons');
            this.prepareForm();
        },

        prepareForm: function () {
            this.element.find(".modal-header").hide();
            this.element.find(".modal-footer").hide();
            this.element.find(".modal-dialog").width(this.options.dialogDimension.width + 'px').css('margin', 'auto').css('margin-top', '5px');
            this.element.find(".modal-content").css('min-height', this.options.dialogDimension.height + 'px');
            this.createButtons();

        },

        createButtons: function () {
            var that = this;
            var exportButtonInfo = {
                "title": "Export",
                "cls": "fa-cloud-download",
                "eventType": "export_all",
                "dropdown": true,
                "btnStyle": "",
                "menuItems": [{
                    id: "png",
                    name: "Download Chart (PNG)"
                }, {
                    id: "jpeg",
                    name: "Download Chart (JPEG)"
                }, {
                    id: "pdf",
                    name: "Download Chart (PDF)"
                }]
            };

            var printButtonInfo = {
                "title": "Print",
                "cls": "fa-print",
                "btnStyle": "",
                "eventType": "print_all",
                "dropdown": false
            };

            var closeButtonInfo = {
                "title": "Close",
                "cls": "fa-times",
                "btnStyle": "",
                "eventType": "close_dialog",
                "dropdown": false
            };
            //            this.$buttonContainer.html('');
            this.$buttonContainer.append('templates/collapsibleContainerButton.ejs', exportButtonInfo);
            this.$buttonContainer.append('templates/collapsibleContainerButton.ejs', printButtonInfo);
            this.$buttonContainer.append('templates/collapsibleContainerButton.ejs', closeButtonInfo);
            this.$buttonContainer.append('<div class="clear"></div>');

            var $buttonExport = this.$buttonContainer.find('.fa-cloud-download').closest('.cc-button');
            $buttonExport.on("click", function (event) {
                if (exportButtonInfo.dropdown) {
                    var $dropDown = $buttonExport.find(".container-drop-down");

                    var pos = $(event.delegateTarget).position();
                    $dropDown.css({
                        top: pos.top + $(event.delegateTarget).height(),
                        left: pos.left - $dropDown.width() + $(event.delegateTarget).width()
                    });
                    $dropDown.show();

                    $dropDown.find(".container-button-menu").off("click");

                    $dropDown.find(".container-button-menu").on("click", function (event) {
                        $dropDown.hide();
                        that.element.trigger("export_all", {
                            type: $(this).attr('elementid'),
                            size: that.options.dialogDimension
                        });

                        event.stopPropagation();

                    });

                    $dropDown.on("mouseleave", function (event) {
                        $dropDown.hide();
                    });

                }
                else {
                    that.element.trigger(exportButtonInfo.eventType, exportButtonInfo.eventArgs);
                }
                return false;
            });

            var $buttonPrint = this.$buttonContainer.find('.fa-print').closest('.cc-button');
            $buttonPrint.off("click");
            $buttonPrint.on("click", function (event) {
                that.origFocus = document.activeElement;
                that.closeDialog();
                setTimeout(function () {
                    that.element.trigger("print_all", {
                        type: "chart"
                    });
                }, 300);

                return false;
            });

            var $buttonclose = this.$buttonContainer.find('.fa-times').closest('.cc-button');
            $buttonclose.off("click");
            $buttonclose.on("click", function (event) {
                that.origFocus = document.activeElement;
                that.closeDialog();
                return false;
            });
        },

        renderChart: function () {
            if (this.chartControl) {
                this.chartControl.destroy();
            }

            this.chartControl = this.$chartContainer.sentrana_report_chart(this.chartOptions).control();
        },

        open: function (chartOptions) {
            chartOptions.stopInitialRendering = false;
            chartOptions.chart.chartType = chartOptions.chartData.chartType;
            this.chartOptions = chartOptions;
            this.renderChart();
            this.openDialog();
        }
    });

    Sentrana.Dialogs.MaximizeChart("Sentrana.Dialogs.MaximizePivotChart", {
        pluginName: 'sentrana_dialogs_maximize_pivot_chart',
        defaults: {
            title: "Maximize chart",
            autoOpen: false
        }
    }, {

        renderChart: function (chartType) {
            if (this.chartControl) {
                this.chartControl.destroy();
            }

            this.chartControl = this.$chartContainer.sentrana_pivot_chart(this.chartOptions).control();
            this.chartControl.staticUpdate(chartType);
        },

        open: function (chartOptions, chartType) {
            this.chartOptions = chartOptions;
            this.$buttonContainer.find('.fa-print').closest('.cc-button').hide();
            this.renderChart(chartType);
            this.openDialog();
        }
    });

});
