steal("lib/sentrana/DialogControl/SentranaDialog.js", function () {

    Sentrana.Controllers.Dialog.extend("Sentrana.Dialogs.ViewRepositoryMetadata", {
        pluginName: 'sentrana_dialogs_view_repository_metadata',
        defaults: {
            title: "View repository metadata",
            autoOpen: false,
            buttons: [{
                label: "CANCEL",
                className: "btn-cancel btn-primary"
            }]
        }
    }, {
        init: function (el, options) {
            this._super(el, options);
            this.$name = this.element.find(".report-name");
        },

        loadForm: function () {
            var svcsUrl = Sentrana.Controllers.BIQController.methodMap.www + "/www";
            this.element.find('.repository-metadata-container').html(can.view('templates/repository_metadata.ejs', {
                svcsUrl: svcsUrl,
                repositoryId: this.repository.id,
                showDataDictionary: this.repository.showDataDictionaryDefinition
            }));
            this.$userFilterDiv = this.element.find(".user-management-filter");
            this.$userFilterTable = this.$userFilterDiv.find(".tbl-user-management-filter tbody");
            var filters = [];
            if (this.repository.datafilters.length > 0) {
                filters = this.getDataFilters();
            }
            this.$userFilterTable.html(can.view("templates/repository_metadata_userfilters.ejs", {
                userFilters: filters
            }));
            this.$dataDictionaryContainer = this.element.find(".tbl-data-dictionary-definition");
            this.$dataDictionaryTable = this.$dataDictionaryContainer.find(".table");
            this.$dataDictionaryTableBody = this.$dataDictionaryTable.find("tbody");

            this.$createDate = this.element.find(".repo-create-date");
            this.$lastUpdateDate = this.element.find(".repo-last-update-date");
            this.$nextUpdateDate = this.element.find(".repo-next-update-date");
            this.$tableInfoContainer = this.element.find(".tbl-repository-table-info");
            this.$metadataLoader = this.element.find(".repository-metadata-info-loading");
            this.$metadataContainer = this.element.find(".repository-metadata-info");

            this.$showMetadataButton = this.element.find(".btn-show-repository-metadata");
        },

        getDataFilters: function () {
            var filters = [];
            for (var i = 0; i < this.repository.datafilters.length; i++) {
                var filter = {};
                filter.id = this.repository.datafilters[i].dataFilterId;
                filter.appliedOn = this.getAppliedOn(this.repository.datafilters[i].dataFilterId);
                filter.includedValues = 'N/A';
                filter.excludedValues = 'N/A';
                var values = this.getDataFilterValues(this.repository.datafilters[i].values);
                if (this.repository.datafilters[i].operator === "IN") {
                    filter.includedValues = values;
                }
                else {
                    filter.excludedValues = values;
                }
                filters.push(filter);
            }

            return filters;

        },

        ".btn-show-repository-metadata click": function (el) {

            if (!this.metadataDataTableRendered) {
                this.renderMetaDataDataTable();
            }else{
                this.toggleRepositoryMetadataContainer();
            }
        },

        toggleRepositoryMetadataContainer: function(){
            var that = this;
            if (that.$showMetadataButton.val() === "show") {
                that.$showMetadataButton.val("hide");
                that.$showMetadataButton.text("Hide Repository Metadata");
                that.$metadataContainer.fadeIn();
            }
            else {
                that.$showMetadataButton.val("show");
                that.$showMetadataButton.text("Show Repository Metadata");
                that.$metadataContainer.hide();
            }
        },

        renderMetaDataDataTable: function () {
            var that = this;
            this.$metadataLoader.show();

            $.ajax({
                url: Sentrana.Controllers.BIQController.generateUrl("RepositoryMetadata/" + this.repository.id),
                dataType: "json",
                success: function (data) {
                    if (!data) {
                        return;
                    }

                    var tableData = data[0];
                    that.$createDate.text(tableData.createDate);
                    that.$lastUpdateDate.text(tableData.lastUpdateDate);
                    that.$nextUpdateDate.text(tableData.nextUpdateDate);

                    that.$tableInfoContainer.DataTable({
                        data: tableData.tables,
                        columns: [
                            {title: 'Name', data: 'name'},
                            {title: '# Of Records', data: 'recordCount'},
                            {title: 'ETL Status', data: 'etlErrorStatus'}
                        ]
                    });

                    that.$metadataLoader.hide();
                    that.metadataDataTableRendered = true;
                    that.toggleRepositoryMetadataContainer();
                }
            });
        },

        ".btn-show-data-dictionary click": function (el) {
            if ($(el).val() === "show") {
                $(el).val("hide");
                $(el).text("Hide Data Dictionary");
                this.$dataDictionaryContainer.show();
            }
            else {
                $(el).val("show");
                $(el).text("Show Data Dictionary");
                this.$dataDictionaryContainer.hide();
            }

            if (!this.dataDictionaryDataTableRendered) {
                this.renderDataDictionaryTable();
            }
        },



        renderDataDictionaryTable: function () {
            var dimensions = this.repository.dimensions,
                metricGroups = this.repository.metricGroups,
                reusableColumns = this.repository.reusableColumns,
                attributes = [];
            $.each(dimensions, function (index, dim) {
                for (var i = 0; i < dim.attributes.length; i++) {
                    attributes.push({
                        name: dim.attributes[i].name,
                        description: dim.attributes[i].desc,
                        type: "Attributes"
                    });
                }
            });

            $.each(metricGroups, function (index, mg) {
                for (var i = 0; i < mg.metrics.length; i++) {
                    attributes.push({
                        name: mg.metrics[i].name,
                        description: mg.metrics[i].desc,
                        type: "Metrics"
                    });
                }
            });

            for (var i = 0; i < reusableColumns.length; i++) {
                attributes.push({
                    name: reusableColumns[i].name,
                    description: reusableColumns[i].desc,
                    type: "Reusable Columns"
                });
            }

            this.$dataDictionaryTableBody.html(can.view("templates/data-dictionary-definition.ejs", {
                dataDictionary: attributes
            }));
            this.$dataDictionaryTable.dataTable({
                "columnDefs": [{
                    "visible": false,
                    "targets": 2
                }, {
                    'bSortable': false,
                    'aTargets': [0, 1]
                }],
                "scrollY": "300px",
                "paging": false,
                "order": [
                    [2, 'asc']
                ],
                "drawCallback": function (settings) {
                    var api = this.api();
                    var rows = api.rows({
                        page: 'current'
                    }).nodes();
                    var last = null;

                    api.column(2, {
                        page: 'current'
                    }).data().each(function (group, i) {
                        if (last !== group) {
                            $(rows).eq(i).before('<tr class="group"><td colspan="3">' + group + '</td></tr>');
                            last = group;
                        }
                    });
                }
            });

            this.dataDictionaryDataTableRendered = true;

        },

        getAppliedOn: function (appliedOnId) {
            var appliedOn = this.repository.dataFiltersDetail[appliedOnId];
            if (appliedOn.formName) {
                return appliedOn.attrName + ' -> ' + appliedOn.formName;
            }
            return appliedOn.attrName;
        },

        getDataFilterValues: function (values) {
            var value = '';
            for (var i = 0; i < values.length; i++) {
                if (value.length > 0) {
                    value += ', ';
                }
                value += values[i];
            }

            return value;
        },

        open: function () {
            this.dataDictionaryDataTableRendered = false;
            this.metadataDataTableRendered = false;
            this.repository = this.options.app.getDWRepository();
            this.element.find(".modal-title").html("Repository Information: " + this.repository.name);
            this.loadForm();
            this.openDialog();
        },

        handleCANCEL: function () {
            this.closeDialog("userClick");
        },

        "button.close click": function (el, ev) {
            ev.preventDefault();
            this.handleCANCEL();
        }
    });
});
