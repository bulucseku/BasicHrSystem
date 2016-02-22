/**
 * Cleanempty task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    options: {
        files: true,
        folders: true
    },
    dist: {
        src: ['<%= dist.dir %>/**/*']
    },
    all: {
        src: ['**/*']
    }
};
