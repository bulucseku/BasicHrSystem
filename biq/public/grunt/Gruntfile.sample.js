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

    // load all grunt tasks from dev dependencies
    require('load-grunt-tasks')(grunt);

    // load custom tasks
    grunt.loadTasks('./grunt/tasks');

    grunt.registerTask('lint', [
        'jshint:stylish',
        'jshint:jslint',
        'jshint:checkstyle',
        'replace:jshint'
    ]);

    grunt.registerTask('copySteal', [
        'copy:steal',
        'chmod:steal'
    ]);

    grunt.registerTask('build', [
        'bower',
        'copySteal',
        'steal'
    ]);

    grunt.registerTask('dist', [
        'copy:dist',
        'rename:dist',
        'replace:dist',
        'cleanempty:dist'
    ]);

    grunt.registerTask('default', [
        'clean',
        'lint',
        'build',
        'dist'
    ]);

};
