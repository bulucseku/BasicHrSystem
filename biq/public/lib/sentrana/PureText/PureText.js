Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.PureText", {
    //static properties
    pluginName: 'sentrana_pure_text',
    defaults: {
        message:''
    }
}, {
    //instance properties
    init: function () {
        this.render();
        this.isViewing = true;
    },

    render: function () {
        this.element.html(can.view('lib/sentrana/PureText/templates/pureText.ejs', {message: this.options.message}));
        this.$pureTextContainer = this.element.find('.pure-text-container');
        this.$pureTextValue = this.element.find('.pure-text-value');
        this.$editActionContainer = this.element.find('.pure-text-edit-action-container');
        this.$pureSaveActionContainer = this.element.find('.pure-text-save-action-container');
        this.setContent(this.options.message);
    },

    renderEditor: function(height){
        var that = this;

        var saveButton = function (context) {
            var ui = $.summernote.ui;
            var saveButton = ui.button({
                className: 'note-btn-customSave',
                contents: '<i class="fa fa-check"/>',
                tooltip: 'Save',
                click: function () {
                    that.saveEditorContent();
                }
            });
            return saveButton.render();
        };

        var cancelButton = function (context) {
            var ui = $.summernote.ui;
            var cancelButton = ui.button({
                className: 'note-btn-customCancel',
                contents: '<i class="fa fa-times"/>',
                tooltip: 'Cancel',
                click: function () {
                    that.cancelEditorContent();
                }
            });
            return cancelButton.render();
        };

        this.$pureTextValue.summernote({
            focus: true,
            toolbar: [
                ['style', ['bold', 'italic', 'underline', 'clear']],
                ['font', ['strikethrough', 'superscript', 'subscript']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['actionButtons', ['save','cancel']]
            ],
            buttons: {
                save: saveButton,
                cancel: cancelButton
            },
            height: height
        });

        $('.note-statusbar').hide();
    },

    update: function () {

    },

    show: function () {

    },

    hide: function () {

    },

    destroy: function () {

    },

    destroyEditor: function(){
        $('.tooltip').remove();
        this.$pureTextValue.summernote('code');
        this.$pureTextValue.summernote('destroy');
    },

    resize: function () {
        var height = this.element.outerHeight(true);
        if(this.isViewing){
            this.$pureTextValue.css('height',height + 'px');
        }else{
            height = height - $('.note-toolbar').outerHeight(true);
            this.destroyEditor();
            this.renderEditor(height);
        }
    },

    getContent: function(){
        return  this.$pureTextValue.html();
    },

    setContent: function(content){
        this.$pureTextValue.html(content);
    },

    saveEditorContent: function(){
        this.isViewing = true;
        this.destroyEditor();
        this.$pureSaveActionContainer.hide();
        this.$editActionContainer.show();
        this.$editActionContainer.css('visibility', 'hidden');
        this.$pureTextContainer.removeClass('pure-text-mouseover');

        this.element.trigger('pure_text_updated', this.getContent());
    },

    cancelEditorContent: function(){
        this.isViewing = true;
        this.$pureTextValue.summernote('reset');
        this.destroyEditor();
        this.$pureSaveActionContainer.hide();
        this.$editActionContainer.show();
        this.$editActionContainer.css('visibility', 'hidden');
        this.$pureTextContainer.removeClass('pure-text-mouseover');
    },

    ".pure-text-view-container mouseover": function(el, ev){
        if(this.isViewing){
            this.$editActionContainer.css('visibility', 'visible');
            this.$pureTextContainer.addClass('pure-text-mouseover');
        }
    },

    ".pure-text-view-container mouseout": function(el, ev){
        if(this.isViewing) {
            this.$editActionContainer.css('visibility', 'hidden');
            this.$pureTextContainer.removeClass('pure-text-mouseover');
        }
    },

    ".pure-text-edit-action-container click": function(el, ev){
        this.isViewing = false;
        this.renderEditor();
        this.resize();
        this.$pureSaveActionContainer.show();
        this.$editActionContainer.hide();
        this.$pureTextContainer.removeClass('pure-text-mouseover');
    }
});

