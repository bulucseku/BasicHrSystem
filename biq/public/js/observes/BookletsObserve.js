/*................Sentrana.Models.Booklets..................*/

Sentrana.Models.ViewList("Sentrana.Models.Booklets", {

}, {

    init: function (options) {
        this.setup(options.attrs);
        this.app = options.app;
    },

    getSavedBooklets: function () {
        var that = this,
            count = that.count * 1;
        $.when(Sentrana.Models.Booklet.findAll()).done(function (data) {

            that.savedBooklets = $.map(data, function (booklet, index) {
                return new Sentrana.Models.Booklet({
                    booklet: booklet,
                    app: that.app
                });
            });

            if (data.length === count) {
                that.attr("ignoreChange", true);
                that.attr("count", count + 1);
                that.attr("ignoreChange", false);
            }

            that.attr("count", data.length);

        }).fail(function (jqXHR, textStatus, errorThrown) {
            that.attr("loadErrorMessage", errorThrown);
            that.attr("count", -2);
        });
    },

    getList: function () {
        var that = this;
        var groupName = '';

        switch (that.field) {
        case 'lastModDate':
        case 'createDate':
            groupName = 'DATE';
            that.asc = false;
            break;
        case 'name':
            groupName = 'All Booklets';
            that.asc = true;
            break;
        default:
            break;
        }

        this.savedBooklets.sort(function (a, b) {

            var fieldA = a.attr("booklet")[that.field],
                fieldB = b.attr("booklet")[that.field];
            if (typeof fieldA === "string") {
                fieldA = fieldA.toUpperCase();
                fieldB = fieldB.toUpperCase();
            }
            if (that.asc) {
                if (fieldA < fieldB) {
                    return -1;
                }
                if (fieldA > fieldB) {
                    return 1;
                }
                return 0;
            }
            else {
                if (fieldB < fieldA) {
                    return -1;
                }
                if (fieldB > fieldA) {
                    return 1;
                }
                return 0;
            }
        });

        $.each(this.savedBooklets, function (index, rdi) {
            rdi.attr("booklet.groupName", that.constructor.getGroupName(groupName, rdi.attr('booklet').attr(that.field)));
        });

        return this.savedBooklets;
    },

    getSortOrderName: function () {
        return (this.asc) ? "ascending" : "descending";
    },

    getSortFieldName: function () {
        switch (this.field) {
        case "lastModDate":
            return "last modification date";
        case "createDate":
            return "creation date";
        case "name":
            return "report name";
        default:
            return "Unknown";
            break;
        }

        return undefined;
    },

    getSortFieldNames: function () {
        var sortFields = [{
            key: "lastModDate",
            value: "MOD. DATE"
        }, {
            key: "createDate",
            value: "CREATION DATE"
        }, {
            key: "name",
            value: "ABC"
        }];
        return sortFields;
    },

    toggleSortOrder: function () {
        this.attr("asc", !this.asc);
    },

    changeSortField: function (field) {
        this.attr("field", field);
    },

    addBooklet: function (rdi) {
        if (!this.savedBooklets) {
            return;
        }

        this.savedBooklets.push(new Sentrana.Models.Booklet({
            booklet: rdi,
            app: this.app
        }));
        this.attr("count", this.savedBooklets.length);
    },

    removeBooklet: function (model) {
        var that = this;
        $.each(this.savedBooklets, function (i, r) {
            if (r.attr("booklet").attr("id") === model.attr('id')) {
                that.savedBooklets.splice(i, 1);
                that.attr("count", that.savedBooklets.length);
                return false;
            }
        });
    }
});
