const router = require('./../src/router')

const handler = (request, response) => {
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
router.checkRoute('/users?limit=10&offset=2', 'GET').forEach(route => {
  const request = {
    params: route.params,
    query: route.query
  }

  route.handler(request, {})
})

router.setRoutes({})
console.log('Routes: %o', router.getRoutes())

const groupRoutes = [{
  method: 'post',
  path: 'login',
  handler
}, {
  method: 'post',
  path: 'register',
  handler
}]

router.group('v1', groupRoutes)
console.log(router.checkRoute('/v1/login', 'POST'))
console.log(router.verifyRoute('/v1/login', 'POST'))

console.log('Routes: %o', router.getRoutes())
