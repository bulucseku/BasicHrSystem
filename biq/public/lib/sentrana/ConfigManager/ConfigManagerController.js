can.Control.extend("Sentrana.Controllers.ConfigurationManagerController", {
    pluginName: 'sentrana_configuration_manager',
    defaults: {
        basePath: "lib/sentrana/ConfigManager/",
        configManagerTemplate: "templates/config-manager.ejs",
        configGroupsTemplate: "templates/config-groups.ejs",
        configGroupTemplate: "templates/config-group.ejs",
        configAddGroupTemplate: "templates/add-config-group.ejs",
        configDuplicateGroupTemplate: "templates/duplicate-config-group.ejs",
        configAddNewTemplate: "templates/add-new-config.ejs",
        configConfirmDeleteTemplate: "templates/confirm-delete-config.ejs",
        configEditorContainerTemplate: "templates/config-editor-continer.ejs",
        configUploadTemplate: "templates/config-upload.ejs",
        serviceMethodMap: {
            "getConfigurationGroup": "GetConfigurationGroup",
            "getAllConfigurationGroup": "GetAllConfigurationGroup",
            "getAllConfigurationGroupNames": "getAllConfigurationGroupNames",
            "saveSelectedConfiguration": "SaveSelectedConfiguration",
            "saveAllConfiguration": "SaveAllConfiguration",
            "saveConfigurationGroup": "SaveConfigurationGroup",
            "deleteConfigurationGroup": "DeleteConfigurationGroup",
            "publishConfigFiles": "PublishConfigFiles",
            "uploadConfigFiles": "UploadConfigFiles",
            "downloadConfigurationGroup": "DownloadConfigurationGroup"

        },
        labels: {
            "groupsHeader": "Configuration Groups",
            "groupName": "configuration group",
            "addGroupBtnLitle": "Add configuration group"
        },
        editorsMaxLine: 50,
        editorsMinLine: 50,
        fixedConfigurations: null,
        model: null,
        addNewGroup: true,
        sidebarBgColor: '#613474',
        sidebarColor: '#fff'
    }
},
{
    init: function () {
        this.app = this.options.app;
        this.selectedGroup = null;
        this.configurationGroups = [];
        this.options.model = new Sentrana.Models.ConfigurationManagerModel(this.app, this.options.serviceMethodMap);
        this.updateView();
    },

    update: function (options) {
        this._super(options);
        this.app = this.options.app;
        this.updateView();
    },

    updateView: function () {
        var that = this;
        this.blockElement(this.element);
        setTimeout(function() {
            that.renderConfigManager();
        },100);
    },

    initLeftSideBar: function (sideBarWidth) {
        var that = this;
        //Add smart sidebar for Config list
        this.sideBar = that.element.find(".leftcolumn").smartsidebar({
            title: that.options.labels.groupsHeader,
            position: "left",
            dataContainerElement: that.element.find(".contentcolumn"),
            sidebarWidth: sideBarWidth,
            autoHeight: true,
            autoHeightMargin: $('#main-navbar').outerHeight(true),
            bgColor: this.options.sidebarBgColor,
            color: this.options.sidebarColor
        });
    },

    showErrorDialog: function (title, baseMsg, jqXHR) {
        var errMsg = this.buildErrorMessage(baseMsg, jqXHR);
        errMsg = errMsg.replace('org.xml.sax.SAXParseException;', 'Invalid content at ').replace('Content is not allowed in prolog.', '');
        Sentrana.AlertDialog(title, errMsg);
    },

    buildErrorMessage: function (baseMsg, jqXHR) {
        var errMsg = baseMsg;
        if (jqXHR.responseText) {
            errMsg += ": " + jqXHR.responseText;
        }
        return errMsg;
    },

    renderConfigManager: function () {
        this.element.html(can.view(this.options.basePath + this.options.configManagerTemplate, {}));
        if (this.isMSIE()) {
            this.element.find(".config-editor-container").addClass("class-msie");
        }
        this.configurationGroups = [];
        var that = this;

        this.initLeftSideBar(280);

        this.options.model.getAllConfigurationGroupNames(function (data) {

            for (var i = 0; i < data.length; i++) {
                that.configurationGroups.push(data[i]);
            }

            that.renderGroupList();
            that.renderCofigurationEditorContainer();
            var selectedGroup = that.options.selectedGroup;
            if(selectedGroup){
                $('#configgroup-'+ selectedGroup).click();
                $('#collapse' + selectedGroup).collapse('show');
            }else{
                $('.panel-collapse:first').collapse('show');
            }
            that.unBlockElement(that.element);

        }, function (err) {
            that.showErrorDialog("Failed to load", "Failed to load " + that.options.labels.groupName, err);
            that.unBlockElement();
        });

    },

    //http://stackoverflow.com/questions/19999388/jquery-check-if-user-is-using-ie
    isMSIE: function () {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            return true;
        }
        return false;
    },

    ".config-editor-tab click": function (el, ev) {
        var selectedId = this.getSelectedConfig().id;
        var id = $(el).find("a").attr("key").split("-")[3];

        if (selectedId === id) {
            return;
        }

        this.blockElement();

        this.setSelectedConfig(id);
        var that = this;
        setTimeout(function() {
            ace.edit("editor-" + that.selectedGroup.id + "-" + id).focus();
            that.unBlockElement();
        },500);

        this.clearSearchAndReplaceText();
    },

    setSelectedConfig: function (configId) {
        var configurations = this.selectedGroup? this.selectedGroup.configurations: null;
        if (!configurations || !configurations.length) {
            return;
        }

        if (!configId) {
            configId = configurations[0].id;
        }

        for (var i = 0; i < configurations.length; i++) {
            if (configurations[i].id.toLowerCase() === configId.toLowerCase()) {
                configurations[i].isSelected = true;
                this.loadEditorInfo(configurations[i]);
            }
            else {
                configurations[i].isSelected = false;
            }
        }
    },

    loadEditorInfo: function(config){
        if (config) {
            this.clearEditorInfo();

            if (config.createBy) {
                $('#createBy-label').show();
                $('#createBy-value').text(config.createBy).show();
            }

            if (config.updateBy) {
                $('#updateBy-label').show();
                $('#updateBy-value').text(config.updateBy).show();
            }

            if (config.createDate) {
                $('#createDate-label').show();
                $('#createDate-value').text(config.createDate).show();
            }

            if (config.updateDate) {
                $('#updateDate-label').show();
                $('#updateDate-value').text(config.updateDate).show();
            }
        }
    },

    clearEditorInfo: function(){
        $('#createBy-label').hide();
        $('#updateBy-label').hide();
        $('#createDate-label').hide();
        $('#updateDate-label').hide();
        $('#createBy-value').hide();
        $('#updateBy-value').hide();
        $('#createDate-value').hide();
        $('#updateDate-value').hide();
    },

    getSelectedConfig: function () {
        if (!this.selectedGroup) {
            return null;
        }
        var selected = $.grep(this.selectedGroup.configurations, function(config) {
            return config.isSelected === true;
        });

        return selected[0];
    },

    renderCofigurationEditorContainer: function() {
      this.configurationEditorContainer = this.element.find(".config-editor-container");

      var configurationEditorCollapsible = this.configurationEditorContainer.sentrana_collapsible_container({
          title: "Configuration Editor",
          showHeader: true,
          showBorder: true,
          allowCollapsible: true
      }).control();

      this.configurationEditorPanel = configurationEditorCollapsible.getContainerPanel();
      this.loadConfigurationsToEditor();
    },

  loadConfigurationsToEditor: function () {
      if (!this.selectedGroup) {
          this.configurationEditorPanel.html("");
          return;
      }

      var isFixed = this.isFixedConfiguration(), configs = this.selectedGroup.configurations;
      if (isFixed) {
          configs = [];
          for (var i = 0; i < this.options.fixedConfigurations.length; i++) {
              var fixedConfig = this.options.fixedConfigurations[i];
              if (!this.isConfigExists(fixedConfig)) {
                  var cnf = { id: this.makeIdFromName(fixedConfig), name: fixedConfig, content: "" };
                  if (this.selectedGroup.configurations.length === 0) {
                      cnf.isSelected = true;
                  }
                  this.selectedGroup.configurations.push(cnf);
              }
          }

          for (i = 0; i < this.selectedGroup.configurations.length; i++) {
              var config = this.selectedGroup.configurations[i];
              var index = this.getFixedConfigIndex(this.makeIdFromName(config.name.toLowerCase()));
              if (index > -1) {
                  configs.push({ name: this.options.fixedConfigurations[index], id: this.makeIdFromName(config.name.toLowerCase()), isSelected: config.isSelected });
              }
          }
      }

      this.configurationEditorPanel.html(can.view(this.options.basePath + this.options.configEditorContainerTemplate, { groupId: this.selectedGroup.id, configs: configs, isFixed: isFixed }));
      if (this.selectedGroup.configurations.length > 0) {
          this.populateEditors(this.selectedGroup, this.selectedGroup.configurationType);
      }
  },

  isFixedConfiguration: function() {
      return this.options.fixedConfigurations && this.options.fixedConfigurations.length;
  },

  isConfigExists: function(fixedConfig) {
        var configurations = this.selectedGroup.configurations;
        for (var i = 0; i < configurations.length; i++) {
            if (configurations[i].id.toLowerCase() === fixedConfig.toLowerCase()) {
                return true;
            }
        }
        return false;
    },

    getFixedConfigIndex: function (config) {
        var configurations = this.options.fixedConfigurations;
        for (var i = 0; i < configurations.length; i++) {
            if (configurations[i].toLowerCase() === config.toLowerCase()) {
                return i;
            }
        }
        return -1;
    },

   renderGroupList: function() {
        this.configurationGroupListlement = this.element.find(".config-group-list");

        if (this.options.addNewGroup) {
            var that = this;

            this.sideBar.find(".button_wrapper").prepend('<i title="'+ this.options.labels.addGroupBtnLitle + '" class="fa fa-plus add-config-group"><i/>');
            this.sideBar.find(".add-config-group").off("click");
            this.sideBar.find(".add-config-group").on("click", function () {
                that.addConfigurationGroup();
                return false;
            });
        }
        this.loadGroupsToPanel();
    },

    loadGroupsToPanel: function () {
        if (this.configurationGroups.length) {
            this.selectedGroup = this.configurationGroups[0];
            this.loadConfigurationsFormserver(this.setSelectedConfig);
        } else {
            this.selectedGroup = null;
        }

        this.configurationGroupListlement.html(can.view(this.options.basePath + this.options.configGroupsTemplate, { groups: this.configurationGroups }));
    },

    loadConfigurationsFormserver: function (callback) {
        var that = this;
        that.blockElement();
        this.options.model.getConfigurationGroup(this.selectedGroup.id, function (data) {
            that.selectedGroup.configurations = data.configurations;
            callback.call(that);
            that.unBlockElement();
        }, function (err) {
            that.showErrorDialog("Failed to load", "Failed to load configurations of group " + that.selectedGroup.name, err);
            that.unBlockElement();
        });
    },

    ".config-group-panel click": function (el, ev) {
        var groupId = $(el).attr("id").split('-')[1];

        if (this.selectedGroup.id === groupId) {
            return;
        }

        this.blockElement();

        var that= this, selectedGroup = this.getGroupById(groupId);
        if (selectedGroup) {
            setTimeout(function() {
                that.updateSelectedGroup(selectedGroup);
                that.unBlockElement();
            }, 100);
        }
    },

    blockElement: function(el) {
        var element = el || this.element.find(".config-editor-container");
        var html = '<div class="loading"><p class="small-waitingwheel"><img src="images/loader-white.gif"/></p></div>';
        this.options.app.blockElement(element, html);
    },

    unBlockElement: function (el) {
        var element = el || this.element.find(".config-editor-container");
        this.options.app.unBlockElement(element);
    },

    updateSelectedGroup: function (selectedGroup) {

        if (selectedGroup) {
            this.selectedGroup = selectedGroup;
        } else {
            if (this.configurationGroups.length > 0) {
                this.selectedGroup = this.configurationGroups[0];
            }
        }

        if (this.selectedGroup.configurations) {
            this.displayConfigurations();
        } else {
            this.loadConfigurationsFormserver(this.displayConfigurations);
        }

    },

    displayConfigurations: function() {
        var config = this.getSelectedConfig(), configId;
        if (config) {
            configId = config.id;
        }

        this.setSelectedConfig(configId);

        this.loadConfigurationsToEditor();

        this.element.find(".config-group-panel").removeClass("panel-selected");
        this.element.find(".config-group-panel#configgroup-" + this.selectedGroup.id).addClass("panel-selected");

    },

    getGroupById: function (groupId) {
        var seletced= $.grep(this.configurationGroups, function(group) {
            return group.id === groupId;
        });

        return seletced[0];
    },

    ".menu click": function (el, event) {

        var action = event.target.id.split('_')[0];

        switch (action) {
            case "download":
                this.options.model.downloadConfigurationGroup(this.selectedGroup.id);
                break;
            case "upload":
                this.uploadConfiguration();
                break;
            case "duplicate":
                this.duplicateGroup();
                break;
            case "delete":
                this.deleteGroup(el);
                break;
            default:
                break;
        }
    },

    uploadConfiguration: function () {

        var that = this;
        if ($("#upload-configuration-dialog").length) {
            $("#upload-configuration-dialog").remove();
        }

        $("<div></div>").attr('id', 'upload-configuration-dialog').appendTo('body');

        $("#upload-configuration-dialog").html(can.view(this.options.basePath + this.options.configUploadTemplate, {}));

        var buttons = [
            {
                id: "btnUpload",
                label: "Upload",
                className: "btn-primary",
                callback: function () {
                    if ($("#input-config-file-validation-msg")[0].innerHTML.length > 0) {
                        return;
                    }

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
            title: 'Upload Configuration File(s)',
            buttons: buttons,
            closeOnEscape: true,
            modal: true,
            autoOpen: true
        }).control();

        document.getElementById('upload-config-file-input').addEventListener('change', function (e) {
            that.validateFiles(this);
        });

    },

    populateUploadedConfig: function () {
            var that = this;
            var formData = new FormData();
            var files = $('#upload-config-file-input')[0].files;

            $.each(files, function (index, file) {
                formData.append('upload-config-file-input' + index, file);
            });

            this.options.model.uploadConfigFiles(formData, function (data) {
                that.loadConfigsFromFile(data);
            }, function (err) {
                that.showErrorDialog("Failed to upload", "Failed to upload selected file(s)", err);
            });
        },

        loadConfigsFromFile: function (configFiles) {

            for (var i = 0; i < configFiles.length; i++) {
                var fileName = configFiles[i][0],
                    nameWithoutExtension = fileName.substr(0, fileName.lastIndexOf('.')),
                    id = this.makeIdFromName(nameWithoutExtension),
                    fileContent = configFiles[i][1];

                this.clearEditor("editor-" + this.selectedGroup.id + "-" + id.toLowerCase());
                this.populateEditor("editor-" + this.selectedGroup.id + "-" + id.toLowerCase(), fileContent);

            }
        },

    validateFiles: function (fileInput) {

        $("#input-config-file-validation-msg")[0].innerHTML = "";
        var files = fileInput.files;
        var len = files.length;
        var totalLength = this.selectedGroup.configurations.length;
        if (len <= totalLength) {
            for (var i = 0; i < len; i++) {
                if (!this.validateFile(files[i])) {
                    $("#input-config-file-validation-msg")[0].innerHTML = "Invalid file name or format!! Please select valid configuration files with valid file name and format.";
                    return;
                }
            }

        } else {
                $("#input-config-file-validation-msg")[0].innerHTML = "Maximum " + totalLength + " configuration files can be uploaded!!";
        }
    },

    validateFile: function (file) {
        var extension = file.name.substr(file.name.lastIndexOf('.') + 1),
            nameWithoutExtension = file.name.substr(0, file.name.lastIndexOf('.'));
        if (extension !== this.selectedGroup.configurationType) {
            return false;
        }

        if (!this.isConfigExist(nameWithoutExtension)) {
            return false;
        }

        return true;
    },

    deleteGroup: function (el) {
        var that = this;
        Sentrana.ConfirmDialog("Confirm Delete", "Are you sure to delete?",
                function () {
                    that.deleteConfigGroup(el);
                }, function () {
                    return false;
                }, true);
    },

    deleteConfigGroup: function (el) {
        var that = this;
        this.options.model.deleteConfigurationGroup(this.selectedGroup, function (data) {
           that.removeGroups(that.selectedGroup.id);
           that.loadGroupsToPanel();
           that.updateSelectedGroup();
        }, function (err) {
           that.showErrorDialog("Failed to delete", "Failed to delete " + that.options.labels.groupName, err);
        });
    },

    getGroupIndex: function(id) {
        for (var i = 0; i < this.configurationGroups.length; i++) {
            if (this.configurationGroups[i].id === id) {
                return i;
            }
        }

        return -1;
    },

    removeGroups: function(id) {
        var index = this.getGroupIndex(id);
        if (index > -1) {
            this.configurationGroups.splice(index, 1);
        }
    },

    duplicateGroup: function () {

        var that = this;
        if ($("#duplicate-configuration-group-dialog").length) {
            $("#duplicate-configuration-group-dialog").remove();
        }
        $("<div></div>").attr('id', 'duplicate-configuration-group-dialog').appendTo('body');
        $("#duplicate-configuration-group-dialog").html(can.view(this.options.basePath + this.options.configDuplicateGroupTemplate, { groupName: this.options.labels.groupName}));
        $(".input-duplicate-config-group-error").html("").hide();

        var buttons = [
            {
                id: "btnAddConfigGroup",
                label: "Duplicate",
                className: "btn-primary",
                callback: function () {
                    if (!that.validateGroupDuplicateInput()) {
                        return;
                    }

                    that.duplicateConfigurationGroup(dialogControl);
                }
            },
            {
                id: "btnCloseConfigGroup",
                label: "Close",
                className: "btn-default",
                callback: function () {
                    dialogControl.closeDialog();
                }
            }
        ];

         var dialogControl = $("#duplicate-configuration-group-dialog").sentrana_dialog({
            app: this,
            title: 'Duplicate ' + this.options.labels.groupName,
            buttons: buttons,
            closeOnEscape: true,
            modal: true,
            autoOpen: true
        }).control();

        return false;

    },

    duplicateConfigurationGroup: function (dialogControl) {
        var groupName = $(".input-duplicate-config-group-name").val(), groupId = this.makeIdFromName(groupName),
            format = this.selectedGroup.configurationType;
        var configurations = [];

        for (var i = 0; i < this.selectedGroup.configurations.length; i++) {
            var configs = this.selectedGroup.configurations,
                config = { id: configs[i].id, name: configs[i].name, content: configs[i].content };

            configurations.push(config);
        }

        var that = this, group = { id: groupId, name: groupName, configurationType: format, configurations: configurations };

        this.options.model.saveConfigurationGroup(group, function (data) {
            that.configurationGroups.push(group);
            that.configurationGroupListlement.find(".panel-group").append(can.view(that.options.basePath + that.options.configGroupTemplate, { group: { id: groupId, name: groupName }, colapse: false }));
            that.updateSelectedGroup(group);
            dialogControl.closeDialog();
        }, function (err) {
            var errMsg = that.buildErrorMessage("Failed to duplicate " + that.options.labels.groupName, err);
            $(".input-duplicate-config-group-error").html(errMsg).show();
        });
    },

    validateGroupDuplicateInput: function () {

        var groupName = $(".input-duplicate-config-group-name").val();

        if ($.trim(groupName) === "") {
            $(".input-duplicate-config-group-error").html("Please enter " + this.options.labels.groupName + " name").show();
            $(".input-duplicate-config-group-name").focus();
            return false;
        }

        if (this.isGroupExist(groupName)) {
            $(".input-duplicate-config-group-error").html("Provided name is already in use").show();
            $(".input-duplicate-config-group-name").focus();
            return false;
        }

        return true;

    },

    addConfigurationGroup: function () {

        var that = this;
        if ($("#add-configuration-group-dialog").length) {
            $("#add-configuration-group-dialog").remove();
        }
        $("<div></div>").attr('id', 'add-configuration-group-dialog').appendTo('body');
        $("#add-configuration-group-dialog").html(can.view(this.options.basePath + this.options.configAddGroupTemplate, { groupName: this.options.labels.groupName}));
        $(".input-config-group-error").html("").hide();

        var buttons = [
            {
                id: "btnAddConfigGroup",
                label: "Add",
                className: "btn-primary",
                callback: function () {
                    if (!that.validateGroupCreationInput()) {
                        return;
                    }

                    that.addNewConfigurationGroup(dialogControl);
                }
            },
            {
                id: "btnCloseConfigGroup",
                label: "Close",
                className: "btn-default",
                callback: function () {
                    dialogControl.closeDialog();
                }
            }
        ];

       var dialogControl = $("#add-configuration-group-dialog").sentrana_dialog({
            app: this,
            title: 'Add new ' + this.options.labels.groupName,
            buttons: buttons,
            closeOnEscape: true,
            modal: true,
            autoOpen: true
        }).control();

        return false;

    },

    " .add-new-configuration click": function (el, ev) {

        var that = this;
        if ($("#add-new-configuration-dialog").length) {
            $("#add-new-configuration-dialog").remove();
        }

        $("<div></div>").attr('id', 'add-new-configuration-dialog').appendTo('body');
        $("#add-new-configuration-dialog").html(can.view(this.options.basePath + this.options.configAddNewTemplate, {}));
        $(".input-new-config-error").html("").hide();

        var buttons = [
            {
                id: "btnAddConfiguration",
                label: "Add",
                className: "btn-primary",
                callback: function () {
                    if (!that.validateConfigCreationInput()) {
                        return;
                    }

                    that.addNewConfiguration(el, dialogControl);
                }
            },
            {
                id: "btnCloseConfiguration",
                label: "Close",
                className: "btn-default",
                callback: function () {
                    dialogControl.closeDialog();
                }
            }
        ];

        var dialogControl = $("#add-new-configuration-dialog").sentrana_dialog({
            app: this,
            title: 'Add new configuration',
            buttons: buttons,
            closeOnEscape: true,
            modal: true,
            autoOpen: true
        }).control();

        return false;
    },

    validateGroupCreationInput: function () {

        var groupName = $(".input-config-group-name").val();

        if ($.trim(groupName) === "") {
            $(".input-config-group-error").html("Please enter " + this.options.labels.groupName + " name").show();
            $(".input-config-group-name").focus();
            return false;
        }

        if (this.isGroupExist(groupName)) {
            $(".input-config-group-error").html("Provided name is already in use").show();
            $(".input-config-group-name").focus();
            return false;
        }

        return true;

    },

    isGroupExist: function (name) {
        var seletced = $.grep(this.configurationGroups, function (group) {
            return group.name === name;
        });

        return seletced.length > 0;
    },

    validateConfigCreationInput: function () {

        var name = $(".input-new-config-name").val();

        if ($.trim(name) === "") {
            $(".input-new-config-error").html("Please enter configuration name").show();
            $(".input-new-config-name").focus();
            return false;
        }

        if (this.isConfigExist(name)) {
            $(".input-new-config-error").html("Configuration name is already in use").show();
            $(".input-new-config-name").focus();
            return false;
        }

        return true;
    },

    isConfigExist: function (name) {
        var seletced = $.grep(this.selectedGroup.configurations, function (config) {
            return config.name.toLowerCase() === name.toLowerCase();
        });

        return seletced.length > 0;
    },

    addNewConfiguration: function (el, dialogControl) {

        var name = $(".input-new-config-name").val(), id = this.makeIdFromName(name);
        var that = this, config = { id: id, name: name, content: ""},
        group = { id: this.selectedGroup.id, name: this.selectedGroup.name, configurationType: this.selectedGroup.configurationType, configurations: [config] };

        this.options.model.saveSelectedConfiguration(group, function (data) {
            that.selectedGroup.configurations.push(config);
            that.setSelectedConfig(id);
            that.updateSelectedGroup(that.selectedGroup);
            dialogControl.closeDialog();
        }, function (err) {
            var errMsg = that.buildErrorMessage("Failed to add configuration", err);
            $(".input-config-group-error").html(errMsg).show();
        });
    },

     makeIdFromName: function(name) {
         return  name.replace(/[^a-zA-Z0-9]/g, "");
    },

     addNewConfigurationGroup: function (dialogControl) {
        var groupName = $(".input-config-group-name").val(), groupId = this.makeIdFromName(groupName),
            format = $('input[name="config-editor-format"]:checked').val(), configurations = [];

        if (this.options.fixedConfigurations && this.options.fixedConfigurations.length) {
            for (var i = 0; i < this.options.fixedConfigurations.length; i++) {
                var cnf = { id: this.makeIdFromName(this.options.fixedConfigurations[i]), name: this.options.fixedConfigurations[i], content: "" };
                configurations.push(cnf);
            }
        }

        var that = this, group = { id: groupId, name: groupName, configurationType: format, configurations: configurations };

        this.options.model.saveConfigurationGroup(group, function (data) {
            that.configurationGroups.push(group);
            that.configurationGroupListlement.find(".panel-group").append(can.view(that.options.basePath + that.options.configGroupTemplate, { group: { id: groupId, name: groupName }, colapse: false }));
            that.updateSelectedGroup(group);
            dialogControl.closeDialog();
        }, function (err) {
            var errMsg = that.buildErrorMessage("Failed to add " + that.options.labels.groupName, err);
            $(".input-config-group-error").html(errMsg).show();
        });
    },

    ".close-tab click": function (el, ev) {
        var that = this;

            if ($("#confirm-delete-configuration-dialog").length) {
                $("#confirm-delete-configuration-dialog").remove();
            }

            $("<div></div>").attr('id', 'confirm-delete-configuration-dialog').appendTo('body');

            $("#confirm-delete-configuration-dialog").html(can.view(this.options.basePath + this.options.configConfirmDeleteTemplate, {}));

            var id = $(el).attr("id").split("-")[3];

            var buttons = [
            {
                id: "btnAddConfiguration",
                label: "OK",
                className: "btn-primary",
                callback: function () {

                    that.removeConfig(id);
                    that.deleteSelectedConfiguration(dialogControl);

                }
            },
            {
                id: "btnCloseConfiguration",
                label: "Cancel",
                className: "btn-default",
                callback: function () {
                    dialogControl.closeDialog();
                }
            }
        ];

            var dialogControl = $("#confirm-delete-configuration-dialog").sentrana_dialog({
                app: this,
                title: 'Confirm Dlete',
                buttons: buttons,
                closeOnEscape: true,
                modal: true,
                autoOpen: true
            }).control();

            return false;

    },

   deleteSelectedConfiguration: function (dialogControl) {
        var that = this;
        this.options.model.saveAllConfiguration(this.selectedGroup, function (data) {
            dialogControl.closeDialog();
            that.reloadGroup();
        }, function (err) {
            that.showErrorDialog("Failed to delete", "Failed to delete configuration", err);
        });
    },

    reloadGroup: function() {
        this.setSelectedConfig();
        this.updateSelectedGroup();
    },

    getConfigIndex: function (id) {
        var configurations = this.selectedGroup.configurations;
        for (var i = 0; i < configurations.length; i++) {
            if (configurations[i].id.toLowerCase() === id.toLowerCase()) {
                return i;
            }
        }
        return -1;
    },

    removeConfig: function (id) {
        var index = this.getConfigIndex(id);
        if (index > -1) {
            this.selectedGroup.configurations.splice(index, 1);
        }
    },

    populateEditors: function (group, format) {
        var configurations = group.configurations;
        for (var i = 0; i < configurations.length; i++) {
            if (this.isFixedConfiguration()) {
                var index = this.getFixedConfigIndex(this.makeIdFromName(configurations[i].name.toLowerCase()));
                if (index > -1) {
                    this.clearEditor("editor-" + group.id + "-" + configurations[i].id.toLowerCase());
                    this.populateEditor("editor-" + group.id + "-" + configurations[i].id.toLowerCase(), configurations[i].content, format);
                }
            } else {
                this.clearEditor("editor-" + group.id + "-" + configurations[i].id.toLowerCase());
                this.populateEditor("editor-" + group.id + "-" + configurations[i].id.toLowerCase(), configurations[i].content, format);
            }

            // Load editor info for selected config
            if (configurations[i].isSelected) {
                this.loadEditorInfo(configurations[i]);
            }
        }
    },

    clearEditor: function (editorId) {
        var editor = ace.edit(editorId);
        editor.setValue("", -1);
    },

    populateEditor: function (editorId, contents, format) {
        if (!format) {
            format = this.selectedGroup.configurationType || "xml";
        }

        var editor = ace.edit(editorId);
        editor.setTheme("ace/theme/chrome");
        editor.getSession().setMode("ace/mode/" + format);
        editor.setValue(contents, -1);
        editor.setOptions({ maxLines: this.options.editorsMaxLine });
        editor.setOptions({ minLines: this.options.editorsMinLine });
        editor.resize(true);
        editor.focus();
    },

    getConfigById: function(configId) {
        var selected = $.grep(this.selectedGroup.configurations, function (config) {
            return config.id.toLowerCase() === configId.toLowerCase();
      });

        return selected[0];
    },

    ".save-config click": function () {

        var selectedTab = this.element.find(".config-editor-tab.active");
        if (!selectedTab.length) {
            return;
        }
        var id = selectedTab.find("a").attr("key").split("-")[3],
            content = ace.edit("editor-" + this.selectedGroup.id + "-" + id).getValue();

        var config = this.getConfigById(id);

        if (!config) {
            return;
        }

        config.content = content;

        var group = { id: this.selectedGroup.id, name: this.selectedGroup.name, configurationType: this.selectedGroup.configurationType, configurations: [config] };
        var that = this;
        this.blockElement();
        setTimeout(function() {
            that.saveConfigToServer(group);
        },100);

    },

    saveConfigToServer: function(group) {
        var that = this;
        this.options.model.saveSelectedConfiguration(group, function (data) {
            Sentrana.AlertDialog("Saved successfully", "Configuration saved successfully");
            that.unBlockElement();
        }, function (err) {
            that.showErrorDialog("Failed to save", "Failed to save configuration", err);
            that.unBlockElement();
        });
    },

    ".save-all-config click": function () {
        var configurations = this.selectedGroup.configurations;
        for (var i = 0; i < configurations.length; i++) {
            if (this.isFixedConfiguration()) {
                var index = this.getFixedConfigIndex(this.makeIdFromName(configurations[i].name.toLowerCase()));
                if (index > -1) {
                    configurations[i].content = ace.edit("editor-" + this.selectedGroup.id + "-" + configurations[i].id.toLowerCase()).getValue();
                }
            } else {
                configurations[i].content = ace.edit("editor-" + this.selectedGroup.id + "-" + configurations[i].id.toLowerCase()).getValue();
            }
        }

        var group = { id: this.selectedGroup.id, name: this.selectedGroup.name, configurationType: this.selectedGroup.configurationType, configurations: configurations };
        var that = this;

        this.blockElement();
        setTimeout(function () {
            that.saveAllConfigToServer(group);
        }, 100);

    },

    saveAllConfigToServer: function (group) {
        var that = this;
        this.options.model.saveAllConfiguration(group, function (data) {
            Sentrana.AlertDialog("Saved successfully", "All configurations saved successfully");
            that.unBlockElement();

        }, function (err) {
            that.showErrorDialog("Failed to save", "Failed to save configurations", err);
            that.unBlockElement();
        });
    },

    ".publish-config click": function () {
        var that = this;

        this.blockElement();
        setTimeout(function () {
            that.options.model.publishConfigFiles(that.selectedGroup, function (data) {
                Sentrana.AlertDialog("Published successfully", "All configurations published successfully");
                that.unBlockElement();
            }, function (err) {
                that.showErrorDialog("Failed to publish", "Failed to publish configurations", err);
                that.unBlockElement();
            });
        }, 100);


    },

    "#txtSearch keypress": function (el, ev) {
         if (ev.keyCode === 13) {
            this.findNextMatch();
        }
    },

    "#txtSearch keyup": function (el, ev) {
        var searchText = $('#txtSearch').val();
        this.doSearch(searchText);
        this.disableEnableSearchButtons();
    },

    doSearch: function (searchText) {
        var editor = this.getCurrentEditor();
        editor.find('needle', {
            backwards: false,
            wrap: true,
            caseSensitive: false,
            range: null,
            wholeWord: false,
            regExp: false
        });

        editor.$search.set({
            needle: searchText
        });

        var range = editor.$search.find(editor.getSession());
        if (range) {
            editor.getSession().getSelection().setSelectionRange(range, false);
        }
    },

    disableEnableSearchButtons: function () {
        var searchText = $('#txtSearch').val();
        var replaceText = $('#txtReplace').val();

        // Disable/Enable left & right button
        if (searchText === '') {
            $('.ace-search-btn-left').prop("disabled", true);
            $('.ace-search-btn-right').prop("disabled", true);
            $('#btnReplace').prop("disabled", true);
            $('#btnReplaceAll').prop("disabled", true);
        }
        else {
            $('.ace-search-btn-left').prop("disabled", false);
            $('.ace-search-btn-right').prop("disabled", false);
            $('#btnReplace').prop("disabled", false);
            $('#btnReplaceAll').prop("disabled", false);
        }
    },

    getCurrentEditor: function () {
        var config = this.getSelectedConfig();
        var editor = ace.edit("editor-" + this.selectedGroup.id + "-" + config.id.toLowerCase());
        return editor;
    },

    findNextMatch: function () {
        var searchText = $('#txtSearch').val();
        var editor = this.getCurrentEditor();

        editor.find('needle', {
            backwards: true,
            wrap: true,
            caseSensitive: false,
            range: null,
            wholeWord: false,
            regExp: false
        });

        editor.$search.set({ needle: searchText });
        editor.findNext();

        var range = editor.$search.find(editor.getSession());
        if (range) {
            editor.getSession().getSelection().setSelectionRange(range, false);
        }
    },

    ".ace-search-btn-left click": function () {
        this.findPrevMatch();
    },

    findPrevMatch: function(){
        var searchText = $('#txtSearch').val();
        var editor = this.getCurrentEditor();

        editor.find('needle', {
            backwards: false,
            wrap: true,
            caseSensitive: false,
            range: null,
            wholeWord: false,
            regExp: false
        });

        editor.$search.set({ needle: searchText });
        editor.findPrevious();

        var range = editor.$search.find(editor.getSession());
        if (range) {
            editor.getSession().getSelection().setSelectionRange(range, false);
        }
    },

    ".ace-search-btn-right click": function () {
        this.findNextMatch();
    },

    "#btnReplace click": function () {
        var editor = this.getCurrentEditor();
        editor.replace($('#txtReplace').val());
    },

    "#btnReplaceAll click": function () {
        var editor = this.getCurrentEditor();
        editor.replaceAll($('#txtReplace').val());
    },

    ".search-box-close click": function () {
        $('#txtSearch').val('');
        this.disableEnableSearchButtons();
        this.doSearch('');
    },

    ".replace-box-close click": function () {
        $('#txtReplace').val('');
    },

    clearSearchAndReplaceText: function(){
        $('#txtSearch').val('');
        $('#txtReplace').val('');
        this.disableEnableSearchButtons();
        this.doSearch('');
    }

});
