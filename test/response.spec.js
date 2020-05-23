const { IncomingMessage } = require('http')
const { Socket } = require('net')

const test = require('ava')

const { Response } = require('./../lib/')

let response

test.beforeEach(t => {
  response = new Response(new IncomingMessage(new Socket()))
})

test('should destroy the cookie after call clearCookie', t => {
  const cookie = 'name=;Expires=Thu, 01 Jan 1970 00:00:00 GMT;Path=/'

  response.clearCookie('name')

  t.is(response.getHeader('Set-Cookie'), cookie)
})
