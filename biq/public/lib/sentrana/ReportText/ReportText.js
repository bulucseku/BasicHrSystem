can.Control.extend("Sentrana.Controllers.TextReport", {
    pluginName: 'sentrana_text_report',
    defaults: {
        model: null
    }
}, {
    init: function () {
        this.$text = this.element.find('.text-report-value');
    },

    update: function (options) {
        this.setup(this.element, options);
    },

    // Instance method: How we render the view...
    updateView: function () {
        this.data = (this.options.model && this.options.model.getData());
        // Is it missing?
        if (!this.data || !this.data.rows ) {
            return;
        }

        this.$text.text(this.data.rows[0].cells[0].fmtValue);
        this.updateTextSize();
    },

    updateTextSize: function(width, height){
        var elementWidth = width? width : parseInt(this.element.width());
        var elementHeight = height? height : parseInt(this.element.height());
        var fontSize;
        if(elementWidth > elementHeight){
            fontSize = elementHeight/3;
        }else{
            fontSize = elementWidth/3;
        }

        var fontSizeInPx = fontSize + "px";
        this.$text.css('font-size', fontSizeInPx);
    },

    // Synthetic Event: What to do when the model changes...
    "{model} change": function (model, ev, attr, how, newVal, oldVal) {
        // Are we being notified of a successful execution?
        if (attr === "executionStatus" && newVal === "SUCCESS") {
            this.updateView();
        }else if (attr === "localDataChangeStatus" && newVal === "SUCCESS") {
            this.updateView();
        }
    }
});
