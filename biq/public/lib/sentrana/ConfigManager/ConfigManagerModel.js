can.Construct('Sentrana.Models.ConfigurationManagerModel', {}, {
    // Constructor
    init: function (app, serviceMethodMap) {
        this.serviceMethodMap = serviceMethodMap;
        this.app = app;
    },

    generateUrl: function(methodName, param){
        var serviceUrl = this.app.generateUrl? this.app.generateUrl(methodName, param): this.app.constructor.generateUrl(methodName, param);
        return serviceUrl;
    },

    getConfigurationGroup: function (groupId, success, error) {
        can.ajax({
            url: this.generateUrl(this.serviceMethodMap.getConfigurationGroup, { id: groupId }),
            type: 'GET',
            dataType: 'json',
            async: false,
            cache: false,
            success: success,
            error: error
        });
    },

    getAllConfigurationGroup: function (success, error) {
        can.ajax({
            url: this.generateUrl(this.serviceMethodMap.getAllConfigurationGroup),
            type: 'GET',
            dataType: 'json',
            async: false,
            cache: false,
            success: success,
            error: error
        });
    },

    getAllConfigurationGroupNames: function (success, error) {
        can.ajax({
            url: this.generateUrl(this.serviceMethodMap.getAllConfigurationGroupNames),
            type: 'GET',
            dataType: 'json',
            async: false,
            cache: false,
            success: success,
            error: error
        });
    },

    saveSelectedConfiguration: function (configGroup, success, error) {
        $.ajax({
            url: this.generateUrl(this.serviceMethodMap.saveSelectedConfiguration),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(configGroup),
            success: success,
            error: error
        });
    },

    saveAllConfiguration: function (configGroup, success, error) {
        $.ajax({
            url: this.generateUrl(this.serviceMethodMap.saveAllConfiguration),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(configGroup),
            success: success,
            error: error
        });
    },

    saveConfigurationGroup: function (configGroup, success, error) {
        $.ajax({
            url: this.generateUrl(this.serviceMethodMap.saveConfigurationGroup),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(configGroup),
            success: success,
            error: error
        });
    },

    deleteConfigurationGroup: function (configGroup, success, error) {
        $.ajax({
            url: this.generateUrl(this.serviceMethodMap.deleteConfigurationGroup),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(configGroup),
            success: success,
            error: error
        });
    },

    publishConfigFiles: function (configGroup, success, error) {
        $.ajax({
            url: this.generateUrl(this.serviceMethodMap.publishConfigFiles),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify(configGroup),
            success: success,
            error: error
        });
    },

    uploadConfigFiles: function (formData, success, error) {
        $.ajax({
            url: this.generateUrl(this.serviceMethodMap.uploadConfigFiles),
            type: 'POST',
            contentType: false,
            dataType: 'json',
            data: formData,
            processData: false,
            cache: false,
            success: success,
            error: error
        });
    },

    downloadConfigurationGroup  : function (groupId) {
        var url = this.generateUrl(this.serviceMethodMap.downloadConfigurationGroup, { id: groupId });
        $('<iframe>', { id: 'idownloadconfiggroup', src: url }).hide().appendTo('body');
    }

});
