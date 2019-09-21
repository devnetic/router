const { URL } = require('url')

const utils = require('./support/utils')

const methods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put'
]

/**
 * A route in the Router module
 *
 * @typedef Route
 * @type {Object}
 * @property {Function.<IncomingMessage, ServerResponse>} handler
 * @property {Object.<string, string>} params
 * @property {string} method - The method of the route
 * @property {RegExp} path - The RegEx for the route
 * @property {Object.<string, string>} query - Query string object
 */

const { fromEntries, matchAll } = require('./support/utils')

/** @type {Object.<string, Route>} */
let routes = {}

/**
 *
 * @param {string} method
 * @param {string} path
 * @param {Function.<IncomingMessage, ServerResponse>} handler
 */
const addRoute = (method, path, handler) => {
  method = method.toUpperCase()

  const route = {
    handler,
    params: matchAll(/:(\w*)/g, path).map(param => param[1]),
    path: new RegExp(`^${path.replace(/\//g, '\\/').replace(/:([A-Za-z0-9_-]+)/g, '([A-Za-z0-9_-]+)')}$`),
    method,
    query: {}
  }

  if (Array.isArray(routes[method]) === false) {
    routes[method] = []
  }

  routes[method].push(route)

  return proxy
}

/**
 * Check if a route exist
 *
 * @param {string} path Route path to verify
 * @param {string} method Route method
 *
 * @returns {Array<Route>} The routes that match the criteria
 */
const checkRoute = (path, method) => {
  const parsedUrl = new URL(path, 'rel:///')

  // If the method don't exist in the router return empty routes
  if (!routes[method]) {
    return []
  }

  return routes[method].reduce((routes, route) => {
    let match = parsedUrl.pathname.match(route.path)

    if (match !== null) {
      match = match.slice(1)

      routes.push({
        ...route,
        params: route.params.reduce((params, key, index) => ({
          ...params,
          [key]: match[index]
        }), {}),
        query: parsedUrl.search ? fromEntries(parsedUrl.searchParams) : {}
      })
    }

    return routes
  }, [])
}

/**
 * Return the defined routes
 *
 * @returns Array<Route>
 */
const getRoutes = () => {
  return routes
}

const group = (name, routes) => {
  routes.forEach(route => {
    addRoute(route.method, `/${name}/${route.path}`, route.handler)
  })
}

/**
 * Set the routes to a complete new ones
 *
 * @param {Array<Route>} newRoutes
 * @returns {void}
 */
const setRoutes = (newRoutes) => {
  routes = newRoutes

  return proxy
}

/**
 * Verify if a route exist
 *
 * @deprecated since version 2.0.0
 * @param {string} path Route path to verify
 * @param {string} method Route method
 *
 * @returns {Array<Route>} The routes that match the criteria
 */
const verifyRoute = (path, method) => {
  utils.deprecated('verifyRoute', 'checkRoute')

  return checkRoute(path, method)
}

const router = {
  addRoute,
  checkRoute,
  getRoutes,
  group,
  setRoutes,
  verifyRoute
}

const proxy = new Proxy(router, {
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

module.exports = proxy
