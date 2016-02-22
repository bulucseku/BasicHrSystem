/*...............Sentrana.Models.BookletDefin...................*/

can.Observe.extend("Sentrana.Models.BookletDefin", {}, {
    // Constructor...
    init: function (options) {
        /* This is a reference to the top-level Controller that holds a reference to the entire
         * Data Warehouse Repository.
         */
        this.app = options.app;

        this.setup({
            "count": 0,
            "itempos": '',
            "selreportpos": '',
            "gettingServerdata": false
        });

        this.bookletReports = [];
        this.selectedReportPos = -1;
    },

    setBookletDefinition: function (bookletModel) {
        //reset the properties
        this.bookletReports = [];
        this.selectedReportPos = -1;

        this.attr("count", 0);
        this.attr("itempos", '');
        this.attr("selreportpos", '');
        this.attr("gettingServerdata", false);

        this.bookletModel = bookletModel;
        if (bookletModel) {
            if (!bookletModel.reportsRefreshed) {
                this.attr("gettingServerdata", true);
                this.getReports(bookletModel.id);
            }
            else {
                this.addMultipleReportsToBooklet(bookletModel.reports);
            }
        }
        else {
            this.attr("count", 0);
        }
    },

    getReports: function (id) {
        var that = this;

        Sentrana.Models.Booklet.getReports(id).done(function (data) {
            that.bookletReports = [];
            var reports = $.map(data, function (rdi, index) {
                return new Sentrana.Models.ReportDefinitionInfo({
                    json: rdi,
                    app: that.app
                });
            });
            that.addMultipleReportsToBooklet(reports);
            that.bookletModel.attr("reportsRefreshed", true);
            that.bookletModel.attr('reports', reports);
            that.attr("gettingServerdata", false);
        });
    },

    getSavedBookletReports: function () {
        if (this.bookletModel) {
            return this.bookletModel.reports;
        }

        return [];
    },

    addReportToBooklet: function (report) {
        this.bookletReports.push(report);
        this.attr("count", this.bookletReports.length);
    },

    addMultipleReportsToBooklet: function (reports) {
        var that = this;
        $.each(reports, function (index, report) {
            that.bookletReports.push(report);
        });

        this.attr("count", this.bookletReports.length);
    },

    removeReportFromBooklet: function (pos) {
        pos = pos * 1;
        this.bookletReports.splice(pos, 1);
        this.attr("count", this.bookletReports.length);

        this.selectedReportPos = this.selectedReportPos * 1;
        if (this.selectedReportPos > -1) {
            //if report is selected
            if (this.bookletReports.length === 0) {
                this.setBookletReportSelected(-1);
            }
            else if (this.bookletReports.length === 1 || this.selectedReportPos === 0) {
                this.setBookletReportSelected(0);
            }
            else if (this.selectedReportPos >= pos) {
                this.setBookletReportSelected(this.selectedReportPos - 1);
            }
            else {
                this.setBookletReportSelected(this.selectedReportPos);
            }
        }
    },

    removeAllReportsFromBooklet: function () {
        this.bookletReports = [];
        this.selectedReportPos = -1;
        this.attr("count", this.bookletReports.length);
        this.attr("selreportpos", '');
    },

    changeReportPositionInBooklet: function (oldPos, newPos) {
        oldPos = oldPos * 1;
        newPos = newPos * 1;
        this.selectedReportPos = this.selectedReportPos * 1;

        if (oldPos === newPos) {
            return;
        }

        // Take out the original object...
        var array = this.bookletReports.splice(oldPos, 1);

        // Add it in at the new index...
        this.bookletReports.splice(newPos, 0, array[0]);

        this.attr("itempos", array[0].name + '|' + oldPos + '|' + newPos);

        if (this.selectedReportPos === oldPos) {
            this.setBookletReportSelected(newPos);
        }
        else if (newPos >= this.selectedReportPos && oldPos < this.selectedReportPos) {
            this.setBookletReportSelected(this.selectedReportPos - 1);
        }
        else if (newPos <= this.selectedReportPos && oldPos > this.selectedReportPos) {
            this.setBookletReportSelected(this.selectedReportPos + 1);
        }
    },

    getBookletReport: function (pos) {
        pos = pos * 1;
        if (this.bookletReports.length - 1 >= pos) {
            return this.bookletReports[pos];
        }

        return undefined;
    },

    getBookletReports: function () {
        return this.bookletReports;
    },

    setBookletReportSelected: function (pos) {
        pos = pos * 1;
        this.selectedReportPos = this.selectedReportPos * 1;

        if (pos === -1) {
            this.selectedReportPos = -1;
            this.attr("selreportpos", '-1');
        }
        else {
            this.selectedReportPos = pos;
            this.attr("selreportpos", this.bookletReports.length + '|' + this.bookletReports[pos * 1].name + '|' + pos);
        }
    },

    getSelectedBookletReport: function () {
        this.selectedReportPos = this.selectedReportPos * 1;
        if (this.selectedReportPos >= 0) {
            return this.bookletReports[this.selectedReportPos];
        }

        return undefined;
    },

    getReportPositionByName: function (name) {

        for (var i = 0; i < this.bookletReports.length; i++) {
            if (this.bookletReports[i].name === name) {
                return i;
            }
        }

        return -1;
    }

});
