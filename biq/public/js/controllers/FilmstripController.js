can.Control.extend("Sentrana.Controllers.FilmstripController", {

    pluginName: 'sentrana_filmstrip',
    defaults: {
        mode: 'write'
    }
}, {
    init: function () {
        this.app = this.options.app;
        this.$filmstrip = this.element.find('.jcarousel');
        this.$prevNav = this.element.find('.prev-navigation');
        this.$nextNav = this.element.find('.next-navigation');
        this.isRendered = false;
    },

    setBookletDefinModel: function (bookletDefinModel, mode) {
        var that = this;

        //overwrite the mode if exists
        if (mode) {
            this.options.mode = mode;
        }

        if (this.isRendered) {
            this.removeFilmstrip();
        }

        this.bookletDefinModel = bookletDefinModel;
        // Bind specific changes in the Execution Monitor Model to the Report Definition Model...
        this.bookletDefinModel.bind("change", function (ev, attr, how, newVal, oldVal) {
            if (attr === "count" || attr === "itempos") {
                that.removeFilmstrip();
                that.renderStrip();

                //set selected                
                that.setFilmstripItemSelected(that.bookletDefinModel.selectedReportPos);
            }
            else if (attr === "selreportpos") {
                that.setFilmstripItemSelected(that.bookletDefinModel.selectedReportPos);
            }
        });
        this.renderStrip();
    },

    renderStrip: function () {
        var that = this;
        var filmstripItems = [];

        if (this.bookletDefinModel) {
            filmstripItems = this.bookletDefinModel.getBookletReports();
        }

        this.$filmstrip.empty();
        var $filmstrimList = this.$filmstrip.append('<ul/>').find('ul');

        $.when($filmstrimList.html(can.view('templates/filmstrip.ejs', {
            "filmstripItems": filmstripItems
        }))).done(function () {
            that.$filmstrip.jcarousel();
            that.isRendered = true;
            that.makeFilmstripItemsSortable();
            that.showHideNextPrevNavigator();
        });
    },

    showHideNextPrevNavigator: function () {
        if (this.isRendered) {
            this.$prevNav.hide();
            this.$nextNav.hide();

            if (!this.isAllItemFullyVisible()) {
                this.$prevNav.show();
                this.$nextNav.show();
            }
        }
    },

    makeFilmstripItemsSortable: function () {
        var that = this;
        var $filmstripItems = $('ul', this.$filmstrip);

        if (this.options.mode === 'write') {
            // Make the template units "sortable"
            $filmstripItems.sortable({
                containment: ".navigation",
                axis: 'x',
                opacity: 0.75,
                forcePlaceholderSize: true,
                helper: 'clone',
                placeholder: "filmstrip-drag-placeholder",
                revert: 100,
                start: function (event, ui) {
                    var startPos = ui.item.index();
                    ui.item.data('startPos', startPos);
                },
                stop: function (event, ui) {
                    var startPos = ui.item.data('startPos');
                    var endPos = ui.item.index();
                    if (startPos !== endPos) {
                        that.bookletDefinModel.changeReportPositionInBooklet(startPos, endPos);
                    }
                }
            });
        }
    },

    reloadFilmstrip: function () {
        this.$filmstrip.jcarousel('reload');
    },

    removeFilmstrip: function () {
        var isAlreadyLoaded = this.$filmstrip.attr('data-jcarousel');
        if (isAlreadyLoaded) {
            this.$filmstrip.jcarousel('destroy');
            this.isRendered = false;
        }
    },

    removeFilmstripItem: function (pos) {
        var target = this.$filmstrip.jcarousel.find('li:eq(' + pos + ')');
        target.remove();
        this.$filmstrip.jcarousel('reload');
    },

    isAllItemFullyVisible: function () {
        this.reloadFilmstrip();

        var visible = true;
        var fullyvisible = this.$filmstrip.jcarousel('fullyvisible');
        var items = this.$filmstrip.jcarousel('items');

        if (fullyvisible && items) {
            if (items.length === fullyvisible.length) {
                visible = true;
            }
            else {
                visible = false;
            }
        }

        return visible;
    },

    setFilmstripItemSelected: function (pos) {
        var listItem;
        var items = this.$filmstrip.jcarousel('items');

        listItem = items[pos];

        if (listItem) {
            //if not visible then scroll to show it
            if (this.$filmstrip.jcarousel('fullyvisible').index(listItem) < 0) {
                //Scrolls to the item at the given index
                this.$filmstrip.jcarousel('scroll', pos);
            }

            var $filmstripItem = $(listItem).find('.filstripitem');

            //Reset previous selected
            this.element.find(".filstripitem").not($filmstripItem).removeClass('selected');
            $filmstripItem.addClass('selected');
        }
    },

    show: function () {
        $('.btn-show-hide-filmstrip-caption').text('Hide Filmstrip');
        $(this.element).show();
        this.showHideNextPrevNavigator();
    },

    hide: function () {
        $('.btn-show-hide-filmstrip-caption').text('Show Filmstrip');
        $(this.element).hide();
    },

    ".filstripitem mouseover": function (el) {
        if (this.options.mode === 'write') {
            $(el).find('.filmstrip-item-removebutton').show();
        }
    },

    ".filstripitem mouseleave": function (el) {
        $(el).find('.filmstrip-item-removebutton').hide();
    },

    ".filstripitem click": function (el) {
        var pos = el.attr('pos') * 1;
        this.bookletDefinModel.setBookletReportSelected(pos);
    },

    ".prev-navigation click": function () {
        if (this.$filmstrip.jcarousel('items').length > 0) {
            this.$filmstrip.jcarousel('scroll', '-=1');
        }
    },

    ".next-navigation click": function () {
        if (this.$filmstrip.jcarousel('items').length > 0) {
            this.$filmstrip.jcarousel('scroll', '+=1');
        }
    },

    ".filmstrip-item-removebutton click": function (el, event) {
        event.stopPropagation();
        var pos = el.attr('pos') * 1;
        this.bookletDefinModel.removeReportFromBooklet(pos);
    },

    "{window} resize": function (el, ev) {
        this.showHideNextPrevNavigator();
    }
});
