can.Construct("Sentrana.Models.ReportGridUtil", {}, {

    init: function RGU_init(app, executionMonitorModel) {
        this.executionMonitorModel = executionMonitorModel;
        this.app = app;
    },

    renderGridUtilIcons: function (app, container, $reportGrid, resultDataModel) {
        //For Reference
        // http://live.datatables.net/ahuqus
        // https://datatables.net/forums/discussion/12513/adding-hide-column-image-in-each-column-header

        var that = this;
        $reportGrid.find('.dataTables_scrollHead .dataTable thead th').append(can.view('templates/grid-column-util.ejs', {})).children(
            '.grid-column-util').click(function () {

            app.handleUserInteraction();

            var $this = $(this),
                oid = $this.attr('oid'),
                currentIndex = resultDataModel.getCurrentColumnIndex(oid),
                filteredItems = resultDataModel.getUniqueItemsFromColumn(currentIndex),
                allItems = resultDataModel.getUniqueItemsFromColumnAll(currentIndex);

            var $columnUtilElement = container.element.find('.column-util-element');

            $columnUtilElement.css({
                position: "absolute",
                top: ($this.offset().top + 12) + 'px',
                left: ($this.offset().left + 8) + 'px'
            }).show();

            var controller = $columnUtilElement.control();
            if (controller && !controller._destroyed) {
                controller.destroy();
            }

            $columnUtilElement.sentrana_report_grid_util({
                items: allItems,
                columnIndex: currentIndex,
                oid: oid,
                filteredItems: filteredItems,
                resultDataModel: resultDataModel
            });

            return false;
        });
    },

    removeGridUtilIcons: function ($reportGrid) {
        $reportGrid.find('.dataTables_scrollHead .dataTable thead th').find(".grid-column-util").remove();
        $reportGrid.find('.dataTables_scrollHead .dataTable thead th').find(".clear").remove();
    }
});
