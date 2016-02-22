/**
 * FixMyJS task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    options: {
        legacy: true
    },
    all: {
        files: [{
            expand: true,
            cwd: '.',
            src: '<%= src.js %>',
            dest: '.'
        }]
    }
};
