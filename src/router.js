import { URL } from 'url'

import * as loadEnv from '@devnetic/load-env'

import { Response } from './index.js'
import * as utils from './support/utils.js'
import { formData, getBoundary, urlEncoded } from './parser/index.js'
import { parse as parseCookie } from './cookie.js'

loadEnv.load('./src/.errors-description')

const methods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put'
]

const middlewares = []

let routes = {}

/**
 *
 * @param {string} method
 * @param {string} path
 * @param {RouteHandler} handler
 * @returns {Router}
 */
const addRoute = (method, path, handler) => {
  method = method.toUpperCase()

  const route = {
    handler,
    params: setParamsKey(path),
    path: new RegExp(`^${path.replace(/\//g, '\\/').replace(/:([A-Za-z0-9_-]+)/g, '([A-Za-z0-9_-]+)')}$`),
    method,
    query: {}
  }

  if (!Array.isArray(routes[method])) {
    routes[method] = []
  }

  routes[method].push(route)

  return router
}

/**
 * Get and parse the request body
 *
 * @param {Request} request
 * @param {Function} callback
 * @returns {void}
 */
const getBody = (request, callback) => {
  const bodyBuffer = []

  request.on('data', (chunk) => {
    bodyBuffer.push(chunk)
  })

  request.on('end', () => {
    if (request.headers['content-type'] !== undefined) {
      const [contentType] = request.headers['content-type'].split(';')

      switch (contentType) {
        case 'application/json':
          return callback(JSON.parse(Buffer.concat(bodyBuffer).toString()))

        case 'application/x-www-form-urlencoded':
          return callback(urlEncoded(Buffer.concat(bodyBuffer)))

        case 'multipart/form-data':
          return callback(formData(Buffer.concat(bodyBuffer), getBoundary(request.headers['content-type'])))

        default:
          return callback(Buffer.concat(bodyBuffer))
      }
    }
  })
}

/**
 * Generate an error message according to the given error code
 *
 * @param {string} code
 * @param {ErrorMessage} message
 * @returns {string}
 */
const getErrorMessage = (code, messages = {}) => {
  const errorMessage = process.env[code] ? process.env[code] : ''

  return Object.entries(messages).reduce((translated, [key, value]) => {
    return translated.replace(`{{${key}}}`, value)
  }, errorMessage)
}

/**
 * Return the defined routes
 *
 * @returns {Routes}
 */
const getRegisteredRoutes = () => {
  return routes
}

/**
 * Check if a route exist
 *
 * @param {string} path Route path to verify
 * @param {string} method Route method
 *
 * @returns {Route[]} The routes that match the criteria
 */
const getRoutes = (path, method) => {
  const parsedUrl = new URL(path, 'rel:///')

  // If the method don't exist in the router return empty routes
  if (routes[method] === undefined) {
    return []
  }

  return routes[method].reduce((routes, route) => {
    let match = parsedUrl.pathname.match(route.path) || []

    if (match.length > 0) {
      match = match.slice(1)

      routes.push({
        ...route,
        params: setParamsValue(route.params, match),
        query: parsedUrl.search !== '' ? utils.fromEntries(parsedUrl.searchParams.entries()) : {}
      })
    }

    return routes
  }, [])
}

/**
 * Add a route groups to the router
 *
 * @param {string} name
 * @param {GroupRoute[]} routes
 * @returns {void}
 */
const group = (name, routes) => {
  routes.forEach(route => {
    addRoute(route.method, `/${name}/${route.path}`, route.handler)
  })
}

/**
 * Build the initial params key with undefined values
 *
 * @param {string} path
 * @returns {RouteParams}
 */
const setParamsKey = (path) => {
  return utils.matchAll(/:(\w*)/g, path).reduce((params, current) => {
    params[current[1]] = undefined

    return params
  }, {})
}

/**
 * Assign the values to each param key
 *
 * @param {RouteParams} params
 * @param {string[]} match
 * @returns {RouteParams}
 */
const setParamsValue = (params, match) => {
  return Object.keys(params).reduce((param, key, index) => {
    return { [key]: match[index] }
  }, {})
}

/**
 * Set the routes to a complete new ones
 *
 * @param {Routes} newRoutes
 * @returns {Router}
 */
const setRoutes = (newRoutes) => {
  routes = newRoutes

  return router
}

/**
 *
 * @param {Request} request
 * @param {ServerResponse} response
 * @returns {void}
 */
const start = (request, response) => {
  const routes = router.getRoutes(request.url, request.method)

  if (routes.length === 0) {
    console.log(getErrorMessage('KRO0004', { url: request.url }))

    response.statusCode = 404
    response.end()

    return
  }

  const requestMiddlewares = middlewares.filter((middleware) => {
    return middleware.path === request.url || middleware.path === undefined
  })

  for (const route of routes) {
    requestMiddlewares.map((middleware) => {
      middleware.handler(request, response)
    })

    if (request.headers.cookie !== undefined) {
      request.cookie = parseCookie(request.headers.cookie)
    }

    getBody(request, (body) => {
      request.body = body

      route.handler(request, new Response(response))
    })
  }
}

/**
 *
 * @param  {...any} args
 * @returns {void}
 */
const use = (...args) => {
  if (args.length === 1) {
    if (typeof args[0] !== 'function' && !Array.isArray(args[0])) {
      throw new Error(getErrorMessage('KRO0001'))
    }

    if (typeof args[0] === 'function') {
      middlewares.push({
        path: undefined,
        handler: args[0]
      })

      return
    } else {
      middlewares.push(...args[0].map((middleware) => ({
        path: undefined,
        handler: middleware
      })))

      return
    }
  }

  if (args.length === 2) {
    if (typeof args[0] !== 'string' && (typeof args[1] !== 'function' ||
      !Array.isArray(args[1]))
    ) {
      throw new Error(getErrorMessage('KRO0002'))
    }

    if (typeof args[1] === 'function') {
      middlewares.push({
        path: args[0],
        handler: args[1]
      })

      return
    } else {
      middlewares.push(...args[1].map((middleware) => ({
        path: args[0],
        handler: middleware
      })))

      return
    }
  }

  throw new Error(getErrorMessage('KRO0003'))
}

const proxyTarget = {
  addRoute,
  getRegisteredRoutes,
  getRoutes,
  group,
  setRoutes,
  start,
  use
}

export const router = new Proxy(proxyTarget, {
  get (target, property) {
    if (Reflect.has(target, property)) {
      return Reflect.get(target, property)
    } else if (methods.includes(property)) {
      return (path, handler) => {
        return addRoute(property, path, handler)
      }
    }
  }
})
