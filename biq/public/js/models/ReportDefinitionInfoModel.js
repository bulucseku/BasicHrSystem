/**
 * This class is a model that holds information about a single report. This includes
 * definition information (columns, filter, totals, sorting, etc) as well as metadata
 * information (name, creation date, creation user, last modified date, etc).
 *
 * @class ReportDefinitionInfo
 * @module Sentrana
 * @namespace Sentrana.Models
 * @extends jQuery.Model
 */
can.Model.extend("Sentrana.Models.ReportDefinitionInfo", {
    // Class Method: Create a new instance on the server...
    create: function RDI_create(attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Report"),
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(attrs),
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },

    // Class Method: Delete an existing instance...
    destroy: function RDI_destroy(id, success, error) {
        // Diagnostics (commented out for now. --gjb)
        // console.log("In Sentrana.Models.ReportDefinitionInfo.destroy");

        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Report/" + id),
            type: "DELETE",
            dataType: "json",
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },

    // Class Method: Retrieve all reports	
    findAll: function RDI_findAll(params, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Reports"),
            type: "GET",
            dataType: "json",
            data: params,
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    },

    // Class Method: Update a report
    update: function RDI_update(id, attrs, success, error) {
        return $.ajax({
            url: Sentrana.Controllers.BIQController.generateUrl("Report/" + id),
            type: "PUT",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(attrs),
            headers: {
                sessionID: Sentrana.Controllers.BIQController.sessionID,
                repositoryID: Sentrana.Controllers.BIQController.repositoryID
            },
            success: success,
            error: error
        });
    }
}, {
    // Constructor...
    init: function RDI_init(options) {
        if (options.json) {
            this.setup(options.json);
        }
        // Store a reference to the application controller...
        this.app = options.app;
    },

    // Instance Method: Format the display of the columns...
    formatColumns: function RDI_formatColums() {
        // If there is no template, get out now...
        if (!this.definition.template) {
            return "[None]";
        }

        // Get the DW Layout Repository...
        var dwLayout = this.app.getDWRepository(),
            parts = this.definition.template.split("|");

        var that = this;

        // Modify each part...
        parts = $.map(parts, function (part, i) {
            var object = dwLayout.getObjectByOID(part);
            if (object) {
                var attrHID = object && (object.type === 'ATTRIBUTE_FORM') ? object.attrHID : undefined,
                    attr = (attrHID) ? dwLayout.objectMap[attrHID] : undefined,
                    name = (attr) ? attr.name + "(" + object.name + ")" : object.name;

                return name;
            }
            return "";

        });

        return parts.join(", ");
    },

    initializeFilters: function (filterFunction) {
        var that = this;

        // Is there no filter?
        if (!this.definition.filter) {
            return;
        }

        var dwRepository = this.app.dwRepository;
        var parts = this.definition.filter.split("|");

        // Modify each part...
        $.map(parts, function (part, i) {
            var savedFilterGroup = dwRepository.isSavedFilterGroup(part);
            if (!savedFilterGroup) {
                var element = dwRepository.getObjectByOID(part, true);
                var attr = dwRepository.objectMap[element.attrHID];
                $.map(attr.forms, function (form, i) {
                    dwRepository.checkLoadedForm(form, false);
                    if (filterFunction) {
                        filterFunction(form);
                    }
                });
            } 
        });
    },
    
    // Instance Method: Format the display of the filter...
    formatFilter: function RDI_formatFilter(textOnly) {
        var that = this;
        // Is there no filter?
        if (!this.definition.filter) {
            return "[None]";
        }

        // Get the DW Layout Repository...
        var dwLayout = this.app.getDWRepository(),
            parts = this.definition.filter.split("|");

        // Modify each part...
        parts = $.map(parts, function (part, i) {
            var savedFilterGroup = that.app.dwRepository.isSavedFilterGroup(part);
            if (savedFilterGroup) {
                  return savedFilterGroup.name + " [GroupedFilter]";
            }
            var moreParts = that.getFilterElement(part).split(":");
            var attrHID = dwLayout.getObjectByOID(moreParts[0]).attrHID,
                attr = dwLayout.objectMap[attrHID],
                attrPrefix = (textOnly) ? "" : '<span class="attr">',
                attrSuffix = (textOnly) ? "" : '</span>';

            var filterApplied = that.isFilteredByDataFilter(moreParts[0], moreParts[1]);
            if (filterApplied) {
                return '<span class="user-filter-applied">' + moreParts[1] + " " + attrPrefix + "[" + attr.name + "]" + attrSuffix + '</span>';
            }

            return moreParts[1] + " " + attrPrefix + "[" + attr.name + "]" + attrSuffix;
        });

        return parts.join(", ");
    },

    isFilteredByDataFilter: function (attr, filterItem) {
        var filters = $.grep(this.app.dwRepository.datafilters, function (filter) {
            return filter.id === attr;
        });

        if (filters.length === 0) {
            return false;
        }

        var value = $.grep(filters[0].values, function (item) {
            return item.toString().toUpperCase() === filterItem.toString().toUpperCase();
        });

        switch (filters[0].operator.toUpperCase()) {
        case "IN":
            return value.length === 0;
            break;
        case "NOT IN":
            return value.length > 0;
            break;
        default:
            break;
        }

        return false;

    },

    getFilterElement: function RDI_getFilterElement(part) {
        if (part.indexOf(")")) {
            // This is a tree filter. We need to get rid of the prefix part.
            part = part.substr(part.indexOf(")") + 1);
        }
        return part;
    },

    // Instance Method: Format the display of the "Last Modified" field...
    formatModified: function RDI_formatModified() {
        return Sentrana.formatDate(new Date(this.lastModDate)) + " (" + this.lastModUser + ")";
    },

    // Instance Method: Indicate whether we are viewing this report...
    isViewing: function RDI_isViewing(view) {
        this.attr("viewing", view);
    },

    // Instance Method: Get the comment stream model associated with this report...
    getCommentStream: function RDI_getCommentStream() {
        // Do we already have a comment stream instance?
        if (this.commentStreamModel) {
            return this.commentStreamModel;
        }

        // Create a new one...
        this.commentStreamModel = new Sentrana.Models.CommentStream(this.id, this.comments);

        return this.commentStreamModel;
    },

    // Instance Method: Reload the comment stream for the report from the server...
    reloadCommentStream: function RDI_reloadCommentStream() {
        // Ask the CommentStream model to update itself with data from the server...
        this.getCommentStream().reloadFromServer();
    },

    // Instance Method: Internal Diagnostic method to aid in tracing lost destroyed handlers --gjb
    dumpDestroyedHandlers: function (where) {
        // console.log(where + ": dumpDestroyedHandlers for id='"+this.id+"': length=" + (($.data(this, "events") || {})["destroyed"] || []).length);
    }
});
