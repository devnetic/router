import { createServer } from 'http'

import { router, Request, Response, GroupRoute, RouteHandler } from './../src/'

const requestHandler: RouteHandler = (request: Request, response: Response): void => {
  console.log('Route Handler')

  const data: Object = {
    status: 'ok',
    body: request.body
  }

  response.cookie('key', 'some-value')

  response.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'kiirus-router'
  });

  response.end(JSON.stringify(data))
}

const handlers: Array<Function> = [() => {
  console.log('Route-level middleware')
}, () => {
  console.log('Route-level middleware')
}]

router.use(() => {
  console.log('Application-level middleware')
})

router.use('/users', () => {
  console.log('Route-level middleware')
})

router.use('/posters', handlers)

router.get('/users', requestHandler)
router.get('/posters', requestHandler)
router.get('/users/:id', requestHandler)
router.post('/users', requestHandler)

const groupRoutes: GroupRoute[] = [{
  method: 'post',
  path: 'login',
  handler: requestHandler
}, {
  method: 'post',
  path: 'register',
  handler: requestHandler
}]

router.group('v1', groupRoutes)

const server = createServer(router.start)

server.listen(3000, () =>  {
  console.log('listening in the port 3000');
})

// router.delete('/users', handler)
// router.get('/users', handler)
// router.patch('/users', handler)
// router.post('/users', handler)
// router.put('/users', handler)
// router.get('/users/:id', handler)
//   .get('/users/favorites/:id', handler)

// router.checkRoute('/users', 'DELETE')
// router.checkRoute('/users', 'GET')
// router.checkRoute('/users', 'PATCH')
// router.checkRoute('/users', 'POST')
// router.checkRoute('/users', 'PUT')
// router.checkRoute('/users/1', 'GET')
// router.checkRoute('/users/favorites/1', 'GET')

// // checkRoute method return a array with all routes that match the pattern
// router.checkRoute('/users?limit=10&offset=2', 'GET').forEach((route: Route) => {
//   const request = <Request> {
//     // params: route.params,
//     // query: route.query
//   }

//   const response = <Response> {}

//   route.handler(request, response)
// })

// router.setRoutes({})
// console.log('Routes: %o', router.getRoutes())

// const groupRoutes: Array<Route> = [{
//   method: 'post',
//   path: 'login',
//   params: {},
//   query: {},
//   handler
// }, {
//   method: 'post',
//   path: 'register',
//   params: {},
//   query: {},
//   handler
// }]

// router.group('v1', groupRoutes)
// console.log(router.checkRoute('/v1/login', 'POST'))
// console.log(router.verifyRoute('/v1/login', 'POST'))

// console.log('Routes: %o', router.getRoutes())
