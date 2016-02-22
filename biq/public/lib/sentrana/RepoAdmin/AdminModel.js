can.Construct('Sentrana.Models.AdminModel', {}, {
    // Constructor
    init: function (app) {

        this.app = app;
    },

    getRepoList: function (params, success, error) {
        can.ajax({
            url: this.app.constructor.generateUrl("GetRepoList", {}),
            type: 'GET',
            dataType: 'json',
            async: false,
            cache: false,
            success: success,
            error: error
        });
    },

    readConfigFiles: function (repoId) {
        var config = '';
        can.ajax({
            url: this.app.constructor.generateUrl("ReadConfigFiles", { repoId: repoId }),
            dataType: "json",
            async: false,
            cache: false,
            success: function (data) {
                config = data;
                return config;
            },
            error: function (xhr) {
                var error = xhr.message;
            }
        });

        return config;
    },

    publishConfigFiles: function (configFiles, success, error) {
        $.ajax({
            url: this.app.constructor.generateUrl("PublishConfigChange"),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(configFiles),
            success: success,
            error: error
        });
    },

    saveConfigFile: function (configFile, success, error) {
        $.ajax({
            url: this.app.constructor.generateUrl("SaveConfigFile"),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(configFile),
            success: success,
            error: error
        });
    },

    saveAllConfigFile: function (configFiles, success, error) {
        $.ajax({
            url: this.app.constructor.generateUrl("SaveAllConfigFiles"),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(configFiles),
            success: success,
            error: error
        });
    },

    getClientConfigurationZip: function (clientName) {
        var url = this.app.constructor.generateUrl("getClientConfigurationZip", { clientName: clientName });
        $('<iframe>', { id: 'idown', src: url }).hide().appendTo('body');
    }

});
