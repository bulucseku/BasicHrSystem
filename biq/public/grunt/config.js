/**
 * Grunt configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    src: {
        js: [
            '*.js',
            'grunt/**/*.js',
            'js/**/*.js',
            'lib/sentrana/**/*.js'
        ],
        ejs: [
            'js/**/*.ejs',
            'lib/sentrana/**/*.ejs',
            'templates/**/*.ejs'
        ],
        css: [
            '*.css',
            'css/**/*.css',
            'js/**/*.css',
            'lib/sentrana/**/*.css',
            'styles/**/*.css'
        ],
        html: [
            '*.{htm,html}',
            'html/**/*.{htm,html}',
            'js/**/*.{htm,html}',
            'lib/sentrana/**/*.{htm,html}'
        ]
    },
    dist: {
        dir: 'dist/'
    }
};
