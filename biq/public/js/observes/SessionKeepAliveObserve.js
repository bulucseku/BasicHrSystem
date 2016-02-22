can.Observe.extend("Sentrana.Models.SessionKeepAlive", {}, {
    // Constructor...
    init: function () {
        this.setup({
            createTime: undefined
        });
    },

    callServiceMethodToExtendSession: function (app) {
        var userInfo = app.retrieveUserInfo();
        if (userInfo) {
            $.ajax({
                url: app.constructor.generateUrl("ValidateSession", {
                    username: userInfo.userName
                }),
                dataType: "json",
                async: false
            });
        }
    }
});
