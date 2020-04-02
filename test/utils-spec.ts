import test from 'ava'
import * as sinon from 'sinon'

import * as utils from '../src/support/utils'

test('matchAll should return the correct matches', t => {
  const example = '1234a51b25c6574'
  const expected = ['a', 'b', 'c']

  t.deepEqual(utils.matchAll(/[a-z]/g, example).map(param => param[0]), expected)
})

test('should return the correct matches form zero-width matches', t => {
  const example = '1234a51b25c6574'
  const expected = ['', '']

  t.deepEqual(utils.matchAll(/\b/g, example).map(param => param[0]), expected)
})

test('deprecated method should print the correct message', t => {
  const method = 'verifyRoute'
  const alternative = 'checkRoute'
  const message = `The method ${method}() is deprecated, use ${alternative}() instead.`

  sinon.spy(console, 'log')

  utils.deprecated(method, alternative)

  // t.true(console.log.calledWith(message))
})
