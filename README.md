# @devnetic/router

![npm (scoped)](https://img.shields.io/npm/v/@devnetic/router)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@devnetic/router?color=red)
![npm](https://img.shields.io/npm/dt/@devnetic/router)
![GitHub issues](https://img.shields.io/github/issues-raw/devnetic/router)
![GitHub](https://img.shields.io/github/license/devnetic/router)


Simple router to match URLs.


# Usage

## Using the router module in a HTTP server
```javascript
const http = require('http')
const router = require('@devnetic/router')

const server = http.createServer(requestHandler)

router.delete('/users', handler)
router.get('/users', handler)
router.patch('/users', handler)
router.post('/users', handler)
router.put('/users', handler)

/**
 *
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
const requestHandler = (request, response) => {
  const routes = router.checkRoute(request.url, request.method)

  if (routes.length === 0) {
    console.log('Error 404: No route handler defined for the given route.')

    return
  }

  for (const route of routes) {
    ...your code here
  }
}
```

## Basic usage of router module
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

// checkRoute method return a array with all routes that match the pattern
router.checkRoute('/users?limit=10&offset=2', 'GET').forEach(route => {
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

## Route Groups
```javascript
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

router.checkRoute('/v1/login', 'POST') // return the login route object
```

## Route Methods
- [DELETE](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE); The `DELETE` method deletes the specified resource.
- [GET](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET): The `GET` method requests a representation of the specified resource. Requests using GET should only retrieve data.
- [HEAD](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD): The `HEAD` method asks for a response identical to that of a GET request, but without the response body.
- [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS): The `OPTIONS` method is used to describe the communication options for the target resource.
- [PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH): The `PATCH` method is used to apply partial modifications to a resource.
- [POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST): The `POST` method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
- [PUT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT): The `PUT` method replaces all current representations of the target resource with the request payload.

# Changelog

### Version 1.1.0
- Deprecate verifyRoute() method.
- Add new checkRoute() method to replace verifyMethod().
- Add group method to assign multiples routes to a single group path.
- Add documentation about available methods.

### Version 1.0.0
- Initial release

# TODO
- [X] Add more examples and usage description to README.
- [X] Add group routes.
- [ ] Add more functionalities.
- [X] Write missing test cases.
- [X] Add code coverage.
- [ ] Use Babel for the source code.
