# @devnetic/router
Simple router to match URLs.


## Usage

```javascript
const router = require('@devnetic/router')

const handler = (request, response) => {
  console.log(request, response)
}

router.delete('/users', handler)
router.get('/users', handler)
router.patch('/users', handler)
router.post('/users', handler)
router.put('/users', handler)

// router support chainning
router.get('/users/:id', handler)
  .get('/users/favorites/:id', handler)

// verifyRoute method return a array with all routes that match the pattern
router.verifyRoute('/users?limit=10&offset=2', 'GET').forEach(route => {
  const request = {
    params: route.params,
    query: route.query
  }

  route.handler(request, {})
})

// You can set the routes object to a object following the necessary structure
router.setRoutes({})

// And get the registered routes
console.log('Routes: %o', router.getRoutes())
```