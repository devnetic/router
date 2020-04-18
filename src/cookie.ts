export interface CookieOptions {
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  maxAge?: number
  httpOnly?: boolean
}

export interface Cookie extends CookieOptions {
  name: string
  value: string
}

export const create = (name: string, value: string, options: CookieOptions = {}): string => {
  value = value ?? '' // cookie value
  const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
  const path = `;path=${options.path ?? '/'}`
  const domain = options.domain !== undefined ? `;domain=${String(options.domain)}` : ''
  const secure = options.secure !== undefined ? ';secure' : ''
  const httpOnly = options.httpOnly !== undefined ? ';httpOnly' : ''
  const expires: string = options.expires !== undefined ? `;expires=${options.expires.toUTCString()}` : ''
  const maxAge = options.maxAge !== undefined ? `;max-age=${options.maxAge}` : ''

  // assign all the concatenated values to document.cookie.
  return `${cookie}${expires}${path}${domain}${secure}${httpOnly}${maxAge}`
}

export const parse = (cookie: string): Cookie => {
  return cookie.split(';').reduce((result: any, current: string) => {
    const [key, value] = current.split('=')

    result[key] = value

    return result
  }, {}) as Cookie
}
