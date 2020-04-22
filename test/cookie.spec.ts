import test from 'ava'

import { create, parse, Cookie, CookieOptions } from './../src'

test('should parse a cookie', t => {
  const cookie = 'foo=bar;Domain=https://localhost:3000;Expires=Wed, 22 Apr 2020 05:00:00 GMT;HttpOnly;Max-Age=12;Path=/;SameSite=Lax;Secure'
  const expected: Cookie = {
    name: 'foo',
    value: 'bar',
    domain: 'https://localhost:3000',
    expires: new Date('Wed, 22 Apr 2020 05: 00: 00 GMT'),
    httpOnly: true,
    maxAge: 12,
    sameSite: 'Lax',
    secure: true
  }

  t.is(parse(cookie), expected)
})

test('should create a simple cookie', t => {
  const name = 'foo'
  const value = 'bar'
  const expected = `${name}=${value};Path=/`

  t.is(create(name, value), expected)
})

test('should create a cookie with options', t => {
  const name = 'foo'
  const value = 'bar'
  const expires = '2020/04/22'
  const domain = 'https://localhost:3000'
  const httpOnly = true
  const maxAge = 12
  const sameSite = 'Lax'
  const secure = true
  const options:CookieOptions = {
    domain: 'https://localhost:3000',
    expires: new Date(expires),
    httpOnly,
    maxAge,
    sameSite,
    secure
  }
  const expected = `${name}=${value};Domain=${domain};Expires=Wed, 22 Apr 2020 05:00:00 GMT;HttpOnly;Max-Age=${maxAge};Path=/;SameSite=${sameSite};Secure`

  t.is(create(name, value, options), expected)
})

test('should throw an error when name validation fails', t => {
  const name = 'f\noo'
  const value = 'bar'

  const error = t.throws(() => {
    create(name, value)
  }, { instanceOf: TypeError })

  t.is(error.message, 'Argument name is invalid')
})

test('should throw an error when value validation fails', t => {
  const name = 'foo'
  const value = 'b\nar'

  const error = t.throws(() => {
    create(name, value)
  }, { instanceOf: TypeError })

  t.is(error.message, 'Argument value is invalid')
})

test('should throw an error when domain validation fails', t => {
  const name = 'foo'
  const value = 'bar'
  const options: CookieOptions = {
    domain: 'https://localhost:3000\n'
  }

  const error = t.throws(() => {
    create(name, value, options)
  }, { instanceOf: TypeError })

  t.is(error.message, 'Option domain is invalid')
})
