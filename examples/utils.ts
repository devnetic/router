import { matchAll, RegExpMath } from '../src/support/utils'

const example = '1234a51b256574c'
const expected = ['a', 'b', 'c']

console.log(matchAll(/[a-z]/g, example).map((param: RegExpMath) => param[0]), expected)
console.log(matchAll(/\b/g, example).map((param: RegExpMath) => param[0]), expected)
