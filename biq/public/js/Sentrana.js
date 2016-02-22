// Define our base package/namespace
var Sentrana = {};
Sentrana.Controllers = {};
Sentrana.Models = {};

Sentrana.Enums = {};
Sentrana.Enums.FILTER_TYPE_RANGE = "RANGE";
Sentrana.Enums.FILTER_TYPE_COLUMN = "COLUMN";

Sentrana.Enums.CLASS_SELECTED = "selected";
Sentrana.Enums.ATTR_LEVEL_ONE_BUTTON = "l1btn";
Sentrana.Enums.ATTR_LEVEL_TWO_BUTTON = "l2btn";

Sentrana.Enums.ColumnType = {};
Sentrana.Enums.ColumnType.ATTRIBUTE = 0;
Sentrana.Enums.ColumnType.METRIC = 1;

Sentrana.Enums.ENABLE_METRIC_ATTRIBUTE_MAPPING_TOGGLE = true;

Sentrana.Enums.PIVOT_EXPORT_URL = "ExportPivotTable";

Sentrana.Enums.ErrorCode = {
    WRONG_PASSWORD: "WRONG_PASSWORD",
    PREVIOUSLY_USED_PASSWORD: "PREVIOUSLY_USED_PASSWORD",
    PASSWORD_CANNOT_BE_EMPTY: "PASSWORD_CANNOT_BE_EMPTY",
    PASSWORD_FORMAT_IS_INVALID: "PASSWORD_FORMAT_IS_INVALID",
    PASSWORD_POLICY_VIOLATED: "PASSWORD_POLICY_VIOLATED",
    REPOSITORY_RETRIEVE_FAILED: "REPOSITORY_RETRIEVE_FAILED",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
    REPORT_NAME_IN_USE: "REPORT_NAME_IN_USE",
    BOOKLET_NAME_IN_USE: "BOOKLET_NAME_IN_USE",
    DERIVED_COLUMN_NAME_IN_USE: "DERIVED_COLUMN_NAME_IN_USE",
    INCORRECT_EMAIL: "INCORRECT_EMAIL",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    INVALID_SESSION: "INVALID_SESSION",
    PASSWORD_EXPIRED: "PASSWORD_EXPIRED",
    NO_DATA_RETURNED: "NO_DATA_RETURNED",
    SAVED_FILTER_GROUP_NAME_IN_USE: "Filter group name already in use",
    NO_SAVED_FILTER_GROUP_FOUND: "Filter group not found",
    KEY_NOT_FOUND: "KEY_NOT_FOUND",
    ELEMENT_NOT_FOUND: "ELEMENT_NOT_FOUND",
    UNABLE_TO_DRILL_DOWN: "UNABLE_TO_DRILL_DOWN",
    SERVICE_ERROR_OCCURRED: "SERVICE_ERROR_OCCURRED"
};

Sentrana.Enums.ApplicationRoles = {
    BIQ_USER: "BIQ_USER",
    BIQ_ADMIN: "BIQ_ADMIN"
};

Sentrana.ActionLog = {
    ActionNames: {
        //save
        SaveReport: 'Save Report',
        //view
        ViewReport: 'View Report',
        ViewBooklet: 'View Booklet',
        ViewBookletReport: 'View Booklet Report',
        //download
        DownloadTable: 'Download Table',
        //export
        ExportChart: 'Export Chart',
        ExportGrid: 'Export Grid',
        //print
        PrintGrid: 'Print Grid',
        PrintChart: 'Print Chart',
        PrintReport: 'Print Report',
        //add comment
        AddComment: 'Add Comment',
        //repository
        RepositoriesAccessed: 'Repositories Accessed',
        HelpAccesss: 'Help Documentation Access',
        ViewRepositoryInformation: 'View Repository Information'

    },
    Contexts: {
        BuilderPage: 'Builder Page',
        SavedReport: 'Saved Report',
        SavedBookLet: 'Saved Booklet',
        SharedReport: 'Shared Report',
        SharedBooklet: 'Shared Booklet',
        RepositoryInformation: 'Repository Information',
        RepositorySelection: 'Repository Selection page',
        ReportOption: 'Report Option',
        UserOptions: 'User Options'
    },
    ElementTypes: {
        Report: 'Report',
        Booklet: 'Booklet',
        Chart: 'Chart',
        Grid: 'Grid',
        Repository: 'Repository',
        Link: 'Link',
        Dialog: 'Dialog',
        HelpPage: 'Help Page'
    }
};

