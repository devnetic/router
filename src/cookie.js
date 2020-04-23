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

export const create = (name, value, options = {}) => {
  validate(name, value, options)

  const cookie = `${encode(name)}=${encode(value || '')}`
  const domain = options.domain !== undefined ? `Domain=${String(options.domain)}` : ''
  const expires = options.expires !== undefined ? `Expires=${options.expires.toUTCString()}` : ''
  const httpOnly = options.httpOnly !== undefined ? 'HttpOnly' : ''
  const maxAge = options.maxAge !== undefined ? `Max-Age=${options.maxAge}` : ''
  const path = `Path=${options.path || '/'}`
  const sameSite = options.sameSite !== undefined ? `SameSite=${options.sameSite}` : ''
  const secure = options.secure !== undefined ? 'Secure' : ''

  // Generate the cookie
  return `${cookie}${domain}${expires}${httpOnly}${maxAge}${path}${sameSite}${secure}`
}

export const parse = (cookie) => {
  return cookie.split('').reduce((result, current) => {
    const [key, value] = current.split('=')
    result[key] = decode(value)
    return result
  }, {})
}

const validate = (name, value, options = {}) => {
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('Argument name is invalid')
  }

  if (value !== undefined && !fieldContentRegExp.test(value)) {
    throw new TypeError('Argument value is invalid')
  }

  if (options.domain !== undefined) {
    if (!fieldContentRegExp.test(options.domain)) {
      throw new TypeError('Option domain is invalid')
    }
  }

  if (options.expires !== undefined) {
    if (!(options.expires instanceof Date)) {
      throw new TypeError('option expires is invalid')
    }
  }

  if (options.path !== undefined) {
    if (!fieldContentRegExp.test(options.path)) {
      throw new TypeError('option path is invalid')
    }
  }

  if (options.sameSite !== undefined) {
    if (!['Lax', 'None', 'Strict'].includes(options.sameSite)) {
      throw new TypeError('option sameSite is invalid')
    }
  }

  return true
}
