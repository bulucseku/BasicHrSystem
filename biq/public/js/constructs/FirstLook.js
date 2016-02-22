can.Construct("Sentrana.FirstLook", {
    /* Initial Global State */
    AppState: new can.Observe({
        "sessionOpen": null,
        "closeSessionReason": null,
        "createFilteredMetricMode": false,
        "currentNotification": null
    }),

    /* Class Method: Indicate that we have an open session */
    openSession: function FL_openSession() {
        this.AppState.attr("sessionOpen", true);
    },

    // Class Method: Indicate that we have a closed session */
    closeSession: function FL_closeSession(reason) {
        /* Give the reason first so that observers can check the reason when the sessionOpen property changes. */
        this.AppState.attr("closeSessionReason", reason);
        this.AppState.attr("sessionOpen", false);
    },

    // Class Method: To toggle the attribute that we use to indicate whether we are in the mode to create filtered metric. */
    createFilteredMetricMode: function FL_createFilteredMetricMode(value) {
        this.AppState.attr("createFilteredMetricMode", value);
    },

    // Class Method: To set the current notification. The application will observe the change and present the message properly. */
    setCurrentNotification: function FL_setCurrentNotification(value) {
        this.AppState.attr("currentNotification", {
            msg: value,
            timestamp: +new Date()
        });
    },

    // Class Method: To set the current notification. The application will observe the change and present the message, time and position properly. */
    setCurrentNotificationWithTimeAndPosition: function FL_setCurrentNotificationWithTimeAndPosition(msg, timeStamp, position) {
        this.AppState.attr("currentNotification", {
            msg: msg,
            timeStamp: timeStamp,
            position: position
        });
    }
}, {});
