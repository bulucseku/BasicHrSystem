/*
* File:        jquery.auditconfig.js
* Version:     1.0.0
* Description: Enable/disable audit configuration settings
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
*/

(function ($) {
    //Add to jQuery prototype
    $.fn.auditconfig = function (options) {

        /* Define default settings */
        var defaults = {
            getConfigUrl: undefined,
            saveConfigUrl: undefined,
            saveConfigAdditionalParams: undefined,
            restoreConfigUrl: undefined,
            moduleProp: undefined,
            subModuleProp: undefined,
            actionProp: undefined,
            callBackFunction: undefined
        };

        /* Merge default settings with options */
        var settings = $.extend({}, defaults, options);

        this.each(function () {
            var $this = $(this);

            /* This is the HTML markup definition */
            var markup = $('<div class="audit-config-plugin"><table class="audit-log-container-table"><tr><td>This page shows the audit configuration. You can modify any configuration or restore default configuration.</td><td><span class="audit-log-buttons-span"><input type="button" class="audit-config-plugin-button" id="btn-audit-config-update" value="SAVE"></input><input id="btn-audit-config-restore" type="button" class="audit-config-plugin-button" value="RESTORE CONFIG"></input></span></td></tr><tr><td colspan="2"><div class="audit-config-left-div"></div><div class="audit-config-right-div"></div></td></tr></table></div>');

            /* Clear the container and then add the markup */
            $this.empty();
            $this.append(markup);

            addBusyOverlay($('.audit-config-plugin'));
            showAuditConfigData(settings);
            addSaveButtonEventHandler(settings);
            addRestoreButtonEventHandler(settings);
            addCss();

            /* If the callback function is not empty then call it*/
            if (settings.callBackFunction && typeof settings.callBackFunction === 'function') {
                settings.callBackFunction();
            }
        });

        /* Instance method to remove the plugin */
        this.destroy = function () {

            return this.each(function () {
                var $this = $(this);
                $this.find('.audit-config-plugin').remove();
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
    * Add a busy overlay into the DOM array
    */
    function addBusyOverlay(obj) {
        this.busyOverlay = new busyOverlay(obj, null, null);
        this.busyOverlay.init();
    }

    /*
    * Show/Hide busy overlay
    */
    function showBusyOverlay(isVisible) {
        if (isVisible) {
            this.busyOverlay.show();
        } else {
            this.busyOverlay.close();
        }
    }

    /*
    * Add Save button event handler
    */
    function addSaveButtonEventHandler(appSettings) {
        $('#btn-audit-config-update').live('click', function () {
            saveAuditConfigData(appSettings);
        });
    }

    /*
    * Add Restore button event handler
    */
    function addRestoreButtonEventHandler(appSettings) {
        $('#btn-audit-config-restore').live('click', function () {
            restoreAuditConfigData(appSettings);
        });
    }

    /*
    * Show the audit configuration
    */
    function showAuditConfigData(appSettings) {
        var that = this;

        /* Ajax call to get the configuration data*/
        $.ajax({
            url: appSettings.getConfigUrl,
            dataType: 'json',
            cache: false,
            beforeSend: function () {
                /* Show the busy overlay */
                showBusyOverlay(true);
            },
            success: function (data) {
                /* Display data and close the busy overlay */
                that.auditConfigData = data;
                showCongigurationData(data, appSettings);
                showBusyOverlay(false);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showBusyOverlay(false);
                alert(errorThrown);
            }
        });
    }

    /*
    * Save Audit configuration
    */
    function saveAuditConfigData(appSettings) {
        var that = this;

        $('input[type=checkbox].audit-action').each(function () {
            var inputCheckBox = this;
            $.each(that.auditConfigData, function (index, value) {
                if (value[appSettings.moduleProp] === $(inputCheckBox).attr("module") && value[appSettings.subModuleProp] === $(inputCheckBox).attr("submodule") && value[appSettings.actionProp] === $(inputCheckBox).attr("action")) {
                    value.IsAuditable = inputCheckBox.checked;
                }
            });
        });

        var modules = $.extend({}, appSettings.saveConfigAdditionalParams);
        modules.auditModules = that.auditConfigData;

        $.ajax({
            url: appSettings.saveConfigUrl,
            type: "POST",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(modules),
            beforeSend: function () {
                /* Show the busy overlay */
                showBusyOverlay(true);
            },
            success: function () {
                showBusyOverlay(false);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showBusyOverlay(false);
                alert(errorThrown);
            }
        });
    }

    /*
    * Restore Audit configuration
    */
    function restoreAuditConfigData(appSettings) {
        var that = this;
        $.ajax({
            url: appSettings.restoreConfigUrl,
            dataType: 'json',
            cache: false,
            beforeSend: function () {
                /* Show the busy overlay */
                showBusyOverlay(true);
            },
            success: function () {
                that.auditConfigData = data;
                showCongigurationData(data, appSettings);
                showBusyOverlay(false);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showBusyOverlay(false);
                alert(errorThrown);
            }
        });
    }

    /*
    * Show configuration data
    */
    function showCongigurationData(data, appSettings) {
        showModuleNames(data, appSettings);
        $(".audit-config-plugin .collapsibleContainer").auditConfigCollapsiblePanel();
    }

    /*
    * Show Module Names
    */
    function showModuleNames(configData, appSettings) {
        var moduleNames = getModuleNames(configData, appSettings);
        var valueHtml = '';

        var className = 'collapsibleContainer';

        $(".audit-config-left-div").empty();
        $(".audit-config-right-div").empty();

        $.each(moduleNames, function (key, value) {

            valueHtml = '<div class="' + className + '" name=" ' + value + '" >' + showSubModules(value, configData, appSettings) + '</div>';
            if (key % 2 === 0) {
                $(".audit-config-left-div").append(valueHtml);
            } else {
                $(".audit-config-right-div").append(valueHtml);
            }
        });
    }

    /*
    * Show Sub Module Names
    */
    function showSubModules(moduleName, configData, appSettings) {
        var subModuleNames = getSubModuleNames(moduleName, configData, appSettings);

        var valueHtml = '';

        $.each(subModuleNames, function (key, value) {
            valueHtml += '<div class="collapsibleContainer" name=" ' + value + '" >' + showActions(moduleName, value, configData, appSettings) + '</div>';
        });

        return valueHtml;
    }

    /*
    * Show Actions
    */
    function showActions(moduleName, subModuleName, configData, appSettings) {
        var actionNames = getActionNames(moduleName, subModuleName, configData, appSettings);

        var valueHtml = '';
        $.each(actionNames, function (key, value) {

            var isAuditable = '';

            if (isActionAuditable(moduleName, subModuleName, value, configData, appSettings)) {
                isAuditable = 'checked="checked"';
            }

            valueHtml += '<div><input type="checkbox" class="audit-action" ' + isAuditable + ' module="' + moduleName + '" submodule="' + subModuleName + '" action="' + value + '" />' + value + '</div>';
        });

        return valueHtml;
    }

    /*
    * Get Module Names
    */
    function getModuleNames(configData, appSettings) {
        var moduleNames = [];

        if (configData) {
            $.each(configData, function (key, value) {
                var dataIndex = $.inArray(value[appSettings.moduleProp], moduleNames);
                if (dataIndex === -1) {
                    moduleNames.push(value.ModuleName);
                }
            });
        }

        return moduleNames;
    }

    /*
    * Get Sub Module Names
    */
    function getSubModuleNames(moduleName, configData, appSettings) {
        var subModuleNames = [];

        if (configData) {
            $.each(configData, function (key, value) {
                if (value.ModuleName === moduleName) {
                    var dataIndex = $.inArray(value[appSettings.subModuleProp], subModuleNames);
                    if (dataIndex === -1) {
                        subModuleNames.push(value.SubModuleName);
                    }
                }
            });
        }

        return subModuleNames;
    }

    /*
    * Get Action Names
    */
    function getActionNames(moduleName, subModuleName, configData, appSettings) {
        var actionNames = [];

        if (configData) {
            $.each(configData, function (key, value) {
                if (value[appSettings.moduleProp] === moduleName && value[appSettings.subModuleProp] === subModuleName) {
                    actionNames.push(value.ActionName);
                }
            });
        }

        return actionNames;
    }

    /*
    * Check if the action is auditable or not
    */
    function isActionAuditable(moduleName, subModuleName, actionName, configData, appSettings) {

        var isAuditable = false;

        if (configData) {
            $.each(configData, function (key, value) {
                if (value[appSettings.moduleProp] === moduleName && value[appSettings.subModuleProp] === subModuleName && value[appSettings.actionProp] === actionName) {
                    isAuditable = value.IsAuditable;
                }
            });
        }

        return isAuditable;
    }

    /*
    * Add css styles
    */
    function addCss() {
    }

    /***************************************************************
    * Following codes are for showing Collapsible panel to show the
    * Configuration data Module and Sub Module wise.
    *
    ****************************************************************/
    $.fn.extend({
        auditConfigCollapsiblePanel: function () {
            // Call the ConfigureCollapsiblePanel function for the selected element
            return $(this).each(configureCollapsiblePanel);
        }
    });

    function configureCollapsiblePanel() {
        $(this).addClass("ui-widget");

        // Check if there are any child elements, if not then wrap the inner text within a new div.
        if ($(this).children().length === 0) {
            $(this).wrapInner("<div></div>");
        }

        // Wrap the contents of the container within a new div.
        $(this).children().wrapAll("<div class='collapsibleContainerContent ui-widget-content'></div>");

        // Create a new div as the first item within the container.  Put the title of the panel in here.
        $("<div class='collapsibleContainerTitle ui-widget-header'> <div><table> <tr><td> <div class='collapse-title-img-div collapse-title-img-div-downstate' /></td><td> " + escapeScriptChars($(this).attr("name")) + "</td></tr></table></div></div>").prependTo($(this));

        // Assign a call to CollapsibleContainerTitleOnClick for the click event of the new title div.
        $(".collapsibleContainerTitle", this).click(collapsibleContainerTitleOnClick);
    }

    function collapsibleContainerTitleOnClick() {

        var $imgDiv = $(this).find('div.collapse-title-img-div');

        if ($imgDiv) {
            $imgDiv.toggleClass('collapse-title-img-div-collapsestate collapse-title-img-div-downstate');
        }

        // The item clicked is the title div... get this parent (the overall container) and toggle the content within it.
        $(".collapsibleContainerContent", $(this).parent()).slideToggle('normal');
    }

    // Replace special character from string. This is for preventing executing JavaScript code.

    function escapeScriptChars(str) {
        str = str || '';
        return str.replace(/</g, "&#60;").replace(/>/g, "&#62;").replace(/"/g, "&#34;").replace(/'/g, "&#39;");
    }


    /********************************************************
    * This class is used to show modal busy cursor on a DOM element
    *
    *********************************************************/

    function busyOverlay(el, width, height) {

        this.el = el;
        this.width = width;
        this.height = height;

        this.init = function () {
            if (this.el) {

                this.selectedElement = $(this.el);

                //set the overplayed element as same as the selected element
                var overlayWidth = this.width ? this.width : $(this.el).outerWidth();
                var overlayHeight = this.height ? this.height : $(this.el).outerHeight();

                //prepare the overplayed DOM element
                var overlayDiv = $('<div class="overlay-div"></div>');

                //add css
                $(overlayDiv).css({ 'width': +'' + overlayWidth + 'px' });
                $(overlayDiv).css({ 'height': +'' + overlayHeight + 'px' });
                $(overlayDiv).css({ 'position': "absolute", 'margin': 0, 'padding': 0 });

                this.overlayDiv = overlayDiv;
            }
        };
        this.show = function () {
            this.selectedElement.prepend(this.overlayDiv);
        };
        this.close = function () {
            $(this.overlayDiv).remove();
        };
    }

})(jQuery);

