/**
 * Copy task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    steal: {
        cwd: 'lib/external',
        src: ['steal/**'],
        dest: '.',
        expand: true
    },
    dist: {
        files: [{
            expand: true,
            cwd: 'lib/sentrana',
            src: ['**/*', '!**/*.{js,css}'],
            dest: '<%= dist.dir %>/lib/sentrana'
        }, {
            expand: true,
            cwd: 'lib/external',
            src: [
                'CanJS/**/*',
                'pixel-admin/**/*',
                'ace-editor/**/*',
                'Highcharts-regression/**/*',
                '!**/*.{js,css}'
            ],
            dest: '<%= dist.dir %>/lib/external'
        },{
            expand: true,
            cwd: 'lib/external/pivot',
            src: [
                'css/**/*',
                'js/**/*',
                '!StealPivot.js'
            ],
            dest: '<%= dist.dir %>/lib/external/pivot'
        }, {
            expand: true,
            cwd: 'vendor',
            src: [
                '**/*',
                '!**/*.{js,css}',
                '!canjs/**/*',
                '!ace-builds/**/*',
                '!highcharts-regression/**/*',
                '!pixel-admin/**/*'
            ],
            dest: '<%= dist.dir %>/vendor'
        }, {
            expand: true,
            cwd: '.',
            src: [
                '{help,html,images,resources,templates}/**/*',
                '!resources/*.js',
                'favicon.ico'
            ],
            dest: '<%= dist.dir %>'
        }, {
            expand: true,
            cwd: 'steal',
            src: ['steal.production.js'],
            dest: '<%= dist.dir %>'
        }]
    }
};
