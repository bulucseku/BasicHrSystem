/**
 * Grunt setup
 */

/* jshint node:true */

'use strict';

var extend = require('xtend');

module.exports = function (grunt) {

    // Measure time of grunt tasks
    require('time-grunt')(grunt);

    /**
     * Load configuration files for Grunt
     * @param  {string} path Path to folder with tasks
     * @return {object}      All options
     */
    var loadConfig = function (path) {
        var glob = require('glob');
        var object = {};
        var key, opts;

        glob.sync('*', {
            cwd: path
        }).forEach(function (option) {
            key = option.replace(/\.js$/, '');
            opts = require(path + option);
            object[key] = typeof opts === 'function' ? opts(grunt) : opts;
        });

        return object;
    };

    var baseConfig = require('./grunt/config'),
        taskOptions = loadConfig('./grunt/options/'),
        config = extend(baseConfig, taskOptions, {
            pkg: require('./package'),
            env: process.env
        });

    // Load project configuration
    grunt.initConfig(config);

    // Ignore firefox-specific styles since CSSLint
    // can't handle @-moz-document rules yet
    var cssLintFiles = ['<%= src.css %>', '!styles/firefox.css'];

    // Don't use CSScomb on common-frontend CSS for now
    var cssCombFiles = ['<%= src.css %>', '!lib/sentrana/**/*'];

    // Don't beautify common-frontend code for now
    var beautifyJsFiles = ['<%= src.js %>', '!lib/sentrana/**/*'],
        beautifyHtmlFiles = ['<%= src.html %>', '!lib/sentrana/**/*'];

    grunt.config.merge({
        csscomb: {
            all: {
                src: cssCombFiles
            }
        },
        csslint: {
            lax: {
                src: cssLintFiles
            },
            strict: {
                src: cssLintFiles
            }
        },
        jsbeautifier: {
            js: {
                src: beautifyJsFiles
            },
            html: {
                src: beautifyHtmlFiles
            }
        }
    });

    // load all grunt tasks from dev dependencies
    require('load-grunt-tasks')(grunt);

    // load custom tasks
    grunt.loadTasks('./grunt/tasks');

    grunt.registerTask('format', [
        'fixmyjs:all',
        'jsbeautifier:js',
        'jsbeautifier:html',
        'csscomb:all'
    ]);

    grunt.registerTask('lint', [
        'clean:lint',
        'jshint:stylish',
        'jshint:checkstyle',
        'replace:jshint',
        'csslint:lax',
        'htmllint:all',
        'htmllint:checkstyle'
    ]);

    grunt.registerTask('dist', [
        'clean:dist',
        'clean:steal',
        'bower',
        'copy:steal',
        'chmod:steal',
        'steal',
        'copy:dist',
        'rename:dist',
        'replace:dist',
        'cleanempty:dist'
    ]);

    grunt.registerTask('default', [
        'format',
        'lint',
        'dist'
    ]);

};
