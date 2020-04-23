import { ServerResponse, IncomingMessage } from 'http'

import { create as createCookie, CookieOptions } from './cookie'

// export interface Response extends ServerResponse {
//   cookie(name: string, value: string | Object, options: CookieOptions): Response
//   header(field: string, value: string): Response
// }

// export class Response implements Response {
export class Response extends ServerResponse {
  constructor (request: IncomingMessage) {
    super(request)

    Reflect.set(request.socket, '_httpMessage', null)

    this.assignSocket(request.socket)

    // return new Proxy(this, {
    //   get (target: Response, property: string) {
    //     if (Reflect.has(target, property)) {
    //       return Reflect.get(target, property)
    //     } else {
    //       // return Reflect.get(response, property, target)
    //       return (...args: any) => {
    //         return Reflect.get(response, property).apply(response, args)
    //       }
    //     }
    //   }
    // })
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
}

// export interface Response extends ServerResponse {
//   cookie(name: string, value: string | Object, options: CookieOptions): Response
//   header(field: string, value: string): Response
// }

// let originalResponse: ServerResponse
// let res: any

// export const createResponse = (response: ServerResponse): Response => {
//   originalResponse = response

//   res = new Proxy(proxyTarget, {
//     get(target: Response, property: string) {
//       if (Reflect.has(target, property)) {
//         return Reflect.get(target, property)
//       } else {
//         return (...args: any) => {
//           return Reflect.get(response, property).apply(response, args)
//         }
//       }
//     }
//   })

//   return res as Response
// }

// const cookie = (name: string, value: string | Object, options: CookieOptions): Response => {
//   value = typeof value === 'object' ? JSON.stringify(value) : value

//   res.header('Set-Cookie', createCookie(name, String(value), options))

//   return res
// }

// const header = (field: string, value: string): Response => {
//   originalResponse.setHeader(field, value)

//   return res
// }

// const proxyTarget = {
//   cookie,
//   header
// }
