/**
 * Copyright (C) 2012 Bitovi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE
 * SOFTWARE.
 *
 * Modified from https://github.com/alexisabril/grunt-steal
 */

/* jshint node:true */

'use strict';

module.exports = function (grunt) {
    grunt.registerTask('steal', 'StealJS build', function () {
        this.requiresConfig('steal');

        var steal = grunt.config('steal');
        var done = this.async();
        var promise = require('promised-io/promise');

        var platform = require('os').platform();
        var build = steal.build && steal.build.length ? steal.build : [];
        var root = steal.root && steal.root.length ? steal.root : '.';
        var js = root + '/steal/' + (platform === 'win32' ? 'js.bat' : 'js');

        var gruntDir = process.cwd();

        var runSteal = function (args) {
            var deferred = new promise.Deferred();
            grunt.log.writeln('\nRunning: ' + js + ' ' + args.join(' '));

            grunt.util.spawn({
                cmd: js,
                args: args
            }, function (error, result, code) {
                if (code) {
                    deferred.reject(error);
                }
                else {
                    grunt.log.write(result.stdout);
                    deferred.resolve();
                }
            });

            return deferred.promise;
        };

        process.chdir(root);

        var execute = function (i) {
            var buildjs = root + '/steal/buildjs';
            var opts = typeof build[i] === 'string' ? {
                src: build[i]
            } : build[i];
            var args = [];

            args.push(buildjs, opts.src);
            delete opts.src;

            for (var name in opts) {
                if (opts[name]) {
                    args.push('-' + name);

                    if (typeof opts[name] !== 'boolean') {
                        args.push(opts[name]);
                    }
                }
            }

            var deferred = runSteal(args);

            deferred.then(function () {
                if (i < build.length - 1) {
                    execute(i + 1);
                }
                else {
                    process.chdir(gruntDir);

                    grunt.log.ok();
                    done();
                }
            }, function (error) {
                grunt.log.error(error.stdout);

                done(false);
            });
        };

        execute(0);
    });
};
