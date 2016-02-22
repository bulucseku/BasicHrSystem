steal("lib/external/stealDropzone.js",
    function () {

        Sentrana.UI.Widgets.Control("Sentrana.UI.Widgets.ImageUploader", {
            pluginName: "sentrana_image_uploader",
            defaults: {
                fileData: undefined,
                mode: 'edit',
                maxFileSize: 0.1  //in MB (default is 100KB)
            }
        }, {
            init: function () {
                this.dropzone = undefined;
                this.fileData = this.options.fileData;
                // Disabling autoDiscover, otherwise Dropzone will try to attach twice.
                Dropzone.autoDiscover = false;
                this.initDOMObjects();
            },
            initDOMObjects: function () {
                //get the container
                this.element.append(can.view('lib/sentrana/ImageUploader/templates/imageViewer.ejs', {}));
                // Locate specific elements...
                this.$imageContainer = this.element.find('.image-container');
                this.$dropzoneContainer = this.element.find('.dropzone-box');
                this.initDropzone();
            },

            initDropzone: function () {
                this.$dropzoneContainer.show();
                var that = this;

                var showRemoveButton = true;
                if (this.options.mode === 'view'){
                    showRemoveButton = false;
                }

                this.dropzone = new Dropzone(this.$dropzoneContainer.get(0), {
                    url: "//dummy.html", //this url is not going to use but as its a mandatory field so we have added a fake URL
                    paramName: "file", // The name that will be used to transfer the file
                    maxFilesize: this.options.maxFileSize, // MB
                    maxFiles: 1,
                    addRemoveLinks: showRemoveButton,
                    dictResponseError: "Can't upload file!",
                    autoProcessQueue: false,
                    createImageThumbnails: true,
                    init : function() {
                        if(that.options.fileData.imageUrl){
                            var myDropzone = this;
                            myDropzone.options.addedfile.call(myDropzone,  that.options.fileData);
                            myDropzone.options.thumbnail.call(myDropzone,  that.options.fileData, that.options.fileData.imageUrl);
                            that.initializeDropZoneDOMs();
                        }
                    },
                    resize: function (file) {
                        that.imgWidth = file.width;
                        that.imgHeight = file.height;
                        that.element.find(".dz-hidden-input").prop("disabled", true);
                        that.element.find('.dz-input').hide();

                        var Info = {srcX: 0, srcY: 0, srcWidth: that.imgWidth, srcHeight: that.imgHeight},
                            srcRatio = that.imgWidth / that.imgHeight;

                        that.initializeDropZoneDOMs();

                        Info.trgWidth = that.$imageContainer.width();
                        Info.trgHeight = that.$imageContainer.height() - (that.$dropZoneDetails.outerHeight(true) + that.$dropZoneRemove.outerHeight(true));

                        return Info;
                    }
                });

                //and this to handle any error
                this.dropzone.on("error", function(file, response) {
                    Sentrana.AlertDialog("Error", response);
                    that.dropzone.removeAllFiles(true);
                });

                this.dropzone.on("removedfile", function(file) {
                    that.fileData = {
                        imageUrl: '',
                        name: '',
                        size: '',
                        type: ''
                    };
                    that.element.trigger('image_changed', that.fileData);
                });

                this.dropzone.on("thumbnail", function(file, dataUrl) {
                    that.initializeDropZoneDOMs();
                    that.fileData = {
                        imageUrl: dataUrl,
                        name: file.name,
                        size: file.size,
                        type: file.type
                    };
                    that.element.find(".dz-hidden-input").prop("disabled", false);
                    that.element.find('.dz-input').show();
                    that.element.trigger('image_changed', that.fileData);
                    that.resize();
                });
            },

            initializeDropZoneDOMs: function() {
                this.$dropZoneDetails =  this.element.find('.dz-details');
                this.$dropZoneRemove =  this.element.find('.dz-remove');
                this.$dropZoneImage = this.element.find('.dz-image img');
            },

            resize: function (width, height) {
                if(this.fileData.name.length > 0){
                    this.$dropZoneImage.css('width',this.$imageContainer.width());
                    this.$dropZoneImage.css('height',this.$imageContainer.height() - (this.$dropZoneDetails.outerHeight(true) + this.$dropZoneRemove.outerHeight(true)));
                }
            }
        })
    })
;
