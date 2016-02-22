(function () {

    window.ClientSidePrinting = function (options) {
        /* Define default settings */
        var defaults = {
            printPreviewContainer: $('#print-preview-container'),
            originalDisplay: [],
            rowChunk: window.app_resources.print_config.rows_in_page,
            columnChunk: window.app_resources.print_config.columns_in_page,
            pageOrientation: window.app_resources.print_config.page_orientation,
            pageSize: window.app_resources.print_config.page_size,
            childNodes: document.body.childNodes
        };

        /* Merge default settings with options */
        var settings = $.extend({}, defaults, options);

        initialize(settings);

        return this;
    };

    /****************************************************************************************
     *
     * Private methods are defined below.
     *
     *****************************************************************************************/

    function initialize(settings) {

        this.printPageTemplate = $('<div id="print-template"></div>');

        if (!window.chrome) {
            this.printPageTemplate.append(can.view('templates/printPreviewSettings.ejs', {}));
        }

        $.each(settings.childNodes, function (i, node) {
            if (node.nodeType === 1) {
                settings.originalDisplay[i] = node.style.display;
                node.style.display = 'none';
            }
        });

        settings.printPreviewContainer.html(this.printPageTemplate).show();

        var tableData = settings.tableData,
            gridContainer;
        var pageNo = 0;

        if (!settings.chartonly) {
            var splitedColumns = getSplittedColumns(settings), rowChunk = settings.rowChunk, allRows = tableData.tableRows;

            var counterLast = 0, counter = 0, printPageNo = 0;

            for (var j = 0, k = allRows.length; j < k; j += rowChunk) {
                printPageNo++;
                var rows = allRows.slice(j, j + rowChunk), printSubPageNo = 97, printSubPage = "";
                counterLast += rows.length;
                for (var i = 0; i < splitedColumns.length; i++) {
                    if (splitedColumns.length > 1) {
                        printSubPage = "-" + String.fromCharCode(printSubPageNo ++);
                    }

                    pageNo++;
                    gridContainer = addPage(pageNo, settings, splitedColumns[i].cols);
                    var tableBody = gridContainer.find('tbody');
                    for (var l = 0; l < rows.length; l++) {
                        tableBody.append(can.view('templates/printGridRow.ejs', {
                            trclass: "",
                            cols: rows[l].cols.slice(splitedColumns[i].startIndex, splitedColumns[i].endIndex + 1)
                        }));
                    }
                    gridContainer.find('.print-table-pagination').text('Displaying Rows:' + (counter + 1) + '-' + counterLast);
                    gridContainer.find('.print-table-pageno').text('Page: ' + printPageNo + printSubPage);
                }

                counter += rows.length;

            }
        }

        if (settings.chartOptions) {
            gridContainer = addPageForChart(pageNo + 1, settings);
            var chartContainer = gridContainer.parent().find('.print-chart-container');
            chartContainer.addClass("print-chart-container-border").find('.print-chart-ctr').addClass("print-chart-ctr-padding");
            chartContainer.sentrana_report_chart(settings.chartOptions);
        }

        if (window.chrome) {
            setTimeout(function () {
                window.print();
                close(settings);
            }, 1500);

        }
        else {
            $('.btn-close-print-preview', this.printPageTemplate).click(function () {
                close(settings);
            });

            $('.btn-print-print-preview', this.printPageTemplate).click(function () {
                window.print();
                close(settings);
            });

            $('button', this.printPageTemplate).button();
        }

    }

    function getSplittedColumns(settings) {
        var i, j, chunk = settings.columnChunk, allColumns = settings.tableData.tablecolumns, splitedColumns = [];
        for (i = 0, j = allColumns.length; i < j; i += chunk) {
            var cols = allColumns.slice(i, i + chunk);
            var endIndex = i + chunk > j ? j : i + chunk;
            var obj = { startIndex: i, endIndex: endIndex - 1, cols: cols }
            splitedColumns.push(obj);
        }

        return splitedColumns;
    }

    function addPageForChart(pageNo, settings) {

        this.printPageTemplate.append(can.view('templates/printTemplate.ejs', {
            pageNo: pageNo,
            user: settings.user.fullName,
            pageSize: settings.pageSize
        }));

        var currentPage = $('#page-' + pageNo, this.printPageTemplate);
        var gridContainer = $('.print-grid-container', currentPage);

        addGridDescription(gridContainer, settings);
        gridContainer.append('<div class="clear"></div>');

        return gridContainer;
    }

    function addPage(pageNo, settings, columns) {

        this.printPageTemplate.append(can.view('templates/printTemplate.ejs', {
            pageNo: pageNo,
            user: settings.user.fullName,
            pageSize: settings.pageSize
        }));

        var currentPage = this.printPageTemplate.find('#page-' + pageNo);
        var gridContainer = currentPage.find('.print-grid-container', currentPage);

        addGridDescription(gridContainer, settings);
        addGridBody(gridContainer, columns);
        gridContainer.append('<div class="clear"></div>');

        return gridContainer;
    }

    function addGridDescription(gridContainer, settings) {
        var report = settings.report,
            filter = report? report.formatFilter(report.definition.filter): "";

        gridContainer.append(can.view('templates/printGridDescTemplate.ejs', {
            reportTitle: report? report.name: "",
            reportModifiedDate: report ? Sentrana.formatCommentDate(new Date(report.createDate)) : Sentrana.formatCommentDate(new Date()),
            reportFilter: filter,
            printDate: Sentrana.formatCommentDate(new Date())
        }));
    }

    function addGridBody(gridContainer, columns) {
        gridContainer.append(can.view('templates/printGridBodyTemplate.ejs', {
            tablecolumns: columns
        }));
    }

    function close(settings) {
        setTimeout(function () {
            $.each(settings.childNodes, function (i, node) {
                if (node.nodeType === 1) {
                    if (node.style.display) {
                        node.style.display = settings.originalDisplay[i];
                    }
                }
            });
            settings.printPreviewContainer.html('').hide();
            if (settings.parent) {
                settings.parent.trigger('print_closed');
            }
        }, 500);
    }

})();