Sentrana.RegEx = {};
/*
Metrics will be Enclosed by [] and Reusable columns will be f(<columnid>)
So to find a valid metrics we have check one of the above format
*/
Sentrana.RegEx.RE_METRIC_IN_FORMULA = /\[[^\[\]]+\]|f\(\d+\)/gim;
//Check Valid formula
Sentrana.RegEx.RE_VALID_FORMULA = /^(([+\-]*((\d+\.\d+|\d+|\.\d+)|(\[[^\[\]\|]+\])))([+\-\/\*]((\d+\.\d+|\d+|\.\d+)|(\[[^\[\]\|]+\]))){1,})*$/;
Sentrana.RegEx.RE_MATCH_VALID_ENTRY = /\[.*?\]|[^\[\]\s]/g;

// System level class support

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// C l a s s   M e t h o d s . . .
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// Define an "extends" method can be used for basic inheritance support...
Sentrana.$extends = function Sentrana_classExtends(ctorFn, baseClass) {
    ctorFn.prototype = new baseClass();
    ctorFn.prototype.constructor = ctorFn;
};

// Static Method: Convert a number to a percentage, currency value, etc.
Sentrana.formatValue = function Sentrana_formatValue(rawValue, format) {
    // Check for undefined value...
    if (rawValue === undefined || rawValue === "") {
        return "";
    }

    // Default value
    format = format || "text";

    // Determine what formatting to do...
    var twoFracDigits = format == "currency" || format == "percentage",
        noFracDigits = format == "dollars",
        thouCommas = format == "currency" || format == "number" || format == "dollars",
        leadingDollar = format == "currency" || format == "dollars",
        leadingPct = format == "percentage";

    // Ensure we have the correct number of trailing digits...
    var val;
    if (twoFracDigits) {
        val = Number(rawValue).toFixed(2);
    }
    else if (noFracDigits) {
        val = Number(rawValue).toFixed(0);
    }
    else {
        val = String(rawValue);
    }

    // Insert commas for thousand separators?
    if (thouCommas) {
        var sRegExp = /(-?\d+)(\d{3})/;
        while (sRegExp.test(val)) {
            val = val.replace(sRegExp, '$1' + ',' + '$2');
        }
    }

    // Leading dollar sign?
    if (leadingDollar) {
        val = "$" + val;
    }

    // Leading percentage sign?
    if (leadingPct) {
        val = "%" + val;
    }

    return val;
};

