can.Construct.extend("Sentrana.ApplicationStorage", {

    AppStorage: {},

    getData: function(attr) {
        return this.AppStorage[attr];
    },

    setData: function(attr, data) {
        this.AppStorage[attr] = data;
    },

    isInStorage: function(attr) {
        if (this.AppStorage.hasOwnProperty(attr)) {
            return true;
        }
        return false;
    },

    clearAppStorage: function() {
        this.AppStorage = {};
    }
}, {
});

