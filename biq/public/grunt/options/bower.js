/**
 * Bower task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    install: {
        options: {
            targetDir: 'vendor',
            layout: 'byComponent',
            install: true,
            verbose: true,
            cleanTargetDir: true,
            cleanBowerDir: false,
            bowerOptions: {}
        }
    }
};
