"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = __importDefault(require("ava"));
var utils = __importStar(require("../src/support/utils"));
ava_1.default('matchAll should return the correct matches', function (t) {
    var example = '1234a51b25c6574';
    var expected = ['a', 'b', 'c'];
    t.deepEqual(utils.matchAll(/[a-z]/g, example).map(function (param) { return param[0]; }), expected);
});
ava_1.default('should return the correct matches form zero-width matches', function (t) {
    var example = '1234a51b25c6574';
    var expected = ['', ''];
    t.deepEqual(utils.matchAll(/\b/g, example).map(function (param) { return param[0]; }), expected);
});
ava_1.default('deprecated method should print the correct message', function (t) {
    var method = 'verifyRoute';
    var alternative = 'checkRoute';
    var message = "The method " + method + "() is deprecated, use " + alternative + "() instead.";
    t.is(utils.deprecated(method, alternative), message);
});
