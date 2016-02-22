/**
 * Clean task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    steal: ['steal'],
    bower: ['bower_components', '<%= bower.install.options.targetDir %>'],
    dist: ['<%= dist.dir %>'],
    lint: ['reports']
};
