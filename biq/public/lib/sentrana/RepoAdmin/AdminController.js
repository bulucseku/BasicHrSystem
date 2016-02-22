/* global ace */
steal("lib/sentrana/RepoAdmin/AdminModel.js", function (){
can.Control.extend("Sentrana.Controllers.AdminController", {
    pluginName: 'sentrana_edit_config',
    defaults: {
        basePath: "lib/sentrana/RepoAdmin/",
        repoAdminTemplate: "templates/repo-admin.ejs",
        repoSelectorTemplate: "templates/repo-selector.ejs",
        repoAdminEditTemplate: "templates/repo-admin-edit.ejs",
        repoAdminListTemplate: "templates/repo-admin-list.ejs",
        repoAdminUploadTemplate: "templates/repo-admin-upload.ejs",
        model: null
    }
},
{
    init: function () {
        this.app = this.options.app;
        this.options.model = new Sentrana.Models.AdminModel(this.app);
        this.updateView();
    },

    // What to do when subsequent attempts to render an already initialized controller.
    update: function (options) {
        this._super(options);
        this.app = this.options.app;
        this.updateView();
    },

    updateView: function () {
        // Render Administration page
        this.renderAdministration();
    },

    renderAdministration: function Sentrana_renderAdministration() {

        this.element.removeClass('sentrana_layout');
        this.element.html(can.view(this.options.basePath + this.options.repoAdminTemplate, {}));

        // Adding Dashboard client list section
        var listSectionId = "pnl_for_dashboars_list";
        $('.admin-dashboard-client-list', this.element).append(can.view('templates/CollapsiblePanel.ejs', { panelId: listSectionId, panelTitle: "Dashboard List" }));

        // Adding configuration edit section
        var editSectionId = 'pnl_for_dashboars_edit';
        $('.admin-dashboard-config-edit', this.element).append(can.view('templates/CollapsiblePanel.ejs', { panelId: editSectionId, panelTitle: "Edit Dashboard" }));
        var editCollapsibleContainer = $("#" + editSectionId + " .collapsibleContainerContent");
        editCollapsibleContainer.append(can.view(this.options.basePath + this.options.repoAdminEditTemplate, {}));

        // Render Dashboard Client list and load dashboard configuration for first one
        var listCollapsibleContainer = $("#" + listSectionId + " .collapsibleContainerContent");
        this.renderClientList(listCollapsibleContainer);

        // Call navigation controller to render menu items for each page
        var userActions = this.app.getUserActionsForNavBar();
        // this.app.constructor.menuModel = this.getAdminMenuModel();
        // this.app.displayNavigationHeader(userActions);
    },

    /**
    * get Menu Model for Administration page
    */
    getAdminMenuModel: function () {

        var mainMenuItems = [];
        var menuItem = {};
        menuItem.id = "admin";
        menuItem.text = "Administration";
        mainMenuItems.push({ menuItem: menuItem });

        menuItem = {};
        menuItem.id = "home";
        menuItem.text = "Dashboard";
        mainMenuItems.push({ menuItem: menuItem });

        var menuModel = {
            mainMenuItems: mainMenuItems,
            subNavigationMenus: {}
        };
        return menuModel;
    },

    /**
    * Download Configuration for a client
    * @param {string} repoId Client Name
    */
    downloadConfiguration: function (repoId) {

        //this.options.model.getClientConfigurationZip(repoId);
        alert("Pending for server side implementation!!");
    },

    /**
    * Upload Configuration for a client
    */
    uploadConfiguration: function () {

        var that = this;
        if (!$("#upload-configuration-dialog").length) {
            $("<div></div>").attr('id', 'upload-configuration-dialog').appendTo('body');
        }
        $("#upload-configuration-dialog").html(can.view(this.options.basePath + this.options.repoAdminUploadTemplate, {}));

        var buttons = [
            {
                id: "btnUpload",
                label: "Upload",
                className: "btn-primary",
                callback: function () {

                    that.populateUploadedConfig();
                    dialogControl.closeDialog();
                }
            },
            {
                id: "btnClose",
                label: "Close",
                className: "btn-default",
                callback: function () {
                    dialogControl.closeDialog();
                }
            }
        ];

        var dialogControl = $("#upload-configuration-dialog").sentrana_dialog({
            app: this,
            title: 'Upload Dashboard Configuration',
            buttons: buttons,
            closeOnEscape: true,
            modal: true,
            autoOpen: true
        }).control();

        document.getElementById('config-files-input').addEventListener('change', function (e) {
            that.validateFiles(this);
        });

    },

    /**
    * populate Uploaded Configuration
    */
    populateUploadedConfig: function () {

        if ($("#input-file-validation-msg")[0].innerHTML === "") {
            var that = this;
            var formData = new FormData();
            var files = $('#config-files-input')[0].files;
            $.each(files, function (index, file) {
                formData.append('config-files-input' + index, file);
            });

            $.ajax({
                url: this.app.generateUrl("UploadConfigFiles", {}),
                dataType: 'json',
                data: formData,
                processData: false,
                contentType: false,
                cache: false,
                type: 'POST',
                success: function (data) {

                    that.loadConfigsFromFile(data);
                },
                error: function (xhr) {

                }
            });
        }
    },

    validateFiles: function (fileInput) {
        $("#input-file-validation-msg")[0].innerHTML = "";
        var files = fileInput.files;
        var len = files.length;
        if (len <= 5) {
            for (var i = 0; i < len; i++) {
                if (!this.validateFile(files[i])) {
                    $("#input-file-validation-msg")[0].innerHTML = "Invalid file name or format!! Please select valid configuration files with valid file name and format.";
                    return;
                }
            }

        } else {
            $("#input-file-validation-msg")[0].innerHTML = "Maximum 5 configuration files can be uploaded!!";
        }
    },

    validateFile: function (file) {
        if (file.name.split('.')[1] !== "xml") {
            return false;
        }
        var lowerCaseFileName = file.name.toLowerCase();
        if (lowerCaseFileName !== "dashboardconfig.xml" && lowerCaseFileName !== "reportelement.xml" && lowerCaseFileName !== "dashboardqueryconfiguration.xml" && lowerCaseFileName !== "reporttemplate.xml" && lowerCaseFileName !== "dashboardconnection.xml") {
            return false;
        }
        return true;
    },

    /**
    * load Configs From File
    */
    loadConfigsFromFile: function (configFiles) {

        for (var i = 0; i < configFiles.length; i++) {

            switch (configFiles[i][0].toLowerCase()) {
                case 'dashboardconfig.xml':
                    this.populateEditor('repoConfigEditor-0', configFiles[i][1]);
                    break;
                case 'reportelement.xml':
                    this.populateEditor('reportElementEditor', configFiles[i][1]);
                    break;
                case 'dashboardqueryconfiguration.xml':
                    this.populateEditor('queryConfigEditor', configFiles[i][1]);
                    break;
                case 'reporttemplate.xml':
                    this.populateEditor('reportTemplateEditor', configFiles[i][1]);
                    break;
                case 'dashboardconnection.xml':
                    this.populateEditor('connectionEditor', configFiles[i][1]);
                    break;
            }
        }
    },

    /**
    * Render Dashboard Client List
    */
    renderClientList: function (listCollapsibleContainer) {
        var that = this;
        this.options.model.getRepoList({}, function (data) {
            // set default Repo name
            that.repoId = data[0].repoId;
            listCollapsibleContainer.append(can.view(that.options.basePath + that.options.repoAdminListTemplate, { repoIds: data }));
            if (data.length > 0) {
                that.populateEditors(data[0].repoId);
            }
        });
    },

    /**
    * Clear a configuration editor
    * @param {string} editorId Editor Id
    */
    clearEditor: function (editorId) {
        var editor = ace.edit(editorId);
        editor.setValue("", -1);
    },

    /**
    * Clear all configuration editors
    */
    clearEditors: function () {
        this.clearEditor("repoConfigEditor-0");
    },

    /**
    * populate Editors for a repo
    * @param {string} repoId Repository ID
    */
    populateEditors: function (repoId) {

        this.clearEditors();
        var configFiles = this.options.model.readConfigFiles(repoId).configFiles;
        for (var i = 0; i < configFiles.length; i++) {
            var file = configFiles[i];

            this.populateEditor('repoConfigEditor-' + i, file.content);
        }
    },

    populateEditor: function (editorId, contents) {
        var editor = ace.edit(editorId);
        editor.setTheme("ace/theme/chrome");
        editor.getSession().setMode("ace/mode/xml");
        editor.setValue(contents, -1);
        editor.setOptions({ maxLines: 50 });
    },

    ".publish-change click": function () {
        // Todo
        // 1. Retrieve the current client assign. For example, "Dev"
        // 2. Now check, "Dev" client is selected or not.
        // 3. If not then show a message "Only Dev can be published"
        // 4. If "Dev" is selected, then save the configuration to cache (publish cache)
        var dashboardConfig = {};
        var that = this;
        this.options.model.publishConfigFiles(dashboardConfig,
            function success(data) {
                that.showMessage('Configuration files have been published successfully');
            },
            function error(xhr) {
            });
    },

    ".save-all-config click": function () {
        var dashboardConfig = {};
        var configFiles = [];
        configFiles.push({ name: 'DashboardConfig.xml', content: ace.edit("repoConfigEditor").getValue() });
        configFiles.push({ name: 'ReportElement.xml', content: ace.edit("reportElementEditor").getValue() });
        configFiles.push({ name: 'DashboardQueryConfiguration.xml', content: ace.edit("queryConfigEditor").getValue() });
        configFiles.push({ name: 'ReportTemplate.xml', content: ace.edit("reportTemplateEditor").getValue() });
        configFiles.push({ name: 'DashboardConnection.xml', content: ace.edit("connectionEditor").getValue() });

        dashboardConfig.repoId = this.repoId;
        dashboardConfig.configFiles = configFiles;

        var that = this;
        this.options.model.saveAllConfigFile(dashboardConfig,
            function success(data) {
                that.showMessage('Configuration files have been saved successfully');
            },
            function error(xhr) {
            });
    },

    ".save-config click": function () {
        var repoId = this.repoId;
        var dashboardConfig = {};
        var fileContent = '';

        this.selectedTab = !this.selectedTab ? "DashboardConfig" : this.selectedTab;

        if (this.selectedTab) {
            switch (this.selectedTab) {
                case "DashboardConfig":
                    dashboardConfig.repoId = repoId;
                    dashboardConfig.configFiles = [{ name: repoId, configType: "xml", content: ace.edit("repoConfigEditor-0").getValue()}];
                    break;
                case "ReportElement":
                    dashboardConfig.repoId = repoId;
                    dashboardConfig.configFiles = [{ name: 'ReportElement.xml', content: ace.edit("reportElementEditor").getValue()}];
                    break;
                case "DashboardQueryConfiguration":
                    dashboardConfig.repoId = repoId;
                    dashboardConfig.configFiles = [{ name: 'DashboardQueryConfiguration.xml', content: ace.edit("queryConfigEditor").getValue()}];
                    break;
                case "ReportTemplate":
                    dashboardConfig.repoId = repoId;
                    dashboardConfig.configFiles = [{ name: 'ReportTemplate.xml', content: ace.edit("reportTemplateEditor").getValue()}];
                    break;
                case "DashboardConnection":
                    dashboardConfig.repoId = repoId;
                    dashboardConfig.configFiles = [{ name: 'DashboardConnection.xml', content: ace.edit("connectionEditor").getValue()}];
                    break;
            }
        }

        var that = this;
        this.options.model.saveConfigFile(dashboardConfig,
            function success(data) {
                that.showMessage('Configuration file has been saved successfully');
            },
            function error(xhr) {
            });
    },

    ".nav-tabs a click": function (e) {
        this.selectedTab = e.attr('key');
        if (e.length > 0) {
            var selectedEditor = $(e[0].hash)[0].children[0].id;
            setTimeout(function () {
                var editor = ace.edit(selectedEditor);
                editor.resize();
            }, 500);
        }
    },

    ".panel-head-link click": function (el, event) {
        if (event.target.classList.contains("collapsed")) {
            this.repoId = event.target.id;
            this.populateEditors(event.target.id);
        }
    },

    ".menu click": function (el, event) {

        var action = event.target.id.split('_')[0];
        var repoId = event.target.id.split('_')[1];

        switch (action) {
            case "download":
                this.downloadConfiguration(repoId);
                break;
            case "upload":
                this.uploadConfiguration();
                break;
            case "duplicate":
                this.duplicateClient(repoId);
                break;
            case "delete":
                alert(repoId + " delete");
                break;
        }
    },

    showMessage: function (message) {
        var htm = "<div id='success_alert'></div>";
        $('body').find('#success_alert').remove();
        $('body').append(htm);
        $('#success_alert').sentrana_alert_dialog({
            title: 'Saving config file',
            message: message,
            onOk: function () {
                $('body').find('#success_alert').remove();
            }
        });
    },

    duplicateClient: function (copyFrom) {

        var that = this;
        // Define the dialog buttons
        var buttons = [
            {
                id: "btnDuplicate",
                label: "Duplicate",
                className: "btn-primary",
                callback: function () {
                    var newRepoId = $('#RepoId').val();

                    var dashboardConfig = {};
                    var configFiles = [];
                    configFiles.push({ name: 'DashboardConfig.xml', content: ace.edit("repoConfigEditor-0").getValue() });
                    configFiles.push({ name: 'ReportElement.xml', content: ace.edit("reportElementEditor").getValue() });
                    configFiles.push({ name: 'DashboardQueryConfiguration.xml', content: ace.edit("queryConfigEditor").getValue() });
                    configFiles.push({ name: 'ReportTemplate.xml', content: ace.edit("reportTemplateEditor").getValue() });
                    //configFiles.push({ name: 'DashboardQueryConfiguration.xml', content: "" });
                    //configFiles.push({ name: 'ReportTemplate.xml', content: "" });
                    configFiles.push({ name: 'DashboardConnection.xml', content: ace.edit("connectionEditor").getValue() });
                    dashboardConfig.RepoId = newRepoId;
                    dashboardConfig.configFiles = configFiles;

                    // Creating duplicate dashboard
                    that.options.model.saveAllConfigFile(dashboardConfig,
                        function success(data) {
                            $('#RepoId').val('');
                            that.renderAdministration();
                            that.showMessage('Configuration files has been duplicated successfully');
                        },
                        function error(xhr) {
                        });

                    // Close the dialog
                    dialogControl.closeDialog();

                    // Render client list
                    //that.renderAdministration();
                }
            },
            {
                id: "btnClose",
                label: "Close",
                className: "btn-default",
                callback: function () {
                    dialogControl.closeDialog();
                }
            }
        ];

        var dialogControl = $("#duplicateDashboard").sentrana_dialog({
            app: this,
            title: 'Duplicate Dashboard',
            buttons: buttons,
            closeOnEscape: true,
            modal: true,
            autoOpen: true
        }).control();
    }
});
});
