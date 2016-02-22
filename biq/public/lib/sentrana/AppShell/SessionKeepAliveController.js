steal("lib/sentrana/AppShell/SentranaApplicationShell.js", function() {

    Sentrana.Controllers.SessionKeepAliveController = can.Construct.extend({
        callBeforeTimeoutSeconds: 300, // 5 Minutes
        maxInterval: 86400 // 1 Day
    }, {
        init: function(app) {
            var that = this;
            that.keepAliveInterval = null;
            that.app = app;

            Sentrana.ApplicationShell.AppState.bind('change', function(ev, attr, how, newVal, oldVal) {
                if (attr === 'sessionTimeOut' || attr === 'sessionRenewTime') {
                    var sessionTimeOut = Sentrana.ApplicationShell.AppState.attr('sessionTimeOut');

                    if (that.isValidTimeOut(sessionTimeOut)) {
                        that.start(sessionTimeOut);
                    } else {
                        that.stop();
                    }
                }
            });
        },

        callKeepAliveService: function() {
            var that = this;

            $.ajax({
                url: '/CheckSession',
                type: 'GET',
                dataType: 'json',
                contentType: "application/json",
                success: function(data) {
                    if (Sentrana.isSuccess(data)) {
                        that.app.updateSessionTimeOut(data.sessionTimeOutSeconds);
                    }                
                }
            });
        },

        start: function(timeOut) {
            var that = this;
            if (that.keepAliveInterval) {
                window.clearInterval(that.keepAliveInterval);
            }

            timeOut = timeOut > Sentrana.Controllers.SessionKeepAliveController.maxInterval ? Sentrana.Controllers.SessionKeepAliveController.maxInterval : timeOut;

            var timeIntervalForServiceCall = (timeOut - Sentrana.Controllers.SessionKeepAliveController.callBeforeTimeoutSeconds);

            that.keepAliveInterval = window.setInterval(that.proxy(that.callKeepAliveService), timeIntervalForServiceCall * 1000);
        },

        stop: function() {
            var that = this;
            if (that.keepAliveInterval) {
                window.clearInterval(that.keepAliveInterval);
            }
        },

        isValidTimeOut: function(value) {
            return (value !== null && value > Sentrana.Controllers.SessionKeepAliveController.callBeforeTimeoutSeconds);
        }
    });
});
