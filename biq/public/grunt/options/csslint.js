/**
 * CSSLint task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    options: {
        absoluteFilePathsForFormatters: true,
        formatters: [{
            id: 'checkstyle-xml',
            dest: 'reports/checkstyle-csslint.xml'
        }, {
            id: 'csslint-xml',
            dest: 'reports/csslint.xml'
        }]
    },
    strict: {
        src: '<%= src.css %>'
    },
    lax: {
        options: {
            csslintrc: '.csslintrc'
        },
        src: '<%= src.css %>'
    }
};
