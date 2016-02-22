/**
 * jsbeautifier task configuration
 */

/* jshint node:true */

'use strict';

module.exports = {
    options: {
        jsBeautifyVersion: "1.5.1",
        html: {
            braceStyle: "end-expand",
            endWithNewline: true,
            indentChar: " ",
            indentInnerHtml: false,
            indentScripts: "normal",
            indentSize: 4,
            maxPreserveNewlines: 2,
            preserveNewlines: true,
            unformatted: ["a", "sub", "sup", "b", "i", "u"],
            wrapAttributes: "auto",
            wrapAttributesIndentSize: 8,
            wrapLineLength: 0
        },
        js: {
            braceStyle: "end-expand",
            breakChainedMethods: false,
            e4x: false,
            endWithNewline: true,
            evalCode: false,
            indentChar: " ",
            indentLevel: 0,
            indentSize: 4,
            indentWithTabs: false,
            jslintHappy: true,
            keepArrayIndentation: false,
            maxPreserveNewlines: 2,
            preserveNewlines: true,
            spaceBeforeConditional: true,
            spaceInParen: false,
            unescapeStrings: false,
            wrapLineLength: 0
        }
    },
    html: {
        src: '<%= src.html %>'
    },
    js: {
        src: '<%= src.js %>'
    }
};
