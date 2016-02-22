;/*
* File:        jquery.audithistory.js
* Version:     1.0.0
* Description: View audit history using filters
* Author:      Muhammad Shafiqul Islam
* Created:     19-Nov-2012
* Language:    JavaScript
* License:     GPL v2 or BSD 3 point style
* Contact:     netrana@yahoo.com
* 
* Copyright 2011-2012 Muhammad Shafiqul Islam, all rights reserved.
*
* This source file is free software, under either the GPL v2 license or a
* BSD style license, as supplied with this software.
* 
* This source file is distributed in the hope that it will be useful, but 
* WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
* or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
* 
* To use this plugin you have to use two other jQuery plugins described as below
*
* DataTables:
* =-=-=-=-=-=
* DataTables has been used to show the search result in a tabular form. Use following *.js and *.css references in your page.
* js/jquery.dataTables.js
* js/datatables/css/demo_page.css
* js/datatables/css/demo_table_jui.css
* js/datatables/css/demo_table.css
* For details visit http://www.datatables.net/
*
* jQuery UI Library 
* =-=-=-=-=-=
* Datepicker Widget has been used to take date type input. Use following *.js and *.css references in your page.
* js/jquery-ui-1.9.1.custom.js
* development-bundle/themes/base/jquery-ui.css
*
* For details visit http://jqueryui.com/
*/

