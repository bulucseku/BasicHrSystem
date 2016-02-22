/*
* File:        jquery.smartsidebar.js
* Version:     1.1.0
* Description: Enable left or right side dockable menu.
* Author:      Muhammad Shafiqul Islam (Rana)
* Created:     27-Dec-2012
* Updated:     29-Jul-2015
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
    /* Add to jQuery prototype */
    $.fn.smartsidebar = function (options) {

        /* Define default settings */
        var defaults = {
            title: undefined,
            position: undefined,
            dataContainerElement: undefined,
            sidebarWidth: 230,
            sidebarHeight: 600,
            dockPanelWidth: 30,
            dockPanelMargin: 5,
            callBackFunctionDefault: undefined,
            callBackFunctionOnShow: undefined,
            callBackFunctionOnHide: undefined,
            isDocked: undefined,
            autoHeight: false,
            autoHeightMargin: 0,
            bgColor:'#613474',
            color:'#fff'
        };

        /* Merge default settings with options */
        settings = $.extend({}, defaults, options);

        var dockPanelPosition = settings.position || 'left';
        
        var that=this;

        this.each(function () {
            var $this = $(this);

            $($this).off("click", '.dockstate-' + dockPanelPosition);
            $($this).off("click", '.undockstate-' + dockPanelPosition);

            updateUI($this, settings, dockPanelPosition);

            //use default settings
            if(settings.dataContainerElement){
                settings.dataContainerElement.css({
                    'margin-left': '0px',
                    'margin-right': '0px',
                    'margin-top': '0px',
                    'margin-bottom': '0px'
                });

                if(dockPanelPosition === 'right'){
                    settings.dataContainerElement.css({
                        'margin-right': settings.dockPanelWidth + 2*settings.dockPanelMargin +'px'
                    })
                }else{
                    settings.dataContainerElement.css({
                        'margin-left': settings.dockPanelWidth + 2*settings.dockPanelMargin +'px'
                    })
                }
            }

            $this.css({
                    'width': settings.dockPanelWidth + 'px'
            });

            if(dockPanelPosition === 'right'){
                $this.css({
                    'margin-left': -settings.dockPanelWidth + 'px'
                });
            }

            /* If the callback function is not empty then call it*/
            if (settings.callBackFunctionDefault && typeof settings.callBackFunctionDefault === 'function') {
                settings.callBackFunctionDefault();
            }

        });
        
        /* Instance method to remove the plug-in */
        this.destroy = function () {
            return this.each(function () {
                var $this = $(this);
                $this.find('.navigation-sidebar-' + dockPanelPosition).remove();
            });
        };

        // Instance method to show the dock panel
        this.show = function() {
            return this.each(function () {
                var $this = $(this);
                $this.find('.navigation-sidebar-' + dockPanelPosition).click();
            });
        };

        // Instance method to show the dock panel
        this.hide = function() {
            return this.each(function () {
                var $this = $(this);
                $this.find('.undockstate-' + dockPanelPosition).click();
            });
        };

        //returns the jQuery object to allow for chainability
        return this;
    };

    /****************************************************************************************
    *
    * Private methods are defined below.       
    *
    *****************************************************************************************/

    function updateUI(element, settings, dockPanelPosition) {

        var dockPanelTitle = settings.title || 'Untitled';

        this.dockUndockImageHeight = 24;

        settings.isDocked = new Object();
        settings.isDocked[dockPanelPosition] = false;
        var expandIcon = (dockPanelPosition=='left')?'fa fa-caret-right':'fa fa-caret-left';
        var $navigationSideBar = $('<div class="navigation-sidebar-' + dockPanelPosition + '"><div>');
        var $navigationPane = $('<div class="navigationPane-' + dockPanelPosition + '"><div class="button_wrapper_docked"><div class="btn-gradient btn-gradient-navpane"><div class="icon '+expandIcon+'"></div><div/></div></div>');
        var $containerPane = $('<div class="dockablePanel-' + dockPanelPosition + '"></div>');

        $containerPane.css('width', settings.sidebarWidth);

        $navigationSideBar.append($navigationPane);
        $navigationSideBar.append($containerPane);

        var actualMarkup = element.children().detach();
        element.append($navigationSideBar);

        addRealMarkup(element, actualMarkup, dockPanelTitle, dockPanelPosition);
        addTitle(element, dockPanelTitle, dockPanelPosition);

        addEventHandlers(element, settings, dockPanelPosition);
        if (settings.autoHeight) {
            settings.sidebarHeight = getAutoHeight(settings.autoHeightMargin);
            $( window ).resize(function() {
                setTimeout(function() {
                    $('.scrollable-panel', element).css('max-height', getAutoHeight(settings.autoHeightMargin));
                }, 500);
            });
        };
        $('.scrollable-panel', element).css('max-height', settings.sidebarHeight);
    }

    function addEventHandlers(currentCtrl, appSettings, dockPanelPosition) {
        $(currentCtrl).on("click", '.navigation-sidebar-' + dockPanelPosition, function () {

            if (!appSettings.isDocked[dockPanelPosition]) {

                $('.navigationPane-' + dockPanelPosition, currentCtrl).hide();

                $('.dockablePanel-' + dockPanelPosition, currentCtrl).find('.dockstate-' + dockPanelPosition).removeClass('dockstate-' + dockPanelPosition).addClass('undockstate-' + dockPanelPosition).find('.dockPanelTitleImage').removeClass('dockPanelTitleImage').addClass('undockPanelTitleImage');
                if (dockPanelPosition == 'left') {
                    $('.dockablePanel-' + dockPanelPosition, currentCtrl).css({'display':'block', 'left':-settings.sidebarWidth + 'px'}).animate({'left':'0px'}, 400);
                } else {
                    $('.dockablePanel-' + dockPanelPosition, currentCtrl).css({'display':'block', 'right':-settings.sidebarWidth + 'px'}).animate({'right':'0px'}, 400);
                }
                setTimeout(function() {
                    appSettings.isDocked[dockPanelPosition] = true;
                }, 400);

                //use expand settings
                if(settings.dataContainerElement){
                    if(dockPanelPosition === 'left'){
                        settings.dataContainerElement.css({
                            'margin-left' : settings.sidebarWidth + 2*settings.dockPanelMargin +'px'
                        });
                    }else{
                        settings.dataContainerElement.css({
                            'margin-right' : settings.sidebarWidth + 2*settings.dockPanelMargin +'px'
                        });
                    }
                }

                currentCtrl.css({
                    'width': settings.sidebarWidth + 'px'
                });

                if(dockPanelPosition === 'right'){
                    currentCtrl.css({
                        'margin-left': -settings.sidebarWidth + 'px'
                    });
                }

                /* If the callback function is not empty then call it*/
                if (appSettings.callBackFunctionOnShow && typeof appSettings.callBackFunctionOnShow === 'function') {
                    appSettings.callBackFunctionOnShow();
                }
            }

        });

        $(currentCtrl).on("click", '.undockstate-' + dockPanelPosition, function () {
            if (dockPanelPosition =='right') {
                $('.dockablePanel-' + dockPanelPosition, currentCtrl).animate({'right':-settings.sidebarWidth +'px'}, 400);
            } else {
                $('.dockablePanel-' + dockPanelPosition, currentCtrl).animate({'left': -settings.sidebarWidth +'px'}, 400);
            }

            $('.navigationPane-' + dockPanelPosition, currentCtrl).show();

            //Set timeout to avoid double click effect.
            setTimeout(function () {
                $('.dockablePanel-' + dockPanelPosition, currentCtrl).css('display','none');
                $('.dockablePanel-' + dockPanelPosition, currentCtrl).find('.undockstate-' + dockPanelPosition).removeClass('undockstate-' + dockPanelPosition).addClass('dockstate-' + dockPanelPosition).find('.undockPanelTitleImage').removeClass('undockPanelTitleImage').addClass('dockPanelTitleImage');
                appSettings.isDocked[dockPanelPosition] = false;
            }, 300);

            //use collapse settings
            if(settings.dataContainerElement){
                if(dockPanelPosition === 'left'){
                    settings.dataContainerElement.css({
                        'margin-left' : settings.dockPanelWidth + 2*settings.dockPanelMargin +'px'
                    });
                }else{
                    settings.dataContainerElement.css({
                        'margin-right' : settings.dockPanelWidth + 2*settings.dockPanelMargin +'px'
                    });
                }
            }

            currentCtrl.css({
                'width': settings.dockPanelWidth + 'px'
            });

            if(dockPanelPosition === 'right'){
                currentCtrl.css({
                    'margin-left': -settings.dockPanelWidth + 'px'
                });
            }

            /* If the callback function is not empty then call it*/
            if (appSettings.callBackFunctionOnHide && typeof appSettings.callBackFunctionOnHide === 'function') {
                appSettings.callBackFunctionOnHide();
            }
        });

    }

    function getTextWidth(text) {
        $('body').append("<span class='ssb-dummy-text'></span>");
        $('.ssb-dummy-text').html(text);
        var textWidth = $('.ssb-dummy-text').outerWidth(true);
        $('.ssb-dummy-text').remove();
        return textWidth;
    }


    function addTitle(element, title, position) {
        $('.navigationPane-' + position, element).append('<p class="ssb-vertical-text">' + title + '</p>');

        var titleHeight = getTextWidth(settings.title) + this.dockUndockImageHeight;

        $('.navigationPane-' + position, element).css('height', titleHeight + 'px');
        $('.navigationPane-' + position, element).addClass('dockPanelMargin');
        //add min-height to container
        $('.dockablePanel-' + position, element).css('min-height', titleHeight + 'px');

        $('.navigationPane-' + position, element).css('background', settings.bgColor);
        $('.navigationPane-' + position, element).css('color', settings.color);

        $('.docPanelTitle', element).css('background', settings.bgColor);
        $('.docPanelTitle', element).css('color', settings.color);
    }

    function addRealMarkup(element, content, title, position) {
        $('.dockablePanel-' + position, element).append('<div class="scrollable-panel"></div>');
        $('.dockablePanel-' + position + ' .scrollable-panel', element).html(content);
        $('.dockablePanel-' + position, element).addClass('dockPanelMargin');
        $('.dockablePanel-' + position, element).prepend('<div class="docPanelTitle dockstate-' + position + '"><div class="docPanelTitleText">' + title + '</div><div class="button_wrapper" style="float:right"><i class="fa fa-times"><i/></div>')
     }
    
    function getAutoHeight(margin) {
        var windowHeight = $(window).height();
        var sidebarHeight = windowHeight - margin - 45;
        return (sidebarHeight>400) ? sidebarHeight : 400; 
    }

})(jQuery);