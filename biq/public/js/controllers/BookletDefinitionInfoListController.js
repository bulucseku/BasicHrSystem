/*..............Sentrana.Controllers.BookletDefinitionInfoList.................*/

can.Control.extend("Sentrana.Controllers.BookletDefinitionInfoList", {
    pluginName: 'sentrana_booklet_definition_info_list',
    defaults: {
        app: null,
        bookletsModel: null
    }
}, {

    init: function RDILC_init() {
        this.loadDomElement();
        this.options.bookletsModel.getSavedBooklets();
    },

    updateBookletList: function (bookletModel) {

        this.$loading.hide();
        this.$bookletList.empty();

        var groupName = "",
            that = this,
            entries = this.options.bookletsModel.getList();

        var groupContainerDic = {};

        if (this.searchValue) {
            entries = $.grep(entries, function (reports, index) {
                return reports.attr("booklet").attr("name").toLowerCase().indexOf(that.searchValue.toLowerCase()) > -1 ||
                    reports.attr("booklet").attr("createUser").toLowerCase().indexOf(that.searchValue.toLowerCase()) > -1 ||
                    Sentrana.formatDateValue(new Date(reports.attr("booklet").attr("createDate")), "MM/dd/yyyy").toLowerCase().indexOf(that.searchValue.toLowerCase()) > -1;
            });
        }

        var userInfo = that.options.app.retrieveUserInfo();

        //when session is out then go to the login page.
        if (!userInfo) {
            Sentrana.FirstLook.closeSession("timeout");
            return;
        }

        $.each(entries, function (index, obj) {
            var booklet = obj.booklet;
            if (booklet.groupName != groupName) {
                groupName = booklet.groupName;

                var nameWithOutSpecialChar = groupName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');

                that.$bookletList.append('<div class="booklet-list-grp-' + nameWithOutSpecialChar + '"></div>');
                var groupContainer = $('.booklet-list-grp-' + nameWithOutSpecialChar).sentrana_side_bar_collapsible_container({
                    title: groupName,
                    showHeader: true,
                    showBorder: true,
                    allowCollapsible: true,
                    callBackFunctionOnExpand: function () {
                        that.options.app.handleUserInteraction();
                    },
                    callBackFunctionOnCollapse: function () {
                        that.options.app.handleUserInteraction();
                    }
                }).control().getContainerPanel();

                groupContainerDic[groupName] = groupContainer;
            }

            var isSelected = false;

            if (bookletModel && booklet.id === bookletModel.id) {
                isSelected = true;
            }

            $(groupContainerDic[groupName]).append(can.view("templates/bookletEntry.ejs", {
                bookletInfo: booklet,
                userInfo: userInfo,
                isSelected: isSelected
            }));

            $('.booklet-entry[booklet-id="' + booklet.id + '"]', that.element).sentrana_booklet_definition_info({
                app: that.options.app,
                bookletModel: booklet
            });

        });

        if (entries.length) {
            this.$hasBooklets.show();
            this.$noBooklets.hide();
            this.resizeElements();
        }
        else {
            if (!this.searchValue) {
                this.$noBooklets.show();
                this.$hasBooklets.hide();
            }
        }

        this.element.trigger("booklet_list_updated");

    },

    resizeElements: function resizeElements() {
        var offset = this.$bookletList.offset(),
            windowHeight = $(window).height(),
            windowWidth = $(window).width(),
            $footer = $(".footer"),
            footerHeight = $footer.outerHeight(true);

        // Resize the report list to fill the window. Must account for scroll bar height...			
        //this.$reportList.height(windowHeight - offset.top - footerHeight);
    },

    searchReports: function (el) {
        this.searchValue = $(el).val();
        this.updateBookletList();
    },

    "{window} resize": function (el, evl) {
        this.resizeElements();
    },

    ".sort-field click": function (el, ev) {
        this.options.bookletsModel.changeSortField(el.attr('field'));

        //set the selected item action
        //clear all active items first
        this.element.find('.sort-field').parent().removeClass('active');
        el.parent().addClass('active');

        this.element.trigger("show_comment_stream", null);
        this.element.trigger("clear_center_panel");
    },

    ".sort-order click": function (el, ev) {
        ev.preventDefault();
        this.options.bookletsModel.toggleSortOrder();
    },

    ".accordion-search-input keyup": function (el, ev) {
        this.searchReports(el);
        this.element.trigger("show_comment_stream", null);
        this.element.trigger("clear_center_panel");
    },

    "{bookletsModel} change": function (bookletsModel, ev, attr, how, newVal, oldVal) {

        if (bookletsModel.ignoreChange) {
            return;
        }

        switch (attr) {
        case "asc":
            this.updateBookletList();
            break;
        case "field":
            this.updateBookletList();
            break;
        case "count":
            // Do we have a positive count?
            if (newVal >= 0) {
                this.$bookletCount.text(newVal);
                this.updateBookletList();
                this.element.trigger("show_shared_booklet");

            }
            else if (newVal === -2) {
                // Error!
                this.$loading.html("<p>Your saved booklets could not be loaded. Please check your Internet connection and try again. If the problem persists, notify your Sentrana administrator.</p>");
            }
            break;
        default:
            break;
        }
    },

    loadDomElement: function () {

        this.element.html(can.view("templates/bookletListLayout.ejs", {
            model: this.options.bookletsModel
        }));

        this.$bookletList = this.element.find(".booklet-list");
        this.$bookletCount = this.element.find(".booklet-count");
        this.$noBooklets = this.element.find(".no-booklets");
        this.$hasBooklets = this.element.find(".has-booklets");
        this.$loading = this.element.find(".loading");

    },

    " booklet:date_change": function (el, ev) {
        this.updateBookletList();
    },

    "{Sentrana.Models.Booklet} destroyed": function (el, ev, model) {
        this.options.bookletsModel.removeBooklet(model);
    },

    "{Sentrana.Models.Booklet} created": function (cls, ev, bookletModel) {
        this.options.bookletsModel.addBooklet(bookletModel);
    },

    "{Sentrana.Models.Booklet} updated": function (cls, ev, bookletModel) {
        this.updateBookletList(bookletModel);
    }
});