// Anonymous function block for scoping...
(function () {
    // Define our month and day names...
    var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Define a method to format the time portion of a Date object...
    Sentrana.formatTime = function (date) {
        var milhours = date.getHours(),
            ampm = (milhours > 11) ? "pm" : "am",
            hours = (ampm === "am") ? ((milhours === 0) ? "12" : milhours) : ((milhours === 12) ? milhours : milhours - 12),
            minutes = date.getMinutes(),
            mins = (minutes === 0) ? "00" : ((minutes < 10) ? "0" + minutes : minutes);

        return hours + ":" + mins + ampm;
    };

    // fill a value with a character. direction will be 'left' or 'right'
    Sentrana.fillValue = function (fillValue, actualValue, length, direction) {
        //make sure to convert to string
        var result = actualValue.toString();
        var pad = length - result.length;

        while (pad > 0) {
            if (direction.toString().toLowerCase() === 'left') {
                result = fillValue + result;
            }
            else {
                result = result + fillValue;
            }

            pad--;
        }

        return result;
    };

    // Convert a date value (json date value also) to specific format
    Sentrana.formatDateValue = function (srcDate, format) {

        if (srcDate === undefined || srcDate === '') {
            return '';
        }

        format = format || 'dd-mm-yyyy';

        // month names array
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // day names array
        var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        var dateValue;

        try {
            //if srcDate is a json date
            if (srcDate.toString().indexOf('/Date(') != -1) {
                dateValue = new Date(parseInt(srcDate.replace('/Date(', '').replace(')/', ''), 10));
            }
            else {
                dateValue = srcDate;
            }

            //format the date value
            return format.replace(/(yyyy|yy|MMMM|MMM|MM|M|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|tt|t)/gi,
                function ($1) {
                    switch ($1) {
                    case 'yyyy':
                        return dateValue.getFullYear();
                    case 'yy':
                        return dateValue.getFullYear().toString().substr(2);
                    case 'MMMM':
                        return monthNames[dateValue.getMonth()];
                    case 'MMM':
                        return monthNames[dateValue.getMonth()].substr(0, 3);
                    case 'MM':
                        return Sentrana.fillValue('0', (dateValue.getMonth() + 1), 2, 'left');
                    case 'M':
                        return dateValue.getMonth();
                    case 'dddd':
                        return dayNames[dateValue.getDay()];
                    case 'ddd':
                        return dayNames[dateValue.getDay()].substr(0, 3);
                    case 'dd':
                        return Sentrana.fillValue('0', dateValue.getDate(), 2, 'left');
                    case 'd':
                        return dateValue.getDate();
                    case 'HH':
                        return Sentrana.fillValue('0', dateValue.getHours(), 2, 'left');
                    case 'H':
                        return dateValue.getHours();
                    case 'hh':
                        var hh;
                        return Sentrana.fillValue('0', ((hh = dateValue.getHours() % 12) ? hh : 12), 2, 'left');
                    case 'h':
                        var h;
                        return ((h = dateValue.getHours() % 12) ? h : 12);
                    case 'mm':
                        return Sentrana.fillValue('0', dateValue.getMinutes(), 2, 'left');
                    case 'm':
                        return dateValue.getMinutes();
                    case 'ss':
                        return Sentrana.fillValue('0', dateValue.getSeconds(), 2, 'left');
                    case 's':
                        return dateValue.getSeconds();
                    case 'tt':
                        return dateValue.getHours() < 12 ? 'AM' : 'PM';
                    case 't':
                        return dateValue.getHours() < 12 ? 'A' : 'P';
                    default:
                        return '';
                    }
                });

        }
        catch (e) {
            return '';
        }
    };

    // Define a method to format the date and time portion of a Date object...
    Sentrana.formatDate = function (date) {
        return DAY_NAMES[date.getDay()] + ", " + MONTH_NAMES[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " at " + Sentrana.formatTime(date);
    };

    // TODO Need to borow/merge the date formatting functions in CatMan!
    Sentrana.formatMonth = function (date) {
        return MONTH_NAMES[date.getMonth()] + " " + date.getFullYear();
    };

    // TODO Merge Already!
    Sentrana.formatCommentDate = function (date) {
        return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    };

    Sentrana.formatCommentTime = function (date) {
        return Sentrana.formatTime(date);
    };

    $.fn.getCursorPosition = function () {
        var el = $(this).get(0);
        var pos = 0;
        if ('selectionStart' in el) {
            pos = el.selectionStart;
        }
        else if ('selection' in document) {
            var normalizedValue, range, textInputRange, len, endRange;

            el.focus();
            range = document.selection.createRange();

            if (range && range.parentElement() === el) {
                len = el.value.length;
                normalizedValue = el.value.replace(/\r\n/g, '');

                // Create a working TextRange that lives only in the input
                textInputRange = el.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());

                // Check if the start and end of the selection are at the very end
                // of the input, since moveStart/moveEnd doesn't return what we want
                // in those cases
                endRange = el.createTextRange();
                endRange.collapse(false);

                if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                    pos = el.value.replace(/\r\n/g, '\n').length;
                }
                else {
                    pos = -textInputRange.moveStart("character", -len);
                    pos += normalizedValue.slice(0, pos).split("\n").length - 1;
                }
            }
        }
        return pos;
    };

    $.fn.setCursorPosition = function (pos) {
        this.each(function (index, elem) {
            if (elem.setSelectionRange) {
                elem.setSelectionRange(pos, pos);
            }
            else if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        });
        return this;
    };

    Sentrana.getChartTypeClass = function (chartType) {
        switch (chartType) {
        case 'line':
            return 'linechart';
        case 'pie':
            return 'piechart';
        case 'bar':
            return 'barchart';
        case 'column':
            return 'columnchart';
        case 'scatter':
            return 'scatterchart';
        case 'stacked bar':
            return 'stackedbarchart';
        case 'stacked column':
            return 'stackedcolumnchart';
        default:
            return 'emptychart';
        }
    };

})();

