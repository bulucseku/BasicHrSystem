/**
 * CSScomb task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    options: {
        config: '.csscomb.json'
    },
    all: {
        expand: true,
        cwd: '.',
        src: '<%= src.css %>',
        dest: '.'
    }
};
