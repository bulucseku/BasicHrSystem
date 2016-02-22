can.Control.extend("Sentrana.Controllers.ReportVisualization", {
    pluginName: 'sentrana_report_dashboard_list',
    defaults: {
        app: null
    }
}, {

    init: function () {
        this.updateView();
    },

    update: function () {
        this.updateView();
    },

    updateView: function () {
        this.loadDashboardList();
    },

    loadDashboardList: function () {
        var that = this;
        var dashboard = new Sentrana.Models.Dashboard();
        dashboard.findAll({},
            function success(data) {
                that.dashboardList = data;
                $('.dashboard-list-container', this.element).html(can.view("templates/saved-dashboard-list.ejs", { dashboardList: data }));
            },
            function error() {
                alert('Failed to load dashboard list!');
            });
    },

    getDashboardByName: function (name) {
        for (var i = 0; i < this.dashboardList.length; i++) {
            if (this.dashboardList[i].name === name)
                return this.dashboardList[i];
        }
        return null;
    },

    ".dashboard-name click": function (el, ev) {

        $('.dashboard-item', $(el).parent().closest('ul')).removeClass('dashboard-item-active');
        $(el).parent().closest('.dashboard-item').addClass('dashboard-item-active');

        var dashboardName = $(el).attr('id');
        var dashboard = this.getDashboardByName(dashboardName);        
        this.element.trigger("dashboard-item-clicked", dashboard);
    },

    ".report_visualization_element click": function (el, ev) {
        this.element.trigger("visualization_element-selected", { type: $(el).attr("type") });
    }
});
