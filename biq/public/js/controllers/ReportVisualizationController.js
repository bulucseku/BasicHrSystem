can.Control.extend("Sentrana.Controllers.ReportVisualization", {
    pluginName: 'sentrana_report_visualization',
    defaults: {
        app: null
    }
}, {

    init: function () {
        this.updateView();
    },

    updateView: function () {
        var visualizations = [];

        $.each(Sentrana.VisualizatoinElements, function(index, visualizationElement){
            $.merge(visualizations, visualizationElement.types);
        });

        this.element.find(".attribute-elements").html(can.view('templates/report_visualization_content.ejs', { visualizations: visualizations }));
    },

    ".report_visualization_element click": function (el, ev) {
        var srcFile = $(el).find('.img-icon').attr('src');
        var splitIndex = srcFile.lastIndexOf('.');
        var fileName = srcFile.substr(0, splitIndex);
        var fileExtension = srcFile.substr(splitIndex, fileName.length);

        var bgSrcFile = fileName +'_bg'+  fileExtension;

        this.element.trigger("visualization_element-selected", { type: $(el).attr("type"), icon: bgSrcFile });
    }
});
