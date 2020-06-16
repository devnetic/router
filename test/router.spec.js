const { IncomingMessage } = require('http')
const { Socket } = require('net')

const test = require('ava')

const { router } = require('./../lib/')
const { buildFormData } = require('./utils')

test.beforeEach(t => {
  router.setMiddlewares([])
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
      params: { id: undefined },
      path: /^\/route\/([A-Za-z0-9_-]+)$/,
      method: 'GET',
      query: {}
    }],
    DELETE: [{
      handler,
      params: { id: undefined },
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

test.serial('should return 404 status code when there are not routes defined', t => {
  const url = '/users'

  const request = {
    url
  }
  const response = {
    end: () => { }
  }

  router.attach(request, response)

  t.is(response.statusCode, 404)
})

test.serial.cb('should execute the middlewares', t => {
  const url = '/users'

  const body = {
    id: '123',
    name: 'John Doe'
  }

  const request = new IncomingMessage(new Socket())
  request.url = url
  request.method = 'GET'
  request.headers['content-type'] = 'application/json'
  request.push(JSON.stringify(body), 'utf8')
  request.push(null)

  const response = {
    end: () => { }
  }

  router.use((request, response) => {
    t.is(request.headers['content-type'], 'application/json')

    t.end()
  })

  router.get(url, () => { })

  router.attach(request, response)
})

test('should throw an error when a invalid middleware is detected', t => {
  let error = t.throws(() => {
    router.use(null)
  }, { instanceOf: Error })

  t.is(error.message, 'Incorrect param type, the expect type is function or array of functions')

  error = t.throws(() => {
    router.use(null, null)
  }, { instanceOf: Error })

  t.is(error.message, 'Incorrect params type, the expect type are string and function or string and array of functions')

  error = t.throws(() => {
    router.use('', null)
  }, { instanceOf: Error })

  t.is(error.message, 'Incorrect params type, the expect type are string and function or string and array of functions')

  error = t.throws(() => {
    router.use('/users', null)
  }, { instanceOf: Error })

  t.is(error.message, 'Incorrect params type, the expect type are string and function or string and array of functions')

  error = t.throws(() => {
    router.use('/users', [null])
  }, { instanceOf: Error })

  t.is(error.message, 'Incorrect params type, the expect type is function')

  error = t.throws(() => {
    router.use()
  }, { instanceOf: Error })

  t.is(error.message, 'Incorrect params number')
})

test.serial('should add a single application-level middleware', t => {
  const handler = () => { }
  const registeredMiddlewares = [
    { handler: handler, path: undefined }
  ]

  router.use(handler)

  t.deepEqual(router.getRegisteredMiddlewares(), registeredMiddlewares)
})

test.serial('should add a single route-level middleware', t => {
  const handler = () => { }
  const registeredMiddlewares = [
    { handler: handler, path: '/users' }
  ]

  router.use('/users', handler)

  t.deepEqual(router.getRegisteredMiddlewares(), registeredMiddlewares)
})

test.serial('should add an array of application-level middlewares', t => {
  const middlewares = [() => { }, () => { }]
  const registeredMiddlewares = [
    { handler: middlewares[0], path: undefined },
    { handler: middlewares[1], path: undefined }
  ]

  router.use(middlewares)

  t.deepEqual(router.getRegisteredMiddlewares(), registeredMiddlewares)
})

test.serial('should add an array of route-level middlewares', t => {
  const middlewares = [() => { }, () => { }]
  const registeredMiddlewares = [
    { handler: middlewares[0], path: '/users' },
    { handler: middlewares[1], path: '/users' }
  ]

  router.use('/users', middlewares)

  t.deepEqual(router.getRegisteredMiddlewares(), registeredMiddlewares)
})

test.serial.cb('should parse cookie', t => {
  const cookie = 'foo=bar;Domain=https://localhost:3000'
  const parsedCookie = { foo: 'bar', domain: 'https://localhost:3000' }
  const url = '/users'

  const request = new IncomingMessage(new Socket())
  request.url = url
  request.method = 'POST'
  request.headers.cookie = cookie

  const handler = (request) => {
    t.deepEqual(request.cookie, parsedCookie)

    t.end()
  }

  router.post(url, handler)

  const response = {
    end: () => { }
  }

  router.attach(request, response)
})

test.serial.cb('should set raw body for unidentified content type', t => {
  const method = 'POST'
  const url = '/route'
  const handler = (request) => {
    t.deepEqual(JSON.parse(request.body.toString()), body)

    t.end()
  }
  const body = {
    id: '123',
    name: 'John Doe'
  }

  const request = new IncomingMessage(new Socket())
  request.url = url
  request.method = method
  request.headers['content-type'] = 'foo/bar'
  request.push(JSON.stringify(body), 'utf8')
  request.push(null)

  const response = {}

  router.post(url, handler)

  router.attach(request, response)
})

test.serial.cb('should set body for when content type is undefined', t => {
  const method = 'POST'
  const url = '/route'
  const handler = (request) => {
    t.deepEqual(JSON.parse(request.body.toString()), body)

    t.end()
  }
  const body = {
    id: '123',
    name: 'John Doe'
  }

  const request = new IncomingMessage(new Socket())
  request.url = url
  request.method = method
  request.push(JSON.stringify(body), 'utf8')
  request.push(null)

  const response = {}

  router.post(url, handler)

  router.attach(request, response)
})
