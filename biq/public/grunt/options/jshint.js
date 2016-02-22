/**
 * JSHint task configuration
 */

/* jshint node:true */

'use strict';

var jshintStylish = require('jshint-stylish');

module.exports = {
    options: {
        jshintrc: '.jshintrc',
        extract: true,
        force: true
    },
    defaultFormat: {
        src: '<%= src.js %>'
    },
    stylish: {
        src: '<%= src.js %>',
        options: {
            reporter: jshintStylish
        }
    },
    checkstyle: {
        src: '<%= src.js %>',
        options: {
            reporter: 'checkstyle',
            reporterOutput: 'reports/checkstyle-jshint.xml'
        }
    },
    jslint: {
        src: '<%= src.js %>',
        options: {
            reporter: 'jslint',
            reporterOutput: 'reports/jslint.xml'
        }
    }
};
