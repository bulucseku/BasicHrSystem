//This class used in sidebar filter group
can.Control.extend("Sentrana.Controllers.DropdownChecklist", {
    pluginName: 'sentrana_dropdown_checklist',
    defaults: {
        basePath: "lib/sentrana/DropdownList",
        templatesPath: "templates",
        tmplInit: "Dropdown.ejs",
        tmplItems: "DropdownItems.ejs",
        defaultText: "",
        isMultiSelect: true,
        itemClickDelay: 2000 // If it is not supply by caller then  click event between clicking checkobx items will delay 2 sec.
    }
},
{
    init: function () {

        // Define container
        this.$container = this.element;

        // Update the view
        this.updateView();

        // Initialize variables
        this.$chekboxAll = $(".checkboxAll", this.element);
        this.$dropdownText = $('.dropdownHeader span', this.element);
        this.$hiddenText = $('.lookup', this.element);
        this.$maxTextLength = 19;
        this.selectedItems = [];
        this.itemClickCount = 0;
        this.ControlWidth = 170; //this width comes from dropdown.css (.dropdownHeader .text)

        this.ListItems = this.options.dropdownItems;
        // Set the default text
        this.$dropdownText.html(this.options.paramCaption);
        this.$dropdownText.attr('title', this.options.paramCaption);

        // Adding indent for cascade control
        this.setCascadeIndent();

        //var textWidth = this.getTextWidth(this.options.paramCaption) - 15;//For padding
        //var controlTextWidth = this.ControlWidth;
        //if (this.options.cascadeIndentCount > 0) {
        //    var indentPadding = this.options.cascadeIndentCount * 5;
        //    controlTextWidth = this.ControlWidth - indentPadding - 5; //5 = is indent image width
        //}
        //if (textWidth > controlTextWidth) {
        //    this.$dropdownText.attr('title', this.options.paramCaption);
        //}
    },

    updateView: function () {
        this.renderDropdown();
    },

    renderDropdown: function () {

        // Render dropdown
        this.$container.html(can.view(this.getTemplatePath(this.options.tmplInit), { isMultiSelect: this.options.isMultiSelect, defaultText: this.options.defaultText, lookupData: [] }));

        // Render dropdown items
        if (this.options.dropdownItems) {
            this.renderItemList(this.options.dropdownItems);
        }
    },

    findItem: function (itemList, itemKey) {

        for (var i = 0; i < itemList.length; i++) {
            var key = $(itemList[i]).attr('key');

            if (key === itemKey) {
                return true;
            }
        }

        return false;
    },

    renderItemList: function (dropdownItems) {
        this.ListItems = dropdownItems;
        $(".search-text", this.element).val("Search");
        this.renderItems(dropdownItems);
    },

    /*
    * Render drop down items (Render anly those items what will not be exist in the existing list)
    * @param {array} dropdownItems Dropdown items what need to be rendered
    */
    renderItems: function (dropdownItems) {
        var items = $('.checkboxItem', $('.itemListitems', $(this.element))),
            isFindItem;

        // Find new items to be added
        var newItems = [];
        for (var i = 0; i < dropdownItems.length; i++) {

            var itemValue = dropdownItems[i].value;
            var itemKey = dropdownItems[i].key;

            isFindItem = this.findItem(items, itemKey);
            if (!isFindItem) {
                if (itemKey !== '') {

                    // If '#' is added to show with parent value then remove parent value for display text
                    var displayText = '';
                    if (itemValue.indexOf("#") >= 0) {
                        displayText = itemValue.substring(0, itemValue.lastIndexOf('#'));
                    }
                    else {
                        displayText = itemValue;
                    }

                    newItems.push({ key: itemKey, value: itemValue, displayText: displayText });
                }
            }
        }

        // Find old items to be removed
        var removeItems = [];
        var removeIndexs = [];
        for (var j = 0; j < items.length; j++) {

            var key = $(items[j]).attr('key');
            isFindItem = this.findItem(dropdownItems, key);
            if (!isFindItem) {
                $(items[j]).parent().remove();

                // Update the selected item
                for (var k = 0; k < this.selectedItems.length; k++) {

                    if (this.selectedItems[k].key === key) {
                        this.selectedItems.splice(k, 1);
                        break;
                    }
                }
            }
        }

        $('.itemListitems', $(this.element)).append(can.view(this.getTemplatePath(this.options.tmplItems), { isMultiSelect: this.options.isMultiSelect, items: newItems }));

        // For single dropdown, if itemlist > 0 then hide the default text
        if (dropdownItems.length > 0) {
            if (!this.options.isMultiSelect) {
                $('.single-dd-label', this.element).closest('div').hide();
            }
        }
    },

    setCascadeIndent: function () {
        var indentPadding = this.options.cascadeIndentCount * 5;
        if (this.options.cascadeIndentCount > 0) {
            $('.cascade-indent', this.element).show().css('padding-left', indentPadding);
            var controlTextWidth = this.ControlWidth - indentPadding - 5; //5 = is indent image width
            $('.text', this.element).css('max-width', controlTextWidth + 'px');
        }
        else {
            $('.cascade-indent', this.element).hide();
        }
    },

    ////Get text width to set page height
    //getTextWidth: function (text) {
    //    $('body').append("<span class='dummy-text'></span>");
    //    $('.dummy-text').html(text);
    //    var textWidth = $('.dummy-text').innerWidth();
    //    $('.dummy-text').remove();
    //    return textWidth;
    //},

    "dropdown-item-click": function (el, ev) {

        // Stop event bubling up
        ev.stopPropagation();

        var dropdownListContainerAll = $('.itemList');
        var isVisibleAnyDropDown = $(dropdownListContainerAll).is(":visible");
        if (isVisibleAnyDropDown) {
            dropdownListContainerAll.hide();
        }


        var dropdownListContainer = $('.itemList', this.element);
        var isVisible = $(dropdownListContainer).is(":visible");
        if (isVisible) {
            dropdownListContainer.hide();
        }
        else {

            // Position the dropdown list immediate below the dropdown header
            var header = $('.dropdownHeader', $(dropdownListContainer).parent());
            var bottom = $(header).position().top + $(header).height();
            dropdownListContainer.css('top', bottom + 'px');

            if (Sentrana.isiPad()) {
                this.stopDropdpwnScrollBubblingInIpad($(".itemListitems", dropdownListContainer[0])[0]);
            }

            // Show the dropdown list container
            var scrollBottom = $(window).scrollTop() + $(window).height();
            var containerTop = dropdownListContainer.parent().offset().top;
            var containerHeight = dropdownListContainer.height();
            var containerBottom = containerTop + containerHeight;

            if (Sentrana.isiPad()) {
                if (containerBottom + 90 > scrollBottom) {
                    dropdownListContainer.show().css('top', el.position().top - 263 + 'px');
                }
                else {
                    dropdownListContainer.show();
                }
            }
            else {
                if (containerBottom > scrollBottom) {
                    dropdownListContainer.show().css('top', el.position().top - 212 + 'px');
                }
                else {
                    dropdownListContainer.show();
                }
            }
        }

        // Show the dropdown list from middle of the header width
        if (!dropdownListContainer.hasClass('dropdown-list-margin-left')) {
            dropdownListContainer.addClass('dropdown-list-margin-left');
        }
    },

    /*
    * Stop scroll bubbling in iPad by saving the last touch start point & with scroll bounds
    * @param {object} scrollContainer - the htmlElement that will scroll
    * @author Md. Faroque Hossain
    */
    stopDropdpwnScrollBubblingInIpad: function (scrollContainer) {
        var allowUpScroll = true;
        var allowDownScroll = true;
        var lastTouchedStartVerticalPoint = 0;

        $(scrollContainer).off("touchstart");
        $(scrollContainer).off("touchmove");
        $(scrollContainer).off("touchend");

        scrollContainer.addEventListener('touchstart', function (event) {
            allowUpScroll = (this.scrollTop > 0);
            allowDownScroll = (this.scrollTop < this.scrollHeight - this.clientHeight);
            lastTouchedStartVerticalPoint = event.pageY;
        }, true);

        scrollContainer.addEventListener('touchmove', function (event) {
            var touchUp = (event.pageY > lastTouchedStartVerticalPoint);
            var touchDown = !touchUp;
            lastTouchedStartVerticalPoint = event.pageY;

            if ((touchUp && allowUpScroll) || (touchDown && allowDownScroll)) {
                event.stopPropagation();
            } else {
                event.preventDefault();
            }
        }, true);

        scrollContainer.addEventListener('touchend', function (event) {
            event.stopPropagation();
        }, true);
    },

    ".text click": function (el, ev) {

        // Stop event bubling up
        ev.stopPropagation();
        can.trigger(this.element, 'dropdown-item-click', [el, this.options.paramId]);
    },

    ".dropdownHeader click": function (el, ev) {
        if (!ev.target.classList.contains("collapsible-icon")) {
            can.trigger(this.element, 'dropdown-item-click', [el, this.options.paramId]);
        }
    },

    ".text mouseover": function (el, ev) {
        can.trigger(this.element, 'mouseover_dropdown_headertext', [el, this.options.paramId]);
    },

    ".text mouseleave": function (el, ev) {
        can.trigger(this.element, 'mouseleave_dropdown_headertext', [el, this.options.paramId]);
    },

    ".dropdownHeader mouseover": function (el, ev) {
        //$('.icon-down', el).show();
        can.trigger(this.element, 'mouseover_dropdown_header', [el, this.options.paramId]);
    },

    ".dropdownHeader mouseleave": function (el, ev) {
        can.trigger(this.element, 'mouseleave_dropdown_header', [el, this.options.paramId]);
    },

    //comment out because when mouse leave the name of the filter group then these event fire
    ".dropdownChecklist mouseleave": function (el, ev) {
        if (Sentrana.isiPad()) {
            $('.itemList', this.element).hide();
        }
    },

    ".itemList mouseenter": function (el, ev) {
        //clear timeout if any delay already added
        window.clearTimeout(this.filterTimer);
    },

    ".itemList mouseleave": function (el, ev) {

        //add 1 sec delay to hide drop down item list
        this.dropdownListTimeout();


    },

    ".search-text focus": function (el, ev) {
        if (el.val().toLowerCase() === "search") {
            el.val("");
        }
    },

    ".search-text blur": function (el, ev) {
        if (el.val() === "") {
            el.val("Search");
        }
    },

    ".search-text keypress": function (el, ev) {
        // Need to keep it for getting current text while eventing keyup.
    },

    ".search-text keyup": function (el, ev) {

        var searchText = el.val(),
            dropdownItems = this.ListItems;

        // Render filtered items
        this.filterSearchedItems(dropdownItems, searchText);
    },

    /*
    * Shown only Filtered Items by a searched text
    * @param {array} items main item list
    * @param {text} searchText Search text
    */
    filterSearchedItems: function (items, searchText) {

        if (searchText.length > 0) {
            $(".itemListitems", this.element).find("div").hide();
            $('div.drop-item[rel*="' + searchText.toLowerCase() + '"]', $('.itemListitems', $(this.element))).show();
        } else {
            $(".itemListitems", this.element).find("div").show();
        }
    },

    dropdownListTimeout: function () {

        if (Sentrana.isiPad()) {
            $('.itemList', this.element).hide();
        } else {
            var that = this;
            this.filterTimer = setTimeout(function () {
                $('.itemList', that.element).hide();
            }, (Sentrana.Common.Settings.DROPDOWN_HIDE_DELAY_TIME || 1000));
        }


    },

    ".checkboxItem click": function (el, ev) {

        // Set the selected checkbox item's text
        this.setDisplayText();
    },

    ".checkbox-label click": function (el, ev) {

        // For single select dropdown, when click/select an item then first clear all previously selected items
        if (!this.options.isMultiSelect) {
            this.clearValue();

            // Remove previous selection
            $('.checkbox-label', this.element).removeClass('dd-item-selected');

            // Select current item
            el.addClass('dd-item-selected');

            // Hide the dropdown container
            $('.itemList', this.element).hide();
        }

        // Check/Uncheck by clicking the checkbox's label
        var checkbox = $('input:checkbox', el.parent());
        if (checkbox.prop('checked')) {
            checkbox.prop('checked', false);
        } else {
            checkbox.prop('checked', true);
        }

        // Highlight selected item label
        this.select_deselect_checkboxLabel(checkbox);

        // For 'All', check/uncheck all items
        if (checkbox.hasClass('checkboxAll')) {
            $('.checkboxAll', el.parent()).change();
        }
        else {
            // If all items are checked then check 'All' otherwise uncheck 'All'
            var isAllChecked = true;
            var chekboxItems = $(".checkboxItem", this.element);
            for (var i = 0; i < chekboxItems.length; i++) {
                var checkboxItem = chekboxItems[i];
                if (!$(checkboxItem).is(':checked')) {
                    isAllChecked = false;
                    break;
                }
            }

            // Check/Uncheck all checkbox items
            this.$chekboxAll.prop('checked', isAllChecked);
            // Highlight selected item ALL
            this.select_deselect_checkboxLabel(this.$chekboxAll);
        }

        // Set the selected checkbox item's text
        this.setDisplayText();
    },

    ".checkboxAll change": function () {
        var isChecked = this.$chekboxAll.is(':checked');
        var chekboxItems = $(".checkboxItem", this.element);
        var text = this.$dropdownText;
        var separator = ',';

        // Check/Uncheck all items
        chekboxItems.prop('checked', isChecked);

        // Highlight selected item label
        this.select_deselect_checkboxLabel(this.$chekboxAll);

        // Set the selected checkbox item's text
        this.setDisplayText();
    },

    ".checkboxItem change": function () {
        var chekboxItems = $(".checkboxItem", this.element);

        // If all items are checked then check 'All' otherwise uncheck 'All'
        var isAllChecked = true;
        for (var i = 0; i < chekboxItems.length; i++) {
            var checkboxItem = chekboxItems[i];
            if (!$(checkboxItem).is(':checked')) {
                isAllChecked = false;
            }

            // Highlight selected item label
            this.select_deselect_checkboxLabel(checkboxItem);
        }

        // Check/Uncheck all checkbox items
        this.$chekboxAll.prop('checked', isAllChecked);
        // Highlight selected item label
        this.select_deselect_checkboxLabel(this.$chekboxAll);

    },

    select_deselect_checkboxLabel: function (checkboxItem) {

        if ($(checkboxItem).is(':checked')) {
            $('.checkbox-label', $(checkboxItem).closest('div')).addClass('dd-item-selected');
        }
        else {
            $('.checkbox-label', $(checkboxItem).closest('div')).removeClass('dd-item-selected');
        }
    },

    select_deselect_AllCheckbox: function () {

        var isAllChecked = true;
        var chekboxItems = $(".checkboxItem", this.element);
        for (var i = 0; i < chekboxItems.length; i++) {
            var checkboxItem = chekboxItems[i];
            if (!$(checkboxItem).is(':checked')) {
                isAllChecked = false;
                break;
            }
        }

        // Check/Uncheck all checkbox items
        this.$chekboxAll.prop('checked', isAllChecked);
        if (isAllChecked) {
            // Highlight selected item label
            this.select_deselect_checkboxLabel(this.$chekboxAll);
        }
    },

    getValue: function (hasChild) {
        var selectedValues = '';
        var ignoreParamValue = this.$chekboxAll.is(':checked') && !hasChild;

        if (!ignoreParamValue) {
            for (var i = 0; i < this.selectedItems.length; i++) {
                if (i === 0) {
                    selectedValues = this.selectedItems[i].key;
                }
                else {
                    selectedValues = selectedValues + '~' + this.selectedItems[i].key;
                }
            }
        }        

        return selectedValues;
    },
    
    getText: function () {
        var selectedItemText = [];

        for (var i = 0; i < this.selectedItems.length; i++) {
            selectedItemText.push(this.selectedItems[i].value);
        }

        return selectedItemText;
    },

    getDisplayText: function () {
        var selectedItemText = [];

        for (var i = 0; i < this.selectedItems.length; i++) {

            var itemValue = this.selectedItems[i].value;

            // If '#' is added to show with parent value then remove parent value for display text
            var displayText = '';
            if (itemValue.indexOf("#") >= 0) {
                displayText = itemValue.substring(0, itemValue.lastIndexOf('#'));
            }
            else {
                displayText = itemValue;
            }

            selectedItemText.push(displayText);
        }

        return selectedItemText;
    },

    setValue: function (values, isDefaultValue) {

        if (!values) { return; }
        var valueList = values.split('~');

        for (var j = 0; j < valueList.length; j++) {
            var value = valueList[j];

            var chekboxItems = $(".checkboxItem", this.element);
            for (var i = 0; i < chekboxItems.length; i++) {
                var checkboxItem = chekboxItems[i];
                var itemValue = $(checkboxItem).attr('key');
                itemValue = ( itemValue.indexOf('#') !== -1 ) ? itemValue.substr(0, itemValue.lastIndexOf("#")) : itemValue;

                if (itemValue === value) {

                    // Select the checkbox
                    $(checkboxItem).attr('checked', 'checked');

                    // Highlight selected item label
                    this.select_deselect_checkboxLabel(checkboxItem);
                    break;
                }
            }
        }

        // When select item by default value, if all items are selected then 'All' checkbox item must be checked
        if (isDefaultValue) {
            this.select_deselect_AllCheckbox();
        }

        this.setDisplayText(isDefaultValue);
    },

    clearValue: function () {

        // Clear selected Items and dropdown text
        this.selectedItems = [];
        /*this.$dropdownText.html('');*/

        // Set the default display text
        /*this.setDefaultDisplayText();*/

        // Clear checkboxItem and checkboxAll
        var chekboxItems = $(".checkboxItem", this.element);
        var chekboxAll = $(".checkboxAll", this.element);
        $(chekboxAll).removeAttr('checked');
        $(chekboxItems).removeAttr('checked');
    },

    removeItems: function () {
        // Remove all items except 'All'
        $('.itemListitems', $(this.element)).find('div:gt(0)').remove();

        var chekboxAll = $(".checkboxAll", this.element);
        // Highlight selected item label
        this.select_deselect_checkboxLabel(chekboxAll);
    },

    getItemCount: function () {
        var allItems = $('.checkboxItem', this.element);
        if (allItems) {
            return allItems.length;
        }
        else {
            return 0;
        }
    },

    setDisplayText: function (isDefaultValue) {

        var chekboxItems = $(".checkboxItem", this.element);
        var separator = ',';

        // Clear the text & items array
        /*this.$dropdownText.html('');*/
        this.selectedItems = [];

        // Show all checkbox item's text to the span
        for (var i = 0; i < chekboxItems.length; i++) {
            var checkboxItem = chekboxItems[i];

            var isChecked = $(checkboxItem).is(':checked');

            if (isChecked) {
                var value = $(checkboxItem).val();
                var key = $(checkboxItem).attr('key');

                // Add selected items to array
                this.selectedItems.push({ key: key, value: value });

                /*// Set dropdown text
                if (this.$dropdownText.html() !== '') {
                this.$dropdownText.append(separator + value);
                }
                else {
                this.$dropdownText.append(value);
                }*/
            }

            // Highlight selected item label
            this.select_deselect_checkboxLabel(checkboxItem);
        }

        // Shortern the text
        var that = this;

        /*var textLength = this.$dropdownText.html().length;
        if (textLength > this.$maxTextLength) {
        this.$dropdownText.html(that.$dropdownText.html().substring(0, this.$maxTextLength) + '...');
        }*/

        // Set the hidden field. If it is a default value we dont store it into hidden field because
        // we are not fire the change event while setting default value.
        if (!isDefaultValue) {

            //Wait for a specific time for clicking checkbox items
            var clickCount = this.itemClickCount + 1;
            this.itemClickCount = clickCount;

            // Fire hidden field's change event (.lookup change).
            // this event change is catch from layout controller and populate the report elements.
            if (!this.options.isMultiSelect) {
                that.$hiddenText.val('').change();
            }
            else {

                setTimeout(function () {
                    if (that.itemClickCount === clickCount) {
                        that.$hiddenText.val('').change();
                    }
                }, this.options.itemClickDelay);
            }
        }

        // Set the default text, if there are no selected items
        /*this.setDefaultDisplayText();*/

    },

    /*setDefaultDisplayText: function () {
    if (this.$dropdownText.html() === '') {
    this.$dropdownText.html(this.options.defaultText);
    }
    },*/

    // Instance method: Get the path to a template file...
    getTemplatePath: function RG_getTemplatePath(templateFile) {
        var parts = [];

        // Do we have a basePath?
        if (this.options.basePath) {
            parts.push(this.options.basePath);

            // Did our path NOT end in a slash?
            if (!/\/$/.test(this.options.basePath)) {
                parts.push("/");
            }
        }

        // Do we have a templatesPath?
        if (this.options.templatesPath) {
            parts.push(this.options.templatesPath);

            // Did our path NOT end in a slash?
            if (!/\/$/.test(this.options.templatesPath)) {
                parts.push("/");
            }
        }

        // Add the template file...
        parts.push(templateFile);

        return parts.join("");
    }
});
