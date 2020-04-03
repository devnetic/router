"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Show a deprecated method message in the console
 *
 * @param {string} method
 * @param {string} alternative
 * @returns {string}
 */
var deprecated = function (method, alternative) {
    return "The method " + method + "() is deprecated, use " + alternative + "() instead.";
};
exports.deprecated = deprecated;
/**
 * Transforms a list of key-value pairs into an object.
 *
 * @param {*} iterable An iterable such as Array or Map or other objects
 * implementing the iterable protocol.
 * @returns A new object whose properties are given by the entries of the
 * iterable.
 */
var fromEntries = function (iterable) {
    return Array.from(iterable).reduce(function (obj, _a) {
        var key = _a[0], val = _a[1];
        obj[key] = val;
        return obj;
    }, {});
};
exports.fromEntries = fromEntries;
/**
 * Perform a global regular expression match. Searches subject for all
 * matches to the regular expression given in pattern and return them.
 *
 * @param {Object} regex
 * @param {string} value
 * @returns {Array}
 */
var matchAll = function (regex, value) {
    var match;
    var matches = [];
    while ((match = regex.exec(value)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        matches.push(match);
    }
    return matches;
};
exports.matchAll = matchAll;
