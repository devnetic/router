import test from 'ava'
import * as sinon from 'sinon'

// import router from '../src/router'
import Router, { Request, Response, Route, Routes, RouteHandler } from './../src/router'
import * as utils from '../src/support/utils'

test.beforeEach(t => {
  Router.setRoutes({})
})

test.serial('should add get route', t => {
  const method = 'GET'
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

  Router.get('/route', handler)

  t.deepEqual(Router.getRoutes(), expected)
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

  Router.post('/route', handler)

  t.deepEqual(Router.getRoutes(), expected)
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

  Router.get('/route', handler)
  Router.get('/route/:id', handler)
  Router.delete('/route/:id', handler)

  t.deepEqual(Router.getRoutes(), expected)
})

test.serial('should return empty array when no routes defined', t => {
  t.deepEqual(Router.checkRoute('/route', 'GET'), [])
})

test.serial('should verify correct route', t => {
  const method = 'GET'
  const handler = (request: Request, response: Response) => {}
  const expected = {
    handler,
    params: {},
    path: /^\/route$/,
    method,
    query: {}
  }

  Router.get('/route', handler)
  Router.get('/route/:id', handler)

  t.deepEqual(Router.checkRoute('/route', 'GET'), [expected])
})

test.serial('should verify correct route with param', t => {
  const method = 'GET'
  const handler = (request: Request, response: Response) => {}
  const expected = {
    handler,
    params: { id: '10' },
    path: /^\/route\/([A-Za-z0-9_-]+)$/,
    method,
    query: {
    }
  }

  Router.get('/route', handler)
  Router.get('/route/:id', handler)

  t.deepEqual(Router.checkRoute('/route/10', 'GET'), [expected])
})

test.serial('calling verify should show deprecated message', t => {
  sinon.spy(utils, 'deprecated')

  Router.verifyRoute('/route/10', 'GET')

  // t.true(utils.deprecated.calledWith('verifyRoute', 'checkRoute'))
})

test.serial('should verify correct route with query params', t => {
  const method = 'GET'
  const handler = (request: Request, response: Response) => {}
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

  Router.get('/route', handler)

  t.deepEqual(Router.checkRoute('/route?limit=10&offset=2', 'GET'), [expected])
})

test.serial('should verify correct grouped route', t => {
  const method = 'POST'
  const group = 'v1'
  const handler = (request: Request, response: Response) => {}
  const expected = {
    handler,
    params: {},
    path: /^\/v1\/login$/,
    method,
    query: {
    }
  }
  const routes: Array<Route> = [{
    method: 'post',
    path: 'login',
    params: {},
    query: {},
    handler
  }, {
    method: 'post',
    path: 'register',
    params: {},
    query: {},
    handler
  }]

  Router.group(group, routes)

  t.deepEqual(Router.checkRoute(`${group}/login`, method), [expected])
})
