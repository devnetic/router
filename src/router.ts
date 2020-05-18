import { IncomingMessage, ServerResponse } from 'http'
import { URL } from 'url'

import * as loadEnv from '@devnetic/load-env'
import * as utils from '@devnetic/utils'

import { /* createResponse, */ Response } from './'
import { formData, getBoundary, urlEncoded } from './parser'
import { parse as parseCookie, Cookie } from './cookie'

loadEnv.load('./src/.errors-description')

export interface Router {
  attach(request: Request, response: ServerResponse): void
  delete(path: string, handler: RouteHandler): Router
  get(path: string, handler: RouteHandler): Router
  getRegisteredRoutes(): Routes
  getRoutes(path: string | undefined, method: string | undefined): Route[]
  group(name: string, routes: GroupRoute[]): Routes
  patch(path: string, handler: RouteHandler): Router
  post(path: string, handler: RouteHandler): Router
  put(path: string, handler: RouteHandler): Router
  setRoutes(newRoutes: Routes): Router
  use(handler: Function | Function[]): void
  use(path: string, handler: Function | Function[]): void
}

export type RequestBody = Record<string, string | number | boolean | Object | null | undefined>

export interface Request extends IncomingMessage {
  cookie?: Cookie
  body?: RequestBody
  params?: Object
  query?: Object
}

// export type RouteHandler = (request: IncomingMessage, response: ServerResponse) => void
export type RouteHandler = (request: Request, response: Response) => void
// export type RouteHandler = (request: Request, response: ServerResponse) => void

export interface Route {
  handler: RouteHandler
  params: RouteParams
  method: string
  path: RegExp
  query: Object
}

export interface GroupRoute {
  method: string
  path: string
  handler: RouteHandler
}

export interface Routes {
  [key: string]: Route[]
}

type RouteParams = Record<string, string | undefined>

type ErrorMessage = Record<string, any>

export interface Middleware {
  path: string | undefined
  handler: Function
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

const middlewares: Middleware[] = []

let routes: Routes = {}

/**
 *
 * @param {string} method
 * @param {string} path
 * @param {RouteHandler} handler
 */
const addRoute = (method: string, path: string, handler: RouteHandler): Router => {
  method = method.toUpperCase()

  const route: Route = {
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
 *
 * @param {Request} request
 * @param {ServerResponse} response
 */
const attach = (request: Request, response: ServerResponse): void => {
  const routes = router.getRoutes(request.url, request.method)

  if (routes.length === 0) {
    console.log(getErrorMessage('KRO0004', { url: request.url }))

    response.statusCode = 404
    response.end()

    return
  }

  const requestMiddlewares = middlewares.filter((middleware: Middleware) => {
    return middleware.path === request.url || middleware.path === undefined
  })

  for (const route of routes) {
    requestMiddlewares.map((middleware: Middleware) => {
      middleware.handler(request, response)
    })

    if (request.headers.cookie !== undefined) {
      request.cookie = parseCookie(request.headers.cookie)
    }

    getBody(request, (body: RequestBody) => {
      request.body = body

      route.handler(request, new Response(request))
    })
  }
}

/**
 * Get and parse the request body
 *
 * @param {Request} request
 * @param {Function} callback
 */
const getBody = (request: Request, callback: Function): void => {
  const bodyBuffer: Uint8Array[] = []

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
 * @param {string} message
 * @returns {string}
 */
const getErrorMessage = (code: string, messages: ErrorMessage = {}): string => {
  const errorMessage: string = process.env[code] ?? ''

  return Object.entries(messages).reduce((translated: string, [key, value]: [string, any]) => {
    return translated.replace(`{{${key}}}`, value)
  }, errorMessage)
}

/**
 * Return the defined routes
 *
 * @returns {Routes}
 */
const getRegisteredRoutes = (): Routes => {
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
const getRoutes = (path: string, method: string): Route[] => {
  const parsedUrl = new URL(path, 'rel:///')

  // If the method don't exist in the router return empty routes
  if (routes[method] === undefined) {
    return []
  }

  return routes[method].reduce((routes: Route[], route: Route) => {
    let match = parsedUrl.pathname.match(route.path) ?? []

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
 */
const group = (name: string, routes: GroupRoute[]): void => {
  routes.forEach(route => {
    addRoute(route.method, `/${name}/${route.path}`, route.handler)
  })
}

/**
 * Build the initial params key with undefined values
 *
 * @param {string} path
 */
const setParamsKey = (path: string): RouteParams => {
  return utils.matchAll(path, /:(\w*)/g).reduce((params: RouteParams, current: string[]) => {
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
const setParamsValue = (params: RouteParams, match: string[]): RouteParams => {
  return Object.keys(params).reduce((params: RouteParams, key: string, index: number) => {
    return { [key]: match[index] }
  }, {})
}

/**
 * Set the routes to a complete new ones
 *
 * @param {Route[]} newRoutes
 * @returns {void}
 */
const setRoutes = (newRoutes: Routes): Router => {
  routes = newRoutes

  return router
}

const use = (...args: any[]): void => {
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
      middlewares.push(...args[0].map((middleware: Function) => ({
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
      middlewares.push(...args[1].map((middleware: Function) => ({
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
  attach,
  getRegisteredRoutes,
  getRoutes,
  group,
  setRoutes,
  use
}

export const router = new Proxy(proxyTarget, {
  get (target: Object, property: string) {
    if (Reflect.has(target, property)) {
      return Reflect.get(target, property)
    } else if (methods.includes(property)) {
      return (path: string, handler: RouteHandler) => {
        return addRoute(property, path, handler)
      }
    }
  }
}) as Router
