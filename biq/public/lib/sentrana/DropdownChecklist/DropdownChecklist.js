
can.Control.extend("Sentrana.Controllers.LocalDropdownChecklist", {
    pluginName: 'sentrana_local_dropdown_checklist',
    defaults: {
        basePath: "lib/sentrana/DropdownChecklist",
        templatesPath: "templates",
        tmplInit: "DropdownChecklist.ejs",
        tmplItems: "DropdownItems.ejs",
        defaultText: "",
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
        this.$checkboxAll = $(".checkboxAll", this.element);
        this.$dropdownText = $('.dropdownHeaderL div.text', this.element);
        this.$hiddenText = $('.lookupLocal', this.element);
        this.$maxTextLength = 50;
        this.selectedItems = [];
        this.itemClickCount = 0;

        // Set the default text
        this.$dropdownText.html(this.options.defaultText);
    },

    updateView: function () {
        this.renderDropdown();
    },

    renderDropdown: function () {

        // Render dropdown
        this.$container.html(can.view(this.getTemplatePath(this.options.tmplInit), { lookupData: [] }));

        // Render dropdown items
        if (this.options.dropdownItems) {
            this.renderItemList(this.options.dropdownItems);
        }
    },

    renderItemList: function (dropdownItems) {
        var items = $('.checkboxItem', $('.itemListL', $(this.element))),
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

        $('.itemListL', $(this.element)).append(can.view(this.getTemplatePath(this.options.tmplItems), { items: newItems }));
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

    ////renderItemList: function (dropdownItems) {

    ////    var ddItems = [];
    ////    for (var i = 0; i < dropdownItems.length; i++) {

    ////        var itemValue = dropdownItems[i].value;
    ////        var itemKey = dropdownItems[i].key;
    ////        var displayText = '';

    ////        // If '#' is added to show with parent value then remove parent value for display text
    ////        if (itemValue.indexOf("#") >= 0) {
    ////            displayText = itemValue.substring(0, itemValue.lastIndexOf('#'));
    ////        }
    ////        else {
    ////            displayText = itemValue;
    ////        }

    ////        ddItems.push({ key: itemKey, value: itemValue, displayText: displayText });
    ////    }
    ////    var $itemList = $('.itemListL', $(this.element));
    ////    var $defaultItem = $('li:first', $itemList);
    ////    /* Ensure that item list is rendered anew rather than simply appended. Logic is included to keep default item if it exists */
    ////    if ($defaultItem.length) {
    ////        $defaultItem.nextAll().remove();
    ////        $defaultItem.after(can.view(this.getTemplatePath(this.options.tmplItems), { items: ddItems }));
    ////    } else {
    ////        $itemList.html(can.view(this.getTemplatePath(this.options.tmplItems), { items: ddItems }));
    ////    }
    ////},

    ".dropdownChecklist click": function (el, ev) {
        var dropdownListContainerAll = $('.itemListL');
        var dropdownListContainer = $('.itemListL', this.element);

        var isVisible = $(dropdownListContainer).is(":visible");
        if (isVisible) {
            $(dropdownListContainer).hide();
        }
        else {
            var isVisibleAnyDropDown = $(dropdownListContainerAll).is(":visible");
            if (isVisibleAnyDropDown) {
                dropdownListContainerAll.hide();
            }
            dropdownListContainer.width(dropdownListContainer.parent().parent().width() - 2);
            $(dropdownListContainer).show();

            //var itemlength = $('.itemListL li', this.element).length;
            //$('.itemListL', $(this.element)).css('height', itemlength * 25 + 14 + "px");
        }
    },

    ".dropdownChecklist mouseleave": function (el, ev) {
        //$('.itemListL', this.element).hide();
    },

    ".itemListL mouseenter": function (el, ev) {
        //clear timeout if any delay already added
        window.clearTimeout(this.filterTimer);
    },

    ".itemListL mouseleave": function (el, ev) {
        if (!Sentrana.isiPad()) {
            this.dropdownCheckListTimeout();
        }
    },

    dropdownCheckListTimeout: function () {
        var that = this;
        this.filterTimer = setTimeout(function () {
            $('.itemListL', that.element).hide();
        }, (Sentrana.Common.Settings.DROPDOWN_HIDE_DELAY_TIME || 1000));

    },

    ".checkboxItem click": function (el, ev) {

        // Set the selected checkbox item's text
        this.setDisplayText();
    },

    //"li click": function (el, ev) {

    //    // Check/Uncheck by clicking the checkbox's label
    //    var checkbox = $('input:checkbox', el);
    //    if (checkbox.prop('checked')) {
    //        checkbox.prop('checked', false);
    //    } else {
    //        checkbox.prop('checked', true);
    //    }
    //    // For 'All', check/uncheck all items
    //    if (checkbox.hasClass('checkboxAll')) {
    //        $('.checkboxAll', el.parent()).change();
    //    }
    //    else {
    //        // If all items are checked then check 'All' otherwise uncheck 'All'
    //        var isAllChecked = true;
    //        var checkboxItems = $(".checkboxItem", this.element);
    //        for (var i = 0; i < checkboxItems.length; i++) {
    //            var checkboxItem = checkboxItems[i];
    //            if (!$(checkboxItem).is(':checked')) {
    //                isAllChecked = false;
    //                break;
    //            }
    //        }

    //        // Check/Uncheck all checkbox items
    //        this.$checkboxAll.prop('checked', isAllChecked);
    //    }

    //    // Set the selected checkbox item's text
    //    this.setDisplayText();
    //},

    ".checkboxAll change": function (el, ev) {
        var isChecked = this.$checkboxAll.is(':checked');
        var checkboxItems = $(".checkboxItem", this.element);
        var text = this.$dropdownText;
        var separator = ',';

        // Clear the span
        text.html('');

        // Check/Uncheck all items
        if (isChecked) {
            checkboxItems.prop('checked', isChecked);
        } else {
            checkboxItems.removeAttr('checked');
            text.html('');
        }

        // Set the selected checkbox item's text
        this.setDisplayText();
    },

    ".checkboxItem change": function () {
        var checkboxItems = $(".checkboxItem", this.element);
        var isAllChecked = true;

        for (var i = 0; i < checkboxItems.length; i++) {
            var checkboxItem = checkboxItems[i];
            if (!$(checkboxItem).is(':checked')) {
                isAllChecked = false;
                break;
            }
        }

        if (isAllChecked) {
            this.$checkboxAll.prop('checked', true);
        }
        else {
            this.$checkboxAll.removeAttr('checked');
        }
    },

    getValue: function (hasChild) {
        var selectedValues = '';
        var ignoreParamValue = this.$checkboxAll.is(':checked') && !hasChild;
        
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
    
    setValue: function (values, isDefaultValue) {

        var valueList = values.split('~');

        for (var j = 0; j < valueList.length; j++) {
            var value = valueList[j];

            var checkboxItems = $(".checkboxItem", this.element);
            for (var i = 0; i < checkboxItems.length; i++) {
                var checkboxItem = checkboxItems[i];
                var itemValue = $(checkboxItem).attr('key');
                itemValue = (itemValue.indexOf('#') !== -1) ? itemValue.substr(0, itemValue.lastIndexOf("#")) : itemValue;

                if (itemValue === value) {
                    $(checkboxItem).attr('checked', 'checked');
                    break;
                }
            }
        }

        this.setDisplayText(isDefaultValue);
    },

    clearValue: function () {

        // Clear selected Items and dropdown text
        this.selectedItems = [];
        this.$dropdownText.html('');

        // Set the default display text
        this.setDefaultDisplayText();

        // Clear checkboxItem and checkboxAll
        var checkboxItems = $(".checkboxItem", this.element);
        var checkboxAll = $(".checkboxAll", this.element);
        $(checkboxAll).removeAttr('checked');
        $(checkboxItems).removeAttr('checked');
    },

    removeItems: function () {
        // Remove all items except 'All'
        $('.itemListL', $(this.element)).find('div:gt(0)').remove();
    },

    setDisplayText: function (isDefaultValue) {

        var checkboxItems = $(".checkboxItem", this.element);
        var separator = ',';

        // Clear the text & items array
        this.$dropdownText.html('');
        this.selectedItems = [];

        // Show all checkbox item's text to the span
        for (var i = 0; i < checkboxItems.length; i++) {
            var checkboxItem = checkboxItems[i];

            var isChecked = $(checkboxItem).is(':checked');

            if (isChecked) {
                var value = $(checkboxItem).val();
                var key = $(checkboxItem).attr('key');

                // Add selected items to array
                this.selectedItems.push({ key: key, value: value });

                // Display text
                var displayText = '';
                if (value.indexOf("#") >= 0) { // If '#' is added to show with parent value then remove parent value for display text
                    displayText = value.substring(0, value.lastIndexOf('#'));
                }
                else {
                    displayText = value;
                }

                // Set dropdown text
                if (this.$dropdownText.html() !== '') {
                    this.$dropdownText.append(separator + displayText);
                }
                else {
                    this.$dropdownText.append(displayText);
                }                
            }            
        }

        // Shortern the text
        var that = this;

        var textLength = this.$dropdownText.html().length;
        if (textLength > this.$maxTextLength) {
            this.$dropdownText.html(that.$dropdownText.html().substring(0, this.$maxTextLength) + '...');
        }

        // Set the hidden field. If it is a default value we dont store it into hidden field because
        // we are not fire the change event while setting default value.
        if (!isDefaultValue) {

            //Wait for a specific time for clicking checkbox items
            var clickCount = this.itemClickCount + 1;
            this.itemClickCount = clickCount;

            setTimeout(function () {
                if (that.itemClickCount === clickCount) {

                    // Fire hidden field change event (.lookupLocal change)
                    that.$hiddenText.val(that.$dropdownText.html()).change();
                }
            }, this.options.itemClickDelay);
        }

        // Set the default text, if there are no selected items
        this.setDefaultDisplayText();

    },

    setDefaultDisplayText: function () {
        if (this.$dropdownText.html() === '') {
            this.$dropdownText.html(this.options.defaultText);
        }
    },

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
    } /*,

    "{window} mouseup": function (element, event) {
        var itemListDiv = $(event.target).parent().closest('.itemListL');
        if (itemListDiv && itemListDiv.length === 0) {
            event.preventDefault();
            event.stopPropagation();
            var isVisible = $('.itemListL', this.element).is(':visible');
            if (isVisible) {
                $('.itemListL', this.element).hide();
            }
        }
    }*/
});
