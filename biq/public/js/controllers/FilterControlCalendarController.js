Sentrana.Controllers.FilterControl("Sentrana.Controllers.FilterControlCalendar", {
    pluginName: "sentrana_filter_control_calendar",
    defaults: {}
}, {
    // Class constructor: Called only once for all invocations of the helper method...
    init: function FCC_init() {
        // For date range index
        this.rangeIndex = 0;
        this.dateFormat = "mm/dd/yy";
        this.dateFormatCaptionText = "mm/dd/yyyy";
        this._super();
        this.rangeList = {};
        this.updateRangeMode = false;
        // no search for calendar control
        this.element.find(".accordion-search").hide();
    },

    // Instance method: Build the user interface for the Attribute Elements...
    // Initialize the tree control.
    // We are using jsTree.
    buildElementsUI: function () {
        var form = this.options.form;

        this.$filterControl.append(can.view('templates/filterCalendarContainer.ejs', {
            dateFormat: this.dateFormatCaptionText,
            hid: form.hid
        }));
        $(".date-range-list", this.$filterControl).append(can.view('templates/filterCalendar.ejs', {
            index: this.rangeIndex
        }));
        this.initCalendarControl();

        this.showHideDateFormatCaption();
    },

    showHideDateFormatCaption: function () {

        if ($(".date-range-list", this.$filterControl).children('.filterCalendarContainer').length > 0) {

            this.$filterControl.children('.dateformat').css("display", "block");
        }
        else {

            this.$filterControl.children('.dateformat').css("display", "none");
        }

    },

    '.element-filter-calendar-from change': function (el, ev) {

        var changedFromDate = el[0].value;
        var isValidDate = true;

        try {

            if ($.datepicker.parseDate(this.dateFormat, changedFromDate)) {
                this.handleFromDateChange(changedFromDate, el[0]);
            }
            else {
                isValidDate = false;
            }

        }
        catch (e) {
            isValidDate = false;
        }

        if (!isValidDate) {
            el[0].value = "";
            this.removeRangeFilter(el[0]);
        }

    },
    '.element-filter-calendar-to change': function (el, ev) {

        var changedToDate = el[0].value;
        var isValidDate = true;

        try {

            if ($.datepicker.parseDate(this.dateFormat, changedToDate)) {
                this.handleToDateChange(changedToDate, el[0]);
            }
            else {
                isValidDate = false;
            }
        }
        catch (e) {
            isValidDate = false;
        }

        if (!isValidDate) {
            el[0].value = "";
            this.removeRangeFilter(el[0]);
        }

    },

    '.hasDatepicker keypress': function (el, ev) {

        if (event.keyCode === 13) {

            $(el, this.$filterControl).datepicker().focus();
            this.toggleDatePickerVisibility(el);

            return false;
        }
        else {

            $(el, this.$filterControl).datepicker("show");
        }

        return true;
    },

    toggleDatePickerVisibility: function (inputElement) {

        if ($(inputElement, this.$filterControl).datepicker("widget").is(":visible")) {

            $(inputElement, this.$filterControl).datepicker("hide");
        }
        else {
            $(inputElement, this.$filterControl).datepicker("show");
        }
    },
    initCalendarControl: function () {
        var that = this;

        $(".element-filter-calendar-from", this.$filterControl).datepicker({
            changeMonth: true,
            changeYear: true,
            yearRange: 'c-20:c+20',
            onSelect: function (dateText, inst) {

                that.handleFromDateChange(dateText, this);

                $(this, this.$filterControl).datepicker("hide");
            },
            beforeShow: function (input, inst) {

                $("#ui-datepicker-div").hover(function () {
                    that.showDockablePanel();
                });
            }
        });

        $(".element-filter-calendar-to", this.$filterControl).datepicker({
            changeMonth: true,
            changeYear: true,
            yearRange: 'c-20:c+20',
            onSelect: function (dateText, inst) {
                that.handleToDateChange(dateText, this);

                $(this, this.$filterControl).datepicker("hide");
            },
            beforeShow: function (input, inst) {

                $("#ui-datepicker-div").hover(function () {
                    that.showDockablePanel();
                });

            }
        });

    },

    showDockablePanel: function () {

        if (!$('.dockablePanel-right').is(':visible')) {
            $('.dockablePanel-right').show(400);
        }
    },

    removeRangeFilter: function (control) {

        var index = $(control).attr("index");
        this.options.dwSelection.deselectObject(this.rangeList[index]);

        this.showHideDateFormatCaption();
    },
    handleToDateChange: function (changedToDate, control) {

        var index = $(control).attr("index");

        var fromDate = this.generateValidFromDate(changedToDate, index);

        if (fromDate) {
            this.createOrUpdateFilter(index, fromDate, changedToDate);
        }

        $(control)[0].value = changedToDate;

        $(".element-filter-calendar-from[index=" + index + "]", this.$filterControl).datepicker("option", "maxDate", changedToDate);
        $(".element-filter-calendar-from[index=" + index + "]", this.$filterControl).datepicker("setDate", fromDate);
    },

    handleFromDateChange: function (changedFromDate, control) {

        var index = $(control).attr("index");

        var upperBound = this.generateValidToDate(changedFromDate, index);

        var oldFilterObject = this.options.dwRepository.objectMap[this.rangeList[index]];

        if (upperBound && oldFilterObject) {
            // We need to update the filter
            this.updateFilter(index, changedFromDate, upperBound);
        }
        else if (upperBound) {

            //from=dateText and to=upperBound
            this.createOrUpdateFilter(index, changedFromDate, upperBound);
        }

        $(control)[0].value = changedFromDate;

        $(".element-filter-calendar-to[index=" + index + "]", this.$filterControl).datepicker("option", "minDate", changedFromDate);
        $(".element-filter-calendar-to[index=" + index + "]", this.$filterControl).datepicker("setDate", upperBound);
    },

    generateValidFromDate: function (toDate, index) {

        var fromDate = $.datepicker.formatDate(this.dateFormat, $(".element-filter-calendar-from[index=" + index + "]", this.$filterControl).datepicker("getDate"));

        if (fromDate && new Date(toDate) < new Date(fromDate)) {
            fromDate = toDate;
        }

        return fromDate;
    },
    generateValidToDate: function (fromDate, index) {

        var toDate = $.datepicker.formatDate(this.dateFormat, $(".element-filter-calendar-to[index=" + index + "]", this.$filterControl).datepicker("getDate"));

        if (toDate && new Date(toDate) < new Date(fromDate)) {
            toDate = fromDate;
        }

        return toDate;
    },
    createOrUpdateFilter: function (index, from, to) {
        var oid = this.getOid(from, to);
        var hid = this.getHid(index, oid);

        var newRangeFilter = this.options.dwRepository.createRangeFilter(
            this.options.attr.hid,
            this.options.attr.dimName,
            this.options.form.oid,
            hid,
            index,
            from,
            to);

        // Add new template unit into repository
        if (!this.rangeList[index]) {
            // Remember the control this we have created.
            this.rangeList[index] = hid;
            // Add object as selected
            this.options.dwRepository.objectMap[newRangeFilter.hid] = newRangeFilter;
            this.options.dwSelection.selectObject(newRangeFilter.hid);
        }
        else {
            // We need to update the filter
            this.updateFilter(index, from, to);
        }
    },

    getCalendarTextDate: function (dateControl) {
        return $.datepicker.formatDate(this.dateFormat, dateControl.datepicker("getDate"));
    },

    updateFilter: function (index, lowerBound, upperBound) {
        this.updateRangeMode = true;

        var oldFilterObject = this.options.dwRepository.objectMap[this.rangeList[index]];
        this.options.dwSelection.deselectObject(this.rangeList[index]);

        this.updateRangeMode = false;

        // Select new object
        var oid = this.getOid(lowerBound, upperBound);
        var hid = this.getHid(index, oid);

        this.options.dwRepository.objectMap[hid] = oldFilterObject;
        this.options.dwRepository.objectMap[hid].name = lowerBound + " - " + upperBound;
        this.options.dwRepository.objectMap[hid].oid = oid;

        this.rangeList[index] = hid;
        this.options.dwSelection.selectObject(hid);
    },

    getOid: function (lowerBound, upperBound) {
        return this.options.form.oid + ":" + lowerBound + "--" + upperBound;
    },

    getHid: function (index, oid) {
        return "hid_" + index + "_" + oid.replace(/[^a-zA-Z0-9]/g, "");
    },

    // Browser Event: What to do when a user adds a new date range...
    '.calendar-add-additional-range click': function (el, ev) {
        this.rangeIndex++;
        $(".date-range-list", this.$filterControl).append(can.view('templates/filterCalendar.ejs', {
            index: this.rangeIndex
        }));

        this.initCalendarControl();
        this.showHideDateFormatCaption();
    },

    '.date-range-close-container click': function (el, ev) {
        var $container = $(el).closest('.filterCalendarContainer');

        var $fromCalendarControl = $container.find(".element-filter-calendar-from");
        var $toCalendarControl = $container.find(".element-filter-calendar-to");
        var oid = this.getOid(this.getCalendarTextDate($fromCalendarControl), this.getCalendarTextDate($toCalendarControl));
        var index = $fromCalendarControl.attr("index");
        this.options.dwSelection.deselectObject(this.getHid(index, oid));

        $container.remove();
        this.showHideDateFormatCaption();
    },

    // Synthetic Event: What to do when the model changes state...
    "{dwSelection} change": function (dwSelectionModel, ev, attr, how, newVal, oldVal) {
        var reg = /^(.*)_(\d*)_([a-zA-z]*)(\d*)$/;
        var match = reg.exec(attr);

        if (match) {

            var index = parseInt(match[2], 10);
            var formoid = this.options.form.oid.replace(/[^a-zA-Z0-9]/g, "");

            if (match[3] != formoid) {
                // To make sure this model update is for THIS filter control.
                return;
            }
            if (how === "add") {
                // If we already have the control created, we don't need to add it again.
                // Otherwise, we will need to create the control. This happens when we open an saved report.
                if (!this.rangeList[index]) {
                    var regDateRange = /(\w*)\:(.{10})\-\-(.{10})$/;
                    var oid = this.options.dwRepository.objectMap[attr].oid;

                    var dateFrom = regDateRange.exec(oid)[2];
                    var dateTo = regDateRange.exec(oid)[3];

                    // Create new date range control
                    // We will need to create these controls
                    $(".date-range-list", this.$filterControl).append(can.view('templates/filterCalendar.ejs', {
                        index: index
                    }));
                    this.initCalendarControl();
                    var $fromCalendarControl = this.$filterControl.find('.element-filter-calendar-from[index=' + index + ']', '.' + this.options.form.hid);
                    var $toCalendarControl = this.$filterControl.find('.element-filter-calendar-to[index=' + index + ']', '.' + this.options.form.hid);

                    // set the date.
                    $fromCalendarControl.datepicker("setDate", dateFrom);
                    $toCalendarControl.datepicker("setDate", dateTo);

                    // Add filter into the range list.
                    this.createOrUpdateFilter(index, dateFrom, dateTo);
                    // Make the range index correct so that the index will be correct if we add a new control here.
                    this.rangeIndex = index + 1;
                }
            }
            else if (how === "remove") {

                if (this.updateRangeMode) {
                    return;
                }
                // Following is the handling for Calendar control
                // We need to remove the related calendar control if we remove the date range related filters
                // Find the calendar control
                var $dateRangeControl = this.$filterControl.find('.element-filter-calendar-from[index=' + index + ']', '.' + this.options.form.hid);
                $dateRangeControl.closest('.filterCalendarContainer').remove();
            }
        }
        this.showHideDateFormatCaption();
    }
});
