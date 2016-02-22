/**
 * @class ReportDefinitionInfoList
 * @module Sentrana
 * @namespace Sentrana.Models
 * @extends jQuery.Observe
 * @description This class is a model which manages the list of report definition info objects as well
 * as record how the list is sorted.
 */
steal("js/observes/ViewListObserve.js", function () {
    Sentrana.Models.ViewList("Sentrana.Models.ReportDefinitionInfoList", {

    }, {
        // Constructor...
        init: function RDIL_init(attrs, app) {
            this.setup(attrs);
            this.app = app;

        },

        getSavedReports: function () {
            var that = this,
                count = that.count * 1;
            $.when(Sentrana.Models.ReportDefinitionInfo.findAll()).done(function (data) {
                // Create an array of ReportDefinitionInfo instances...
                that.savedReports = $.map(data, function (rdi, index) {
                    var report = new Sentrana.Models.ReportDefinitionInfo({
                        json: rdi.attr(),
                        app: that.app
                    });
                    return report;
                });

                if (data.length === count) {
                    that.attr("ignoreChange", true);
                    that.attr("count", count + 1);
                    that.attr("ignoreChange", false);
                }
                // Set the count of elements...
                that.attr("count", data.length);

            }).fail(function (jqXHR, textStatus, errorThrown) {
                // Indicate a negative count (to indicate error)...
                that.attr("loadErrorMessage", errorThrown);
                that.attr("count", -2);
            });
        },

        // Instance Method: Return the list of ReportDefinitionInfo objects...
        getList: function RDIL_getList() {
            // Sort the array...
            var that = this;

            var groupName = '';

            //findout field wise group name
            switch (that.field) {
            case 'lastModDate':
            case 'createDate':
                groupName = 'DATE';
                that.asc = false;
                break;
            case 'name':
                groupName = 'All Reports';
                that.asc = true;
                break;
            default:
                break;
            }

            this.savedReports.sort(function (a, b) {
                if (that.asc) {
                    if (a[that.field] < b[that.field]) {
                        return -1;
                    }
                    if (a[that.field] > b[that.field]) {
                        return 1;
                    }
                    return 0;
                }
                else {
                    if (b[that.field] < a[that.field]) {
                        return -1;
                    }
                    if (b[that.field] > a[that.field]) {
                        return 1;
                    }
                    return 0;
                }
            });

            // Add a group name to each one...
            $.each(this.savedReports, function (index, rdi) {
                // Compute a group that this report belongs to...
                rdi.groupName = that.constructor.getGroupName(groupName, rdi[that.field]);
            });

            return this.savedReports;
        },

        // Instance Method: Return a textual name for the sort order...
        getSortOrderName: function RDIL_getSortOrderName() {
            return (this.asc) ? "ascending" : "descending";
        },

        // Instance Method: Return a textual name for the sort field...
        getSortFieldName: function RDIL_getSortOrderField() {
            // Switch on the field...
            switch (this.field) {
            case "lastModDate":
                return "last modification date";
            case "createDate":
                return "creation date";
            case "name":
                return "report name";
            default:
                return "Unknown";
                break;
            }

            return undefined;
        },

        // Instance Method: Return a textual name for the sort field...
        getSortFieldNames: function RDIL_getSortOrderFields() {
            var sortFields = [{
                key: "lastModDate",
                value: "MOD. DATE"
            }, {
                key: "createDate",
                value: "CREATION DATE"
            }, {
                key: "name",
                value: "ABC"
            }];
            return sortFields;
        },

        // Instance Method: Toggle the sort order...
        toggleSortOrder: function RDIL_toggleSortOrder() {
            this.attr("asc", !this.asc);
        },

        // Instance Method: Toggle the sort field...
        changeSortField: function RDIL_changeSortField(field) {
            this.attr("field", field);
        },

        // Instance Method: Add a new report to the list...
        addReport: function RDIL_addReport(rdi) {
            if (!this.savedReports) {
                return;
            }
            // Add the report to the list...
            this.savedReports.push(rdi);

            // Indicate that the count has changed...
            this.attr("count", this.savedReports.length);
        },

        // Instance Method: Remove a report from the list...
        removeReport: function RDIL_removeReport(id) {
            // Loop through our list of objects...
            var that = this;
            $.each(this.savedReports, function (i, r) {
                // Did we find the right report?
                if (r.id === id) {
                    // Remove it from our array...
                    that.savedReports.splice(i, 1);

                    // Update our count...
                    that.attr("count", that.savedReports.length);

                    return false;
                }
            });
        }
    });
});
