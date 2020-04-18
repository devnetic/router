import test from 'ava'

import { router, Request, Response, Route, Routes, RouteHandler, GroupRoute } from './../src/'

test.beforeEach(t => {
  router.setRoutes({})
})

test.serial('should add get route', t => {
  const method = 'GET'
  const handler: RouteHandler = (request: Request, response: Response) => { }
  const expected: Routes = {
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
  const handler = (request: Request, response: Response) => { }
  const expected: Routes = {
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
  const handler = (request: Request, response: Response) => { }
  const expected: Routes = {
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
  const handler = (request: Request, response: Response) => {}
  const expected: Array<Route> = [{
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
  const handler = (request: Request, response: Response) => {}
  const expected: Array<Route> = [{
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
  const handler = (request: Request, response: Response) => {}
  const expected: Array<Route> = [{
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
  const handler = (request: Request, response: Response) => {}
  const expected: Array<Route> = [{
    handler,
    params: {},
    path: /^\/v1\/login$/,
    method,
    query: {
    }
  }]
  const routes: GroupRoute[] = [{
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
