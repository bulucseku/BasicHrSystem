/**
 * Replace task configuration
 */

/* jshint node:true */

'use strict';

var path = require('path');

module.exports = {
    jshint: {
        options: {
            patterns: [{
                match: /<file name="([^"]*)">/g,
                replacement: function (match, relPath, offset, string, source, target) {
                    var cwd = process.env.PWD,
                        sourceDir = path.dirname(source),
                        absPath = path.join(cwd, sourceDir, relPath);
                    return match.replace(relPath, absPath);
                }
            }]
        },
        files: [{
            expand: true,
            flatten: true,
            cwd: 'reports',
            src: ['{jslint,checkstyle-jshint}.xml'],
            dest: 'reports'
        }]
    },
    dist: {
        options: {
            patterns: [{
                match: /(<!-- STEALJS START -->)([\s\S]*?)(<!-- STEALJS END -->)/g,
                replacement: '<script type="text/javascript" src="steal.production.js?//production.js"></script>'
            }, {
                match: /(<!-- APPLICATION CSS START -->)([\s\S]*?)(<!-- APPLICATION CSS END -->)/g,
                replacement: '<link rel="stylesheet" type="text/css" href="styles/production.css" />'
            }]
        },
        files: [{
            expand: true,
            flatten: true,
            cwd: '.',
            src: ['{default,dashboard_plugin}.htm'],
            dest: '<%= dist.dir %>'
        }]
    }
};
