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

router.verifyRoute('/users', 'DELETE')
router.verifyRoute('/users', 'GET')
router.verifyRoute('/users', 'PATCH')
router.verifyRoute('/users', 'POST')
router.verifyRoute('/users', 'PUT')
router.verifyRoute('/users/1', 'GET')
router.verifyRoute('/users/favorites/1', 'GET')

// verifyRoute method return a array with all routes that match the pattern
router.verifyRoute('/users?limit=10&offset=2', 'GET').forEach(route => {
  const request = {
    params: route.params,
    query: route.query
  }

  route.handler(request, {})
})

router.setRoutes({})
console.log('Routes: %o', router.getRoutes())
