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

## Route Groups

```javascript
const http = require('http')
const { router }  = require('@devnetic/router')

const requestHandler = (req, res) => {
}

const groupRoutes = [{
  method: 'post',
  path: 'login',
  requestHandler
}, {
  method: 'post',
  path: 'register',
  requestHandler
}]

router.group('v1', groupRoutes)

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

# API Reference

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

## **request.cookies**

When using cookie-parser middleware, this property is an object that contains 
cookies sent by the request. If the request contains no cookies, it defaults to 
{}.

```javascript
// Cookie: key=some-value
console.log(req.cookies.key)
// some-value
```

## **req.method**

Contains a string corresponding to the HTTP method of the request: GET, POST, 
PUT, DELETE, etc.

## **req.params**

This property is an object containing properties mapped to the named route 
“parameters”. For example, if you have the route /users/:id, then the "id" 
property is available as req.params.id. This object defaults to {}.

```javascript
// GET /users/10
console.log(req.params.id)
// 10
```

## **req.query**

This property is an object containing a property for each query string parameter 
in the route.

```javascript
// GET /users?limit=10&offset=2
console.log(req.query)
// { limit: '10', offset: '2'}
```

## **req.route**

Contains the currently-matched route, a string. For example:

```javascript
royuter.get('/users/:id', (req, res) => {
console.log(req.route)
// {
//   handler: (request, response) => { … }
//   method: "GET"
//   params: Object {id: "10"}
//   path: /^\/users\/([A-Za-z0-9_-]+)$/ {lastIndex: 0}
//   query: Object {}
// }
})
```

## **router.clearCookie(name [, options])**

Clears the cookie specified by name. For details about the options object, see 
res.cookie().

```javascript
router.cookie('key', 'some-value', { path: '/dashboard' })
router.clearCookie('key', { path: '/dashboard' })
```

## **router.cookie(name, value [, options])**

Sets cookie name to value. The value parameter may be a string or object 
converted to JSON.

The options parameter is an object that can have the following properties:

| Property | Type              | Description                                                                                 |
|----------|-------------------|---------------------------------------------------------------------------------------------|
| domain   | String            | Domain name for the cookie. Defaults to the domain name of the app.                         |
| expires  | Date              | Expire date of the cookie in GMT. If not specified or set to 0, creates a session cookie.   |
| httpOnly | Boolean           | Flags the cookie to be accessible only by the web server.                                   |
| maxAge   | Number            | Convenient option for setting the expiry time relative to the current time in milliseconds. |
| path     | String            | Path for the cookie. Defaults to “/”.                                                       |
| secure   | Boolean           | Marks the cookie to be used with HTTPS only.                                                |
| sameSite | Boolean or String | Value of the “SameSite” Set-Cookie attribute.                                               |

## **router.header(name ,value)**

Sets the response’s HTTP header field to value. To set multiple fields at once, 
pass an object as the parameter.

```javascript
router.set('Content-Type', 'application/json')

router.set({
  'Content-Type': 'application/json',
  'X-Powered-By': 'kiirus-router'
})
```

## **router.json(body)**

Sends a JSON response. This method sends a response (with the correct content-type) 
that is the parameter converted to a JSON string using JSON.stringify().

The parameter can be any JSON type, including object, array, string, Boolean, 
number, or null, and you can also use it to convert other values to JSON.

```javascript
router.json(null)
router.json({ user: 'aagamezl' })
router.status(200).json({ status: 'ok' })
```

## **router.send(body)**

Sends the HTTP response.

The body parameter can be a Buffer object, a String, an object, or an Array. For 
example:

```javascript
res.send(Buffer.from('whoop'))
res.send({ some: 'json' })
res.send('<p>some html</p>')
res.status(404).send('Sorry, we cannot find that!')
res.status(500).send({ error: 'something blew up' })
```

## **router.status(code)**

Sends the HTTP response.

Sets the HTTP status for the response. It is a chainable alias of Node’s 
response.statusCode.

```javascript
router.status(200).end()
router.status(400).send('Bad Request')
router.status(404).send('User not found')
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
- [ ] Add more utility methods to request and response.
