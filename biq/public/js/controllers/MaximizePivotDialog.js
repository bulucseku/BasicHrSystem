steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.MaximizePivot", {
        pluginName: 'sentrana_dialogs_maximize_pivot',
        defaults: {
            title: "Maximize pivot",
            autoOpen: false
        }
    }, {
        init: function (el, options) {
            this._super(el, options);
            this.$buttonContainer = this.element.find('.maximized-pivot-dialogs-buttons');
            this.prepareForm();
        },

        prepareForm: function () {
            this.element.find(".modal-header").hide();
            this.element.find(".modal-footer").hide();
            this.element.find(".modal-dialog").width(this.options.dialogDimension.width + 'px').css('margin', 'auto').css('margin-top', '5px');
            this.element.find(".modal-content").css('min-height', this.options.dialogDimension.height + 'px');
            this.configurePivotDlg = this.element.find("#configure-pivot-dlg-max").sentrana_dialogs_configure_pivot({
                app: this.options.app,
                allColumns: this.options.allColumns,
                parent: this
            }).control();
            this.createButtons();
        },

        createButtons: function () {
            var that = this;
            var closeButtonInfo = {
                "title": "Close",
                "cls": "fa-times",
                "btnStyle": "",
                "eventType": "close_dialog",
                "dropdown": false
            };

            var configureButtonInfo = {
                "title": "Configure",
                "cls": "fa-cogs",
                "btnStyle": "",
                "eventType": "configure_pivot",
                "dropdown": false
            };

            var exportButtonInfo = {
                "title": "Export",
                "cls": "fa-cloud-download",
                "btnStyle": "",
                "eventType": "export_all",
                "dropdown": false
            };

            var previousButtonInfo = {
                "title": "Previous",
                "cls": "fa-caret-left",
                "btnStyle": "",
                "eventType": "move_prev",
                "dropdown": false
            };

            var nextButtonInfo = {
                "title": "Next",
                "cls": "fa-caret-right",
                "btnStyle": "",
                "eventType": "move_next",
                "dropdown": false
            };

            this.$buttonContainer.append('templates/collapsibleContainerButton.ejs', previousButtonInfo);
            this.$buttonContainer.append('templates/collapsibleContainerButton.ejs', nextButtonInfo);
            this.$buttonContainer.append('templates/collapsibleContainerButton.ejs', configureButtonInfo);
            this.$buttonContainer.append('templates/collapsibleContainerButton.ejs', exportButtonInfo);
            this.$buttonContainer.append('templates/collapsibleContainerButton.ejs', closeButtonInfo);
            this.$buttonContainer.append('<div class="clear"></div>');

            var $buttonclose = this.$buttonContainer.find('.fa-times').closest('.cc-button');
            $buttonclose.off("click");
            $buttonclose.on("click", function (event) {
                that.origFocus = document.activeElement;
                that.closeDialog();
                return false;
            });

            var $buttonConfig = this.$buttonContainer.find('.fa-cogs').closest('.cc-button');
            $buttonConfig.off("click");
            $buttonConfig.on("click", function (event) {
                that.origFocus = document.activeElement;
                that.configurePivot();
            });

            var $buttonExport = this.$buttonContainer.find('.fa-cloud-download').closest('.cc-button');
            $buttonExport.off("click");
            $buttonExport.on("click", function (event) {
                that.origFocus = document.activeElement;
                that.exportToExcel();
            });

            var $buttonPrevious = this.$buttonContainer.find('.fa-caret-left').closest('.cc-button');
            $buttonPrevious.off("click");
            $buttonPrevious.on("click", function (event) {
                that.origFocus = document.activeElement;
                that.showPrevious();
            });

            var $buttonNext = this.$buttonContainer.find('.fa-caret-right').closest('.cc-button');
            $buttonNext.off("click");
            $buttonNext.on("click", function (event) {
                that.origFocus = document.activeElement;
                that.showNext();
            });
        },

        showNext: function() {
            this.pivotControl.showNextItems();
        },

        showPrevious: function(){
            this.pivotControl.showPreviousItems();
        },

        configurePivot: function () {
            this.pivotControl.configurePivot();
        },

        exportToExcel: function () {
            this.pivotControl.exportToExcel();
        },

        open: function (structure) {
            this.openDialog();

            if (this.pivotControl && !this.pivotControl._destroyed) {
                this.pivotControl.destroy();
            }

            this.pivotControl = this.element.find(".maximized-pivot-container").sentrana_pivot_control({
                app: this.options.app,
                structure: structure,
                pivotData: this.options.pivotData,
                pivotElement: '#maximized-pivot-cntr',
                pivotContainer: "maximized-pivot-cntr",
                pivotId: "pivot-max",
                height: this.options.dialogDimension.height - 50
            }).control();
        }

    });
});
