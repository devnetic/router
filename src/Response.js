import { create as createCookie } from './cookie.js'

export class Response {
  /**
   * Create a new Response object
   *
   * @param {ServerResponse} response
   */
  constructor (response) {
    this.response = response

    return new Proxy(this, {
      get (target, property) {
        if (Reflect.has(target, property)) {
          return Reflect.get(target, property)
        } else {
          return (...args) => {
            return Reflect.get(response, property).apply(response, args)
          }
        }
      }
    })
  }

  /**
   *
   * @param {string} name
   * @param {CookieOptions} options
   * @returns {Response}
   */
  clearCookie (name, options) {
    options = { ...options, expires: new Date(1), path: '/' }

    return this.cookie(name, '', options)
  }

  /**
   *
   * @param {string} name
   * @param {*} value
   * @param {CookieOptions} options
   * @returns {Response}
   */
  cookie (name, value, options) {
    value = typeof value === 'object' ? JSON.stringify(value) : value

    this.header('Set-Cookie', createCookie(name, String(value), options))

    return this
  }

  /**
   *
   * @param {string} field
   * @param {number | string | string[]} value
   */
  header (field, value) {
    this.response.setHeader(field, value)

    return this
  }

  /**
   *
   * @param {object} data
   * @param {number} statusCode
   * @param {string} encoding
   * @returns {Response}
   */
  json (data, statusCode = 200, encoding = 'utf-8') {
    this.send(JSON.stringify(data), { statusCode, contentType: 'application/json', encoding })

    return this
  }

  /**
   *
   * @param {string} data
   * @param {SendOptions} [<statusCode=200, contentType='application/json', encoding = 'utf-8'>]
   */
  send (data, { statusCode = 200, contentType = 'text/plain', encoding = 'utf-8' }) {
    this.response.writeHead(statusCode, {
      'Content-Length': Buffer.byteLength(data),
      'Content-Type': contentType
    })

    this.response.write(data, encoding)
    this.response.end()

    return this
  }

  /**
   *
   * @param {number} statusCode
   * @returns {Response}
   */
  status (statusCode) {
    this.response.statusCode = statusCode

    return this
  }
}
