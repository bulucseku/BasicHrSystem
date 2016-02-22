/**
 * Extend the global Sentrana namespace
 */
$.extend(Sentrana, {
    /**
     * Fields
     */
    sessionId: "",

    /**
     * Methods
     */
    isiPad: function Sentrana_isiPad() {
        return window.navigator.userAgent.match(/iPad/i) !== null;
    },

    addDatepicker: function Sentrana_addDatepicker(controlId) {
        // Is this a browser other than an iPad?
        if (!Sentrana.isiPad()) {
            $('#' + controlId).datepicker({ "dateFormat": "yy-mm-dd" });
        }
    },

    // Set a cookie...
    setCookie: function Sentrana_setCookie(name, value) {
        document.cookie = name + "=" + encodeURIComponent(value);
    },

    //Instance Method: add base url to service
    addServiceBaseURL: function Sentrana_addServiceBaseURL(url) {
        return url;
    },

    //Static Method: Maps organization to organiation model...
    mapOrganizationModel: function Sentrana_mapOrganizationModel(organization) {
        if (organization) {
            Sentrana.CurrentOrganization.attr('id', organization.id);
            Sentrana.CurrentOrganization.attr('name', organization.name);
            Sentrana.CurrentOrganization.attr('status', organization.status);
            Sentrana.CurrentOrganization.attr('userCount', organization.userCount);
            Sentrana.CurrentOrganization.attr('groupCount', organization.groupCount);
            Sentrana.CurrentOrganization.attr('roleCount', organization.roleCount);
            Sentrana.CurrentOrganization.attr('applications', organization.applications);
            Sentrana.CurrentOrganization.attr('dataFilterInstances', organization.dataFilterInstances);
        }
    },

    //Instance Method: map json object
    mapUserModel: function Sentrana_mapUserModel(user) {
        var newModel = new Sentrana.Models.UserModel();
        newModel.attr('id', user.id);
        newModel.attr('firstName', user.firstName);
        newModel.attr('lastName', user.lastName);
        newModel.attr('userName', user.userName);
        newModel.attr('password', user.password);
        newModel.attr('organization', user.organization);
        newModel.attr('email', user.email);
        newModel.attr('activeStatus', user.activeStatus);
        newModel.attr('groupMemberships', user.groupMemberships);
        newModel.attr('appRoles', user.appRoles);
        newModel.attr('dataFilterInstances', user.dataFilterInstances);
        return newModel;
    },

    mapGroupModel: function Sentrana_mapGroupModel(group) {
        var newModel = new Sentrana.Models.GroupModel();
        newModel.attr('id', group.id);
        newModel.attr('name', group.name);
        newModel.attr('groupPath', group.groupPath);
        newModel.attr('organization', Sentrana.CurrentOrganization);
        newModel.attr('groupType', group.groupType);
        newModel.attr('parentGroup', group.parentGroup);
        newModel.attr('users', group.users);
        newModel.attr('childGroups', group.childGroups);
        newModel.attr('appRoles', group.appRoles);
        newModel.attr('dataFilterInstances', group.dataFilterInstances);
        return newModel;
    },

    // Handle ajax waiting state
    showLoadingMessage: function Sentrana_showLoadingMessage() {
        if (!Sentrana.preventLoadingMessage && !Sentrana.isLoaderVisible()) {
            $("#spinner").center(false);
            $("#spinner").show();
            $(".cover_background").show();
        }
    },

    closeLoadingMessage: function Sentrana_showLoadingMessage() {
        $("#spinner").hide();
        $(".cover_background").hide();
    },

    isLoaderVisible: function Sentrana_isLoaderVisible() {
        return $("#spinner").is(":visible") && $(".cover_background").is(":visible");
    },

    // Static Method: Gets the message text for a message key with or without dynamic values.
    getMessageText: function Sentrana_getMessageText(str, params) {
        if (params) {
            params = typeof params === 'object' ? params : Array.prototype.slice.call(arguments, 1);

            return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
                if (m === "{{") {
                    return "{";
                }
                if (m === "}}") {
                    return "}";
                }
                return params[n];
            });
        } else {
            return str;
        }
    }
});


/**
 * Extend the native Object constructor
 */
$.extend(Object, {
    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    keys: Object.keys || (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }())
});

/**
 * Extend the native String prototype
 */
