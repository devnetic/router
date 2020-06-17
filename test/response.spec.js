const { IncomingMessage } = require('http')
const { Socket } = require('net')

const test = require('ava')
const sinon = require('sinon')

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

test('should create a cookie', t => {
  const name = 'foo'
  const value = 'bar'
  const expires = new Date('2020/04/22').toUTCString()
  const domain = 'https://localhost:3000'
  const httpOnly = true
  const maxAge = 12
  const sameSite = 'Lax'
  const secure = true
  const path = '/users'
  const options = {
    domain,
    expires,
    httpOnly,
    maxAge,
    path,
    sameSite,
    secure
  }
  let expected = `${name}=${value};Domain=${domain};Expires=Wed, 22 Apr 2020 05:00:00 GMT;HttpOnly;Max-Age=${maxAge};Path=${path};SameSite=${sameSite};Secure`

  response.cookie(name, value, options)

  expected = `${name}=${encodeURIComponent(JSON.stringify({ foo: 'bar' }))};Domain=${domain};Expires=Wed, 22 Apr 2020 05:00:00 GMT;HttpOnly;Max-Age=${maxAge};Path=${path};SameSite=${sameSite};Secure`

  response.cookie(name, { foo: 'bar' }, options)

  t.is(response.getHeader('Set-Cookie'), expected)
})

test('should send a json response with 200 status code', t => {
  const data = {
    foo: 'bar'
  }
  const encoding = 'utf-8'
  const headers = {
    'Content-Length': Buffer.byteLength(JSON.stringify(data)),
    'Content-Type': 'application/json'
  }
  const writeHeadStub = sinon.stub(response, 'writeHead')
  const writeStub = sinon.stub(response, 'write')
  const endStub = sinon.stub(response, 'end')

  response.json(data)

  t.true(writeHeadStub.calledOnceWith(200, headers))
  t.true(writeStub.calledOnceWith(JSON.stringify(data), encoding))
  t.true(endStub.calledOnce)

  writeHeadStub.restore()
  writeStub.restore()
  endStub.restore()
})

test('should send a json response with 500 status code', t => {
  const data = {
    message: 'unexpected error'
  }
  const encoding = 'utf-8'
  const headers = {
    'Content-Length': Buffer.byteLength(JSON.stringify(data)),
    'Content-Type': 'application/json'
  }
  const writeHeadStub = sinon.stub(response, 'writeHead')
  const writeStub = sinon.stub(response, 'write')
  const endStub = sinon.stub(response, 'end')

  response.json(data, 500)

  t.true(writeHeadStub.calledOnceWith(500, headers))
  t.true(writeStub.calledOnceWith(JSON.stringify(data), encoding))
  t.true(endStub.calledOnce)

  writeHeadStub.restore()
  writeStub.restore()
  endStub.restore()
})

test('should send a response', t => {
  const data = 'some plain content'
  const encoding = 'utf-8'
  const headers = {
    'Content-Length': Buffer.byteLength(data),
    'Content-Type': 'text/plain'
  }
  const writeHeadStub = sinon.stub(response, 'writeHead')
  const writeStub = sinon.stub(response, 'write')
  const endStub = sinon.stub(response, 'end')

  response.send(data)

  t.true(writeHeadStub.calledOnceWith(200, headers))
  t.true(writeStub.calledOnceWith(data, encoding))
  t.true(endStub.calledOnce)

  writeHeadStub.restore()
  writeStub.restore()
  endStub.restore()
})

test('should send a response with custom options', t => {
  const data = {
    message: 'unexpected error'
  }
  const encoding = 'utf-8'
  const headers = {
    'Content-Length': Buffer.byteLength(JSON.stringify(data)),
    'Content-Type': 'application/json'
  }
  const writeHeadStub = sinon.stub(response, 'writeHead')
  const writeStub = sinon.stub(response, 'write')
  const endStub = sinon.stub(response, 'end')

  response.send(JSON.stringify(data), {
    statusCode: 500,
    contentType: 'application/json',
    encoding
  })

  t.true(writeHeadStub.calledOnceWith(500, headers))
  t.true(writeStub.calledOnceWith(JSON.stringify(data), encoding))
  t.true(endStub.calledOnce)

  writeHeadStub.restore()
  writeStub.restore()
  endStub.restore()
})

test('should set the response status', t => {
  response.status(404)

  t.is(response.statusCode, 404)
})
