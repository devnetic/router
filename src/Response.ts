import { ServerResponse, IncomingMessage } from 'http'

import { create as createCookie, CookieOptions } from './cookie'

export interface SendOptions {
  statusCode?: number
  contentType?: string
  encoding?: BufferEncoding
}

export class Response extends ServerResponse {
  /**
   * Creates an instance of Response.
   *
   * @param {IncomingMessage} request
   * @memberof Response
   */
  constructor (private readonly request: IncomingMessage) {
    super(request)

    Reflect.set(request.socket, '_httpMessage', null)

    this.assignSocket(request.socket)
  }

  /**
   * Clears the cookie specified by name.
   *
   * @param {string} name
   * @param {CookieOptions} options
   * @returns {Response}
   * @memberof Response
   */
  clearCookie (name: string, options: CookieOptions): Response {
    options = { ...options, expires: new Date(1).toUTCString(), path: '/' }

    return this.cookie(name, '', options)
  }

  /**
   * Sets cookie name to value. The value parameter may be a string or object
   * converted to JSON.
   *
   * @param {string} name
   * @param {string} value
   * @param {CookieOptions} [options]
   * @returns {Response}
   * @memberof Response
   */
  cookie (name: string, value: string, options?: CookieOptions): Response {
    value = typeof value === 'object' ? JSON.stringify(value) : value

    this.header('Set-Cookie', createCookie(name, value, options))

    return this
  }

  /**
   * Sets the header field to value. To set multiple fields at once, pass an
   * object as the parameter.
   *
   * @param {string|Object} field
   * @param {string} value
   * @returns {Response}
   * @memberof Response
   */
  header (field: string | Object, value: string): Response {
    if (typeof field === 'object') {
      for (const [headerField, headerValue] of Object.entries(field)) {
        this.setHeader(headerField.toLowerCase(), headerValue)
      }
    } else {
      this.setHeader(field.toLowerCase(), value)
    }

    return this
  }

  /**
   * Sends a JSON response. This method sends a response (with the correct
   * content-type) that is the parameter converted to a JSON string using
   * JSON.stringify().
   *
   * @param {Object} data
   * @param {number} [statusCode=200]
   * @param {BufferEncoding} [encoding='utf-8']
   * @returns {Response}
   * @memberof Response
   */
  json (data: Object, statusCode: number = 200, encoding: BufferEncoding = 'utf-8'): Response {
    const json = JSON.stringify(data)

    this.writeHead(statusCode, {
      'Content-Length': Buffer.byteLength(json),
      'Content-Type': 'application/json'
    })

    this.write(json, encoding)

    return this
  }

  /**
   * Sends the HTTP response.
   *
   * @param {*} data
   * @param {SendOptions} { statusCode = 200, contentType = 'text/plain', encoding = 'utf8' }
   * @returns {Response}
   * @memberof Response
   */
  send (data: any, { statusCode = 200, contentType = 'text/plain', encoding = 'utf-8' }: SendOptions = {}): Response {
    switch (typeof data) {
      case 'boolean':
      case 'number':
      case 'object':
        if (data === null) {
          data = ''
        } else if (Buffer.isBuffer(data)) {
          if (this.getHeader('Content-Type') === undefined) {
            contentType = 'application/octet-stream'
            encoding = 'binary'
          }
        } else {
          return this.json(data)
        }

        break
    }

    // remove unnecessary headers
    if (this.statusCode === 204 || this.statusCode === 304) {
      data = ''

      this.removeHeader('Content-Length')
      this.removeHeader('Content-Type')
      this.removeHeader('Transfer-Encoding')
    }

    this.writeHead(statusCode, {
      'Content-Length': Buffer.byteLength(data),
      'Content-Type': contentType
    })

    if (this.request.method !== 'HEAD') {
      this.write(data, encoding)
    }

    this.end()

    return this
  }

  /**
   * Sets the HTTP status for the response. It is a chainable alias of Node’s
   * response.statusCode.
   *
   * @param {number} statusCode
   * @returns {Response}
   * @memberof Response
   */
  status (statusCode: number): Response {
    this.statusCode = statusCode

    return this
  }
}
