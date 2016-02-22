/**
 * Rename task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    dist: {
        files: [{
            expand: true,
            cwd: '.',
            src: ['production.js'],
            dest: '<%= dist.dir %>'
        }, {
            expand: true,
            cwd: '.',
            src: ['production.css'],
            dest: '<%= dist.dir %>/styles'
        }]
    }
};
