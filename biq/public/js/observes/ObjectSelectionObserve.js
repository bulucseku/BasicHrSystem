can.Observe.extend("Sentrana.Models.ObjectSelection", {}, {
    // Instance method: Indicate that an object is being selected...
    selectObject: function OS_selectObject(htmlid) {
        this.attr(htmlid, htmlid);
    },

    // Instamce method: Indicate that an object is being de-selected...
    deselectObject: function OS_deselectObject(htmlid) {
        this.removeAttr(htmlid);
    }
});
