import * as utils from '@devnetic/utils'

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/ // eslint-disable-line
const decode = decodeURIComponent
const encode = encodeURIComponent

export interface CookieOptions {
  domain?: string
  expires?: string
  httpOnly?: boolean
  maxAge?: number | string
  path?: string
  sameSite?: string
  secure?: boolean
}

export interface Cookie extends CookieOptions {
  [key: string]: any
}

export const create = (name: string, value: string, options: CookieOptions = {}): string => {
  validate(name, value, options)

  const cookie = `${encode(name)}=${encode(value)}`
  const domain = options.domain !== undefined ? `;Domain=${String(options.domain)}` : ''
  const expires = options.expires !== undefined ? `;Expires=${options.expires}` : ''
  const httpOnly = options.httpOnly !== undefined ? ';HttpOnly' : ''
  const maxAge = options.maxAge !== undefined ? `;Max-Age=${options.maxAge}` : ''
  const path = `;Path=${options.path !== undefined ? options.path : '/'}`
  const sameSite = options.sameSite !== undefined ? `;SameSite=${options.sameSite}` : ''
  const secure = options.secure !== undefined ? ';Secure' : ''

  // Generate the cookie
  return `${cookie}${domain}${expires}${httpOnly}${maxAge}${path}${sameSite}${secure}`
}

export const parse = (cookie: string): Cookie => {
  return cookie.split(';').reduce((result: any, current: string) => {
    const [key, value] = current.split('=')

    result[utils.camelCase(key)] = value ? decode(value) : true

    return result
  }, {}) as Cookie
}

/**
 *
 * @param {string} name
 * @param {string} value
 * @param {CookieOptions} [options = {}]
 * @returns {void}
 */
const validate = (name: string, value: string, options: CookieOptions): void => {
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('Argument name is invalid')
  }

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('Argument value is invalid')
  }

  if (options.domain !== undefined) {
    if (!fieldContentRegExp.test(options.domain)) {
      throw new TypeError('Option domain is invalid')
    }
  }

  if (options.expires !== undefined) {
    if (Number.isNaN(Date.parse(options.expires))) {
      throw new TypeError('Option expires is invalid')
    }
  }

  if (options.path !== undefined) {
    if (!fieldContentRegExp.test(options.path)) {
      throw new TypeError('Option path is invalid')
    }
  }

  if (options.sameSite !== undefined) {
    if (!['Lax', 'None', 'Strict'].includes(options.sameSite)) {
      throw new TypeError('Option sameSite is invalid')
    }
  }
}
