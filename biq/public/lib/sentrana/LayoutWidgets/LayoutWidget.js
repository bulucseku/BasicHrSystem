can.Control.extend("Sentrana.Controllers.LayoutWidget", {
    pluginName: 'sentrana_layout_widget',
    defaults: {
        app: null,
        colapsed: true,
        fixedMenu: false,
        leftMenus: null,
        rightMenus: null
    }
}, {

    init: function () {
        this.updateView();
    },

    updateView: function () {
        this.element.html(can.view('lib/sentrana/LayoutWidgets/templates/layout-widget.ejs', { leftMenus: this.options.leftMenus, rightMenus: this.options.rightMenus, caller: this }));
        this.$leftMenu = this.element.find('.layout-widget-menu-left');
        this.$rightMenu = this.element.find('.layout-widget-menu-right');
        this.$leftMenuBg = this.element.find('.layout-widget-menu-bg-left');
        this.$rightMenuBg = this.element.find('.layout-widget-menu-bg-right');
        this.$leftMenuToggle = this.element.find('.layout-widget-menu-toggle-left');
        this.$rightMenuToggle = this.element.find('.layout-widget-menu-toggle-right');

        if (this.options.colapsed) {
            this.setExpandColapseClass(true, "mmc");
            this.setExpandColapseClass(false, "mmc");

            if (this.options.leftMenus && this.options.leftMenus.length > 0) {
                this.element.find(".layout-widget-wrapper").addClass("mmcl");
            }

            if (this.options.rightMenus && this.options.rightMenus.length > 0) {
                this.element.find(".layout-widget-wrapper").addClass("mmcr");
            }
            
        } else {
            this.setExpandColapseClass(true, "mme");
            this.setExpandColapseClass(false, "mme");

            if (this.options.leftMenus && this.options.leftMenus.length > 0) {
                this.element.find(".layout-widget-wrapper").addClass("mmel");
            }

            if (this.options.rightMenus && this.options.rightMenus.length > 0) {
                this.element.find(".layout-widget-wrapper").addClass("mmer");
            }
        }

        if (this.options.fixedMenu) {
            this.$leftMenuToggle.hide();
            this.$rightMenuToggle.hide();
        } else {
            this.setTitleForToggleButton();
        }
        
    },

    setExpandColapseClass: function(left, cls) {
        if (left) {
            this.$leftMenu.removeClass("mmc mme");
            this.$leftMenuBg.removeClass("mmc mme");
            this.$leftMenuToggle.removeClass("mmc mme");

            this.$leftMenu.addClass(cls);
            this.$leftMenuBg.addClass(cls);
            this.$leftMenuToggle.addClass(cls);
        } else {
            this.$rightMenu.removeClass("mmc mme");
            this.$rightMenuBg.removeClass("mmc mme");
            this.$rightMenuToggle.removeClass("mmc mme");

            this.$rightMenu.addClass(cls);
            this.$rightMenuBg.addClass(cls);
            this.$rightMenuToggle.addClass(cls);
        }
    },

    getContentPanel: function () {
        return this.element.find(".layout-widget-content");
    },

    ".layout-widget-menu .navigation li > a mouseenter": function (el, ev) {
        var $li = $(ev.target).closest('li');
        $li.parents().each(function (index) {
            $(this).removeClass('mouse-on');
        });

        $li.addClass('mouse-on');
    },

    ".layout-widget-menu .navigation li > a mouseleave": function (el, ev) {
        $(ev.target).closest('li').removeClass('mouse-on');
    },


    ".layout-widget-menu .navigation .mm-dropdown-root mouseenter": function (el, ev) {
        if (this.isCollapsed(el) && (!this._dropdown_li || !$(this._dropdown_li).hasClass('freeze'))) {
            this.openDropdown(el);
        }
    },

    ".layout-widget-menu .navigation .mm-dropdown-root mouseleave": function (el, ev) {
        this.closeCurrentDropdown();
    },

    ".layout-widget-menu .mm-dropdown > a click": function (el, ev) {
        var that = this, $li = $(ev.target).closest('li');
        if ($li.hasClass('mm-dropdown-root') && this.isCollapsed(el)) {
            if ($li.hasClass('mmc-dropdown-open')) {
                if ($li.hasClass('freeze')) {
                    that.closeCurrentDropdown(true);
                } else {
                    that.freezeDropdown($li);
                }
            } else {
                that.openDropdown($li, true);
            }
        } else {
            that.toggleSubmenu($li);
        }

        return false;
    },

    ".layout-widget-menu .navigation li > a click": function (el, ev) {
        var $li = $(ev.target).closest('li');
        if (!$li.hasClass('mm-dropdown')) {
            $li.toggleClass('active');
            this.element.trigger("layout-page-main-menu-selected", { menuId: $li.attr("id") });
        }
        return false;
    },

    selectMenu: function (menuId) {
        this.element.find(".layout-widget-menu .navigation").find('li#'+ menuId).addClass('active');
    },

    deselectMenu: function (el) {
        this.element.find(".layout-widget-menu").find(".navigation").find('li').removeClass('active');
    },
    deactivateMenu: function (menuId) {
        this.element.find(".layout-widget-menu .navigation").find('li#'+ menuId).removeClass('active');
    },

    openDropdown: function (li, freeze) {
        var $li, $title, $ul, ul;
        if (freeze == null) {
            freeze = false;
        }
        if (this._dropdown_li) {
            this.closeCurrentDropdown(freeze);
        }
        $li = $(li);
        $ul = $li.find('> ul');
        ul = $ul[0];
        this._dropdown_li = li;
        this._dropdown = ul;
        $title = $ul.find('> .mmc-title');
        if (!$title.length) {
            $title = $('<div class="mmc-title"></div>').text($li.find('> a > .mm-text').text());
            ul.insertBefore($title[0], ul.firstChild);
        }
        $(li).addClass('mmc-dropdown-open');
        $(ul).addClass('mmc-dropdown-open-ul');


        if (freeze) {
            this.freezeDropdown(li);
        }

        $(li).append(ul);
    },

    clearCloseTimer: function () {
        if (this._close_timer) {
            clearTimeout(this._close_timer);
            this._close_timer = null;
        }
    },

    closeCurrentDropdown: function (force) {
        var $dropdown;
        if (force == null) {
            force = false;
        }
        if (!this._dropdown_li || ($(this._dropdown_li).hasClass('freeze') && !force)) {
            return;
        }

        this.clearCloseTimer();
        $dropdown = $(this._dropdown);
        $(this._dropdown_li).append(this._dropdown);
        $(this._dropdown).removeClass('mmc-dropdown-open-ul');
        $(this._dropdown).removeClass('top');
        $(this._dropdown_li).removeClass('mmc-dropdown-open');
        $(this._dropdown_li).removeClass('freeze');
        $(this._dropdown_li).attr('style', '');
        $dropdown.attr('style', '');
        this._dropdown = null;
        this._dropdown_li = null;
    },

    freezeDropdown: function (li) {
        $(li).addClass('freeze');
    },

    toggleSubmenu: function (li) {
        this[$(li).hasClass('open') ? 'collapseSubmenu' : 'expandSubmenu'](li);
        return false;
    },

    collapseSubmenu: function (li) {
        var $li, $ul;
        $li = $(li);
        $ul = $li.find('> ul');

        $ul.animate({
            height: 0
        }, 250, (function (le) {
            return function () {
                $(li).removeClass('open');
                $ul.attr('style', '');
                return $li.find('.mm-dropdown.open').removeClass('open').find('> ul').attr('style', '');
            };
        })(li));

        return false;
    },

    expandSubmenu: function (li) {
        var $li, $ul, h, ul;
        $li = $(li);
        $ul = $li.find('> ul');
        ul = $ul[0];
        $(ul).addClass('get-height');
        h = $ul.height();
        $(ul).removeClass('get-height');
        ul.style.display = 'block';
        ul.style.height = '0px';
        $(li).addClass('open');

        $ul.animate({
            height: h
        }, 250, (function (li) {
            return function () {
                return $ul.attr('style', '');
            };
        })(li));
    },

    renderMenu: function (menu) {
        return can.view.render('templates/page-layout-menu.ejs', { menu: menu, caller: this });
    },

    isCollapsed: function (el) {
        return this.getMenuStatus(el) === "C";
    },

    getMenuStatus: function (el) {
        return $(el).closest(".layout-widget-menu").hasClass('mmc') ? "C" : "A";
    },

    ".layout-widget-menu-toggle click": function (el, ev) {
        this.resetMenuStyle();
        var cls, title = "Click here to expand the menu";
        if ($(el).hasClass('mmc')) {
            title = "Click here to  collapse the menu";
            cls = "mme";
            if ($(el).hasClass('layout-widget-menu-toggle-left')) {
                this.element.find(".layout-widget-wrapper").switchClass("mmcl", "mmel");
            } else {
                this.element.find(".layout-widget-wrapper").switchClass("mmcr", "mmer");
            }
            
        } else {
            cls = "mmc";
            if ($(el).hasClass('layout-widget-menu-toggle-left')) {
                this.element.find(".layout-widget-wrapper").switchClass("mmel", "mmcl");
            } else {
                this.element.find(".layout-widget-wrapper").switchClass("mmer", "mmcr");
            }
        }

        this.setExpandColapseClass($(el).hasClass('layout-widget-menu-toggle-left'),cls);

        $(el).prop('title', title);

        this.element.trigger("layout-page-main-menu-toggled", {});
    },

    setTitleForToggleButton: function () {
        var title = "Click here to collapse the menu";
        if (this.options.colapsed) {
            title = "Click here to expand the menu";
        }
        this.element.find('.layout-widget-menu-toggle-left').prop('title', title);
        this.element.find('.layout-widget-menu-toggle-right').prop('title', title);
    },

    resetMenuStyle: function () {
        if (this._dropdown_li) {
            this.closeCurrentDropdown(true);
        }
    }

});