$.fn.toggleSrc = function (onSuffix, offSuffix) {
    return this.attr("src", function (i, src) {
        return src.indexOf(onSuffix) != -1 ? src.replace(onSuffix, offSuffix) : src.replace(offSuffix, onSuffix);
    });
};

// Static Method: Confirmmation Dialog with callbacks
Sentrana.ConfirmDialog = function ConfirmDialog(title, dialogText, callBack4Ok, callBack4Cancel, closeOnEscape, removeCloseMark) {
    $('body').find('#sentrana-common-confirm-dialog').remove();
    var htm = "<div id='sentrana-common-confirm-dialog'></div>";
    $('body').append(htm);

    $('#sentrana-common-confirm-dialog').sentrana_confirm_dialog({
        title: title,
        message: dialogText,
        onOk: callBack4Ok,
        onCancel: function () {
            if (callBack4Cancel && typeof callBack4Cancel === 'function') {
                callBack4Cancel();
                $('body').find('#sentrana-common-confirm-dialog').remove();
            }
        },
        closeOnEscape: closeOnEscape !== undefined ? closeOnEscape : true
    });
};

// Static Method: Confirmmation Dialog with callbacks and Yes No Cancel Button.
Sentrana.ConfirmDialogYNC = function ConfirmDialogYNC(title, dialogText, callBack4Y, callBack4N, callBack4C, closeOnEscape, removeCloseMark) {
    var htm = "<div id='sentrana-common-confirm-dialog'></div>";
    $('body').append(htm);

    $('#sentrana-common-confirm-dialog').sentrana_confirm_yes_no_cancel_dialog({
        title: title,
        message: dialogText,
        closeOnEscape: closeOnEscape !== undefined ? closeOnEscape : true,
        onYes: callBack4Y,
        onCancel: function () {
            if (callBack4C && typeof callBack4C === 'function') {
                callBack4C();
            }
            $('body').find('#sentrana-common-confirm-dialog').remove();
        },
        onNo: callBack4N
    });
};

// Static Method: Alert Dialog
Sentrana.AlertDialog = function AlertDialog(title, dialogText, callBack4Ok, closeOnEscape, removeCloseMark, parent) {
    var id = 'sentrana-common-alert-dialog',
        idSelector = '#' + id,
        htm = '<div id="' + id + '"></div>';

    $('body').find(idSelector).remove();
    $('body').append(htm);
    $(idSelector).sentrana_alert_dialog({
        title: title,
        message: dialogText,
        onOk: function () {
            if (callBack4Ok && typeof callBack4Ok === 'function') {
                if (parent) {
                    callBack4Ok.call(parent);
                }
                else {
                    callBack4Ok();
                }
            }
        },
        closeOnEscape: closeOnEscape
    });
};

//https://github.com/maca/jquery-watermark-hints/blob/master/jquery.watermark.hints.js

jQuery.fn.hint = function (text, color) {
    if (!color) {
        color = "#aaa";
    }

    return this.each(
        function () {
            var input = jQuery(this);
            var defaultColor = input.css("color");

            var checkInput = function () {
                if (input.val() === '' || input.virgin) {
                    input.val(text).css("color", color).virgin = true;
                }
                else {
                    input.css("color", defaultColor).virgin = false;
                }
            };

            var clearMessage = function () {
                if (input.virgin) {
                    input.val('').css("color", defaultColor).virgin = false;
                }
            };

            input.bind('blur change', checkInput);
            input.bind('click focus', clearMessage);
            checkInput();

            input.closest('form').bind('submit', clearMessage);
        }
    );
};

Sentrana.isSameDay = function (date1, date2) {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
};

Sentrana.wasMomentsAgo = function (date) {
    return date.valueOf() > new Date().valueOf() - 60 * 60 * 1000;
};

