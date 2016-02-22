steal.config({
    map: {
        "*": {
            "jquery/jquery.js": "jquery",
            "jquery": "lib/external/jquery/jquery-1.10.2/jquery-1.10.2.min.js",
            "funcunit": "lib/external/funcunit"
        }
    },
    paths: {
        "models/": "js/",
        "controllers/": "js/",
        "fixtures/": "js/"
    },
    shim: {
        jquery: {
            exports: "jQuery"
        },
        "lib/external/pivot/js/webix.js": {
            packaged : false
        },
        "lib/external/pivot/js/pivot.js": {
            packaged : false
        }
    },
    ext: {
        js: "js",
        css: "css",
        ejs: "can/view/ejs/ejs.js"
    }
});
