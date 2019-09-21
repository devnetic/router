const utils = require('../src/support/utils')

const example = '1234a51b256574c'
const expected = ['a', 'b', 'c']

console.log(utils.matchAll(/[a-z]/g, example).map(param => param[0]), expected)
console.log(utils.matchAll(/\b/g, example).map(param => param[0]), expected)
