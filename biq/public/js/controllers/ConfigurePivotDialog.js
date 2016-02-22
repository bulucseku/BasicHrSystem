steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.ConfigurePivot", {
        pluginName: 'sentrana_dialogs_configure_pivot',
        defaults: {
            title: "Configure pivot analysis",
            autoOpen: false,
            buttons: [{
                label: "CANCEL",
                className: "btn-cancel btn-default"
            }, {
                label: "OK",
                className: "btn-ok btn-primary"
            }]
        }
    }, {
        init: function (el, options) {
            this._super(el, options);
        },

        open: function (structure) {
            this.element.find(".configure-pivot-dlg-content").html(can.view('templates/pivot-elements.ejs', {
                fields: this.getRemainingColumns(structure),
                filters: structure.filters,
                cols: structure.columns,
                rows: structure.rows,
                values: structure.values
            }));
            this.makeItemSortable();
            this.openDialog();
        },

        getRemainingColumns: function (structure) {
            var fields = [];
            for (var i = 0; i < this.options.allColumns.length; i++) {
                var title = this.options.allColumns[i].title;
                if (!this.isAddedToStructure(title, structure)) {
                    fields.push(title);
                }
            }

            return fields;
        },

        isAddedToStructure: function (title, structure) {
            for (var i = 0; i < structure.rows.length; i++) {
                if (structure.rows[i] === title) {
                    return true;
                }
            }

            for (i = 0; i < structure.filters.length; i++) {
                if (structure.filters[i].name === title) {
                    return true;
                }
            }

            for (i = 0; i < structure.columns.length; i++) {
                if (structure.columns[i] === title) {
                    return true;
                }
            }

            for (i = 0; i < structure.values.length; i++) {
                if (structure.values[i].name === title) {
                    return true;
                }
            }

            return false;
        },

        makeItemSortable: function () {

            this.element.find(".pivot-elements").sortable({
                items: ".pivot-element",
                connectWith: ".pivot-fields-connected"
            }).disableSelection();
        },

        handleCANCEL: function () {
            this.closeDialog();
        },

        handleOK: function () {
            this.closeDialog();
            this.options.parent.renderTable(this.getStructure());
        },

        getStructure: function () {
            var filterItems = this.getSelectedItems('.pivot-filters'),
                filters = [];
            for (var i = 0; i < filterItems.length; i++) {
                filters.push({
                    name: filterItems[i].title,
                    type: "multiselect"
                });
            }

            var columnItems = this.getSelectedItems('.pivot-columns'),
                columns = [];
            for (i = 0; i < columnItems.length; i++) {
                columns.push(columnItems[i].title);
            }

            var rowItems = this.getSelectedItems('.pivot-rows'),
                rows = [];
            for (i = 0; i < rowItems.length; i++) {
                rows.push(rowItems[i].title);
            }

            var valItems = this.getSelectedItems('.pivot-values'),
                values = [];
            for (i = 0; i < valItems.length; i++) {
                values.push({
                    name: valItems[i].title,
                    operation: "sum"
                });
            }

            return {
                rows: rows,
                columns: columns,
                values: values,
                filters: filters
            };
        },

        getSelectedItems: function (className) {
            var colInfos = this.options.allColumns,
                items = [];
            this.element.find(className).find('.pivot-element').each(function () {
                var title = $(this).attr('name');
                var col = $.grep(colInfos, function (column, index) {
                    return column.title === title;
                });

                items.push(col[0]);
            });

            return items;
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
