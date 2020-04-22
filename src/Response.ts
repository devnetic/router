import { ServerResponse } from 'http'

import { create as createCookie, CookieOptions } from './cookie'

export interface SendOptions {
  statusCode: number
  contentType: string
  encoding: string
}

// export class Response {
export class Response {
  /**
   * Create a new Response object
   *
   * @param {ServerResponse} response
   */
  constructor (private response: ServerResponse) {
    return new Proxy(this, {
      get (target: Response, property: string) {
        if (Reflect.has(target, property)) {
          return Reflect.get(target, property)
        } else {
          return (...args: any) => {
            return Reflect.get(response, property).apply(response, args)
          }
        }
      }
    })
  }

  clearCookie (options: CookieOptions): Response {
    options = { ...options, expires: new Date(1), path: '/' }

    return this.cookie(name, '', options)
  }

  cookie (name: string, value: string | Object, options: CookieOptions): Response {
    value = typeof value === 'object' ? JSON.stringify(value) : value

    this.header('Set-Cookie', createCookie(name, String(value), options))

    return this
  }

  header (field: string, value: string): Response {
    this.response.setHeader(field, value)

    return this
  }

  /**
 *
 * @param {object} data
 * @param {number} statusCode
 * @param {string} encoding
 */
  json (data: Object, statusCode: number = 200, encoding: string = 'utf-8'): Response {
    this.send(JSON.stringify(data), { statusCode, contentType: 'application/json', encoding })

    return this
  }

  /**
 *
 * @param {string} data
 * @param {SendOptions} [<statusCode=200, contentType='application/json', encoding = 'utf-8'>]
 */
  send (data: string, { statusCode = 200, contentType = 'text/plain', encoding = 'utf-8' }: SendOptions): Response {
    this.response.writeHead(statusCode, {
      'Content-Length': Buffer.byteLength(data),
      'Content-Type': contentType
    })

    this.response.write(data, encoding)
    this.response.end()

    return this
  }

  status (statusCode: number): Response {
    this.response.statusCode = statusCode

    return this
  }
}
