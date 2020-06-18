# @devnetic/router

![Node CI](https://github.com/devnetic/router/workflows/Node%20CI/badge.svg)
![npm (scoped)](https://img.shields.io/npm/v/@devnetic/router)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@devnetic/router?color=red)
![npm](https://img.shields.io/npm/dt/@devnetic/router)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![GitHub issues](https://img.shields.io/github/issues-raw/devnetic/router)
![GitHub](https://img.shields.io/github/license/devnetic/router)


Simple router to match URLs.


# Usage

## Using the router module in a HTTP server
```javascript
const http = require('http')
const { router }  = require('@devnetic/router')

/**
 *
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
const requestHandler = (request, response) => {
  // Set a cookie in the response
  response.cookie('key', 'some-value')

  const data = {
    status: 'ok',
    body: request.body
  }

  response.header({
    'Content-Type': 'application/json',
    'X-Powered-By': 'kiirus-router'
  })

  // send JSON data easily
  response.json(data).end()
}

router.delete('/users', requestHandler)
router.get('/users', requestHandler)
router.patch('/users', requestHandler)
router.post('/users', requestHandler)
router.put('/users', requestHandler)

// attach method is the router handler to intercept every request to the server
// and validate if the request url is a valid defined route
const server = http.createServer(router.attach)

server.listen(3000, () => {
  console.log('listening in the port 3000')
})
```

## Middleware

Middleware functions are functions that have access to the request object (req), the response object (res), in the application’s request-response cycle.

Middleware functions can perform the following tasks:

- Execute any code.
- Make changes to the request and the response objects.
- End the request-response cycle.

```javascript
// Application level middleware
router.use((request, response) => {
  request.params = { ...request.params, ...{ foo: 'value' } }
  console.log('Application-level middleware')
})

// Route level middleware
router.use('/users', (request, response) => {
  console.log('Route-level middleware')
})
```

## **request.body**
Contains key-value pairs of data submitted in the request body. By default, it
is undefined.

```javascript
const { router }  = require('@devnetic/router')

router.post('/users', (req, res) => {
  console.log(req.body)

  res.json(req.body)
})
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
- [DELETE](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE): The `DELETE` method deletes the specified resource.
- [GET](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET): The `GET` method requests a representation of the specified resource. Requests using GET should only retrieve data.
- [HEAD](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD): The `HEAD` method asks for a response identical to that of a GET request, but without the response body.
- [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS): The `OPTIONS` method is used to describe the communication options for the target resource.
- [PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH): The `PATCH` method is used to apply partial modifications to a resource.
- [POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST): The `POST` method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
- [PUT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT): The `PUT` method replaces all current representations of the target resource with the request payload.

# Changelog

### Version 2.0.0
- Auto verify routes.
- Add middleware feature.
- Remove verifyRoute() method.
- Remove checkRoute() method.
- Add body parsing.
- Add form data parsing.
- Add url encoded parsing.
- Add cookie feature.
- Improve code coverage.

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
- [X] Add more functionalities.
- [X] Write missing test cases.
- [X] Add code coverage.
- [X] Migrate to TypeScript
