/**
 * HTML lint task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    options: {
        force: true,
        ignore: 'Attribute “ctype” not allowed on element “div” at this point.'
    },
    all: '<%= src.html %>',
    checkstyle: {
        src: '<%= src.html %>',
        options: {
            reporter: 'checkstyle',
            reporterOutput: 'reports/checkstyle-html.xml',
            absoluteFilePathsForReporter: true
        }
    }
};
