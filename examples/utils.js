"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../src/support/utils");
var example = '1234a51b256574c';
var expected = ['a', 'b', 'c'];
console.log(utils_1.matchAll(/[a-z]/g, example).map(function (param) { return param[0]; }), expected);
console.log(utils_1.matchAll(/\b/g, example).map(function (param) { return param[0]; }), expected);
