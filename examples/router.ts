import { router, Request, Response, Route, RouteHandler } from './../src/router'

const handler: RouteHandler = (request: Request, response: Response) => {
  console.log('request: %o, response: %o', request, response)
}

router.delete('/users', handler)
router.get('/users', handler)
router.patch('/users', handler)
router.post('/users', handler)
router.put('/users', handler)
router.get('/users/:id', handler)
  .get('/users/favorites/:id', handler)

router.checkRoute('/users', 'DELETE')
router.checkRoute('/users', 'GET')
router.checkRoute('/users', 'PATCH')
router.checkRoute('/users', 'POST')
router.checkRoute('/users', 'PUT')
router.checkRoute('/users/1', 'GET')
router.checkRoute('/users/favorites/1', 'GET')

// checkRoute method return a array with all routes that match the pattern
router.checkRoute('/users?limit=10&offset=2', 'GET').forEach((route: Route) => {
  const request = <Request> {
    // params: route.params,
    // query: route.query
  }

  const response = <Response> {}

  route.handler(request, response)
})

router.setRoutes({})
console.log('Routes: %o', router.getRoutes())

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

router.group('v1', groupRoutes)
console.log(router.checkRoute('/v1/login', 'POST'))
console.log(router.verifyRoute('/v1/login', 'POST'))

console.log('Routes: %o', router.getRoutes())
