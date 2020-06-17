import { RequestBody } from '../router'

export const urlEncoded = (body: Buffer): RequestBody => {
  return decodeURI(body.toString())
    .split('&')
    .reduce((result: RequestBody, current: string) => {
      const [key, value] = current.split('=')

      result[key] = value

      return result
    }, {})
}