(function ($) {
    /* Add to jQuery prototype */
    $.fn.audithistory = function(options) {

        /* Define default settings */
        var defaults = {
            configurationData: undefined,
            userData: undefined,
            columns: undefined,
            searchUrl: undefined,
            additionalHeaderParameters: undefined,
            urlParameterMappings: undefined,
            callBackFunction : undefined
        };
        
        /* Merge default settings with options */
        var settings = $.extend({ }, defaults, options);

        this.each(function() {
            var $this = $(this);

            /* This is the HTML markup definition */
            var markup = $('<div><div class="audit-history-plugin"><table class="audit-history-plugin-table"><tr><td>Module</td><td><select class="audit-history-criteria-selector" id="audit-history-module"></select></td><td>Sub Module</td><td><select class="audit-history-criteria-selector" id="audit-history-submodule"></select></td><td>User</td><td><select class="audit-history-criteria-selector" id="audit-history-user"></select></td><td>Start Date</td><td><input id="txt-audit-start-date" class="audit-history-date-selector" readonly="readonly" type="text"/></td><td><div id="img-audit-start-date-clear" title="Clear Start Date" class="audit-date-range"></div></td><td>End Date</td><td><input id="txt-audit-end-date" class="audit-history-date-selector" readonly="readonly" type="text"/></td><td><div id="img-audit-end-date-clear" title="Clear End Date" class="audit-date-range"></div></td><td style="text-align: right;"><input type="button" id="btn-search-audit-data" class="audit-history-button" value="SEARCH"></input></td></tr><tr><td colspan="13"><table class="display" id="audit-history-tbl"></table></td></tr></table></div></div>');

            /* Clear the container and then add the markup */
            $this.empty();
            $this.append(markup);

            addCalendarEventHandlers();
            addDropDownEventHandlers(settings);
            addSearchButtonEventHandler(settings);
            showConfigurationData(settings);
            addDataTable(settings);
            addCss();

            /* If the callback function is not empty then call it*/
            if (settings.callBackFunction && typeof settings.callBackFunction === 'function') {
                settings.callBackFunction();
            }
        });

        /* Instance method to remove the plug-in */
        this.destroy = function () {

            return this.each(function () {
                var $this = $(this);
                $this.find('.audit-history-plugin').remove();
            });

        };

        //returns the jQuery object to allow for chainability
        return this;
    };

    /****************************************************************************************
    *
    * Private methods are defined below. 
    * Private methods cannot be accessed from outside.    
    *
    *****************************************************************************************/

    /*
    * Add Module, Sub Module and User dropdown event handler
    */
    function addDropDownEventHandlers(appSettings) {
        $('#audit-history-module').live('change', function () {
            showSubModuleNames(appSettings);
        });
    }

    /*
    * Add Search button event handler
    */
    function addSearchButtonEventHandler(appSettings) {
        $('#btn-search-audit-data').live('click', function () {
            getAuditHistory(appSettings);
        });
    }

    /*
    * Add calendar event handlers
    */
    function addCalendarEventHandlers() {
        /*add start date field event handler*/
        $('#txt-audit-start-date').not('.hasDatePicker').datepicker({
            dateFormat: 'dd M yy',
            changeMonth: true,
            changeYear: true,
            onSelect: function (dateText) {
                return dateText;
            }
        });

        /*add end date field event handler*/
        $('#txt-audit-end-date').not('.hasDatePicker').datepicker({
            dateFormat: 'dd M yy',
            changeMonth: true,
            changeYear: true,
            onSelect: function (dateText) {
                return dateText;
            }
        });

        /*add event handler for image to clear start date value*/
        $("#img-audit-start-date-clear").live("click", function () {
            $("#txt-audit-start-date").val('');
        });

        /*add event handler for image to clear end date value*/
        $("#img-audit-end-date-clear").live("click", function () {
            $("#txt-audit-end-date").val('');
        });
    }

    //add styles to controls
    function addCss() {
        //add css to buttons 
       // $("button").button();
    }

    /*
    * Add DataTables plug-in in the UI
    */
    function addDataTable(appSettings) {
        //prepare the datatable
        this.auditHistoryDataTable = $('#audit-history-tbl').dataTable({
            "bJQueryUI": true,
            "sPaginationType": "full_numbers",
            "bAutoWidth": false,
            "aaData": [],
            "aoColumns": getColumnDefinations(appSettings)
        });
    }

    /*
    * Get column definitions for the datatables. These column
    * definitions are calculated from the supplied settings
    */
    function getColumnDefinations(appSettings) {
        var aoColumns = [];
        $.each(appSettings.columns, function (index, value) {

            var columnDef = { "sTitle": value['displayName'], "mDataProp": value['fieldName'], "asSorting": ["desc", "asc"] };

            if (value['sort']) {
                columnDef["asSorting"] = value['sort'];
            } else {
                columnDef["asSorting"] = ["asc"];
            }

            aoColumns.push(columnDef);
        });

        return aoColumns;
    }

    /*
    * Fill up the drop down lists for Module, Sub Module and User
    */
    function showConfigurationData(appSettings) {
        this.unDefinedText = 'Undefined';
        showModuleNames(appSettings);
        showSubModuleNames(appSettings);
        showUserNames(appSettings);
    }

    /*
    * Fill up the drop down lists for Module
    */
    function showModuleNames(appSettings) {
        var moduleNames = getModuleNames(appSettings);
        var select = $('#audit-history-module');
        $('option', select).remove();

        moduleNames.splice(0, 0, 'Any');
        moduleNames.push(this.unDefinedText);

        $.each(moduleNames, function (key, value) {
            select.append($("<option/>", {
                value: key,
                text: value
            }));
        });
    }

    /*
    * Fill up the drop down lists for Sub Module and User
    */
    function showSubModuleNames(appSettings) {

        var subModuleNames = getSubModuleNames(appSettings, $("#audit-history-module option:selected").text());

        var select = $('#audit-history-submodule');
        $('option', select).remove();

        subModuleNames.splice(0, 0, 'Any');
        subModuleNames.push(this.unDefinedText);

        $.each(subModuleNames, function (key, value) {
            select.append($("<option/>", {
                value: key,
                text: value
            }));
        });
    }

    /*
    * Fill up the drop down lists for User
    */
    function showUserNames(appSettings) {

        var userNames = $.extend([], appSettings.userData);

        var select = $('#audit-history-user');

        $('option', select).remove();

        userNames.splice(0, 0, 'Any');

        $.each(userNames, function (key, value) {
            select.append($("<option/>", {
                value: key,
                text: value
            }));
        });
    }

    /*
    * Get Module names
    */
    function getModuleNames(appSettings) {
        var moduleNames = [];
        if (appSettings.configurationData) {
            $.each(appSettings.configurationData, function (key, value) {
                var moduleName = value['module'];
                if (moduleName) {
                    moduleNames.push(moduleName);
                }
            });
        }
        return moduleNames;
    }

    /*
    * Get Sub Module names
    */
    function getSubModuleNames(appSettings, moduleName) {
        var subModuleNames = [];
        $.each(appSettings.configurationData, function (key, value) {
            if (value['module'] && value['module'] === moduleName) {
                subModuleNames = value['submodules'];
            }
        });

        return subModuleNames;
    }

    /*
    * Create a property in an object and assign value into it.
    */
    function createProp(obj, propertyName, propertyValue) {
        obj[propertyName] = propertyValue;
    }

    /*
    * Show Audit history data
    */
    function showAuditHistoryData(data) {
        this.auditHistoryDataTable.fnClearTable();
        this.auditHistoryDataTable.fnAddData(data);
    }

    /*
    * Format a data to a specified format
    */
    function formatDate(srcDate, format) {
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
            } else {
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
                        return fillValue('0', (dateValue.getMonth() + 1), 2, 'left');
                    case 'M':
                        return dateValue.getMonth();
                    case 'dddd':
                        return dayNames[dateValue.getDay()];
                    case 'ddd':
                        return dayNames[dateValue.getDay()].substr(0, 3);
                    case 'dd':
                        return fillValue('0', dateValue.getDate(), 2, 'left');
                    case 'd':
                        return dateValue.getDate();
                    case 'HH':
                        return fillValue('0', dateValue.getHours(), 2, 'left');
                    case 'H':
                        return dateValue.getHours();
                    case 'hh':
                        var hh;
                        return fillValue('0', ((hh = dateValue.getHours() % 12) ? hh : 12), 2, 'left');
                    case 'h':
                        var h;
                        return ((h = dateValue.getHours() % 12) ? h : 12);
                    case 'mm':
                        return fillValue('0', dateValue.getMinutes(), 2, 'left');
                    case 'm':
                        return dateValue.getMinutes();
                    case 'ss':
                        return fillValue('0', dateValue.getSeconds(), 2, 'left');
                    case 's':
                        return dateValue.getSeconds();
                    case 'TT':
                        return dateValue.getHours() < 12 ? 'AM' : 'PM';
                    case 'T':
                        return dateValue.getHours() < 12 ? 'A' : 'P';
                    case 'tt':
                        return dateValue.getHours() < 12 ? 'am' : 'pm';
                    case 't':
                        return dateValue.getHours() < 12 ? 'a' : 'p';
                    default:
                        return '';
                }
            });
        } catch (e) {
            return '';
        }
    }

    /*
    * Padding a string with a value on its left or right
    * defined by the length
    */
    function fillValue(value, actualValue, length, direction) {
        //make sure to convert to string
        var result = actualValue.toString();
        var pad = length - result.length;

        while (pad > 0) {
            if (direction.toString().toLowerCase() === 'left') {
                result = value + result;
            } else {
                result = result + value;
            }

            pad--;
        }

        return result;
    }

    /*
    * Get Audit history
    */
    function getAuditHistory(appSettings) {
        var that = this;

        var $selectedModule = $("#audit-history-module option:selected");
        var moduleName = $selectedModule.val() !== "0" ? $selectedModule.text() : '';

        var $selectedSubModule = $("#audit-history-submodule option:selected");
        var subModuleName = $selectedSubModule.val() !== "0" ? $selectedSubModule.text() : '';

        var $selectedUser = $("#audit-history-user option:selected");
        var userId = $selectedUser.val() !== "0" ? $selectedUser.text() : '';

        var startDate = $("#txt-audit-start-date").val();
        var endDate = $("#txt-audit-end-date").val();

        var moduleNameProp = appSettings.urlParameterMappings['moduleName'];
        var subModuleNameProp = appSettings.urlParameterMappings['subModuleName'];
        var userNameProp = appSettings.urlParameterMappings['user'];
        var startDateProp = appSettings.urlParameterMappings['startDate'];
        var endDateProp = appSettings.urlParameterMappings['endDate'];

        var selectedParameters = {};

        createProp(selectedParameters, moduleNameProp, moduleName);
        createProp(selectedParameters, subModuleNameProp, subModuleName);
        createProp(selectedParameters, userNameProp, userId);
        createProp(selectedParameters, startDateProp, startDate);
        createProp(selectedParameters, endDateProp, endDate);

        var dataTransferObject = $.extend({}, appSettings.additionalHeaderParameters, selectedParameters);

        var colSpan = appSettings.columns.length + 1;

        $.ajax({
            type: "POST",
            contentType: 'application/json',
            url: appSettings.searchUrl,
            data: JSON.stringify(dataTransferObject),
            dataType: 'json',
            beforeSend: function () {
                $('tbody', that.auditHistoryDataTable).html('<tr class="odd"><td class="dataTables_empty" vAlign="top" colSpan="' + colSpan + '"><div class="ajax-loader-div"></div></td></tr>');
            },
            success: function (data) {
                var auditResult = jQuery.extend(true, [], data.GetAuditHistoryResult);
                $.each(auditResult, function (key, value) {
                    value.AuditTime = formatDate(value.AuditTime, 'MMM dd yyyy HH:mm:ss');
                });
                showAuditHistoryData(auditResult);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
    }

})(jQuery);