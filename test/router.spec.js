const { IncomingMessage } = require('http')
const { Socket } = require('net')

const test = require('ava')

const { router } = require('./../lib/')
const { buildFormData } = require('./utils')

test.beforeEach(t => {
  router.setRoutes({})
})

test.serial('should add get route', t => {
  const method = 'GET'
  const handler = (request, response) => { }
  const expected = {
    [method]: [{
      handler,
      params: {},
      path: /^\/route$/,
      method,
      query: {}
    }]
  }

  router.get('/route', handler)

  t.deepEqual(router.getRegisteredRoutes(), expected)
})

test.serial('should add post route', t => {
  const method = 'POST'
  const handler = (request, response) => { }
  const expected = {
    [method]: [{
      handler,
      params: {},
      path: /^\/route$/,
      method,
      query: {}
    }]
  }

  router.post('/route', handler)

  t.deepEqual(router.getRegisteredRoutes(), expected)
})

test.serial('should add multiple routes', t => {
  const handler = (request, response) => { }
  const expected = {
    GET: [{
      handler,
      params: {},
      path: /^\/route$/,
      method: 'GET',
      query: {}
    }, {
      handler,
      params: { 'id': undefined },
      path: /^\/route\/([A-Za-z0-9_-]+)$/,
      method: 'GET',
      query: {}
    }],
    DELETE: [{
      handler,
      params: { 'id': undefined },
      path: /^\/route\/([A-Za-z0-9_-]+)$/,
      method: 'DELETE',
      query: {}
    }]
  }

  router.get('/route', handler)
  router.get('/route/:id', handler)
  router.delete('/route/:id', handler)

  t.deepEqual(router.getRegisteredRoutes(), expected)
})

test.serial('should return empty array when no routes defined', t => {
  t.deepEqual(router.getRoutes('/route', 'GET'), [])
})

test.serial('should verify correct route', t => {
  const method = 'GET'
  const handler = (request, response) => { }
  const expected = [{
    handler,
    params: {},
    path: /^\/route$/,
    method,
    query: {}
  }]

  router.get('/route', handler)
  router.get('/route/:id', handler)

  t.deepEqual(router.getRoutes('/route', 'GET'), expected)
})

test.serial('should verify correct route with param', t => {
  const method = 'GET'
  const handler = (request, response) => { }
  const expected = [{
    handler,
    params: { id: '10' },
    path: /^\/route\/([A-Za-z0-9_-]+)$/,
    method,
    query: {
    }
  }]

  router.get('/route', handler)
  router.get('/route/:id', handler)

  t.deepEqual(router.getRoutes('/route/10', 'GET'), expected)
})

test.serial('should verify correct route with query params', t => {
  const method = 'GET'
  const handler = (request, response) => { }
  const expected = [{
    handler,
    params: {},
    path: /^\/route$/,
    method,
    query: {
      limit: '10',
      offset: '2'
    }
  }]

  router.get('/route', handler)

  t.deepEqual(router.getRoutes('/route?limit=10&offset=2', 'GET'), expected)
})

test.serial('should verify correct grouped route', t => {
  const method = 'POST'
  const group = 'v1'
  const handler = (request, response) => { }
  const expected = [{
    handler,
    params: {},
    path: /^\/v1\/login$/,
    method,
    query: {
    }
  }]
  const routes = [{
    method: 'post',
    path: 'login',
    handler
  }, {
    method: 'post',
    path: 'register',
    handler
  }]

  router.group(group, routes)

  t.deepEqual(router.getRoutes(`${group}/login`, method), expected)
})

test.serial.cb('should parse raw body', t => {
  const method = 'POST'
  const url = '/route'
  const handler = (request) => {
    t.deepEqual(request.body, body)

    t.end()
  }
  const body = {
    id: '123',
    name: 'John Doe'
  }

  const request = new IncomingMessage(new Socket())
  request.url = url
  request.method = method
  request.headers['content-type'] = 'application/json'
  request.push(JSON.stringify(body), 'utf8')
  request.push(null)

  const response = {}

  router.post(url, handler)

  router.attach(request, response)
})

test.serial.cb('should parse form-urlencoded body', t => {
  const method = 'POST'
  const url = '/route'
  const handler = (request) => {
    t.deepEqual(request.body, body)

    t.end()
  }
  const body = {
    id: '123',
    name: 'John Doe'
  }

  const request = new IncomingMessage(new Socket())
  request.url = url
  request.method = method
  request.headers['content-type'] = 'application/x-www-form-urlencoded'
  request.push('id=123&name=John%20Doe', 'utf8')
  request.push(null)

  const response = {}

  router.post(url, handler)

  router.attach(request, response)
})

test.serial.cb('should parse form-data body', t => {
  const method = 'POST'
  const url = '/route'
  const handler = (request) => {
    t.is(request.body[0].name, 'id')
    t.is(request.body[0].buffer.toString(), '123')

    t.is(request.body[1].name, 'name')
    t.is(request.body[1].buffer.toString(), 'Mike Doe')

    t.end()
  }

  const body = {
    id: '123',
    name: 'Mike Doe'
  }

  const { formData, boundary } = buildFormData(body)

  const request = new IncomingMessage(new Socket(formData))
  request.url = url
  request.method = method
  request.headers['content-type'] = `multipart/form-data; boundary=${boundary}`
  request.push(Buffer.from(formData), 'utf8')
  request.push(null)
  const response = {}

  router.post(url, handler)

  router.attach(request, response)
})

test.serial.cb('should parse form-data body with files', t => {
  const method = 'POST'
  const url = '/route'
  const handler = (request) => {
    t.is(request.body[0].name, 'id')
    t.is(request.body[0].buffer.toString(), '123')

    t.is(request.body[1].name, 'name')
    t.is(request.body[1].buffer.toString(), 'Mike Doe')

    t.is(request.body[2].name, 'test-file.txt')
    t.is(request.body[2].buffer.toString().trim(), '0123456789'.repeat(6))

    t.is(request.body[3].name, 'test-file.txt')
    t.is(request.body[3].buffer.toString().trim(), '0123456789')

    t.end()
  }

  const body = {
    id: '123',
    name: 'Mike Doe'
  }
  const files = [{
    name: 'file01',
    filename: 'test-file.txt',
    content: '012345678901234567890123456789012345678901234567890123456789',
    type: 'text/plain'
  }, {
    name: 'file02',
    filename: 'test-file.txt',
    content: '0123456789',
    type: 'text/plain'
  }]

  const { formData, boundary } = buildFormData(body, files)

  const request = new IncomingMessage(new Socket(formData))
  request.url = url
  request.method = method
  request.headers['content-type'] = `multipart/form-data; boundary=${boundary}`
  request.push(Buffer.from(formData), 'utf8')
  request.push(null)
  const response = {}

  router.post(url, handler)

  router.attach(request, response)
})