Sentrana.isToday = function (date) {
    return this.isSameDay(date, new Date());
};

Sentrana.isYesterday = function (date) {
    var now = new Date().valueOf();

    return this.isSameDay(date, new Date(now - 24 * 60 * 60 * 1000));
};

Sentrana.getFirstDayOfWeek = function (date, weeksAgo) {
    var dayDiff = date.getDay() + weeksAgo * 7,
        sundayDate = new Date(date.valueOf() - dayDiff * 24 * 60 * 60 * 1000);

    sundayDate.setHours(0, 0, 0, 0);

    return sundayDate;
};

Sentrana.isThisWeek = function (date) {
    return this.isSameDay(this.getFirstDayOfWeek(date, 0), this.getFirstDayOfWeek(new Date(), 0));
};

Sentrana.isLastWeek = function (date) {
    return this.isSameDay(this.getFirstDayOfWeek(date, 0), this.getFirstDayOfWeek(new Date(), 1));
};

Sentrana.removeWhiteSpace = function removeWhiteSpace(text) {
    var matchedValues = text.match(Sentrana.RegEx.RE_MATCH_VALID_ENTRY);
    if (matchedValues) {
        return matchedValues.join('');
    }

    return '';
};

Sentrana.isObject = function isObject(obj) {
    return typeof obj === 'object' && obj !== null && obj;
};

Sentrana.getDateDiff = function (date1, date2, interval) {
    var second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;
    date1 = new Date(date1).getTime();
    date2 = (date2 == 'now') ? new Date().getTime() : new Date(date2).getTime();
    var timediff = date2 - date1;
    if (isNaN(timediff)) {
        return NaN;
    }
    switch (interval) {
    case "years":
        return date2.getFullYear() - date1.getFullYear();
    case "months":
        return ((date2.getFullYear() * 12 + date2.getMonth()) - (date1.getFullYear() * 12 + date1.getMonth()));
    case "weeks":
        return Math.floor(timediff / week);
    case "days":
        return Math.floor(timediff / day);
    case "hours":
        return Math.floor(timediff / hour);
    case "minutes":
        return Math.floor(timediff / minute);
    case "seconds":
        return Math.floor(timediff / second);
    default:
        return undefined;
    }
};

// Static Method: Gets the message text for a message key with or without dynamic values.
Sentrana.getMessageText = function (str, params) {
    if (params) {
        params = typeof params === 'object' ? params : Array.prototype.slice.call(arguments, 1);

        return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
            if (m == "{{") {
                return "{";
            }
            if (m == "}}") {
                return "}";
            }
            return params[n];
        });
    }
    else {
        return str;
    }
};

Sentrana.getMaxViewDialogDimension = function Sentrana_getMaxViewDialogDimension() {
    var dimension;
    var dialogWidth = $(window).width() - 10,
        dialogHeight = $(window).height() - 10;
    dimension = {
        width: dialogWidth,
        height: dialogHeight
    };
    return dimension;
};

Sentrana.EnableWindowScroll = function () {
    $('body').removeClass('disable-window-scroll');
};

Sentrana.DisableWindowScroll = function () {
    $('body').addClass('disable-window-scroll');
};

Sentrana.mergeSecondArrayWithFirstArrayByProperty = function (firstArray, secondArray, keyPropertyName) {
    var mergedArray = $.merge([], firstArray);
    $.each(secondArray, function (index, obj) {
        var arr1obj = $.grep(mergedArray, function (arr1obj) {
            return arr1obj[keyPropertyName] == obj[keyPropertyName];
        });

        //If the object already exist extend it with the new values from secondArray, otherwise just add the new object to firstArray
        arr1obj && arr1obj.length > 0 ? $.extend(true, arr1obj[0], obj) : mergedArray.push(obj);
    });

    return mergedArray;
};

// Set the defaults for DataTables initialization - works with the pixel-admin template styles, overrides the settings in dataTables.bootstrap.js
$.extend(true, $.fn.dataTable.defaults, {
    "sDom": "<'table-header clearfix'<'table-caption'><'DT-lf-right'<'DT-per-page'l><'DT-search'f><'buttonBar grid-button-bar'>>r>" +
        "t" +
        "<'table-footer clearfix'<'DT-label'i><'DT-pagination'p>>",
    "oLanguage": {
        "sLengthMenu": "Per page: _MENU_",
        "sSearch": ""
    }
});

