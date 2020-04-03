import { IncomingMessage, ServerResponse } from 'http'
import { URL } from 'url'

import * as utils from './support/utils'

export interface Router {
  checkRoute(path: string, method: string): Array<Route>;
  delete(path: string, handler: RouteHandler): Router;
  get(path: string, handler: RouteHandler): Router;
  patch(path: string, handler: RouteHandler): Router;
  post(path: string, handler: RouteHandler): Router;
  put(path: string, handler: RouteHandler): Router;
  setRoutes(newRoutes: Routes): Router;
  getRoutes(): Routes;
  group(name: string, routes: Array<Route>): Routes;
  verifyRoute(path: string, method: string): Array<Route>;
}

export interface Request extends IncomingMessage {
  params: Object;
  query: Object;
}

export interface Response extends ServerResponse { }

export interface RouteHandler {
  (request: Request, response: Response): void
}

type RouteParams = Record<string, string | undefined>

export interface Route {
  handler: RouteHandler;
  params: RouteParams;
  method: string;
  path: string | RegExp;
  query: Object;
}

export interface Routes {
  [key: string]: Array<Route>;
}

const methods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put'
]

/** @type {Object.<string, Route>} */
let routes: Routes = {}

const buildInitialParams = (path: string): RouteParams => {
  return utils.matchAll(/:(\w*)/g, path).reduce((params: RouteParams, current: Array<string>) => {
    params[current[1]] = undefined

    return params
  }, {} as RouteParams)
}

/**
 *
 * @param {string} method
 * @param {string} path
 * @param {Function.<IncomingMessage, ServerResponse>} handler
 */
const addRoute = (method: string, path: string, handler: RouteHandler) => {
  method = method.toUpperCase()

  const route: Route = {
    handler,
    // params: utils.matchAll(/:(\w*)/g, path).map(param => ({ [param[1]]: undefined })),
    params: buildInitialParams(path),
    path: new RegExp(`^${path.replace(/\//g, '\\/').replace(/:([A-Za-z0-9_-]+)/g, '([A-Za-z0-9_-]+)')}$`),
    method,
    query: {}
  }

  if (Array.isArray(routes[method]) === false) {
    routes[method] = []
  }

  routes[method].push(route)

  return router as Router
}

/**
 * Check if a route exist
 *
 * @param {string} path Route path to verify
 * @param {string} method Route method
 *
 * @returns {Array<Route>} The routes that match the criteria
 */
const checkRoute = (path: string, method: string): Array<Route> => {
  const parsedUrl = new URL(path, 'rel:///')

  // If the method don't exist in the router return empty routes
  if (!routes[method]) {
    return []
  }

  return routes[method].reduce((routes: Array<Route>, route: Route) => {
    let match = parsedUrl.pathname.match(route.path) || []

    if (match.length > 0) {
      match = match.slice(1)

      routes.push({
        ...route,
        params: Object.keys(route.params).reduce((params: RouteParams, key: string, index: number) => {
          return { [key]: match[index] }
        }, {} as RouteParams),
        query: parsedUrl.search ? utils.fromEntries(parsedUrl.searchParams) : {}
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
const getRoutes = (): Routes => {
  return routes
}

const group = (name: string, routes: Array<Route>) => {
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
const setRoutes = (newRoutes: Routes): Router => {
  routes = newRoutes

  return router as Router
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
const verifyRoute = (path: string, method: string) => {
  console.log(utils.deprecated('verifyRoute', 'checkRoute'))

  return checkRoute(path, method)
}

const proxyTarget = {
  addRoute,
  checkRoute,
  getRoutes,
  group,
  setRoutes,
  verifyRoute
}

export const router = new Proxy(proxyTarget, {
  get(target: Object, property: string) {
    if (Reflect.has(target, property)) {
      return Reflect.get(target, property)
    } else if (methods.includes(property)) {
      return (path: string, handler: RouteHandler) => {
        return addRoute(property, path, handler)
      }
    }
  }
}) as Router
