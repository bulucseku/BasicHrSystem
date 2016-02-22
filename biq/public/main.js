steal("js/Libs.js").then("js/Styles.js").then("js/controllers/BIQController.js", function () {

    $(document).ready(function () {
        $(function () {
            // Global chart options...
            Highcharts.setOptions({
                chart: {
                    style: {
                        fontFamily: '"Tahoma", "Verdana", "Arial", sans-serif'
                    }
                }
            });

            // Ajax defaults...
            $.ajaxSetup({
                cache: false
            });

            //http://stackoverflow.com/questions/14488774/using-html-in-a-dialogs-title-in-jquery-ui-1-10
            $.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
                _title: function (title) {
                    if (!this.options.title) {
                        title.html("&#160;");
                    }
                    else {
                        title.html(this.options.title);
                    }
                }
            }));

            $.browser = {};
            var browserVersion;
            if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
                $.browser.mozilla = "mozilla";
                browserVersion = parseFloat(Number(RegExp.$1));
            }
            else if (/Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
                $.browser.webkit = "webkit";
                browserVersion = parseFloat(Number(RegExp.$1));
            }
            else if (/MSIE[\s](\d+\.\d+)/.test(navigator.userAgent)) {
                $.browser.msie = "msie";
                browserVersion = parseFloat(Number(RegExp.$1));
            }
            $.browser.version = browserVersion;
            // Associate the main application controller with the root DOM element...
            var mainApp = $('#biq-container').sentrana_biq().control();
        });
    });
});
