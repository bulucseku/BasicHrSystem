can.Observe.extend("Sentrana.Models.TwoRibbonNavBar", {}, {
    init: function TRNBM_init(options) {
        // Import our options into this object instance...
        $.extend(true, this, options);

        // initialize our observeable properties...
        this.setup({
            "level1ButtonSelected": "",
            "level2ButtonSelected": ""
        });

        // If the layout argument is a string, assume it is a path to a JSON file, which can be loaded...
        if (typeof this.layout === "string") {
            // Load it synchronously...
            var that = this;
            $.ajax({
                url: this.layout,
                async: false,
                dataType: "json",
                success: function (data) {
                    that.layout = data;
                }
            });
        }
    },

    getFilteredLayout: function TRNBM_getFilteredLayout() {
        // If we don't have an array of filtered button IDs, create one now...
        if (!$.isArray(this.filteredButtonIDs)) {
            this.filteredButtonIDs = [];
        }

        // Create a map from the array of button IDs...
        var filteredMap = null;
        $.each(this.filteredButtonIDs, function (index, bID) {
            // Is our map null?
            if (!filteredMap) {
                // Create one!
                filteredMap = {};
            }

            // Set the button ID as the key of this map...
            filteredMap[bID] = 1;
        });

        // Otherwise, loop through each entry in our layout...
        var filteredLayout = [];
        this.layoutMap = {};
        for (var i = 0, l = (this.layout || []).length; i < l; i++) {
            // Is this button in the map?
            if (!filteredMap || this.layout[i].btnID in filteredMap) {
                // Do we have a default level 1 button ID?
                if (!this.defaultLevel1ButtonID) {
                    // Assign it...
                    this.defaultLevel1ButtonID = this.layout[i].btnID;

                    // Does this button have children?
                    if (this.layout[i].children && this.layout[i].children[0]) {
                        this.defaultLevel2ButtonID = this.layout[i].children[0].btnID;
                    }
                    else {
                        this.defaultLevel2ButtonID = "";
                    }
                }

                // Add the button to our filtered array...
                filteredLayout.push(this.layout[i]);
                this.layoutMap[this.layout[i].btnID] = this.layout[i];
            }
        }

        return filteredLayout;
    },

    getControllerInfo: function TRNBM_getControllerInfo(l1btn, l2btn) {
        // Get the information about the first level button...
        var l1Info = this.layoutMap[l1btn],
            controllerInfo;

        // Is a second level button specified?
        if (l2btn) {
            for (var i = 0, l = (l1Info.children || []).length; i < l; i++) {
                if (l1Info.children[i].btnID === l2btn) {
                    return l1Info.children[i].controllerInfo;
                }
            }

            return null;
        }

        return l1Info.controllerInfo;
    },

    selectDefaults: function TRNBM_selectDefaults() {
        // Tell our selection model what we should show first...
        if (this.defaultLevel1ButtonID) {
            this.selectLevel1Button(this.defaultLevel1ButtonID);
            this.selectLevel2Button(this.defaultLevel1ButtonID, this.defaultLevel2ButtonID);
        }
    },

    selectLevel1Button: function TRNBM_selectLevel1Button(l1btn) {
        this.attr("level1ButtonSelected", l1btn);
        if (this.layoutMap[l1btn].children) {
            this.attr("level2ButtonSelected", l1btn + "|" + this.layoutMap[l1btn].children[0].btnID);
        }
        else {
            this.attr("level2ButtonSelected", l1btn);
        }
    },

    selectLevel2Button: function TRNBM_selectLevel2Button(l1btn, l2btn) {
        this.attr("level1ButtonSelected", l1btn);
        this.attr("level2ButtonSelected", l1btn + "|" + l2btn);
    }
});