$.extend(String.prototype, {
    escapeHTML: function (value) {
        return this.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    /**
     * Add a formatting function to the String prototype if it doesn't already exist.
     * Example: "{0} bar {1}".format("foo", "baz") evaluates to "foo bar baz"
     *
     * Source: http://stackoverflow.com/a/4673436
     */
    format: String.prototype.format || function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    },

    /**
     * Convert a space- or hyphen-delimited string to camelCase
     */
    toCamelCase: String.prototype.toCamelCase || function() {
        return this.trim().replace(/^([a-z])|[ -]([a-z])/gi, function(match, p1, p2) {
            return p1 ? p1.toLowerCase() : p2.toUpperCase();
        });
    },

    /**
     * Convert a space- or hyphen-delimited string to PascalCase
     */
    toPascalCase: String.prototype.toPascalCase || function() {
        return this.trim().replace(/^([a-z])|[- ]([a-z])/gi, function(match, p1, p2) {
            return (p1 || p2).toUpperCase();
        });
    }
});

/**
 * Extend the native Array prototype
 */
$.extend(Array.prototype, {
    match: Array.prototype.match || function(property, value) {
        return $.grep(this, function(inst) {
            return inst[property] === value;
        });
    },

    first: Array.prototype.first || function(cond) {
        return $.grep(this, cond)[0];
    },

    contains: Array.prototype.contains || function (obj) {
        var i, l = this.length;
        for (i = 0; i < l; i++) {
            if ((this[i].Name !== undefined && this[i].Name === obj.Name) || (this[i].name !== undefined && this[i].name === obj.name)) {
                return true;
            }
        }
        return false;
    }
});


/**
 * Extend the can.Map.List prototype (can.Map replaces can.Observe)
 *
 * Note: We don't need to additionally extend can.Model.List since
 *       it inherits from can.Map.List
 */
$.extend(can.Map.List.prototype, {
    match: can.Map.List.prototype.match || function (property, value) {
        return $.grep(this, function (inst) {
            return inst[property] === value;
        });
    },

    first: can.Map.List.prototype.first || function(cond) {
        return $.grep(this, cond)[0];
    }
});


/**
 * Extend jQuery utilities
 */
$.extend(true, jQuery, {
    // http://stackoverflow.com/questions/1802936/stop-all-active-ajax-requests-in-jquery
    ajaxManager: (function() {
        var id = 0, Q = {};

        $(document).ajaxSend(function (e, jqx) {
            jqx._id = id + 1;
            Q[jqx._id] = jqx;
        });
        $(document).ajaxComplete(function (e, jqx) {
            delete Q[jqx._id];
        });

        return {
            abortAll: function () {
                var r = [];
                can.each(Q, function (jqx, i) {
                    r.push(jqx._id);
                    jqx.abort();
                });
                return r;
            }
        };
    })(),

    browser: (function() {
        var browser = {},
            browserVersion;
        if (/Firefox[\/\s](\d+\.\d+)/.test(window.navigator.userAgent)) {
            browser.mozilla = "mozilla";
            browserVersion = parseFloat(Number(RegExp.$1));
        } else if (/Chrome[\/\s](\d+\.\d+)/.test(window.navigator.userAgent)) {
            browser.webkit = "webkit";
            browserVersion = parseFloat(Number(RegExp.$1));
        } else if (/MSIE[\s](\d+\.\d+)/.test(window.navigator.userAgent)) {
            browser.msie = "msie";
            browserVersion = parseFloat(Number(RegExp.$1));
        }
        browser.version = browserVersion;
        return browser;
    })(),

    /**
     *  Extend jQuery.fn
     */
    fn: {
        // Remove classes matching given regex
        removeClassRegex: function(pattern) {
            var re = (pattern instanceof RegExp) ? pattern : new RegExp(pattern);
            this.each(function(i, el) {
                var classes = el.className.split(" ").filter(function(c) {
                    return !re.test(c);
                });
                el.className = classes.join(" ");
            });
            return this;
        },

        center: function(absolute, isParentPositionFixed) {
            return this.each(function MessageBox_ToSetInCenter_each() {
                var t = jQuery(this);

                t.css({
                    position: absolute ? 'absolute' : 'fixed',
                    left: '50%',
                    top: '50%',
                    zIndex: '1000000'
                }).css({
                    marginLeft: '-' + (t.outerWidth() / 2) + 'px',
                    marginTop: '-' + (t.outerHeight() / 2) + 'px'
                });

                if (absolute && !isParentPositionFixed) {
                    t.css({
                        marginTop: parseInt(t.css('marginTop'), 10) + jQuery(window).scrollTop(),
                        marginLeft: parseInt(t.css('marginLeft'), 10) + jQuery(window).scrollLeft()
                    });
                }
            });
        },

        enableButton: function(enabled) {
            enabled = enabled || arguments.length === 0;
            if (enabled) {
                this.removeClass('btn-disabled');
                this.removeAttr('disabled');
                this.prop('disabled', false);
            } else {
                this.addClass('btn-disabled');
                this.attr('disabled', 'disabled');
                this.prop('disabled', true);
            }
        }
    }
});


$(".ui-dialog").dialog({
    drag: function () {
        $.data(this, 'dragged', true);
    },
    open: function () {
        $.data(this, 'dragged', false);
    }
});
