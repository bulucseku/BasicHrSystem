/**
 * @class ViewList
 * @module Sentrana
 * @namespace Sentrana.Models
 * @extends jQuery.Observe
 * @description This class is a model which is common to Sentrana.Models.ReportDefinitionInfoList and
 * Sentrana.Models.Booklets
 */

can.Observe.extend("Sentrana.Models.ViewList", {
    getGroupName: function RDIL_getGroupName(groupType, fieldValue) {

        switch (groupType) {
        case "DATE":
            var date = new Date(fieldValue);

            if (Sentrana.wasMomentsAgo(date)) {
                return "Moments Ago";
            }

            if (Sentrana.isToday(date)) {
                return "Today";
            }

            if (Sentrana.isYesterday(date)) {
                return "Yesterday";
            }

            if (Sentrana.isThisWeek(date)) {
                return "This Week";
            }

            if (Sentrana.isLastWeek(date)) {
                return "Last Week";
            }

            return Sentrana.formatMonth(date);
            //            case "NAME":
            //                return "All Booklets";
        default:
            return groupType;
        }
    },

    defaults: {
        "field": "lastModDate",
        "asc": true,
        "count": -1,
        "loadErrorMessage": ""
    }
}, {
    init: function (attrs, app) {
        this.setup($.extend({}, this.constructor.defaults, attrs));
        this.app = app;

    }
});
