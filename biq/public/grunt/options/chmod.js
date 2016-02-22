/**
 * Chmod task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    options: {
        // Set the files permissions so that everyone can read and execute the
        // files but only the owner can write to the files.
        mode: '755'
    },
    steal: {
        src: ['steal/js']
    }
};
