import * as cookie from './../src'

// const content = 'foo=bar;Domain=https://localhost:3000;Expires=Wed, 22 Apr 2020 05:00:00 GMT;HttpOnly;Max-Age=12;Path=/;SameSite=Lax;Secure'
// console.log(cookie.parse(content))

const options: cookie.CookieOptions = {
  path: '/\n'
}
console.log(cookie.create('foor', 'bar', options))
