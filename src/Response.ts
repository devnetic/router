import { ServerResponse, IncomingMessage } from 'http'

import { create as createCookie, CookieOptions } from './cookie'

export interface SendOptions {
  statusCode: number
  contentType: string
  encoding: BufferEncoding
}

export class Response extends ServerResponse {
  constructor (request: IncomingMessage) {
    super(request)

    Reflect.set(request.socket, '_httpMessage', null)

    this.assignSocket(request.socket)
  }

  clearCookie (options: CookieOptions): Response {
    options = { ...options, expires: new Date(1).toUTCString(), path: '/' }

    return this.cookie(name, '', options)
  }

  cookie (name: string, value: string | Object, options?: CookieOptions): Response {
    value = typeof value === 'object' ? JSON.stringify(value) : value

    this.header('Set-Cookie', createCookie(name, String(value), options))

    return this
  }

  header (field: string, value: string): Response {
    this.setHeader(field, value)

    return this
  }

  /**
   *
   * @param {object} data
   * @param {number} statusCode
   * @param {string} encoding
   */
  json (data: Object, statusCode: number = 200, encoding: BufferEncoding = 'utf-8'): Response {
    this.send(JSON.stringify(data), { statusCode, contentType: 'application/json', encoding })

    return this
  }

  /**
 *
 * @param {string} data
 * @param {SendOptions} [<statusCode=200, contentType='application/json', encoding = 'utf-8'>]
 */
  send (data: any, { statusCode = 200, contentType = 'text/plain', encoding = 'utf8' }: SendOptions): Response {
    this.writeHead(statusCode, {
      'Content-Length': Buffer.byteLength(data),
      'Content-Type': contentType
    })

    this.write(data, encoding)
    this.end()

    return this
  }

  status (statusCode: number): Response {
    this.statusCode = statusCode

    return this
  }
}