Sentrana.VisualizatoinElements = [
    {
        groupName: 'Report',
        types: [
            { type: "line", iconImage: "db_comp_icon_basic_line.png", cls: "", title: "Line" },
            { type: "pie", iconImage: "db_comp_icon_pie.png", cls: "", title: "Pie" },
            { type: "column", iconImage: "db_comp_icon_basic_column.png", cls: "", title: "Column" },
            { type: "bar", iconImage: "db_comp_icon_basic_bar.png", cls: "", title: "Bar" },
            { type: "text", iconImage: "db_comp_icon_text_report.png", cls: "", title: "Text" },
            { type: "stacked column", iconImage: "db_comp_icon_stacked.png", cls: "", title: "Stacked Column" },
            { type: "stacked bar", iconImage: "db_comp_icon_stacked_bar.png", cls: "", title: "Stacked Bar" },
            { type: "scatter", iconImage: "db_comp_icon_scatter_plot.png", cls: "", title: "Scatter" },
            { type: "bubble", iconImage: "db_comp_icon_bubble.png", cls: "", title: "Bubble" },
            { type: "histogram", iconImage: "db_comp_icon_basic_histogram.png", cls: "", title: "Histogram" },
            //{ type: "column-range", iconImage: "db_comp_icon_column_range.png", cls: "", title: "Column Range" },
            //{ type: "map", iconImage: "db_comp_icon_map.png", cls: "", title: "Map" },
            //{ type: "scatter-plot", iconImage: "db_comp_icon_scatter_plot.png", cls: "", title: "Scatter Plot" },
            //{ type: "stacked-area", iconImage: "db_comp_icon_stacked_area.png", cls: "", title: "Stacked Area" },
            { type: "data-table", iconImage: "db_comp_icon_data_table.png", cls: "", title: "DataTable" },
            //{ type: "spider-web", iconImage: "db_comp_icon_spider_web.png", cls: "", title: "Spider Web" },
            //{ type: "basic-area", iconImage: "db_comp_icon_basic_area.png", cls: "", title: "Basic Area" },
            //{ type: "donut", iconImage: "db_comp_icon_donut.png", cls: "", title: "Donut" },
            //{ type: "polar", iconImage: "db_comp_icon_polar.png", cls: "", title: "Polar" },
            //{ type: "spline", iconImage: "db_comp_icon_spline.png", cls: "", title: "Spline" },
            //{ type: "column-negative", iconImage: "db_comp_icon_column_negative.png", cls: "", title: "Column Negative" },
            //{ type: "dual-axes", iconImage: "db_comp_icon_dual_axes.png", cls: "", title: "Dual Axes" },
            //{ type: "pyramid", iconImage: "db_comp_icon_pyramid.png", cls: "", title: "Pyramid" },
            //{ type: "stacked", iconImage: "db_comp_icon_stacked.png", cls: "", title: "Stacked" }
        ]
    },
    {
        groupName: 'PureText',
        types:[
            { type: "input-text", iconImage: "db_comp_icon_text_placeholder.png", cls: "", title: "Input Text" }
        ]
    },
    {
        groupName: 'Image',
        types:[
            { type: "image", iconImage: "db_comp_icon_image_placeholder.png", cls: "", title: "Image" }
        ]
    }
];

Sentrana.isVisualizationOfSameGroup = function (oldType, newType) {
 return Sentrana.getVisualizationGroupName(oldType) === Sentrana.getVisualizationGroupName(newType);
};

Sentrana.getVisualizationGroupName = function(elementType) {
    var visualizationGroupName;
    $.each(Sentrana.VisualizatoinElements, function (index, visualizationElement) {

        var groupItems = $.grep(visualizationElement.types, function (visualElement, index) {
            return visualElement.type === elementType;
        });

        if (groupItems.length === 1) {
            visualizationGroupName = visualizationElement.groupName;
            //stop the loop
            return false;
        }
    });

    return visualizationGroupName;
};
