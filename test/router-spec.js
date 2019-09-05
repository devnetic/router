import test from 'ava'

import router from './../src/router'

test.beforeEach(t => {
  router.setRoutes({})
})

test.serial('should add get route', t => {
  const method = 'GET'
  const handler = (request, response) => { }
  const expected = {
    [method]: [{
      handler,
      params: [],
      path: /^\/route$/,
      method,
      query: {}
    }]
  }

  router.get('/route', handler)

  t.deepEqual(router.getRoutes(), expected)
})

test.serial('should add post route', t => {
  const method = 'POST'
  const handler = (request, response) => { }
  const expected = {
    [method]: [{
      handler,
      params: [],
      path: /^\/route$/,
      method,
      query: {}
    }]
  }

  router.post('/route', handler)

  t.deepEqual(router.getRoutes(), expected)
})

test.serial('should add multiple routes', t => {
  const handler = (request, response) => { }
  const expected = {
    GET: [{
      handler,
      params: [],
      path: /^\/route$/,
      method: 'GET',
      query: {}
    }, {
      handler,
      params: ['id'],
      path: /^\/route\/([A-Za-z0-9_-]+)$/,
      method: 'GET',
      query: {}
    }],
    DELETE: [{
      handler,
      params: ['id'],
      path: /^\/route\/([A-Za-z0-9_-]+)$/,
      method: 'DELETE',
      query: {}
    }]
  }

  router.get('/route', handler)
  router.get('/route/:id', handler)
  router.delete('/route/:id', handler)

  t.deepEqual(router.getRoutes(), expected)
})

test.serial('should verify correct route', t => {
  const method = 'GET'
  const handler = (request, response) => {}
  const expected = {
    handler,
    params: {},
    path: /^\/route$/,
    method,
    query: {}
  }

  router.get('/route', handler)
  router.get('/route/:id', handler)

  t.deepEqual(router.verifyRoute('/route', 'GET'), [expected])
})

test.serial('should verify correct route with param', t => {
  const method = 'GET'
  const handler = (request, response) => {}
  const expected = {
    handler,
    params: { id: '10' },
    path: /^\/route\/([A-Za-z0-9_-]+)$/,
    method,
    query: {
    }
  }

  router.get('/route', handler)
  router.get('/route/:id', handler)

  t.deepEqual(router.verifyRoute('/route/10', 'GET'), [expected])
})

test.serial('should verify correct route with query params', t => {
  const method = 'GET'
  const handler = (request, response) => {}
  const expected = {
    handler,
    params: {},
    path: /^\/route$/,
    method,
    query: {
      limit: '10',
      offset: '2'
    }
  }

  router.get('/route', handler)

  t.deepEqual(router.verifyRoute('/route?limit=10&offset=2', 'GET'), [expected])
})
