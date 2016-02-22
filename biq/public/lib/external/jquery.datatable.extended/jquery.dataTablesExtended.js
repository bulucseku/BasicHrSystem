/*
* File:        jquery.dataTablesExtended.js
* Version:     1.0.0
* Description: Add some extra functionality to datatable plugin
* Author:      Bulbul Ahmed
* Created:     20-Nov-2012
* Updated:     17-Apr-2013
* Language:    Javascript
* Contact:     bulbul.ahmed@sentrana.com

* To use this plugin you have to use following  jQuery plugins as described below
*
* DataTables:
* =-=-=-=-=-=
* This plugin mainly enhances DataTables functionality.
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
* For details visit http://jqueryui.com/
*
*/

(function ($) {

    this.tableCount = 0;
    this.appSettingsMap = {};
    this.dataTables = {};
    /* Add to jQuery prototype */
    $.fn.extendedDataTable = function (options) {
        var $this = $(this);
        /* Define default settings */
        var defaults = {
            selectable: true
        };

        /* Merge default settings with options */
        var settings = $.extend({}, defaults, options);

        var dataTableId = generateId();

        /* This is the HTML markup definition */

        var markup = $('<table class="display" id=' + dataTableId + '></table>');

        /* Clear the container and then add the markup */
        $this.empty();
        $this.append(markup);

        /*initialize settings*/
        initDataTableExt(settings);

        /*add datatable*/
        var datatble = addDataTable(settings);

        datatble[dataTableId].dataTableSettings[tableCount - 1].aoDrawCallback.push({
            "fn": function (e) { resetAll(e); },
            "sName": "reset"
        });

        /*finalize settings*/
        finalizeDataTableExt(settings);

        /*initialize filterchekbox settings*/
        initRowfilterCheckbox(settings);

        /* Instance method: get the data of a selected row */
        this.getSelectedRowsData = function () {
            var tableIndex = 'DTExt_datatable-tbl-' + $(this[0].firstChild).attr('id').split('_')[1].split('-')[2];

            if (!appSettingsMap[tableIndex].selectable) {
                return undefined;
            }
            var data = $('input:checked.DTExt_select_checkbox', '#' + tableIndex + ' tbody');
            var rowData = [];
            $.each(data, function (rkey, rvalue) {
                var tr = $(rvalue).parent().parent();
                var td = $('td', tr);
                var txt = '';
                var stratIndex = 1, endIndex = td.length;

                if (appSettingsMap[tableIndex].actionColumns && appSettingsMap[tableIndex].actionColumns.length && appSettingsMap[tableIndex].actionColumns.length > 0) {
                    endIndex -= settings.actionColumns.length;
                }
                if (appSettingsMap[tableIndex].deleteRowColumn) {
                    endIndex -= 1;
                }
                $.each(td, function (ckey, cvalue) {
                    if (ckey >= stratIndex && ckey < endIndex) {
                        if (txt.length > 0) {
                            txt += ',';
                        }
                        txt += $(cvalue).text();
                    }
                });
                rowData.push(txt);
            });

            return rowData;
        };

        /* Instance method: get the data of a selected row */
        this.getSelectedRowsIndex = function () {
            var tableIndex = 'DTExt_datatable-tbl-' + $(this[0].firstChild).attr('id').split('_')[1].split('-')[2];
            if (!appSettingsMap[tableIndex].selectable) {
                return undefined;
            }
            var data = $('input:checked.DTExt_select_checkbox', '#' + tableIndex + ' tbody');
            var rowData = [];
            $.each(data, function (rkey, rvalue) {
                var tr = $(rvalue).parent();
                var aPos = dataTables[tableIndex].fnGetPosition(tr[0]);
                rowData.push(aPos[0]);
            });

            return rowData;


        };

        /* Instance method: change the amount of check box filter  */
        this.changeRowFilterAmount = function (checkboxName, displayText, itemAmount) {
            var tableId = $(this[0].firstChild).attr('id');
            var ss = $('input:checkbox[name=' + checkboxName + '].DTExt_rowfilter_checkboxes', '#' + tableId).parent().next();
            $('label', ss).html('&nbsp;<span>' + displayText + ' (' + itemAmount + ')</span>');

        };

        /* Instance method: change the checked status of checkbox filter */
        this.changeRowFilterStatus = function (checkboxName, status) {
            var tableId = $(this[0].firstChild).attr('id');
            $('input:checkbox[name=' + checkboxName + '].DTExt_rowfilter_checkboxes', '#' + tableId).attr("checked", status);
        };
        /* Instance method: get the value of checked checkbox filter*/
        this.getCheckedFilterCheckboxValue = function () {
            var tableId = $(this[0].firstChild).attr('id');
            var checked = $('input:checked.DTExt_rowfilter_checkboxes', '#' + tableId);
            var value = [];
            $.each(checked, function (key, val) {
                value.push($(val).val());
            });

            return value;
        };

        /* Instance method: add a class to a row */
        this.addClassToRow = function (row, className) {
            var tableId = 'DTExt_datatable-tbl-' + $(this[0].firstChild).attr('id').split('_')[1].split('-')[2],
                settingsIndex = tableId.split('-')[2] * 1,
                tableSettings = dataTables[tableId].dataTableSettings[settingsIndex - 1];

            if (row * 1 > tableSettings.aoData.length - 1) {
                return;
            }
            tableSettings.aoData[row].nTr.className += " " + className;
        };

        /* Instance method: add class to a cel */
        this.addClassToCell = function (row, col, className) {
            var tableId = 'DTExt_datatable-tbl-' + $(this[0].firstChild).attr('id').split('_')[1].split('-')[2],
                settingsIndex = tableId.split('-')[2] * 1,
                tableSettings = dataTables[tableId].dataTableSettings[settingsIndex - 1];

            if (row * 1 > tableSettings.aoData.length - 1) {
                return;
            }
            if (col * 1 > tableSettings.aoData[row].nTr.cells.length - 1) {
                return;
            }
            tableSettings.aoData[row].nTr.cells[col].className += " " + className;

        };
        /* Instance method: remove class from a row */
        this.removeClassFromRow = function (row, className) {
            var tableId = 'DTExt_datatable-tbl-' + $(this[0].firstChild).attr('id').split('_')[1].split('-')[2],
                settingsIndex = tableId.split('-')[2] * 1,
                tableSettings = dataTables[tableId].dataTableSettings[settingsIndex - 1];

            if (row * 1 > tableSettings.aoData.length - 1) {
                return;
            }
            $(tableSettings.aoData[row].nTr).removeClass(className);
        };
        /* Instance method: remove class from a cell */
        this.removeClassFromCell = function (row, col, className) {

            var tableId = 'DTExt_datatable-tbl-' + $(this[0].firstChild).attr('id').split('_')[1].split('-')[2],
                settingsIndex = tableId.split('-')[2] * 1,
                tableSettings = dataTables[tableId].dataTableSettings[settingsIndex - 1];

            if (row * 1 > tableSettings.aoData.length - 1) {
                return;
            }
            if (col * 1 > tableSettings.aoData[row].nTr.cells.length - 1) {
                return;
            }

            $(tableSettings.aoData[row].nTr.cells[col]).removeClass(className);

        };

        /* Instance method: get releted datatable */
        this.getDataTable = function () {
            var tableId = 'DTExt_datatable-tbl-' + $(this[0].firstChild).attr('id').split('_')[1].split('-')[2];
            return dataTables[tableId];
        };

        /* Instance method to remove the plugin */
        this.destroy = function () {
            var tableId = 'DTExt_datatable-tbl-' + $(this[0].firstChild).attr('id').split('_')[1].split('-')[2];
            $(this).find('#' + tableId).remove();
        };

        //returns the jQuery object to allow for chainability
        return this;

    };

    /****************************************************************************************
    *
    * Private methods are defined below. 
    *
    *
    *****************************************************************************************/

    function generateId() {
        tableCount++;
        this.dataTableId = "DTExt_datatable-tbl-" + tableCount;
        return this.dataTableId;
    }

    /* reset the plugin to its initial states */
    function resetAll(e) {

        if (appSettingsMap[e.sTableId].selectable) {
            $('#DTExt_select_all_' + e.sTableId.split('-')[2], "#" + e.sTableId + "_wrapper").attr("checked", false);
            $('input:checkbox.DTExt_select_checkbox', '#' + e.sTableId + ' tbody').attr("checked", false);

        }

        //attach click event for inline update
        $('td.DTExt_dynamic_column', '#' + e.sTableId + ' tbody').unbind('click');
        $('td.DTExt_dynamic_column', '#' + e.sTableId + ' tbody').click(dynamicColumnClick);
        //remove any controll that has been created dynamicaly
        removeOtherControl();

        //apply class to header only
        if (appSettingsMap[e.sTableId].formatedColumns) {
            $.each(appSettingsMap[e.sTableId].formatedColumns, function (key, value) {
                $('th.' + value.className).addClass(value.className);
                $('td.' + value.className).addClass(value.className);
                if (value.applyTo) {
                    if (value.applyTo === "header") {
                        $('td.' + value.className).removeClass(value.className);
                    }
                    if (value.applyTo === "body") {
                        $('th.' + value.className).removeClass(value.className);
                    }
                }
            });
        }
    }

    /*
    * Add checkbox filter
    */

    function initRowfilterCheckbox(appSettings) {
        if (!appSettings.filterCheckboxes) {
            return;
        }

        var html = '<div class="DTExt_rowfilter_checkboxes_container" >';
        $.each(appSettings.filterCheckboxes, function (key, value) {
            html += '<div style="display:inline-block; margin-left:5px;">';
            html += '<table cellspacing="0" cellpadding="0" style="display:inline;" ><tr tableid=' + dataTableId + '><td>';
            html += '<input id="DTExt_rowfilter_checkbox_id_' + value.value + '" class="DTExt_rowfilter_checkboxes" name=' + value.name + ' value=' + value.value + ' type="checkbox" /></td>';
            html += '<td><label for="DTExt_rowfilter_checkbox_id_' + value.value + '"> ' + value.displayText + ' (' + value.itemAmount + ') </label></td></tr></table></div>';
        });
        html += '</div>';

        $("#" + dataTableId + "_wrapper .dataTables_filter").before(html).fadeIn('slow');

        $('input:checkbox.DTExt_rowfilter_checkboxes').click(function (el) {

            var tableid = $(el.target).parent().parent().attr('tableid');
            if (appSettingsMap[tableid].filterCheckboxCallBack) {
                var val = $(el.target).val();
                appSettingsMap[tableid].filterCheckboxCallBack(val);
            }

        });

    }

    /*
    * Initialize the plugin
    */

    function initDataTableExt(appSettings) {
        if (appSettings.formatedColumns) {
            $.each(appSettings.formatedColumns, function (key, value) {
                var column = $.grep(appSettings.datatableParams.aoColumns, function (e) {
                    return e.mDataProp === value.columnName;
                });

                if (column.length > 0) {
                    if (column[0].sClass) {
                        column[0].sClass += ' ' + value.className;
                    } else {
                        column[0].sClass = value.className;
                    }
                }


            });
        }

        if (appSettings.inlineEditColums) {

            $.each(appSettings.inlineEditColums.columns, function (key, value) {
                var column = $.grep(appSettings.datatableParams.aoColumns, function (e) {
                    return e.mDataProp === value.columnName;
                });

                if (column.length > 0) {
                    if (column[0].sClass) {
                        column[0].sClass += ' DTExt_dynamic_column';
                    } else {
                        column[0].sClass = 'DTExt_dynamic_column';
                    }
                }

            });
        }

        if (appSettings.selectable) {
            appSettings.datatableParams.aoColumns.unshift({ "sTitle": '<input id="DTExt_select_all_' + tableCount + '"  type="checkbox" value="0">', 'sClass': "DTExt_select_all_checkbox", 'bSortable': false, "mData": null,
                "render": function (obj) {
                    var tableCountIndex = appSettings.datatableParams.aoColumns[0].sTitle.split('_')[3].split(' ')[0];
                    return (' <input tableIndex=' + parseInt(tableCountIndex) + ' class="DTExt_select_checkbox" type="checkbox"  value=""></input>');
                }
            });
        }

        if (appSettings.actionColumns) {
            $.each(appSettings.actionColumns, function (key, value) {
                appSettings.datatableParams.aoColumns.push({
                    "sTitle": value.headerTitle,
                    'bSortable': false,
                    "mData": null,
                    "render": function (obj) {
                        var caption = '';
                        if (typeof value.caption === 'function') {
                            caption = value.caption(obj.iDataRow);
                        } else {
                            caption = value.caption;
                        }
                        return '<input type="button" tableid=' + dataTableId + ' buttonindex="' + key + '" name="DTExt_btn_dynamic" class="DTExt_btn_dynamic ' + value.className + ' ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-button-text" value="' + caption + '"/>';
                    }
                });
            });
        }

        if (appSettings.deleteRowColumn) {
            if (appSettings.deleteRowColumn) {
                appSettings.datatableParams.aoColumns.push({
                    "sTitle": appSettings.deleteRowColumn.headerTitle,
                    'bSortable': false,
                    "mData": null,
                    "render": function (obj) {
                        return '<input type="button" tableid=' + dataTableId + ' name="remove" class="DTExt_btn_rowDelete ' + appSettings.deleteRowColumn.className + ' ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-button-text" value="' + appSettings.deleteRowColumn.caption + '"/>';
                    }
                });
            }
        }

        this.appSettingsMap[dataTableId] = appSettings;

    }
    /*
    *finalize the plugin
    */

    function finalizeDataTableExt() {
        var tableId = '';

        if (appSettingsMap[dataTableId].selectable) {
            $("#" + dataTableId + "_wrapper").off('click', '#DTExt_select_all_' + tableCount);
            $("#" + dataTableId + "_wrapper").on('click', '#DTExt_select_all_' + tableCount, function (el) {

                var elid = $(el.target).attr('id'),
                    tableindex = elid.split('_'),
                    splittedTableId = dataTableId.split('-');
                splittedTableId[2] = tableindex[3];
                tableId = splittedTableId.join('-');

                $('input:checkbox.DTExt_select_checkbox', '#' + tableId + ' tbody').prop("checked", this.checked);
                if (appSettingsMap[tableId].selectAllCallback && typeof appSettingsMap[tableId].selectAllCallback === 'function') {
                    appSettingsMap[tableId].selectAllCallback(this.checked);
                }
            });

            $('#' + dataTableId + ' tbody').off('click', 'input:checkbox.DTExt_select_checkbox');
            $('#' + dataTableId + ' tbody').on('click', 'input:checkbox.DTExt_select_checkbox', function (el) {

                var tableIndex = $(el.target).attr('tableIndex');

                tableId = "DTExt_datatable-tbl-" + tableIndex;

                var totalCheckboxes = $('input:checkbox.DTExt_select_checkbox', '#' + tableId + ' tbody'),
                    checkedCheckboxes = $('input:checked.DTExt_select_checkbox', '#' + tableId + ' tbody'),
                    isSelectAll = totalCheckboxes.length === checkedCheckboxes.length;

                $('#DTExt_select_all_' + tableIndex, "#" + tableId + "_wrapper").attr("checked", isSelectAll);

                if (appSettingsMap[tableId].selectChangeCallback && typeof appSettingsMap[tableId].selectChangeCallback === 'function') {
                    var tr = $(el.target).parent().parent();
                    var aPos = dataTables['DTExt_datatable-tbl-' + tableIndex].fnGetPosition(tr[0]);
                    appSettingsMap['DTExt_datatable-tbl-' + tableIndex].selectChangeCallback(aPos, isSelectAll, this.checked);
                }
            });
        }
        //apply class to header only
        if (appSettingsMap[dataTableId].formatedColumns) {

            $.each(appSettingsMap[dataTableId].formatedColumns, function (key, value) {
                $('th.' + value.className).addClass(value.className);
                $('td.' + value.className).addClass(value.className);
                if (value.applyTo) {
                    if (value.applyTo === "header") {
                        $('td.' + value.className).removeClass(value.className);
                    }
                    if (value.applyTo === "body") {
                        $('th.' + value.className).removeClass(value.className);
                    }
                }
            });
        }

        //apply to body only
        $('th.DTExt_dynamic_column').removeClass('DTExt_dynamic_column');

        //attach click event for inline update
        $('td.DTExt_dynamic_column', '#' + dataTableId + ' tbody').unbind('click');
        $('td.DTExt_dynamic_column', '#' + dataTableId + ' tbody').click(dynamicColumnClick);

        //make table button and attach event
        $("button", '#' + dataTableId + ' tbody').button();
        $('#' + dataTableId + ' tbody').off('click', ".DTExt_btn_dynamic");
        $('#' + dataTableId + ' tbody').on('click', ".DTExt_btn_dynamic", function () {

            var td = $(this).parent(),
                index = $(this).attr('buttonindex'),
                tableId = $(this).attr('tableid');
            dynamicActionButtonClick(td, index * 1, tableId);
        });

        $('#' + dataTableId + ' tbody').on('hover', ".DTExt_btn_dynamic", function () {
            $(this).addClass('ui-state-hover');
        });

        $('#' + dataTableId + ' tbody').on('mouseout', ".DTExt_btn_dynamic", function () {
            $(this).removeClass('ui-state-hover');
        });

        //attach event to remove button
        $('#' + dataTableId + ' tbody').off('click', '.DTExt_btn_rowDelete');
        $('#' + dataTableId + ' tbody').on('click', '.DTExt_btn_rowDelete', function () {
            var td = $(this).parent();
            tableId = $(this).attr('tableid');
            dynamicRowDeleteButtonClick(td, tableId);
        });

        $('#' + dataTableId + ' tbody').on('hover', ".DTExt_btn_rowDelete", function () {
            $(this).addClass('ui-state-hover');
        });

        $('#' + dataTableId + ' tbody').on('mouseout', ".DTExt_btn_rowDelete", function () {
            $(this).removeClass('ui-state-hover');
        });

    }

    /* event handler for  Row Delete Button*/
    function dynamicRowDeleteButtonClick(td, tableId) {
        var tr = $(td[0]).parent();
        var dataTable = dataTables[tableId];
        var aPos = dataTable.fnGetPosition(tr[0]);
        var settings = appSettingsMap[tableId];

        if (settings.deleteRowColumn.callback && typeof settings.deleteRowColumn.callback === 'function') {
            if (settings.deleteRowColumn.callback(aPos)) {
                dataTable.fnDeleteRow(aPos);
            }
        } else {
            dataTable.fnDeleteRow(aPos);
        }
    }
    /* event handler for  dynamic Button*/
    function dynamicActionButtonClick(td, index, tableId) {
        var tr = $(td[0]).parent();
        var dataTable = dataTables[tableId];
        var aPos = dataTable.fnGetPosition(tr[0]);
        var settings = appSettingsMap[tableId];
        var column = settings.actionColumns[index];
        if (column.callback && typeof column.callback === 'function') {
            column.callback(aPos);
        }
    }

    /* Find the inline update column index*/
    function getDynamicColumnIndex(columnName, tableId) {
        for (var i = 0; i < appSettingsMap[tableId].inlineEditColums.columns.length; i++) {
            if (appSettingsMap[tableId].inlineEditColums.columns[i].columnName === columnName) {
                return i;
            }
        }
        return -1;
    }

    function getVisibleColumns(tableId) {
        var aColumns = new Array();

        $.each(dataTables[tableId].fnSettings().aoColumns, function (c, value) {
            if (dataTables[tableId].fnSettings().aoColumns[c].bVisible === true) {
                aColumns.push(value);
            }

        });
        return aColumns;
    }

    /* this function executed when any inline editable cell is clicked */
    function dynamicColumnClick() {
        var tableId = $(this).parent().parent().parent().attr('id');
        removeOtherControl(tableId);
        var dataTable = dataTables[tableId];
        var aPos = dataTable.fnGetPosition(this);
        var aData = dataTable.fnGetData(aPos[0]);

        if (aPos[1] === null || aPos[1] === undefined) {
            return;
        }

        var aoColumns = getVisibleColumns(tableId);
        var aCol = aoColumns[aPos[1]];

        var cindex = getDynamicColumnIndex(aCol.mDataProp, tableId);

        $(this).unbind('click');

        var column = appSettingsMap[tableId].inlineEditColums.columns[cindex];

        if (column.type !== 'combo') {
            var html = '<input tblid= ' + tableId + ' type="text" id="EXT-INLINE-UPDATE-COL-' + aPos[0] + '-' + aPos[1] + '"/>'; //create a text box
            $(this).html(html);

            if (column.type === 'text') {
                $(this).find('input').focus().val(aData[aCol.mDataProp]);

                $(this).find('input[type=text]').bind('keypress', function (el) {
                    if (el.keyCode == 13) {
                        var tblid = $(this).attr('tblid');
                        invokeinlineEditCallBack(aPos[0], aCol.mDataProp, $(this).val(), tblid);
                        removeOtherControl(tblid);
                        dataTable.fnDraw(false);
                    }
                });
            } else if (column.type === 'date') {//create a date picker
                $(this).find('input[type=text]').not('.hasDatePicker').datepicker({ dateFormat: 'dd M yy', changeMonth: true, changeYear: true,
                    onSelect: function (dateText) {
                        var tblid = $(this).attr('tblid');
                        invokeinlineEditCallBack(aPos[0], aCol.mDataProp, dateText, tblid);
                        removeOtherControl(tblid);
                    }
                }).attr('readonly', 'readonly').focus();

            }

        } else { //create dropdownlist
            if (column.data && column.data.length > 0) {
                var sel = '';
                html = '<select tblid= ' + tableId + ' id="EXT-INLINE-UPDATE-COL-' + aPos[0] + '-' + aPos[1] + '" autocomplete="off">';
                var eltext = $(this).text();
                $.each(column.data, function (key, val) {
                    sel = '';
                    if ($.trim(eltext) === $.trim(val.text)) {
                        sel = 'selected';
                    }

                    html += '<option ' + sel + ' value=' + val.value + '> ' + val.text + '</option>';
                });
                html += '</select>';
                $(this).html(html);
                $('select', $(this)).bind('change', function () {
                    var text = $("option:selected", $(this)).text(),
                        tblid = $(this).attr('tblid');
                    invokeinlineEditCallBack(aPos[0], aCol.mDataProp, text, tblid);
                    removeOtherControl(tblid);
                });

            }
        }
    }

    function invokeinlineEditCallBack(row, col, text, tableId) {
        if (appSettingsMap[tableId].inlineEditColums.inlineEditCallBack && typeof appSettingsMap[tableId].inlineEditColums.inlineEditCallBack === 'function') {
            var callbackValue = appSettingsMap[tableId].inlineEditColums.inlineEditCallBack(row, col, text);
            if (callbackValue && callbackValue.success) {
                this.inlineEditCallBackClass = {};
                this.inlineEditCallBackClass.addClassName = callbackValue.addClassName;
                this.inlineEditCallBackClass.removeClassName = callbackValue.removeClassName;
                updateTableData(callbackValue.value, tableId);
            }
        } else {
            updateTableData(undefined, tableId);
        }

    }

    function updateTableData(updatedtext, tableId) {
        var text = updatedtext;
        var othertext = $('#' + tableId + '_wrapper tbody input[type=text]');
        if (othertext.length > 0) {
            var id = $(othertext).attr('id').split('-');
            if (!text || text.length <= 0) {
                text = $(othertext).val();
            }
            updateSingleData(id, text, tableId);
        }

        var othercbo = $('#' + tableId + '_wrapper tbody select');
        if (othercbo.length > 0) {
            id = $(othercbo).attr('id').split('-');
            if (!text || text.length <= 0) {
                text = $("option:selected", othercbo).text();
            }
            updateSingleData(id, text, tableId);
        }

    }

    function updateSingleData(id, text, tableId) {
        var aData = dataTables[tableId].fnGetData(id[4]);
        var aoColumns = getVisibleColumns(tableId);
        var aCol = aoColumns[id[5]];
        aData[aCol.mDataProp] = text;
    }

    function removeOtherControl(tblid) {
        var othertext = $('#' + tblid + '_wrapper tbody input[type=text]');
        if (othertext.length > 0) {
            removeSingleControl(othertext, tblid);
        }

        var othercbo = $('#' + tblid + '_wrapper tbody select');
        if (othercbo.length > 0) {
            removeSingleControl(othercbo, tblid);
        }
    }

    function removeSingleControl(otherctl, tblid) {
        $(otherctl).parent().click(dynamicColumnClick);
        if (this.inlineEditCallBackClass) {
            if (this.inlineEditCallBackClass.removeClassName) {
                $(otherctl).parent().removeClass(this.inlineEditCallBackClass.removeClassName);
            }
            if (this.inlineEditCallBackClass.addClassName) {
                $(otherctl).parent().addClass(this.inlineEditCallBackClass.addClassName);
            }

            this.inlineEditCallBackClass = undefined;
        }
        var id = $(otherctl).attr('id').split('-');
        var aData = dataTables[tblid].fnGetData(id[4]);
        var aoColumns = getVisibleColumns(tblid);
        var aCol = aoColumns[id[5]];
        var text = aData[aCol.mDataProp];
        $(otherctl).parent().html('').text(text);

    }

    /*
    * Add DataTable plugin in the UI
    */

    function addDataTable(appSettings) {
        dataTables[dataTableId] = $('#' + dataTableId).dataTable(appSettings.datatableParams);
        return dataTables;

    }
})(jQuery);