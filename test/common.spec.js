const test = require('ava')

const { deprecated } = require('./../lib/support')

test('deprecated method should print the correct message', t => {
  const method = 'verifyRoute'
  const alternative = 'checkRoute'
  const message = `The method ${method}() is deprecated, use ${alternative}() instead.`

  t.is(deprecated(method, alternative), message)
})
