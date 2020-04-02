// import { IncomingMessage, ServerResponse } from 'http'

import Router, { Request, Response, Route, RouteHandler } from './../src/router'

const handler: RouteHandler = (request: Request, response: Response) => {
  console.log('request: %o, response: %o', request, response)
}

Router.delete('/users', handler)
Router.get('/users', handler)
Router.patch('/users', handler)
Router.post('/users', handler)
Router.put('/users', handler)
Router.get('/users/:id', handler)
  .get('/users/favorites/:id', handler)

Router.checkRoute('/users', 'DELETE')
Router.checkRoute('/users', 'GET')
Router.checkRoute('/users', 'PATCH')
Router.checkRoute('/users', 'POST')
Router.checkRoute('/users', 'PUT')
Router.checkRoute('/users/1', 'GET')
Router.checkRoute('/users/favorites/1', 'GET')

// checkRoute method return a array with all routes that match the pattern
Router.checkRoute('/users?limit=10&offset=2', 'GET').forEach((route: Route) => {
  const request = <Request> {
    // params: route.params,
    // query: route.query
  }

  const response = <Response> {}

  route.handler(request, response)
})

Router.setRoutes({})
console.log('Routes: %o', Router.getRoutes())

const groupRoutes: Array<Route> = [{
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

Router.group('v1', groupRoutes)
console.log(Router.checkRoute('/v1/login', 'POST'))
console.log(Router.verifyRoute('/v1/login', 'POST'))

console.log('Routes: %o', Router.getRoutes())
